<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductSpecValue extends Model
{
    protected $fillable = ['product_id', 'spec_attribute_id', 'value'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function attribute()
    {
        return $this->belongsTo(SpecAttribute::class, 'spec_attribute_id');
    }
}
