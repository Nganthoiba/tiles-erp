<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecAttribute extends Model
{
    protected $fillable = ['name', 'slug', 'data_type'];

    public function productTypes()
    {
        return $this->belongsToMany(ProductType::class, 'product_type_attributes')
            ->withPivot('is_required')
            ->withTimestamps();
    }
}
