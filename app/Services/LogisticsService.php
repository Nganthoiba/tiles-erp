<?php

namespace App\Services;

use App\Models\Delivery;
use App\Models\DeliveryItem;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LogisticsService
{
    /**
     * Create a delivery slip from a sales invoice.
     */
    public function createSlipFromInvoice(Invoice $invoice, array $data): Delivery
    {
        return DB::transaction(function () use ($invoice, $data) {
            $slip = Delivery::create([
                'delivery_number' => 'DEL-' . strtoupper(Str::random(8)),
                'sales_invoice_id' => $invoice->id,
                'contact_id' => $invoice->contact_id,
                'contact_type' => $invoice->contact_type,
                'status' => 'pending',
                'delivery_date' => $data['delivery_date'] ?? now(),
                'driver_name' => $data['driver_name'] ?? null,
                'vehicle_number' => $data['vehicle_number'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            // Copy items from invoice or subset if partial delivery is supported (limiting to full copy for now)
            foreach ($invoice->items as $item) {
                $slip->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_id' => $item->unit_id,
                ]);
            }

            return $slip;
        });
    }

    /**
     * Update delivery status.
     */
    public function updateStatus(Delivery $slip, string $status, array $extraData = []): Delivery
    {
        $slip->status = $status;

        if ($status === 'delivered') {
            $slip->delivered_at = now();
        }

        if (isset($extraData['driver_name'])) $slip->driver_name = $extraData['driver_name'];
        if (isset($extraData['vehicle_number'])) $slip->vehicle_number = $extraData['vehicle_number'];
        if (isset($extraData['notes'])) $slip->notes = $extraData['notes'];

        $slip->save();
        return $slip;
    }
}
