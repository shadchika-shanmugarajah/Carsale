import React from 'react';
import './Invoice.css';

interface CustomerInvoiceProps {
  invoiceData: {
    invoiceNumber: string;
    date: string;
    customerName: string;
    customerAddress: string;
    customerContact: string;
    customerNIC: string;
    vehicleRegisteredNo?: string;
    make: string;
    model: string;
    yearOfManufacture: number;
    chassisNo: string;
    engineNo: string;
    fuelType: string;
    colour: string;
    countryOfOrigin: string;
    vehicleCost: number;
    additionalExpenses?: {
      fuel?: number;
      duty?: number;
      driverCharge?: number;
      clearanceCharge?: number;
      demurrage?: number;
      tax?: number;
      [key: string]: number | undefined;
    };
    totalAmount: number;
    advanceAmount: number;
    balanceAmount: number;
    paymentMethod: string;
    paymentStatus?: string;
    sellerName: string;
    sellerContact: string;
    sellerNIC: string;
    currency?: string;
  };
}

const CustomerInvoice: React.FC<CustomerInvoiceProps> = ({ invoiceData }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="invoice-container">
      <div className="invoice-page customer-invoice">
        {/* Header with Logo */}
        <div className="invoice-header">
          <div className="company-logo-section">
            <div className="logo-design">
              <svg width="150" height="50" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                {/* Modern Car Logo */}
                <defs>
                  <linearGradient id="carGradientCustomer" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#e74c3c', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#c0392b', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                {/* Car silhouette */}
                <path d="M 20 35 Q 25 25, 35 25 L 55 25 Q 60 25, 65 30 L 75 30 Q 80 30, 85 35 L 85 42 Q 85 45, 82 45 L 78 45 Q 77 48, 74 48 Q 71 48, 70 45 L 35 45 Q 34 48, 31 48 Q 28 48, 27 45 L 23 45 Q 20 45, 20 42 Z" 
                      fill="url(#carGradientCustomer)" stroke="#000" strokeWidth="0.5"/>
                {/* Wheels */}
                <circle cx="31" cy="45" r="4" fill="#2c3e50" stroke="#000" strokeWidth="0.5"/>
                <circle cx="74" cy="45" r="4" fill="#2c3e50" stroke="#000" strokeWidth="0.5"/>
                <circle cx="31" cy="45" r="2" fill="#7f8c8d"/>
                <circle cx="74" cy="45" r="2" fill="#7f8c8d"/>
                {/* Windshield */}
                <path d="M 40 30 L 48 26 L 60 26 L 68 30 Z" fill="#3498db" opacity="0.4"/>
                {/* Speed lines */}
                <line x1="10" y1="28" x2="18" y2="28" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="33" x2="16" y2="33" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
                <line x1="6" y1="38" x2="14" y2="38" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="company-info">
              <h1 className="company-name-invoice">Modern Car Sale</h1>
              <p className="company-tagline">Importers of Brand New & Used Vehicles</p>
            </div>
          </div>
          <div className="invoice-title-section">
            <h2 className="invoice-title">SALES INVOICE</h2>
            <p className="invoice-number">Invoice #: {invoiceData.invoiceNumber}</p>
            <p className="invoice-date">Date: {invoiceData.date || today}</p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="customer-info-section">
          <h3 className="section-heading">Bill To:</h3>
          <div className="customer-details">
            <p><strong>{invoiceData.customerName}</strong></p>
            <p>{invoiceData.customerAddress}</p>
            <p>Contact: {invoiceData.customerContact}</p>
            <p>NIC: {invoiceData.customerNIC}</p>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="vehicle-section">
          <h3 className="section-heading">Vehicle Details</h3>
          <table className="details-table">
            <tbody>
              <tr>
                <td className="label-col"><strong>Vehicle Registered N0</strong></td>
                <td className="value-col">: {invoiceData.vehicleRegisteredNo || 'UNREGISTER'}</td>
              </tr>
              <tr>
                <td className="label-col"><strong>Make</strong></td>
                <td className="value-col">: {invoiceData.make}</td>
              </tr>
              <tr>
                <td className="label-col"><strong>Model</strong></td>
                <td className="value-col">: {invoiceData.model}</td>
              </tr>
              <tr>
                <td className="label-col"><strong>Year of Manufacture</strong></td>
                <td className="value-col">: {invoiceData.yearOfManufacture}</td>
              </tr>
              <tr>
                <td className="label-col"><strong>Chassis NO</strong></td>
                <td className="value-col">: {invoiceData.chassisNo}</td>
              </tr>
              <tr>
                <td className="label-col"><strong>Engine No</strong></td>
                <td className="value-col">: {invoiceData.engineNo}</td>
              </tr>
              <tr>
                <td className="label-col"><strong>Fuel Type</strong></td>
                <td className="value-col">: {invoiceData.fuelType}</td>
              </tr>
              <tr>
                <td className="label-col"><strong>Colour</strong></td>
                <td className="value-col">: {invoiceData.colour}</td>
              </tr>
              <tr>
                <td className="label-col"><strong>Country of Origin</strong></td>
                <td className="value-col">: {invoiceData.countryOfOrigin}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount Summary */}
        <div className="cost-section">
          <h3 className="section-heading">Amount Summary</h3>
          <table className="cost-table">
            <tbody>
              <tr className="total-row">
                <td><strong>Total Amount</strong></td>
                <td className="text-right"><strong>{formatCurrency(invoiceData.totalAmount)}</strong></td>
              </tr>
              <tr className="payment-row">
                <td>Advance Payment</td>
                <td className="text-right"><span style={{color: '#27ae60'}}>({formatCurrency(invoiceData.advanceAmount)})</span></td>
              </tr>
              <tr className="balance-row">
                <td><strong>Balance Due</strong></td>
                <td className="text-right"><strong>{formatCurrency(invoiceData.balanceAmount)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Information */}
        <div className="payment-info-section">
          <div className="payment-status-box">
            <div className="payment-method-row">
              <strong>Payment Method:</strong> 
              <span className="payment-method-badge">{invoiceData.paymentMethod}</span>
            </div>
            <div className="payment-status-row">
              <strong>Payment Status:</strong> 
              <span className={`payment-status-badge ${invoiceData.balanceAmount === 0 ? 'status-fully-paid' : 'status-partial'}`}>
                {invoiceData.balanceAmount === 0 ? '✅ FULLY PAID' : '⏳ PARTIAL PAYMENT'}
              </span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="terms-section">
          <h4>Terms & Conditions:</h4>
          <ul>
            <li>Vehicle ownership transfers upon full payment</li>
            <li>All taxes and duties are included</li>
          </ul>
        </div>

        {/* Signature Section */}
        <div className="signature-section">
          <div className="signature-line">
            <div className="signature-placeholder"></div>
            <div className="signature-info">
              <p className="signature-name">{invoiceData.sellerName}</p>
              <p className="signature-id">({invoiceData.sellerNIC})</p>
              <p className="signature-title">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <div className="footer-contact">
            <p>📍 402, MAIN STREET MARUTHAMUNAI</p>
            <p>📞 {invoiceData.sellerContact} | ☎ 077 70 35 049 | ☎ 077 96 837 16 | ☎ 077 90 585 90</p>
          </div>
          <div className="footer-note">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInvoice;

