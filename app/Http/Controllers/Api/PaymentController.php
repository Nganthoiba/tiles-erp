<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Customers\Models\Payment;
use App\Modules\Sales\Models\SalesInvoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * Record a payment for an invoice or a general contact payment.
     */
    public function store(Request $request)
    {
        $request->validate([
            'sales_invoice_id' => 'nullable|exists:sales_invoices,id',
            'contact_id' => 'required',
            'contact_type' => 'required|in:App\Modules\Customers\Models\Customer,App\Modules\Customers\Models\Dealer',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'payment_date' => 'required|date',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {
            $payment = Payment::create($request->all());

            // If linked to an invoice, update invoice dues
            if ($request->sales_invoice_id) {
                $invoice = SalesInvoice::findOrFail($request->sales_invoice_id);
                $invoice->paid_amount += $request->amount;
                $invoice->due_amount = max(0, $invoice->grand_total - $invoice->paid_amount);

                if ($invoice->due_amount <= 0) {
                    $invoice->status = 'paid';
                } elseif ($invoice->paid_amount > 0) {
                    $invoice->status = 'partial';
                }

                $invoice->save();
            }

            return response()->json([
                'message' => 'Payment recorded successfully.',
                'data' => $payment
            ], 201);
        });
    }

    /**
     * List recent payments.
     */
    public function index()
    {
        $payments = Payment::with('contact', 'invoice')->latest()->paginate(10);
        return response()->json($payments);
    }
}
