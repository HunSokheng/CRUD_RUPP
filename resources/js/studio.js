const TOAST_MS = 3500;
const DELETE_MODAL_CLOSE_MS = 240;

const studioState = {
    apiBase: '',
    detailRow: null,
    rows: [],
    search: '',
    /** @type {'all' | 'active' | 'inactive'} */
    filter: 'all',
    crudPage: 1,
    crudPageSize: 10,
};

const THUMB_EMOJIS = ['🎨', '✨', '🧢', '🌟', '💫', '🎯', '🪄', '🦄', '🍀', '🎭', '🎪', '🧸'];

const FORM_ERROR_FIELDS = ['name', 'price', 'quantity'];

/** @type {((value: boolean) => void) | null} */
let deleteModalResolver = null;

let toastSeq = 0;

/** @type {HTMLElement | null} */
let filterToastEl = null;

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function thumbEmojiFor(row) {
    const n = Number(row.id) || 0;
    return THUMB_EMOJIS[Math.abs(n) % THUMB_EMOJIS.length];
}

async function readApiErrorMessage(res) {
    try {
        const data = await res.json();
        if (typeof data.message === 'string' && data.message.trim()) {
            return data.message.trim();
        }
        if (data.errors && typeof data.errors === 'object') {
            for (const v of Object.values(data.errors)) {
                if (Array.isArray(v) && v[0]) {
                    return String(v[0]);
                }
            }
        }
    } catch {
        /* ignore */
    }

    return `Something went wrong (${res.status}).`;
}

function readBootstrap() {
    const el = document.getElementById('studio-bootstrap');
    if (!el) {
        return { portraitUrl: '', hairstyles: [], apiBase: '/api/hairstyles' };
    }

    return JSON.parse(el.textContent);
}

function sortRows(rows) {
    return [...rows].sort((a, b) => Number(b.id) - Number(a.id));
}

function formatPrice(value) {
    const n = Number(value);
    if (Number.isNaN(n)) {
        return '—';
    }

    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
}

function formatDateTime(iso) {
    if (!iso) {
        return '—';
    }

    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return escapeHtml(String(iso));
    }

    return escapeHtml(
        d.toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
    );
}

function dismissFilterToast() {
    if (filterToastEl) {
        filterToastEl.remove();
        filterToastEl = null;
    }
}

function toastIconSvg(type, filterMode) {
    if (type === 'success') {
        return '<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
    }
    if (type === 'delete') {
        return '<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>';
    }
    if (type === 'error') {
        return '<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>';
    }
    if (filterMode === 'active') {
        return '<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>';
    }
    if (filterMode === 'inactive') {
        return '<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m4.93 4.93 14.14 14.14"/></svg>';
    }
    return '<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M6 10h12M8 14h8M10 18h4"/></svg>';
}

/**
 * @param {'success' | 'error' | 'info' | 'delete'} type
 * @param {string} message
 * @param {{ filter?: boolean, filterMode?: 'all' | 'active' | 'inactive' }} [options]
 */
function toast(type, message, options = {}) {
    const host = document.getElementById('studio-toasts');
    if (!host) {
        return;
    }

    const isFilter = Boolean(options.filter);
    if (isFilter) {
        dismissFilterToast();
    }

    const id = `studio-toast-${++toastSeq}`;
    const filterMode = options.filterMode ?? 'all';
    let tone = type;
    if (isFilter) {
        tone = filterMode === 'active' ? 'filter-active' : filterMode === 'inactive' ? 'filter-inactive' : 'filter-all';
    }

    const el = document.createElement('div');
    el.id = id;
    el.setAttribute('role', 'status');
    el.dataset.toastType = tone;
    el.className = `studio-toast studio-toast--${tone} pointer-events-auto flex items-center gap-3 rounded-2xl border px-3.5 py-3 pr-3 text-sm shadow-lg sm:px-4`;
    if (isFilter) {
        el.classList.add('studio-toast--filter');
    }

    el.innerHTML = `
        <span class="studio-toast__icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" aria-hidden="true">${toastIconSvg(type, filterMode)}</span>
        <p class="studio-toast__message min-w-0 flex-1 text-[13px] font-medium leading-snug tracking-tight">${escapeHtml(message)}</p>
        <button type="button" data-toast-close class="studio-toast__close shrink-0 rounded-lg p-1.5 transition" aria-label="Dismiss notification">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
    `;

    host.appendChild(el);

    if (isFilter) {
        filterToastEl = el;
    }

    const close = () => {
        if (filterToastEl === el) {
            filterToastEl = null;
        }
        el.classList.add('studio-toast--out');
        window.setTimeout(() => el.remove(), 200);
    };

    const timer = window.setTimeout(close, isFilter ? 2800 : TOAST_MS);
    el.querySelector('[data-toast-close]')?.addEventListener('click', () => {
        window.clearTimeout(timer);
        close();
    });
}

