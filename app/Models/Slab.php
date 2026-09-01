<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Slab extends Model
{
    protected $fillable = [
        'product_id',
        'stock_ledger_id',
        'sales_invoice_id',
        'lot_number',
        'slab_number',
        'length',
        'width',
        'thickness',
        'quantity',
        'area_sqft',
        'warehouse_id',
        'rack_number',
        'slot_number',
        'status',
    ];

    protected $casts = [
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'thickness' => 'decimal:2',
        'quantity' => 'integer',
        'area_sqft' => 'decimal:4',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function stockLedger(): BelongsTo
    {
        return $this->belongsTo(StockLedger::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'sales_invoice_id');
    }
}
