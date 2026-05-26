<?php

namespace App\Services\Inventory;

use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Unit;
use App\Modules\Inventory\Models\UnitConversion;
use App\Modules\Inventory\Models\StockLedger;
use App\Modules\Inventory\Models\Warehouse;

class StockService
{
    /**
     * Record a stock movement in the ledger.
     */
    public function recordMovement(
        Product $product,
        Warehouse $warehouse,
        float $quantity,
        int $unitId,
        string $type, // 'addition' or 'subtraction'
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $note = null
    ): StockLedger {
        // Convert to base unit for the ledger
        $convertedQuantity = $this->convertToBase($product, $quantity, $unitId);

        return StockLedger::create([
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'quantity' => $quantity,
            'unit_id' => $unitId,
            'converted_quantity' => $convertedQuantity,
            'type' => $type,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'note' => $note,
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
        if ($unitId === $product->base_unit_id) {
            return $quantity;
        }

        $conversion = UnitConversion::where('product_id', $product->id)
            ->where('from_unit_id', $unitId)
            ->where('to_unit_id', $product->base_unit_id)
            ->first();

        if (!$conversion) {
            // Reverse lookup: Maybe there's a conversion from base to this unit
            $reverse = UnitConversion::where('product_id', $product->id)
                ->where('from_unit_id', $product->base_unit_id)
                ->where('to_unit_id', $unitId)
                ->first();

            if ($reverse) {
                return $quantity / $reverse->factor;
            }

            throw new \Exception("No unit conversion found for product {$product->sku} from unit ID {$unitId} to base unit.");
        }

        return $quantity * $conversion->factor;
    }

    /**
     * Convert quantity from the product's base unit to a target unit.
     */
    public function convertFromBase(Product $product, float $baseQuantity, int $unitId): float
    {
        if ($unitId === $product->base_unit_id) {
            return $baseQuantity;
        }

        $conversion = UnitConversion::where('product_id', $product->id)
            ->where('from_unit_id', $product->base_unit_id)
            ->where('to_unit_id', $unitId)
            ->first();

        if (!$conversion) {
            // Reverse lookup: Maybe there's a conversion from this unit to base
            $reverse = UnitConversion::where('product_id', $product->id)
                ->where('from_unit_id', $unitId)
                ->where('to_unit_id', $product->base_unit_id)
                ->first();

            if ($reverse) {
                return $baseQuantity / $reverse->factor;
            }

            throw new \Exception("No unit conversion found for product {$product->sku} from base unit to unit ID {$unitId}.");
        }

        return $baseQuantity * $conversion->factor;
    }
}
