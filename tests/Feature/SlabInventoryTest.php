<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\Warehouse;
use App\Models\ProductUnit;
use App\Models\Slab;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SlabInventoryTest extends TestCase
{
    use RefreshDatabase;

    protected $category;
    protected $unit;
    protected $warehouse;
    protected $product;

    protected function setUp(): void
    {
        parent::setUp();

        // Create category
        $this->category = Category::create([
            'name' => 'Granite',
            'slug' => 'granite',
        ]);

        // Create unit
        $this->unit = ProductUnit::create([
            'name' => 'Square Feet',
            'slug' => 'sft',
            'is_base' => true,
        ]);

        // Create warehouse
        $this->warehouse = Warehouse::create([
            'name' => 'Main Warehouse',
            'slug' => 'main-warehouse',
            'code' => 'WH-MAIN',
            'location' => 'Block A',
        ]);

        // Create a slab product
        $this->product = Product::create([
            'name' => 'Black Galaxy Granite',
            'sku' => 'GG-BLK-GAL',
            'category_id' => $this->category->id,
            'base_unit_id' => $this->unit->id,
            'is_active' => true,
        ]);
    }

    public function test_slab_bulk_addition(): void
    {
        $payload = [
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'type' => 'addition',
            'rack_number' => 'R-01',
            'slot_number' => 'S-05',
            'slabs' => [
                [
                    'lot_number' => 'LOT-001',
                    'slab_number' => 'SL-01',
                    'length' => 3000,
                    'width' => 1800,
                    'thickness' => 20,
                    'unit' => 'mm',
                    'quantity' => 1
                ],
                [
                    'lot_number' => 'LOT-001',
                    'slab_number' => 'SL-02',
                    'length' => 120, // 120 cm
                    'width' => 60, // 60 cm
                    'thickness' => 2, // 2 cm
                    'unit' => 'cm',
                    'quantity' => 2
                ]
            ],
            'note' => 'Initial stock addition'
        ];

        $response = $this->postJson('/api/inventory/adjust', $payload);

        $response->assertStatus(200);

        // Verify slabs created in DB
        $this->assertDatabaseHas('slabs', [
            'product_id' => $this->product->id,
            'lot_number' => 'LOT-001',
            'slab_number' => 'SL-01',
            'length' => 3000,
            'width' => 1800,
            'area_sqft' => (3000 * 1800 * 1) / 92903.04,
            'status' => 'available'
        ]);

        $this->assertDatabaseHas('slabs', [
            'product_id' => $this->product->id,
            'lot_number' => 'LOT-001',
            'slab_number' => 'SL-02',
            'length' => 1200,
            'width' => 600,
            'area_sqft' => (1200 * 600 * 2) / 92903.04,
            'status' => 'available'
        ]);

        $expectedTotal = ((3000 * 1800 * 1) / 92903.04) + (((1200 * 600 * 2) / 92903.04));

        $this->assertDatabaseHas('stock_ledgers', [
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'type' => 'addition',
            'quantity' => $expectedTotal
        ]);
    }

    public function test_slab_selection_subtraction(): void
    {
        $slab1 = Slab::create([
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'lot_number' => 'LOT-001',
            'slab_number' => 'SL-01',
            'length' => 3000,
            'width' => 1800,
            'thickness' => 20,
            'quantity' => 1,
            'area_sqft' => (3000 * 1800 * 1) / 92903.04,
            'status' => 'available',
            'rack_number' => 'R-01',
            'slot_number' => 'S-05'
        ]);

        $slab2 = Slab::create([
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'lot_number' => 'LOT-001',
            'slab_number' => 'SL-02',
            'length' => 3000,
            'width' => 1800,
            'thickness' => 20,
            'quantity' => 1,
            'area_sqft' => (3000 * 1800 * 1) / 92903.04,
            'status' => 'available',
            'rack_number' => 'R-01',
            'slot_number' => 'S-05'
        ]);

        $payload = [
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'type' => 'subtraction',
            'slab_ids' => [$slab1->id],
            'note' => 'Selling slab 1'
        ];

        $response = $this->postJson('/api/inventory/adjust', $payload);

        $response->assertStatus(200);

        $this->assertEquals('sold', $slab1->fresh()->status);
        $this->assertEquals('available', $slab2->fresh()->status);

        $this->assertDatabaseHas('stock_ledgers', [
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'type' => 'subtraction',
            'quantity' => $slab1->area_sqft
        ]);
    }
}
