<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Invoice;
use App\Services\LogisticsService;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    protected $logisticsService;

    public function __construct(LogisticsService $logisticsService)
    {
        $this->logisticsService = $logisticsService;
    }

    /**
     * List all delivery slips.
     */
    public function index()
    {
        $slips = Delivery::with(['contact', 'invoice', 'items.product'])->latest()->paginate(10);
        return response()->json($slips);
    }

    /**
     * Create a delivery slip for an invoice.
     */
    public function store(Request $request)
    {
        $request->validate([
            'sales_invoice_id' => 'required|exists:sales_invoices,id',
            'delivery_date' => 'nullable|date',
            'driver_name' => 'nullable|string',
            'vehicle_number' => 'nullable|string',
        ]);

        $invoice = Invoice::findOrFail($request->sales_invoice_id);
        $slip = $this->logisticsService->createSlipFromInvoice($invoice, $request->all());

        return response()->json([
            'message' => 'Delivery slip generated successfully.',
            'data' => $slip->load('items')
        ], 201);
    }

    /**
     * Update delivery status.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,out_for_delivery,delivered,failed',
        ]);

        $slip = Delivery::findOrFail($id);
        $updatedSlip = $this->logisticsService->updateStatus($slip, $request->status, $request->all());

        return response()->json([
            'message' => 'Delivery status updated successfully.',
            'data' => $updatedSlip
        ]);
    }
}
