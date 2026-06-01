<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductType extends Model
{
    protected $fillable = ['name', 'slug', 'description'];

    public function specAttributes()
    {
        return $this->belongsToMany(SpecAttribute::class, 'product_type_attributes')
            ->withPivot('is_required')
            ->withTimestamps();
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
