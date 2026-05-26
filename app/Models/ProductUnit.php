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

class Invoice extends Model
{
    protected $table = 'sales_invoices';
    protected $fillable = [];
}

class InvoiceItem extends Model
{
    protected $table = 'sales_invoice_items';
}

class Delivery extends Model
{
    protected $table = 'deliveries';
}

class DeliveryItem extends Model
{
    protected $table = 'delivery_items';
}
