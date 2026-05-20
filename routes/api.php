<?php

use App\Http\Controllers\Api\HairstyleController;
use Illuminate\Support\Facades\Route;

Route::apiResource('hairstyles', HairstyleController::class);
