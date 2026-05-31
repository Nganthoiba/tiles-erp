<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index(Request $request)
    {
        $query = Product::with(['category', 'baseUnit'])->latest();

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $products = $query->paginate(10);

        $products->getCollection()->transform(function ($product) {
            $product->stock_balance = $this->inventoryService->getCurrentStock($product);
            return $product;
        });

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'base_unit_id' => 'required|exists:units,id',
            'attributes' => 'nullable|array',
            'conversions' => 'nullable|array',
            'conversions.*.from_unit_id' => 'required|exists:units,id',
            'conversions.*.factor' => 'required|numeric|min:0.0001',
        ]);

        $product = Product::create($validated);

        if ($request->has('conversions')) {
            foreach ($request->conversions as $conv) {
                $product->unitConversions()->create([
                    'from_unit_id' => $conv['from_unit_id'],
                    'to_unit_id' => $product->base_unit_id,
                    'factor' => $conv['factor'],
                ]);
            }
        }

        return response()->json($product->load('unitConversions'), 201);
    }

    public function show($id)
    {
        return response()->json(Product::with(['category', 'baseUnit', 'unitConversions.fromUnit', 'unitConversions.toUnit'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku,' . $id,
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'base_unit_id' => 'required|exists:units,id',
            'attributes' => 'nullable|array',
            'is_active' => 'boolean',
            'conversions' => 'nullable|array',
            'conversions.*.from_unit_id' => 'required|exists:units,id',
            'conversions.*.factor' => 'required|numeric|min:0.0001',
        ]);

        $product->update($validated);

        if ($request->has('conversions')) {
            $product->unitConversions()->delete();
            foreach ($request->conversions as $conv) {
                $product->unitConversions()->create([
                    'from_unit_id' => $conv['from_unit_id'],
                    'to_unit_id' => $product->base_unit_id,
                    'factor' => $conv['factor'],
                ]);
            }
        }

        return response()->json($product->load('unitConversions'));
    }
}
