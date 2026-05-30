<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Vendor::latest()->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'landmark' => 'nullable|string|max:255',
            'vendor_group' => 'required|in:Manufacturer,Supplier,Distributor',
            'vendor_category' => 'required|in:Medium,Local,Global,Small,Large,Specialty',
        ]);

        $vendor = Vendor::create($validated);
        return response()->json($vendor, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Vendor $vendor)
    {
        return response()->json($vendor);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'landmark' => 'nullable|string|max:255',
            'vendor_group' => 'required|in:Manufacturer,Supplier,Distributor',
            'vendor_category' => 'required|in:Medium,Local,Global,Small,Large,Specialty',
            'is_active' => 'boolean',
        ]);

        $vendor->update($validated);
        return response()->json($vendor);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
