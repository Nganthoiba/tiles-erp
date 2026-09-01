<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductUnit extends Model
{
    protected $table = 'units';
    protected $fillable = ['name', 'slug', 'is_base'];

    protected $casts = [
        'is_base' => 'boolean',
    ];
}
