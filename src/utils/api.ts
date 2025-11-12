// API configuration and utilities
const API_BASE_URL = 'http://localhost:5000/api'; // Changed to local backend for testing

// Helper to get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper to set auth token
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Helper to remove auth token
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
  localStorage.removeItem('isLoggedIn');
};

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    console.log(`API Call: ${options.method || 'GET'} ${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle non-JSON responses or errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `HTTP error! status: ${response.status}` 
      }));
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        errorData
      });
      const error: any = new Error(errorData.message || errorData.error || 'API request failed');
      error.status = response.status;
      error.data = errorData;
      error.endpoint = endpoint;
      throw error;
    }

    const data = await response.json();
    console.log(`API Success: ${endpoint}`, data);
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await apiCall<{ token: string; user: { id: string; username: string } }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );
    
    // Save token and user info
    if (response.token) {
      setAuthToken(response.token);
      localStorage.setItem('username', response.user.username);
      localStorage.setItem('userId', response.user.id);
      localStorage.setItem('isLoggedIn', 'true');
    }
    
    return response;
  },

  register: async (username: string, password: string) => {
    return await apiCall<{ message: string; user: { id: string; username: string } }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );
  },

  logout: () => {
    removeAuthToken();
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return await apiCall<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  adminResetPassword: async (userId: string, newPassword: string) => {
    return await apiCall<{ message: string }>('/auth/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify({ userId, newPassword }),
    });
  },

  getAllUsers: async () => {
    return await apiCall<{ users: Array<{ _id: string; username: string; role: string }> }>('/auth/users');
  },
};

// Expense API
export interface Expense {
  _id?: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  currency: 'USD' | 'LKR' | 'EUR' | 'JPY' | string;
  paymentMethod?: string;
  notes?: string;
  createdBy?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export const expenseAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ExpenseListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    return await apiCall<ExpenseListResponse>(
      `/expenses${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: async (id: string): Promise<{ expense: Expense }> => {
    return await apiCall<{ expense: Expense }>(`/expenses/${id}`);
  },

  create: async (expense: Omit<Expense, '_id'>): Promise<{ message: string; expense: Expense }> => {
    return await apiCall<{ message: string; expense: Expense }>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  },

  update: async (id: string, expense: Partial<Expense>): Promise<{ message: string; expense: Expense }> => {
    return await apiCall<{ message: string; expense: Expense }>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return await apiCall<{ message: string }>(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    summary: {
      totalAmount: number;
      averageAmount: number;
      count: number;
      categories: string[];
    };
    categoryBreakdown: Array<{
      _id: string;
      total: number;
      count: number;
    }>;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    return await apiCall(
      `/expenses/stats/summary${queryString ? `?${queryString}` : ''}`
    );
  },
};

// Vehicle Order API
export interface VehicleOrder {
  _id?: string;
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
    engineNo?: string;
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
  movedToInventory?: boolean;
  inventoryItemId?: string;
  movedToInventoryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleOrderListResponse {
  orders: VehicleOrder[];
  totalPages: number;
  currentPage: number;
  total: number;
}

// Vehicle Order API endpoints
export const vehicleOrderAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    orderType?: 'customer' | 'import'; // Filter by order type
  }): Promise<VehicleOrderListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.orderType) queryParams.append('orderType', params.orderType);

    const queryString = queryParams.toString();
    return await apiCall<VehicleOrderListResponse>(
      `/vehicle-orders${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: async (id: string): Promise<{ order: VehicleOrder }> => {
    return await apiCall<{ order: VehicleOrder }>(`/vehicle-orders/${id}`);
  },

  create: async (order: Omit<VehicleOrder, '_id'>): Promise<{ message: string; order: VehicleOrder }> => {
    return await apiCall<{ message: string; order: VehicleOrder }>('/vehicle-orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  update: async (id: string, order: Partial<VehicleOrder>): Promise<{ message: string; order: VehicleOrder }> => {
    return await apiCall<{ message: string; order: VehicleOrder }>(`/vehicle-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return await apiCall<{ message: string }>(`/vehicle-orders/${id}`, {
      method: 'DELETE',
    });
  },

  moveToInventory: async (id: string): Promise<{ message: string; order: VehicleOrder; inventoryItem: InventoryItem }> => {
    return await apiCall<{ message: string; order: VehicleOrder; inventoryItem: InventoryItem }>(
      `/vehicle-orders/${id}/move-to-inventory`,
      {
        method: 'POST',
      }
    );
  },
};

