<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHairstyleRequest;
use App\Http\Requests\UpdateHairstyleRequest;
use App\Http\Resources\HairstyleResource;
use App\Models\Hairstyle;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class HairstyleController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $rows = Hairstyle::query()
            ->orderByDesc('id')
            ->get();

        return HairstyleResource::collection($rows);
    }

    public function store(StoreHairstyleRequest $request): HairstyleResource
    {
        $hairstyle = Hairstyle::query()->create($request->validated());

        return new HairstyleResource($hairstyle);
    }

    public function show(Hairstyle $hairstyle): HairstyleResource
    {
        return new HairstyleResource($hairstyle);
    }

    public function update(UpdateHairstyleRequest $request, Hairstyle $hairstyle): HairstyleResource
    {
        $hairstyle->update($request->validated());

        return new HairstyleResource($hairstyle->fresh());
    }

    public function destroy(Hairstyle $hairstyle): Response
    {
        $hairstyle->delete();

        return response()->noContent();
    }
}