function isDeleteModalOpen() {
    const el = document.getElementById('studio-delete-modal');
    return Boolean(el && !el.classList.contains('hidden'));
}

function isImageLightboxOpen() {
    const el = document.getElementById('studio-image-lightbox');
    return Boolean(el && !el.classList.contains('hidden'));
}

function syncBodyScrollLock() {
    const lock = isDeleteModalOpen() || isImageLightboxOpen() || isDetailOpen() || isFormModalOpen();
    document.body.classList.toggle('overflow-hidden', lock);
}

function openImageLightbox(imageUrl, productName) {
    const root = document.getElementById('studio-image-lightbox');
    const img = document.getElementById('studio-image-lightbox-img');
    if (!root || !img || !imageUrl) {
        return;
    }

    const label = productName && String(productName).trim() ? String(productName).trim() : 'Product';
    img.src = imageUrl;
    img.alt = label;

    root.classList.remove('hidden');
    root.classList.add('flex');
    root.setAttribute('aria-hidden', 'false');
    syncBodyScrollLock();

    document.getElementById('studio-image-lightbox-close')?.focus();
}

function closeImageLightbox() {
    const root = document.getElementById('studio-image-lightbox');
    const img = document.getElementById('studio-image-lightbox-img');
    if (!root) {
        return;
    }

    root.classList.add('hidden');
    root.classList.remove('flex');
    root.setAttribute('aria-hidden', 'true');

    if (img) {
        img.removeAttribute('src');
        img.alt = '';
    }

    syncBodyScrollLock();
}

let imageLightboxWired = false;

function wireImageLightbox() {
    if (imageLightboxWired) {
        return;
    }
    imageLightboxWired = true;

    const backdrop = document.getElementById('studio-image-lightbox-backdrop');
    const closeBtn = document.getElementById('studio-image-lightbox-close');

    backdrop?.addEventListener('click', closeImageLightbox);
    closeBtn?.addEventListener('click', closeImageLightbox);
}

/**
 * @param {string} productName
 * @returns {Promise<boolean>}
 */
function openDeleteModal(productName) {
    return new Promise((resolve) => {
        deleteModalResolver = resolve;

        const subtitle = document.getElementById('studio-delete-subtitle');
        if (subtitle) {
            const label = productName && String(productName).trim() ? String(productName).trim() : 'This product';
            const esc = escapeHtml(label);
            subtitle.innerHTML = `‘<span class="font-semibold text-neutral-900">${esc}</span>’ will be permanently removed.`;
        }

        const root = document.getElementById('studio-delete-modal');
        if (root) {
            root.classList.remove('hidden', 'studio-delete-modal--closing');
            root.classList.add('flex');
            root.setAttribute('aria-hidden', 'false');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    root.classList.add('studio-delete-modal--open');
                });
            });
        }

        syncBodyScrollLock();
    });
}

function hideDeleteModalDom() {
    const root = document.getElementById('studio-delete-modal');
    if (!root) {
        return;
    }

    root.classList.remove('flex', 'studio-delete-modal--open', 'studio-delete-modal--closing');
    root.classList.add('hidden');
    root.setAttribute('aria-hidden', 'true');
}

function finishDeleteModal(confirmed) {
    const resolve = deleteModalResolver;
    deleteModalResolver = null;

    if (resolve) {
        resolve(confirmed);
    }

    const root = document.getElementById('studio-delete-modal');
    if (!root || root.classList.contains('hidden')) {
        syncBodyScrollLock();
        return;
    }

    if (root.classList.contains('studio-delete-modal--open')) {
        root.classList.remove('studio-delete-modal--open');
        root.classList.add('studio-delete-modal--closing');

        window.setTimeout(() => {
            hideDeleteModalDom();
            syncBodyScrollLock();
        }, DELETE_MODAL_CLOSE_MS);
    } else {
        hideDeleteModalDom();
        syncBodyScrollLock();
    }
}

function wireDeleteModal() {
    const backdrop = document.getElementById('studio-delete-backdrop');
    const cancel = document.getElementById('studio-delete-cancel');
    const confirmBtn = document.getElementById('studio-delete-confirm');

    backdrop?.addEventListener('click', () => finishDeleteModal(false));
    cancel?.addEventListener('click', () => finishDeleteModal(false));
    confirmBtn?.addEventListener('click', () => finishDeleteModal(true));
}

/** @param {'name' | 'price' | 'quantity'} field */
function clearFormFieldError(field) {
    const wrap = document.getElementById(`studio-field-${field}-error`);
    const text = document.getElementById(`studio-field-${field}-error-text`);
    const input = document.getElementById(`studio-field-${field}`);

    wrap?.classList.add('hidden');
    if (text) {
        text.textContent = '';
    }
    input?.classList.remove('border-red-500', 'ring-2', 'ring-red-200/80');
}

