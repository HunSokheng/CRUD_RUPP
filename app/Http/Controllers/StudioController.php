<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class StudioController extends Controller
{
    public function __invoke(Request $request): View
    {
        $rows = Product::query()
            ->orderByDesc('id')
            ->get();

        $payload = $rows->map(
            fn (Product $product) => (new ProductResource($product))->toArray($request)
        )->values()->all();

        return view('studio', [
            'portraitUrl' => (string) config('products.portrait_url'),
            'products' => $payload,
        ]);
    }
}
