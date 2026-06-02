<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecAttribute extends Model
{
    protected $fillable = ['name', 'slug', 'data_type'];

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_attributes')
            ->withPivot('is_required')
            ->withTimestamps();
    }
}
