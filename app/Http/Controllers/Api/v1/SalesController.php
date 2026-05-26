<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Quotation;
use App\Models\Invoice;
use App\Services\Sales\InvoiceService;
use Illuminate\Http\Request;

class SalesController extends Controller
{
    protected $salesService;

    public function __construct(InvoiceService $salesService)
    {
        $this->salesService = $salesService;
    }

    /**
     * List all quotations.
     */
    public function quotations(Request $request)
    {
        $quotations = Quotation::with(['contact', 'items.product'])->latest()->paginate(10);
        return response()->json($quotations);
    }

    /**
     * Store a new quotation.
     */
    public function storeQuotation(Request $request)
    {
        $request->validate([
            'contact_id' => 'required',
            'contact_type' => 'required|in:App\Models\Customer,App\Models\Dealer',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.0001',
            'items.*.unit_id' => 'required|exists:units,id',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total_price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'grand_total' => 'required|numeric|min:0',
        ]);

        $quotation = $this->salesService->createQuotation($request->all());

        return response()->json([
            'message' => 'Quotation created successfully.',
            'data' => $quotation->load('items')
        ], 201);
    }

    /**
     * List all invoices.
     */
    public function invoices(Request $request)
    {
        $invoices = Invoice::with(['contact', 'items.product'])->latest()->paginate(10);
        return response()->json($invoices);
    }

    /**
     * Convert a quotation to an invoice.
     */
    public function convertToInvoice(Request $request, $id)
    {
        $quotation = Quotation::findOrFail($id);

        try {
            $invoice = $this->salesService->convertToInvoice($quotation, $request->all());
            return response()->json([
                'message' => 'Invoice generated and stock updated successfully.',
                'data' => $invoice->load('items')
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
