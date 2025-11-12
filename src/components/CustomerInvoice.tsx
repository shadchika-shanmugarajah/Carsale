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
    customerTitle?: string;
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
      <div className="invoice-page customer-invoice-modern" style={{
        backgroundImage: 'url(/images/moderncar_sheet.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        minHeight: '297mm',
        width: '210mm'
      }}>
        
        {/* Date - positioned in top right area */}
        <div style={{
          position: 'absolute',
          top: '180px',
          right: '40px',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          Date: {invoiceData.date || today}
        </div>

        {/* Invoice Title */}
        <div style={{
          textAlign: 'center',
          paddingTop: '220px',
          marginBottom: '20px'
        }}>
          <h2 style={{
            textDecoration: 'underline',
            fontSize: '28px',
            margin: '0',
            fontWeight: 'bold'
          }}>INVOICE</h2>
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
                  : <strong>{invoiceData.customerTitle || 'Mr.'} {invoiceData.customerName}</strong><br />
                  &nbsp;&nbsp;<strong>No:- {invoiceData.customerAddress}</strong><br />
                  &nbsp;&nbsp;<strong>NIC NO: {invoiceData.customerNIC}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Collection Notice */}
        <div className="modern-collection-notice" style={{marginTop: '10px', fontSize: '14px'}}>
          <p style={{margin: '5px 0'}}><strong>All Original Documents and Vehicle collected by {invoiceData.customerTitle || 'Mr.'} {invoiceData.customerName} (NIC NO: {invoiceData.customerNIC})</strong></p>
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
        
        {/* Footer - Contact info is already in the letterhead background, so we just add spacing */}
        <div style={{marginBottom: '80px'}}></div>
      </div>
    </div>
  );
};

export default CustomerInvoice;

