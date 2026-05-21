<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('hairstyles') && ! Schema::hasTable('products')) {
            Schema::rename('hairstyles', 'products');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('products') && ! Schema::hasTable('hairstyles')) {
            Schema::rename('products', 'hairstyles');
        }
    }
};
