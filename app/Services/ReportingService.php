<?php

namespace App\Services;

use App\Models\StockLedger;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

class ReportingService
{
    /**
     * Get sales summary for a given period.
     */
    public function getSalesSummary(string $startDate, string $endDate)
    {
        return Invoice::whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(grand_total) as total_sales'),
                DB::raw('SUM(paid_amount) as total_collected'),
                DB::raw('SUM(due_amount) as total_pending'),
                DB::raw('COUNT(*) as invoice_count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    /**
     * Get stock levels for all products.
     */
    public function getStockReport()
    {
        return DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('units', 'products.base_unit_id', '=', 'units.id')
            ->leftJoin('stock_ledgers', 'products.id', '=', 'stock_ledgers.product_id')
            ->select(
                'products.name',
                'products.sku',
                'categories.name as category',
                'units.name as base_unit',
                DB::raw("SUM(CASE WHEN stock_ledgers.type = 'addition' THEN stock_ledgers.converted_quantity ELSE 0 END) - 
                         SUM(CASE WHEN stock_ledgers.type = 'subtraction' THEN stock_ledgers.converted_quantity ELSE 0 END) as current_stock")
            )
            ->where('products.is_active', true)
            ->groupBy('products.id', 'products.name', 'products.sku', 'categories.name', 'units.name')
            ->get();
    }

    /**
     * Get due summary grouped by contacts.
     */
    public function getDueReport()
    {
        return Invoice::select(
            'contact_type',
            'contact_id',
            DB::raw('SUM(due_amount) as total_due'),
            DB::raw('COUNT(*) as pending_invoices')
        )
            ->where('due_amount', '>', 0)
            ->groupBy('contact_type', 'contact_id')
            ->with('contact')
            ->get();
    }
}
