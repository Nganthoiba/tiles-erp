<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Quotation;
use App\Services\InvoiceService;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    protected $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function index()
    {
        $invoices = Invoice::with(['contact', 'items.product'])->latest()->paginate(10);
        return response()->json($invoices);
    }

    public function convertFromQuotation(Request $request, $id)
    {
        $quotation = Quotation::findOrFail($id);
        try {
            $invoice = $this->invoiceService->convertToInvoice($quotation, $request->all());
            return response()->json($invoice->load('items'));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
