import React, { useState, useEffect } from 'react';
import './Reports.css';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { transactionAPI, customerAPI, inventoryAPI, vehicleOrderAPI, expenseAPI } from '../utils/api';

interface Transaction {
  _id?: string;
  id: string;
  customerId: string;
  type: 'reservation' | 'sale' | 'leasing' | 'refund';
  status: string;
  reservationDate?: string;
  completionDate?: string;
  vehicleDetails: {
    brand: string;
    model: string;
    year: number;
    color: string;
    registrationNo?: string;
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
  currency: string;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  currency: string;
}

interface Customer {
  _id?: string;
  id: string;
  name: string;
  contact: string;
  email?: string;
  address?: string;
}

interface InventoryItem {
  _id?: string;
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  condition: string;
  price: number;
  status: string;
}

interface ReportsProps {
  transactions: Transaction[];
  expenses: Expense[];
}

type ReportTabType = 'sales' | 'inventory' | 'customers' | 'financial' | 'expenses' | 'performance';

const Reports: React.FC<ReportsProps> = ({ transactions: propTransactions, expenses: propExpenses }) => {
  const [activeTab, setActiveTab] = useState<ReportTabType>('sales');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customDateRange, setCustomDateRange] = useState({ 
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  // State for loaded data
  const [transactions, setTransactions] = useState<Transaction[]>(propTransactions);
  const [expenses, setExpenses] = useState<Expense[]>(propExpenses);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load data from backend - defined before useEffect
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.log('No auth token found, please login');
        setIsLoading(false);
        return;
      }

      console.log('Loading reports data from backend...');

      // Load all data in parallel
      const [transactionsResponse, customersResponse, inventoryResponse, expensesResponse] = await Promise.all([
        transactionAPI.getAll().catch((err) => {
          console.error('Error loading transactions:', err);
          return { transactions: [] };
        }),
        customerAPI.getAll().catch((err) => {
          console.error('Error loading customers:', err);
          return { customers: [] };
        }),
        inventoryAPI.getAll().catch((err) => {
          console.error('Error loading inventory:', err);
          return { items: [] };
        }),
        expenseAPI.getAll({ limit: 1000 }).catch((err) => {
          console.error('Error loading expenses:', err);
          return { expenses: [] };
        })
      ]);

      // Extract data from responses
      const transactionsData = Array.isArray(transactionsResponse) ? transactionsResponse : transactionsResponse.transactions || [];
      const customersData = Array.isArray(customersResponse) ? customersResponse : customersResponse.customers || [];
      const inventoryData = Array.isArray(inventoryResponse) ? inventoryResponse : inventoryResponse.items || [];
      const expensesData = Array.isArray(expensesResponse) ? expensesResponse : expensesResponse.expenses || [];

      console.log('Loaded transactions:', transactionsData.length);
      console.log('Loaded customers:', customersData.length);
      console.log('Loaded inventory:', inventoryData.length);
      console.log('Loaded expenses:', expensesData.length);

      // Map and set data
      setTransactions(transactionsData.map((t: any) => ({
        ...t,
        id: t._id || t.id || '',
        status: t.status || 'pending',
        completionDate: t.completionDate || t.createdAt,
        vehicleDetails: {
          brand: t.vehicleDetails?.brand || t.brand || 'N/A',
          model: t.vehicleDetails?.model || t.model || 'N/A',
          year: t.vehicleDetails?.year || t.year || 0,
          color: t.vehicleDetails?.color || t.color || 'N/A',
          registrationNo: t.vehicleDetails?.registrationNo || t.registrationNo || ''
        },
        pricing: {
          vehiclePrice: t.pricing?.vehiclePrice || t.price || 0,
          taxes: t.pricing?.taxes || 0,
          fees: t.pricing?.fees || 0,
          discount: t.pricing?.discount || 0,
          totalAmount: t.pricing?.totalAmount || t.totalAmount || t.price || 0
        },
        totalPaid: t.totalPaid || 0,
        balanceRemaining: t.balanceRemaining || 0,
        currency: t.currency || 'LKR'
      })));

      setCustomers(customersData.map((c: any) => ({
        ...c,
        id: c._id || c.id || ''
      })));

      setInventoryItems(inventoryData.map((item: any) => ({
        ...item,
        id: item._id || item.id || '',
        vin: item.vin || 'N/A',
        brand: item.brand || 'N/A',
        model: item.model || 'N/A',
        year: item.year || new Date().getFullYear(),
        color: item.color || 'N/A',
        condition: item.condition || 'good',
        status: item.status || 'available',
        price: item.sellingPrice || item.purchasePrice || item.marketValue || 0
      })));

      setExpenses(expensesData.map((e: any) => ({
        ...e,
        id: e._id || e.id || '',
        category: e.category || 'Other',
        description: e.description || '',
        amount: e.amount || 0,
        date: e.date || new Date().toISOString(),
        currency: e.currency || 'LKR'
      })));

      console.log('Reports data loaded successfully');

    } catch (error) {
      console.error('Error loading report data:', error);
      alert('⚠️ Error loading reports data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Helper function to get transaction date
  const getTransactionDate = (transaction: Transaction): string => {
    return transaction.completionDate || transaction.reservationDate || new Date().toISOString();
  };

  // Date filtering logic
  const filterByDate = (date: string) => {
    if (dateFilter === 'all') return true;
    
    const itemDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate.getTime() === today.getTime();
    }

    if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return itemDate >= weekAgo;
    }

    if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      return itemDate >= monthAgo;
    }

