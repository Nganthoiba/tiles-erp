<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 0. Truncate existing mappings to avoid ID mismatch between Types and Categories
        DB::table('product_type_attributes')->truncate();

        // 1. Drop foreign key on old table name
        Schema::table('product_type_attributes', function (Blueprint $table) {
            $table->dropForeign(['product_type_id']);
        });

        // 2. Rename product_type_attributes to category_attributes
        Schema::rename('product_type_attributes', 'category_attributes');

        // 3. Modify category_attributes table: rename column
        Schema::table('category_attributes', function (Blueprint $table) {
            $table->renameColumn('product_type_id', 'category_id');
        });

        // 4. Add back foreign key for category_id
        Schema::table('category_attributes', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
        });

        // 5. Update products table: remove product_type_id
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['product_type_id']);
            $table->dropColumn('product_type_id');
        });

        // 6. Drop product_types table
        Schema::dropIfExists('product_types');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('product_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('product_type_id')->nullable()->after('category_id')->constrained()->onDelete('set null');
        });

        Schema::table('category_attributes', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->renameColumn('category_id', 'product_type_id');
        });

        Schema::table('category_attributes', function (Blueprint $table) {
            $table->foreign('product_type_id')->references('id')->on('product_types')->onDelete('cascade');
        });

        Schema::rename('category_attributes', 'product_type_attributes');
    }
};
