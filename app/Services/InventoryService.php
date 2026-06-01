<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\UnitConversion;
use App\Models\StockLedger;
use App\Models\Warehouse;

class InventoryService
{
    protected $conversionService;

    public function __construct(UnitConversionService $conversionService)
    {
        $this->conversionService = $conversionService;
    }
    public function recordMovement(
        Product $product,
        Warehouse $warehouse,
        float $quantity,
        int $unitId,
        string $type, // 'addition' or 'subtraction'
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $note = null,
        ?int $vendorId = null,
        ?string $rackNumber = null,
        ?string $slotNumber = null
    ): StockLedger {
        // Convert to base unit for the ledger
        $convertedQuantity = $this->convertToBase($product, $quantity, $unitId);

        return StockLedger::create([
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'rack_number' => $rackNumber,
            'slot_number' => $slotNumber,
            'quantity' => $quantity,
            'unit_id' => $unitId,
            'converted_quantity' => $convertedQuantity,
            'type' => $type,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'note' => $note,
            'vendor_id' => $vendorId,
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Get current stock for a product, optionally filtered by warehouse and unit.
     */
    public function getCurrentStock(Product $product, ?Warehouse $warehouse = null, ?int $unitId = null): float
    {
        $query = StockLedger::where('product_id', $product->id);

        if ($warehouse) {
            $query->where('warehouse_id', $warehouse->id);
        }

        $additions = (clone $query)->where('type', 'addition')->sum('converted_quantity');
        $subtractions = (clone $query)->where('type', 'subtraction')->sum('converted_quantity');

        $baseBalance = $additions - $subtractions;

        if ($unitId) {
            return $this->convertFromBase($product, $baseBalance, $unitId);
        }

        return $baseBalance;
    }

    /**
     * Convert a quantity from one unit to another for a given product.
     * 
     * @param Product $product
     * @param float $quantity
     * @param int $fromUnitId
     * @param int $toUnitId
     * @return float
     */
    public function convert(Product $product, float $quantity, int $fromUnitId, int $toUnitId): float
    {
        if ($fromUnitId === $toUnitId) {
            return $quantity;
        }

        // 1. Convert from source unit to base unit
        $baseQuantity = $this->convertToBase($product, $quantity, $fromUnitId);

        // 2. Convert from base unit to target unit
        return $this->convertFromBase($product, $baseQuantity, $toUnitId);
    }

    /**
     * Convert quantity to the product's base unit.
     */
    public function convertToBase(Product $product, float $quantity, int $unitId): float
    {
        return $this->conversionService->convertToBase($product, $quantity, $unitId);
    }

    /**
     * Convert quantity from the product's base unit to a target unit.
     */
    public function convertFromBase(Product $product, float $baseQuantity, int $unitId): float
    {
        return $this->conversionService->convertFromBase($product, $baseQuantity, $unitId);
    }
}
