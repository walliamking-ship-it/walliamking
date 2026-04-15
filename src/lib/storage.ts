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
} as const;
