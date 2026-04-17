/**
 * 本地存储工具 - 支持localStorage持久化
 */

const STORAGE_PREFIX = 'erp_';

export function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (!stored) return defaultValue;
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage setItem failed:', e);
  }
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_PREFIX + key);
}

export function clearAll(): void {
  if (typeof window === 'undefined') return;
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.error('localStorage clearAll failed:', e);
  }
}

// Storage keys
export const STORAGE_KEYS = {
  customers: 'customers',
  vendors: 'vendors',
  materials: 'materials',
  products: 'products',
  processes: 'processes',
  workstations: 'workstations',
  salesOrders: 'sales_orders',
  purchaseOrders: 'purchase_orders',
  inventory: 'inventory',
  processingOrders: 'processing_orders',
  lastSync: 'last_sync',
  warehouses: 'warehouses',
  employees: 'employees',
  users: 'users',
  salesInvoices: 'sales_invoices',
  purchaseInvoices: 'purchase_invoices',
  bills: 'bills',
  paymentReceipts: 'payment_receipts',
  paymentMades: 'payment_mades',
  scrapOrders: 'scrap_orders',
  workOrders: 'work_orders',
  jobReports: 'job_reports',
  currentUser: 'current_user',
  currentUserToken: 'current_user_token',
  salesOrderItems: 'sales_order_items',
  deliveryOrders: 'delivery_orders',
  deliveryOrderItems: 'delivery_order_items',
  purchaseOrderItems: 'purchase_order_items',
  receivingOrders: 'receiving_orders',
  receivingOrderItems: 'receiving_order_items',
  cuttingDies: 'cutting_dies',
  artworks: 'artworks',
} as const;