// Customer API
export interface Customer {
  _id?: string;
  name: string;
  title?: 'Mr.' | 'Mrs.' | 'Ms.' | 'Miss' | 'Dr.';
  contact: string;
  email?: string;
  address?: string;
  nic?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerListResponse {
  customers: Customer[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export const customerAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<CustomerListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    return await apiCall<CustomerListResponse>(
      `/customers${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: async (id: string): Promise<{ customer: Customer }> => {
    return await apiCall<{ customer: Customer }>(`/customers/${id}`);
  },

  create: async (customer: Omit<Customer, '_id'>): Promise<{ message: string; customer: Customer }> => {
    return await apiCall<{ message: string; customer: Customer }>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  },

  update: async (id: string, customer: Partial<Customer>): Promise<{ message: string; customer: Customer }> => {
    return await apiCall<{ message: string; customer: Customer }>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return await apiCall<{ message: string }>(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Inventory API
export interface InventoryItem {
  _id?: string;
  model: string;
  brand: string;
  year: number;
  color: string;
  vin?: string; // Chassis Number
  chassisNo?: string; // Alternative Chassis Number field
  engineNo?: string; // Engine Number
  licensePlate?: string;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  engineSize?: string;
  transmission?: string;
  mileage?: number;
  purchasePrice: number;
  sellingPrice?: number;
  currency: string;
  status: 'available' | 'reserved' | 'sold';
  location?: string;
  notes?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryListResponse {
  items: InventoryItem[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export const inventoryAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    brand?: string;
  }): Promise<InventoryListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.brand) queryParams.append('brand', params.brand);

    const queryString = queryParams.toString();
    return await apiCall<InventoryListResponse>(
      `/inventory${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: async (id: string): Promise<{ item: InventoryItem }> => {
    return await apiCall<{ item: InventoryItem }>(`/inventory/${id}`);
  },

  create: async (item: Omit<InventoryItem, '_id'>): Promise<{ message: string; item: InventoryItem }> => {
    return await apiCall<{ message: string; item: InventoryItem }>('/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  update: async (id: string, item: Partial<InventoryItem>): Promise<{ message: string; item: InventoryItem }> => {
    return await apiCall<{ message: string; item: InventoryItem }>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return await apiCall<{ message: string }>(`/inventory/${id}`, {
      method: 'DELETE',
    });
  },
};

// Transaction API
export interface Transaction {
  _id?: string;
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
  payments?: {
    date: string;
    amount: number;
    method: string;
    reference?: string;
  }[];
  notes?: string;
  paymentMode?: 'cash' | 'bank_transfer' | 'leasing';
  isLeasing?: boolean;
  leasingDetails?: {
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
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export const transactionAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<TransactionListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    return await apiCall<TransactionListResponse>(
      `/transactions${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: async (id: string): Promise<{ transaction: Transaction }> => {
    return await apiCall<{ transaction: Transaction }>(`/transactions/${id}`);
  },

  create: async (transaction: Omit<Transaction, '_id'>): Promise<{ message: string; transaction: Transaction }> => {
    return await apiCall<{ message: string; transaction: Transaction }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },

  update: async (id: string, transaction: Partial<Transaction>): Promise<{ message: string; transaction: Transaction }> => {
    return await apiCall<{ message: string; transaction: Transaction }>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return await apiCall<{ message: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  auth: authAPI,
  expenses: expenseAPI,
  vehicleOrders: vehicleOrderAPI,
  customers: customerAPI,
  inventory: inventoryAPI,
  transactions: transactionAPI,
};

