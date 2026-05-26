<?php

namespace App\Modules\Customers\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Customer extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'address', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function quotations(): MorphMany
    {
        return $this->morphMany('App\Modules\Sales\Models\Quotation', 'contact');
    }

    public function invoices(): MorphMany
    {
        return $this->morphMany('App\Modules\Sales\Models\SalesInvoice', 'contact');
    }
}