    if (dateFilter === 'year') {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(today.getFullYear() - 1);
      return itemDate >= yearAgo;
    }

    if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
      const start = new Date(customDateRange.start);
      const end = new Date(customDateRange.end);
      end.setHours(23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    }

    return true;
  };

  // Filter data
  const filteredTransactions = transactions.filter(t => filterByDate(getTransactionDate(t)));
  const filteredExpenses = expenses.filter(e => filterByDate(e.date));

  // Calculate metrics
  const totalRevenue = filteredTransactions
    .filter(t => t.status === 'completed' || t.status === 'fully_paid')
    .reduce((sum, t) => sum + t.pricing.totalAmount, 0);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const totalSales = filteredTransactions.filter(t => t.type === 'sale').length;
  const totalReservations = filteredTransactions.filter(t => t.type === 'reservation').length;
  const totalLeasing = filteredTransactions.filter(t => t.type === 'leasing').length;

  // Sales by vehicle brand
  const salesByBrand = filteredTransactions.reduce((acc, t) => {
    const brand = t.vehicleDetails.brand;
    acc[brand] = (acc[brand] || 0) + t.pricing.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  // Expenses by category
  const expensesByCategory = filteredExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  // Monthly trends (last 6 months)
  const getMonthlyData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(getTransactionDate(t));
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });
      
      const monthExpenses = expenses.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getMonth() === date.getMonth() && eDate.getFullYear() === date.getFullYear();
      });

      const revenue = monthTransactions
        .filter(t => t.status === 'completed' || t.status === 'fully_paid')
        .reduce((sum, t) => sum + t.pricing.totalAmount, 0);
      
      const expense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      months.push({
        month: monthStr,
        revenue,
        expense,
        profit: revenue - expense
      });
    }
    return months;
  };

  const monthlyData = getMonthlyData();

  const formatCurrency = (amount: number, currency: string = 'LKR') => {
    // Handle NaN, undefined, null values
    const validAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(validAmount);
  };

  const handleExportPDF = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${activeTab}_report_${timestamp}`;
    
    let dataToExport: any[] = [];
    let summary = {};

    if (activeTab === 'sales' || activeTab === 'performance') {
      dataToExport = filteredTransactions;
      summary = {
        totalRevenue,
        count: filteredTransactions.length
      };
    } else if (activeTab === 'expenses') {
      dataToExport = filteredExpenses;
      summary = {
        totalExpenses,
        count: filteredExpenses.length
      };
    } else if (activeTab === 'financial') {
      dataToExport = filteredTransactions;
      summary = {
        totalRevenue,
        totalExpenses,
        totalProfit
      };
    } else if (activeTab === 'inventory') {
      dataToExport = inventoryItems;
      summary = {
        totalItems: inventoryItems.length,
        totalValue: inventoryItems.reduce((sum, item) => sum + (item.price || (item as any).sellingPrice || (item as any).purchasePrice || 0), 0)
      };
    } else if (activeTab === 'customers') {
      dataToExport = customers;
      summary = {
        totalCustomers: customers.length
      };
    }

    exportToPDF(dataToExport, filename, activeTab as any, summary);
  };

  const handleExportExcel = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${activeTab}_report_${timestamp}`;
    
    let dataToExport: any[] = [];

    if (activeTab === 'sales' || activeTab === 'performance') {
      dataToExport = filteredTransactions;
    } else if (activeTab === 'expenses') {
      dataToExport = filteredExpenses;
    } else if (activeTab === 'financial') {
      dataToExport = filteredTransactions;
    } else if (activeTab === 'inventory') {
      dataToExport = inventoryItems;
    } else if (activeTab === 'customers') {
      dataToExport = customers;
    }

    exportToExcel(dataToExport, filename, activeTab as any);
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h2>📊 Business Reports & Analytics</h2>
          <p className="subtitle">Comprehensive financial insights and performance metrics</p>
        </div>
        <div className="export-buttons">
          <button className="btn btn-secondary" onClick={handleExportPDF}>
            📄 Export PDF
          </button>
          <button className="btn btn-success" onClick={handleExportExcel}>
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="reports-tabs">
        <button 
          className={`report-tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <span className="tab-icon">📈</span>
          <span className="tab-label">Sales Report</span>
        </button>
        <button 
          className={`report-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <span className="tab-icon">🚗</span>
          <span className="tab-label">Inventory Report</span>
        </button>
        <button 
          className={`report-tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <span className="tab-icon">👥</span>
          <span className="tab-label">Customer Report</span>
        </button>
        <button 
          className={`report-tab ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          <span className="tab-icon">💰</span>
          <span className="tab-label">Financial Report</span>
        </button>
        <button 
          className={`report-tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <span className="tab-icon">💸</span>
          <span className="tab-label">Expenses Report</span>
        </button>
        <button 
          className={`report-tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-label">Performance</span>
        </button>
      </div>

      {/* Date Filters */}
      <div className="reports-filters">
        <div className="filter-group">
          <label>📅 Date Range:</label>
          <select
            className="filter-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {dateFilter === 'custom' && (
          <>
            <div className="filter-group">
              <label>From:</label>
              <input
                type="date"
                className="date-input"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label>To:</label>
              <input
                type="date"
                className="date-input"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
              />
            </div>
          </>
        )}
        
        <button className="btn btn-primary" onClick={loadAllData} disabled={isLoading}>
          🔄 {isLoading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading report data...</div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-cards-grid">
        <div className="summary-card revenue">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="summary-card expenses">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3>{formatCurrency(totalExpenses)}</h3>
            <p>Total Expenses</p>
          </div>
        </div>

        <div className="summary-card profit">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3 className={totalProfit >= 0 ? 'positive' : 'negative'}>
              {formatCurrency(totalProfit)}
            </h3>
            <p>Net Profit</p>
          </div>
        </div>

        <div className="summary-card transactions">
          <div className="card-icon">🚗</div>
          <div className="card-content">
            <h3>{totalSales + totalReservations + totalLeasing}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
      </div>

      {/* Report Content Based on Active Tab */}
      {activeTab === 'sales' && (
        <div className="report-section">
          <h3>📈 Sales Analysis</h3>
          
          {/* Sales Data */}
          {(() => {
            // Use filtered transactions from main date filter
            const salesData = filteredTransactions.filter(t => t.status === 'completed' || t.status === 'fully_paid');
            const totalSalesCount = salesData.length;
            const totalSalesRevenue = salesData.reduce((sum, t) => sum + t.pricing.totalAmount, 0);
            const avgPerSale = totalSalesCount > 0 ? totalSalesRevenue / totalSalesCount : 0;

            return (
              <>
                {/* Summary Cards */}
                <div className="grid grid-3" style={{marginBottom: '30px'}}>
                  <div className="summary-card revenue">
                    <div className="card-icon">🚗</div>
                    <div className="card-content">
                      <h3>{totalSalesCount}</h3>
                      <p>Total Vehicles Sold</p>
                    </div>
                  </div>

                  <div className="summary-card profit">
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                      <h3 className="positive">{formatCurrency(totalSalesRevenue)}</h3>
                      <p>Total Revenue</p>
                    </div>
                  </div>

                  <div className="summary-card transactions">
                    <div className="card-icon">📊</div>
                    <div className="card-content">
                      <h3>{formatCurrency(avgPerSale)}</h3>
                      <p>Average per Sale</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Sales Table */}
                <div className="card" style={{marginBottom: '20px'}}>
                  <h4>Sales Details</h4>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Transaction ID</th>
                        <th>Customer</th>
                        <th>Vehicle</th>
                        <th>Type</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.length > 0 ? (
                        salesData.map(transaction => {
                          const customer = customers.find(c => 
                            c.id === transaction.customerId || 
                            c._id === transaction.customerId
                          );
                          return (
                            <tr key={transaction.id}>
                              <td>{new Date(getTransactionDate(transaction)).toLocaleDateString()}</td>
                              <td><strong>{transaction.id}</strong></td>
                              <td>{customer?.name || 'N/A'}</td>
                              <td>{transaction.vehicleDetails.brand} {transaction.vehicleDetails.model}</td>
                              <td><span className="badge">{transaction.type}</span></td>
                              <td className="text-right positive"><strong>{formatCurrency(transaction.pricing.totalAmount, transaction.currency)}</strong></td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="no-data">No sales found for selected period</td>
                        </tr>
                      )}
                    </tbody>
                    {salesData.length > 0 && (
                      <tfoot>
                        <tr className="total">
                          <td colSpan={5}><strong>TOTAL</strong></td>
                          <td className="text-right positive"><strong>{formatCurrency(totalSalesRevenue)}</strong></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                {/* Additional Analysis */}
                <div className="grid grid-2">
                  <div className="card">
                    <h4>Sales by Type</h4>
                    <div className="stat-list">
                      <div className="stat-item">
                        <span>Direct Sales:</span>
                        <strong>{salesData.filter(t => t.type === 'sale').length} vehicles</strong>
                      </div>
                      <div className="stat-item">
                        <span>Reservations:</span>
                        <strong>{salesData.filter(t => t.type === 'reservation').length} vehicles</strong>
                      </div>
                      <div className="stat-item">
                        <span>Leasing:</span>
                        <strong>{salesData.filter(t => t.type === 'leasing').length} vehicles</strong>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h4>Top Selling Brands</h4>
                    <div className="stat-list">
                      {(() => {
                        const brandSales = salesData.reduce((acc, t) => {
                          const brand = t.vehicleDetails.brand;
                          acc[brand] = (acc[brand] || 0) + t.pricing.totalAmount;
                          return acc;
                        }, {} as Record<string, number>);

                        return Object.entries(brandSales).length > 0 ? (
                          Object.entries(brandSales)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([brand, amount]) => (
                              <div key={brand} className="stat-item">
                                <span>{brand}:</span>
                                <strong>{formatCurrency(amount)}</strong>
                              </div>
                            ))
                        ) : (
                          <p className="no-data" style={{textAlign: 'center', padding: '20px'}}>No data</p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="report-section">
          <h3>🚗 Inventory Analysis</h3>
          
          {/* Inventory Summary */}
          <div className="grid grid-4" style={{marginBottom: '30px'}}>
            <div className="summary-card">
              <div className="card-icon">🚗</div>
              <div className="card-content">
                <h3>{inventoryItems.length}</h3>
                <p>Total Vehicles</p>
              </div>
            </div>
            <div className="summary-card success">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <h3>{inventoryItems.filter(i => i.status === 'available').length}</h3>
                <p>Available</p>
              </div>
            </div>
            <div className="summary-card warning">
              <div className="card-icon">🔄</div>
              <div className="card-content">
                <h3>{inventoryItems.filter(i => i.status === 'reserved').length}</h3>
                <p>Reserved</p>
              </div>
            </div>
            <div className="summary-card info">
              <div className="card-icon">🔨</div>
              <div className="card-content">
                <h3>{inventoryItems.filter(i => i.status === 'maintenance').length}</h3>
                <p>Maintenance</p>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="card">
            <h4>Inventory Details</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>VIN</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Color</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th className="text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.length > 0 ? (
                  inventoryItems.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.vin || 'N/A'}</strong></td>
                      <td>{item.brand}</td>
                      <td>{item.model}</td>
                      <td>{item.year}</td>
                      <td>{item.color}</td>
                      <td>
                        <span className="badge" style={{ textTransform: 'capitalize', fontSize: '12px', padding: '4px 8px' }}>
                          {item.condition || 'Good'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${item.status}`} style={{ textTransform: 'capitalize' }}>
                          {item.status === 'available' ? 'Available' :
                           item.status === 'sold' ? 'Sold' :
                           item.status === 'reserved' ? 'Reserved' :
                           item.status === 'maintenance' ? 'Maintenance' :
                           item.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="text-right"><strong>{formatCurrency(item.price)}</strong></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="no-data">No inventory items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Inventory by Brand */}
          <div className="grid grid-2" style={{marginTop: '20px'}}>
            <div className="card">
              <h4>Inventory by Brand</h4>
              <div className="stat-list">
                {(() => {
                  const brandCount = inventoryItems.reduce((acc, item) => {
                    acc[item.brand] = (acc[item.brand] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                  return Object.entries(brandCount).length > 0 ? (
                    Object.entries(brandCount)
                .sort(([, a], [, b]) => b - a)
                      .map(([brand, count]) => (
                        <div key={brand} className="stat-item">
                          <span>{brand}:</span>
                          <strong>{count} vehicles</strong>
                        </div>
                      ))
                  ) : (
                    <p className="no-data" style={{textAlign: 'center', padding: '20px'}}>No data</p>
                  );
                })()}
              </div>
            </div>

            <div className="card">
              <h4>Total Inventory Value</h4>
              <div className="stat-list">
                <div className="stat-item">
                  <span>Total Value:</span>
                  <strong className="positive">{formatCurrency(inventoryItems.reduce((sum, item) => sum + item.price, 0))}</strong>
                </div>
                <div className="stat-item">
                  <span>Average Price:</span>
                  <strong>{formatCurrency(inventoryItems.length > 0 ? inventoryItems.reduce((sum, item) => sum + item.price, 0) / inventoryItems.length : 0)}</strong>
                    </div>
                <div className="stat-item">
                  <span>Available Value:</span>
                  <strong className="positive">{formatCurrency(inventoryItems.filter(i => i.status === 'available').reduce((sum, item) => sum + item.price, 0))}</strong>
                    </div>
                  </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="report-section">
          <h3>👥 Customer Analysis</h3>
          
          {/* Customer Summary */}
          <div className="grid grid-3" style={{marginBottom: '30px'}}>
            <div className="summary-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h3>{customers.length}</h3>
                <p>Total Customers</p>
              </div>
            </div>
            <div className="summary-card success">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <h3>{filteredTransactions.filter((t, i, arr) => arr.findIndex(x => x.customerId === t.customerId) === i).length}</h3>
                <p>Active Customers</p>
              </div>
            </div>
            <div className="summary-card info">
              <div className="card-icon">📧</div>
              <div className="card-content">
                <h3>{customers.filter(c => c.email).length}</h3>
                <p>With Email</p>
              </div>
            </div>
          </div>

          {/* Customer List */}
          <div className="card">
            <h4>Customer Directory</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th className="text-right">Total Purchases</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? (
                  customers.map(customer => {
                    const customerTransactions = filteredTransactions.filter(t => t.customerId === customer.id);
                    const totalSpent = customerTransactions.reduce((sum, t) => sum + t.pricing.totalAmount, 0);
                    
                    return (
                      <tr key={customer.id}>
                        <td><strong>{customer.id}</strong></td>
                        <td>{customer.name}</td>
                        <td>{customer.contact}</td>
                        <td>{customer.email || 'N/A'}</td>
                        <td className="text-right positive"><strong>{formatCurrency(totalSpent)}</strong></td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="no-data">No customers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="report-section">
          <h3>💰 Financial Report (Profit & Loss)</h3>
          
          {/* Financial Summary Cards */}
          <div className="grid grid-4" style={{marginBottom: '30px'}}>
            <div className="summary-card revenue">
              <div className="card-icon">💵</div>
              <div className="card-content">
                <h3>{formatCurrency(totalRevenue)}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            <div className="summary-card expenses">
              <div className="card-icon">💸</div>
              <div className="card-content">
                <h3>{formatCurrency(totalExpenses)}</h3>
                <p>Total Expenses</p>
              </div>
            </div>
            <div className="summary-card profit">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <h3 className={totalProfit >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(totalProfit)}
                </h3>
                <p>Net Profit</p>
              </div>
            </div>
            <div className="summary-card info">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h3 className={totalProfit >= 0 ? 'positive' : 'negative'}>
                  {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
                </h3>
                <p>Profit Margin</p>
              </div>
            </div>
          </div>

          {/* Key Financial Metrics */}
          <div className="grid grid-3" style={{marginBottom: '30px'}}>
            <div className="card">
              <h4>💰 Revenue & Costs</h4>
              <div className="stat-list">
                <div className="stat-item">
                  <span>Total Revenue:</span>
                  <strong className="positive">{formatCurrency(totalRevenue)}</strong>
                </div>
                <div className="stat-item">
                  <span>Total Expenses:</span>
                  <strong className="negative">{formatCurrency(totalExpenses)}</strong>
                </div>
                <div className="stat-item">
                  <span>Net Profit:</span>
                  <strong className={totalProfit >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(totalProfit)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="card">
              <h4>📊 Profitability Ratios</h4>
              <div className="stat-list">
                <div className="stat-item">
                  <span>Gross Profit Margin:</span>
                  <strong className={totalProfit >= 0 ? 'positive' : 'negative'}>
                    {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0}%
                  </strong>
                </div>
                <div className="stat-item">
                  <span>Operating Expense Ratio:</span>
                  <strong>{totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(2) : 0}%</strong>
                </div>
                <div className="stat-item">
                  <span>Net Profit Ratio:</span>
                  <strong className={totalProfit >= 0 ? 'positive' : 'negative'}>
                    {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0}%
                  </strong>
                </div>
              </div>
            </div>

            <div className="card">
              <h4>📈 Business Metrics</h4>
              <div className="stat-list">
                <div className="stat-item">
                  <span>Average Revenue per Sale:</span>
                  <strong>{formatCurrency(filteredTransactions.length > 0 ? totalRevenue / filteredTransactions.length : 0)}</strong>
                </div>
                <div className="stat-item">
                  <span>Total Transactions:</span>
                  <strong>{filteredTransactions.length}</strong>
                </div>
                <div className="stat-item">
                  <span>Profit per Transaction:</span>
                  <strong className={totalProfit >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(filteredTransactions.length > 0 ? totalProfit / filteredTransactions.length : 0)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Profit & Loss Statement */}
          <div className="card" style={{marginBottom: '20px'}}>
            <h4>Profit & Loss Statement</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">% of Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr className="section-header">
                  <td colSpan={3}><strong>Income</strong></td>
                </tr>
                <tr>
                  <td>Total Sales Revenue</td>
                  <td className="text-right positive">{formatCurrency(totalRevenue)}</td>
                  <td className="text-right">100.00%</td>
                </tr>
                <tr className="section-header">
                  <td colSpan={3}><strong>Operating Expenses</strong></td>
                </tr>
                {Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => (
                    <tr key={category}>
                      <td className="indent">{category}</td>
                      <td className="text-right negative">({formatCurrency(amount)})</td>
                      <td className="text-right">{totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(2) : 0}%</td>
                    </tr>
                ))}
                <tr className="subtotal">
                  <td><strong>Total Operating Expenses</strong></td>
                  <td className="text-right negative"><strong>({formatCurrency(totalExpenses)})</strong></td>
                  <td className="text-right"><strong>{totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(2) : 0}%</strong></td>
                </tr>
                <tr className="total">
                  <td><strong>Net Profit (Loss)</strong></td>
                  <td className={`text-right ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
                    <strong>{formatCurrency(totalProfit)}</strong>
                  </td>
                  <td className={`text-right ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
                    <strong>{totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0}%</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Health Indicators */}
          <div className="grid grid-2">
            <div className="card">
              <h4>💹 Expense Breakdown</h4>
              <div className="stat-list">
                <div className="stat-item">
                  <span>Highest Expense Category:</span>
                  <strong className="negative">
                    {Object.entries(expensesByCategory).length > 0 
                      ? Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a)[0][0] 
                      : 'N/A'}
                  </strong>
                </div>
                <div className="stat-item">
                  <span>Lowest Expense Category:</span>
                  <strong>
                    {Object.entries(expensesByCategory).length > 0 
                      ? Object.entries(expensesByCategory).sort(([, a], [, b]) => a - b)[0][0] 
                      : 'N/A'}
                  </strong>
                </div>
                <div className="stat-item">
                  <span>Number of Expense Categories:</span>
                  <strong>{Object.keys(expensesByCategory).length}</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <h4>🎯 Business Health</h4>
              <div className="stat-list">
                <div className="stat-item">
                  <span>Business Status:</span>
                  <strong className={totalProfit >= 0 ? 'positive' : 'negative'}>
                    {totalProfit >= 0 ? '✅ Profitable' : '⚠️ Loss'}
                  </strong>
                </div>
                <div className="stat-item">
                  <span>Expense Ratio:</span>
                  <strong>{totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}% of Revenue</strong>
                </div>
                <div className="stat-item">
                  <span>Profit Margin:</span>
                  <strong className={totalProfit >= 0 ? 'positive' : 'negative'}>
                    {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}% of Revenue
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="report-section">
          <h3>💸 Expense Analysis</h3>
          
          {/* Expense Summary Cards */}
          <div className="grid grid-4" style={{marginBottom: '30px'}}>
            <div className="summary-card expenses">
              <div className="card-icon">💸</div>
              <div className="card-content">
                <h3>{formatCurrency(totalExpenses)}</h3>
                <p>Total Expenses</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h3>{filteredExpenses.length}</h3>
                <p>Total Records</p>
              </div>
            </div>
            <div className="summary-card warning">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <h3>{formatCurrency(filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0)}</h3>
                <p>Average Expense</p>
              </div>
            </div>
            <div className="summary-card info">
              <div className="card-icon">📑</div>
              <div className="card-content">
                <h3>{Object.keys(expensesByCategory).length}</h3>
                <p>Categories</p>
              </div>
            </div>
          </div>

          {/* Expenses by Category */}
          <div className="card" style={{marginBottom: '20px'}}>
            <h4>Expenses by Category</h4>
            <div className="expense-breakdown">
              {Object.entries(expensesByCategory).length > 0 ? (
                Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => (
                    <div key={category} className="expense-bar">
                      <div className="expense-label">
                        <span>{category}</span>
                        <strong>{formatCurrency(amount)}</strong>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{width: `${(amount / totalExpenses) * 100}%`}}
                        />
                      </div>
                      <span className="percentage">
                        {((amount / totalExpenses) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))
              ) : (
                <p className="no-data" style={{textAlign: 'center', padding: '40px'}}>No expenses found for selected period</p>
              )}
            </div>
          </div>

          {/* Top Expenses Analysis */}
          <div className="grid grid-2" style={{marginBottom: '20px'}}>
            <div className="card">
              <h4>🔥 Highest Expenses</h4>
              <div className="stat-list">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5)
                    .map((expense, idx) => (
                      <div key={expense.id} className="stat-item">
                        <span>#{idx + 1} {expense.category} - {expense.description}:</span>
                        <strong className="negative">{formatCurrency(expense.amount, expense.currency)}</strong>
                      </div>
                    ))
                ) : (
                  <p className="no-data" style={{textAlign: 'center', padding: '20px'}}>No data</p>
                )}
              </div>
            </div>

            <div className="card">
              <h4>📊 Most Expensive Categories</h4>
              <div className="stat-list">
                {Object.entries(expensesByCategory).length > 0 ? (
                  Object.entries(expensesByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([category, amount]) => (
                      <div key={category} className="stat-item">
                        <span>{category}:</span>
                        <strong className="negative">{formatCurrency(amount)}</strong>
                      </div>
                    ))
                ) : (
                  <p className="no-data" style={{textAlign: 'center', padding: '20px'}}>No data</p>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Expense Table */}
          <div className="card">
            <h4>Detailed Expense Records</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map(expense => (
                    <tr key={expense.id}>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                      <td><span className="badge">{expense.category}</span></td>
                      <td>{expense.description}</td>
                      <td className="text-right negative"><strong>{formatCurrency(expense.amount, expense.currency)}</strong></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="no-data">No expenses found for selected period</td>
                  </tr>
                )}
              </tbody>
              {filteredExpenses.length > 0 && (
                <tfoot>
                  <tr className="total">
                    <td colSpan={3}><strong>TOTAL EXPENSES</strong></td>
                    <td className="text-right negative"><strong>{formatCurrency(totalExpenses)}</strong></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="report-section">
          <h3>📊 Performance Dashboard</h3>
          
          {/* Transaction Summary */}
          <div className="card" style={{marginBottom: '20px'}}>
            <h4>Transaction Summary</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td><strong>{transaction.id}</strong></td>
                      <td>{new Date(getTransactionDate(transaction)).toLocaleDateString()}</td>
                      <td><span className="badge">{transaction.type}</span></td>
                      <td>{transaction.vehicleDetails.brand} {transaction.vehicleDetails.model}</td>
                      <td><span className={`status-badge ${transaction.status}`}>{transaction.status}</span></td>
                      <td className="text-right"><strong>{formatCurrency(transaction.pricing.totalAmount, transaction.currency)}</strong></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="no-data">No transactions found for selected period</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-3">
            <div className="card">
              <h4>Transaction Breakdown</h4>
              <div className="stat-list">
                <div className="stat-item">
                  <span>Sales:</span>
                  <strong>{totalSales} transactions</strong>
                </div>
                <div className="stat-item">
                  <span>Reservations:</span>
                  <strong>{totalReservations} transactions</strong>
                </div>
                <div className="stat-item">
                  <span>Leasing:</span>
                  <strong>{totalLeasing} transactions</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <h4>Average Metrics</h4>
              <div className="stat-list">
                <div className="stat-item">
                  <span>Avg Transaction Value:</span>
                  <strong>{formatCurrency(filteredTransactions.length > 0 ? totalRevenue / filteredTransactions.length : 0)}</strong>
                </div>
                <div className="stat-item">
                  <span>Conversion Rate:</span>
                  <strong>{customers.length > 0 ? ((filteredTransactions.length / customers.length) * 100).toFixed(1) : 0}%</strong>
                </div>
                <div className="stat-item">
                  <span>Avg per Customer:</span>
                  <strong>{formatCurrency(customers.length > 0 ? totalRevenue / customers.length : 0)}</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <h4>Growth Indicators</h4>
              <div className="stat-list">
                <div className="stat-item">
                  <span>Total Revenue:</span>
                  <strong className="positive">{formatCurrency(totalRevenue)}</strong>
                </div>
                <div className="stat-item">
                  <span>Net Profit:</span>
                  <strong className={totalProfit >= 0 ? 'positive' : 'negative'}>{formatCurrency(totalProfit)}</strong>
                </div>
                <div className="stat-item">
                  <span>Profit Margin:</span>
                  <strong>{totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trends - Only show in Performance tab */}
      {activeTab === 'performance' && (
        <div className="report-section">
          <h3>Monthly Performance Trends</h3>
          <div className="card">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">Expenses</th>
                  <th className="text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map(month => (
                  <tr key={month.month}>
                    <td><strong>{month.month}</strong></td>
                    <td className="text-right positive">{formatCurrency(month.revenue)}</td>
                    <td className="text-right negative">({formatCurrency(month.expense)})</td>
                    <td className={`text-right ${month.profit >= 0 ? 'positive' : 'negative'}`}>
                      <strong>{formatCurrency(month.profit)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