function clearFormFieldErrors() {
    for (const field of FORM_ERROR_FIELDS) {
        clearFormFieldError(field);
    }
}

/** @param {'name' | 'price' | 'quantity'} field */
function setFormFieldError(field, message) {
    const wrap = document.getElementById(`studio-field-${field}-error`);
    const text = document.getElementById(`studio-field-${field}-error-text`);
    const input = document.getElementById(`studio-field-${field}`);

    if (text) {
        text.textContent = message;
    }
    wrap?.classList.remove('hidden');
    input?.classList.add('border-red-500', 'ring-2', 'ring-red-200/80');
}

function wireFormFieldErrorClearing() {
    for (const field of FORM_ERROR_FIELDS) {
        const input = document.getElementById(`studio-field-${field}`);
        input?.addEventListener('input', () => clearFormFieldError(field));
        input?.addEventListener('change', () => clearFormFieldError(field));
    }
}

function filterLabel(mode) {
    if (mode === 'active') {
        return 'Filter: Active';
    }
    if (mode === 'inactive') {
        return 'Filter: Inactive';
    }

    return 'Filter: All';
}

function filterRows(rows) {
    const q = studioState.search.trim().toLowerCase();
    let list = sortRows(rows);

    if (studioState.filter === 'active') {
        list = list.filter((r) => String(r.status ?? '').toLowerCase() === 'active');
    } else if (studioState.filter === 'inactive') {
        list = list.filter((r) => String(r.status ?? '').toLowerCase() === 'inactive');
    }

    if (q) {
        list = list.filter((r) => String(r.name ?? '').toLowerCase().includes(q));
    }

    return list;
}

function renderStats(rows) {
    const totalEl = document.getElementById('studio-stat-total');
    const activeEl = document.getElementById('studio-stat-active');
    const stockEl = document.getElementById('studio-stat-stock');
    const avgEl = document.getElementById('studio-stat-avg');

    const list = Array.isArray(rows) ? rows : [];
    const total = list.length;
    const active = list.filter((r) => String(r.status ?? '').toLowerCase() === 'active').length;
    const stock = list.reduce((acc, r) => acc + (Number.isFinite(Number(r.quantity)) ? Number(r.quantity) : 0), 0);
    const prices = list.map((r) => Number(r.price)).filter((n) => Number.isFinite(n));
    const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;

    if (totalEl) {
        totalEl.textContent = String(total);
    }
    if (activeEl) {
        activeEl.textContent = String(active);
    }
    if (stockEl) {
        stockEl.textContent = String(stock);
    }
    if (avgEl) {
        avgEl.textContent = avg == null ? '—' : formatPrice(avg);
    }
}

function updateFilterButton() {
    const label = document.getElementById('studio-filter-label');
    const btn = document.getElementById('studio-filter');
    if (label) {
        label.textContent = filterLabel(studioState.filter);
    }
    if (btn) {
        btn.dataset.studioFilter = studioState.filter;
    }
}

async function fetchHairstyles(apiBase) {
    const res = await fetch(apiBase, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
        throw new Error('Load failed');
    }

    const data = await res.json();

    return Array.isArray(data.data) ? data.data : data;
}

