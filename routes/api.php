<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    // Inventory Routes
    Route::get('/inventory', [\App\Http\Controllers\Api\InventoryController::class, 'index']);
    Route::post('/inventory/adjust', [\App\Http\Controllers\Api\InventoryController::class, 'adjust']);
    Route::post('/inventory/transfer', [\App\Http\Controllers\Api\InventoryController::class, 'transfer']);

    // Sales Routes
    Route::get('/quotations', [\App\Http\Controllers\Api\SalesController::class, 'quotations']);
    Route::post('/quotations', [\App\Http\Controllers\Api\SalesController::class, 'storeQuotation']);
    Route::get('/invoices', [\App\Http\Controllers\Api\SalesController::class, 'invoices']);
    Route::post('/quotations/{id}/convert', [\App\Http\Controllers\Api\SalesController::class, 'convertToInvoice']);

    // Contact Routes (Customers & Dealers)
    Route::get('/customers', [\App\Http\Controllers\Api\ContactController::class, 'customers']);
    Route::post('/customers', [\App\Http\Controllers\Api\ContactController::class, 'storeCustomer']);
    Route::get('/customers/{id}', [\App\Http\Controllers\Api\ContactController::class, 'showCustomer']);
    Route::get('/dealers', [\App\Http\Controllers\Api\ContactController::class, 'dealers']);
    Route::post('/dealers', [\App\Http\Controllers\Api\ContactController::class, 'storeDealer']);

    // Payment Routes
    Route::get('/payments', [\App\Http\Controllers\Api\PaymentController::class, 'index']);
    Route::post('/payments', [\App\Http\Controllers\Api\PaymentController::class, 'store']);

    // Logistics Routes
    Route::get('/delivery-slips', [\App\Http\Controllers\Api\LogisticsController::class, 'index']);
    Route::post('/delivery-slips', [\App\Http\Controllers\Api\LogisticsController::class, 'store']);
    Route::post('/delivery-slips/{id}/status', [\App\Http\Controllers\Api\LogisticsController::class, 'updateStatus']);

    // Report Routes
    Route::get('/reports/sales-summary', [\App\Http\Controllers\Api\ReportController::class, 'salesSummary']);
    Route::get('/reports/stock', [\App\Http\Controllers\Api\ReportController::class, 'stockReport']);
    Route::get('/reports/dues', [\App\Http\Controllers\Api\ReportController::class, 'dueReport']);
});
