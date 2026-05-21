<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            [
                'name' => 'Soft waves',
                'image_url' => 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop',
                'fit_score' => 94,
                'accent' => 'rose',
                'price' => 48.0,
                'status' => 'active',
                'quantity' => 12,
            ],
            ['name' => 'Sleek bob', 'image_url' => null, 'fit_score' => 91, 'accent' => 'slate', 'price' => 42.5, 'status' => 'active', 'quantity' => 8],
            ['name' => 'Long layers', 'image_url' => null, 'fit_score' => 88, 'accent' => 'amber', 'price' => 55.0, 'status' => 'inactive', 'quantity' => 3],
            [
                'name' => 'Side part',
                'image_url' => 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=200&h=200&fit=crop',
                'fit_score' => 84,
                'accent' => 'zinc',
                'price' => 36.0,
                'status' => 'active',
                'quantity' => 20,
            ],
            ['name' => 'Tight curls', 'image_url' => null, 'fit_score' => 72, 'accent' => 'violet', 'price' => 62.0, 'status' => 'active', 'quantity' => 5],
            ['name' => 'Buzz', 'image_url' => null, 'fit_score' => 46, 'accent' => 'emerald', 'price' => 28.0, 'status' => 'inactive', 'quantity' => 1],
        ];

        foreach ($rows as $row) {
            Product::query()->updateOrCreate(
                ['name' => $row['name']],
                $row
            );
        }
    }
}
