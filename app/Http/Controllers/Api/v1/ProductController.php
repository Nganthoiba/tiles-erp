<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['category', 'baseUnit'])->latest()->paginate(10);
        return response()->json($products);
    }

    public function store(Request $request)
    {
        // Validation will be handled by StoreProductRequest in Phase 3 final
        $product = Product::create($request->all());
        return response()->json($product, 201);
    }

    public function show($id)
    {
        return response()->json(Product::with(['category', 'baseUnit', 'unitConversions.unit'])->findOrFail($id));
    }
}
