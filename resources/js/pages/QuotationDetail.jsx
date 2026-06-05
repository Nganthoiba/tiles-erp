import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import { FiPrinter, FiEdit3, FiArrowLeft, FiCheckCircle, FiDownload } from 'react-icons/fi';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';

export default function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      const response = await api.get(`/api/quotations/${id}`);
      setQuotation(response.data);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      Swal.fire('Error', 'Could not load quotation details', 'error');
      navigate('/quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToInvoice = async () => {
    const { value: paidAmount } = await Swal.fire({
      title: 'Convert to Invoice',
      text: 'Enter initial paid amount (if any):',
      input: 'number',
      inputLabel: 'Paid Amount (₹)',
      inputValue: 0,
      showCancelButton: true,
      confirmButtonText: 'Convert & Deduct Stock',
      inputValidator: (value) => {
        if (!value && value !== 0) return 'You need to enter a value!';
      }
    });

    if (paidAmount !== undefined) {
      try {
        await api.post(`/api/quotations/${id}/convert`, { paid_amount: paidAmount });
        Swal.fire('Success', 'Quotation converted to Invoice and stock adjusted.', 'success');
        fetchQuotation(); // Refresh status
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Conversion failed', 'error');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('quotation-card');
    setExporting(true);
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Quotation_${quotation.quotation_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      setExporting(false);
    }).catch(err => {
      console.error('PDF Error:', err);
      setExporting(false);
      Swal.fire('Error', 'Could not generate PDF', 'error');
    });
  };

  if (loading) return (
    <DashboardLayout>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    </DashboardLayout>
  );

  if (!quotation) return null;

  return (
    <DashboardLayout>
      <div className="container-fluid py-3 px-md-4 no-print">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <button onClick={() => navigate('/quotations')} className="btn btn-outline-secondary btn-sm rounded-circle p-2 shadow-none border-0 bg-light">
              <FiArrowLeft />
            </button>
            <h4 className="fw-bold mb-0">Quotation {quotation.quotation_number}</h4>
          </div>
          <div className="d-flex gap-2">
            <button onClick={handleDownloadPDF} className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2 px-3 fw-semibold" disabled={exporting}>
              {exporting ? <span className="spinner-border spinner-border-sm"></span> : <FiDownload />} PDF
            </button>
            <button onClick={handlePrint} className="btn btn-dark btn-sm d-flex align-items-center gap-2 px-3 fw-semibold">
              <FiPrinter /> Print
            </button>
            {quotation.status === 'draft' && (
              <>
                <Link to={`/quotations/${id}/edit`} className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 px-3 fw-semibold">
                  <FiEdit3 /> Edit
                </Link>
                <button onClick={handleConvertToInvoice} className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 fw-semibold shadow-sm">
                  <FiCheckCircle /> Convert to Invoice
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container py-4 print-container">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden" id="quotation-card">
          <div className="card-body p-5">
            {/* Header Section */}
            <div className="row mb-5 border-bottom pb-4">
              <div className="col-6">
                <h2 className="fw-bold text-primary mb-2">QUOTATION</h2>
                <div className="h5 text-dark mb-0">{quotation.quotation_number}</div>
                <div className="text-secondary smaller">Date: {new Date(quotation.created_at).toLocaleDateString()}</div>
              </div>
              <div className="col-6 text-end">
                <div className="fw-bold h4 mb-1">Tiles ERP</div>
                <div className="text-secondary smaller">Imphal, Manipur</div>
                <div className="text-secondary smaller">Email: sales@tileserp.com</div>
              </div>
            </div>

            {/* Billing Section */}
            <div className="row mb-5">
              <div className="col-6">
                <div className="text-uppercase text-secondary smaller fw-bold mb-2 ls-wide">Customer Details</div>
                <div className="h5 fw-bold text-dark mb-1">{quotation.contact?.name}</div>
                <div className="text-secondary smaller">{quotation.contact?.address || 'No address provided'}</div>
                <div className="text-secondary smaller mt-1">Phone: {quotation.contact?.phone}</div>
              </div>
              <div className="col-6 text-end">
                <div className="text-uppercase text-secondary smaller fw-bold mb-2 ls-wide">Quotation Validity</div>
                <div className="h5 fw-bold text-primary mb-1">
                    {quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : 'N/A'}
                </div>
                <div className="badge bg-light text-dark border text-uppercase smaller px-3 py-2 mt-2">{quotation.status}</div>
              </div>
            </div>

            {/* Items Table */}
            <div className="table-responsive mb-5">
              <table className="table table-borderless">
                <thead className="bg-light">
                  <tr className="text-secondary smaller text-uppercase fw-bold border-bottom">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3">Item Description</th>
                    <th className="py-3 text-center">Qty</th>
                    <th className="py-3 text-end">Unit Price</th>
                    <th className="py-3 text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, index) => (
                    <tr key={item.id} className="border-bottom-custom">
                      <td className="py-4 px-3 text-secondary">{index + 1}</td>
                      <td className="py-4">
                        <div className="fw-bold text-dark">{item.product?.name}</div>
                        <div className="smaller text-muted">SKU: {item.product?.sku}</div>
                      </td>
                      <td className="py-4 text-center">{Number(item.quantity).toLocaleString()} {item.unit?.name}</td>
                      <td className="py-4 text-end">₹{Number(item.unit_price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="py-4 text-end fw-bold text-dark">₹{Number(item.total_price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Block */}
            <div className="row justify-content-end pt-4">
              <div className="col-md-5">
                <div className="bg-light rounded-4 p-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary small">Subtotal</span>
                    <span className="fw-bold text-dark">₹{Number(quotation.subtotal).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-danger opacity-75">
                    <span className="text-secondary small">Discount</span>
                    <span className="fw-bold">- ₹{Number(quotation.discount_total).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-4 border-bottom pb-2">
                    <span className="text-secondary small">Tax (GST)</span>
                    <span className="fw-bold text-dark">₹{Number(quotation.tax_total).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="h5 fw-bold text-dark mb-0">Grand Total</span>
                    <span className="h4 fw-bold text-primary mb-0">₹{Number(quotation.grand_total).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Notes */}
            {quotation.notes && (
              <div className="mt-5 pt-5 border-top">
                <div className="text-uppercase text-secondary smaller fw-bold mb-2 ls-wide">Terms & Conditions</div>
                <div className="text-muted smaller" style={{whiteSpace: 'pre-line'}}>{quotation.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
          .card { box-shadow: none !important; border: 1px solid #eee !important; border-radius: 0 !important; }
          body { background: white !important; }
        }
        .border-bottom-custom {
            border-bottom: 1px dashed #f0f0f0;
        }
        .table > :not(caption) > * > * {
            box-shadow: none !important;
        }
        .ls-wide {
            letter-spacing: 0.05em;
        }
      `}</style>
    </DashboardLayout>
  );
}
