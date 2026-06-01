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
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('product_type_id')->nullable()->after('category_id')->constrained()->onDelete('set null');
            $table->foreignId('brand_id')->nullable()->after('product_type_id')->constrained()->onDelete('set null');
            $table->string('barcode')->nullable()->after('sku')->unique();
            $table->decimal('purchase_price', 15, 2)->default(0)->after('base_unit_id');
            $table->decimal('sale_price', 15, 2)->default(0)->after('purchase_price');
            $table->string('status')->default('active')->after('sale_price'); // active, discontinued, out_of_stock
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['product_type_id']);
            $table->dropForeign(['brand_id']);
            $table->dropColumn(['product_type_id', 'brand_id', 'barcode', 'purchase_price', 'sale_price', 'status']);
        });
    }
};
