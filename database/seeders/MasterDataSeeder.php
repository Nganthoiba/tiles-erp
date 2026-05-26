<?php

namespace Database\Seeders;

use App\Modules\Inventory\Models\Category;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Unit;
use App\Modules\Inventory\Models\UnitConversion;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Units
        $piece = Unit::create(['name' => 'Piece', 'slug' => 'piece', 'is_base' => true]);
        $box = Unit::create(['name' => 'Box', 'slug' => 'box', 'is_base' => false]);
        $sft = Unit::create(['name' => 'Square Feet', 'slug' => 'sft', 'is_base' => false]);

        // 2. Categories
        $tiles = Category::create(['name' => 'Tiles', 'slug' => 'tiles', 'description' => 'Floor and Wall Tiles']);
        $sanitary = Category::create(['name' => 'Sanitaryware', 'slug' => 'sanitaryware', 'description' => 'Basins, Closets, etc.']);

        // 3. Warehouses
        Warehouse::create(['name' => 'Main Warehouse', 'slug' => 'main-wh', 'code' => 'MWH01', 'address' => 'Industrial Area, Block A']);
        Warehouse::create(['name' => 'Retail Showroom', 'slug' => 'showroom', 'code' => 'SR001', 'address' => 'City Center, Shop 42']);

        // 4. Sample Product: Kajaria Tiles (60x60 cm)
        // 1 Box = 4 Pieces (60x60 cm * 4 = 1.44 SQM ... but let's use SFT for simplicity as per user req)
        // Say 1 Box = 10 Pieces = 14.4 SFT
        $kajaria = Product::create([
            'category_id' => $tiles->id,
            'name' => 'Kajaria Glazed Ceramic Tiles (60x60 cm)',
            'sku' => 'T-KAJ-6060',
            'base_unit_id' => $piece->id,
            'attributes' => [
                'size' => '60x60 cm',
                'material' => 'Ceramic',
                'color' => 'Beige',
                'brand' => 'Kajaria'
            ]
        ]);

        // Unit Conversions: 1 Box -> 10 Pieces
        UnitConversion::create([
            'product_id' => $kajaria->id,
            'from_unit_id' => $box->id,
            'to_unit_id' => $piece->id,
            'factor' => 10.0000
        ]);

        // Unit Conversions: 1 Piece -> 1.44 SFT
        UnitConversion::create([
            'product_id' => $kajaria->id,
            'from_unit_id' => $piece->id,
            'to_unit_id' => $sft->id,
            'factor' => 1.4400
        ]);

        // Unit Conversions: 1 Box -> 14.4 SFT
        UnitConversion::create([
            'product_id' => $kajaria->id,
            'from_unit_id' => $box->id,
            'to_unit_id' => $sft->id,
            'factor' => 14.4000
        ]);
    }
}
