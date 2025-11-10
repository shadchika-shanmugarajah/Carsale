import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import VehicleOrderForm from './VehicleOrderForm';
import Billing from './Billing';
import BankInvoice from './BankInvoice';
import CustomerInvoice from './CustomerInvoice';
import ExpenseManager from './ExpenseManager';
import Reports from './Reports';
import OrderTracking from './OrderTracking';
import { customerAPI, inventoryAPI, transactionAPI, vehicleOrderAPI, expenseAPI } from '../utils/api';

// Vehicle Order interface for internal import orders
interface VehicleOrder {
  _id?: string;
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
  profit?: number;
  sellingPrice?: number;
  supplier?: string;
  expectedDelivery?: string;
  paymentMethod?: string;
  notes?: string;
  // Advanced fields
  customerInfo?: {
    name: string;
    contact: string;
    paymentMethod: string;
  };
  profitMargin?: number;
  saleDate?: string;
  marketValue?: number;
  depreciation?: number;
  // LC and Additional fields
  vehicleNumber?: string;
  lcAmount?: number;
  lcBank?: string;
  additionalInfo?: string;
  // Basic Information fields
  vinNumber?: string;
  licensePlateNumber?: string;
  customBasicInfo?: { [key: string]: string };
}

interface InventoryItem {
  _id?: string;
  id: string;
  model: string;
  brand: string;
  year: number;
  color: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair';
  purchasePrice: number;
  marketValue: number;
  sellingPrice?: number;
  currency: 'USD' | 'JPY' | 'EUR' | 'GBP' | 'LKR';
  location: string;
  status: 'available' | 'reserved' | 'sold' | 'maintenance';
  dateAdded: string;
  lastUpdated: string;
  features: string[];
  images?: string[];
  vin?: string;
  licensePlate?: string;
  registrationNo?: string;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'manual' | 'automatic' | 'cvt';
  engineSize?: string;
  bodyType: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'pickup' | 'van' | 'other';
  supplier?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  notes?: string;
  reservedBy?: {
    name: string;
    contact: string;
    reservationDate: string;
    depositAmount?: number;
  };
  soldInfo?: {
    customerName: string;
    customerContact: string;
    saleDate: string;
    finalPrice: number;
    paymentMethod: string;
  };
}

interface InventoryFormData {
  model: string;
  brand: string;
  year: number;
  color: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair';
  purchasePrice: number;
  marketValue: number;
  sellingPrice?: number;
  currency: 'USD' | 'JPY' | 'EUR' | 'GBP' | 'LKR';
  location: string;
  features: string[];
  vin?: string;
  licensePlate?: string;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'manual' | 'automatic' | 'cvt';
  engineSize?: string;
  bodyType: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'pickup' | 'van' | 'other';
  supplier?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  notes?: string;
}

// Billing & POS Interfaces
interface Customer {
  _id?: string;
  id: string;
  name: string;
  contact: string;
  email?: string;
  address?: string;
  idNumber?: string;
  notes?: string;
  nic?: string;
  registrationDate?: string;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  notes?: string;
  currency: 'USD' | 'LKR' | 'EUR' | 'JPY';
}

interface LeasingCompany {
  id: string;
  name: string;
  branch?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface LeasingDetails {
  leasingCompanyId: string;
  leasingCompanyName: string;
  leasingCompanyBranch?: string;
  leaseReferenceNo: string;
  downPayment: number;
  leasingAmount: number;
  monthlyInstallment: number;
  tenure: number; // in months
  startDate: string;
  endDate: string;
  interestRate?: number;
}

interface PaymentRecord {
  id: string;
  transactionId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check' | 'finance' | 'leasing';
  paymentDate: string;
  receivedBy: string;
  notes?: string;
  // Leasing specific fields
  leasingDetails?: LeasingDetails;
}

interface Transaction {
  _id?: string;
  id: string;
  type: 'reservation' | 'sale' | 'refund' | 'leasing';
  customerId: string;
  inventoryId: string;
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
  payments: PaymentRecord[];
  totalPaid: number;
  balanceRemaining: number;
  status: 'pending' | 'partial_paid' | 'fully_paid' | 'overdue' | 'cancelled' | 'completed';
  reservationDate?: string;
  expectedDelivery?: string;
  completionDate?: string;
  currency: 'USD' | 'JPY' | 'EUR' | 'GBP' | 'LKR';
  notes?: string;
  invoiceNumber?: string;
  // Leasing specific fields
  paymentMode?: 'cash' | 'bank_transfer' | 'leasing';
  isLeasing?: boolean;
  leasingDetails?: LeasingDetails;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  transactionId: string;
  customerId: string;
  issueDate: string;
  dueDate: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  currency: 'USD' | 'JPY' | 'EUR' | 'GBP' | 'LKR';
  notes?: string;
}

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
  vehicleNumber: string;
  lcAmount: number;
  lcBank: string;
  additionalInfo: string;
  // Basic Information fields
  vinNumber: string;
  licensePlateNumber: string;
  customBasicInfo: { [key: string]: string };
}

interface DashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTab, onTabChange }) => {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<VehicleOrder | null>(null);
  const [orderDetailsModal, setOrderDetailsModal] = useState<VehicleOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Inventory management state
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [inventoryDetailsModal, setInventoryDetailsModal] = useState<InventoryItem | null>(null);
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<string>('all');
  const [inventoryConditionFilter, setInventoryConditionFilter] = useState<string>('all');
  
  // API loading states
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  
  // Load data from APIs
  useEffect(() => {
    loadInventory();
    loadTransactions();
    loadCustomers();
    loadVehicleOrders();
    loadExpensesData();
  }, []);
  
  // Reload expenses when switching to overview tab to get latest data
  useEffect(() => {
    if (activeTab === 'overview') {
      loadExpensesData();
    }
  }, [activeTab]);
  
  const loadExpensesData = async () => {
    try {
      const response = await expenseAPI.getAll({ limit: 1000 });
      const expensesData = response.expenses || [];
      setExpenses(expensesData.map((e: any) => ({
        ...e,
        id: e._id || e.id || '',
        category: e.category || 'Other',
        description: e.description || '',
        amount: e.amount || 0,
        date: e.date || new Date().toISOString(),
        currency: e.currency || 'LKR'
      })));
      console.log('Loaded expenses for dashboard:', expensesData.length);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    }
  };
  
