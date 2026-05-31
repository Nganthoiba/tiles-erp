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
        Schema::table('stock_ledgers', function (Blueprint $table) {
            if (!Schema::hasColumn('stock_ledgers', 'rack_number')) {
                $table->string('rack_number')->nullable();
            }
            if (!Schema::hasColumn('stock_ledgers', 'slot_number')) {
                $table->string('slot_number')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_ledgers', function (Blueprint $table) {
            // $table->dropColumn(['rack_number', 'slot_number']);
        });
    }
};
