import React, { useState } from 'react';
import BankInvoice from './BankInvoice';
import CustomerInvoice from './CustomerInvoice';
import './Billing.css';

// Import interfaces from Dashboard
interface VehicleOrder {
  id: string;
  model: string;
  year: number;
  country: string;
  orderDate: string;
  status: 'ordered' | 'shipped' | 'clearing' | 'completed';
  totalCost: number;
  expenses: {
    vehicleCost: number;
    fuel: number;
    duty: number;
    driverCharge: number;
    clearanceCharge: number;
    demurrage: number;
    tax: number;
    customExpenses: { [key: string]: number };
  };
  currency: 'USD' | 'JPY' | 'EUR' | 'GBP' | 'LKR';
  supplier?: string;
  vehicleNumber?: string;
  lcAmount?: number;
  lcBank?: string;
  vinNumber?: string;
  licensePlateNumber?: string;
  customBasicInfo?: { [key: string]: string };
}

interface LeasingDetails {
  leasingCompanyId: string;
  leasingCompanyName: string;
  leasingCompanyBranch?: string;
  leaseReferenceNo: string;
  downPayment: number;
  leasingAmount: number;
  monthlyInstallment: number;
  tenure: number;
  startDate: string;
  endDate: string;
  interestRate?: number;
}

interface Transaction {
  id: string;
  customerId: string;
  vehicleId?: string;
  type: 'reservation' | 'sale' | 'leasing' | 'refund';
  status: 'pending' | 'partial_paid' | 'fully_paid' | 'completed' | 'overdue' | 'cancelled';
  invoiceNumber?: string;
  reservationDate?: string;
  completionDate?: string;
  currency: string;
  vehicleDetails: {
    brand: string;
    model: string;
    year: number;
    color: string;
    vin?: string;
    licensePlate?: string;
  };
  pricing: {
    vehiclePrice: number;
    taxes: number;
    fees: number;
    discount: number;
    totalAmount: number;
  };
  totalPaid: number;
  balanceRemaining: number;
  payments?: any[];
  notes?: string;
  paymentMode?: 'cash' | 'bank_transfer' | 'leasing';
  isLeasing?: boolean;
  leasingDetails?: LeasingDetails;
}

interface Customer {
  id: string;
  name: string;
  contact: string;
  email?: string;
  address?: string;
  nic?: string;
}

interface InventoryItem {
  id: string;
  model: string;
  brand: string;
  year: number;
  color: string;
  vin?: string;
  licensePlate?: string;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  engineSize?: string;
  purchasePrice: number;
  sellingPrice?: number;
  currency: string;
}

interface BillingProps {
  transactions?: Transaction[];
  customers?: Customer[];
  inventoryItems?: InventoryItem[];
  vehicleOrders?: VehicleOrder[];
}

