<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/login', [AuthController::class, 'login'])->middleware('guest');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');

// Registration
Route::post('/register', [AuthController::class, 'register'])->middleware('guest');

// React SPA fallback
Route::view('/{any}', 'app')->where('any', '^(?!api).*$');
