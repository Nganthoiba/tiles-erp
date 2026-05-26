<?php

namespace App\Models;



use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryItem extends Model
{
    protected $table = 'delivery_slip_items';
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
        return $this->belongsTo(Delivery::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(ProductProductUnit::class);
    }
}
