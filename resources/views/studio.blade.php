<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Royal University of Phnom Penh</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=noto-sans-khmer:400,500,600|instrument-sans:400,500,600,700" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/studio.js'])
</head>
<body class="min-h-screen bg-neutral-100 text-neutral-900 antialiased selection:bg-neutral-900/10">
    <div id="studio-toasts" class="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(100%,22rem)] flex-col gap-2 sm:right-6 sm:top-5" aria-live="polite" aria-relevant="additions"></div>

    <div id="studio-root" class="min-h-screen">
        @include('partials.studio-header')

        <main class="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
            <section class="studio-stat-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div class="studio-stat-card studio-stat-card--total min-w-0 rounded-[22px] border bg-white p-4 shadow-[0_16px_50px_-32px_rgba(15,23,42,0.35)] sm:p-5">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Total products</p>
                    <p id="studio-stat-total" class="studio-stat-value mt-2 text-2xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-3xl">0</p>
                </div>
                <div class="studio-stat-card studio-stat-card--active min-w-0 rounded-[22px] border bg-white p-4 shadow-[0_16px_50px_-32px_rgba(15,23,42,0.35)] sm:p-5">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Active</p>
                    <p id="studio-stat-active" class="studio-stat-value mt-2 text-2xl font-semibold tabular-nums tracking-tight text-emerald-700 sm:text-3xl">0</p>
                </div>
                <div class="studio-stat-card studio-stat-card--stock min-w-0 rounded-[22px] border bg-white p-4 shadow-[0_16px_50px_-32px_rgba(15,23,42,0.35)] sm:p-5">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Total stock</p>
                    <p id="studio-stat-stock" class="studio-stat-value mt-2 text-2xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-3xl">0</p>
                </div>
                <div class="studio-stat-card studio-stat-card--avg min-w-0 rounded-[22px] border bg-white p-4 shadow-[0_16px_50px_-32px_rgba(15,23,42,0.35)] sm:p-5">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Avg price</p>
                    <p id="studio-stat-avg" class="studio-stat-value mt-2 text-2xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-3xl">—</p>
                </div>
            </section>

            <section class="rounded-[24px] border border-neutral-200/80 bg-white p-5 shadow-[0_16px_50px_-32px_rgba(15,23,42,0.35)] sm:p-6">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p class="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">CRUD</p>
                        <p class="text-lg font-semibold tracking-tight text-neutral-900">Products</p>
                    </div>
                    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                        <label class="relative block min-w-[min(100%,16rem)] flex-1 sm:max-w-xs">
                            <span class="sr-only">Search by name</span>
                            <input
                                id="studio-search"
                                type="search"
                                autocomplete="off"
                                placeholder="Search by name…"
                                class="h-10 w-full rounded-2xl border border-neutral-200/90 bg-neutral-50/80 px-3.5 pr-10 text-sm text-neutral-900 shadow-inner shadow-neutral-900/5 outline-none placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-neutral-900/10"
                            >
                            <span class="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center text-neutral-400" aria-hidden="true">
                                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8.5" cy="8.5" r="5"/><path d="M12.5 12.5 17 17"/></svg>
                            </span>
                        </label>
                        <div class="flex flex-wrap items-center gap-2.5">
                            <button
                                type="button"
                                id="studio-filter"
                                data-studio-filter="all"
                                aria-label="Cycle product filter: all, active, or inactive"
                                class="group studio-toolbar-filter inline-flex h-10 shrink-0 items-center gap-2.5 rounded-2xl border border-neutral-200/90 bg-gradient-to-b from-white to-neutral-50/95 px-3.5 py-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-800 shadow-[0_2px_12px_-5px_rgba(15,23,42,0.11),0_1px_3px_-1px_rgba(15,23,42,0.07)] ring-1 ring-neutral-900/[0.04] transition duration-200 ease-out hover:border-neutral-300 hover:shadow-[0_6px_22px_-7px_rgba(15,23,42,0.14),0_2px_6px_-2px_rgba(15,23,42,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 active:scale-[0.98]"
                            >
                                <span class="studio-filter-icon-wrap flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200/80 transition group-hover:bg-white group-hover:text-neutral-900 group-hover:ring-neutral-300/90" aria-hidden="true">
                                    <svg class="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke">
                                        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                                    </svg>
                                </span>
                                <span id="studio-filter-label">Filter: All</span>
                            </button>
                            <button
                                type="button"
                                id="studio-add-open"
                                aria-label="Add new product"
                                class="group studio-toolbar-add inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-950 px-4 py-0 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_2px_12px_-4px_rgba(15,23,42,0.32),0_1px_4px_-1px_rgba(15,23,42,0.22)] ring-1 ring-white/10 transition duration-200 ease-out hover:from-neutral-700 hover:to-neutral-900 hover:shadow-[0_5px_22px_-6px_rgba(15,23,42,0.38),0_2px_8px_-2px_rgba(15,23,42,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/70 focus-visible:ring-offset-2 active:scale-[0.98]"
                            >
                                <span class="studio-add-icon-wrap flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-600/75 text-white ring-1 ring-inset ring-white/15 transition group-hover:bg-neutral-500/85 group-hover:ring-white/25" aria-hidden="true">
                                    <svg class="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke">
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                </span>
                                <span>Add</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="mt-5 overflow-hidden rounded-2xl border border-neutral-100 max-md:overflow-visible md:overflow-hidden">
                    <div class="studio-crud-scroll max-md:overflow-x-visible md:overflow-x-auto">
                        <table class="studio-crud-table min-w-full divide-y divide-neutral-100 text-left text-sm">
                            <thead class="bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                <tr>
                                    <th class="whitespace-nowrap px-4 py-3">#</th>
                                    <th class="whitespace-nowrap px-4 py-3">Image</th>
                                    <th class="min-w-[10rem] px-4 py-3">Name</th>
                                    <th class="whitespace-nowrap px-4 py-3">Price</th>
                                    <th class="whitespace-nowrap px-4 py-3">Status</th>
                                    <th class="whitespace-nowrap px-4 py-3">Quantity</th>
                                    <th class="whitespace-nowrap px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="studio-crud" class="divide-y divide-neutral-100 bg-white"></tbody>
                        </table>
                    </div>
                    <div
                        id="studio-crud-pager"
                        class="hidden border-t border-neutral-100 bg-neutral-50/80 px-3 py-2.5 sm:px-4"
                        aria-label="Table pagination"
                    >
                        <div class="flex flex-col items-stretch gap-3 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
                            <label class="inline-flex items-center gap-2 whitespace-nowrap">
                                <span class="text-neutral-500">Rows per page:</span>
                                <select
                                    id="studio-crud-page-size"
                                    class="h-9 min-w-[4.25rem] cursor-pointer rounded-lg border border-neutral-200/95 bg-white px-2 pr-8 text-sm font-medium text-neutral-800 shadow-sm outline-none transition hover:border-neutral-300 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10"
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                            </label>
                            <span id="studio-crud-page-range" class="tabular-nums text-neutral-600 sm:min-w-[7.5rem] sm:text-right">0–0 of 0</span>
                            <div class="flex items-center justify-end gap-1 sm:ml-0">
                                <button
                                    type="button"
                                    id="studio-crud-page-prev"
                                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-neutral-700 transition hover:border-neutral-200 hover:bg-white hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-35"
                                    aria-label="Previous page"
                                >
                                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M15 6l-6 6 6 6" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    id="studio-crud-page-next"
                                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-neutral-700 transition hover:border-neutral-200 hover:bg-white hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-35"
                                    aria-label="Next page"
                                >
                                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M9 6l6 6-6 6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <div id="studio-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-4" aria-hidden="true">
        <div id="studio-modal-backdrop" class="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]"></div>
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-modal-kicker"
            class="relative w-full max-w-md overflow-hidden rounded-[24px] border border-neutral-200/90 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.45)]"
        >
            <div class="border-b border-neutral-100 px-6 py-4">
                <p id="studio-modal-kicker" class="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Add product</p>
                <p id="studio-modal-subtitle" class="mt-1 text-lg font-semibold tracking-tight text-neutral-900">New entry</p>
            </div>
            <form id="studio-modal-form" class="space-y-4 px-6 py-5" novalidate>
                <input type="hidden" name="edit_id" id="studio-edit-id" value="">
                <div>
                    <label for="studio-field-image" class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Image URL</label>
                    <input id="studio-field-image" name="image_url" type="text" inputmode="url" autocomplete="off" placeholder="https://… (optional)" class="h-11 w-full rounded-2xl border border-neutral-200/90 bg-neutral-50/80 px-3 text-sm text-neutral-900 shadow-inner shadow-neutral-900/5 outline-none focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-neutral-900/10">
                </div>
                <div>
                    <label for="studio-field-name" class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Name <span class="text-red-600">*</span></label>
                    <input id="studio-field-name" name="name" maxlength="64" class="studio-form-input h-11 w-full rounded-2xl border border-neutral-200/90 bg-neutral-50/80 px-3 text-sm text-neutral-900 shadow-inner shadow-neutral-900/5 outline-none focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-neutral-900/10">
                    <p id="studio-field-name-error" class="mt-1.5 hidden" role="alert">
                        <span class="flex items-start gap-1.5 text-sm font-medium text-red-600">
                            <svg class="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>
                            <span id="studio-field-name-error-text"></span>
                        </span>
                    </p>
                </div>
                <div>
                    <label for="studio-field-price" class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Price <span class="text-red-600">*</span></label>
                    <input id="studio-field-price" name="price" type="number" min="0" step="0.01" class="studio-form-input h-11 w-full rounded-2xl border border-neutral-200/90 bg-neutral-50/80 px-3 text-sm text-neutral-900 shadow-inner shadow-neutral-900/5 outline-none focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-neutral-900/10">
                    <p id="studio-field-price-error" class="mt-1.5 hidden" role="alert">
                        <span class="flex items-start gap-1.5 text-sm font-medium text-red-600">
                            <svg class="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>
                            <span id="studio-field-price-error-text"></span>
                        </span>
                    </p>
                </div>
                <div>
                    <label for="studio-field-status" class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Status</label>
                    <div class="relative">
                        <select
                            id="studio-field-status"
                            name="status"
                            required
                            autocomplete="off"
                            class="peer studio-field-status-select h-11 w-full cursor-pointer appearance-none rounded-2xl border border-neutral-200 bg-white py-2 pl-3.5 pr-11 text-sm font-medium tracking-tight text-neutral-900 outline-none transition-[border-color,box-shadow,background-color,color] duration-200 ease-out hover:border-neutral-300 hover:bg-white focus:border-neutral-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <span
                            class="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-400 transition-colors duration-200 peer-hover:text-neutral-600 peer-focus:text-neutral-900"
                            aria-hidden="true"
                        >
                            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M5.5 7.5 10 12l4.5-4.5" />
                            </svg>
                        </span>
                    </div>
                </div>
                <div>
                    <label for="studio-field-quantity" class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Quantity</label>
                    <input id="studio-field-quantity" name="quantity" type="number" min="0" step="1" class="studio-form-input h-11 w-full rounded-2xl border border-neutral-200/90 bg-neutral-50/80 px-3 text-sm text-neutral-900 shadow-inner shadow-neutral-900/5 outline-none focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-neutral-900/10">
                    <p id="studio-field-quantity-error" class="mt-1.5 hidden" role="alert">
                        <span class="flex items-start gap-1.5 text-sm font-medium text-red-600">
                            <svg class="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>
                            <span id="studio-field-quantity-error-text"></span>
                        </span>
                    </p>
                </div>
                <div class="flex gap-2 pt-2">
                    <button type="button" id="studio-modal-cancel" class="h-11 flex-1 rounded-2xl border border-neutral-200/90 bg-white text-xs font-semibold uppercase tracking-[0.16em] text-neutral-700 shadow-sm shadow-neutral-900/5 hover:border-neutral-300">Cancel</button>
                    <button type="submit" id="studio-modal-save" class="h-11 flex-1 rounded-2xl bg-neutral-900 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-lg shadow-neutral-900/25 hover:bg-neutral-800">Save</button>
                </div>
            </form>
        </div>
    </div>

    <div id="studio-detail" class="fixed inset-0 z-[60] hidden items-center justify-center p-4 sm:p-6" aria-hidden="true">
        <div id="studio-detail-backdrop" class="absolute inset-0 bg-neutral-950/45 backdrop-blur-[3px]"></div>
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-detail-kicker"
            class="relative flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-[24px] border border-neutral-200/90 bg-white shadow-[0_24px_90px_-28px_rgba(15,23,42,0.55)]"
        >
            <div class="relative shrink-0 border-b border-neutral-100 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 px-6 pb-5 pt-5">
                <div class="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-neutral-900/[0.05] blur-2xl"></div>
                <div class="relative flex items-start justify-between gap-4">
                    <div class="min-w-0 flex-1">
                        <p id="studio-detail-kicker" class="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Product detail</p>
                        <h2 id="studio-detail-title" class="mt-1 line-clamp-2 text-xl font-semibold tracking-tight text-neutral-900"></h2>
                        <p id="studio-detail-id" class="mt-2 inline-flex items-center rounded-full border border-neutral-200/90 bg-white/90 px-2.5 py-1 text-[11px] font-medium tabular-nums text-neutral-600 shadow-sm"></p>
                    </div>
                    <button
                        type="button"
                        id="studio-detail-close"
                        class="shrink-0 rounded-2xl border border-neutral-200/90 bg-white p-2 text-neutral-600 shadow-sm shadow-neutral-900/5 transition hover:border-neutral-300 hover:text-neutral-900"
                        aria-label="Close"
                    >
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
                    </button>
                </div>
                <div id="studio-detail-hero" class="relative mt-5 grid grid-cols-2 gap-3"></div>
            </div>
            <div id="studio-detail-scroll" class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Overview</p>
                <dl id="studio-detail-fields" class="mt-2 space-y-0 divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-neutral-50/50"></dl>
                <p class="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Record</p>
                <dl id="studio-detail-meta" class="mt-2 space-y-0 divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white"></dl>
            </div>
            <div class="shrink-0 border-t border-neutral-100 bg-white/95 px-6 py-4 backdrop-blur">
                <div class="flex flex-wrap gap-2">
                    <button type="button" id="studio-detail-edit" class="h-11 flex-1 rounded-2xl bg-neutral-900 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-lg shadow-neutral-900/25 hover:bg-neutral-800 sm:flex-none">Edit</button>
                    <button type="button" id="studio-detail-drop" class="h-11 flex-1 rounded-2xl border border-red-200/90 bg-red-50/80 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-red-700 shadow-sm hover:border-red-300 sm:flex-none">Drop</button>
                </div>
            </div>
        </div>
    </div>

    <div id="studio-image-lightbox" class="studio-image-lightbox fixed inset-0 z-[70] hidden items-center justify-center p-4 sm:p-6" aria-hidden="true">
        <div id="studio-image-lightbox-backdrop" class="absolute inset-0 bg-neutral-950/80 backdrop-blur-[4px]"></div>
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Product image preview"
            class="studio-image-lightbox__panel relative z-10 flex w-full max-w-3xl flex-col items-center"
        >
            <button
                type="button"
                id="studio-image-lightbox-close"
                class="absolute -right-1 -top-1 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-600 shadow-lg transition hover:border-neutral-300 hover:text-neutral-900 sm:right-0 sm:top-0"
                aria-label="Close image preview"
            >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
            <div class="studio-image-lightbox__stage flex w-full items-center justify-center rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xl shadow-neutral-900/25 sm:p-6">
                <img id="studio-image-lightbox-img" src="" alt="" class="studio-image-lightbox__img max-h-[min(78vh,640px)] w-auto max-w-full object-contain object-center" decoding="async" />
            </div>
        </div>
    </div>

    <div id="studio-delete-modal" class="studio-delete-modal fixed inset-0 z-[90] hidden items-center justify-center p-4" aria-hidden="true">
        <div id="studio-delete-backdrop" class="studio-delete-modal__backdrop absolute inset-0 bg-neutral-950/50 backdrop-blur-[2px]"></div>
        <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="studio-delete-title"
            aria-describedby="studio-delete-subtitle"
            class="studio-delete-modal__panel relative w-full max-w-[22rem] rounded-[24px] border border-neutral-200/90 bg-white px-6 pb-6 pt-8 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.5)]"
        >
            <div class="flex flex-col items-center text-center">
                <div class="studio-delete-modal__icon flex h-16 w-16 items-center justify-center rounded-full bg-red-100 shadow-[0_0_0_8px_rgba(254,226,226,0.65)]" aria-hidden="true">
                    <svg class="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                    </svg>
                </div>
                <h2 id="studio-delete-title" class="studio-delete-modal__title mt-5 text-lg font-bold tracking-tight text-neutral-900">Drop this product?</h2>
                <p id="studio-delete-subtitle" class="studio-delete-modal__subtitle mt-2 text-sm leading-relaxed text-neutral-600"></p>
                <div class="studio-delete-modal__actions mt-7 grid w-full grid-cols-2 gap-3">
                    <button
                        type="button"
                        id="studio-delete-cancel"
                        class="h-11 rounded-2xl border-2 border-neutral-200/90 bg-white text-xs font-semibold uppercase tracking-[0.14em] text-neutral-800 shadow-sm shadow-neutral-900/5 transition hover:border-neutral-300 hover:bg-neutral-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        id="studio-delete-confirm"
                        class="h-11 rounded-2xl bg-red-600 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700"
                    >
                        Drop it
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script type="application/json" id="studio-bootstrap">
        {!! json_encode([
            'portraitUrl' => $portraitUrl,
            'products' => $products,
            'apiBase' => '/api/products',
        ], JSON_THROW_ON_ERROR | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT) !!}
    </script>
</body>
</html>
