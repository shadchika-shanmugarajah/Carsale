import React from 'react';
import './Invoice.css';

interface BankInvoiceProps {
  invoiceData: {
    invoiceNumber?: string;
    date: string;
    bankName: string;
    bankBranch: string;
    vehicleRegisteredNo?: string;
    make: string;
    model: string;
    yearOfManufacture: number;
    chassisNo: string;
    engineNo: string;
    fuelType: string;
    colour: string;
    countryOfOrigin: string;
    totalAmount: number;
    advanceAmount: number;
    loanAmount: number;
    deliverToName: string;
    deliverToAddress: string;
    deliverToNIC: string;
    sellerName: string;
    sellerContact: string;
    sellerNIC: string;
  };
}

const BankInvoice: React.FC<BankInvoiceProps> = ({ invoiceData }) => {
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
      <div className="invoice-page" style={{fontFamily: 'Arial, sans-serif', padding: '20px'}}>
        {/* Header with Logo */}
        <div className="modern-header" style={{textAlign: 'center', marginBottom: '20px'}}>
          <div className="modern-logo-section" style={{marginBottom: '10px'}}>
            <img src="/images/modern-car-sale-logo.png.jpg" alt="Modern Car Sale Logo" style={{width: '100%', maxWidth: '600px', height: 'auto'}} />
            
            <p className="modern-tagline" style={{textAlign: 'center', marginTop: '5px', fontSize: '13px', color: '#2c5aa0', fontWeight: '500'}}>Importers of Brand New & Used Vehicles</p>
          </div>
        </div>

        {/* Main Content Wrapper with Center Padding */}
        <div style={{maxWidth: '800px', margin: '0 auto', padding: '0 40px'}}>
          {/* Date and Bank Details Section */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px'}}>
            {/* Bank Details - Left Side */}
            <div style={{textAlign: 'left'}}>
              <p style={{margin: '0', fontSize: '16px', fontWeight: 'bold'}}>The Manager,</p>
              <p style={{margin: '0', fontSize: '16px', fontWeight: 'bold'}}>{invoiceData.bankName},</p>
              <p style={{margin: '0', fontSize: '16px', fontWeight: 'bold'}}>{invoiceData.bankBranch}.</p>
            </div>
            
            {/* Date - Right Side */}
            <div style={{textAlign: 'right'}}>
              <p style={{margin: '0', fontSize: '16px', fontWeight: 'bold'}}>Date: {invoiceData.date || today}</p>
            </div>
          </div>

          {/* Invoice Title */}
          <div style={{textAlign: 'center', marginBottom: '30px'}}>
            <h2 style={{fontSize: '24px', fontWeight: 'bold', textDecoration: 'underline', margin: '0'}}>INVOICE</h2>
          </div>

          {/* Vehicle Details */}
          <div className="modern-vehicle-section">
            <table className="modern-details-table" style={{width: '100%', borderCollapse: 'collapse'}}>
              <tbody>
                <tr>
                  <td className="modern-label" style={{width: '250px', padding: '8px 0', fontSize: '16px'}}><strong>Vehicle Registered N0</strong></td>
                  <td className="modern-value" style={{padding: '8px 0', fontSize: '16px'}}>: <strong>{invoiceData.vehicleRegisteredNo || 'UNREGISTER'}</strong></td>
                </tr>
                <tr>
                  <td className="modern-label" style={{padding: '8px 0', fontSize: '16px'}}><strong>Make</strong></td>
                  <td className="modern-value" style={{padding: '8px 0', fontSize: '16px'}}>: <strong>{invoiceData.make}</strong></td>
                </tr>
                <tr>
                  <td className="modern-label" style={{padding: '8px 0', fontSize: '16px'}}><strong>Model</strong></td>
                  <td className="modern-value" style={{padding: '8px 0', fontSize: '16px'}}>: <strong>{invoiceData.model}</strong></td>
                </tr>
                <tr>
                  <td className="modern-label" style={{padding: '8px 0', fontSize: '16px'}}><strong>Year of Manufacture</strong></td>
                  <td className="modern-value" style={{padding: '8px 0', fontSize: '16px'}}>: <strong>{invoiceData.yearOfManufacture}</strong></td>
                </tr>
                <tr>
                  <td className="modern-label" style={{padding: '8px 0', fontSize: '16px'}}><strong>Chassis NO</strong></td>
                  <td className="modern-value" style={{padding: '8px 0', fontSize: '16px'}}>: <strong>{invoiceData.chassisNo}</strong></td>
                </tr>
                <tr>
                  <td className="modern-label" style={{padding: '8px 0', fontSize: '16px'}}><strong>Engine No</strong></td>
                  <td className="modern-value" style={{padding: '8px 0', fontSize: '16px'}}>: <strong>{invoiceData.engineNo}</strong></td>
                </tr>
                <tr>
                  <td className="modern-label" style={{padding: '8px 0', fontSize: '16px'}}><strong>Fuel Type</strong></td>
                  <td className="modern-value" style={{padding: '8px 0', fontSize: '16px'}}>: <strong>{invoiceData.fuelType}</strong></td>
                </tr>
                <tr>
                  <td className="modern-label" style={{padding: '8px 0', fontSize: '16px'}}><strong>Colour</strong></td>
                  <td className="modern-value" style={{padding: '8px 0', fontSize: '16px'}}>: <strong>{invoiceData.colour}</strong></td>
                </tr>
                <tr>
                  <td className="modern-label" style={{padding: '8px 0', fontSize: '16px'}}><strong>Country of Origin</strong></td>
                  <td className="modern-value" style={{padding: '8px 0', fontSize: '16px'}}>: <strong>{invoiceData.countryOfOrigin}</strong></td>
                </tr>
                <tr>
                  <td className="modern-label" style={{padding: '8px 0', fontSize: '16px'}}><strong>Total Amount</strong></td>
                  <td className="modern-value" style={{padding: '8px 0', fontSize: '16px'}}>: <strong>{formatCurrency(invoiceData.totalAmount)}/-</strong></td>
                </tr>
                <tr>
                  <td className="modern-label" style={{padding: '8px 0', fontSize: '16px'}}><strong>Advance Amount</strong></td>
                  <td className="modern-value" style={{padding: '8px 0', fontSize: '16px'}}>: <strong>{formatCurrency(invoiceData.advanceAmount)}/-</strong></td>
                </tr>
                <tr>
                  <td className="modern-label" style={{padding: '8px 0', fontSize: '16px'}}><strong>Loan Amount</strong></td>
                  <td className="modern-value" style={{padding: '8px 0', fontSize: '16px'}}>: <strong>{formatCurrency(invoiceData.loanAmount)}/-</strong></td>
                </tr>
                <tr>
                  <td className="modern-label" style={{paddingTop: '20px', fontSize: '16px', verticalAlign: 'top'}}><strong>To be delivered</strong></td>
                  <td className="modern-value" style={{paddingTop: '20px', fontSize: '16px'}}>
                    : <strong>Mr. {invoiceData.deliverToName}</strong><br />
                    &nbsp;&nbsp;<strong>No:-{invoiceData.deliverToAddress}</strong><br />
                    &nbsp;&nbsp;<strong>NIC NO: {invoiceData.deliverToNIC}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Section */}
          <div style={{marginTop: '60px', marginBottom: '20px', display: 'flex', justifyContent: 'flex-end'}}>
            <div style={{textAlign: 'center', borderTop: '2px dotted #000', paddingTop: '10px', width: '300px'}}>
              <p style={{margin: '5px 0', fontSize: '18px', fontWeight: 'bold'}}>Modern Car Sale</p>
            </div>
          </div>

          {/* Company Contact Details */}
          <div style={{marginTop: '20px', textAlign: 'center'}}>
            <p style={{margin: '5px 0', fontSize: '14px', fontWeight: 'bold'}}>📍 402, MAIN STREET MARUTHAMUNAI</p>
            <p style={{margin: '5px 0', fontSize: '14px', fontWeight: 'bold'}}>📞 067 22 29 174 | ☎ 077 70 35 049 | ☎ 077 96 837 16 | ☎ 077 90 585 90</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankInvoice;

