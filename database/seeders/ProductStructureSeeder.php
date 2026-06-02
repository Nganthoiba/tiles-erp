<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Category;
use App\Models\SpecAttribute;
use App\Models\Brand;
use Illuminate\Support\Str;

class ProductStructureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Brands
        $brands = ['Kajaria', 'Somany', 'Jaguar', 'Hindware', 'Cera'];
        foreach ($brands as $brand) {
            Brand::firstOrCreate(['slug' => Str::slug($brand)], ['name' => $brand]);
        }

        // 2. Create Attributes
        $attributes = [
            ['name' => 'Length (mm)', 'data_type' => 'number', 'system_slug' => 'len_mm'],
            ['name' => 'Width (mm)', 'data_type' => 'number', 'system_slug' => 'wid_mm'],
            ['name' => 'Thickness (mm)', 'data_type' => 'number', 'system_slug' => 'thk_mm'],
            ['name' => 'Height (mm)', 'data_type' => 'number', 'system_slug' => 'hgt_mm'],
            ['name' => 'Pieces per Box', 'data_type' => 'number', 'system_slug' => 'pcs_box'],
            ['name' => 'Weight (kg)', 'data_type' => 'number', 'system_slug' => 'weight_kg'],
            ['name' => 'Finish', 'data_type' => 'string', 'system_slug' => 'finish'],
            ['name' => 'SQM per Box', 'data_type' => 'number', 'system_slug' => null],
            ['name' => 'Material', 'data_type' => 'string', 'system_slug' => 'material'],
            ['name' => 'Color', 'data_type' => 'string', 'system_slug' => 'color'],
            ['name' => 'Mounting Type', 'data_type' => 'string', 'system_slug' => null],
            ['name' => 'Origin', 'data_type' => 'string', 'system_slug' => null],
            ['name' => 'Variant', 'data_type' => 'string', 'system_slug' => null],
        ];

        $attrModels = [];
        foreach ($attributes as $attr) {
            $attrModels[$attr['name']] = SpecAttribute::updateOrCreate(
                ['name' => $attr['name']],
                [
                    'slug' => Str::slug($attr['name']),
                    'data_type' => $attr['data_type'],
                    'system_slug' => $attr['system_slug']
                ]
            );
        }

        // CATEGORIES
        $tile = Category::updateOrCreate(['slug' => 'tile'], ['name' => 'Tile', 'description' => 'Ceramic, Vitrified, and Wall tiles']);
        $tile->specAttributes()->sync([
            $attrModels['Length (mm)']->id => ['is_required' => true],
            $attrModels['Width (mm)']->id => ['is_required' => true],
            $attrModels['Thickness (mm)']->id => ['is_required' => false],
            $attrModels['Pieces per Box']->id => ['is_required' => true],
            $attrModels['Finish']->id => ['is_required' => true],
        ]);

        // SANITARY
        $sanitary = Category::updateOrCreate(['slug' => 'sanitary'], ['name' => 'Sanitary', 'description' => 'Basins, Commodes, and Faucets']);
        $sanitary->specAttributes()->sync([
            $attrModels['Length (mm)']->id => ['is_required' => false],
            $attrModels['Width (mm)']->id => ['is_required' => false],
            $attrModels['Height (mm)']->id => ['is_required' => false],
            $attrModels['Material']->id => ['is_required' => true],
            $attrModels['Color']->id => ['is_required' => true],
        ]);

        // GRANITE
        $granite = Category::updateOrCreate(['slug' => 'granite'], ['name' => 'Granite', 'description' => 'Granite and Marble slabs']);
        $granite->specAttributes()->sync([
            $attrModels['Length (mm)']->id => ['is_required' => true],
            $attrModels['Width (mm)']->id => ['is_required' => true],
            $attrModels['Thickness (mm)']->id => ['is_required' => true],
            $attrModels['Finish']->id => ['is_required' => true],
        ]);
    }
}
