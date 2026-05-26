<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Quotation extends Model
{
    protected $fillable = [
        'quotation_number',
        'contact_id',
        'contact_type',
        'subtotal',
        'discount_total',
        'tax_total',
        'grand_total',
        'status',
        'valid_until',
        'notes'
    ];

    protected $casts = [
        'valid_until' => 'date',
        'subtotal' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'tax_total' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    public function contact(): MorphTo
    {
        return $this->morphTo();
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuotationItem::class);
    }
}
