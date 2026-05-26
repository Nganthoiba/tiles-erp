<?php

namespace App\Modules\Logistics\Models;

use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Unit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliverySlipItem extends Model
{
    protected $fillable = [
        'delivery_slip_id',
        'product_id',
        'quantity',
        'unit_id'
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
    ];

    public function deliverySlip(): BelongsTo
    {
        return $this->belongsTo(DeliverySlip::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}
