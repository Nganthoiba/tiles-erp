<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasAuditLog;

class Category extends Model
{
    use HasAuditLog;

    protected $fillable = ['name', 'slug', 'description'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function specAttributes()
    {
        return $this->belongsToMany(SpecAttribute::class, 'category_attributes', 'category_id', 'spec_attribute_id')
            ->withPivot('is_required')
            ->withTimestamps();
    }
}
