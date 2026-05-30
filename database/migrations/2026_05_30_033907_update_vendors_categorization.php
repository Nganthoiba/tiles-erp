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
        Schema::table('vendors', function (Blueprint $table) {
            $table->renameColumn('category', 'vendor_group');
            $table->enum('vendor_category', ['Medium', 'Local', 'Global', 'Small', 'Large', 'Specialty'])->default('Local')->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->renameColumn('vendor_group', 'category');
            $table->dropColumn('vendor_category');
        });
    }
};
