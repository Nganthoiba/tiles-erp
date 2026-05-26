<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Quotation;
use App\Services\InvoiceService;
use Illuminate\Http\Request;

class QuotationController extends Controller
{
    protected $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function index()
    {
        $quotations = Quotation::with(['contact', 'items.product'])->latest()->paginate(10);
        return response()->json($quotations);
    }

    public function store(Request $request)
    {
        $quotation = $this->invoiceService->createQuotation($request->all());
        return response()->json($quotation->load('items'), 201);
    }
}