  const loadVehicleOrders = async () => {
    try {
      setIsLoadingOrders(true);
      // Only fetch import orders, not customer orders
      const response = await vehicleOrderAPI.getAll({ limit: 1000, orderType: 'import' });
      console.log('Loaded import orders:', response.orders.length, 'orders');
      // Map API data to Dashboard format
      const mappedOrders = response.orders.map((order: any) => ({
        id: order._id,
        _id: order._id,
        model: order.vehicleDetails?.model || 'Unknown',
        year: order.vehicleDetails?.year || new Date().getFullYear(),
        country: order.country || 'N/A',
        orderDate: order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '',
        status: order.orderStatus === 'delivered' ? 'completed' : 
                order.orderStatus === 'in_transit' ? 'shipped' : 
                order.orderStatus === 'arrived' ? 'clearing' : 'ordered',
        totalCost: order.pricing?.totalAmount || 0,
        expenses: {
          vehicleCost: order.pricing?.vehiclePrice || 0,
          fuel: 0,
          duty: order.pricing?.taxes || 0,
          driverCharge: 0,
          clearanceCharge: order.pricing?.fees || 0,
          demurrage: 0,
          tax: 0,
          customExpenses: {}
        },
        currency: 'USD',
        supplier: order.supplier || 'N/A',
        expectedDelivery: order.expectedArrivalDate ? new Date(order.expectedArrivalDate).toISOString().split('T')[0] : '',
        paymentMethod: order.paymentMethod || 'N/A',
        notes: order.notes || '',
        customerInfo: {
          name: order.customerName || '',
          contact: order.customerContact || '',
          paymentMethod: 'N/A'
        }
      }));
      setVehicleOrders(mappedOrders as any);
    } catch (error) {
      console.error('Error loading vehicle orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };
  
  const loadInventory = async () => {
    try {
      setIsLoadingInventory(true);
      const response = await inventoryAPI.getAll({ limit: 1000 });
      console.log('Loaded inventory:', response.items.length, 'items');
      // Map API data to Dashboard format with defaults for missing fields
      const mappedItems = response.items.map((item: any) => ({
        id: item._id,
        _id: item._id,
        model: item.model,
        brand: item.brand,
        year: item.year,
        color: item.color,
        mileage: item.mileage || 0,
        condition: item.condition || 'good', // Default if not set
        purchasePrice: item.purchasePrice,
        marketValue: item.marketValue || item.sellingPrice || item.purchasePrice * 1.2,
        sellingPrice: item.sellingPrice,
        currency: item.currency || 'USD',
        location: item.location || 'Showroom',
        status: item.status || 'available',
        dateAdded: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        lastUpdated: item.updatedAt ? new Date(item.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        features: item.features || [],
        images: item.images || [],
        vin: item.vin,
        licensePlate: item.licensePlate,
        registrationNo: item.registrationNo || item.licensePlate,
        fuelType: item.fuelType || 'gasoline',
        transmission: item.transmission || 'automatic',
        engineSize: item.engineSize,
        bodyType: item.bodyType || 'sedan',
        supplier: item.supplier,
        purchaseDate: item.purchaseDate,
        warrantyExpiry: item.warrantyExpiry,
        notes: item.notes
      }));
      setInventoryItems(mappedItems as any);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setIsLoadingInventory(false);
    }
  };
  
  const loadTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const response = await transactionAPI.getAll({ limit: 1000 });
      console.log('Loaded transactions:', response.transactions.length, 'transactions');
      // Map API data to Dashboard format with defaults
      const mappedTransactions = response.transactions.map((txn: any) => {
        const customerId = typeof txn.customerId === 'object' ? (txn.customerId?._id || txn.customerId?.id) : txn.customerId;
        
        console.log('Transaction mapping:', {
          transactionId: txn._id,
          originalCustomerId: txn.customerId,
          extractedCustomerId: customerId,
          customerIdType: typeof txn.customerId
        });
        
        return {
          id: txn._id,
          _id: txn._id,
          type: txn.type || 'sale',
          status: txn.status || 'pending',
          customerId: customerId,
          inventoryId: txn.inventoryId,
          vehicleDetails: txn.vehicleDetails || {},
          pricing: txn.pricing || { vehiclePrice: 0, taxes: 0, fees: 0, discount: 0, totalAmount: 0 },
          totalPaid: txn.totalPaid || 0,
          balanceRemaining: txn.balanceRemaining || 0,
          payments: txn.payments || [],
          currency: txn.currency || 'USD',
          invoiceNumber: txn.invoiceNumber,
          reservationDate: txn.reservationDate,
          completionDate: txn.completionDate,
          notes: txn.notes,
          paymentMode: txn.paymentMode,
          isLeasing: txn.isLeasing || false,
          leasingDetails: txn.leasingDetails
        };
      });
      setTransactions(mappedTransactions as any);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };
  
  const loadCustomers = async () => {
    try {
      setIsLoadingCustomers(true);
      const response = await customerAPI.getAll({ limit: 1000 });
      console.log('Loaded customers:', response.customers.length, 'customers');
      const mappedCustomers = response.customers.map((c: any) => ({
        id: c._id,
        _id: c._id,
        ...c
      }));
      console.log('Mapped customers:', mappedCustomers.map(c => ({ id: c.id, name: c.name })));
      setCustomers(mappedCustomers as any);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };
  
  // Inventory CRUD operations
  const handleSaveInventoryItem = async (itemData: any) => {
    try {
      // Map frontend data to backend model format
      const backendData = {
        model: itemData.model,
        brand: itemData.brand,
        year: Number(itemData.year) || new Date().getFullYear(),
        color: itemData.color,
        vin: itemData.vin || undefined,
        licensePlate: itemData.licensePlate || undefined,
        fuelType: itemData.fuelType,
        engineSize: itemData.engineSize || undefined,
        transmission: itemData.transmission || undefined,
        mileage: itemData.mileage ? Number(itemData.mileage) : undefined,
        purchasePrice: Number(itemData.purchasePrice) || 0,
        sellingPrice: itemData.sellingPrice ? Number(itemData.sellingPrice) : undefined,
        currency: itemData.currency || 'LKR',
        status: 'available' as const,
        location: itemData.location || undefined,
        notes: itemData.notes || undefined,
        images: itemData.images || []
      };
      
      console.log('Creating inventory item with data:', JSON.stringify(backendData, null, 2));
      
      const response = await inventoryAPI.create(backendData);
      await loadInventory(); // Refresh list
      alert('✅ Inventory item added successfully!');
      return response.item;
    } catch (error: any) {
      console.error('Error creating inventory item:', error);
      alert(`❌ Failed to add item: ${error.message}`);
      throw error;
    }
  };
  
  const handleUpdateInventoryItem = async (id: string, itemData: any) => {
    try {
      // Map frontend data to backend model format
      const backendData = {
        model: itemData.model,
        brand: itemData.brand,
        year: Number(itemData.year) || new Date().getFullYear(),
        color: itemData.color,
        vin: itemData.vin || undefined,
        licensePlate: itemData.licensePlate || undefined,
        fuelType: itemData.fuelType,
        engineSize: itemData.engineSize || undefined,
        transmission: itemData.transmission || undefined,
        mileage: itemData.mileage ? Number(itemData.mileage) : undefined,
        purchasePrice: Number(itemData.purchasePrice) || 0,
        sellingPrice: itemData.sellingPrice ? Number(itemData.sellingPrice) : undefined,
        currency: itemData.currency || 'LKR',
        status: itemData.status || 'available',
        location: itemData.location || undefined,
        notes: itemData.notes || undefined,
        images: itemData.images || []
      };
      
      console.log('Updating inventory item with data:', JSON.stringify(backendData, null, 2));
      
      await inventoryAPI.update(id, backendData);
      await loadInventory(); // Refresh list
      alert('✅ Inventory item updated successfully!');
    } catch (error: any) {
      console.error('Error updating inventory item:', error);
      alert(`❌ Failed to update item: ${error.message}`);
      throw error;
    }
  };
  
  const handleDeleteInventoryItem = async (id: string) => {
    try {
      await inventoryAPI.delete(id);
      await loadInventory(); // Refresh list
      alert('✅ Inventory item deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting inventory item:', error);
      alert(`❌ Failed to delete item: ${error.message}`);
      throw error;
    }
  };
  
  // Transaction CRUD operations
  const handleSaveTransaction = async (txnData: any) => {
    try {
      const response = await transactionAPI.create(txnData);
      await loadTransactions(); // Refresh list
      alert('✅ Transaction created successfully!');
      return response.transaction;
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      alert(`❌ Failed to create transaction: ${error.message}`);
      throw error;
    }
  };
  
  const handleUpdateTransaction = async (id: string, txnData: any) => {
    try {
      await transactionAPI.update(id, txnData);
      await loadTransactions(); // Refresh list
      alert('✅ Transaction updated successfully!');
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      alert(`❌ Failed to update transaction: ${error.message}`);
      throw error;
    }
  };
  
  // Billing & POS state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTransactionSelector, setShowTransactionSelector] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [billingSearchTerm, setBillingSearchTerm] = useState('');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<string>('all');
  
  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceTransaction, setInvoiceTransaction] = useState<Transaction | null>(null);
  const [invoiceType, setInvoiceType] = useState<'customer' | 'bank'>('customer');
  
  // Expense management state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [expenseDateFilter, setExpenseDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  // Handler to move order to inventory
  const handleMoveOrderToInventory = (order: any) => {
    // Create inventory item from order
    const newInventoryItem: InventoryItem = {
      id: `INV${(inventoryItems.length + 1).toString().padStart(3, '0')}`,
      vin: `VIN${Date.now()}`,
      licensePlate: '',
      brand: order.vehicleDetails.brand,
      model: order.vehicleDetails.model,
      year: order.vehicleDetails.year,
      color: order.vehicleDetails.color,
      mileage: 0,
      condition: 'excellent',
      fuelType: 'gasoline',
      transmission: 'automatic',
      engineSize: '',
      bodyType: 'sedan',
      purchasePrice: order.pricing.totalAmount,
      sellingPrice: order.pricing.totalAmount * 1.15, // 15% markup
      marketValue: order.pricing.totalAmount * 1.15,
      status: 'available',
      location: 'Showroom',
      dateAdded: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      currency: 'USD',
      images: [],
      features: order.vehicleDetails.specifications ? [order.vehicleDetails.specifications] : [],
      notes: `Arrived from order: ${order.orderNumber}`,
      registrationNo: ''
    };

    setInventoryItems([...inventoryItems, newInventoryItem]);
  };
  
  // Sample data - Now loaded from API
  const [vehicleOrders, setVehicleOrders] = useState<VehicleOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  // OLD hardcoded data removed - now loaded from API
  const [vehicleOrders_OLD] = useState<VehicleOrder[]>([
    {
      id: 'ORD001',
      model: 'Toyota Camry',
      year: 2023,
      country: 'Japan',
      orderDate: '2024-01-15',
      status: 'completed',
      totalCost: 25000,
      expenses: {
        vehicleCost: 20000,
        fuel: 500,
        duty: 2000,
        driverCharge: 800,
        clearanceCharge: 600,
        demurrage: 300,
        tax: 600,
        customExpenses: {
          'Insurance': 250,
          'Documentation': 150
        }
      },
      currency: 'USD',
      sellingPrice: 32000,
      supplier: 'Tokyo Auto Exports',
      expectedDelivery: '2024-03-15',
      paymentMethod: 'Bank Transfer',
      notes: 'Low mileage, excellent condition',
      customerInfo: {
        name: 'Ahmed Hassan',
        contact: '+971-50-123-4567',
        paymentMethod: 'Bank Transfer'
      },
      saleDate: '2024-04-10',
      marketValue: 31000,
      // New fields
      vehicleNumber: 'ABC-1234',
      lcAmount: 22000,
      lcBank: 'Commercial Bank of Ceylon',
      additionalInfo: 'Premium package with navigation system and extended warranty',
      // Basic Information fields
      vinNumber: '1HGBH41JXMN109186',
      licensePlateNumber: 'CAR-5678',
      customBasicInfo: {
        'Engine Type': '2.5L 4-Cylinder',
        'Color': 'Pearl White',
        'Transmission': 'CVT Automatic'
      }
    },
    {
      id: 'ORD002',
      model: 'Honda Accord',
      year: 2023,
      country: 'Japan',
      orderDate: '2024-02-10',
      status: 'clearing',
      totalCost: 23000,
      expenses: {
        vehicleCost: 18000,
        fuel: 450,
        duty: 1800,
        driverCharge: 750,
        clearanceCharge: 550,
        demurrage: 250,
        tax: 550,
        customExpenses: {
          'Port Handling': 200,
          'Storage': 350
        }
      },
      currency: 'USD',
      supplier: 'Osaka Motors Ltd',
      expectedDelivery: '2024-04-20',
      paymentMethod: 'Letter of Credit',
      notes: 'Premium package, navigation system included',
      // New fields
      lcAmount: 20000,
      lcBank: 'Bank of Ceylon (BOC)',
      additionalInfo: 'Hybrid vehicle with advanced safety features',
      // Basic Information fields
      vinNumber: '2HGFC2F59LH012345',
      licensePlateNumber: 'HND-9876',
      customBasicInfo: {
        'Engine Type': 'Hybrid 2.0L',
        'Color': 'Metallic Blue',
        'Fuel Type': 'Hybrid'
      }
    },
    {
      id: 'ORD003',
      model: 'BMW X5',
      year: 2022,
      country: 'Germany',
      orderDate: '2024-01-25',
      status: 'shipped',
      totalCost: 45000,
      expenses: {
        vehicleCost: 38000,
        fuel: 800,
        duty: 3500,
        driverCharge: 1200,
        clearanceCharge: 900,
        demurrage: 0,
        tax: 1100,
        customExpenses: {
          'Special Handling': 500
        }
      },
      currency: 'EUR',
      supplier: 'Munich Auto GmbH',
      expectedDelivery: '2024-03-30',
      paymentMethod: 'Bank Transfer',
      notes: 'Luxury SUV, full options'
    },
    {
      id: 'ORD004',
      model: 'Nissan GTR',
      year: 2024,
      country: 'Japan',
      orderDate: '2024-03-01',
      status: 'ordered',
      totalCost: 85000,
      expenses: {
        vehicleCost: 75000,
        fuel: 600,
        duty: 5000,
        driverCharge: 1000,
        clearanceCharge: 800,
        demurrage: 0,
        tax: 2400,
        customExpenses: {}
      },
      currency: 'JPY',
      supplier: 'Yokohama Sport Cars',
      expectedDelivery: '2024-05-15',
      paymentMethod: 'Bank Transfer',
      notes: 'Performance sports car, track package'
    }
  ]);

  // Sample inventory data
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  
  // Old hardcoded data removed - now loaded from API
  const [inventoryItems_OLD] = useState<InventoryItem[]>([
    {
      id: 'INV001',
      model: 'Camry Hybrid',
      brand: 'Toyota',
      year: 2023,
      color: 'Pearl White',
      mileage: 15000,
      condition: 'excellent',
      purchasePrice: 24000,
      marketValue: 28000,
      sellingPrice: 32000,
      currency: 'USD',
      location: 'Dubai Showroom A',
      status: 'available',
      dateAdded: '2024-01-15',
      lastUpdated: '2024-09-15',
      features: ['Hybrid Engine', 'Navigation System', 'Leather Seats', 'Sunroof', 'Backup Camera'],
      vin: '1HGCM82633A123456',
      licensePlate: 'D-12345',
      fuelType: 'hybrid',
      transmission: 'automatic',
      engineSize: '2.5L',
      bodyType: 'sedan',
      supplier: 'Tokyo Auto Exports',
      purchaseDate: '2024-01-10',
      warrantyExpiry: '2026-01-10',
      notes: 'Pristine condition, single owner, full service history'
    },
    {
      id: 'INV002',
      model: 'X5 xDrive40i',
      brand: 'BMW',
      year: 2022,
      color: 'Jet Black',
      mileage: 25000,
      condition: 'excellent',
      purchasePrice: 42000,
      marketValue: 48000,
      sellingPrice: 52000,
      currency: 'USD',
      location: 'Dubai Showroom A',
      status: 'reserved',
      dateAdded: '2024-02-20',
      lastUpdated: '2024-09-10',
      features: ['All-Wheel Drive', 'Premium Package', 'Panoramic Roof', 'Apple CarPlay', 'Heated Seats'],
      vin: '5UXCR6C50M0123456',
      licensePlate: 'D-67890',
      fuelType: 'gasoline',
      transmission: 'automatic',
      engineSize: '3.0L Turbo',
      bodyType: 'suv',
      supplier: 'Munich Auto GmbH',
      purchaseDate: '2024-02-15',
      warrantyExpiry: '2025-02-15',
      notes: 'Luxury SUV with premium features',
      reservedBy: {
        name: 'Sarah Johnson',
        contact: '+971-55-987-6543',
        reservationDate: '2024-09-10',
        depositAmount: 5000
      }
    },
    {
      id: 'INV003',
      model: 'GTR Nismo',
      brand: 'Nissan',
      year: 2024,
      color: 'Bayside Blue',
      mileage: 5000,
      condition: 'excellent',
      purchasePrice: 180000,
      marketValue: 195000,
      sellingPrice: 210000,
      currency: 'USD',
      location: 'Special Collection',
      status: 'available',
      dateAdded: '2024-03-01',
      lastUpdated: '2024-09-01',
      features: ['Track Package', 'Carbon Fiber Body', 'Racing Seats', 'Premium Audio', 'Launch Control'],
      vin: 'JN1AR5EF6PM123456',
      licensePlate: 'D-GTR24',
      fuelType: 'gasoline',
      transmission: 'automatic',
      engineSize: '3.8L Twin-Turbo V6',
      bodyType: 'coupe',
      supplier: 'Yokohama Sport Cars',
      purchaseDate: '2024-02-25',
      warrantyExpiry: '2027-02-25',
      notes: 'Limited edition performance vehicle, museum quality'
    },
    {
      id: 'INV004',
      model: 'Model S Plaid',
      brand: 'Tesla',
      year: 2023,
      color: 'Midnight Silver',
      mileage: 8000,
      condition: 'good',
      purchasePrice: 95000,
      marketValue: 105000,
      currency: 'USD',
      location: 'Dubai Showroom B',
      status: 'sold',
      dateAdded: '2024-01-30',
      lastUpdated: '2024-08-15',
      features: ['Autopilot', 'Premium Interior', 'Glass Roof', 'Supercharging', 'Over-the-Air Updates'],
      vin: '5YJ3E1EB4MF123456',
      licensePlate: 'D-TESLA',
      fuelType: 'electric',
      transmission: 'automatic',
      engineSize: 'Electric Motor',
      bodyType: 'sedan',
      supplier: 'Tesla Direct',
      purchaseDate: '2024-01-25',
      warrantyExpiry: '2027-01-25',
      notes: 'High-performance electric sedan',
      soldInfo: {
        customerName: 'Ahmed Al-Rashid',
        customerContact: '+971-50-111-2222',
        saleDate: '2024-08-15',
        finalPrice: 110000,
        paymentMethod: 'Bank Transfer'
      }
    },
    {
      id: 'INV005',
      model: 'Wrangler Rubicon',
      brand: 'Jeep',
      year: 2023,
      color: 'Desert Tan',
      mileage: 18000,
      condition: 'good',
      purchasePrice: 38000,
      marketValue: 42000,
      sellingPrice: 45000,
      currency: 'USD',
      location: 'Outdoor Lot',
      status: 'maintenance',
      dateAdded: '2024-03-10',
      lastUpdated: '2024-09-05',
      features: ['4x4 Capability', 'Removable Doors', 'Rock Rails', 'Skid Plates', 'LED Lighting'],
      vin: '1C4HJXFG1NW123456',
      licensePlate: 'D-JEEP1',
      fuelType: 'gasoline',
      transmission: 'manual',
      engineSize: '3.6L V6',
      bodyType: 'suv',
      supplier: 'American Motors LLC',
      purchaseDate: '2024-03-05',
      warrantyExpiry: '2026-03-05',
      notes: 'Off-road capable SUV, currently in for routine maintenance'
    }
  ]);

  // Sample Billing & POS data
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Old hardcoded customers removed - now loaded from API
  const [customers_OLD] = useState<Customer[]>([
    {
      id: 'CUST001',
      name: 'Ahmed Al-Rashid',
      contact: '+971-50-123-4567',
      email: 'ahmed.rashid@email.com',
      address: 'Dubai Marina, Dubai, UAE',
      idNumber: 'EID123456789',
      nic: '881234567V',
      notes: 'VIP customer, prefers bank transfers',
      registrationDate: '2024-01-15'
    },
    {
      id: 'CUST002',
      name: 'Sarah Johnson',
      contact: '+971-55-987-6543',
      email: 'sarah.j@email.com',
      address: 'Business Bay, Dubai, UAE',
      idNumber: 'EID987654321'
    },
    {
      id: 'CUST003',
      name: 'Mohammed Hassan',
      contact: '+971-52-555-9999',
      email: 'm.hassan@email.com',
      address: 'Al Ain, Abu Dhabi, UAE',
      idNumber: 'EID555999777'
    }
  ]);

  // Leasing Companies Data
  const [leasingCompanies, setLeasingCompanies] = useState<LeasingCompany[]>([
    {
      id: 'LEASE001',
      name: 'Hatton National Bank (HNB)',
      branch: 'Kalawanchikudy',
      contactPerson: 'Manager',
      phone: '+94-67-222-9174',
      email: 'kalawanchikudy@hnb.lk',
      address: 'Kalawanchikudy, Sri Lanka'
    },
    {
      id: 'LEASE002',
      name: 'People\'s Leasing & Finance',
      branch: 'Colombo Branch',
      contactPerson: 'Sunil Perera',
      phone: '+94-11-234-5678',
      email: 'info@peoplesleasing.lk',
      address: 'Colombo 03, Sri Lanka'
    },
    {
      id: 'LEASE003',
      name: 'Commercial Leasing & Finance',
      branch: 'Head Office',
      contactPerson: 'Rohan Silva',
      phone: '+94-11-345-6789',
      email: 'business@comleasing.lk',
      address: 'Colombo 02, Sri Lanka'
    },
    {
      id: 'LEASE004',
      name: 'LOLC Finance',
      branch: 'Main Branch',
      contactPerson: 'Priyanka Fernando',
      phone: '+94-11-456-7890',
      email: 'vehicleleasing@lolc.com',
      address: 'Colombo 01, Sri Lanka'
    },
    {
      id: 'LEASE005',
      name: 'Orient Finance',
      branch: 'Nugegoda Branch',
      contactPerson: 'Kamal Jayasekara',
      phone: '+94-11-567-8901',
      email: 'leasing@orient.lk',
      address: 'Nugegoda, Sri Lanka'
    },
    {
      id: 'LEASE006',
      name: 'Merchant Bank of Sri Lanka',
      branch: 'Colombo Branch',
      contactPerson: 'Chaminda Rathnayake',
      phone: '+94-11-678-9012',
      email: 'vehiclefinance@merchantbank.lk',
      address: 'Colombo 01, Sri Lanka'
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Old hardcoded transactions removed - now loaded from API
  const [transactions_OLD] = useState<Transaction[]>([
    {
      id: 'TXN001',
      type: 'reservation',
      customerId: 'CUST002',
      inventoryId: 'INV002',
      vehicleDetails: {
        brand: 'BMW',
        model: 'X5 xDrive40i',
        year: 2022,
        color: 'Jet Black'
      },
      pricing: {
        vehiclePrice: 52000,
        taxes: 2600,
        fees: 500,
        discount: 1000,
        totalAmount: 54100
      },
      payments: [
        {
          id: 'PAY001',
          transactionId: 'TXN001',
          amount: 5000,
          paymentMethod: 'bank_transfer',
          paymentDate: '2024-09-10',
          receivedBy: 'Sales Manager',
          notes: 'Reservation deposit'
        }
      ],
      totalPaid: 5000,
      balanceRemaining: 49100,
      status: 'partial_paid',
      reservationDate: '2024-09-10',
      expectedDelivery: '2024-09-25',
      currency: 'USD',
      invoiceNumber: 'INV-2024-001',
      notes: 'Customer reserved with deposit, balance due on delivery'
    },
    {
      id: 'TXN002',
      type: 'sale',
      customerId: 'CUST001',
      inventoryId: 'INV004',
      vehicleDetails: {
        brand: 'Tesla',
        model: 'Model S Plaid',
        year: 2023,
        color: 'Midnight Silver'
      },
      pricing: {
        vehiclePrice: 110000,
        taxes: 5500,
        fees: 750,
        discount: 2000,
        totalAmount: 114250
      },
      payments: [
        {
          id: 'PAY002',
          transactionId: 'TXN002',
          amount: 114250,
          paymentMethod: 'bank_transfer',
          paymentDate: '2024-08-15',
          receivedBy: 'Sales Manager',
          notes: 'Full payment on delivery'
        }
      ],
      totalPaid: 114250,
      balanceRemaining: 0,
      status: 'completed',
      completionDate: '2024-08-15',
      currency: 'USD',
      invoiceNumber: 'INV-2024-002',
      notes: 'Complete sale, vehicle delivered'
    },
    {
      id: 'TXN003',
      type: 'reservation',
      customerId: 'CUST003',
      inventoryId: 'INV001',
      vehicleDetails: {
        brand: 'Toyota',
        model: 'Camry Hybrid',
        year: 2023,
        color: 'Pearl White'
      },
      pricing: {
        vehiclePrice: 32000,
        taxes: 1600,
        fees: 400,
        discount: 500,
        totalAmount: 33500
      },
      payments: [
        {
          id: 'PAY003',
          transactionId: 'TXN003',
          amount: 3000,
          paymentMethod: 'cash',
          paymentDate: '2024-09-15',
          receivedBy: 'Sales Executive',
          notes: 'Initial deposit'
        }
      ],
      totalPaid: 3000,
      balanceRemaining: 30500,
      status: 'partial_paid',
      reservationDate: '2024-09-15',
      expectedDelivery: '2024-10-01',
      currency: 'USD',
      invoiceNumber: 'INV-2024-003'
    },
    // Sample Leasing Transaction
    {
      id: 'TXN004',
      type: 'leasing',
      customerId: 'CUST001',
      inventoryId: 'INV001',
      vehicleDetails: {
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        color: 'White',
        registrationNo: 'CAR-1234'
      },
      pricing: {
        vehiclePrice: 5000000,
        taxes: 250000,
        fees: 100000,
        discount: 50000,
        totalAmount: 5300000
      },
      payments: [
        {
          id: 'PAY004',
          transactionId: 'TXN004',
          amount: 1000000, // Down payment from customer
          paymentMethod: 'cash',
          paymentDate: '2024-10-01',
          receivedBy: 'Sales Manager',
          notes: 'Down payment for leasing'
        },
        {
          id: 'PAY005',
          transactionId: 'TXN004',
          amount: 4300000, // Amount from leasing company
          paymentMethod: 'leasing',
          paymentDate: '2024-10-01',
          receivedBy: 'Finance Manager',
          notes: 'Payment from People\'s Leasing & Finance',
          leasingDetails: {
            leasingCompanyId: 'LEASE001',
            leasingCompanyName: 'People\'s Leasing & Finance',
            leaseReferenceNo: 'PLP-2024-001',
            downPayment: 1000000,
            leasingAmount: 4300000,
            monthlyInstallment: 95000,
            tenure: 48,
            startDate: '2024-10-01',
            endDate: '2028-10-01',
            interestRate: 12.5
          }
        }
      ],
      totalPaid: 5300000,
      balanceRemaining: 0,
      status: 'completed',
      reservationDate: '2024-09-25',
      completionDate: '2024-10-01',
      currency: 'USD',
      notes: 'Leasing transaction completed',
      invoiceNumber: 'INV-LEASE-2024-001',
      paymentMode: 'leasing',
      isLeasing: true,
      leasingDetails: {
        leasingCompanyId: 'LEASE001',
        leasingCompanyName: 'People\'s Leasing & Finance',
        leaseReferenceNo: 'PLP-2024-001',
        downPayment: 1000000,
        leasingAmount: 4300000,
        monthlyInstallment: 95000,
        tenure: 48,
        startDate: '2024-10-01',
        endDate: '2028-10-01',
        interestRate: 12.5
      }
    }
  ]);

  // Handler functions
  const handleNewOrder = async (formData: VehicleOrderFormData) => {
    try {
      // Parse all numeric values to ensure they're numbers
      const parseNumber = (val: any): number => {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
      };
      
      const vehicleCost = parseNumber(formData.vehicleCost);
      const fuel = parseNumber(formData.expenses.fuel);
      const duty = parseNumber(formData.expenses.duty);
      const driverCharge = parseNumber(formData.expenses.driverCharge);
      const clearanceCharge = parseNumber(formData.expenses.clearanceCharge);
      const demurrage = parseNumber(formData.expenses.demurrage);
      const tax = parseNumber(formData.expenses.tax);
      const customExpensesTotal = Object.values(formData.expenses.customExpenses).reduce((sum, val) => sum + parseNumber(val), 0);
      
      const totalTaxes = duty + tax;
      const totalFees = clearanceCharge + demurrage + fuel + driverCharge;
      const totalCost = vehicleCost + totalTaxes + totalFees + customExpensesTotal;
      
      // Validate required fields
      if (!formData.model || vehicleCost <= 0) {
        alert('⚠️ Please fill in Vehicle Model and Vehicle Cost');
        return;
      }
      
      // Adapt Dashboard format to backend API format
      const orderData = {
        orderNumber: `IMP-${Date.now()}`,
        orderDate: new Date().toISOString().split('T')[0],
        orderType: 'import' as const, // Mark as import order
        customerName: 'Import Order', // Import orders are for business inventory
        customerContact: 'N/A',
        supplier: formData.supplier || 'N/A',
        country: formData.country || 'N/A',
        vehicleDetails: {
          brand: formData.model.split(' ')[0] || 'Unknown',
          model: formData.model,
          year: formData.year || new Date().getFullYear(),
          color: 'N/A',
          specifications: formData.notes || ''
        },
        pricing: {
          vehiclePrice: Number(vehicleCost) || 0,
          taxes: Number(totalTaxes) || 0,
          fees: Number(totalFees) || 0,
          totalAmount: Number(totalCost) || 0
        },
        advancePayment: 0,
        balanceAmount: Number(totalCost) || 0,
        orderStatus: 'pending' as const,
        expectedArrivalDate: formData.expectedDelivery || undefined,
        notes: formData.notes || '',
        timeline: [{
          date: new Date().toISOString().split('T')[0],
          status: 'Order Placed',
          description: `Vehicle ordered from ${formData.supplier || 'supplier'} - ${formData.country || 'Unknown country'}`
        }]
      };
      
      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      
      await vehicleOrderAPI.create(orderData);
      await loadVehicleOrders(); // Refresh list
      setShowOrderForm(false);
      onTabChange('orders');
      alert('✅ Order created successfully!');
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(`❌ Failed to create order: ${error.message}`);
    }
  };

  const handleEditOrder = (order: VehicleOrder) => {
    setEditingOrder(order);
    setShowOrderForm(true);
  };

  const handleUpdateOrder = (formData: VehicleOrderFormData) => {
    if (!editingOrder) return;
    
    const updatedOrder: VehicleOrder = {
      ...editingOrder,
      model: formData.model,
      year: formData.year,
      country: formData.country,
      totalCost: formData.vehicleCost + 
                 formData.expenses.fuel + formData.expenses.duty + formData.expenses.driverCharge + 
                 formData.expenses.clearanceCharge + formData.expenses.demurrage + formData.expenses.tax +
                 Object.values(formData.expenses.customExpenses).reduce((sum, val) => sum + val, 0),
      expenses: {
        vehicleCost: formData.vehicleCost,
        ...formData.expenses
      },
      currency: formData.currency,
      supplier: formData.supplier,
      expectedDelivery: formData.expectedDelivery,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      // New fields
      vehicleNumber: formData.vehicleNumber || undefined,
      lcAmount: formData.lcAmount || undefined,
      lcBank: formData.lcBank || undefined,
      additionalInfo: formData.additionalInfo || undefined,
      // Basic Information fields
      vinNumber: formData.vinNumber || undefined,
      licensePlateNumber: formData.licensePlateNumber || undefined,
      customBasicInfo: Object.keys(formData.customBasicInfo).length > 0 ? formData.customBasicInfo : undefined
    };
    
    setVehicleOrders(vehicleOrders.map(order => 
      order.id === editingOrder.id ? updatedOrder : order
    ));
    setShowOrderForm(false);
    setEditingOrder(null);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await vehicleOrderAPI.delete(orderId);
        await loadVehicleOrders(); // Refresh list
        alert('✅ Order deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting order:', error);
        alert(`❌ Failed to delete order: ${error.message}`);
      }
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: 'ordered' | 'shipped' | 'clearing' | 'completed') => {
    setVehicleOrders(vehicleOrders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleFormCancel = () => {
    setShowOrderForm(false);
    setEditingOrder(null);
  };

  const handleFormSubmit = (formData: VehicleOrderFormData) => {
    if (editingOrder) {
      handleUpdateOrder(formData);
    } else {
      handleNewOrder(formData);
    }
  };


  // Inventory handler functions - Now using API functions defined above

  const handleEditInventoryItem = (item: InventoryItem) => {
    setEditingInventoryItem(item);
    setShowInventoryForm(true);
  };

  // OLD functions removed - now using API functions defined above

  const handleInventoryStatusUpdate = (itemId: string, newStatus: 'available' | 'reserved' | 'sold' | 'maintenance') => {
    setInventoryItems(inventoryItems.map(item => 
      item.id === itemId ? { ...item, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] } : item
    ));
  };

  const handleInventoryFormCancel = () => {
    setShowInventoryForm(false);
    setEditingInventoryItem(null);
  };

  const handleInventoryFormSubmit = async (formData: InventoryFormData) => {
    if (editingInventoryItem) {
      // Update existing item
      const itemId = editingInventoryItem.id || editingInventoryItem._id;
      if (itemId) {
        await handleUpdateInventoryItem(itemId, formData);
        setShowInventoryForm(false);
        setEditingInventoryItem(null);
      }
    } else {
      // Create new item
      await handleSaveInventoryItem(formData);
      setShowInventoryForm(false);
    }
  };

  // Helper function to extract brand from model
  const extractBrandFromModel = (model: string): string => {
    const brandMap: { [key: string]: string } = {
      'toyota': 'Toyota',
      'camry': 'Toyota',
      'corolla': 'Toyota',
      'prius': 'Toyota',
      'honda': 'Honda',
      'accord': 'Honda',
      'civic': 'Honda',
      'cr-v': 'Honda',
      'bmw': 'BMW',
      'x5': 'BMW',
      'x3': 'BMW',
      '3 series': 'BMW',
      'nissan': 'Nissan',
      'gtr': 'Nissan',
      'altima': 'Nissan',
      'tesla': 'Tesla',
      'model s': 'Tesla',
      'model 3': 'Tesla',
      'jeep': 'Jeep',
      'wrangler': 'Jeep',
      'mercedes': 'Mercedes',
      'audi': 'Audi'
    };
    
    const modelLower = model.toLowerCase();
    for (const [key, brand] of Object.entries(brandMap)) {
      if (modelLower.includes(key)) {
        return brand;
      }
    }
    return model.split(' ')[0]; // Fallback to first word
  };

  // Convert Vehicle Order to Inventory Item
  const handleAddOrderToInventory = (order: VehicleOrder) => {
    if (order.status !== 'completed') {
      alert('Vehicle must be completed before adding to inventory');
      return;
    }

    const newInventoryItem: InventoryItem = {
      id: `INV${String(inventoryItems.length + 1).padStart(3, '0')}`,
      model: order.model,
      brand: extractBrandFromModel(order.model),
      year: order.year,
      color: 'To Be Determined', // Default value, user can edit later
      mileage: 0, // New vehicle assumption
      condition: 'excellent', // New vehicle assumption  
      purchasePrice: order.totalCost,
      marketValue: order.totalCost * 1.15, // 15% markup assumption
      sellingPrice: order.totalCost * 1.20, // 20% markup assumption
      currency: order.currency,
      location: 'Dubai Showroom A', // Default location
      status: 'available',
      dateAdded: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      features: [],
      fuelType: 'gasoline', // Default, can be edited
      transmission: 'automatic', // Default, can be edited
      bodyType: 'sedan', // Default, can be edited
      supplier: order.supplier,
      purchaseDate: order.orderDate,
      notes: `🚛 Converted from order ${order.id} on ${new Date().toLocaleDateString()}. Original order notes: ${order.notes || 'None'}`,
    };
    
    // Add to inventory
    setInventoryItems([...inventoryItems, newInventoryItem]);
    
    // Update order notes to indicate it's been added to inventory
    setVehicleOrders(vehicleOrders.map(o => 
      o.id === order.id ? { 
        ...o, 
        notes: `${o.notes || ''}\n📦 Added to inventory as ${newInventoryItem.id} on ${new Date().toLocaleDateString()}` 
      } : o
    ));
    
    alert(`✅ Successfully added ${order.model} to inventory!\n\nInventory ID: ${newInventoryItem.id}\nYou can now edit the vehicle details in the Inventory tab.`);
    onTabChange('inventory'); // Switch to inventory tab
  };

  const checkIfOrderInInventory = (orderId: string) => {
    return inventoryItems.some(item => item.notes?.includes(orderId));
  };

  // Billing & POS handler functions
  const handleAddLeasingCompany = (newCompany: LeasingCompany) => {
    setLeasingCompanies(prev => [...prev, newCompany]);
  };

  const getCustomerById = (customerId: string | any): Customer | undefined => {
    // If customerId is an object (populated from backend), extract the _id
    const id = typeof customerId === 'object' ? (customerId?._id || customerId?.id) : customerId;
    
    if (!id) {
      console.warn('getCustomerById: No valid ID provided', customerId);
      return undefined;
    }
    
    // Try to find by id or _id
    const customer = customers.find(customer => 
      customer.id === id || 
      customer._id === id ||
      customer.id === customerId ||
      customer._id === customerId
    );
    
    if (!customer) {
      console.warn('getCustomerById: Customer not found', {
        searchingFor: id,
        availableCustomers: customers.map(c => ({ id: c.id, name: c.name }))
      });
    }
    
    return customer;
  };

  const getInventoryById = (inventoryId: string): InventoryItem | undefined => {
    return inventoryItems.find(item => item.id === inventoryId);
  };

  const calculateTransactionBalance = (transaction: Transaction): number => {
    const totalPaid = transaction.payments.reduce((sum, payment) => sum + payment.amount, 0);
    return transaction.pricing.totalAmount - totalPaid;
  };

  const handleAddPayment = async (transactionId: string, paymentData: {
    amount: number;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check' | 'finance';
    receivedBy: string;
    notes?: string;
  }) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId || t._id === transactionId);
      if (!transaction) {
        alert('⚠️ Transaction not found');
        return;
      }

      const newPayment: PaymentRecord = {
        id: `PAY${Date.now()}`,
        transactionId,
        amount: Number(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        paymentDate: new Date().toISOString().split('T')[0],
        receivedBy: paymentData.receivedBy,
        notes: paymentData.notes
      };

      // Map to backend format (backend uses 'method' and 'date' instead of 'paymentMethod' and 'paymentDate')
      const backendPayment = {
        date: new Date().toISOString().split('T')[0],
        amount: Number(paymentData.amount),
        method: paymentData.paymentMethod,
        reference: paymentData.notes || '',
        receivedBy: paymentData.receivedBy
      };

      const updatedPayments = [...transaction.payments, backendPayment];
      const totalPaid = updatedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const balanceRemaining = transaction.pricing.totalAmount - totalPaid;
      
      let newStatus: Transaction['status'] = transaction.status;
      let newType: Transaction['type'] = transaction.type;
      
      if (balanceRemaining <= 0) {
        newStatus = 'completed';
        // Auto-change type from reservation to sale when fully paid
        if (transaction.type === 'reservation') {
          newType = 'sale';
        }
      } else if (totalPaid > 0) {
        newStatus = 'partial_paid';
      }

      // Prepare update data
      const updateData = {
        payments: updatedPayments,
        totalPaid: Number(totalPaid),
        balanceRemaining: Number(Math.max(0, balanceRemaining)),
        status: newStatus,
        type: newType,
        completionDate: balanceRemaining <= 0 ? new Date().toISOString().split('T')[0] : undefined
      };

      console.log('Updating transaction with payment:', JSON.stringify(updateData, null, 2));

      // Save to database
      await handleUpdateTransaction(transaction._id || transaction.id, updateData);

      // Update inventory status if fully paid
      if (balanceRemaining <= 0 && transaction.inventoryId) {
        const vehicle = inventoryItems.find(item => 
          item.id === transaction.inventoryId || item._id === transaction.inventoryId
        );
        if (vehicle && (vehicle._id || vehicle.id)) {
          await inventoryAPI.update(vehicle._id || vehicle.id, {
            ...vehicle,
            status: 'sold'
          });
          await loadInventory(); // Refresh inventory list
        }
      }

      setShowPaymentModal(false);
      setSelectedTransaction(null);
      
      // Show success message
      const wasFullyPaid = balanceRemaining <= 0;
      const wasReservation = transaction.type === 'reservation';
      
      let successMessage = '💳 Payment processed and saved successfully!\n\n';
      
      if (wasFullyPaid && wasReservation) {
        successMessage += '🎉 Transaction completed!\n' +
                         '✅ Type changed: RESERVATION → SALE\n' +
                         '🚗 Inventory updated: Reserved → Sold\n' +
                         '📊 Dashboard metrics updated';
      } else if (wasFullyPaid) {
        successMessage += '✅ Transaction completed!\n' +
                         '📊 All systems updated';
      } else {
        successMessage += `📝 Partial payment recorded\n` +
                         `💰 Remaining balance: ${new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(balanceRemaining)}`;
      }
      
      alert(successMessage);
      
    } catch (error: any) {
      console.error('Error adding payment:', error);
      alert(`❌ Failed to process payment: ${error.message}`);
    }
  };

  const handleCreateReservation = async (inventoryId: string, customerData: {
    name: string;
    contact: string;
    email?: string;
    address?: string;
    idNumber?: string;
    nic?: string;
  }, pricingData: {
    vehiclePrice: number;
    taxes: number;
    fees: number;
    discount: number;
  }, paymentMode: 'cash' | 'bank_transfer' | 'leasing', leasingData?: {
    leasingCompanyId: string;
    downPayment: number;
    leasingAmount: number;
    monthlyInstallment: number;
    tenure: number;
    interestRate: number;
    leaseReferenceNo: string;
  }) => {
    try {
      // Create or find customer
      let customer = customers.find(c => c.contact === customerData.contact);
      console.log('Found existing customer:', customer);
      
      if (!customer) {
        // Save customer to database
        console.log('Creating new customer with data:', customerData);
        const customerResponse = await customerAPI.create({
          name: customerData.name,
          contact: customerData.contact,
          email: customerData.email || '',
          address: customerData.address || '',
          nic: customerData.nic || customerData.idNumber || ''
        });
        console.log('Customer created:', customerResponse.customer);
        customer = {
          id: customerResponse.customer._id || '',
          _id: customerResponse.customer._id || '',
          ...customerData
        };
        await loadCustomers(); // Refresh customer list
      }
      
      console.log('Using customer with ID:', customer?.id || customer?._id);

      const vehicle = getInventoryById(inventoryId);
      if (!vehicle || !customer) {
        console.error('Missing vehicle or customer:', { vehicle, customer });
        alert('⚠️ Vehicle or customer information is missing');
        return;
      }
      
      if (!customer.id && !customer._id) {
        console.error('Customer has no ID:', customer);
        alert('⚠️ Customer ID is missing. Please try again.');
        return;
      }

      const totalAmount = (parseFloat(pricingData.vehiclePrice as any) || 0) + 
                          (parseFloat(pricingData.taxes as any) || 0) + 
                          (parseFloat(pricingData.fees as any) || 0) - 
                          (parseFloat(pricingData.discount as any) || 0);

      // Prepare transaction data for API
      const transactionData = {
        type: paymentMode === 'leasing' ? 'leasing' : 'reservation',
        customerId: customer.id || customer._id,
        inventoryId,
        vehicleDetails: {
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color,
          registrationNo: vehicle.registrationNo || undefined
        },
        pricing: {
          vehiclePrice: Number(parseFloat(pricingData.vehiclePrice as any) || 0),
          taxes: Number(parseFloat(pricingData.taxes as any) || 0),
          fees: Number(parseFloat(pricingData.fees as any) || 0),
          discount: Number(parseFloat(pricingData.discount as any) || 0),
          totalAmount: Number(totalAmount)
        },
        payments: [],
        totalPaid: 0,
        balanceRemaining: Number(totalAmount),
        status: 'pending',
        reservationDate: new Date().toISOString().split('T')[0],
        currency: vehicle.currency || 'LKR',
        paymentMode: paymentMode,
        isLeasing: paymentMode === 'leasing',
        leasingDetails: paymentMode === 'leasing' && leasingData ? {
          leasingCompanyId: leasingData.leasingCompanyId,
          leasingCompanyName: leasingCompanies.find(lc => lc.id === leasingData.leasingCompanyId)?.name || '',
          leasingCompanyBranch: leasingCompanies.find(lc => lc.id === leasingData.leasingCompanyId)?.branch || '',
          leaseReferenceNo: leasingData.leaseReferenceNo,
          downPayment: Number(parseFloat(leasingData.downPayment as any) || 0),
          leasingAmount: Number(parseFloat(leasingData.leasingAmount as any) || 0),
          monthlyInstallment: Number(parseFloat(leasingData.monthlyInstallment as any) || 0),
          tenure: Number(parseFloat(leasingData.tenure as any) || 0),
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + (parseFloat(leasingData.tenure as any) || 0) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          interestRate: Number(parseFloat(leasingData.interestRate as any) || 0)
        } : undefined,
        invoiceNumber: `INV-${Date.now()}`
      };

      console.log('Creating transaction with data:', JSON.stringify(transactionData, null, 2));

      // Save to database
      const response = await handleSaveTransaction(transactionData);
      
      // Update inventory status to reserved
      if (vehicle._id || vehicle.id) {
        await inventoryAPI.update(vehicle._id || vehicle.id, {
          ...vehicle,
          status: 'reserved'
        });
        await loadInventory(); // Refresh inventory list
      }

      setShowTransactionModal(false);
      alert('✅ Transaction created and saved successfully!');
      
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      alert(`❌ Failed to create transaction: ${error.message}`);
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    const statusMap = {
      pending: 'badge-warning',
      partial_paid: 'badge-info',
      fully_paid: 'badge-success',
      completed: 'badge-success',
      overdue: 'badge-danger',
      cancelled: 'badge-secondary'
    };
    return statusMap[status as keyof typeof statusMap] || 'badge-info';
  };

  // Filter orders based on search and status
  const filteredOrders = vehicleOrders.filter(order => {
    const matchesSearch = order.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.supplier && order.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter inventory based on search, status, and condition
  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch = item.model.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
                         item.color.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
                         (item.vin && item.vin.toLowerCase().includes(inventorySearchTerm.toLowerCase())) ||
                         (item.licensePlate && item.licensePlate.toLowerCase().includes(inventorySearchTerm.toLowerCase()));
    const matchesStatus = inventoryStatusFilter === 'all' || item.status === inventoryStatusFilter;
    const matchesCondition = inventoryConditionFilter === 'all' || item.condition === inventoryConditionFilter;
    return matchesSearch && matchesStatus && matchesCondition;
  });

  // Filter transactions based on search and status
  const filteredTransactions = transactions.filter(transaction => {
    const customer = getCustomerById(transaction.customerId);
    const matchesSearch = transaction.id.toLowerCase().includes(billingSearchTerm.toLowerCase()) ||
                         transaction.vehicleDetails.brand.toLowerCase().includes(billingSearchTerm.toLowerCase()) ||
                         transaction.vehicleDetails.model.toLowerCase().includes(billingSearchTerm.toLowerCase()) ||
                         (customer && customer.name.toLowerCase().includes(billingSearchTerm.toLowerCase())) ||
                         (transaction.invoiceNumber && transaction.invoiceNumber.toLowerCase().includes(billingSearchTerm.toLowerCase()));
    const matchesStatus = transactionStatusFilter === 'all' || transaction.status === transactionStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ordered: 'badge-info',
      shipped: 'badge-warning', 
      clearing: 'badge-warning',
      completed: 'badge-success'
    };
    return statusMap[status as keyof typeof statusMap] || 'badge-info';
  };

  const getInventoryStatusBadge = (status: string) => {
    const statusMap = {
      available: 'badge-success',
      reserved: 'badge-warning',
      sold: 'badge-info',
      maintenance: 'badge-danger'
    };
    return statusMap[status as keyof typeof statusMap] || 'badge-info';
  };

  const getConditionBadge = (condition: string) => {
    const conditionMap = {
      excellent: 'badge-success',
      good: 'badge-info',
      fair: 'badge-warning',
      needs_repair: 'badge-danger'
    };
    return conditionMap[condition as keyof typeof conditionMap] || 'badge-info';
  };

  // Calculate real profit when selling price is available
  const calculateProfit = (order: VehicleOrder) => {
    if (order.sellingPrice && order.sellingPrice > 0) {
      return order.sellingPrice - order.totalCost;
    }
    return order.profit || 0;
  };

  // Calculate profit margin percentage
  const calculateProfitMargin = (order: VehicleOrder) => {
    if (order.sellingPrice && order.sellingPrice > 0) {
      const profit = calculateProfit(order);
      return (profit / order.sellingPrice) * 100;
    }
    return 0;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const totalAssets = vehicleOrders.reduce((sum, order) => sum + order.totalCost, 0) + 
                      inventoryItems.reduce((sum, item) => sum + (item.status !== 'sold' ? item.purchasePrice : 0), 0);
  const totalProfit = vehicleOrders.reduce((sum, order) => sum + calculateProfit(order), 0) +
                      inventoryItems.filter(item => item.soldInfo).reduce((sum, item) => 
                        sum + (item.soldInfo!.finalPrice - item.purchasePrice), 0);
  const completedOrders = vehicleOrders.filter(order => order.status === 'completed').length;
  const pendingOrders = vehicleOrders.filter(order => order.status !== 'completed').length;
  const totalOrders = vehicleOrders.length;
  
  // Inventory metrics
  const availableInventory = inventoryItems.filter(item => item.status === 'available').length;
  const totalInventoryValue = inventoryItems.filter(item => item.status !== 'sold').reduce((sum, item) => sum + item.marketValue, 0);
  const reservedInventory = inventoryItems.filter(item => item.status === 'reserved').length;
  const soldInventory = inventoryItems.filter(item => item.status === 'sold').length;
  
  // Billing metrics
  const totalRevenue = transactions.filter(t => t.status === 'completed' || t.status === 'fully_paid').reduce((sum, t) => sum + t.pricing.totalAmount, 0);
  const pendingPayments = transactions.filter(t => t.status === 'partial_paid' || t.status === 'pending').reduce((sum, t) => sum + t.balanceRemaining, 0);
  const totalDeposits = transactions.reduce((sum, t) => sum + t.totalPaid, 0);
  const activeReservations = transactions.filter(t => t.type === 'reservation' && (t.status === 'partial_paid' || t.status === 'pending')).length;
  
  // Calculate total expenses from expense API
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  
  // Debug logging
  console.log('Dashboard Financial Data:', {
    expensesCount: expenses.length,
    totalExpenses,
    totalRevenue,
    netProfit,
    sampleExpense: expenses[0]
  });

  return (
    <div className="dashboard">
      {/* Financial Summary Cards - Show ONLY on Billing & POS tab */}
      {activeTab === 'billing' && (
        <div className="metrics-grid grid grid-4">
          <div className="card metric-card revenue">
            <div className="metric-icon revenue">💰</div>
            <div className="metric-info">
              <h3 className="metric-value">{formatCurrency(totalRevenue)}</h3>
              <p className="metric-label">Total Revenue</p>
            </div>
          </div>
          
          <div className="card metric-card deposits">
            <div className="metric-icon deposits">💳</div>
            <div className="metric-info">
              <h3 className="metric-value">{formatCurrency(totalDeposits)}</h3>
              <p className="metric-label">Total Deposits</p>
            </div>
          </div>
          
          <div className="card metric-card pending-payments">
            <div className="metric-icon pending-payments">⏳</div>
            <div className="metric-info">
              <h3 className="metric-value">{formatCurrency(pendingPayments)}</h3>
              <p className="metric-label">Pending Payments</p>
            </div>
          </div>
          
          <div className="card metric-card reservations">
            <div className="metric-icon reservations">📋</div>
            <div className="metric-info">
              <h3 className="metric-value">{activeReservations}</h3>
              <p className="metric-label">Active Reservations</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {/* Financial Overview Section with Charts */}
          <div className="financial-overview-section" style={{marginBottom: '2rem'}}>
            <h2 style={{color: 'white', marginBottom: '1.5rem', fontSize: '1.8rem'}}>📊 Financial Overview</h2>
            
            {/* Summary Cards */}
            <div className="metrics-grid grid grid-3" style={{marginBottom: '2rem'}}>
              <div className="card metric-card revenue">
                <div className="metric-icon revenue">💰</div>
                <div className="metric-info">
                  <h3 className="metric-value">{formatCurrency(totalRevenue)}</h3>
                  <p className="metric-label">Total Revenue</p>
                  <small style={{color: '#95a5a6'}}>From completed sales</small>
                </div>
              </div>
              
              <div className="card metric-card pending-payments">
                <div className="metric-icon pending-payments">💸</div>
                <div className="metric-info">
                  <h3 className="metric-value">{formatCurrency(totalExpenses)}</h3>
                  <p className="metric-label">Total Expenses</p>
                  <small style={{color: '#95a5a6'}}>{expenses.length} expenses tracked</small>
                </div>
              </div>
              
              <div className="card metric-card profit">
                <div className="metric-icon profit">📈</div>
                <div className="metric-info">
                  <h3 className="metric-value" style={{color: netProfit >= 0 ? '#27ae60' : '#e74c3c'}}>
                    {formatCurrency(netProfit)}
                  </h3>
                  <p className="metric-label">Net Profit</p>
                  <small style={{color: '#95a5a6'}}>Revenue - Expenses</small>
                </div>
              </div>
            </div>

            {/* Visual Chart Section */}
            <div className="card" style={{background: 'white', padding: '2rem', borderRadius: '16px'}}>
              <h3 style={{marginBottom: '2rem', color: '#2c3e50'}}>📊 Financial Comparison Chart</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
                {/* Revenue Bar */}
                <div className="financial-bar-container">
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                    <span style={{fontWeight: '600', color: '#2c3e50'}}>💰 Revenue</span>
                    <span style={{fontWeight: '700', color: '#27ae60'}}>{formatCurrency(totalRevenue)}</span>
                  </div>
                  <div style={{width: '100%', height: '40px', background: '#ecf0f1', borderRadius: '10px', overflow: 'hidden', position: 'relative'}}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #27ae60 0%, #2ecc71 100%)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)'
                    }}>
                      100%
                    </div>
                  </div>
                </div>

                {/* Expenses Bar */}
                {(() => {
                  const expensePercentage = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
                  return (
                    <div className="financial-bar-container">
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                        <span style={{fontWeight: '600', color: '#2c3e50'}}>💸 Expenses</span>
                        <span style={{fontWeight: '700', color: '#e74c3c'}}>{formatCurrency(totalExpenses)} ({expensePercentage.toFixed(1)}% of Revenue)</span>
                      </div>
                      <div style={{width: '100%', height: '40px', background: '#ecf0f1', borderRadius: '10px', overflow: 'hidden', position: 'relative'}}>
                        <div style={{
                          width: `${Math.min(expensePercentage, 100)}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '1rem',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
                        }}>
                          {expensePercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Profit Bar */}
                {(() => {
                  const profit = netProfit;
                  const profitPercentage = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
                  const isProfitable = profit >= 0;
                  return (
                    <div className="financial-bar-container">
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                        <span style={{fontWeight: '600', color: '#2c3e50'}}>📈 Net Profit</span>
                        <span style={{fontWeight: '700', color: isProfitable ? '#27ae60' : '#e74c3c'}}>
                          {formatCurrency(profit)} ({profitPercentage.toFixed(1)}% Margin)
                        </span>
                      </div>
                      <div style={{width: '100%', height: '40px', background: '#ecf0f1', borderRadius: '10px', overflow: 'hidden', position: 'relative'}}>
                        {isProfitable ? (
                          <div style={{
                            width: `${Math.min(Math.abs(profitPercentage), 100)}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #3498db 0%, #2980b9 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: '1rem',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
                          }}>
                            {profitPercentage.toFixed(1)}% ✅
                          </div>
                        ) : (
                          <div style={{
                            width: `${Math.min(Math.abs(profitPercentage), 100)}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #95a5a6 0%, #7f8c8d 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: '1rem',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '0.9rem'
                          }}>
                            Loss: {Math.abs(profitPercentage).toFixed(1)}% ⚠️
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Financial Health Indicator */}
              {(() => {
                const profit = netProfit;
                const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
                let healthStatus = '';
                let healthColor = '';
                let healthIcon = '';
                
                if (profitMargin >= 20) {
                  healthStatus = 'Excellent';
                  healthColor = '#27ae60';
                  healthIcon = '🌟';
                } else if (profitMargin >= 10) {
                  healthStatus = 'Good';
                  healthColor = '#3498db';
                  healthIcon = '✅';
                } else if (profitMargin >= 0) {
                  healthStatus = 'Fair';
                  healthColor = '#f39c12';
                  healthIcon = '⚠️';
                } else {
                  healthStatus = 'Needs Attention';
                  healthColor = '#e74c3c';
                  healthIcon = '❌';
                }

                return (
                  <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: `linear-gradient(135deg, ${healthColor}15 0%, ${healthColor}05 100%)`,
                    borderRadius: '12px',
                    border: `2px solid ${healthColor}30`,
                    textAlign: 'center'
                  }}>
                    <div style={{fontSize: '3rem', marginBottom: '0.5rem'}}>{healthIcon}</div>
                    <h4 style={{margin: '0', color: healthColor, fontSize: '1.5rem'}}>Financial Health: {healthStatus}</h4>
                    <p style={{margin: '0.5rem 0 0 0', color: '#7f8c8d'}}>
                      {profit >= 0 
                        ? `Your business is generating ${profitMargin.toFixed(1)}% profit margin` 
                        : `Business is operating at a loss. Review expenses to improve profitability.`}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3>Recent Orders</h3>
              <div className="order-list">
                {vehicleOrders.slice(0, 3).map(order => (
                  <div key={order.id} className="order-item">
                    <div className="order-details">
                      <h4>{order.model} ({order.year})</h4>
                      <p>Order ID: {order.id}</p>
                      <p>From: {order.country}</p>
                    </div>
                    <div className="order-status">
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                      <p className="order-cost">{formatCurrency(order.totalCost, order.currency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="card">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="btn btn-primary" onClick={() => {setShowOrderForm(true); setEditingOrder(null);}}>New Vehicle Order</button>
                <button className="btn btn-secondary" onClick={() => onTabChange('expenses')}>Add Expense</button>
                <button className="btn btn-secondary" onClick={() => onTabChange('reports')}>Generate Report</button>
                <button className="btn btn-secondary" onClick={() => onTabChange('orders')}>View All Orders</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customer_bookings' && (
        <div className="tab-content">
          <OrderTracking onMoveToInventory={handleMoveOrderToInventory} />
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="tab-content">
          <div className="card">
            <div className="orders-header">
              <h3>Vehicle Orders Management</h3>
              <div className="orders-controls">
                <div className="search-filter-group">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="status-filter"
                  >
                    <option value="all">All Status</option>
                    <option value="ordered">Ordered</option>
                    <option value="shipped">Shipped</option>
                    <option value="clearing">Clearing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {setShowOrderForm(true); setEditingOrder(null);}}
                >
                  Add New Order
                </button>
              </div>
            </div>
            
            {filteredOrders.length > 0 ? (
              <div className="orders-table-container">
                <table className="table orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Vehicle</th>
                      <th>Supplier</th>
                      <th>Country</th>
                      <th>Order Date</th>
                      <th>Expected Delivery</th>
                      <th>Status</th>
                      <th>Total Cost</th>
                      <th>Payment Method</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td data-label="Order ID">
                          <strong>{order.id}</strong>
                        </td>
                        <td data-label="Vehicle">
                          <div className="vehicle-info">
                            <strong>{order.model}</strong>
                            <small>({order.year})</small>
                          </div>
                        </td>
                        <td data-label="Supplier">
                          {order.supplier || 'N/A'}
                        </td>
                        <td data-label="Country">
                          <div className="country-flag">
                            🌐 {order.country}
                          </div>
                        </td>
                        <td data-label="Order Date">
                          {order.orderDate}
                        </td>
                        <td data-label="Expected Delivery">
                          {order.expectedDelivery || 'TBD'}
                        </td>
                        <td data-label="Status">
                          <div className="status-cell">
                            <span className={`badge ${getStatusBadge(order.status)}`}>
                              {order.status.toUpperCase()}
                            </span>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                              className="status-update-select"
                            >
                              <option value="ordered">Ordered</option>
                              <option value="shipped">Shipped</option>
                              <option value="clearing">Clearing</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </td>
                        <td data-label="Total Cost">
                          <div className="cost-display">
                            <strong>{formatCurrency(order.totalCost, order.currency)}</strong>
                            {order.sellingPrice && (
                              <div className="selling-info">
                                <small className="selling-price">
                                  Selling: {formatCurrency(order.sellingPrice, order.currency)}
                                </small>
                                <small className="profit-indicator">
                                  Profit: {formatCurrency(calculateProfit(order), order.currency)} 
                                  ({calculateProfitMargin(order).toFixed(1)}%)
                                </small>
                              </div>
                            )}
                            {checkIfOrderInInventory(order.id) && (
                              <div className="inventory-indicator">
                                <small className="badge badge-success" style={{marginTop: '0.3rem'}}>
                                  📦 In Inventory
                                </small>
                              </div>
                            )}
                          </div>
                        </td>
                        <td data-label="Payment Method">
                          {order.paymentMethod || 'N/A'}
                        </td>
                        <td data-label="Actions">
                          <div className="action-buttons-cell">
                            <button 
                              className="btn btn-info btn-sm" 
                              onClick={() => setOrderDetailsModal(order)}
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => handleEditOrder(order)}
                              title="Edit Order"
                            >
                              ✏️
                            </button>
                            {order.status === 'completed' && !checkIfOrderInInventory(order.id) && (
                              <button 
                                className="btn btn-info btn-sm" 
                                onClick={() => handleAddOrderToInventory(order)}
                                title="Add to Inventory"
                              >
                                📦
                              </button>
                            )}
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Delete Order"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-orders">
                <h4>No orders found</h4>
                <p>
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No orders match your current filters.' 
                    : 'No vehicle orders yet. Create your first order to get started!'
                  }
                </p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {setShowOrderForm(true); setEditingOrder(null);}}
                >
                  Create First Order
                </button>
              </div>
            )}
          </div>
          
          {/* Order Summary Stats */}
          <div className="grid grid-4" style={{marginTop: '2rem'}}>
            <div className="card metric-card">
              <div className="metric-icon orders">📋</div>
              <div className="metric-info">
                <h3 className="metric-value">{filteredOrders.length}</h3>
                <p className="metric-label">
                  {searchTerm || statusFilter !== 'all' ? 'Filtered Orders' : 'Total Orders'}
                </p>
              </div>
            </div>
            
            <div className="card metric-card">
              <div className="metric-icon in-transit">🚚</div>
              <div className="metric-info">
                <h3 className="metric-value">
                  {filteredOrders.filter(o => o.status === 'shipped').length}
                </h3>
                <p className="metric-label">In Transit</p>
              </div>
            </div>
            
            <div className="card metric-card">
              <div className="metric-icon clearing">🏛️</div>
              <div className="metric-info">
                <h3 className="metric-value">
                  {filteredOrders.filter(o => o.status === 'clearing').length}
                </h3>
                <p className="metric-label">In Clearing</p>
              </div>
            </div>
            
            <div className="card metric-card">
              <div className="metric-icon total-value">💎</div>
              <div className="metric-info">
                <h3 className="metric-value">
                  {formatCurrency(
                    filteredOrders.reduce((sum, order) => sum + order.totalCost, 0)
                  )}
                </h3>
                <p className="metric-label">Total Value</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="tab-content">
          <div className="card">
            <div className="orders-header">
              <h3>💳 Billing & POS System</h3>
              <div className="orders-controls">
                <div className="search-filter-group">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={billingSearchTerm}
                    onChange={(e) => setBillingSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <select
                    value={transactionStatusFilter}
                    onChange={(e) => setTransactionStatusFilter(e.target.value)}
                    className="status-filter"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="partial_paid">Partial Paid</option>
                    <option value="fully_paid">Fully Paid</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowTransactionModal(true)}
                >
                  💰 New Transaction
                </button>
              </div>
            </div>
            
            {filteredTransactions.length > 0 ? (
              <div className="orders-table-container">
                <table className="table orders-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Type</th>
                      <th>Total Amount</th>
                      <th>Paid</th>
                      <th>Balance</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(transaction => {
                      const customer = getCustomerById(transaction.customerId);
                      return (
                        <tr key={transaction.id}>
                          <td data-label="Transaction ID">
                            <strong>{transaction.id}</strong>
                            {transaction.invoiceNumber && (
                              <div><small>Invoice: {transaction.invoiceNumber}</small></div>
                            )}
                          </td>
                          <td data-label="Customer">
                            <div className="customer-info">
                              <strong>{customer?.name || 'Unknown'}</strong>
                              <small>{customer?.contact || 'No contact'}</small>
                            </div>
                          </td>
                          <td data-label="Vehicle">
                            <div className="vehicle-info">
                              <strong>{transaction.vehicleDetails.brand} {transaction.vehicleDetails.model}</strong>
                              <small>({transaction.vehicleDetails.year}) - {transaction.vehicleDetails.color}</small>
                            </div>
                          </td>
                          <td data-label="Type">
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                              <span className={`badge ${transaction.type === 'reservation' ? 'badge-warning' : 'badge-success'}`}>
                                {transaction.type === 'sale' ? 'COMPLETED' : transaction.type.toUpperCase()}
                              </span>
                              {transaction.type === 'sale' && transaction.status === 'completed' && (
                                <span style={{fontSize: '0.7em'}} title="Auto-upgraded from RESERVATION when fully paid">
                                  ✨
                                </span>
                              )}
                            </div>
                          </td>
                          <td data-label="Total Amount">
                            <strong>{formatCurrency(transaction.pricing.totalAmount, transaction.currency)}</strong>
                          </td>
                          <td data-label="Paid">
                            <span className="paid-amount">
                              {formatCurrency(transaction.totalPaid, transaction.currency)}
                            </span>
                          </td>
                          <td data-label="Balance">
                            <span className={`balance-amount ${transaction.balanceRemaining <= 0 ? 'paid-full' : 'pending-balance'}`}>
                              {formatCurrency(transaction.balanceRemaining, transaction.currency)}
                            </span>
                          </td>
                          <td data-label="Status">
                            <span className={`badge ${getTransactionStatusBadge(transaction.status)}`}>
                              {transaction.status ? transaction.status.replace('_', ' ').toUpperCase() : 'N/A'}
                            </span>
                          </td>
                          <td data-label="Date">
                            {transaction.reservationDate || transaction.completionDate || 'N/A'}
                          </td>
                          <td data-label="Actions">
                            <div className="action-buttons-cell">
                              <button 
                                className="btn btn-info btn-sm" 
                                onClick={() => setSelectedTransaction(transaction)}
                                title="View Details"
                              >
                                👁️
                              </button>
                              {transaction.balanceRemaining > 0 && (
                                <button 
                                  className="btn btn-success btn-sm" 
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setShowPaymentModal(true);
                                  }}
                                  title="Add Payment"
                                >
                                  💳
                                </button>
                              )}
                              {/* Customer Invoice - Always show */}
                              <button 
                                className="btn btn-secondary btn-sm" 
                                onClick={() => {
                                  setInvoiceTransaction(transaction);
                                  setInvoiceType('customer');
                                  setShowInvoiceModal(true);
                                }}
                                title="Customer Invoice"
                              >
                                🧾
                              </button>
                              {/* Bank Invoice - Only for LEASING */}
                              {transaction.type === 'leasing' && (
                                <button 
                                  className="btn btn-warning btn-sm" 
                                  onClick={() => {
                                    setInvoiceTransaction(transaction);
                                    setInvoiceType('bank');
                                    setShowInvoiceModal(true);
                                  }}
                                  title="Bank/Leasing Invoice"
                                >
                                  🏦
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-orders">
                <h4>No transactions found</h4>
                <p>
                  {billingSearchTerm || transactionStatusFilter !== 'all' 
                    ? 'No transactions match your current filters.' 
                    : 'No transactions yet. Start by creating your first reservation or sale!'
                  }
                </p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowTransactionModal(true)}
                >
                  Create First Transaction
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card" style={{marginTop: '2rem'}}>
            <h3>Quick POS Actions</h3>
            <div className="grid grid-3" style={{gap: '1rem'}}>
              <div className="pos-action-card">
                <h4>💰 Process Payment</h4>
                <p>Add payment for existing reservation or transaction</p>
                <button 
                  className="btn btn-success"
                  onClick={() => {
                    const pendingTransactions = transactions.filter(t => t.balanceRemaining > 0);
                    if (pendingTransactions.length === 0) {
                      alert('No transactions with pending balance. All transactions are fully paid.');
                      return;
                    }
                    if (pendingTransactions.length === 1) {
                      // Only one pending transaction, select it directly
                      setSelectedTransaction(pendingTransactions[0]);
                      setShowPaymentModal(true);
                    } else {
                      // Multiple transactions, show selector
                      setShowTransactionSelector(true);
                    }
                  }}
                >
                  Process Payment
                </button>
              </div>
              
              <div className="pos-action-card">
                <h4>📝 New Reservation</h4>
                <p>Create new vehicle reservation with deposit</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    if (inventoryItems.filter(i => i.status === 'available').length === 0) {
                      alert('No available vehicles in inventory.');
                      return;
                    }
                    setShowTransactionModal(true);
                  }}
                >
                  Create Reservation
                </button>
              </div>
              
              <div className="pos-action-card">
                <h4>🧾 Generate Invoice</h4>
                <p>Create and print invoices for transactions</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    const invoiceTransactions = transactions.filter(t => t.status === 'completed' || t.status === 'fully_paid');
                    if (invoiceTransactions.length === 0) {
                      alert('No completed transactions available for invoice generation.');
                      return;
                    }
                    // Simple invoice preview for now
                    const transaction = invoiceTransactions[0];
                    const customer = getCustomerById(transaction.customerId);
                    alert(`📄 Invoice Preview\n\nTransaction ID: ${transaction.id}\nCustomer: ${customer?.name}\nVehicle: ${transaction.vehicleDetails.brand} ${transaction.vehicleDetails.model}\nTotal: ${formatCurrency(transaction.pricing.totalAmount, transaction.currency)}\n\n📧 Full invoice system coming soon!`);
                  }}
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Invoice Management Section */}
          <div style={{marginTop: '3rem'}}>
            <Billing 
              transactions={transactions}
              customers={customers}
              inventoryItems={inventoryItems}
              vehicleOrders={vehicleOrders}
            />
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="tab-content">
          <ExpenseManager />
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="tab-content">
          <Reports 
            transactions={transactions}
            expenses={[]}
          />
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="tab-content">
          <div className="card">
            <div className="orders-header">
              <h3>Inventory Management</h3>
              <div className="orders-controls">
                <div className="search-filter-group">
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={inventorySearchTerm}
                    onChange={(e) => setInventorySearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <select
                    value={inventoryStatusFilter}
                    onChange={(e) => setInventoryStatusFilter(e.target.value)}
                    className="status-filter"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <select
                    value={inventoryConditionFilter}
                    onChange={(e) => setInventoryConditionFilter(e.target.value)}
                    className="status-filter"
                  >
                    <option value="all">All Conditions</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="needs_repair">Needs Repair</option>
                  </select>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {setShowInventoryForm(true); setEditingInventoryItem(null);}}
                >
                  Add New Vehicle
                </button>
              </div>
            </div>
            
            {filteredInventory.length > 0 ? (
              <div className="orders-table-container">
                <table className="table orders-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Vehicle</th>
                      <th>Details</th>
                      <th>Condition</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Purchase Price</th>
                      <th>Market Value</th>
                      <th>Selling Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(item => (
                      <tr key={item.id}>
                        <td data-label="ID">
                          <strong>{item.id}</strong>
                        </td>
                        <td data-label="Vehicle">
                          <div className="vehicle-info">
                            <strong>{item.brand} {item.model}</strong>
                            <small>({item.year}) - {item.color}</small>
                          </div>
                        </td>
                        <td data-label="Details">
                          <div className="vehicle-details">
                            <small>{item.mileage.toLocaleString()} km</small>
                            <small>{item.fuelType} • {item.transmission}</small>
                            <small>{item.bodyType}</small>
                          </div>
                        </td>
                        <td data-label="Condition">
                          <span className={`badge ${getConditionBadge(item.condition)}`}>
                            {item.condition ? item.condition.replace('_', ' ').toUpperCase() : 'N/A'}
                          </span>
                        </td>
                        <td data-label="Location">
                          {item.location}
                        </td>
                        <td data-label="Status">
                          <div className="status-cell">
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                              <span className={`badge ${getInventoryStatusBadge(item.status)}`}>
                                {item.status.toUpperCase()}
                              </span>
                              {item.status === 'sold' && item.soldInfo && (
                                <span style={{fontSize: '0.7em'}} title="Auto-sold via completed transaction">
                                  ⚡
                                </span>
                              )}
                            </div>
                            <select
                              value={item.status}
                              onChange={(e) => handleInventoryStatusUpdate(item.id, e.target.value as any)}
                              className="status-update-select"
                            >
                              <option value="available">Available</option>
                              <option value="reserved">Reserved</option>
                              <option value="sold">Sold</option>
                              <option value="maintenance">Maintenance</option>
                            </select>
                          </div>
                        </td>
                        <td data-label="Purchase Price">
                          <strong>{formatCurrency(item.purchasePrice, item.currency)}</strong>
                        </td>
                        <td data-label="Market Value">
                          <strong>{formatCurrency(item.marketValue, item.currency)}</strong>
                        </td>
                        <td data-label="Selling Price">
                          {item.sellingPrice ? (
                            <strong className="selling-price">
                              {formatCurrency(item.sellingPrice, item.currency)}
                            </strong>
                          ) : (
                            <span className="no-price">Not Set</span>
                          )}
                          {item.soldInfo && (
                            <div className="sold-info">
                              <small>Sold for: {formatCurrency(item.soldInfo.finalPrice, item.currency)}</small>
                            </div>
                          )}
                        </td>
                        <td data-label="Actions">
                          <div className="action-buttons-cell">
                            <button 
                              className="btn btn-info btn-sm" 
                              onClick={() => setInventoryDetailsModal(item)}
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => handleEditInventoryItem(item)}
                              title="Edit Vehicle"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => handleDeleteInventoryItem(item.id)}
                              title="Delete Vehicle"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-orders">
                <h4>No inventory items found</h4>
                <p>
                  {inventorySearchTerm || inventoryStatusFilter !== 'all' || inventoryConditionFilter !== 'all'
                    ? 'No vehicles match your current filters.' 
                    : 'No vehicles in inventory yet. Add your first vehicle to get started!'
                  }
                </p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {setShowInventoryForm(true); setEditingInventoryItem(null);}}
                >
                  Add First Vehicle
                </button>
              </div>
            )}
          </div>
          
          {/* Inventory Summary Stats */}
          <div className="grid grid-4" style={{marginTop: '2rem'}}>
            <div className="card metric-card">
              <div className="metric-icon available">✅</div>
              <div className="metric-info">
                <h3 className="metric-value">{availableInventory}</h3>
                <p className="metric-label">Available Vehicles</p>
              </div>
            </div>
            
            <div className="card metric-card">
              <div className="metric-icon reserved">⏰</div>
              <div className="metric-info">
                <h3 className="metric-value">{reservedInventory}</h3>
                <p className="metric-label">Reserved</p>
              </div>
            </div>
            
            <div className="card metric-card">
              <div className="metric-icon sold">💰</div>
              <div className="metric-info">
                <h3 className="metric-value">{soldInventory}</h3>
                <p className="metric-label">Sold Vehicles</p>
              </div>
            </div>
            
            <div className="card metric-card">
              <div className="metric-icon inventory-value">💎</div>
              <div className="metric-info">
                <h3 className="metric-value">{formatCurrency(totalInventoryValue)}</h3>
                <p className="metric-label">Total Inventory Value</p>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* Vehicle Order Form Modal */}
      {showOrderForm && (
        <VehicleOrderForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingOrder ? {
            model: editingOrder.model,
            year: editingOrder.year,
            country: editingOrder.country,
            supplier: editingOrder.supplier || '',
            vehicleCost: editingOrder.expenses.vehicleCost,
            currency: editingOrder.currency,
            expectedDelivery: editingOrder.expectedDelivery || '',
            notes: editingOrder.notes || '',
            expenses: {
              fuel: editingOrder.expenses.fuel,
              duty: editingOrder.expenses.duty,
              driverCharge: editingOrder.expenses.driverCharge,
              clearanceCharge: editingOrder.expenses.clearanceCharge,
              demurrage: editingOrder.expenses.demurrage,
              tax: editingOrder.expenses.tax,
              customExpenses: editingOrder.expenses.customExpenses || {},
            },
            paymentMethod: editingOrder.paymentMethod || 'Bank Transfer',
            // New fields
            vehicleNumber: editingOrder.vehicleNumber || '',
            lcAmount: editingOrder.lcAmount || 0,
            lcBank: editingOrder.lcBank || '',
            additionalInfo: editingOrder.additionalInfo || '',
            // Basic Information fields
            vinNumber: editingOrder.vinNumber || '',
            licensePlateNumber: editingOrder.licensePlateNumber || '',
            customBasicInfo: editingOrder.customBasicInfo || {},
          } : undefined}
          isEditing={!!editingOrder}
        />
      )}

      {/* Order Details Modal */}
      {orderDetailsModal && (
        <div className="vehicle-order-form-overlay">
          <div className="vehicle-order-form order-details-modal">
            <div className="form-header">
              <h2>Order Details - {orderDetailsModal.id}</h2>
              <button className="close-btn" onClick={() => setOrderDetailsModal(null)}>×</button>
            </div>
            
            <div className="order-details-content">
              <div className="detail-sections">
                {/* Vehicle Information */}
                <div className="detail-section">
                  <h3>Vehicle Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Model:</label>
                      <span>{orderDetailsModal.model}</span>
                    </div>
                    <div className="detail-item">
                      <label>Year:</label>
                      <span>{orderDetailsModal.year}</span>
                    </div>
                    <div className="detail-item">
                      <label>Country:</label>
                      <span>🌐 {orderDetailsModal.country}</span>
                    </div>
                    <div className="detail-item">
                      <label>Supplier:</label>
                      <span>{orderDetailsModal.supplier || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="detail-section">
                  <h3>Order Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Order Date:</label>
                      <span>{orderDetailsModal.orderDate}</span>
                    </div>
                    <div className="detail-item">
                      <label>Expected Delivery:</label>
                      <span>{orderDetailsModal.expectedDelivery || 'TBD'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={`badge ${getStatusBadge(orderDetailsModal.status)}`}>
                        {orderDetailsModal.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Payment Method:</label>
                      <span>{orderDetailsModal.paymentMethod || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="detail-section">
                  <h3>Cost Breakdown</h3>
                  <div className="expense-breakdown">
                    <div className="expense-item">
                      <span>Vehicle Cost:</span>
                      <span>{formatCurrency(orderDetailsModal.expenses.vehicleCost, orderDetailsModal.currency)}</span>
                    </div>
                    <div className="expense-item">
                      <span>Fuel:</span>
                      <span>{formatCurrency(orderDetailsModal.expenses.fuel, orderDetailsModal.currency)}</span>
                    </div>
                    <div className="expense-item">
                      <span>Duty:</span>
                      <span>{formatCurrency(orderDetailsModal.expenses.duty, orderDetailsModal.currency)}</span>
                    </div>
                    <div className="expense-item">
                      <span>Driver Charge:</span>
                      <span>{formatCurrency(orderDetailsModal.expenses.driverCharge, orderDetailsModal.currency)}</span>
                    </div>
                    <div className="expense-item">
                      <span>Clearance Charge:</span>
                      <span>{formatCurrency(orderDetailsModal.expenses.clearanceCharge, orderDetailsModal.currency)}</span>
                    </div>
                    <div className="expense-item">
                      <span>Demurrage:</span>
                      <span>{formatCurrency(orderDetailsModal.expenses.demurrage, orderDetailsModal.currency)}</span>
                    </div>
                    <div className="expense-item">
                      <span>Tax:</span>
                      <span>{formatCurrency(orderDetailsModal.expenses.tax, orderDetailsModal.currency)}</span>
                    </div>
                    {/* Custom Expenses */}
                    {Object.entries(orderDetailsModal.expenses.customExpenses || {}).map(([expenseName, amount]) => (
                      <div key={expenseName} className="expense-item">
                        <span>{expenseName}:</span>
                        <span>{formatCurrency(amount, orderDetailsModal.currency)}</span>
                      </div>
                    ))}
                    <div className="expense-item total-cost">
                      <span><strong>Total Cost:</strong></span>
                      <span><strong>{formatCurrency(orderDetailsModal.totalCost, orderDetailsModal.currency)}</strong></span>
                    </div>
                    {orderDetailsModal.profit && (
                      <div className="expense-item profit">
                        <span><strong>Profit:</strong></span>
                        <span className="profit-amount">
                          <strong>{formatCurrency(orderDetailsModal.profit, orderDetailsModal.currency)}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                {(orderDetailsModal.vinNumber || orderDetailsModal.licensePlateNumber || (orderDetailsModal.customBasicInfo && Object.keys(orderDetailsModal.customBasicInfo).length > 0)) && (
                  <div className="detail-section">
                    <h3>📋 Basic Information</h3>
                    <div className="detail-grid">
                      {orderDetailsModal.vinNumber && (
                        <div className="detail-item">
                          <label>VIN Number:</label>
                          <span>{orderDetailsModal.vinNumber}</span>
                        </div>
                      )}
                      {orderDetailsModal.licensePlateNumber && (
                        <div className="detail-item">
                          <label>License Plate:</label>
                          <span>{orderDetailsModal.licensePlateNumber}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Custom Basic Information */}
                    {orderDetailsModal.customBasicInfo && Object.keys(orderDetailsModal.customBasicInfo).length > 0 && (
                      <div style={{marginTop: '1rem'}}>
                        <label style={{fontWeight: 'bold', color: '#2c3e50', marginBottom: '0.5rem', display: 'block'}}>Custom Information:</label>
                        <div className="detail-grid">
                          {Object.entries(orderDetailsModal.customBasicInfo).map(([key, value]) => (
                            <div key={key} className="detail-item">
                              <label>{key}:</label>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Vehicle Details */}
                {(orderDetailsModal.vehicleNumber || orderDetailsModal.additionalInfo) && (
                  <div className="detail-section">
                    <h3>Vehicle Details</h3>
                    <div className="detail-grid">
                      {orderDetailsModal.vehicleNumber && (
                        <div className="detail-item">
                          <label>Vehicle Number:</label>
                          <span>{orderDetailsModal.vehicleNumber}</span>
                        </div>
                      )}
                    </div>
                    {orderDetailsModal.additionalInfo && (
                      <div className="additional-info-content" style={{marginTop: '0.75rem'}}>
                        <label style={{fontWeight: 'bold', color: '#2c3e50'}}>Additional Information:</label>
                        <div style={{marginTop: '0.5rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef'}}>
                          {orderDetailsModal.additionalInfo}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* LC Information */}
                {(orderDetailsModal.lcAmount || orderDetailsModal.lcBank) && (
                  <div className="detail-section">
                    <h3>💰 Letter of Credit (LC) Information</h3>
                    <div className="detail-grid">
                      {orderDetailsModal.lcAmount && (
                        <div className="detail-item">
                          <label>LC Amount:</label>
                          <span>{formatCurrency(orderDetailsModal.lcAmount, orderDetailsModal.currency)}</span>
                        </div>
                      )}
                      {orderDetailsModal.lcBank && (
                        <div className="detail-item">
                          <label>LC Bank:</label>
                          <span>{orderDetailsModal.lcBank}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {orderDetailsModal.notes && (
                  <div className="detail-section">
                    <h3>Notes</h3>
                    <div className="notes-content">
                      {orderDetailsModal.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="detail-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setOrderDetailsModal(null)}
                >
                  Close
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setOrderDetailsModal(null);
                    handleEditOrder(orderDetailsModal);
                  }}
                >
                  Edit Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Inventory Form Modal */}
      {showInventoryForm && (
        <InventoryForm
          onSubmit={handleInventoryFormSubmit}
          onCancel={handleInventoryFormCancel}
          initialData={editingInventoryItem ? {
            model: editingInventoryItem.model,
            brand: editingInventoryItem.brand,
            year: editingInventoryItem.year,
            color: editingInventoryItem.color,
            mileage: editingInventoryItem.mileage,
            condition: editingInventoryItem.condition,
            purchasePrice: editingInventoryItem.purchasePrice,
            marketValue: editingInventoryItem.marketValue,
            sellingPrice: editingInventoryItem.sellingPrice,
            currency: editingInventoryItem.currency,
            location: editingInventoryItem.location,
            features: editingInventoryItem.features,
            vin: editingInventoryItem.vin,
            licensePlate: editingInventoryItem.licensePlate,
            fuelType: editingInventoryItem.fuelType,
            transmission: editingInventoryItem.transmission,
            engineSize: editingInventoryItem.engineSize,
            bodyType: editingInventoryItem.bodyType,
            supplier: editingInventoryItem.supplier,
            purchaseDate: editingInventoryItem.purchaseDate,
            warrantyExpiry: editingInventoryItem.warrantyExpiry,
            notes: editingInventoryItem.notes,
          } : undefined}
          isEditing={!!editingInventoryItem}
        />
      )}

      {/* Transaction Form Modal */}
      {showTransactionModal && (
        <TransactionForm
          inventoryItems={inventoryItems.filter(item => item.status === 'available')}
          customers={customers}
          leasingCompanies={leasingCompanies}
          onSubmit={handleCreateReservation}
          onCancel={() => setShowTransactionModal(false)}
          onAddLeasingCompany={handleAddLeasingCompany}
        />
      )}

      {/* Payment Form Modal */}
      {showPaymentModal && selectedTransaction && (
        <PaymentForm
          transaction={selectedTransaction}
          onSubmit={(paymentData) => handleAddPayment(selectedTransaction.id, paymentData)}
          onCancel={() => {
            setShowPaymentModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}

      {/* Transaction Selector Modal */}
      {showTransactionSelector && (
        <TransactionSelectorModal
          transactions={transactions.filter(t => t.balanceRemaining > 0)}
          customers={customers}
          onSelectTransaction={(transaction) => {
            setSelectedTransaction(transaction);
            setShowTransactionSelector(false);
            setShowPaymentModal(true);
          }}
          onCancel={() => setShowTransactionSelector(false)}
        />
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && !showPaymentModal && !showTransactionSelector && !showInvoiceModal && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          customer={getCustomerById(selectedTransaction.customerId)}
          onClose={() => setSelectedTransaction(null)}
          onAddPayment={() => setShowPaymentModal(true)}
        />
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceTransaction && (
        <InvoiceModal
          transaction={invoiceTransaction}
          customers={customers}
          inventoryItems={inventoryItems}
          invoiceType={invoiceType}
          onClose={() => {
            setShowInvoiceModal(false);
            setInvoiceTransaction(null);
            setInvoiceType('customer');
          }}
        />
      )}

      {/* Inventory Details Modal */}
      {inventoryDetailsModal && (
        <div className="vehicle-order-form-overlay">
          <div className="vehicle-order-form order-details-modal">
            <div className="form-header">
              <h2>Vehicle Details - {inventoryDetailsModal.id}</h2>
              <button className="close-btn" onClick={() => setInventoryDetailsModal(null)}>×</button>
            </div>
            
            <div className="order-details-content">
              <div className="detail-sections">
                {/* Vehicle Information */}
                <div className="detail-section">
                  <h3>Vehicle Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Brand & Model:</label>
                      <span>{inventoryDetailsModal.brand} {inventoryDetailsModal.model}</span>
                    </div>
                    <div className="detail-item">
                      <label>Year:</label>
                      <span>{inventoryDetailsModal.year}</span>
                    </div>
                    <div className="detail-item">
                      <label>Color:</label>
                      <span>{inventoryDetailsModal.color}</span>
                    </div>
                    <div className="detail-item">
                      <label>Mileage:</label>
                      <span>{inventoryDetailsModal.mileage.toLocaleString()} km</span>
                    </div>
                    <div className="detail-item">
                      <label>Condition:</label>
                      <span className={`badge ${getConditionBadge(inventoryDetailsModal.condition)}`}>
                        {inventoryDetailsModal.condition.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Body Type:</label>
                      <span>{inventoryDetailsModal.bodyType.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="detail-section">
                  <h3>Technical Details</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Fuel Type:</label>
                      <span>{inventoryDetailsModal.fuelType.charAt(0).toUpperCase() + inventoryDetailsModal.fuelType.slice(1)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Transmission:</label>
                      <span>{inventoryDetailsModal.transmission.charAt(0).toUpperCase() + inventoryDetailsModal.transmission.slice(1)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Engine Size:</label>
                      <span>{inventoryDetailsModal.engineSize || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>VIN:</label>
                      <span>{inventoryDetailsModal.vin || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>License Plate:</label>
                      <span>{inventoryDetailsModal.licensePlate || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Location:</label>
                      <span>{inventoryDetailsModal.location}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="detail-section">
                  <h3>Financial Information</h3>
                  <div className="expense-breakdown">
                    <div className="expense-item">
                      <span>Purchase Price:</span>
                      <span>{formatCurrency(inventoryDetailsModal.purchasePrice, inventoryDetailsModal.currency)}</span>
                    </div>
                    <div className="expense-item">
                      <span>Market Value:</span>
                      <span>{formatCurrency(inventoryDetailsModal.marketValue, inventoryDetailsModal.currency)}</span>
                    </div>
                    {inventoryDetailsModal.sellingPrice && (
                      <div className="expense-item">
                        <span>Selling Price:</span>
                        <span>{formatCurrency(inventoryDetailsModal.sellingPrice, inventoryDetailsModal.currency)}</span>
                      </div>
                    )}
                    {inventoryDetailsModal.soldInfo && (
                      <div className="expense-item profit">
                        <span><strong>Final Sale Price:</strong></span>
                        <span className="profit-amount">
                          <strong>{formatCurrency(inventoryDetailsModal.soldInfo.finalPrice, inventoryDetailsModal.currency)}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                {inventoryDetailsModal.features && inventoryDetailsModal.features.length > 0 && (
                  <div className="detail-section">
                    <h3>Features</h3>
                    <div className="features-list">
                      {inventoryDetailsModal.features.map((feature, index) => (
                        <span key={index} className="feature-tag">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reservation Information */}
                {inventoryDetailsModal.reservedBy && (
                  <div className="detail-section">
                    <h3>Reservation Details</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Reserved By:</label>
                        <span>{inventoryDetailsModal.reservedBy.name}</span>
                      </div>
                      <div className="detail-item">
                        <label>Contact:</label>
                        <span>{inventoryDetailsModal.reservedBy.contact}</span>
                      </div>
                      <div className="detail-item">
                        <label>Reservation Date:</label>
                        <span>{inventoryDetailsModal.reservedBy.reservationDate}</span>
                      </div>
                      {inventoryDetailsModal.reservedBy.depositAmount && (
                        <div className="detail-item">
                          <label>Deposit:</label>
                          <span>{formatCurrency(inventoryDetailsModal.reservedBy.depositAmount, inventoryDetailsModal.currency)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sale Information */}
                {inventoryDetailsModal.soldInfo && (
                  <div className="detail-section">
                    <h3>Sale Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Customer:</label>
                        <span>{inventoryDetailsModal.soldInfo.customerName}</span>
                      </div>
                      <div className="detail-item">
                        <label>Contact:</label>
                        <span>{inventoryDetailsModal.soldInfo.customerContact}</span>
                      </div>
                      <div className="detail-item">
                        <label>Sale Date:</label>
                        <span>{inventoryDetailsModal.soldInfo.saleDate}</span>
                      </div>
                      <div className="detail-item">
                        <label>Payment Method:</label>
                        <span>{inventoryDetailsModal.soldInfo.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {inventoryDetailsModal.notes && (
                  <div className="detail-section">
                    <h3>Notes</h3>
                    <div className="notes-content">
                      {inventoryDetailsModal.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="detail-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setInventoryDetailsModal(null)}
                >
                  Close
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setInventoryDetailsModal(null);
                    handleEditInventoryItem(inventoryDetailsModal);
                  }}
                >
                  Edit Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Section */}
      {activeTab === 'profile' && (
        <div className="tab-content">
          <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem', color: '#ffffff', borderBottom: '3px solid #667eea', paddingBottom: '1rem' }}>👤 User Profile</h2>
            
            <div style={{ display: 'grid', gap: '2rem' }}>
              {/* Profile Header */}
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', padding: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#667eea', fontWeight: 'bold' }}>
                  {(localStorage.getItem('username') || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>{localStorage.getItem('username') || 'Admin'}</h3>
                  <p style={{ margin: 0, opacity: 0.9 }}>Administrator</p>
                  <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Last Login: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Account Statistics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{transactions.length}</h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Total Transactions</p>
                </div>
                <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚗</div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{inventoryItems.length}</h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Inventory Items</p>
                </div>
                <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{customers.length}</h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Total Customers</p>
                </div>
                <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{vehicleOrders.length}</h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Vehicle Orders</p>
                </div>
              </div>

              {/* Account Info */}
              <div style={{ padding: '1.5rem', background: '#e8f5e9', borderRadius: '8px', borderLeft: '4px solid #43e97b' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>✅ Account Status</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>Account Created:</strong>
                    <p style={{ margin: '0.3rem 0 0 0', color: '#27ae60' }}>Active since 2024</p>
                  </div>
                  <div>
                    <strong>System Role:</strong>
                    <p style={{ margin: '0.3rem 0 0 0', color: '#7f8c8d' }}>Administrator</p>
                  </div>
                  <div>
                    <strong>Access Level:</strong>
                    <p style={{ margin: '0.3rem 0 0 0', color: '#27ae60' }}>Full Access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Section */}
      {activeTab === 'settings' && (
        <div className="tab-content">
          <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem', color: '#ffffff', borderBottom: '3px solid #667eea', paddingBottom: '1rem' }}>⚙️ System Settings</h2>
            
            <div style={{ display: 'grid', gap: '2rem' }}>
              {/* General Settings */}
              <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', borderLeft: '4px solid #667eea' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>🔧 General Settings</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <div>
                      <strong>Company Name</strong>
                      <p style={{ margin: '0.3rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Display name for the system</p>
                    </div>
                    <span style={{ color: '#667eea', fontWeight: '600' }}>Moder Car Sale</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <div>
                      <strong>Default Currency</strong>
                      <p style={{ margin: '0.3rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Primary currency for transactions</p>
                    </div>
                    <span style={{ color: '#667eea', fontWeight: '600' }}>LKR (Rs)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <div>
                      <strong>Language</strong>
                      <p style={{ margin: '0.3rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>System display language</p>
                    </div>
                    <span style={{ color: '#667eea', fontWeight: '600' }}>English</span>
                  </div>
                </div>
              </div>

              {/* Database Settings */}
              <div style={{ padding: '1.5rem', background: '#e3f2fd', borderRadius: '12px', borderLeft: '4px solid #2196f3' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>💾 Database Status</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <div>
                      <strong>Database Status</strong>
                      <p style={{ margin: '0.3rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>MongoDB connection status</p>
                    </div>
                    <span style={{ padding: '0.4rem 1rem', background: '#d4edda', color: '#155724', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>● Connected</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <div>
                      <strong>Backend Status</strong>
                      <p style={{ margin: '0.3rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Server connection status</p>
                    </div>
                    <span style={{ padding: '0.4rem 1rem', background: '#d4edda', color: '#155724', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>● Online</span>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div style={{ padding: '1.5rem', background: '#f3e5f5', borderRadius: '12px', borderLeft: '4px solid #9c27b0' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>ℹ️ System Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <strong>Version</strong>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d' }}>v1.0.0</p>
                  </div>
                  <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <strong>Developed By</strong>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d' }}>NextWave Tech Labs</p>
                  </div>
                  <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <strong>Support</strong>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d' }}>support@nextwave.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sale Form Component
interface SaleFormProps {
  order: VehicleOrder;
  onSubmit: (data: {
    sellingPrice: number;
    customerName: string;
    customerContact: string;
    customerPaymentMethod: string;
    saleDate: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ order, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    sellingPrice: order.marketValue || order.totalCost * 1.2, // Suggest 20% markup
    customerName: '',
    customerContact: '',
    customerPaymentMethod: 'Cash',
    saleDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sellingPrice' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const calculateProfit = () => (parseFloat(formData.sellingPrice as any) || 0) - order.totalCost;
  const calculateMargin = () => {
    const sellingPrice = parseFloat(formData.sellingPrice as any) || 0;
    return sellingPrice > 0 ? ((calculateProfit() / sellingPrice) * 100) : 0;
  };

  return (
    <div className="sale-form-content">
      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span>Vehicle:</span>
            <span>{order.model} ({order.year})</span>
          </div>
          <div className="summary-item">
            <span>Order ID:</span>
            <span>{order.id}</span>
          </div>
          <div className="summary-item">
            <span>Total Cost:</span>
            <span>{new Intl.NumberFormat('en-US', {style: 'currency', currency: order.currency}).format(order.totalCost)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-sections">
          <div className="form-section">
            <h3>💰 Sale Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="sellingPrice" className="form-label">Selling Price *</label>
                <input
                  type="number"
                  id="sellingPrice"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="form-input"
                  required
                  min="0"
                  step="any"
                  placeholder="Enter selling price"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="saleDate" className="form-label">Sale Date *</label>
                <input
                  type="date"
                  id="saleDate"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>👤 Customer Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="customerName" className="form-label">Customer Name *</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Customer full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="customerContact" className="form-label">Contact Number *</label>
                <input
                  type="text"
                  id="customerContact"
                  name="customerContact"
                  value={formData.customerContact}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="+971-50-123-4567"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="customerPaymentMethod" className="form-label">Payment Method *</label>
                <select
                  id="customerPaymentMethod"
                  name="customerPaymentMethod"
                  value={formData.customerPaymentMethod}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Finance">Finance/Loan</option>
                  <option value="Part Exchange">Part Exchange</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>📝 Additional Notes</h3>
            <div className="form-group">
              <label htmlFor="notes" className="form-label">Sale Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="form-input"
                rows={3}
                placeholder="Any additional notes about the sale..."
              />
            </div>
          </div>

          <div className="form-section">
            <div className="profit-summary">
              <h3>💹 Profit Analysis</h3>
              <div className="profit-breakdown">
                <div className="profit-item">
                  <span>Selling Price:</span>
                  <span className="profit-value">
                    {new Intl.NumberFormat('en-US', {style: 'currency', currency: order.currency}).format(formData.sellingPrice)}
                  </span>
                </div>
                <div className="profit-item">
                  <span>Total Cost:</span>
                  <span className="cost-value">
                    -{new Intl.NumberFormat('en-US', {style: 'currency', currency: order.currency}).format(order.totalCost)}
                  </span>
                </div>
                <div className="profit-item total-profit">
                  <span><strong>Net Profit:</strong></span>
                  <span className={`profit-value ${calculateProfit() >= 0 ? 'positive' : 'negative'}`}>
                    <strong>
                      {new Intl.NumberFormat('en-US', {style: 'currency', currency: order.currency}).format(calculateProfit())}
                      {(parseFloat(formData.sellingPrice as any) || 0) > 0 && (
                        <small> ({calculateMargin().toFixed(1)}%)</small>
                      )}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-success">
            💰 Complete Sale
          </button>
        </div>
      </form>
    </div>
  );
};

// Inventory Form Component
interface InventoryFormProps {
  onSubmit: (data: InventoryFormData) => void;
  onCancel: () => void;
  initialData?: InventoryFormData;
  isEditing?: boolean;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ onSubmit, onCancel, initialData, isEditing }) => {
  const [formData, setFormData] = useState<InventoryFormData>(
    initialData || {
      model: '',
      brand: '',
      year: new Date().getFullYear(),
      color: '',
      mileage: '' as any,
      condition: 'excellent',
      purchasePrice: '' as any,
      marketValue: '' as any,
      sellingPrice: '' as any,
      currency: 'LKR',
      location: '',
      features: [],
      vin: '',
      licensePlate: '',
      fuelType: 'gasoline',
      transmission: 'automatic',
      engineSize: '',
      bodyType: 'sedan',
      supplier: '',
      purchaseDate: '',
      warrantyExpiry: '',
      notes: ''
    }
  );

  const [featuresInput, setFeaturesInput] = useState(
    initialData?.features?.join(', ') || ''
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['year', 'mileage', 'purchasePrice', 'marketValue', 'sellingPrice'].includes(name) 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeaturesInput(e.target.value);
    const featuresArray = e.target.value.split(',').map(f => f.trim()).filter(f => f.length > 0);
    setFormData(prev => ({
      ...prev,
      features: featuresArray
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const calculatePotentialProfit = () => {
    const sellingPrice = parseFloat(formData.sellingPrice as any) || 0;
    const marketValue = parseFloat(formData.marketValue as any) || 0;
    const purchasePrice = parseFloat(formData.purchasePrice as any) || 0;
    
    if (sellingPrice > 0) {
      return sellingPrice - purchasePrice;
    }
    return marketValue - purchasePrice;
  };

  return (
    <div className="vehicle-order-form-overlay">
      <div className="vehicle-order-form">
        <div className="form-header">
          <h2>{isEditing ? '✏️ Edit Vehicle' : '🚗 Add New Vehicle'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* Basic Vehicle Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="brand" className="form-label">Brand *</label>
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select Brand</option>
                    <option value="Toyota">Toyota</option>
                    <option value="BMW">BMW</option>
                    <option value="Mercedes">Mercedes</option>
                    <option value="Audi">Audi</option>
                    <option value="Honda">Honda</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Kia">Kia</option>
                    <option value="Ford">Ford</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Tesla">Tesla</option>
                    <option value="Jeep">Jeep</option>
                    <option value="Lexus">Lexus</option>
                    <option value="Infiniti">Infiniti</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="model" className="form-label">Model *</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="e.g., Camry Hybrid"
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
                  <label htmlFor="color" className="form-label">Color *</label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="e.g., Pearl White"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="mileage" className="form-label">Mileage (km) *</label>
                  <input
                    type="number"
                    id="mileage"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    required
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="condition" className="form-label">Condition *</label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="needs_repair">Needs Repair</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="form-section">
              <h3>Technical Specifications</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="bodyType" className="form-label">Body Type *</label>
                  <select
                    id="bodyType"
                    name="bodyType"
                    value={formData.bodyType}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="coupe">Coupe</option>
                    <option value="pickup">Pickup</option>
                    <option value="van">Van</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="fuelType" className="form-label">Fuel Type *</label>
                  <select
                    id="fuelType"
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="transmission" className="form-label">Transmission *</label>
                  <select
                    id="transmission"
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                    <option value="cvt">CVT</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="engineSize" className="form-label">Engine Size</label>
                  <input
                    type="text"
                    id="engineSize"
                    name="engineSize"
                    value={formData.engineSize}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., 2.5L"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="vin" className="form-label">VIN Number</label>
                  <input
                    type="text"
                    id="vin"
                    name="vin"
                    value={formData.vin}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Vehicle Identification Number"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="licensePlate" className="form-label">License Plate</label>
                  <input
                    type="text"
                    id="licensePlate"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., D-12345"
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="form-section">
              <h3>Financial Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="purchasePrice" className="form-label">Purchase Price *</label>
                  <input
                    type="number"
                    id="purchasePrice"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    required
                    min="0"
                    step="any"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="marketValue" className="form-label">Market Value *</label>
                  <input
                    type="number"
                    id="marketValue"
                    name="marketValue"
                    value={formData.marketValue}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    required
                    min="0"
                    step="any"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="sellingPrice" className="form-label">Target Selling Price</label>
                  <input
                    type="number"
                    id="sellingPrice"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    min="0"
                    step="any"
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
              </div>
            </div>

            {/* Location and Supplier Information */}
            <div className="form-section">
              <h3>Location & Supplier</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="location" className="form-label">Location <span style={{color: '#7f8c8d', fontSize: '12px'}}>(Optional)</span></label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Dubai Showroom A, Abu Dhabi Branch, etc."
                  />
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
                  <label htmlFor="purchaseDate" className="form-label">Purchase Date</label>
                  <input
                    type="date"
                    id="purchaseDate"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="warrantyExpiry" className="form-label">Warranty Expiry</label>
                  <input
                    type="date"
                    id="warrantyExpiry"
                    name="warrantyExpiry"
                    value={formData.warrantyExpiry}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="form-section">
              <h3>Features & Notes</h3>
              <div className="form-group">
                <label htmlFor="features" className="form-label">Features</label>
                <textarea
                  id="features"
                  name="features"
                  value={featuresInput}
                  onChange={handleFeaturesChange}
                  className="form-input"
                  rows={3}
                  placeholder="Enter features separated by commas (e.g., Navigation System, Leather Seats, Sunroof)"
                />
                <small className="form-help">Separate multiple features with commas</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-input"
                  rows={4}
                  placeholder="Any additional notes about the vehicle..."
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="form-section">
              <div className="cost-summary">
                <h3>Financial Summary</h3>
                <div className="cost-breakdown">
                  <div className="cost-item">
                    <span>Purchase Price:</span>
                    <span>{formData.currency} {(parseFloat(formData.purchasePrice as any) || 0).toFixed(2)}</span>
                  </div>
                  <div className="cost-item">
                    <span>Market Value:</span>
                    <span>{formData.currency} {(parseFloat(formData.marketValue as any) || 0).toFixed(2)}</span>
                  </div>
                  {(parseFloat(formData.sellingPrice as any) || 0) > 0 && (
                    <div className="cost-item">
                      <span>Target Selling Price:</span>
                      <span>{formData.currency} {(parseFloat(formData.sellingPrice as any) || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="cost-item total">
                    <span><strong>Potential Profit:</strong></span>
                    <span className={calculatePotentialProfit() >= 0 ? 'profit-positive' : 'profit-negative'}>
                      <strong>{formData.currency} {calculatePotentialProfit().toFixed(2)}</strong>
                    </span>
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
              {isEditing ? '✏️ Update Vehicle' : '🚗 Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Transaction Form Component
interface TransactionFormProps {
  inventoryItems: InventoryItem[];
  customers: Customer[];
  leasingCompanies: LeasingCompany[];
  onSubmit: (inventoryId: string, customerData: {
    name: string;
    contact: string;
    email?: string;
    address?: string;
    idNumber?: string;
    nic?: string;
  }, pricingData: {
    vehiclePrice: number;
    taxes: number;
    fees: number;
    discount: number;
  }, paymentMode: 'cash' | 'bank_transfer' | 'leasing', leasingData?: {
    leasingCompanyId: string;
    downPayment: number;
    leasingAmount: number;
    monthlyInstallment: number;
    tenure: number;
    interestRate: number;
    leaseReferenceNo: string;
  }) => void;
  onCancel: () => void;
  onAddLeasingCompany: (company: LeasingCompany) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ inventoryItems, customers, leasingCompanies, onSubmit, onCancel, onAddLeasingCompany }) => {
  // Debug logging
  console.log('TransactionForm rendered with leasingCompanies:', leasingCompanies);
  
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('LKR');
  const [customerData, setCustomerData] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    idNumber: '',
    nic: ''
  });
  const [pricingData, setPricingData] = useState({
    vehiclePrice: '' as any,
    taxes: '' as any,
    fees: '' as any,
    discount: '' as any
  });
  
  // Payment Mode State
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank_transfer' | 'leasing'>('cash');
  
  // Leasing State
  const [leasingData, setLeasingData] = useState({
    leasingCompanyId: '',
    downPayment: '' as any,
    leasingAmount: '' as any,
    monthlyInstallment: '' as any,
    tenure: '' as any,
    interestRate: '' as any,
    leaseReferenceNo: ''
  });
  
  // Add new leasing company state
  const [showAddLeasingCompany, setShowAddLeasingCompany] = useState(false);
  const [newLeasingCompany, setNewLeasingCompany] = useState({
    name: '',
    branch: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = inventoryItems.find(v => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicleId);
      setSelectedCurrency(vehicle.currency || 'LKR');
      setPricingData(prev => ({
        ...prev,
        vehiclePrice: vehicle.sellingPrice || vehicle.marketValue,
        taxes: Math.round((vehicle.sellingPrice || vehicle.marketValue) * 0.05) // 5% tax assumption
      }));
      
      // Auto-calculate leasing amounts if leasing mode is selected
      if (paymentMode === 'leasing') {
        const totalAmount = (vehicle.sellingPrice || vehicle.marketValue) + Math.round((vehicle.sellingPrice || vehicle.marketValue) * 0.05) + 500;
        const defaultDownPayment = Math.round(totalAmount * 0.2); // 20% down payment
        const leasingAmount = totalAmount - defaultDownPayment;
        
        setLeasingData(prev => ({
          ...prev,
          downPayment: defaultDownPayment,
          leasingAmount: leasingAmount,
          monthlyInstallment: Math.round(leasingAmount * (1 + prev.interestRate/100) / prev.tenure)
        }));
      }
    }
  };

  const handlePaymentModeChange = (mode: 'cash' | 'bank_transfer' | 'leasing') => {
    setPaymentMode(mode);
    
    if (mode === 'leasing' && selectedVehicle) {
      const vehicle = inventoryItems.find(v => v.id === selectedVehicle);
      if (vehicle) {
        const totalAmount = getTotalAmount();
        const defaultDownPayment = Math.round(totalAmount * 0.2); // 20% down payment
        const leasingAmount = totalAmount - defaultDownPayment;
        
        setLeasingData(prev => ({
          ...prev,
          downPayment: defaultDownPayment,
          leasingAmount: leasingAmount,
          monthlyInstallment: Math.round(leasingAmount * (1 + prev.interestRate/100) / prev.tenure)
        }));
      }
    }
  };

  const calculateLeasingInstallment = () => {
    if (leasingData.leasingAmount > 0 && leasingData.tenure > 0 && leasingData.interestRate > 0) {
      const monthlyRate = leasingData.interestRate / 100 / 12;
      const installment = leasingData.leasingAmount * monthlyRate * Math.pow(1 + monthlyRate, leasingData.tenure) / (Math.pow(1 + monthlyRate, leasingData.tenure) - 1);
      return Math.round(installment);
    }
    return 0;
  };

  const handleLeasingDataChange = (field: string, value: number | string) => {
    console.log('handleLeasingDataChange called:', field, value);
    setLeasingData(prev => {
      let processedValue: any = value;
      
      // Keep strings as strings for certain fields
      if (field === 'leaseReferenceNo' || field === 'leasingCompanyId') {
        processedValue = value;
      } else {
        processedValue = Number(value);
      }
      
      const updated = { ...prev, [field]: processedValue };
      
      // Recalculate installment when relevant fields change
      if (['leasingAmount', 'tenure', 'interestRate'].includes(field)) {
        updated.monthlyInstallment = calculateLeasingInstallment();
      }
      
      // Recalculate leasing amount when down payment changes
      if (field === 'downPayment') {
        updated.leasingAmount = getTotalAmount() - Number(value);
        updated.monthlyInstallment = calculateLeasingInstallment();
      }
      
      console.log('Updated leasingData:', updated);
      return updated;
    });
  };

  const addNewLeasingCompany = () => {
    if (newLeasingCompany.name.trim()) {
      const newCompany: LeasingCompany = {
        id: `LEASE${String(leasingCompanies.length + 1).padStart(3, '0')}`,
        name: newLeasingCompany.name.trim(),
        branch: newLeasingCompany.branch || undefined,
        contactPerson: newLeasingCompany.contactPerson || undefined,
        phone: newLeasingCompany.phone || undefined,
        email: newLeasingCompany.email || undefined,
        address: newLeasingCompany.address || undefined
      };
      
      // Add to the parent component's leasing companies list
      onAddLeasingCompany(newCompany);
      
      // Select the newly created company
      setLeasingData(prev => ({ ...prev, leasingCompanyId: newCompany.id }));
      
      // Reset form and close
      setNewLeasingCompany({
        name: '',
        branch: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: ''
      });
      setShowAddLeasingCompany(false);
      
      alert(`✅ "${newCompany.name}" has been added successfully and is now available for all future transactions!`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !customerData.name || !customerData.contact) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (paymentMode === 'leasing') {
      if (!leasingData.leasingCompanyId || !leasingData.leaseReferenceNo || leasingData.downPayment <= 0) {
        alert('Please fill in all leasing details');
        return;
      }
    }
    
    onSubmit(selectedVehicle, customerData, pricingData, paymentMode, paymentMode === 'leasing' ? leasingData : undefined);
  };

  const getTotalAmount = () => {
    return (parseFloat(pricingData.vehiclePrice as any) || 0) + 
           (parseFloat(pricingData.taxes as any) || 0) + 
           (parseFloat(pricingData.fees as any) || 0) - 
           (parseFloat(pricingData.discount as any) || 0);
  };

  return (
    <div className="vehicle-order-form-overlay">
      <div className="vehicle-order-form">
        <div className="form-header">
          <h2>💰 New Transaction</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* Vehicle Selection */}
            <div className="form-section">
              <h3>🚗 Select Vehicle</h3>
              <div className="form-group">
                <label className="form-label">Available Vehicles *</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => handleVehicleSelect(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select a vehicle...</option>
                  {inventoryItems.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} ({vehicle.year}) - {vehicle.color} - {new Intl.NumberFormat('en-US', {style: 'currency', currency: vehicle.currency}).format(vehicle.sellingPrice || vehicle.marketValue)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Information */}
            <div className="form-section">
              <h3>👤 Customer Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                    required
                    placeholder="Full name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="text"
                    value={customerData.contact}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, contact: e.target.value }))}
                    className="form-input"
                    required
                    placeholder="+971-50-123-4567"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    className="form-input"
                    placeholder="customer@email.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    value={customerData.address}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                    className="form-input"
                    placeholder="Customer address"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ID Number</label>
                  <input
                    type="text"
                    value={customerData.idNumber}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, idNumber: e.target.value }))}
                    className="form-input"
                    placeholder="Emirates ID / Passport"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="form-section">
              <h3>💵 Pricing Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vehicle Price *</label>
                  <input
                    type="number"
                    value={pricingData.vehiclePrice}
                    onChange={(e) => setPricingData(prev => ({ ...prev, vehiclePrice: parseFloat(e.target.value) || 0 }))}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    required
                    min="0"
                    step="any"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Taxes</label>
                  <input
                    type="number"
                    value={pricingData.taxes}
                    onChange={(e) => setPricingData(prev => ({ ...prev, taxes: parseFloat(e.target.value) || 0 }))}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    min="0"
                    step="any"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Processing Fees</label>
                  <input
                    type="number"
                    value={pricingData.fees}
                    onChange={(e) => setPricingData(prev => ({ ...prev, fees: parseFloat(e.target.value) || 0 }))}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    min="0"
                    step="any"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount</label>
                  <input
                    type="number"
                    value={pricingData.discount}
                    onChange={(e) => setPricingData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    min="0"
                    step="any"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h3>💳 Payment Method</h3>
              <div className="form-group">
                <label className="form-label">Payment Method *</label>
                <select
                  value={paymentMode}
                  onChange={(e) => handlePaymentModeChange(e.target.value as 'cash' | 'bank_transfer' | 'leasing')}
                  className="form-input"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="leasing">Leasing</option>
                </select>
              </div>
            </div>

            {/* Leasing Details - Show only when Leasing is selected */}
            {paymentMode === 'leasing' && (
              <div className="form-section">
                <h3>🏦 Leasing Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Leasing Company *</label>
                    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'end'}}>
                      <div style={{flex: 1}}>
                        <select
                          value={leasingData.leasingCompanyId}
                          onChange={(e) => handleLeasingDataChange('leasingCompanyId', e.target.value)}
                          className="form-input"
                          required
                        >
                          <option value="">Select Leasing Company...</option>
                          {leasingCompanies.length > 0 ? leasingCompanies.map(company => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          )) : (
                            <option value="" disabled>No leasing companies available</option>
                          )}
                        </select>
                        {/* Debug info */}
                        <small style={{color: '#666', fontSize: '12px', display: 'block', marginTop: '4px'}}>
                          Available companies: {leasingCompanies.length}
                        </small>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddLeasingCompany(!showAddLeasingCompany)}
                        className="btn btn-secondary"
                        style={{height: 'fit-content', marginBottom: '0.5rem'}}
                      >
                        ➕ Add Company
                      </button>
                    </div>
                    
                    {/* Add New Leasing Company */}
                    {showAddLeasingCompany && (
                      <div className="add-leasing-company-section" style={{
                        marginTop: '0.75rem',
                        padding: '1rem',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div className="form-grid">
                          <div className="form-group" style={{marginBottom: '0.5rem'}}>
                            <label className="form-label">Company Name *</label>
                            <input
                              type="text"
                              value={newLeasingCompany.name}
                              onChange={(e) => setNewLeasingCompany(prev => ({ ...prev, name: e.target.value }))}
                              className="form-input"
                              placeholder="e.g., Hatton National Bank (HNB)"
                            />
                          </div>
                          <div className="form-group" style={{marginBottom: '0.5rem'}}>
                            <label className="form-label">Branch</label>
                            <input
                              type="text"
                              value={newLeasingCompany.branch}
                              onChange={(e) => setNewLeasingCompany(prev => ({ ...prev, branch: e.target.value }))}
                              className="form-input"
                              placeholder="e.g., Kalawanchikudy"
                            />
                          </div>
                          <div className="form-group" style={{marginBottom: '0.5rem'}}>
                            <label className="form-label">Contact Person</label>
                            <input
                              type="text"
                              value={newLeasingCompany.contactPerson}
                              onChange={(e) => setNewLeasingCompany(prev => ({ ...prev, contactPerson: e.target.value }))}
                              className="form-input"
                              placeholder="Contact person name"
                            />
                          </div>
                          <div className="form-group" style={{marginBottom: '0.5rem'}}>
                            <label className="form-label">Phone</label>
                            <input
                              type="text"
                              value={newLeasingCompany.phone}
                              onChange={(e) => setNewLeasingCompany(prev => ({ ...prev, phone: e.target.value }))}
                              className="form-input"
                              placeholder="+94-11-xxx-xxxx"
                            />
                          </div>
                          <div className="form-group" style={{marginBottom: '0.5rem'}}>
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              value={newLeasingCompany.email}
                              onChange={(e) => setNewLeasingCompany(prev => ({ ...prev, email: e.target.value }))}
                              className="form-input"
                              placeholder="info@company.com"
                            />
                          </div>
                          <div className="form-group" style={{marginBottom: '0.5rem'}}>
                            <label className="form-label">Address</label>
                            <input
                              type="text"
                              value={newLeasingCompany.address}
                              onChange={(e) => setNewLeasingCompany(prev => ({ ...prev, address: e.target.value }))}
                              className="form-input"
                              placeholder="Company address"
                            />
                          </div>
                        </div>
                        
                        <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                          <button
                            type="button"
                            onClick={addNewLeasingCompany}
                            className="btn btn-primary"
                            disabled={!newLeasingCompany.name.trim()}
                          >
                            ✅ Add Company
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddLeasingCompany(false);
                              setNewLeasingCompany({
                                name: '',
                                branch: '',
                                contactPerson: '',
                                phone: '',
                                email: '',
                                address: ''
                              });
                            }}
                            className="btn btn-secondary"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lease Reference No *</label>
                    <input
                      type="text"
                      value={leasingData.leaseReferenceNo}
                      onChange={(e) => handleLeasingDataChange('leaseReferenceNo', e.target.value)}
                      className="form-input"
                      placeholder="e.g., PLP-2024-001"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Down Payment (Customer Pays) *</label>
                    <input
                      type="number"
                      value={leasingData.downPayment}
                      onChange={(e) => handleLeasingDataChange('downPayment', parseFloat(e.target.value) || 0)}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="form-input"
                      min="0"
                      step="any"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Leasing Amount (Company Pays)</label>
                    <input
                      type="number"
                      value={leasingData.leasingAmount}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="form-input"
                      readOnly
                      style={{backgroundColor: '#f8f9fa'}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tenure (Months)</label>
                    <input
                      type="number"
                      value={leasingData.tenure}
                      onChange={(e) => handleLeasingDataChange('tenure', parseFloat(e.target.value) || 48)}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="form-input"
                      min="12"
                      max="84"
                      placeholder="48"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Interest Rate (%)</label>
                    <input
                      type="number"
                      value={leasingData.interestRate}
                      onChange={(e) => handleLeasingDataChange('interestRate', parseFloat(e.target.value) || 12.5)}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="form-input"
                      min="1"
                      max="30"
                      step="any"
                      placeholder="12.5"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly Installment (Customer → Company)</label>
                    <input
                      type="number"
                      value={leasingData.monthlyInstallment}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="form-input"
                      readOnly
                      style={{backgroundColor: '#f8f9fa'}}
                    />
                  </div>
                </div>

                {/* Leasing Summary */}
                <div style={{marginTop: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #2196f3'}}>
                  <h4 style={{color: '#1976d2', marginBottom: '0.5rem'}}>💡 Leasing Summary</h4>
                  <div style={{fontSize: '0.9em', color: '#424242'}}>
                    <p><strong>Shop Receives:</strong> ${(leasingData.downPayment + leasingData.leasingAmount).toLocaleString()} (Down Payment + Leasing Amount)</p>
                    <p><strong>Customer Pays Shop:</strong> ${leasingData.downPayment.toLocaleString()} (Today)</p>
                    <p><strong>Leasing Company Pays Shop:</strong> ${leasingData.leasingAmount.toLocaleString()}</p>
                    <p><strong>Customer Pays Leasing Company:</strong> ${leasingData.monthlyInstallment.toLocaleString()}/month for {leasingData.tenure} months</p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="form-section">
              <div className="cost-summary">
                <h3>💹 Transaction Summary</h3>
                <div className="cost-breakdown">
                  <div className="cost-item">
                    <span>Vehicle Price:</span>
                    <span>{selectedCurrency} {(parseFloat(pricingData.vehiclePrice as any) || 0).toFixed(2)}</span>
                  </div>
                  <div className="cost-item">
                    <span>Taxes:</span>
                    <span>{selectedCurrency} {(parseFloat(pricingData.taxes as any) || 0).toFixed(2)}</span>
                  </div>
                  <div className="cost-item">
                    <span>Processing Fees:</span>
                    <span>{selectedCurrency} {(parseFloat(pricingData.fees as any) || 0).toFixed(2)}</span>
                  </div>
                  <div className="cost-item">
                    <span>Discount:</span>
                    <span>-{selectedCurrency} {(parseFloat(pricingData.discount as any) || 0).toFixed(2)}</span>
                  </div>
                  <div className="cost-item total">
                    <span><strong>Total Amount:</strong></span>
                    <span><strong>{selectedCurrency} {getTotalAmount().toFixed(2)}</strong></span>
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
              💰 Create Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Payment Form Component
interface PaymentFormProps {
  transaction: Transaction;
  onSubmit: (paymentData: {
    amount: number;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check' | 'finance';
    receivedBy: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ transaction, onSubmit, onCancel }) => {
  const [paymentData, setPaymentData] = useState({
    amount: transaction.balanceRemaining,
    paymentMethod: 'cash' as const,
    receivedBy: 'Sales Manager',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentData.amount <= 0 || paymentData.amount > transaction.balanceRemaining) {
      alert(`Payment amount must be between $0.01 and $${(transaction.balanceRemaining || 0).toFixed(2)}`);
      return;
    }
    onSubmit(paymentData);
  };

  return (
    <div className="vehicle-order-form-overlay">
      <div className="vehicle-order-form payment-modal">
        <div className="form-header">
          <h2>💳 Process Payment - {transaction.id}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <div className="payment-summary">
          <h3>Transaction Details</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span>Vehicle:</span>
              <span>{transaction.vehicleDetails.brand} {transaction.vehicleDetails.model}</span>
            </div>
            <div className="summary-item">
              <span>Total Amount:</span>
              <span>{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(transaction.pricing.totalAmount)}</span>
            </div>
            <div className="summary-item">
              <span>Already Paid:</span>
              <span>{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(transaction.totalPaid)}</span>
            </div>
            <div className="summary-item">
              <span><strong>Balance Remaining:</strong></span>
              <span className="balance-highlight"><strong>{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(transaction.balanceRemaining)}</strong></span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            <div className="form-section">
              <h3>💰 Payment Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Payment Amount *</label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="form-input"
                    required
                    min="0.01"
                    max={transaction.balanceRemaining}
                    step="any"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="form-input"
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Received By *</label>
                  <input
                    type="text"
                    value={paymentData.receivedBy}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, receivedBy: e.target.value }))}
                    className="form-input"
                    required
                    placeholder="Staff member name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                    className="form-input"
                    rows={3}
                    placeholder="Additional payment notes..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              💳 Process Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Transaction Details Modal Component
interface TransactionDetailsModalProps {
  transaction: Transaction;
  customer: Customer | undefined;
  onClose: () => void;
  onAddPayment: () => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ transaction, customer, onClose, onAddPayment }) => {
  return (
    <div className="vehicle-order-form-overlay">
      <div className="vehicle-order-form order-details-modal">
        <div className="form-header">
          <h2>Transaction Details - {transaction.id}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="order-details-content">
          <div className="detail-sections">
            {/* Transaction Information */}
            <div className="detail-section">
              <h3>Transaction Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Transaction ID:</label>
                  <span>{transaction.id}</span>
                </div>
                <div className="detail-item">
                  <label>Type:</label>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span className={`badge ${transaction.type === 'reservation' ? 'badge-warning' : 'badge-success'}`}>
                      {transaction.type === 'sale' ? 'COMPLETED' : transaction.type.toUpperCase()}
                    </span>
                    {transaction.type === 'sale' && transaction.status === 'completed' && (
                      <span style={{fontSize: '0.8em', color: '#28a745'}} title="Auto-upgraded from RESERVATION">
                        ✨ Auto-upgraded
                      </span>
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`badge ${transaction.status === 'completed' ? 'badge-success' : 'badge-info'}`}>
                    {transaction.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Invoice Number:</label>
                  <span>{transaction.invoiceNumber || 'Not generated'}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="detail-section">
              <h3>Customer Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{customer?.name || 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <label>Contact:</label>
                  <span>{customer?.contact || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{customer?.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Address:</label>
                  <span>{customer?.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="detail-section">
              <h3>Vehicle Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Brand & Model:</label>
                  <span>{transaction.vehicleDetails.brand} {transaction.vehicleDetails.model}</span>
                </div>
                <div className="detail-item">
                  <label>Year:</label>
                  <span>{transaction.vehicleDetails.year}</span>
                </div>
                <div className="detail-item">
                  <label>Color:</label>
                  <span>{transaction.vehicleDetails.color}</span>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="detail-section">
              <h3>Financial Information</h3>
              <div className="expense-breakdown">
                <div className="expense-item">
                  <span>Vehicle Price:</span>
                  <span>{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(transaction.pricing.vehiclePrice)}</span>
                </div>
                <div className="expense-item">
                  <span>Taxes:</span>
                  <span>{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(transaction.pricing.taxes)}</span>
                </div>
                <div className="expense-item">
                  <span>Fees:</span>
                  <span>{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(transaction.pricing.fees)}</span>
                </div>
                <div className="expense-item">
                  <span>Discount:</span>
                  <span>-{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(transaction.pricing.discount)}</span>
                </div>
                <div className="expense-item total-cost">
                  <span><strong>Total Amount:</strong></span>
                  <span><strong>{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(transaction.pricing.totalAmount)}</strong></span>
                </div>
                <div className="expense-item">
                  <span><strong>Amount Paid:</strong></span>
                  <span className="profit-amount">
                    <strong>{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(transaction.totalPaid)}</strong>
                  </span>
                </div>
                <div className="expense-item">
                  <span><strong>Balance Remaining:</strong></span>
                  <span className={`balance-amount ${transaction.balanceRemaining <= 0 ? 'paid-full' : 'pending-balance'}`}>
                    <strong>{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(transaction.balanceRemaining)}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {transaction.payments && transaction.payments.length > 0 && (
              <div className="detail-section">
                <h3>Payment History</h3>
                <div className="payments-list">
                  {transaction.payments.map(payment => (
                    <div key={payment.id} className="payment-record">
                      <div className="payment-header">
                        <span className="payment-amount">{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(payment.amount)}</span>
                        <span className="payment-date">{payment.paymentDate}</span>
                      </div>
                      <div className="payment-details">
                        <span>Method: {payment.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                        <span>Received by: {payment.receivedBy}</span>
                      </div>
                      {payment.notes && (
                        <div className="payment-notes">{payment.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="detail-actions">
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Close
            </button>
            {transaction.balanceRemaining > 0 && (
              <button 
                className="btn btn-success" 
                onClick={onAddPayment}
              >
                💳 Add Payment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Transaction Selector Modal Component
interface TransactionSelectorModalProps {
  transactions: Transaction[];
  customers: Customer[];
  onSelectTransaction: (transaction: Transaction) => void;
  onCancel: () => void;
}

const TransactionSelectorModal: React.FC<TransactionSelectorModalProps> = ({ 
  transactions, 
  customers, 
  onSelectTransaction, 
  onCancel 
}) => {
  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown Customer';
  };

  return (
    <div className="vehicle-order-form-overlay">
      <div className="vehicle-order-form" style={{maxWidth: '800px'}}>
        <div className="form-header">
          <h2>💳 Select Transaction for Payment</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <div className="form-sections">
          <div className="form-section">
            <h3>Pending Transactions</h3>
            <p style={{color: '#666', marginBottom: '1rem'}}>
              Select a transaction to process payment:
            </p>
            
            <div className="transaction-list">
              {transactions.map(transaction => (
                <div 
                  key={transaction.id} 
                  className="transaction-item"
                  onClick={() => onSelectTransaction(transaction)}
                  style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#007bff';
                    e.currentTarget.style.background = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#dee2e6';
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  <div className="transaction-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <div>
                      <strong>{transaction.id}</strong>
                      <span style={{marginLeft: '0.5rem', color: '#666'}}>
                        - {getCustomerName(transaction.customerId)}
                      </span>
                    </div>
                    <span className={`badge ${transaction.type === 'reservation' ? 'badge-warning' : 'badge-success'}`}>
                      {transaction.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{marginBottom: '0.5rem', color: '#666'}}>
                    <strong>{transaction.vehicleDetails.brand} {transaction.vehicleDetails.model}</strong> 
                    ({transaction.vehicleDetails.year}) - {transaction.vehicleDetails.color}
                  </div>
                  
                  <div className="transaction-amounts" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9em'
                  }}>
                    <span>
                      Total: <strong>{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(transaction.pricing.totalAmount)}</strong>
                    </span>
                    <span style={{color: '#28a745'}}>
                      Paid: <strong>{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(transaction.totalPaid)}</strong>
                    </span>
                    <span style={{color: '#dc3545'}}>
                      Balance: <strong>{new Intl.NumberFormat('en-US', {style: 'currency', currency: transaction.currency}).format(transaction.balanceRemaining)}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Invoice Modal Component
interface InvoiceModalProps {
  transaction: Transaction;
  customers: Customer[];
  inventoryItems: InventoryItem[];
  invoiceType: 'customer' | 'bank';
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ transaction, customers, inventoryItems, invoiceType, onClose }) => {
  // Handle both string and object customerIds, and match against both id and _id
  const customerId = typeof transaction.customerId === 'object' ? (transaction.customerId as any)?._id : transaction.customerId;
  
  const customer = customers.find(c => 
    c.id === transaction.customerId || 
    c._id === transaction.customerId ||
    c.id === customerId ||
    c._id === customerId
  );
  
  const vehicle = inventoryItems.find(i => i.id === transaction.inventoryId);
  
  console.log('InvoiceModal - Finding customer:', {
    transactionCustomerId: transaction.customerId,
    extractedCustomerId: customerId,
    foundCustomer: customer ? { id: customer.id, name: customer.name } : null,
    availableCustomers: customers.map(c => ({ id: c.id, _id: c._id, name: c.name }))
  });
  
  // Use the passed invoiceType instead of auto-detecting
  const isLeasing = invoiceType === 'bank';
  
  // Prepare invoice data
  const invoiceData = {
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
    // Bank Info (for leasing only) - Use leasing details if available
    bankName: transaction.leasingDetails?.leasingCompanyName || 'Hatton National Bank (HNB)',
    bankBranch: transaction.leasingDetails?.leasingCompanyBranch || 'Kalawanchikudy',
    // Vehicle Details
    vehicleRegisteredNo: vehicle?.licensePlate || transaction.vehicleDetails.registrationNo || '',
    make: transaction.vehicleDetails.brand,
    model: transaction.vehicleDetails.model,
    yearOfManufacture: transaction.vehicleDetails.year,
    chassisNo: vehicle?.vin || vehicle?.registrationNo || 'N/A',
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
    paymentMethod: transaction.status === 'fully_paid' || transaction.status === 'completed' 
      ? 'FULL PAYMENT' 
      : transaction.type === 'reservation' 
        ? 'RESERVATION - PARTIAL PAYMENT'
        : transaction.type === 'leasing'
          ? 'LEASING'
          : 'PARTIAL PAYMENT',
    paymentStatus: transaction.status === 'fully_paid' || transaction.status === 'completed'
      ? 'FULLY PAID'
      : 'PARTIAL PAYMENT',
    currency: transaction.currency || 'LKR',
    // Seller Info
    sellerName: 'Modern Car Sale',
    sellerContact: '067 22 29 174',
    sellerNIC: '198716101572',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="vehicle-order-form-overlay">
      <div className="vehicle-order-form" style={{maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto'}}>
        <div className="form-header">
          <h2>📄 {isLeasing ? 'Bank/Leasing Invoice' : 'Customer Invoice'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="preview-actions no-print" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          padding: '20px',
          borderBottom: '2px solid #e0e0e0',
          marginBottom: '20px'
        }}>
          <button 
            className="btn btn-success"
            onClick={handlePrint}
          >
            🖨️ Print Invoice
          </button>
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="invoice-preview-wrapper" style={{padding: '0 20px 20px'}}>
          {isLeasing ? (
            <BankInvoice invoiceData={invoiceData} />
          ) : (
            <CustomerInvoice invoiceData={invoiceData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
