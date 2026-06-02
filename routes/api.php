<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\v1\CategoryController;
use App\Http\Controllers\Api\v1\ProductController;
use App\Http\Controllers\Api\v1\InventoryController;
use App\Http\Controllers\Api\v1\QuotationController;
use App\Http\Controllers\Api\v1\InvoiceController;
use App\Http\Controllers\Api\v1\DeliveryController;
use App\Http\Controllers\Api\v1\PaymentController;
use App\Http\Controllers\Api\v1\ReportController;
use App\Http\Controllers\Api\v1\ContactController;
use App\Http\Controllers\Api\v1\UnitController;
use App\Http\Controllers\Api\v1\WarehouseController;
use App\Http\Controllers\Api\v1\VendorController;
use App\Http\Controllers\Api\v1\BrandController;


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    // Master Data
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('warehouses', WarehouseController::class);
    Route::apiResource('vendors', VendorController::class);
    Route::get('/brands', [BrandController::class, 'index']);

    Route::get('/units', [UnitController::class, 'index']);

    // Inventory
    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::get('/inventory/ledger', [InventoryController::class, 'ledger']);
    Route::post('/inventory/adjust', [InventoryController::class, 'adjust']);
    Route::post('/inventory/transfer', [InventoryController::class, 'transfer']);
    Route::post('/inventory/relocate', [InventoryController::class, 'relocate']);

    // Sales
    Route::get('/quotations', [QuotationController::class, 'index']);
    Route::post('/quotations', [QuotationController::class, 'store']);
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::post('/quotations/{id}/convert', [InvoiceController::class, 'convertFromQuotation']);

    // Contacts
    Route::get('/customers', [ContactController::class, 'customers']);
    Route::post('/customers', [ContactController::class, 'storeCustomer']);
    Route::get('/customers/{id}', [ContactController::class, 'showCustomer']);
    Route::get('/dealers', [ContactController::class, 'dealers']);
    Route::post('/dealers', [ContactController::class, 'storeDealer']);

    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);

    // Delivery
    Route::get('/deliveries', [DeliveryController::class, 'index']);
    Route::post('/deliveries', [DeliveryController::class, 'store']);
    Route::post('/deliveries/{id}/status', [DeliveryController::class, 'updateStatus']);

    // Reports
    Route::get('/reports/sales-summary', [ReportController::class, 'salesSummary']);
    Route::get('/reports/stock', [ReportController::class, 'stockReport']);
    Route::get('/reports/dues', [ReportController::class, 'dueReport']);
});
