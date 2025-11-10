import React, { useState, useEffect } from 'react';
import './ExpenseManager.css';
import { expenseAPI, Expense } from '../utils/api';

// Extend the API Expense interface with UI-specific fields
interface UIExpense extends Expense {
  id?: string;
  paymentMethod?: string;
  notes?: string;
}

const EXPENSE_CATEGORIES = [
  'Electric Bill',
  'Water Bill',
  'Showroom Maintenance',
  'Rent',
  'Salaries',
  'Internet/Phone',
  'Office Supplies',
  'Insurance',
  'Marketing',
  'Fuel/Transport',
  'Others'
];

const ExpenseManager: React.FC = () => {
  const [expenses, setExpenses] = useState<UIExpense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  const [newExpense, setNewExpense] = useState<Omit<UIExpense, 'id' | '_id'>>({
    category: '',
    description: '',
    amount: '' as any,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    currency: 'LKR',
    notes: ''
  });

  const [customCategory, setCustomCategory] = useState('');

  // Fetch expenses on component mount
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoadingExpenses(true);
      setLoadError(null);
      
      const token = localStorage.getItem('authToken');
      console.log('Loading expenses - Token exists:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await expenseAPI.getAll({ limit: 1000 }); // Get all expenses
      console.log('Loaded expenses:', response.expenses.length, 'expenses');
      setExpenses(response.expenses);
    } catch (error: any) {
      console.error('Error loading expenses:', error);
      setLoadError(error.message || 'Failed to load expenses. Please try logging in again.');
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Use custom category if "Others" is selected
      const finalCategory = newExpense.category === 'Others' ? customCategory : newExpense.category;
      
      // Create expense via API
      const expenseData = {
        category: finalCategory,
        description: newExpense.description,
        amount: newExpense.amount,
        date: newExpense.date,
        currency: newExpense.currency,
        paymentMethod: newExpense.paymentMethod,
        notes: newExpense.notes
      };

      const response = await expenseAPI.create(expenseData);
      
      // Add new expense to the list
      setExpenses([response.expense, ...expenses]);
      setShowExpenseForm(false);
      setCustomCategory('');
      setNewExpense({
        category: '',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        currency: 'LKR',
        notes: ''
      });
      
      alert('✅ Expense added successfully!');
    } catch (error: any) {
      console.error('Error adding expense:', error);
      alert(`❌ Failed to add expense: ${error.message}`);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(id);
        setExpenses(expenses.filter(exp => exp._id !== id && exp.id !== id));
        alert('✅ Expense deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting expense:', error);
        alert(`❌ Failed to delete expense: ${error.message}`);
      }
    }
  };

  // Date filtering logic
  const filterByDate = (expense: UIExpense) => {
    if (dateFilter === 'all') return true;
    
    const expenseDate = new Date(expense.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      const expDate = new Date(expense.date);
      expDate.setHours(0, 0, 0, 0);
      return expDate.getTime() === today.getTime();
    }

    if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return expenseDate >= weekAgo;
    }

    if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      return expenseDate >= monthAgo;
    }

    if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
      const start = new Date(customDateRange.start);
      const end = new Date(customDateRange.end);
      return expenseDate >= start && expenseDate <= end;
    }

    return true;
  };

  // Filtered expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesDate = filterByDate(expense);
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryTotals = filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (amount: number, currency: string = 'LKR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="expense-manager">
      {/* Header */}
      <div className="expense-header">
        <div>
          <h2>💰 Expense Management</h2>
          <p className="subtitle">Track and manage your business expenses</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowExpenseForm(true)}
        >
          ➕ Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="expense-summary-grid">
        <div className="summary-card total">
          <div className="summary-icon">💵</div>
          <div className="summary-content">
            <h3>{formatCurrency(totalExpenses)}</h3>
            <p>Total Expenses</p>
          </div>
        </div>
        <div className="summary-card count">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <h3>{filteredExpenses.length}</h3>
            <p>Total Records</p>
          </div>
        </div>
        <div className="summary-card average">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <h3>{formatCurrency(filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0)}</h3>
            <p>Average Expense</p>
          </div>
        </div>
        <div className="summary-card categories">
          <div className="summary-icon">📑</div>
          <div className="summary-content">
            <h3>{Object.keys(categoryTotals).length}</h3>
            <p>Categories</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="expense-filters">
        <div className="filter-row">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateFilter === 'custom' && (
            <>
              <input
                type="date"
                className="date-input"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                placeholder="Start Date"
              />
              <input
                type="date"
                className="date-input"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                placeholder="End Date"
              />
            </>
          )}
        </div>
      </div>

      {/* Expense List */}
      <div className="expense-list-container">
        {isLoadingExpenses ? (
          <div className="no-expenses">
            <p>⏳ Loading expenses...</p>
          </div>
        ) : loadError ? (
          <div className="no-expenses">
            <p>❌ Error: {loadError}</p>
            <button className="btn btn-primary" onClick={loadExpenses}>Retry</button>
          </div>
        ) : filteredExpenses.length > 0 ? (
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => (
                <tr key={expense._id || expense.id}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>
                    <span className="category-badge">{expense.category}</span>
                  </td>
                  <td>
                    <div className="expense-desc">
                      <strong>{expense.description}</strong>
                      {expense.notes && <small>{expense.notes}</small>}
                    </div>
                  </td>
                  <td className="amount-cell">
                    <strong>{formatCurrency(expense.amount, expense.currency)}</strong>
                  </td>
                  <td>{expense.paymentMethod || 'N/A'}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteExpense(expense._id || expense.id || '')}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-expenses">
            <p>📭 No expenses found. Add your first expense to get started!</p>
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="vehicle-order-form-overlay">
          <div className="vehicle-order-form">
            <div className="form-header">
              <h2>➕ Add New Expense</h2>
              <button className="close-btn" onClick={() => setShowExpenseForm(false)}>×</button>
            </div>

            <form onSubmit={handleAddExpense}>
              <div className="form-sections">
                <div className="form-section">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        className="form-input"
                        value={newExpense.category}
                        onChange={(e) => {
                          setNewExpense({...newExpense, category: e.target.value});
                          if (e.target.value !== 'Others') {
                            setCustomCategory('');
                          }
                        }}
                        required
                      >
                        <option value="">Select Category</option>
                        {EXPENSE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {newExpense.category === 'Others' && (
                      <div className="form-group">
                        <label>Custom Category Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Enter custom category name"
                          required
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label>Date *</label>
                      <input
                        type="date"
                        className="form-input"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Amount *</label>
                      <input
                        type="number"
                        className="form-input"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                        onWheel={(e) => e.currentTarget.blur()}
                        min="0"
                        step="any"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Currency *</label>
                      <select
                        className="form-input"
                        value={newExpense.currency}
                        onChange={(e) => setNewExpense({...newExpense, currency: e.target.value as any})}
                        required
                      >
                        <option value="LKR">LKR (Rs.)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Payment Method *</label>
                      <select
                        className="form-input"
                        value={newExpense.paymentMethod}
                        onChange={(e) => setNewExpense({...newExpense, paymentMethod: e.target.value})}
                        required
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label>Description *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                        placeholder="Enter expense description"
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Notes (Optional)</label>
                      <textarea
                        className="form-input"
                        value={newExpense.notes}
                        onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                        rows={3}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowExpenseForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;