async function fetchHairstyle(apiBase, id) {
    const res = await fetch(`${apiBase}/${id}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
        throw new Error('Item load failed');
    }

    const data = await res.json();

    return data.data ?? data;
}

function statusPill(status) {
    const s = String(status).toLowerCase();
    const base =
        'studio-status-pill studio-crud-mo-cell studio-crud-mo-cell--end inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] max-md:min-h-9 max-md:px-3 max-md:py-1.5';
    if (s === 'active') {
        return `<span class="${base} studio-status-pill--active bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/90">Active</span>`;
    }

    return `<span class="${base} studio-status-pill--inactive bg-red-50 text-red-800 ring-1 ring-red-200/90">Inactive</span>`;
}

function isDetailOpen() {
    const el = document.getElementById('studio-detail');
    return Boolean(el && !el.classList.contains('hidden'));
}

function isFormModalOpen() {
    const el = document.getElementById('studio-modal');
    return Boolean(el && !el.classList.contains('hidden'));
}

function setDetailOpen(open) {
    const root = document.getElementById('studio-detail');
    if (!root) {
        return;
    }

    root.classList.toggle('hidden', !open);
    root.classList.toggle('flex', open);
    root.setAttribute('aria-hidden', open ? 'false' : 'true');

    if (!open) {
        closeImageLightbox();
        studioState.detailRow = null;
    }
    syncBodyScrollLock();
}

/**
 * @param {HTMLImageElement | null} imgEl
 * @param {HTMLElement | null} fallbackEl
 * @param {string} imageUrl
 * @param {string} [productName]
 */
function wireDetailHeroImage(imgEl, fallbackEl, imageUrl, productName) {
    if (!imgEl || !fallbackEl) {
        return;
    }

    const showFallback = () => {
        imgEl.classList.add('hidden');
        imgEl.classList.remove('studio-detail-hero-img--interactive');
        imgEl.removeAttribute('role');
        imgEl.removeAttribute('tabindex');
        fallbackEl.classList.remove('hidden');
        fallbackEl.setAttribute('aria-hidden', 'false');
    };

    const showImage = () => {
        imgEl.classList.remove('hidden');
        imgEl.classList.add('studio-detail-hero-img--interactive');
        imgEl.setAttribute('role', 'button');
        imgEl.setAttribute('tabindex', '0');
        imgEl.setAttribute('aria-label', `View full size image for ${productName && String(productName).trim() ? String(productName).trim() : 'product'}`);
        fallbackEl.classList.add('hidden');
        fallbackEl.setAttribute('aria-hidden', 'true');
    };

    const openPreview = () => {
        if (!imgEl.classList.contains('hidden') && imageUrl) {
            openImageLightbox(imageUrl, productName);
        }
    };

    imgEl.addEventListener('error', showFallback);
    imgEl.addEventListener('load', showImage);
    imgEl.addEventListener('click', openPreview);
    imgEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPreview();
        }
    });

    if (imgEl.complete) {
        if (imgEl.naturalWidth > 0) {
            showImage();
        } else {
            showFallback();
        }
    } else {
        showImage();
    }
}

function renderDetailPanel(row) {
    const title = document.getElementById('studio-detail-title');
    const idEl = document.getElementById('studio-detail-id');
    const hero = document.getElementById('studio-detail-hero');
    const fields = document.getElementById('studio-detail-fields');
    const meta = document.getElementById('studio-detail-meta');

    if (!title || !idEl || !hero || !fields || !meta) {
        return;
    }

    const price = row.price ?? 0;
    const qty = row.quantity ?? 0;
    const status = row.status ?? 'active';
    const fit = row.fit_score ?? '—';
    const accent = row.accent ?? '—';
    const rawUrl = row.image_url && String(row.image_url).trim() ? String(row.image_url).trim() : '';
    const hasUrl = Boolean(rawUrl);
    const emoji = thumbEmojiFor(row);

    title.textContent = row.name ?? '—';
    idEl.textContent = `ID · ${row.id ?? '—'}`;

    hero.innerHTML = `
        <div class="studio-detail-hero-image col-span-2 overflow-hidden rounded-2xl border border-neutral-200/90 shadow-sm shadow-neutral-900/[0.05]">
            <div class="studio-detail-hero-stage w-full">
                <div class="studio-detail-hero-frame">
                ${
                    hasUrl
                        ? `<img id="studio-detail-img" src="${escapeHtml(rawUrl)}" alt="" class="studio-detail-hero-img" decoding="async" />`
                        : ''
                }
                <div id="studio-detail-img-fallback" class="studio-detail-hero-fallback text-5xl ${hasUrl ? 'hidden' : ''}" aria-hidden="${hasUrl ? 'true' : 'false'}">${emoji}</div>
                </div>
            </div>
        </div>
        <div class="rounded-2xl border border-neutral-200/80 bg-white/95 p-4 shadow-sm shadow-neutral-900/5">
            <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Price</p>
            <p class="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums">${escapeHtml(formatPrice(price))}</p>
        </div>
        <div class="rounded-2xl border border-neutral-200/80 bg-white/95 p-4 shadow-sm shadow-neutral-900/5">
            <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Quantity</p>
            <p class="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums">${escapeHtml(String(qty))}</p>
        </div>
    `;

    if (hasUrl) {
        const imgEl = document.getElementById('studio-detail-img');
        const fb = document.getElementById('studio-detail-img-fallback');
        wireDetailHeroImage(imgEl, fb, rawUrl, row.name ?? '');
    }

    fields.innerHTML = `
        <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-3 px-4 py-3.5">
            <dt class="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Name</dt>
            <dd class="text-right text-sm font-medium text-neutral-900">${escapeHtml(row.name ?? '—')}</dd>
        </div>
        <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-3 px-4 py-3.5">
            <dt class="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Status</dt>
            <dd class="flex justify-end">${statusPill(status)}</dd>
        </div>
        <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-3 px-4 py-3.5">
            <dt class="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Fit score</dt>
            <dd class="text-right text-sm font-medium tabular-nums text-neutral-900">${escapeHtml(String(fit))}</dd>
        </div>
        <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-3 px-4 py-3.5">
            <dt class="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Accent</dt>
            <dd class="text-right text-sm font-medium capitalize text-neutral-800">${escapeHtml(String(accent))}</dd>
        </div>
    `;

    meta.innerHTML = `
        <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-3 px-4 py-3.5">
            <dt class="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Created</dt>
            <dd class="text-right text-xs font-medium text-neutral-600">${formatDateTime(row.created_at)}</dd>
        </div>
        <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-3 px-4 py-3.5">
            <dt class="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Updated</dt>
            <dd class="text-right text-xs font-medium text-neutral-600">${formatDateTime(row.updated_at)}</dd>
        </div>
    `;
}

async function openDetail(id) {
    const apiBase = studioState.apiBase;
    try {
        const row = await fetchHairstyle(apiBase, id);
        studioState.detailRow = row;
        renderDetailPanel(row);
        setDetailOpen(true);
        return;
    } catch {
        /* try list cache */
    }

    try {
        const rows = studioState.rows.length ? studioState.rows : await fetchHairstyles(apiBase);
        const fallback = rows.find((r) => String(r.id) === String(id));
        if (!fallback) {
            toast('error', 'Could not load this product.');
            return;
        }

        studioState.detailRow = fallback;
        renderDetailPanel(fallback);
        setDetailOpen(true);
        toast('info', 'Showing cached product details.');
    } catch {
        toast('error', 'Could not load this product.');
    }
}

function thumbCellHtml(row) {
    const rawUrl = row.image_url && String(row.image_url).trim() ? String(row.image_url).trim() : '';
    const hasUrl = Boolean(rawUrl);
    const emoji = thumbEmojiFor(row);

    const wrap =
        'studio-crud-thumb relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-2 shadow-sm shadow-neutral-900/[0.06]';

    if (!hasUrl) {
        return `<div class="${wrap}" data-thumb-wrap>
            <span class="text-[22px] leading-none select-none" aria-hidden="true">${emoji}</span>
        </div>`;
    }

    return `<div class="${wrap}" data-thumb-wrap>
        <img data-product-thumb src="${escapeHtml(rawUrl)}" alt="" class="max-h-full max-w-full object-contain object-center" decoding="async" />
        <span class="absolute inset-0 hidden items-center justify-center bg-white p-2 text-[22px] leading-none select-none" data-thumb-fallback aria-hidden="true">${emoji}</span>
    </div>`;
}

function wireTableThumbs(host) {
    host.querySelectorAll('img[data-product-thumb]').forEach((img) => {
        const wrap = img.closest('[data-thumb-wrap]');
        const fb = wrap?.querySelector('[data-thumb-fallback]');
        if (!fb) {
            return;
        }

        img.addEventListener('error', () => {
            img.classList.add('hidden');
            fb.classList.remove('hidden');
            fb.classList.add('flex');
        });

        img.addEventListener('load', () => {
            img.classList.remove('hidden');
            fb.classList.add('hidden');
            fb.classList.remove('flex');
        });

        if (img.complete && img.naturalWidth === 0) {
            img.dispatchEvent(new Event('error'));
        }
    });
}

/**
 * @param {number} total
 * @param {number} page
 * @param {number} pageSize
 */
function syncCrudPaginationDom(total, page, pageSize) {
    const root = document.getElementById('studio-crud-pager');
    const rangeEl = document.getElementById('studio-crud-page-range');
    const prev = document.getElementById('studio-crud-page-prev');
    const next = document.getElementById('studio-crud-page-next');
    const sizeSelect = document.getElementById('studio-crud-page-size');
    if (!root || !rangeEl || !prev || !next || !sizeSelect) {
        return;
    }

    if (total === 0) {
        root.classList.add('hidden');
        return;
    }

    root.classList.remove('hidden');

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(total, page * pageSize);
    rangeEl.textContent = `${start}–${end} of ${total}`;

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    prev.disabled = page <= 1;
    next.disabled = page >= totalPages;

    sizeSelect.value = String(pageSize);
}

function renderCrud(allRows, apiBase) {
    const host = document.getElementById('studio-crud');
    if (!host) {
        return;
    }

    host.replaceChildren();

    const visible = filterRows(allRows);

    if (visible.length === 0) {
        syncCrudPaginationDom(0, 1, studioState.crudPageSize);
        const tr = document.createElement('tr');
        tr.className = 'studio-crud-empty-row';
        tr.innerHTML = `<td colspan="7" class="studio-crud-empty border-0 px-3 py-5 sm:px-5 sm:py-8">
            <div class="studio-empty-state">
                <div class="studio-empty-state__icon" aria-hidden="true">
                    <div class="studio-empty-state__icon-breathe">
                        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-neutral-400 sm:h-[4.5rem] sm:w-[4.5rem]">
                            <circle cx="34" cy="34" r="22" stroke="currentColor" stroke-width="2" stroke-dasharray="5 5" stroke-dashoffset="0" opacity="0.85"/>
                            <path d="M52 52l14 14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                            <path d="M28 34h12M34 28v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
                        </svg>
                    </div>
                </div>
                <p class="studio-empty-state__title">No products found</p>
                <p class="studio-empty-state__desc">No products match this search or filter.</p>
                <p class="studio-empty-state__hint">Try a different keyword, reset the filter, or add a new product.</p>
            </div>
        </td>`;
        host.appendChild(tr);
        return;
    }

    const pageSize = studioState.crudPageSize;
    const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
    if (studioState.crudPage > totalPages) {
        studioState.crudPage = totalPages;
    }
    if (studioState.crudPage < 1) {
        studioState.crudPage = 1;
    }
    const page = studioState.crudPage;
    const start = (page - 1) * pageSize;
    const pageRows = visible.slice(start, start + pageSize);

    pageRows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-neutral-50/80';

        const price = row.price ?? 0;
        const qty = row.quantity ?? 0;
        const status = row.status ?? 'active';
        const num = start + idx + 1;

        tr.innerHTML = `
            <td data-label="#" class="whitespace-nowrap px-4 py-3 tabular-nums text-neutral-500 md:whitespace-nowrap"><span class="studio-crud-mo-cell studio-crud-mo-cell--end max-md:tabular-nums">${escapeHtml(String(num))}</span></td>
            <td data-label="Image" class="px-4 py-3"><span class="studio-crud-mo-cell studio-crud-mo-cell--img">${thumbCellHtml(row)}</span></td>
            <td data-label="Name" class="px-4 py-3 font-medium text-neutral-900"><span class="studio-crud-mo-cell studio-crud-mo-cell--start block max-md:font-medium">${escapeHtml(row.name)}</span></td>
            <td data-label="Price" class="whitespace-nowrap px-4 py-3 text-neutral-700 md:whitespace-nowrap"><span class="studio-crud-mo-cell studio-crud-mo-cell--end max-md:tabular-nums">${escapeHtml(formatPrice(price))}</span></td>
            <td data-label="Status" class="whitespace-nowrap px-4 py-3 md:whitespace-nowrap">${statusPill(status)}</td>
            <td data-label="Quantity" class="whitespace-nowrap px-4 py-3 tabular-nums text-neutral-700 md:whitespace-nowrap"><span class="studio-crud-mo-cell studio-crud-mo-cell--end max-md:tabular-nums">${escapeHtml(String(qty))}</span></td>
            <td data-label="Actions" class="whitespace-nowrap px-4 py-3 text-right md:whitespace-nowrap">
                <div class="inline-flex flex-wrap items-center justify-end gap-2 max-md:flex max-md:w-full max-md:flex-col max-md:items-stretch max-md:justify-start max-md:gap-2">
                    <button type="button" data-action="view" data-id="${row.id}" class="max-md:w-full rounded-xl border border-neutral-200/90 bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-800 shadow-sm shadow-neutral-900/5 hover:border-neutral-300">View</button>
                    <button type="button" data-action="edit" data-id="${row.id}" class="max-md:w-full rounded-xl border border-neutral-200/90 bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700 shadow-sm shadow-neutral-900/5 hover:border-neutral-300">Edit</button>
                    <button type="button" data-action="delete" data-id="${row.id}" class="max-md:w-full rounded-xl border border-red-200/80 bg-red-50/70 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-700 shadow-sm hover:border-red-300">Drop</button>
                </div>
            </td>
        `;

        host.appendChild(tr);
    });

    wireTableThumbs(host);

    host.querySelectorAll('button[data-action="view"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            if (id) {
                void openDetail(id);
            }
        });
    });

    host.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (!id) {
                return;
            }

            const row = allRows.find((r) => String(r.id) === String(id));
            const displayName =
                row?.name && String(row.name).trim() ? String(row.name).trim() : 'This product';

            const confirmed = await openDeleteModal(displayName);
            if (!confirmed) {
                return;
            }

            let res;
            try {
                res = await fetch(`${apiBase}/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' } });
            } catch {
                toast('error', 'Network error. Please try again.');
                return;
            }

            if (!res.ok) {
                toast('error', await readApiErrorMessage(res));
                return;
            }

            if (studioState.detailRow && String(studioState.detailRow.id) === String(id)) {
                setDetailOpen(false);
            }

            try {
                await refresh(apiBase);
            } catch {
                toast('error', 'Product removed, but the list could not be refreshed.');
                return;
            }

            toast('delete', 'Product removed.');
        });
    });

    host.querySelectorAll('button[data-action="edit"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const current = allRows.find((r) => String(r.id) === String(id));
            if (!id || !current) {
                return;
            }

            setDetailOpen(false);
            openModalForEdit(current);
        });
    });

    syncCrudPaginationDom(visible.length, page, pageSize);
}

