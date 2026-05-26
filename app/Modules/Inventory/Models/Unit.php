<?php

namespace App\Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    protected $fillable = ['name', 'slug', 'is_base'];

    protected $casts = [
        'is_base' => 'boolean',
    ];
}
