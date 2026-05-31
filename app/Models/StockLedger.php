<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockLedger extends Model
{
    protected $fillable = [
        'product_id',
        'warehouse_id',
        'quantity',
        'unit_id',
        'converted_quantity',
        'type',
        'reference_type',
        'reference_id',
        'note',
        'vendor_id'
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'converted_quantity' => 'decimal:4',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(ProductUnit::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
