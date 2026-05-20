<?php

use App\Http\Controllers\StudioController;
use Illuminate\Support\Facades\Route;

Route::get('/', StudioController::class)->name('studio');

Route::get('/welcome', function () {
    return view('welcome');
});
