<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('slabs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('stock_ledger_id')->nullable()->constrained('stock_ledgers')->onDelete('set null');
            $table->foreignId('sales_invoice_id')->nullable()->constrained('sales_invoices')->onDelete('set null');
            $table->string('lot_number')->nullable();
            $table->string('slab_number')->nullable();
            $table->decimal('length', 10, 2); // Length in mm
            $table->decimal('width', 10, 2); // Width in mm
            $table->decimal('thickness', 10, 2); // Thickness in mm
            $table->integer('quantity')->default(1); // Quantity count (typically 1)
            $table->decimal('area_sqft', 12, 4); // Pre-computed area in Sq Ft for convenience
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->string('rack_number')->nullable();
            $table->string('slot_number')->nullable();
            $table->string('status')->default('available'); // available, sold
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('slabs');
    }
};