async function refresh(apiBase) {
    const rows = await fetchHairstyles(apiBase);
    studioState.rows = rows;
    renderStats(rows);
    renderCrud(rows, apiBase);
}

function getModalEls() {
    return {
        root: document.getElementById('studio-modal'),
        backdrop: document.getElementById('studio-modal-backdrop'),
        form: document.getElementById('studio-modal-form'),
        editId: document.getElementById('studio-edit-id'),
        kicker: document.getElementById('studio-modal-kicker'),
        subtitle: document.getElementById('studio-modal-subtitle'),
        cancel: document.getElementById('studio-modal-cancel'),
        openAdd: document.getElementById('studio-add-open'),
        imageUrl: document.getElementById('studio-field-image'),
        name: document.getElementById('studio-field-name'),
        price: document.getElementById('studio-field-price'),
        status: document.getElementById('studio-field-status'),
        quantity: document.getElementById('studio-field-quantity'),
    };
}

function setModalOpen(open) {
    const { root } = getModalEls();
    if (!root) {
        return;
    }

    root.classList.toggle('hidden', !open);
    root.classList.toggle('flex', open);
    root.setAttribute('aria-hidden', open ? 'false' : 'true');

    if (!open) {
        clearFormFieldErrors();
    }
    if (open) {
        const { name } = getModalEls();
        name?.focus();
    }
    syncBodyScrollLock();
}

