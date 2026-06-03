<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index()
    {
        return response()->json(Brand::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:brands,name',
        ]);

        $brand = Brand::create([
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
        ]);

        return response()->json($brand, 201);
    }
}
