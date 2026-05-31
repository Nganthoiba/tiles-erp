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
            'category_id' => 'required|exists:categories,id',
            'base_unit_id' => 'required|exists:units,id',
            'attributes' => 'nullable|array',
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
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
            'category_id' => 'required|exists:categories,id',
            'base_unit_id' => 'required|exists:units,id',
            'attributes' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $product->update($validated);

        return response()->json($product);
    }
}
