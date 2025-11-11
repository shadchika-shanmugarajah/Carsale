import React, { useState, useEffect } from 'react';
import './OrderTracking.css';
import { vehicleOrderAPI, VehicleOrder as APIVehicleOrder } from '../utils/api';

interface VehicleOrder {
  _id?: string;
  id?: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerContact: string;
  customerNIC?: string;
  vehicleDetails: {
    brand: string;
    model: string;
    year: number;
    color: string;
    chassisNo?: string;
    specifications?: string;
  };
  pricing: {
    vehiclePrice: number;
    taxes: number;
    fees: number;
    totalAmount: number;
  };
  advancePayment: number;
  balanceAmount: number;
  orderStatus: 'pending' | 'confirmed' | 'in_transit' | 'arrived' | 'delivered' | 'cancelled';
  expectedArrivalDate?: string;
  actualArrivalDate?: string;
  deliveryDate?: string;
  notes?: string;
  timeline: {
    date: string;
    status: string;
    description: string;
  }[];
}

interface OrderTrackingProps {
  onMoveToInventory: (order: VehicleOrder) => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ onMoveToInventory }) => {
  const [orders, setOrders] = useState<VehicleOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<VehicleOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<VehicleOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoadingOrders(true);
      setLoadError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Only fetch customer orders, not import orders
      const response = await vehicleOrderAPI.getAll({ limit: 1000, orderType: 'customer' });
      console.log('Loaded customer orders:', response.orders.length, 'orders');
      setOrders(response.orders);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      setLoadError(error.message || 'Failed to load orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleSaveNewOrder = async (orderData: Omit<VehicleOrder, '_id' | 'id'>) => {
    try {
      // Set orderType to 'customer' for customer bookings
      const customerOrderData = {
        ...orderData,
        orderType: 'customer' as const
      };
      const response = await vehicleOrderAPI.create(customerOrderData);
      setOrders([response.order, ...orders]);
      setShowOrderForm(false);
      alert('✅ Order created successfully!');
      loadOrders(); // Refresh the list
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(`❌ Failed to create order: ${error.message}`);
    }
  };

  const handleUpdateOrder = async (orderId: string, orderData: Partial<VehicleOrder>) => {
    try {
      const response = await vehicleOrderAPI.update(orderId, orderData);
      setOrders(orders.map(o => (o._id === orderId || o.id === orderId) ? response.order : o));
      setEditingOrder(null);
      alert('✅ Order updated successfully!');
    } catch (error: any) {
      console.error('Error updating order:', error);
      alert(`❌ Failed to update order: ${error.message}`);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`⚠️ Are you sure you want to delete order ${orderNumber}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await vehicleOrderAPI.delete(orderId);
      setOrders(orders.filter(o => (o._id !== orderId && o.id !== orderId)));
      alert('✅ Order deleted successfully!');
      loadOrders(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting order:', error);
      alert(`❌ Failed to delete order: ${error.message}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#ffc107',
      confirmed: '#2196f3',
      in_transit: '#9c27b0',
      arrived: '#4caf50',
      delivered: '#4caf50',
      cancelled: '#f44336'
    };
    return colors[status] || '#757575';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: '⏳',
      confirmed: '✅',
      in_transit: '🚢',
      arrived: '📦',
      delivered: '🚗',
      cancelled: '❌'
    };
    return icons[status] || '📋';
  };

  const handleMoveToInventory = async (order: VehicleOrder) => {
    if (order.orderStatus !== 'arrived') {
      alert('Vehicle must be in "Arrived" status before moving to inventory!');
      return;
    }
    
    if (window.confirm(`Move ${order.vehicleDetails.brand} ${order.vehicleDetails.model} to inventory?`)) {
      try {
        // Move to inventory first
        await onMoveToInventory(order);
        
        // Then update order status to delivered
        const orderId = order._id || order.id;
        if (orderId) {
          await handleUpdateOrder(orderId, {
            orderStatus: 'delivered',
            deliveryDate: new Date().toISOString().split('T')[0]
          });
        }
      } catch (error: any) {
        console.error('Error in move to inventory process:', error);
        alert(`Failed to complete the operation: ${error.message}`);
      }
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: VehicleOrder['orderStatus']) => {
    const order = orders.find(o => o._id === orderId || o.id === orderId);
    if (!order) return;
    
    const newTimeline = [...order.timeline, {
      date: new Date().toISOString().split('T')[0],
      status: newStatus.replace('_', ' ').toUpperCase(),
      description: `Status updated to ${newStatus}`
    }];
    
    const updatedData: Partial<VehicleOrder> = {
      orderStatus: newStatus,
      timeline: newTimeline,
      actualArrivalDate: newStatus === 'arrived' ? new Date().toISOString().split('T')[0] : order.actualArrivalDate
    };
    
    const dbOrderId = order._id || order.id || '';
    if (dbOrderId) {
      await handleUpdateOrder(dbOrderId, updatedData);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicleDetails.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicleDetails.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    confirmed: orders.filter(o => o.orderStatus === 'confirmed').length,
    inTransit: orders.filter(o => o.orderStatus === 'in_transit').length,
    arrived: orders.filter(o => o.orderStatus === 'arrived').length,
    totalAdvance: orders.reduce((sum, o) => sum + o.advancePayment, 0),
    totalValue: orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').reduce((sum, o) => sum + o.pricing.totalAmount, 0)
  };

  return (
    <div className="order-tracking-container">
      {/* Header */}
      <div className="tracking-header">
        <div>
          <h2>📋 Customer Bookings & Pre-Orders</h2>
          <p className="subtitle">Track customer vehicle bookings from order to delivery</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowOrderForm(true)}>
          ➕ New Booking
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>📦</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>🚢</div>
          <div className="stat-content">
            <h3>{stats.inTransit}</h3>
            <p>In Transit</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>✅</div>
          <div className="stat-content">
            <h3>{stats.arrived}</h3>
            <p>Arrived</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalAdvance)}</h3>
            <p>Total Advances</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="tracking-filters">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by order number, customer, or vehicle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_transit">In Transit</option>
          <option value="arrived">Arrived</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="orders-grid">
        {filteredOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <div>
                <h3>{order.vehicleDetails.brand} {order.vehicleDetails.model}</h3>
                <p className="order-number">{order.orderNumber}</p>
              </div>
              <div 
                className="status-badge"
                style={{background: getStatusColor(order.orderStatus)}}
              >
                {getStatusIcon(order.orderStatus)} {order.orderStatus.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            <div className="order-details">
              <div className="detail-row">
                <span className="label">👤 Customer:</span>
                <span className="value">{order.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="label">📞 Contact:</span>
                <span className="value">{order.customerContact}</span>
              </div>
              <div className="detail-row">
                <span className="label">🎨 Color:</span>
                <span className="value">{order.vehicleDetails.color}</span>
              </div>
              <div className="detail-row">
                <span className="label">📅 Order Date:</span>
                <span className="value">{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              {order.expectedArrivalDate && (
                <div className="detail-row">
                  <span className="label">🚢 Expected:</span>
                  <span className="value">{new Date(order.expectedArrivalDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="order-pricing">
              <div className="pricing-row">
                <span>Total Amount:</span>
                <strong>{formatCurrency(order.pricing.totalAmount)}</strong>
              </div>
              <div className="pricing-row advance">
                <span>Advance Paid:</span>
                <strong>{formatCurrency(order.advancePayment)}</strong>
              </div>
              <div className="pricing-row balance">
                <span>Balance:</span>
                <strong>{formatCurrency(order.balanceAmount)}</strong>
              </div>
            </div>

            <div className="order-actions">
              <button 
                className="btn-action btn-view"
                onClick={() => setSelectedOrder(order)}
              >
                👁️ View Details
              </button>

              <button 
                className="btn-action btn-edit"
                onClick={() => setEditingOrder(order)}
              >
                ✏️ Edit
              </button>

              <button 
                className="btn-action btn-delete"
                onClick={() => handleDeleteOrder(order._id || order.id || '', order.orderNumber)}
              >
                🗑️ Delete
              </button>
              
              {order.orderStatus === 'arrived' && (
                <button 
                  className="btn-action btn-inventory"
                  onClick={() => handleMoveToInventory(order)}
                >
                  📦 Move to Inventory
                </button>
              )}

              {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                <select
                  className="status-update-select"
                  value={order.orderStatus}
                  onChange={(e) => handleUpdateStatus(order._id || order.id || '', e.target.value as VehicleOrder['orderStatus'])}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_transit">In Transit</option>
                  <option value="arrived">Arrived</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="no-orders">
          <p>📭 No orders found</p>
        </div>
      )}

      {/* Edit Order Form Modal */}
      {editingOrder && (
        <div className="modal-overlay" onClick={() => setEditingOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Booking - {editingOrder.orderNumber}</h2>
              <button className="close-btn" onClick={() => setEditingOrder(null)}>×</button>
            </div>

            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                // Helper to safely parse numbers
                const parseNumber = (val: any): number => {
                  const num = parseFloat(val);
                  return isNaN(num) ? 0 : num;
                };
                
                const vehiclePrice = parseNumber(formData.get('vehiclePrice'));
                const taxes = parseNumber(formData.get('taxes'));
                const fees = parseNumber(formData.get('fees'));
                const advancePayment = parseNumber(formData.get('advancePayment'));
                const year = parseInt(formData.get('year') as string) || new Date().getFullYear();
                
                const totalAmount = vehiclePrice + taxes + fees;
                const balanceAmount = totalAmount - advancePayment;
                
                const updatedOrder: VehicleOrder = {
                  ...editingOrder,
                  customerName: formData.get('customerName') as string,
                  customerContact: formData.get('customerContact') as string,
                  customerNIC: formData.get('customerNIC') as string,
                  vehicleDetails: {
                    brand: formData.get('brand') as string,
                    model: formData.get('model') as string,
                    year: year,
                    color: formData.get('color') as string,
                    chassisNo: formData.get('chassisNo') as string,
                    specifications: formData.get('specifications') as string
                  },
                  pricing: {
                    vehiclePrice: Number(vehiclePrice) || 0,
                    taxes: Number(taxes) || 0,
                    fees: Number(fees) || 0,
                    totalAmount: Number(totalAmount) || 0
                  },
                  advancePayment: Number(advancePayment) || 0,
                  balanceAmount: Number(balanceAmount) || 0,
                  expectedArrivalDate: formData.get('expectedArrivalDate') as string,
                };
                
                // Add timeline entry for update
                updatedOrder.timeline = [
                  ...editingOrder.timeline,
                  {
                    date: new Date().toISOString().split('T')[0],
                    status: 'Updated',
                    description: 'Booking details updated'
                  }
                ];
                
                console.log('Updating customer booking with data:', JSON.stringify(updatedOrder, null, 2));
                
                // Update in database
                const orderId = editingOrder._id || editingOrder.id || '';
                if (orderId) {
                  handleUpdateOrder(orderId, updatedOrder);
                } else {
                  alert('Error: Order ID not found');
                }
              }}>
                <div className="details-section">
                  <h3>Customer Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Customer Name *</label>
                      <input type="text" name="customerName" className="form-input" defaultValue={editingOrder.customerName} required />
                    </div>
                    <div className="info-item">
                      <label>Contact Number *</label>
                      <input type="tel" name="customerContact" className="form-input" defaultValue={editingOrder.customerContact} required />
                    </div>
                    <div className="info-item full-width">
                      <label>NIC Number *</label>
                      <input type="text" name="customerNIC" className="form-input" defaultValue={editingOrder.customerNIC} required />
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Vehicle Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Brand *</label>
                      <input type="text" name="brand" className="form-input" defaultValue={editingOrder.vehicleDetails.brand} required />
                    </div>
                    <div className="info-item">
                      <label>Model *</label>
                      <input type="text" name="model" className="form-input" defaultValue={editingOrder.vehicleDetails.model} required />
                    </div>
                    <div className="info-item">
                      <label>Year *</label>
                      <input type="number" name="year" className="form-input" onWheel={(e) => e.currentTarget.blur()} min="2000" max="2030" defaultValue={editingOrder.vehicleDetails.year} required />
                    </div>
                    <div className="info-item">
                      <label>Color *</label>
                      <input type="text" name="color" className="form-input" defaultValue={editingOrder.vehicleDetails.color} required />
                    </div>
                    <div className="info-item">
                      <label>Chassis No</label>
                      <input type="text" name="chassisNo" className="form-input" defaultValue={editingOrder.vehicleDetails.chassisNo} placeholder="e.g., ABC-1234" />
                    </div>
                    <div className="info-item full-width">
                      <label>Specifications</label>
                      <textarea name="specifications" className="form-input" rows={2} defaultValue={editingOrder.vehicleDetails.specifications} placeholder="e.g., Full Option, Sunroof, Leather Seats"></textarea>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Pricing & Payment</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Vehicle Price (LKR) *</label>
                      <input type="number" name="vehiclePrice" className="form-input" onWheel={(e) => e.currentTarget.blur()} step="any" defaultValue={editingOrder.pricing.vehiclePrice} required placeholder="e.g., 5000000" />
                    </div>
                    <div className="info-item">
                      <label>Taxes (LKR) <span style={{color: '#7f8c8d', fontSize: '12px'}}>(Optional)</span></label>
                      <input type="number" name="taxes" className="form-input" onWheel={(e) => e.currentTarget.blur()} step="any" defaultValue={editingOrder.pricing.taxes} placeholder="Enter taxes amount" />
                    </div>
                    <div className="info-item">
                      <label>Fees (LKR) <span style={{color: '#7f8c8d', fontSize: '12px'}}>(Optional)</span></label>
                      <input type="number" name="fees" className="form-input" onWheel={(e) => e.currentTarget.blur()} step="any" defaultValue={editingOrder.pricing.fees} placeholder="Enter fees amount" />
                    </div>
                    <div className="info-item">
                      <label>Advance Payment (LKR) *</label>
                      <input type="number" name="advancePayment" className="form-input" onWheel={(e) => e.currentTarget.blur()} step="any" defaultValue={editingOrder.advancePayment} required placeholder="e.g., 500000" />
                    </div>
                    <div className="info-item full-width">
                      <label>Expected Arrival Date <span style={{color: '#7f8c8d', fontSize: '12px'}}>(Optional)</span></label>
                      <input type="date" name="expectedArrivalDate" className="form-input" defaultValue={editingOrder.expectedArrivalDate} />
                    </div>
                  </div>
                </div>

                <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'}}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingOrder(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    💾 Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Booking Form Modal */}
      {showOrderForm && (
        <div className="modal-overlay" onClick={() => setShowOrderForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ New Customer Booking</h2>
              <button className="close-btn" onClick={() => setShowOrderForm(false)}>×</button>
            </div>

            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                // Helper to safely parse numbers
                const parseNumber = (val: any): number => {
                  const num = parseFloat(val);
                  return isNaN(num) ? 0 : num;
                };
                
                const vehiclePrice = parseNumber(formData.get('vehiclePrice'));
                const taxes = parseNumber(formData.get('taxes'));
                const fees = parseNumber(formData.get('fees'));
                const advancePayment = parseNumber(formData.get('advancePayment'));
                const year = parseInt(formData.get('year') as string) || new Date().getFullYear();
                
                // Validate required fields
                if (!formData.get('customerName') || !formData.get('vehiclePrice') || vehiclePrice <= 0) {
                  alert('⚠️ Please fill in all required fields (Customer Name, Vehicle Price)');
                  return;
                }
                
                const totalAmount = vehiclePrice + taxes + fees;
                const balanceAmount = totalAmount - advancePayment;
                
                const orderData = {
                  orderNumber: `CUST-${Date.now()}`,
                  orderDate: new Date().toISOString().split('T')[0],
                  customerName: formData.get('customerName') as string,
                  customerContact: formData.get('customerContact') as string,
                  customerNIC: formData.get('customerNIC') as string,
                  vehicleDetails: {
                    brand: formData.get('brand') as string,
                    model: formData.get('model') as string,
                    year: year,
                    color: formData.get('color') as string,
                    chassisNo: formData.get('chassisNo') as string,
                    specifications: formData.get('specifications') as string
                  },
                  pricing: {
                    vehiclePrice: Number(vehiclePrice) || 0,
                    taxes: Number(taxes) || 0,
                    fees: Number(fees) || 0,
                    totalAmount: Number(totalAmount) || 0
                  },
                  advancePayment: Number(advancePayment) || 0,
                  balanceAmount: Number(balanceAmount) || 0,
                  orderStatus: 'pending' as const,
                  expectedArrivalDate: formData.get('expectedArrivalDate') as string,
                  timeline: [{
                    date: new Date().toISOString().split('T')[0],
                    status: 'Order Placed',
                    description: 'Customer placed booking with advance payment'
                  }]
                };
                
                console.log('Creating customer booking with data:', JSON.stringify(orderData, null, 2));
                
                // Save to database (without id - backend will generate _id)
                handleSaveNewOrder(orderData);
              }}>
                <div className="details-section">
                  <h3>Customer Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Customer Name *</label>
                      <input type="text" name="customerName" className="form-input" required />
                    </div>
                    <div className="info-item">
                      <label>Contact Number *</label>
                      <input type="tel" name="customerContact" className="form-input" required />
                    </div>
                    <div className="info-item full-width">
                      <label>NIC Number *</label>
                      <input type="text" name="customerNIC" className="form-input" required />
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Vehicle Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Brand *</label>
                      <input type="text" name="brand" className="form-input" required />
                    </div>
                    <div className="info-item">
                      <label>Model *</label>
                      <input type="text" name="model" className="form-input" required />
                    </div>
                    <div className="info-item">
                      <label>Year *</label>
                      <input type="number" name="year" className="form-input" onWheel={(e) => e.currentTarget.blur()} min="2000" max="2030" required />
                    </div>
                    <div className="info-item">
                      <label>Color *</label>
                      <input type="text" name="color" className="form-input" required />
                    </div>
                    <div className="info-item">
                      <label>Chassis No</label>
                      <input type="text" name="chassisNo" className="form-input" placeholder="e.g., ABC-1234" />
                    </div>
                    <div className="info-item full-width">
                      <label>Specifications</label>
                      <textarea name="specifications" className="form-input" rows={2} placeholder="e.g., Full Option, Sunroof, Leather Seats"></textarea>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Pricing & Payment</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Vehicle Price (LKR) *</label>
                      <input type="number" name="vehiclePrice" className="form-input" onWheel={(e) => e.currentTarget.blur()} step="any" required placeholder="e.g., 5000000" />
                    </div>
                    <div className="info-item">
                      <label>Taxes (LKR) <span style={{color: '#7f8c8d', fontSize: '12px'}}>(Optional)</span></label>
                      <input type="number" name="taxes" className="form-input" onWheel={(e) => e.currentTarget.blur()} step="any" placeholder="Enter taxes amount" />
                    </div>
                    <div className="info-item">
                      <label>Fees (LKR) <span style={{color: '#7f8c8d', fontSize: '12px'}}>(Optional)</span></label>
                      <input type="number" name="fees" className="form-input" onWheel={(e) => e.currentTarget.blur()} step="any" placeholder="Enter fees amount" />
                    </div>
                    <div className="info-item">
                      <label>Advance Payment (LKR) *</label>
                      <input type="number" name="advancePayment" className="form-input" onWheel={(e) => e.currentTarget.blur()} step="any" required placeholder="e.g., 500000" />
                    </div>
                    <div className="info-item full-width">
                      <label>Expected Arrival Date <span style={{color: '#7f8c8d', fontSize: '12px'}}>(Optional)</span></label>
                      <input type="date" name="expectedArrivalDate" className="form-input" />
                    </div>
                  </div>
                </div>

                <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'}}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowOrderForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Order Details</h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="details-section">
                <h3>Vehicle Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Brand:</label>
                    <span>{selectedOrder.vehicleDetails.brand}</span>
                  </div>
                  <div className="info-item">
                    <label>Model:</label>
                    <span>{selectedOrder.vehicleDetails.model}</span>
                  </div>
                  <div className="info-item">
                    <label>Year:</label>
                    <span>{selectedOrder.vehicleDetails.year}</span>
                  </div>
                  <div className="info-item">
                    <label>Color:</label>
                    <span>{selectedOrder.vehicleDetails.color}</span>
                  </div>
                  {selectedOrder.vehicleDetails.chassisNo && (
                    <div className="info-item">
                      <label>Chassis No:</label>
                      <span>{selectedOrder.vehicleDetails.chassisNo}</span>
                    </div>
                  )}
                  {selectedOrder.vehicleDetails.specifications && (
                    <div className="info-item full-width">
                      <label>Specifications:</label>
                      <span>{selectedOrder.vehicleDetails.specifications}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="details-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className="info-item">
                    <label>Contact:</label>
                    <span>{selectedOrder.customerContact}</span>
                  </div>
                  <div className="info-item full-width">
                    <label>NIC:</label>
                    <span>{selectedOrder.customerNIC}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Order Timeline</h3>
                <div className="timeline">
                  {selectedOrder.timeline.map((event, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-date">{new Date(event.date).toLocaleDateString()}</div>
                        <div className="timeline-status">{event.status}</div>
                        <div className="timeline-desc">{event.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;

