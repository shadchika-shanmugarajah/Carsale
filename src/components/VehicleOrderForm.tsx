import React, { useState } from 'react';
import './VehicleOrderForm.css';

interface VehicleOrderFormData {
  model: string;
  year: number;
  country: string;
  supplier: string;
  vehicleCost: number;
  currency: 'USD' | 'JPY' | 'EUR' | 'GBP' | 'LKR';
  expectedDelivery: string;
  notes: string;
  expenses: {
    fuel: number;
    duty: number;
    driverCharge: number;
    clearanceCharge: number;
    demurrage: number;
    tax: number;
    customExpenses: { [key: string]: number };
  };
  paymentMethod: string;
  // New fields
  chassisNo: string;
  lcAmount: number;
  lcNumber: string;
  lcBank: string;
  additionalInfo: string;
  // Basic Information fields
  grade: string;
  biNumber: string;
  customBasicInfo: { [key: string]: string };
}

interface VehicleOrderFormProps {
  onSubmit: (data: VehicleOrderFormData) => void;
  onCancel: () => void;
  initialData?: VehicleOrderFormData;
  isEditing?: boolean;
}

const VehicleOrderForm: React.FC<VehicleOrderFormProps> = ({ onSubmit, onCancel, initialData, isEditing }) => {
  const [formData, setFormData] = useState<VehicleOrderFormData>(
    initialData || {
      model: '',
      year: new Date().getFullYear(),
      country: 'Japan',
      supplier: '',
      vehicleCost: '' as any,
      currency: 'USD',
      expectedDelivery: '',
      notes: '',
      expenses: {
        fuel: '' as any,
        duty: '' as any,
        driverCharge: '' as any,
        clearanceCharge: '' as any,
        demurrage: '' as any,
        tax: '' as any,
        customExpenses: {},
      },
      paymentMethod: 'Bank Transfer',
      chassisNo: '',
      lcAmount: '' as any,
      lcNumber: '',
      lcBank: '',
      additionalInfo: '',
      // Basic Information fields
      grade: '',
      biNumber: '',
      customBasicInfo: {},
    }
  );

  const [newExpenseName, setNewExpenseName] = useState('');
  
  // Custom basic information management
  const [newBasicInfoName, setNewBasicInfoName] = useState('');
  const [showAddBasicInfo, setShowAddBasicInfo] = useState(false);
  
  // Sri Lankan banks list with option to add custom banks
  const [sriLankanBanks, setSriLankanBanks] = useState([
    'Bank of Ceylon (BOC)',
    'People\'s Bank',
    'Commercial Bank of Ceylon',
    'Hatton National Bank (HNB)',
    'Sampath Bank',
    'Nations Trust Bank',
    'DFCC Bank',
    'National Development Bank (NDB)',
    'Seylan Bank',
    'Union Bank',
    'Pan Asia Banking Corporation',
    'Cargills Bank',
    'HSBC Sri Lanka',
    'Standard Chartered Bank',
    'Citibank N.A.',
    'Deutsche Bank AG'
  ]);
  
  const [newBankName, setNewBankName] = useState('');
  const [showAddBank, setShowAddBank] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('expenses.')) {
      const expenseKey = name.split('.')[1];
      if (expenseKey === 'customExpenses') {
        // This shouldn't happen with the current structure
        return;
      }
      setFormData(prev => ({
        ...prev,
        expenses: {
          ...prev.expenses,
          [expenseKey]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'year' || name === 'vehicleCost' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleCustomExpenseChange = (expenseName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        customExpenses: {
          ...prev.expenses.customExpenses,
          [expenseName]: parseFloat(value) || 0
        }
      }
    }));
  };

  const addCustomExpense = () => {
    if (newExpenseName.trim() && !formData.expenses.customExpenses[newExpenseName]) {
      setFormData(prev => ({
        ...prev,
        expenses: {
          ...prev.expenses,
          customExpenses: {
            ...prev.expenses.customExpenses,
            [newExpenseName]: 0
          }
        }
      }));
      setNewExpenseName('');
    }
  };

  const removeCustomExpense = (expenseName: string) => {
    setFormData(prev => {
      const newCustomExpenses = { ...prev.expenses.customExpenses };
      delete newCustomExpenses[expenseName];
      return {
        ...prev,
        expenses: {
          ...prev.expenses,
          customExpenses: newCustomExpenses
        }
      };
    });
  };

  const addCustomBank = () => {
    if (newBankName.trim() && !sriLankanBanks.includes(newBankName.trim())) {
      setSriLankanBanks(prev => [...prev, newBankName.trim()]);
      setFormData(prev => ({ ...prev, lcBank: newBankName.trim() }));
      setNewBankName('');
      setShowAddBank(false);
    }
  };

  const handleCustomBasicInfoChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customBasicInfo: {
        ...prev.customBasicInfo,
        [fieldName]: value
      }
    }));
  };

  const addCustomBasicInfo = () => {
    if (newBasicInfoName.trim() && !formData.customBasicInfo[newBasicInfoName]) {
      setFormData(prev => ({
        ...prev,
        customBasicInfo: {
          ...prev.customBasicInfo,
          [newBasicInfoName]: ''
        }
      }));
      setNewBasicInfoName('');
      setShowAddBasicInfo(false);
    }
  };

  const removeCustomBasicInfo = (fieldName: string) => {
    setFormData(prev => {
      const newCustomBasicInfo = { ...prev.customBasicInfo };
      delete newCustomBasicInfo[fieldName];
      return {
        ...prev,
        customBasicInfo: newCustomBasicInfo
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getTotalCost = () => {
    const vehicleCost = parseFloat(formData.vehicleCost as any) || 0;
    const standardExpenses = 
      (parseFloat(formData.expenses.fuel as any) || 0) + 
      (parseFloat(formData.expenses.duty as any) || 0) + 
      (parseFloat(formData.expenses.driverCharge as any) || 0) + 
      (parseFloat(formData.expenses.clearanceCharge as any) || 0) + 
      (parseFloat(formData.expenses.demurrage as any) || 0) + 
      (parseFloat(formData.expenses.tax as any) || 0);
    const customExpensesTotal = Object.values(formData.expenses.customExpenses).reduce((sum, val) => sum + (parseFloat(val as any) || 0), 0);
    return vehicleCost + standardExpenses + customExpensesTotal;
  };

  return (
    <div className="vehicle-order-form-overlay">
      <div className="vehicle-order-form">
        <div className="form-header">
          <h2>{isEditing ? 'Edit Vehicle Order' : 'New Vehicle Order'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* Vehicle Information */}
            <div className="form-section">
              <h3>Vehicle Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="model" className="form-label">Vehicle Model *</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="e.g., Toyota Camry"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="year" className="form-label">Year *</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    required
                    min="1990"
                    max="2030"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="country" className="form-label">Country of Origin *</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="Japan">Japan</option>
                    <option value="Germany">Germany</option>
                    <option value="USA">USA</option>
                    <option value="UK">United Kingdom</option>
                    <option value="South Korea">South Korea</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="supplier" className="form-label">Supplier</label>
                  <input
                    type="text"
                    id="supplier"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Supplier name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="chassisNo" className="form-label">Chassis No</label>
                  <input
                    type="text"
                    id="chassisNo"
                    name="chassisNo"
                    value={formData.chassisNo}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., ABC-1234 (Optional)"
                  />
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="form-section">
              <h3>📋 Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="grade" className="form-label">Grade</label>
                  <input
                    type="text"
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Premium, Standard"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="biNumber" className="form-label">BI Number</label>
                  <input
                    type="text"
                    id="biNumber"
                    name="biNumber"
                    value={formData.biNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., BI-123456"
                  />
                </div>
              </div>

              {/* Custom Basic Information */}
              <div style={{marginTop: '1.5rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                  <h4>Custom Basic Information</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddBasicInfo(!showAddBasicInfo)}
                    className="btn btn-secondary btn-sm"
                  >
                    ➕ Add Field
                  </button>
                </div>
                
                {/* Add New Basic Info Field */}
                {showAddBasicInfo && (
                  <div className="add-basic-info-section" style={{
                    marginBottom: '1rem', 
                    padding: '1rem', 
                    background: '#f8f9fa', 
                    borderRadius: '8px', 
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'end'}}>
                      <div style={{flex: 1}}>
                        <label className="form-label">Field Name</label>
                        <input
                          type="text"
                          value={newBasicInfoName}
                          onChange={(e) => setNewBasicInfoName(e.target.value)}
                          className="form-input"
                          placeholder="e.g., Engine Type, Color, Mileage"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addCustomBasicInfo}
                        className="btn btn-primary"
                        style={{height: 'fit-content', marginBottom: '0.5rem'}}
                        disabled={!newBasicInfoName.trim()}
                      >
                        ✅ Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddBasicInfo(false);
                          setNewBasicInfoName('');
                        }}
                        className="btn btn-secondary"
                        style={{height: 'fit-content', marginBottom: '0.5rem'}}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Basic Info Fields List */}
                {Object.keys(formData.customBasicInfo).length > 0 && (
                  <div className="custom-basic-info-grid">
                    {Object.entries(formData.customBasicInfo).map(([fieldName, value]) => (
                      <div key={fieldName} className="custom-basic-info-item" style={{
                        display: 'flex', 
                        gap: '0.5rem', 
                        alignItems: 'center', 
                        marginBottom: '0.75rem',
                        padding: '0.75rem',
                        background: '#ffffff',
                        borderRadius: '6px',
                        border: '1px solid #dee2e6'
                      }}>
                        <div style={{flex: 1}}>
                          <label className="form-label">{fieldName}</label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleCustomBasicInfoChange(fieldName, e.target.value)}
                            className="form-input"
                            placeholder={`Enter ${fieldName.toLowerCase()}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCustomBasicInfo(fieldName)}
                          className="btn btn-danger btn-sm"
                          style={{height: 'fit-content'}}
                          title="Remove field"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* LC Information */}
            <div className="form-section">
              <h3>💰 Letter of Credit (LC) Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="lcAmount" className="form-label">LC Amount</label>
                  <input
                    type="number"
                    id="lcAmount"
                    name="lcAmount"
                    value={formData.lcAmount}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    min="0"
                    step="any"
                    placeholder="Enter LC amount"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lcNumber" className="form-label">LC Number</label>
                  <input
                    type="text"
                    id="lcNumber"
                    name="lcNumber"
                    value={formData.lcNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., LC-2024-001"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lcBank" className="form-label">LC Bank</label>
                  <div style={{display: 'flex', gap: '0.5rem', alignItems: 'end'}}>
                    <div style={{flex: 1}}>
                      <select
                        id="lcBank"
                        name="lcBank"
                        value={formData.lcBank}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        <option value="">Select a bank...</option>
                        {sriLankanBanks.map(bank => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddBank(!showAddBank)}
                      className="btn btn-secondary"
                      style={{height: 'fit-content', marginBottom: '0.5rem'}}
                    >
                      ➕ Add Bank
                    </button>
                  </div>
                  
                  {/* Add Custom Bank */}
                  {showAddBank && (
                    <div className="add-bank-section" style={{
                      marginTop: '0.75rem',
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{display: 'flex', gap: '0.5rem', alignItems: 'end'}}>
                        <div style={{flex: 1}}>
                          <label className="form-label">New Bank Name</label>
                          <input
                            type="text"
                            value={newBankName}
                            onChange={(e) => setNewBankName(e.target.value)}
                            className="form-input"
                            placeholder="Enter bank name"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={addCustomBank}
                          className="btn btn-primary"
                          style={{height: 'fit-content', marginBottom: '0.5rem'}}
                          disabled={!newBankName.trim()}
                        >
                          ✅ Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddBank(false);
                            setNewBankName('');
                          }}
                          className="btn btn-secondary"
                          style={{height: 'fit-content', marginBottom: '0.5rem'}}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cost Information */}
            <div className="form-section">
              <h3>Cost Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="vehicleCost" className="form-label">Vehicle Cost *</label>
                  <input
                    type="number"
                    id="vehicleCost"
                    name="vehicleCost"
                    value={formData.vehicleCost}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    required
                    min="0"
                    step="any"
                    placeholder="Base vehicle cost"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="currency" className="form-label">Currency *</label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="USD">USD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="LKR">LKR (Rs)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="paymentMethod" className="form-label">Payment Method</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Letter of Credit">Letter of Credit</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="expectedDelivery" className="form-label">Expected Delivery</label>
                  <input
                    type="date"
                    id="expectedDelivery"
                    name="expectedDelivery"
                    value={formData.expectedDelivery}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Additional Expenses */}
            <div className="form-section">
              <h3>Additional Expenses</h3>
              <div className="expense-grid">
                <div className="form-group">
                  <label htmlFor="expenses.fuel" className="form-label">Fuel</label>
                  <input
                    type="number"
                    id="expenses.fuel"
                    name="expenses.fuel"
                    value={formData.expenses.fuel}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    min="0"
                    step="any"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="expenses.duty" className="form-label">Duty</label>
                  <input
                    type="number"
                    id="expenses.duty"
                    name="expenses.duty"
                    value={formData.expenses.duty}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    min="0"
                    step="any"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="expenses.driverCharge" className="form-label">Driver Charge</label>
                  <input
                    type="number"
                    id="expenses.driverCharge"
                    name="expenses.driverCharge"
                    value={formData.expenses.driverCharge}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    min="0"
                    step="any"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="expenses.clearanceCharge" className="form-label">Clearance Charge</label>
                  <input
                    type="number"
                    id="expenses.clearanceCharge"
                    name="expenses.clearanceCharge"
                    value={formData.expenses.clearanceCharge}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    min="0"
                    step="any"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="expenses.demurrage" className="form-label">Demurrage</label>
                  <input
                    type="number"
                    id="expenses.demurrage"
                    name="expenses.demurrage"
                    value={formData.expenses.demurrage}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    min="0"
                    step="any"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="expenses.tax" className="form-label">Tax</label>
                  <input
                    type="number"
                    id="expenses.tax"
                    name="expenses.tax"
                    value={formData.expenses.tax}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    min="0"
                    step="any"
                  />
                </div>
                
              </div>
              
              {/* Custom Expenses Section */}
              <div style={{marginTop: '1.5rem'}}>
                <h4>Custom Expenses</h4>
                
                {/* Add New Expense */}
                <div className="add-expense-section" style={{marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'end'}}>
                  <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                    <label htmlFor="newExpenseName" className="form-label">New Expense Name</label>
                    <input
                      type="text"
                      id="newExpenseName"
                      value={newExpenseName}
                      onChange={(e) => setNewExpenseName(e.target.value)}
                      className="form-input"
                      placeholder="e.g., Insurance, Documentation"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addCustomExpense}
                    className="btn btn-secondary"
                    style={{height: 'fit-content', marginBottom: '0.5rem'}}
                    disabled={!newExpenseName.trim()}
                  >
                    ➕ Add Expense
                  </button>
                </div>

                {/* Custom Expenses List */}
                {Object.keys(formData.expenses.customExpenses).length > 0 && (
                  <div className="custom-expenses-grid">
                    {Object.entries(formData.expenses.customExpenses).map(([expenseName, value]) => (
                      <div key={expenseName} className="custom-expense-item" style={{display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem'}}>
                        <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                          <label className="form-label">{expenseName}</label>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => handleCustomExpenseChange(expenseName, e.target.value)}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="form-input"
                            min="0"
                            step="any"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCustomExpense(expenseName)}
                          className="btn btn-danger btn-sm"
                          style={{height: 'fit-content'}}
                          title="Remove expense"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="form-section">
              <h3>Additional Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="notes" className="form-label">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="form-input"
                    rows={3}
                    placeholder="Any additional notes or special instructions..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="additionalInfo" className="form-label">Additional Information</label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    className="form-input"
                    rows={3}
                    placeholder="Any other relevant information about the vehicle or order..."
                  />
                </div>
              </div>
            </div>

            {/* Total Cost Summary */}
            <div className="form-section">
              <div className="cost-summary">
                <h3>Cost Summary</h3>
                <div className="cost-breakdown">
                  <div className="cost-item">
                    <span>Vehicle Cost:</span>
                    <span>{formData.currency} {(parseFloat(formData.vehicleCost as any) || 0).toFixed(2)}</span>
                  </div>
                  <div className="cost-item">
                    <span>Total Expenses:</span>
                    <span>{formData.currency} {(
                      (parseFloat(formData.expenses.fuel as any) || 0) + 
                      (parseFloat(formData.expenses.duty as any) || 0) + 
                      (parseFloat(formData.expenses.driverCharge as any) || 0) + 
                      (parseFloat(formData.expenses.clearanceCharge as any) || 0) + 
                      (parseFloat(formData.expenses.demurrage as any) || 0) + 
                      (parseFloat(formData.expenses.tax as any) || 0) +
                      Object.values(formData.expenses.customExpenses).reduce((sum, val) => sum + (parseFloat(val as any) || 0), 0)
                    ).toFixed(2)}</span>
                  </div>
                  <div className="cost-item total">
                    <span><strong>Total Cost:</strong></span>
                    <span><strong>{formData.currency} {getTotalCost().toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleOrderForm;
