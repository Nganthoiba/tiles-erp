<?php

namespace Database\Seeders;

use App\Models\ProductUnit;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Units (mapped to 'units' table via ProductUnit model)
        ProductUnit::firstOrCreate(['slug' => 'piece'], ['name' => 'Piece', 'is_base' => true]);
        ProductUnit::firstOrCreate(['slug' => 'box'],   ['name' => 'Box',   'is_base' => false]);
        ProductUnit::firstOrCreate(['slug' => 'sft'],   ['name' => 'Square Feet', 'is_base' => false]);

        // 2. Warehouses
        Warehouse::firstOrCreate(
            ['code' => 'MWH01'],
            ['name' => 'Main Warehouse', 'slug' => 'main-wh', 'address' => 'Industrial Area, Block A']
        );
        Warehouse::firstOrCreate(
            ['code' => 'SR001'],
            ['name' => 'Retail Showroom', 'slug' => 'showroom', 'address' => 'City Center, Shop 42']
        );
    }
}