function openModalForCreate() {
    const m = getModalEls();
    if (!m.form || !m.editId) {
        return;
    }

    clearFormFieldErrors();

    m.editId.value = '';
    if (m.kicker) {
        m.kicker.textContent = 'Add product';
    }
    if (m.subtitle) {
        m.subtitle.textContent = 'New entry';
    }

    m.form.reset();
    if (m.imageUrl) {
        m.imageUrl.value = '';
    }
    if (m.price) {
        m.price.value = '';
    }
    if (m.quantity) {
        m.quantity.value = '';
    }
    if (m.status) {
        m.status.value = 'active';
    }

    setModalOpen(true);
}

function openModalForEdit(row) {
    const m = getModalEls();
    if (!m.form || !m.editId) {
        return;
    }

    clearFormFieldErrors();

    m.editId.value = String(row.id);
    if (m.kicker) {
        m.kicker.textContent = 'Edit product';
    }
    if (m.subtitle) {
        m.subtitle.textContent = 'Update entry';
    }

    if (m.imageUrl) {
        m.imageUrl.value = row.image_url != null ? String(row.image_url) : '';
    }
    if (m.name) {
        m.name.value = row.name ?? '';
    }
    if (m.price) {
        m.price.value = row.price != null ? String(row.price) : '';
    }
    if (m.status) {
        m.status.value = String(row.status ?? 'active');
    }
    if (m.quantity) {
        m.quantity.value = row.quantity != null ? String(row.quantity) : '';
    }

    setModalOpen(true);
}

