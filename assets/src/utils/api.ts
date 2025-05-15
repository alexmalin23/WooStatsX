// Types
export type DateRange = {
  from: string;
  to: string;
};

export type StatsData = {
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  date_range: DateRange;
};

export type Product = {
  name: string;
  quantity: number;
  total: number;
};

export type RevenueTrend = {
  period: string;
  total: number;
};

export type Customer = {
  email: string;
  name: string;
  order_count: number;
  total_spent: number;
};

export type SalesDay = {
  date: string;
  order_count: number;
  total: number;
};

export type Refund = {
  date: string;
  refund_count: number;
  total: number;
};

export type RefundsData = {
  total_refund_amount: number;
  refund_count: number;
  refunds: Refund[];
};

export type Coupon = {
  code: string;
  usage_count: number;
  discount_amount: number;
};

// API Fetch Functions
const API_BASE = window.wooStatsx?.apiUrl || '/wp-json/woostatsx/v1';

/**
 * Fetch options with WP nonce
 */
const fetchOptions = {
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
    'X-WP-Nonce': window.wooStatsx?.nonce || '',
  },
};

/**
 * Build URL with query params
 */
function buildUrl(endpoint: string, params: Record<string, string | number | boolean> = {}): string {
  const url = new URL(`${API_BASE}/${endpoint}`, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
}

/**
 * Generic fetch function
 */
async function fetchApi<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
  const url = buildUrl(endpoint, params);
  console.log(`Fetching from ${url}`);
  
  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      throw new Error(`API Error: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Response from ${endpoint}:`, data);
    return data as T;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Validate connection to REST API
 */
export async function testApiConnection(): Promise<boolean> {
  try {
    const url = `${window.location.origin}/wp-json/`;
    const response = await fetch(url, { 
      method: 'GET',
      credentials: 'include' 
    });
    
    if (!response.ok) {
      console.error('WordPress REST API not available');
      return false;
    }
    
    console.log('WordPress REST API is available');
    return true;
  } catch (error) {
    console.error('Error connecting to WordPress REST API:', error);
    return false;
  }
}

/**
 * API Functions
 */
export async function fetchStats(dateRange: DateRange): Promise<StatsData> {
  return fetchApi<StatsData>('stats', dateRange);
}

export async function fetchTopProducts(dateRange: DateRange, limit = 10): Promise<Product[]> {
  return fetchApi<Product[]>('products', { ...dateRange, limit });
}

export async function fetchRevenueTrend(dateRange: DateRange, interval = 'day'): Promise<RevenueTrend[]> {
  return fetchApi<RevenueTrend[]>('revenue-trend', { ...dateRange, interval });
}

export async function fetchTopCustomers(dateRange: DateRange, limit = 10): Promise<Customer[]> {
  return fetchApi<Customer[]>('customers', { ...dateRange, limit });
}

export async function fetchBestSalesDays(dateRange: DateRange, limit = 10): Promise<SalesDay[]> {
  return fetchApi<SalesDay[]>('sales-days', { ...dateRange, limit });
}

export async function fetchRefunds(dateRange: DateRange): Promise<RefundsData> {
  return fetchApi<RefundsData>('refunds', dateRange);
}

export async function fetchCoupons(dateRange: DateRange): Promise<Coupon[]> {
  return fetchApi<Coupon[]>('coupons', dateRange);
}

export async function refreshCache(): Promise<{ success: boolean; message: string }> {
  const url = `${API_BASE}/refresh`;
  console.log(`Refreshing cache at ${url}`);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Refresh cache error (${response.status}): ${errorText}`);
      throw new Error(`Failed to refresh cache: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Cache refresh response:', data);
    return data;
  } catch (error) {
    console.error('Error refreshing cache:', error);
    throw error;
  }
} 