<?php

namespace App\Modules\Logistics\Models;

use App\Modules\Sales\Models\SalesInvoice;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DeliverySlip extends Model
{
    protected $fillable = [
        'delivery_number',
        'sales_invoice_id',
        'contact_id',
        'contact_type',
        'status',
        'delivery_date',
        'delivered_at',
        'driver_name',
        'vehicle_number',
        'notes'
    ];

    protected $casts = [
        'delivery_date' => 'date',
        'delivered_at' => 'datetime',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(SalesInvoice::class, 'sales_invoice_id');
    }

    public function contact(): MorphTo
    {
        return $this->morphTo();
    }

    public function items(): HasMany
    {
        return $this->hasMany(DeliverySlipItem::class);
    }
}