function wireModal(apiBase) {
    const m = getModalEls();
    if (!m.openAdd || !m.form || !m.cancel || !m.backdrop) {
        return;
    }

    m.openAdd.addEventListener('click', () => openModalForCreate());

    const close = () => setModalOpen(false);
    m.cancel.addEventListener('click', close);
    m.backdrop.addEventListener('click', close);

    m.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormFieldErrors();

        const fd = new FormData(m.form);
        const editId = String(fd.get('edit_id') ?? '').trim();

        const name = String(fd.get('name') ?? '').trim();
        const priceRaw = String(fd.get('price') ?? '').trim();
        const imageUrlRaw = String(fd.get('image_url') ?? '').trim();
        const price = Number.parseFloat(priceRaw);
        const qtyRaw = String(fd.get('quantity') ?? '').trim();
        const quantity = qtyRaw === '' ? 0 : Number.parseInt(qtyRaw, 10);

        if (!name) {
            setFormFieldError('name', 'Name is required.');
            m.name?.focus();
            return;
        }

        if (priceRaw === '' || Number.isNaN(price)) {
            setFormFieldError('price', 'Price is required.');
            m.price?.focus();
            return;
        }

        if (!Number.isFinite(quantity) || quantity < 0) {
            setFormFieldError('quantity', 'Enter a valid quantity (0 or more).');
            m.quantity?.focus();
            return;
        }

        const payload = {
            name,
            image_url: imageUrlRaw === '' ? null : imageUrlRaw,
            price,
            status: String(fd.get('status') ?? 'active'),
            quantity,
        };

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        let res;
        try {
            if (editId) {
                res = await fetch(`${apiBase}/${editId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch(apiBase, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload),
                });
            }
        } catch {
            toast('error', 'Network error. Please try again.');
            return;
        }

        if (!res.ok) {
            toast('error', await readApiErrorMessage(res));
            return;
        }

        close();

        try {
            await refresh(apiBase);
        } catch {
            toast('error', 'Saved, but the list could not be refreshed.');
            return;
        }

        toast('success', editId ? 'Product updated.' : 'Product created.');

        if (studioState.detailRow && editId && String(studioState.detailRow.id) === editId) {
            try {
                const fresh = await fetchHairstyle(apiBase, editId);
                studioState.detailRow = fresh;
                renderDetailPanel(fresh);
            } catch {
                /* ignore */
            }
        }
    });

    wireFormFieldErrorClearing();
}

function wireDetail(apiBase) {
    const backdrop = document.getElementById('studio-detail-backdrop');
    const closeBtn = document.getElementById('studio-detail-close');
    const editBtn = document.getElementById('studio-detail-edit');
    const dropBtn = document.getElementById('studio-detail-drop');

    const close = () => setDetailOpen(false);

    closeBtn?.addEventListener('click', close);
    backdrop?.addEventListener('click', close);

    editBtn?.addEventListener('click', () => {
        const row = studioState.detailRow;
        if (!row) {
            return;
        }

        close();
        openModalForEdit(row);
    });

    dropBtn?.addEventListener('click', async () => {
        const row = studioState.detailRow;
        if (!row?.id) {
            return;
        }

        const displayName =
            row.name && String(row.name).trim() ? String(row.name).trim() : 'This product';

        const confirmed = await openDeleteModal(displayName);
        if (!confirmed) {
            return;
        }

        let res;
        try {
            res = await fetch(`${apiBase}/${row.id}`, { method: 'DELETE', headers: { Accept: 'application/json' } });
        } catch {
            toast('error', 'Network error. Please try again.');
            return;
        }

        if (!res.ok) {
            toast('error', await readApiErrorMessage(res));
            return;
        }

        close();

        try {
            await refresh(apiBase);
        } catch {
            toast('error', 'Product removed, but the list could not be refreshed.');
            return;
        }

        toast('delete', 'Product removed.');
    });
}

function wireKeyboard() {
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') {
            return;
        }

        if (isDeleteModalOpen()) {
            finishDeleteModal(false);
            return;
        }

        if (isImageLightboxOpen()) {
            closeImageLightbox();
            return;
        }

        if (isDetailOpen()) {
            setDetailOpen(false);
            return;
        }

        const m = getModalEls();
        if (m.root && !m.root.classList.contains('hidden')) {
            setModalOpen(false);
        }
    });
}

function wireSearchAndFilter(apiBase) {
    const search = document.getElementById('studio-search');
    const filterBtn = document.getElementById('studio-filter');

    search?.addEventListener('input', () => {
        studioState.search = search.value;
        studioState.crudPage = 1;
        renderCrud(studioState.rows, apiBase);
    });

    filterBtn?.addEventListener('click', () => {
        if (studioState.filter === 'all') {
            studioState.filter = 'active';
            toast('info', 'Showing active products only.', { filter: true, filterMode: 'active' });
        } else if (studioState.filter === 'active') {
            studioState.filter = 'inactive';
            toast('info', 'Showing inactive products only.', { filter: true, filterMode: 'inactive' });
        } else {
            studioState.filter = 'all';
            toast('info', 'Showing all products.', { filter: true, filterMode: 'all' });
        }

        updateFilterButton();
        studioState.crudPage = 1;
        renderCrud(studioState.rows, apiBase);
    });
}

let crudPaginationWired = false;

function wireCrudPagination(apiBase) {
    if (crudPaginationWired) {
        return;
    }
    crudPaginationWired = true;

    const size = document.getElementById('studio-crud-page-size');
    const prev = document.getElementById('studio-crud-page-prev');
    const next = document.getElementById('studio-crud-page-next');

    size?.addEventListener('change', () => {
        const v = Number.parseInt(String(size.value), 10);
        if (Number.isFinite(v) && v > 0) {
            studioState.crudPageSize = v;
            studioState.crudPage = 1;
            renderCrud(studioState.rows, apiBase);
        }
    });

    prev?.addEventListener('click', () => {
        if (studioState.crudPage > 1) {
            studioState.crudPage -= 1;
            renderCrud(studioState.rows, apiBase);
        }
    });

    next?.addEventListener('click', () => {
        const visible = filterRows(studioState.rows);
        const totalPages = Math.max(1, Math.ceil(visible.length / studioState.crudPageSize));
        if (studioState.crudPage < totalPages) {
            studioState.crudPage += 1;
            renderCrud(studioState.rows, apiBase);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const boot = readBootstrap();
    const apiBase = boot.apiBase.replace(/\/$/, '');
    studioState.apiBase = apiBase;
    const initial = Array.isArray(boot.hairstyles) ? boot.hairstyles : [];

    studioState.rows = initial;
    studioState.search = '';
    studioState.filter = 'all';
    updateFilterButton();

    renderStats(initial);
    renderCrud(initial, apiBase);
    wireDeleteModal();
    wireImageLightbox();
    wireModal(apiBase);
    wireDetail(apiBase);
    wireKeyboard();
    wireSearchAndFilter(apiBase);
    wireCrudPagination(apiBase);
});
