<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\UnitConversion;
use App\Models\Warehouse;
use App\Models\ProductUnit;
use App\Models\StockLedger;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryController extends Controller
{
    protected $stockService;

    public function __construct(InventoryService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Get stock levels for all products or a specific product.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'baseUnit', 'unitConversions.fromUnit'])->where('is_active', true);

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $products = $query->get();
        $warehouseId = $request->query('warehouse_id');
        $unitId = $request->query('unit_id');

        $warehouse = $warehouseId ? Warehouse::find($warehouseId) : null;

        $results = $products->map(function ($product) use ($warehouse, $unitId) {
            $stock = 0;
            $locations = [];
            $slabs = [];

            try {
                $stock = $this->stockService->getCurrentStock($product, $warehouse, $unitId);
            } catch (\Exception $e) {
                Log::error("Stock calculation failed for product {$product->sku}: " . $e->getMessage());
            }

            if ($product->isSlab()) {
                $slabs = \App\Models\Slab::where('product_id', $product->id)
                    ->where('status', 'available')
                    ->when($warehouse, fn($q) => $q->where('warehouse_id', $warehouse->id))
                    ->get();
            }

            try {
                // Get locations breakdown (PostgreSQL compatible HAVING clause)
                $locations = StockLedger::where('product_id', $product->id)
                    ->when($warehouse, fn($q) => $q->where('warehouse_id', $warehouse->id))
                    ->select('rack_number', 'slot_number', DB::raw("SUM(CASE WHEN type = 'addition' THEN converted_quantity ELSE -converted_quantity END) as balance"))
                    ->groupBy('rack_number', 'slot_number')
                    ->having(DB::raw("SUM(CASE WHEN type = 'addition' THEN converted_quantity ELSE -converted_quantity END)"), '>', 0)
                    ->get()
                    ->map(fn($l) => [
                        'rack' => $l->rack_number ?? 'Unassigned',
                        'slot' => $l->slot_number ?? 'Unassigned',
                        'stock' => $unitId ? $this->stockService->convertFromBase($product, (float)$l->balance, $unitId) : (float)$l->balance,
                    ]);
            } catch (\Exception $e) {
                Log::error("Location breakdown failed for product {$product->sku}: " . $e->getMessage());
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category->name ?? 'Uncategorized',
                'stock' => $stock,
                'unit' => $unitId ? (ProductUnit::find($unitId)->name ?? 'Unknown') : ($product->baseUnit->name ?? 'Unit'),
                'base_unit_id' => $product->base_unit_id,
                'unit_conversions' => $product->unitConversions,
                'locations' => $locations,
                'slabs' => $slabs,
                'is_slab' => $product->isSlab(),
            ];
        });

        return response()->json($results);
    }

    /**
     * Record a manual stock adjustment.
     */
    public function adjust(Request $request)
    {
        $product = Product::findOrFail($request->product_id);
        $warehouse = Warehouse::findOrFail($request->warehouse_id);

        if ($product->isSlab()) {
            if ($request->input('type') === 'addition') {
                $request->validate([
                    'product_id' => 'required|exists:products,id',
                    'warehouse_id' => 'required|exists:warehouses,id',
                    'note' => 'nullable|string|max:255',
                    'vendor_id' => 'nullable|exists:vendors,id',
                    'rack_number' => 'nullable|string|max:50',
                    'slot_number' => 'nullable|string|max:50',
                    'slabs' => 'required|array|min:1',
                    'slabs.*.lot_number' => 'nullable|string|max:255',
                    'slabs.*.slab_number' => 'nullable|string|max:255',
                    'slabs.*.length' => 'required|numeric|min:0.01',
                    'slabs.*.width' => 'required|numeric|min:0.01',
                    'slabs.*.thickness' => 'required|numeric|min:0.01',
                    'slabs.*.quantity' => 'required|integer|min:1',
                    'slabs.*.unit' => 'required|in:mm,cm,ft',
                ]);

                $totalAreaSqft = 0;
                $slabsToCreate = [];
                foreach ($request->input('slabs', []) as $slabData) {
                    $lengthMm = floatval($slabData['length']);
                    $widthMm = floatval($slabData['width']);
                    $thicknessMm = floatval($slabData['thickness']);

                    if ($slabData['unit'] === 'cm') {
                        $lengthMm *= 10;
                        $widthMm *= 10;
                        $thicknessMm *= 10;
                    } elseif ($slabData['unit'] === 'ft') {
                        $lengthMm *= 304.8;
                        $widthMm *= 304.8;
                        $thicknessMm *= 304.8;
                    }

                    $areaSqft = ($lengthMm * $widthMm * intval($slabData['quantity'])) / 92903.04;
                    $totalAreaSqft += $areaSqft;

                    $slabsToCreate[] = [
                        'lot_number' => $slabData['lot_number'] ?? null,
                        'slab_number' => $slabData['slab_number'] ?? null,
                        'length' => $lengthMm,
                        'width' => $widthMm,
                        'thickness' => $thicknessMm,
                        'quantity' => intval($slabData['quantity']),
                        'area_sqft' => $areaSqft,
                        'warehouse_id' => $request->warehouse_id,
                        'rack_number' => $request->rack_number,
                        'slot_number' => $request->slot_number,
                        'status' => 'available',
                    ];
                }

                $sftUnit = \App\Models\ProductUnit::where('slug', 'sft')->first();
                $unitId = $sftUnit ? $sftUnit->id : $product->base_unit_id;

                $movement = DB::transaction(function () use ($product, $warehouse, $totalAreaSqft, $unitId, $request, $slabsToCreate) {
                    $mObj = $this->stockService->recordMovement(
                        $product,
                        $warehouse,
                        $totalAreaSqft,
                        $unitId,
                        $request->type,
                        'purchase',
                        null,
                        $request->note,
                        $request->vendor_id,
                        $request->rack_number,
                        $request->slot_number
                    );

                    foreach ($slabsToCreate as $sData) {
                        $sData['stock_ledger_id'] = $mObj->id;
                        $product->slabs()->create($sData);
                    }
                    return $mObj;
                });
            } else {
                // subtraction
                $request->validate([
                    'product_id' => 'required|exists:products,id',
                    'warehouse_id' => 'required|exists:warehouses,id',
                    'note' => 'nullable|string|max:255',
                    'slab_ids' => 'required|array|min:1',
                    'slab_ids.*' => 'required|exists:slabs,id',
                ]);

                $slabs = \App\Models\Slab::whereIn('id', $request->slab_ids)->get();
                $totalAreaSqft = $slabs->sum('area_sqft');

                $sftUnit = \App\Models\ProductUnit::where('slug', 'sft')->first();
                $unitId = $sftUnit ? $sftUnit->id : $product->base_unit_id;

                $movement = DB::transaction(function () use ($product, $warehouse, $totalAreaSqft, $unitId, $request, $slabs) {
                    $mObj = $this->stockService->recordMovement(
                        $product,
                        $warehouse,
                        $totalAreaSqft,
                        $unitId,
                        'subtraction',
                        'adjustment',
                        null,
                        $request->note,
                        null,
                        null,
                        null
                    );

                    \App\Models\Slab::whereIn('id', $request->slab_ids)->update([
                        'status' => 'sold',
                        'stock_ledger_id' => $mObj->id,
                    ]);
                    return $mObj;
                });
            }
        } else {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'warehouse_id' => 'required|exists:warehouses,id',
                'quantity' => 'required|numeric|min:0.0001',
                'unit_id' => 'required|exists:units,id',
                'type' => 'required|in:addition,subtraction',
                'note' => 'nullable|string|max:255',
                'vendor_id' => 'nullable|exists:vendors,id',
                'rack_number' => 'nullable|string|max:50',
                'slot_number' => 'nullable|string|max:50',
            ]);

            $movement = $this->stockService->recordMovement(
                $product,
                $warehouse,
                $request->quantity,
                $request->unit_id,
                $request->type,
                $request->type === 'addition' ? 'purchase' : 'adjustment',
                null,
                $request->note,
                $request->vendor_id,
                $request->rack_number,
                $request->slot_number
            );
        }

        return response()->json([
            'message' => 'Stock adjustment recorded successfully.',
            'data' => $movement
        ]);
    }

    /**
     * Get stock movement ledger.
     */
    public function ledger(Request $request)
    {
        $query = StockLedger::with(['product', 'warehouse', 'unit', 'vendor'])
            ->orderBy('created_at', 'desc');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('product', function ($pq) use ($search) {
                    $pq->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                })->orWhere('note', 'like', "%{$search}%");
            });
        }

        $ledger = $query->paginate($request->query('per_page', 10));

        return response()->json($ledger);
    }

    /**
     * Transfer stock between warehouses.
     */
    public function transfer(Request $request)
    {
        $product = Product::findOrFail($request->product_id);
        $fromWarehouse = Warehouse::findOrFail($request->from_warehouse_id);
        $toWarehouse = Warehouse::findOrFail($request->to_warehouse_id);

        if ($product->isSlab()) {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'from_warehouse_id' => 'required|exists:warehouses,id',
                'to_warehouse_id' => 'required|exists:warehouses,id|different:from_warehouse_id',
                'slab_ids' => 'required|array|min:1',
                'slab_ids.*' => 'required|exists:slabs,id',
                'note' => 'nullable|string|max:255',
            ]);

            try {
                DB::beginTransaction();

                $slabs = \App\Models\Slab::whereIn('id', $request->slab_ids)->get();
                $totalAreaSqft = $slabs->sum('area_sqft');

                \App\Models\Slab::whereIn('id', $request->slab_ids)->update([
                    'warehouse_id' => $request->to_warehouse_id,
                    'rack_number' => null,
                    'slot_number' => null,
                ]);

                $sftUnit = \App\Models\ProductUnit::where('slug', 'sft')->first();
                $unitId = $sftUnit ? $sftUnit->id : $product->base_unit_id;

                $this->stockService->recordMovement(
                    $product,
                    $fromWarehouse,
                    $totalAreaSqft,
                    $unitId,
                    'subtraction',
                    'transfer',
                    null,
                    "Transfer to {$toWarehouse->name}. " . $request->note
                );

                $this->stockService->recordMovement(
                    $product,
                    $toWarehouse,
                    $totalAreaSqft,
                    $unitId,
                    'addition',
                    'transfer',
                    null,
                    "Transfer from {$fromWarehouse->name}. " . $request->note
                );

                DB::commit();
                return response()->json(['message' => 'Slabs transferred successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['message' => 'Transfer failed: ' . $e->getMessage()], 500);
            }
        }

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id' => 'required|exists:warehouses,id|different:from_warehouse_id',
            'quantity' => 'required|numeric|min:0.0001',
            'unit_id' => 'required|exists:units,id',
            'note' => 'nullable|string|max:255',
        ]);

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

    /**
     * Relocate stock between racks/slots in the same warehouse
     */
    public function relocate(Request $request)
    {
        $product = Product::findOrFail($request->product_id);
        $warehouse = Warehouse::findOrFail($request->warehouse_id);

        if ($product->isSlab()) {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'warehouse_id' => 'required|exists:warehouses,id',
                'slab_ids' => 'required|array|min:1',
                'slab_ids.*' => 'required|exists:slabs,id',
                'to_rack' => 'nullable|string',
                'to_slot' => 'nullable|string',
                'note' => 'nullable|string|max:255',
            ]);

            try {
                DB::beginTransaction();

                $slabs = \App\Models\Slab::whereIn('id', $request->slab_ids)->get();
                $totalAreaSqft = $slabs->sum('area_sqft');

                \App\Models\Slab::whereIn('id', $request->slab_ids)->update([
                    'rack_number' => $request->to_rack,
                    'slot_number' => $request->to_slot,
                ]);

                $sftUnit = \App\Models\ProductUnit::where('slug', 'sft')->first();
                $unitId = $sftUnit ? $sftUnit->id : $product->base_unit_id;

                $this->stockService->recordMovement(
                    $product,
                    $warehouse,
                    $totalAreaSqft,
                    $unitId,
                    'subtraction',
                    'relocation',
                    null,
                    "Relocated to: Rack " . ($request->to_rack ?? 'Any') . ", Slot " . ($request->to_slot ?? 'Any') . ". " . $request->note,
                    null,
                    $request->from_rack,
                    $request->from_slot
                );

                $this->stockService->recordMovement(
                    $product,
                    $warehouse,
                    $totalAreaSqft,
                    $unitId,
                    'addition',
                    'relocation',
                    null,
                    "Relocated from: Rack " . ($request->from_rack ?? 'Any') . ", Slot " . ($request->from_slot ?? 'Any') . ". " . $request->note,
                    null,
                    $request->to_rack,
                    $request->to_slot
                );

                DB::commit();
                return response()->json(['message' => 'Slabs relocated successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['message' => 'Relocation failed: ' . $e->getMessage()], 500);
            }
        }

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'quantity' => 'required|numeric|min:0.0001',
            'from_rack' => 'nullable|string',
            'from_slot' => 'nullable|string',
            'to_rack' => 'nullable|string',
            'to_slot' => 'nullable|string',
            'note' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            // 1. Subtract from source
            $this->stockService->recordMovement(
                $product,
                $warehouse,
                $request->quantity,
                $product->base_unit_id,
                'subtraction',
                'relocation',
                null,
                "Relocated to: Rack " . ($request->to_rack ?? 'Any') . ", Slot " . ($request->to_slot ?? 'Any') . ". " . $request->note,
                null,
                $request->from_rack,
                $request->from_slot
            );

            // 2. Add to target
            $this->stockService->recordMovement(
                $product,
                $warehouse,
                $request->quantity,
                $product->base_unit_id,
                'addition',
                'relocation',
                null,
                "Relocated from: Rack " . ($request->from_rack ?? 'Any') . ", Slot " . ($request->from_slot ?? 'Any') . ". " . $request->note,
                null,
                $request->to_rack,
                $request->to_slot
            );

            DB::commit();

            return response()->json(['message' => 'Stock relocated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Stock relocation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Relocation failed: ' . $e->getMessage()], 500);
        }
    }
}
