#!/bin/sh
set -e

cd /var/www/html

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "Created .env from .env.example"
    fi
fi

if [ -f artisan ]; then
    if [ ! -d vendor ]; then
        composer install --no-interaction --prefer-dist
    fi

    if [ -f .env ] && ! grep -q '^APP_KEY=base64:' .env; then
        php artisan key:generate --force --no-interaction
    fi

    echo "Waiting for database..."
    i=0
    while [ "$i" -lt 30 ]; do
        if php artisan migrate --force --no-interaction 2>/dev/null; then
            break
        fi
        i=$((i + 1))
        sleep 2
    done

    php artisan storage:link --force --no-interaction 2>/dev/null || true
fi

exec "$@"
