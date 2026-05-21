<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';

    protected $fillable = [
        'name',
        'image_url',
        'fit_score',
        'accent',
        'price',
        'status',
        'quantity',
    ];

    protected function casts(): array
    {
        return [
            'fit_score' => 'integer',
            'price' => 'decimal:2',
            'quantity' => 'integer',
        ];
    }
}
