<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Reports\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Get sales dashboard data.
     */
    public function salesSummary(Request $request)
    {
        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', now()->toDateString());

        $summary = $this->reportService->getSalesSummary($startDate, $endDate);

        return response()->json($summary);
    }

    /**
     * Get stock report.
     */
    public function stockReport()
    {
        $report = $this->reportService->getStockReport();
        return response()->json($report);
    }

    /**
     * Get due report.
     */
    public function dueReport()
    {
        $report = $this->reportService->getDueReport();
        return response()->json($report);
    }
}
