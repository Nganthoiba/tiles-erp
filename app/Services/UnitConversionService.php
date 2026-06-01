<?php

namespace App\Services;

use App\Models\Product;
use App\Models\UnitConversion;
use App\Models\SpecAttribute;

class UnitConversionService
{
    /**
     * Convert a quantity to the base inventory unit.
     */
    public function convertToBase(Product $product, float $quantity, $fromUnitId): float
    {
        if ((int)$fromUnitId === (int)$product->base_unit_id) {
            return $quantity;
        }

        $fromUnit = \App\Models\ProductUnit::find($fromUnitId);
        if (!$fromUnit) return $quantity;

        return $this->performConversion($product, $quantity, $fromUnit->slug, 'to_base');
    }

    /**
     * Perform the actual conversion logic.
     */
    protected function performConversion(Product $product, float $amount, string $fromSlug, string $direction): float
    {
        $baseUnit = \App\Models\ProductUnit::find($product->base_unit_id);
        $toSlug = $baseUnit ? $baseUnit->slug : 'piece';

        if ($fromSlug === $toSlug) return $amount;

        // Fetch specs needed for calculation
        $specs = $this->getProductSpecs($product);

        // Logic for Piece -> Base
        $pieceFactor = $this->getPieceToBaseFactor($product, $specs, $toSlug);

        if ($fromSlug === 'piece') {
            return $amount * $pieceFactor;
        }

        if ($fromSlug === 'box') {
            $pcsBox = (float)($specs['pcs_box'] ?? 1);
            return $amount * $pcsBox * $pieceFactor;
        }

        $areaSqMm = $this->calculatePieceArea($specs);

        if ($fromSlug === 'sqm') {
            if ($areaSqMm <= 0) return $amount;
            $pcs = ($amount * 1000000) / $areaSqMm;
            return $pcs * $pieceFactor;
        }

        if ($fromSlug === 'sqft') {
            if ($areaSqMm <= 0) return $amount;
            $pcs = ($amount * 92903.04) / $areaSqMm;
            return $pcs * $pieceFactor;
        }

        // Direct DB lookup for other units
        $direct = UnitConversion::where('product_id', $product->id)
            ->where('from_unit_id', function ($q) use ($fromSlug) {
                $q->select('id')->from('units')->where('slug', $fromSlug);
            })
            ->where('to_unit_id', $product->base_unit_id)
            ->first();

        return $direct ? $amount * $direct->factor : $amount;
    }

    protected function getProductSpecs(Product $product): array
    {
        return $product->specValues()
            ->join('spec_attributes', 'product_spec_values.spec_attribute_id', '=', 'spec_attributes.id')
            ->whereNotNull('spec_attributes.system_slug')
            ->pluck('value', 'spec_attributes.system_slug')
            ->toArray();
    }

    protected function calculatePieceArea(array $specs): float
    {
        $l = (float)($specs['len_mm'] ?? 0);
        $w = (float)($specs['wid_mm'] ?? 0);
        return $l * $w;
    }

    protected function getPieceToBaseFactor(Product $product, array $specs, string $baseSlug): float
    {
        if ($baseSlug === 'piece') return 1.0;

        if ($baseSlug === 'sqm') {
            $area = $this->calculatePieceArea($specs);
            return $area > 0 ? $area / 1000000 : 1.0;
        }

        if ($baseSlug === 'sqft') {
            $area = $this->calculatePieceArea($specs);
            return $area > 0 ? $area / 92903.04 : 1.0;
        }

        return 1.0;
    }

    /**
     * Convert from base unit to a target unit.
     */
    public function convertFromBase(Product $product, float $baseAmount, $targetUnitId): float
    {
        // Simple inverse for now to maintain consistency
        $factor = $this->convertToBase($product, 1.0, $targetUnitId);
        return $factor > 0 ? $baseAmount / $factor : $baseAmount;
    }
}
