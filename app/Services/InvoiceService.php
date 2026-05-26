<?php

namespace App\Services;

use App\Models\Quotation;
use App\Models\Invoice;
use App\Services\InventoryService as ServicesInventoryService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceService
{
    protected $stockService;

    public function __construct(ServicesInventoryService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Create a new quotation.
     */
    public function createQuotation(array $data): Quotation
    {
        return DB::transaction(function () use ($data) {
            $quotation = Quotation::create([
                'quotation_number' => 'QUO-' . strtoupper(Str::random(8)),
                'contact_id' => $data['contact_id'],
                'contact_type' => $data['contact_type'],
                'subtotal' => $data['subtotal'],
                'discount_total' => $data['discount_total'] ?? 0,
                'tax_total' => $data['tax_total'] ?? 0,
                'grand_total' => $data['grand_total'],
                'status' => 'draft',
                'valid_until' => $data['valid_until'] ?? now()->addDays(7),
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
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

            return $quotation;
        });
    }

    /**
     * Convert a quotation to a sales invoice and deduct stock.
     */
    public function convertToInvoice(Quotation $quotation, array $additionalData = []): Invoice
    {
        if ($quotation->status === 'converted') {
            throw new \Exception("Quotation already converted to invoice.");
        }

        return DB::transaction(function () use ($quotation, $additionalData) {
            $invoice = Invoice::create([
                'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
                'quotation_id' => $quotation->id,
                'contact_id' => $quotation->contact_id,
                'contact_type' => $quotation->contact_type,
                'subtotal' => $quotation->subtotal,
                'discount_total' => $quotation->discount_total,
                'tax_total' => $quotation->tax_total,
                'grand_total' => $quotation->grand_total,
                'paid_amount' => $additionalData['paid_amount'] ?? 0,
                'due_amount' => $quotation->grand_total - ($additionalData['paid_amount'] ?? 0),
                'status' => ($additionalData['paid_amount'] ?? 0) >= $quotation->grand_total ? 'paid' : 'unpaid',
                'due_date' => $additionalData['due_date'] ?? now()->addDays(30),
                'notes' => $additionalData['notes'] ?? $quotation->notes,
            ]);

            foreach ($quotation->items as $item) {
                $invoice->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_id' => $item->unit_id,
                    'unit_price' => $item->unit_price,
                    'discount' => $item->discount,
                    'tax' => $item->tax,
                    'total_price' => $item->total_price,
                ]);

                // Deduct stock from Main Warehouse (simplifying for now, mapping can be dynamic)
                // In a real app, the warehouse would be chosen during invoice/delivery creation.
                $warehouseId = $additionalData['warehouse_id'] ?? 1; // Default to first warehouse
                $warehouse = \App\Models\Warehouse::findOrFail($warehouseId);

                $this->stockService->recordMovement(
                    $item->product,
                    $warehouse,
                    $item->quantity,
                    $item->unit_id,
                    'subtraction',
                    'sale',
                    $invoice->id,
                    "Sale Invoice #{$invoice->invoice_number}"
                );
            }

            $quotation->update(['status' => 'converted']);

            return $invoice;
        });
    }
}
