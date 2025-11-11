import React from 'react';
import './Invoice.css';
// Import your logo image - adjust the path based on where you save it
// import logoImage from '../assets/modern-car-sale-logo.png';
// OR if you put it in public folder, you don't need to import

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
    commonlyCalled?: string;
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
    facilityAmount?: number;
    facilityProvider?: string;
    balanceAmount: number;
    rmvAmount?: number;
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
      <div className="invoice-page customer-invoice-modern">
        {/* Header with Logo */}
        <div className="modern-invoice-header">
          <div className="modern-logo-section">
            {/* 
              OPTION 1: If image is in public folder (e.g., public/images/logo.png)
              <img src="/images/modern-car-sale-logo.png" alt="Modern Car Sale Logo" style={{width: '100%', maxWidth: '600px', height: 'auto'}} />
              
              OPTION 2: If image is imported from src/assets folder
              <img src={logoImage} alt="Modern Car Sale Logo" style={{width: '100%', maxWidth: '600px', height: 'auto'}} />
            */}
            
            {/* Current Logo Image */}
            <img src="/images/modern-car-sale-logo.png.jpg" alt="Modern Car Sale Logo" style={{width: '100%', maxWidth: '600px', height: 'auto'}} />
            
            <p className="modern-tagline" style={{textAlign: 'center', marginTop: '5px', fontSize: '13px', color: '#2c5aa0', fontWeight: '500'}}>Importers of Brand New & Used Vehicles</p>
          </div>
          <div className="modern-location">
            <p className="modern-date" style={{fontSize: '16px', fontWeight: 'bold', marginTop: '20px'}}>Date: {invoiceData.date || today}</p>
          </div>
        </div>

        {/* Invoice Title */}
        <div className="modern-invoice-title">
          <h2 style={{textDecoration: 'underline', textAlign: 'center', fontSize: '28px', marginBottom: '10px'}}>INVOICE</h2>
        </div>

        {/* Main Content Wrapper with Center Padding */}
        <div style={{maxWidth: '800px', margin: '0 auto', padding: '0 40px'}}>
          {/* Vehicle Details in Left-Aligned Format */}
          <div className="modern-vehicle-section">
            <table className="modern-details-table" style={{width: '100%', borderCollapse: 'collapse'}}>
            <tbody>
              <tr>
                <td className="modern-label" style={{width: '250px', padding: '4px 0', fontSize: '16px'}}><strong>Vehicle Registered N0</strong></td>
                <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{invoiceData.vehicleRegisteredNo || 'UN REGISTERED'}</strong></td>
              </tr>
              <tr>
                <td className="modern-label" style={{padding: '4px 0', fontSize: '16px'}}><strong>Make</strong></td>
                <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{invoiceData.make}</strong></td>
              </tr>
              <tr>
                <td className="modern-label" style={{padding: '4px 0', fontSize: '16px'}}><strong>Model</strong></td>
                <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{invoiceData.model}</strong></td>
              </tr>
              {invoiceData.commonlyCalled && (
              <tr>
                  <td className="modern-label" style={{padding: '4px 0', fontSize: '16px'}}><strong>Commonly Called</strong></td>
                  <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{invoiceData.commonlyCalled}</strong></td>
              </tr>
              )}
              <tr>
                <td className="modern-label" style={{padding: '4px 0', fontSize: '16px'}}><strong>Color</strong></td>
                <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{invoiceData.colour}</strong></td>
              </tr>
              <tr>
                <td className="modern-label" style={{padding: '4px 0', fontSize: '16px'}}><strong>Fuel Type</strong></td>
                <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{invoiceData.fuelType}</strong></td>
              </tr>
              <tr>
                <td className="modern-label" style={{padding: '4px 0', fontSize: '16px'}}><strong>Year of Manufacture</strong></td>
                <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{invoiceData.yearOfManufacture}</strong></td>
              </tr>
              <tr>
                <td className="modern-label" style={{padding: '4px 0', fontSize: '16px'}}><strong>Chassis NO</strong></td>
                <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{invoiceData.chassisNo}</strong></td>
              </tr>
              <tr>
                <td className="modern-label" style={{padding: '4px 0', fontSize: '16px'}}><strong>Engine No</strong></td>
                <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{invoiceData.engineNo}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Details */}
        <div className="modern-financial-section" style={{marginTop: '15px'}}>
          <table className="modern-details-table" style={{width: '100%', borderCollapse: 'collapse'}}>
            <tbody>
              <tr>
                <td className="modern-label" style={{width: '250px', padding: '4px 0', fontSize: '16px'}}><strong>Total Amount</strong></td>
                <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{formatCurrency(invoiceData.totalAmount)}/-</strong></td>
              </tr>
              <tr>
                <td className="modern-label" style={{padding: '4px 0', fontSize: '16px'}}><strong>Advance Amount</strong></td>
                <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{formatCurrency(invoiceData.advanceAmount)}/-</strong></td>
              </tr>
              {invoiceData.facilityAmount && invoiceData.facilityAmount > 0 && (
                <tr>
                  <td className="modern-label" style={{padding: '4px 0', fontSize: '16px'}}><strong>Facility Amount</strong></td>
                  <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{formatCurrency(invoiceData.facilityAmount)}/- ({invoiceData.facilityProvider || 'Bank'})</strong></td>
                </tr>
              )}
              <tr>
                <td className="modern-label" style={{padding: '4px 0', fontSize: '16px'}}><strong>Balance Amount</strong></td>
                <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{formatCurrency(invoiceData.balanceAmount)}/- ({invoiceData.paymentMethod})</strong></td>
              </tr>
              {invoiceData.rmvAmount && invoiceData.rmvAmount > 0 && (
                <tr>
                  <td className="modern-label" style={{padding: '4px 0', fontSize: '16px'}}><strong>R M V Amount</strong></td>
                  <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>: <strong>{formatCurrency(invoiceData.rmvAmount)}/-</strong></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Delivery Information */}
        <div className="modern-delivery-section" style={{marginTop: '15px'}}>
          <table className="modern-details-table" style={{width: '100%', borderCollapse: 'collapse'}}>
            <tbody>
              <tr>
                <td className="modern-label" style={{width: '250px', padding: '4px 0', fontSize: '16px', verticalAlign: 'top'}}><strong>To be delivered</strong></td>
                <td className="modern-value" style={{padding: '4px 0', fontSize: '16px'}}>
                  : <strong>Mr. {invoiceData.customerName}</strong><br />
                  &nbsp;&nbsp;<strong>No:- {invoiceData.customerAddress}</strong><br />
                  &nbsp;&nbsp;<strong>NIC NO: {invoiceData.customerNIC}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Collection Notice */}
        <div className="modern-collection-notice" style={{marginTop: '10px', fontSize: '14px'}}>
          <p style={{margin: '5px 0'}}><strong>All Original Documents and Vehicle collected by Mr. {invoiceData.customerName} (NIC NO: {invoiceData.customerNIC})</strong></p>
          <p style={{color: '#e74c3c', fontWeight: 'bold', marginTop: '5px', margin: '5px 0'}}>Original Invoice Delivered</p>
        </div>

        {/* Signature Section */}
        <div className="modern-signature-section" style={{marginTop: '15px', display: 'flex', justifyContent: 'space-between'}}>
          <div className="partner-signature" style={{textAlign: 'center'}}>
            <div style={{borderBottom: '2px dotted #000', width: '180px', height: '40px', marginBottom: '5px'}}></div>
            <p style={{fontWeight: 'bold', fontSize: '14px', margin: '0'}}>Partner</p>
          </div>
          <div className="customer-signature" style={{textAlign: 'center'}}>
            <div style={{borderBottom: '2px dotted #000', width: '180px', height: '40px', marginBottom: '5px'}}></div>
            <p style={{fontWeight: 'bold', fontSize: '14px', margin: '0'}}>(Customer)</p>
            <p style={{fontSize: '12px', margin: '2px 0'}}>{invoiceData.customerName}</p>
            <p style={{fontSize: '12px', margin: '2px 0'}}>{invoiceData.customerNIC}</p>
          </div>
        </div>
        </div>
        {/* End of Main Content Wrapper */}

        {/* Footer */}
        <div className="invoice-footer" style={{marginTop: '10px', borderTop: '2px solid #000', paddingTop: '10px', pageBreakInside: 'avoid', display: 'block', visibility: 'visible'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
            <div style={{fontSize: '16px', fontWeight: 'bold', color: '#2c5aa0', minWidth: '200px'}}>
              MODERN CAR SALE
            </div>
            <div style={{textAlign: 'right', fontSize: '12px', minWidth: '300px'}}>
              <p style={{margin: '3px 0', fontWeight: 'bold'}}>📍 402, MAIN STREET MARUTHAMUNAI</p>
              <p style={{margin: '3px 0', fontWeight: 'bold'}}>
                📞 067 22 29 174 | ☎ 077 70 35 049 | ☎ 077 96 837 16 | ☎ 077 90 585 90
              </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInvoice;

