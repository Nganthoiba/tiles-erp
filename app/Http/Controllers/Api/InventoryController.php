<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\Unit;
use App\Services\Inventory\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    protected $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Get stock levels for all products or a specific product.
     */
    public function index(Request $request)
    {
        $products = Product::with(['category', 'baseUnit'])->where('is_active', true)->get();
        $warehouseId = $request->query('warehouse_id');
        $unitId = $request->query('unit_id');

        $warehouse = $warehouseId ? Warehouse::find($warehouseId) : null;

        $results = $products->map(function ($product) use ($warehouse, $unitId) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category->name,
                'stock' => $this->stockService->getCurrentStock($product, $warehouse, $unitId),
                'unit' => $unitId ? Unit::find($unitId)->name : $product->baseUnit->name,
            ];
        });

        return response()->json($results);
    }

    /**
     * Record a manual stock adjustment.
     */
    public function adjust(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'quantity' => 'required|numeric|min:0.0001',
            'unit_id' => 'required|exists:units,id',
            'type' => 'required|in:addition,subtraction',
            'note' => 'nullable|string|max:255',
        ]);

        $product = Product::findOrFail($request->product_id);
        $warehouse = Warehouse::findOrFail($request->warehouse_id);

        $movement = $this->stockService->recordMovement(
            $product,
            $warehouse,
            $request->quantity,
            $request->unit_id,
            $request->type,
            'adjustment',
            null,
            $request->note
        );

        return response()->json([
            'message' => 'Stock adjustment recorded successfully.',
            'data' => $movement
        ]);
    }

    /**
     * Transfer stock between warehouses.
     */
    public function transfer(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id' => 'required|exists:warehouses,id|different:from_warehouse_id',
            'quantity' => 'required|numeric|min:0.0001',
            'unit_id' => 'required|exists:units,id',
            'note' => 'nullable|string|max:255',
        ]);

        $product = Product::findOrFail($request->product_id);
        $fromWarehouse = Warehouse::findOrFail($request->from_warehouse_id);
        $toWarehouse = Warehouse::findOrFail($request->to_warehouse_id);

        // Check if enough stock exists in source warehouse
        $currentStock = $this->stockService->getCurrentStock($product, $fromWarehouse, $request->unit_id);
        if ($currentStock < $request->quantity) {
            return response()->json([
                'message' => 'Insufficient stock in source warehouse.',
                'current_stock' => $currentStock,
                'requested' => $request->quantity
            ], 422);
        }

        $result = DB::transaction(function () use ($product, $fromWarehouse, $toWarehouse, $request) {
            // 1. Subtract from source
            $this->stockService->recordMovement(
                $product,
                $fromWarehouse,
                $request->quantity,
                $request->unit_id,
                'subtraction',
                'transfer',
                null,
                "Transfer to {$toWarehouse->name}. " . $request->note
            );

            // 2. Add to destination
            $this->stockService->recordMovement(
                $product,
                $toWarehouse,
                $request->quantity,
                $request->unit_id,
                'addition',
                'transfer',
                null,
                "Transfer from {$fromWarehouse->name}. " . $request->note
            );

            return true;
        });

        return response()->json([
            'message' => 'Stock transfer completed successfully.'
        ]);
    }
}
