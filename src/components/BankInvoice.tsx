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
    deliverToTitle?: string;
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
      <div className="invoice-page" style={{
        fontFamily: 'Arial, sans-serif',
        backgroundImage: 'url(/images/moderncar_sheet.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        minHeight: '297mm',
        width: '210mm',
        padding: '20px'
      }}>
        
        {/* Main Content Wrapper with Center Padding */}
        <div style={{maxWidth: '800px', margin: '0 auto', padding: '0 40px', paddingTop: '180px'}}>
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
                    : <strong>{invoiceData.deliverToTitle || 'Mr.'} {invoiceData.deliverToName}</strong><br />
                    &nbsp;&nbsp;<strong>No:-{invoiceData.deliverToAddress}</strong><br />
                    &nbsp;&nbsp;<strong>NIC NO: {invoiceData.deliverToNIC}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signature Section */}
          <div style={{marginTop: '60px', marginBottom: '20px', display: 'flex', justifyContent: 'flex-end'}}>
            <div style={{textAlign: 'center', borderTop: '2px dotted #000', paddingTop: '10px', width: '300px'}}>
              <p style={{margin: '5px 0', fontSize: '18px', fontWeight: 'bold'}}>Modern Car Sale</p>
            </div>
          </div>

          {/* Footer spacing - contact info is in the letterhead background */}
          <div style={{marginBottom: '80px'}}></div>
        </div>
      </div>
    </div>
  );
};

export default BankInvoice;

