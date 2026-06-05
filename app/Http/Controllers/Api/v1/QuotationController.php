<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Quotation;
use App\Models\Customer;
use App\Models\Dealer;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuotationController extends Controller
{
    protected $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function index(Request $request)
    {
        $query = Quotation::latest();

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where('quotation_number', 'like', "%{$search}%")
                ->orWhereHasMorph('contact', [Customer::class, Dealer::class], function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $quotation = $this->invoiceService->createQuotation($request->all());
        return response()->json($quotation->load('items'), 201);
    }

    public function show($id)
    {
        $quotation = Quotation::with(['contact', 'items.product', 'items.unit'])->findOrFail($id);
        return response()->json($quotation);
    }

    public function update(Request $request, $id)
    {
        $quotation = Quotation::findOrFail($id);

        if ($quotation->status !== 'draft') {
            return response()->json(['message' => 'Only draft quotations can be updated.'], 422);
        }

        // Logic to update quotation items and totals
        // For simplicity, we'll use a transaction and re-create items
        DB::transaction(function () use ($quotation, $request) {
            $quotation->update($request->only([
                'contact_id',
                'contact_type',
                'subtotal',
                'discount_total',
                'tax_total',
                'grand_total',
                'valid_until',
                'notes'
            ]));

            if ($request->has('items')) {
                $quotation->items()->delete();
                foreach ($request->items as $item) {
                    $quotation->items()->create([
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'unit_id' => $item['unit_id'],
                        'unit_price' => $item['unit_price'],
                        'discount' => $item['discount'] ?? 0,
                        'tax' => $item['tax'] ?? 0,
                        'total_price' => $item['total_price'],
                    ]);
                }
            }
        });

        return response()->json($quotation->load('items'));
    }

    public function destroy($id)
    {
        $quotation = Quotation::findOrFail($id);

        if ($quotation->status !== 'draft') {
            return response()->json(['message' => 'Only draft quotations can be deleted.'], 422);
        }

        $quotation->delete();
        return response()->json(['message' => 'Quotation deleted successfully.']);
    }

    public function convertToInvoice(Request $request, $id)
    {
        $quotation = Quotation::findOrFail($id);

        try {
            $invoice = $this->invoiceService->convertToInvoice($quotation, $request->all());
            return response()->json([
                'message' => 'Quotation converted to invoice successfully.',
                'invoice' => $invoice
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
