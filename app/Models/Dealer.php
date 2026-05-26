<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Dealer extends Model
{
    protected $fillable = ['name', 'company_name', 'email', 'phone', 'address', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function quotations(): MorphMany
    {
        return $this->morphMany('App\Models\Quotation', 'contact');
    }

    public function invoices(): MorphMany
    {
        return $this->morphMany('App\Models\Invoice', 'contact');
    }
}
