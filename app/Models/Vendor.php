<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasAuditLog;

class Vendor extends Model
{
    use HasAuditLog;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'landmark',
        'vendor_group',
        'vendor_category',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the stock movements associated with this vendor.
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockLedger::class);
    }
}
