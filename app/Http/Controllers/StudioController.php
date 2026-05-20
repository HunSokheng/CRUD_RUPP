<?php

namespace App\Http\Controllers;

use App\Http\Resources\HairstyleResource;
use App\Models\Hairstyle;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class StudioController extends Controller
{
    public function __invoke(Request $request): View
    {
        $rows = Hairstyle::query()
            ->orderByDesc('id')
            ->get();

        $payload = $rows->map(
            fn (Hairstyle $h) => (new HairstyleResource($h))->toArray($request)
        )->values()->all();

        return view('studio', [
            'portraitUrl' => (string) config('hairstudio.portrait_url'),
            'hairstyles' => $payload,
        ]);
    }
}
