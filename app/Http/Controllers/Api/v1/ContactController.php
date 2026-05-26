<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Dealer;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * List all customers.
     */
    public function customers(Request $request)
    {
        $customers = Customer::latest()->paginate(10);
        return response()->json($customers);
    }

    /**
     * Store a new customer.
     */
    public function storeCustomer(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $customer = Customer::create($request->all());

        return response()->json([
            'message' => 'Customer created successfully.',
            'data' => $customer
        ], 201);
    }

    /**
     * List all dealers.
     */
    public function dealers(Request $request)
    {
        $dealers = Dealer::latest()->paginate(10);
        return response()->json($dealers);
    }

    /**
     * Store a new dealer.
     */
    public function storeDealer(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $dealer = Dealer::create($request->all());

        return response()->json([
            'message' => 'Dealer created successfully.',
            'data' => $dealer
        ], 201);
    }

    /**
     * Get a specific customer's details including dues.
     */
    public function showCustomer($id)
    {
        $customer = Customer::with(['invoices' => function ($q) {
            $q->where('due_amount', '>', 0);
        }])->findOrFail($id);

        $totalDue = $customer->invoices->sum('due_amount');

        return response()->json([
            'customer' => $customer,
            'total_due' => $totalDue
        ]);
    }
}