const Billing: React.FC<BillingProps> = ({ 
  transactions = [], 
  customers = [], 
  inventoryItems = [],
  vehicleOrders = []
}) => {
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [invoiceType, setInvoiceType] = useState<'customer' | 'bank'>('customer');
  const [showInvoice, setShowInvoice] = useState(false);

  const getCustomerById = (customerId: string): Customer | undefined => {
    return customers.find(c => c.id === customerId);
  };

  const getInventoryById = (vehicleId: string): InventoryItem | undefined => {
    return inventoryItems.find(i => i.id === vehicleId);
  };

  const getOrderById = (orderId: string): VehicleOrder | undefined => {
    return vehicleOrders.find(o => o.id === orderId);
  };

  const handleGenerateInvoice = () => {
    if (!selectedTransactionId && !selectedOrderId) {
      alert('Please select a transaction or order to generate invoice');
      return;
    }
    setShowInvoice(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    setShowInvoice(false);
  };

  const handleNewInvoice = () => {
    setSelectedTransactionId('');
    setSelectedOrderId('');
    setShowInvoice(false);
  };

  // Prepare invoice data from selected transaction or order
  const prepareInvoiceData = () => {
    const transaction = transactions.find(t => t.id === selectedTransactionId);
    const order = vehicleOrders.find(o => o.id === selectedOrderId);

    if (transaction) {
      const customer = getCustomerById(transaction.customerId);
      const vehicle = transaction.vehicleId ? getInventoryById(transaction.vehicleId) : undefined;

      const isLeasing = transaction.payments?.some(p => p.paymentMethod === 'leasing') || transaction.isLeasing || false;
      const hasBank = isLeasing || invoiceType === 'bank';

      return {
        invoiceNumber: transaction.invoiceNumber || `INV-${transaction.id}`,
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        // Customer Info
        customerName: customer?.name || 'Unknown Customer',
        customerAddress: customer?.address || 'N/A',
        customerContact: customer?.contact || 'N/A',
        customerNIC: customer?.nic || 'N/A',
        // Bank Info (for leasing) - Use leasing details if available
        bankName: hasBank ? (transaction.leasingDetails?.leasingCompanyName || 'Hatton National Bank (HNB)') : '',
        bankBranch: hasBank ? (transaction.leasingDetails?.leasingCompanyBranch || 'Kalawanchikudy') : '',
        // Vehicle Details
        vehicleRegisteredNo: vehicle?.licensePlate || transaction.vehicleDetails.licensePlate || '',
        make: transaction.vehicleDetails.brand,
        model: transaction.vehicleDetails.model,
        yearOfManufacture: transaction.vehicleDetails.year,
        chassisNo: vehicle?.vin || transaction.vehicleDetails.vin || 'N/A',
        engineNo: vehicle?.engineSize || 'N/A',
        fuelType: vehicle?.fuelType?.toUpperCase() || 'PETROL',
        colour: transaction.vehicleDetails.color.toUpperCase(),
        countryOfOrigin: 'JAPAN',
        // Financial Details
        vehicleCost: transaction.pricing.vehiclePrice,
        additionalExpenses: {
          taxes: transaction.pricing.taxes,
          fees: transaction.pricing.fees,
          discount: transaction.pricing.discount,
        },
        totalAmount: transaction.pricing.totalAmount,
        advanceAmount: transaction.totalPaid,
        loanAmount: transaction.balanceRemaining,
        balanceAmount: transaction.balanceRemaining,
        // Delivery Info (for bank invoice)
        deliverToName: customer?.name || 'Unknown Customer',
        deliverToAddress: customer?.address || 'N/A',
        deliverToNIC: customer?.nic || 'N/A',
        // Payment Info
        paymentMethod: (() => {
          // First, check if transaction has paymentMode field (for leasing/reservation)
          if (transaction.paymentMode) {
            return transaction.paymentMode.toUpperCase();
          }
          // Then check payments array for actual payment method
          if (transaction.payments && transaction.payments.length > 0) {
            const lastPayment = transaction.payments[transaction.payments.length - 1];
            return lastPayment.paymentMethod?.toUpperCase() || 'CASH';
          }
          // Fallback to status-based text if no payment method found
          return transaction.status === 'fully_paid' || transaction.status === 'completed' 
            ? 'FULL PAYMENT' 
            : transaction.type === 'reservation' 
              ? 'RESERVATION - PARTIAL PAYMENT' 
              : 'PARTIAL PAYMENT';
        })(),
        paymentStatus: transaction.status === 'fully_paid' || transaction.status === 'completed'
          ? 'FULLY PAID'
          : 'PARTIAL PAYMENT',
        currency: transaction.currency || 'LKR',
        // Seller Info
        sellerName: 'Modern Car Sale',
        sellerContact: '067 22 29 174',
        sellerNIC: '198716101572',
      };
    } else if (order) {
      return {
        invoiceNumber: `INV-${order.id}`,
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        // Customer Info (need to be added to order if available)
        customerName: 'Customer Name',
        customerAddress: 'Customer Address',
        customerContact: 'Contact Number',
        customerNIC: 'NIC Number',
        // Bank Info
        bankName: order.lcBank || 'Hatton National Bank (HNB)',
        bankBranch: 'Kalawanchikudy',
        // Vehicle Details
        vehicleRegisteredNo: order.vehicleNumber || order.licensePlateNumber || '',
        make: order.model.split(' ')[0] || 'N/A',
        model: order.model,
        yearOfManufacture: order.year,
        chassisNo: order.vinNumber || 'N/A',
        engineNo: order.customBasicInfo?.['Engine No'] || 'N/A',
        fuelType: order.customBasicInfo?.['Fuel Type']?.toUpperCase() || 'PETROL',
        colour: order.customBasicInfo?.['Color']?.toUpperCase() || 'N/A',
        countryOfOrigin: order.country.toUpperCase(),
        // Financial Details
        vehicleCost: order.expenses.vehicleCost,
        additionalExpenses: {
          fuel: order.expenses.fuel,
          duty: order.expenses.duty,
          driverCharge: order.expenses.driverCharge,
          clearanceCharge: order.expenses.clearanceCharge,
          demurrage: order.expenses.demurrage,
          tax: order.expenses.tax,
          ...order.expenses.customExpenses,
        },
        totalAmount: order.totalCost,
        advanceAmount: 0, // To be filled manually or from additional data
        loanAmount: order.lcAmount || order.totalCost,
        balanceAmount: order.totalCost,
        // Delivery Info (for bank invoice)
        deliverToName: 'Customer Name',
        deliverToAddress: 'Customer Address',
        deliverToNIC: 'NIC Number',
        // Payment Info
        paymentMethod: order.lcAmount ? 'LEASING' : 'PENDING',
        paymentStatus: 'PENDING',
        currency: order.currency || 'USD',
        // Seller Info
        sellerName: 'Modern Car Sale',
        sellerContact: '067 22 29 174',
        sellerNIC: '198716101572',
      };
    }

    return null;
  };

  const invoiceData = prepareInvoiceData();

  return (
    <div className="billing-container">
      {!showInvoice ? (
        <>
          <div className="billing-header">
            <h2>📄 Invoice Generator</h2>
            <p className="billing-subtitle">Select a transaction or order to generate invoice automatically</p>
          </div>

          <div className="invoice-form-container">
            {/* Transaction/Order Selector */}
            <div className="form-section">
              <h3>📋 Select Source</h3>
              
              {/* Transactions List */}
              {transactions.length > 0 && (
                <div className="source-selection">
                  <h4>From Transactions (POS Sales/Reservations)</h4>
                  <select
                    value={selectedTransactionId}
                    onChange={(e) => {
                      setSelectedTransactionId(e.target.value);
                      setSelectedOrderId('');
                      if (e.target.value) {
                        const trans = transactions.find(t => t.id === e.target.value);
                        // Auto-detect if it's leasing
                        const hasLeasing = trans?.payments?.some(p => p.paymentMethod === 'leasing');
                        setInvoiceType(hasLeasing ? 'bank' : 'customer');
                      }
                    }}
                    className="form-input"
                  >
                    <option value="">-- Select a transaction --</option>
                    {transactions.map(transaction => {
                      const customer = getCustomerById(transaction.customerId);
                      const statusLabel = transaction.status === 'fully_paid' || transaction.status === 'completed' 
                        ? '✅ FULLY PAID' 
                        : transaction.type === 'reservation' 
                          ? '📝 RESERVATION' 
                          : '⏳ PARTIAL';
                      const invoiceNum = transaction.invoiceNumber || transaction.id;
                      
                      return (
                        <option key={transaction.id} value={transaction.id}>
                          {invoiceNum} | {customer?.name} | {transaction.vehicleDetails.brand} {transaction.vehicleDetails.model} | {statusLabel} | Balance: {transaction.balanceRemaining.toFixed(2)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Vehicle Orders List */}
              {vehicleOrders.length > 0 && (
                <div className="source-selection" style={{marginTop: '1.5rem'}}>
                  <h4>From Vehicle Orders (Import Orders)</h4>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => {
                      setSelectedOrderId(e.target.value);
                      setSelectedTransactionId('');
                      if (e.target.value) {
                        const order = getOrderById(e.target.value);
                        // Auto-detect if it has LC (leasing)
                        setInvoiceType(order?.lcAmount ? 'bank' : 'customer');
                      }
                    }}
                    className="form-input"
                  >
                    <option value="">-- Select a vehicle order --</option>
                    {vehicleOrders.map(order => {
                      const hasLC = order.lcAmount ? '🏦 LC' : '';
                      return (
                        <option key={order.id} value={order.id}>
                          {order.id} | {order.model} ({order.year}) | {order.country} | {hasLC} | Total: {order.currency} {order.totalCost.toFixed(2)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {transactions.length === 0 && vehicleOrders.length === 0 && (
                <div className="no-data-message">
                  <p>⚠️ No transactions or orders available. Please create a transaction or vehicle order first.</p>
                </div>
              )}
            </div>

            {/* Invoice Type Selection */}
            {(selectedTransactionId || selectedOrderId) && (
              <>
                <div className="form-section">
                  <h3>📑 Invoice Type</h3>
                  <div className="invoice-type-selector">
                    <button 
                      type="button"
                      className={`type-btn ${invoiceType === 'customer' ? 'active' : ''}`}
                      onClick={() => setInvoiceType('customer')}
                    >
                      👤 Customer Invoice
                    </button>
                    <button 
                      type="button"
                      className={`type-btn ${invoiceType === 'bank' ? 'active' : ''}`}
                      onClick={() => setInvoiceType('bank')}
                    >
                      🏦 Bank/Leasing Invoice
                    </button>
                  </div>
                </div>

                {/* Preview of Selected Data */}
                <div className="form-section">
                  <h3>👁️ Invoice Preview Summary</h3>
                  {invoiceData && (
                    <div className="invoice-preview-summary">
                      <div className="summary-grid">
                        <div className="summary-item">
                          <strong>Customer:</strong>
                          <span>{invoiceData.customerName}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Vehicle:</strong>
                          <span>{invoiceData.make} {invoiceData.model} ({invoiceData.yearOfManufacture})</span>
                        </div>
                        <div className="summary-item">
                          <strong>Total Amount:</strong>
                          <span className="amount-highlight">{invoiceData.currency} {invoiceData.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Paid Amount:</strong>
                          <span className="paid-highlight">{invoiceData.currency} {invoiceData.advanceAmount.toFixed(2)}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Balance:</strong>
                          <span className="balance-highlight">{invoiceData.currency} {invoiceData.balanceAmount.toFixed(2)}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Payment Status:</strong>
                          <span className={`status-badge ${invoiceData.balanceAmount === 0 ? 'status-paid' : 'status-pending'}`}>
                            {invoiceData.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={handleGenerateInvoice}
                  >
                    📄 Generate Invoice
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Invoice Preview */}
          <div className="invoice-preview-container">
            <div className="preview-actions no-print">
              <button className="btn btn-secondary" onClick={handleBack}>
                ← Back to Selection
              </button>
              <button className="btn btn-success" onClick={handlePrint}>
                🖨️ Print Invoice
              </button>
              <button className="btn btn-primary" onClick={handleNewInvoice}>
                ➕ Generate New Invoice
              </button>
            </div>

            {invoiceData && (
              invoiceType === 'customer' ? (
                <CustomerInvoice invoiceData={invoiceData} />
              ) : (
                <BankInvoice invoiceData={invoiceData} />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Billing;
