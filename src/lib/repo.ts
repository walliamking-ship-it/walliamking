/**
 * 数据仓储层 - 支持模拟数据模式
 * USE_MOCK_DATA=true 时使用本地模拟数据，否则连接飞书Bitable
 */

import { Customer, Vendor, Material, Product, Process, Workstation, SalesOrder, PurchaseOrder, Inventory, ProcessingOrder } from './types';
import { DataService, TABLE_IDS } from './api';
import {
  mockCustomers, mockVendors, mockMaterials, mockProducts, mockProcesses, mockWorkstations,
  mockSalesOrders, mockPurchaseOrders, mockInventory, mockProcessingOrders, USE_MOCK_DATA
} from './mock-data';

// ========== 客户 ==========
export const CustomerRepo = {
  async findAll(): Promise<Customer[]> {
    if (USE_MOCK_DATA) return [...mockCustomers];
    return await DataService.list(TABLE_IDS.customers) as Customer[];
  },
  async findById(id: string): Promise<Customer | undefined> {
    const all = await this.findAll();
    return all.find(c => c.id === id);
  },
  async create(data: Omit<Customer, 'id'>): Promise<Customer> {
    if (USE_MOCK_DATA) {
      const newItem = { ...data, id: String(Date.now()) } as Customer;
      mockCustomers.push(newItem);
      return newItem;
    }
    const all = await this.findAll();
    if (all.find(c => c.code === data.code)) throw new Error(`客户编号 "${data.code}" 已存在`);
    await DataService.create(TABLE_IDS.customers, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<Customer>): Promise<Customer | undefined> {
    if (USE_MOCK_DATA) {
      const idx = mockCustomers.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('客户不存在');
      mockCustomers[idx] = { ...mockCustomers[idx], ...data };
      return mockCustomers[idx];
    }
    const all = await this.findAll();
    if (all.find(c => c.id !== id && data.code && c.code === data.code)) throw new Error(`客户编号 "${data.code}" 已存在`);
    await DataService.update(TABLE_IDS.customers, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      const idx = mockCustomers.findIndex(c => c.id === id);
      if (idx !== -1) mockCustomers.splice(idx, 1);
      return true;
    }
    return await DataService.delete(TABLE_IDS.customers, id);
  },
};

// ========== 供应商 ==========
export const VendorRepo = {
  async findAll(): Promise<Vendor[]> {
    if (USE_MOCK_DATA) return [...mockVendors];
    return await DataService.list(TABLE_IDS.vendors) as Vendor[];
  },
  async findById(id: string): Promise<Vendor | undefined> {
    const all = await this.findAll();
    return all.find(v => v.id === id);
  },
  async create(data: Omit<Vendor, 'id'>): Promise<Vendor> {
    if (USE_MOCK_DATA) {
      const newItem = { ...data, id: String(Date.now()) } as Vendor;
      mockVendors.push(newItem);
      return newItem;
    }
    const all = await this.findAll();
    if (all.find(v => v.code === data.code)) throw new Error(`供应商编号 "${data.code}" 已存在`);
    await DataService.create(TABLE_IDS.vendors, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<Vendor>): Promise<Vendor | undefined> {
    if (USE_MOCK_DATA) {
      const idx = mockVendors.findIndex(v => v.id === id);
      if (idx === -1) throw new Error('供应商不存在');
      mockVendors[idx] = { ...mockVendors[idx], ...data };
      return mockVendors[idx];
    }
    const all = await this.findAll();
    if (all.find(v => v.id !== id && data.code && v.code === data.code)) throw new Error(`供应商编号 "${data.code}" 已存在`);
    await DataService.update(TABLE_IDS.vendors, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      const idx = mockVendors.findIndex(v => v.id === id);
      if (idx !== -1) mockVendors.splice(idx, 1);
      return true;
    }
    return await DataService.delete(TABLE_IDS.vendors, id);
  },
};

// ========== 物料 ==========
export const MaterialRepo = {
  async findAll(): Promise<Material[]> {
    if (USE_MOCK_DATA) return [...mockMaterials];
    return await DataService.list(TABLE_IDS.materials) as Material[];
  },
  async findById(id: string): Promise<Material | undefined> {
    const all = await this.findAll();
    return all.find(m => m.id === id);
  },
  async create(data: Omit<Material, 'id'>): Promise<Material> {
    if (USE_MOCK_DATA) {
      const newItem = { ...data, id: String(Date.now()) } as Material;
      mockMaterials.push(newItem);
      return newItem;
    }
    const all = await this.findAll();
    if (all.find(m => m.code === data.code)) throw new Error(`物料编号 "${data.code}" 已存在`);
    await DataService.create(TABLE_IDS.materials, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<Material>): Promise<Material | undefined> {
    if (USE_MOCK_DATA) {
      const idx = mockMaterials.findIndex(m => m.id === id);
      if (idx === -1) throw new Error('物料不存在');
      mockMaterials[idx] = { ...mockMaterials[idx], ...data };
      return mockMaterials[idx];
    }
    const all = await this.findAll();
    if (all.find(m => m.id !== id && data.code && m.code === data.code)) throw new Error(`物料编号 "${data.code}" 已存在`);
    await DataService.update(TABLE_IDS.materials, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      const idx = mockMaterials.findIndex(m => m.id === id);
      if (idx !== -1) mockMaterials.splice(idx, 1);
      return true;
    }
    return await DataService.delete(TABLE_IDS.materials, id);
  },
};

// ========== 产品 ==========
export const ProductRepo = {
  async findAll(): Promise<Product[]> {
    if (USE_MOCK_DATA) return [...mockProducts];
    return await DataService.list(TABLE_IDS.products) as Product[];
  },
  async findById(id: string): Promise<Product | undefined> {
    const all = await this.findAll();
    return all.find(p => p.id === id);
  },
  async create(data: Omit<Product, 'id'>): Promise<Product> {
    if (USE_MOCK_DATA) {
      const newItem = { ...data, id: String(Date.now()) } as Product;
      mockProducts.push(newItem);
      return newItem;
    }
    const all = await this.findAll();
    if (all.find(p => p.code === data.code)) throw new Error(`货号 "${data.code}" 已存在`);
    await DataService.create(TABLE_IDS.products, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<Product>): Promise<Product | undefined> {
    if (USE_MOCK_DATA) {
      const idx = mockProducts.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('产品不存在');
      mockProducts[idx] = { ...mockProducts[idx], ...data };
      return mockProducts[idx];
    }
    const all = await this.findAll();
    if (all.find(p => p.id !== id && data.code && p.code === data.code)) throw new Error(`货号 "${data.code}" 已存在`);
    await DataService.update(TABLE_IDS.products, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      const idx = mockProducts.findIndex(p => p.id === id);
      if (idx !== -1) mockProducts.splice(idx, 1);
      return true;
    }
    return await DataService.delete(TABLE_IDS.products, id);
  },
};

// ========== 工艺 ==========
export const ProcessRepo = {
  async findAll(): Promise<Process[]> {
    if (USE_MOCK_DATA) return [...mockProcesses];
    return await DataService.list(TABLE_IDS.processes) as Process[];
  },
  async findById(id: string): Promise<Process | undefined> {
    const all = await this.findAll();
    return all.find(p => p.id === id);
  },
  async create(data: Omit<Process, 'id'>): Promise<Process> {
    if (USE_MOCK_DATA) {
      const newItem = { ...data, id: String(Date.now()) } as Process;
      mockProcesses.push(newItem);
      return newItem;
    }
    const all = await this.findAll();
    if (all.find(p => p.name === data.name)) throw new Error(`工艺 "${data.name}" 已存在`);
    await DataService.create(TABLE_IDS.processes, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<Process>): Promise<Process | undefined> {
    if (USE_MOCK_DATA) {
      const idx = mockProcesses.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('工艺不存在');
      mockProcesses[idx] = { ...mockProcesses[idx], ...data };
      return mockProcesses[idx];
    }
    const all = await this.findAll();
    if (all.find(p => p.id !== id && data.name && p.name === data.name)) throw new Error(`工艺 "${data.name}" 已存在`);
    await DataService.update(TABLE_IDS.processes, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      const idx = mockProcesses.findIndex(p => p.id === id);
      if (idx !== -1) mockProcesses.splice(idx, 1);
      return true;
    }
    return await DataService.delete(TABLE_IDS.processes, id);
  },
};

// ========== 工序 ==========
export const WorkstationRepo = {
  async findAll(): Promise<Workstation[]> {
    if (USE_MOCK_DATA) return [...mockWorkstations];
    return await DataService.list(TABLE_IDS.workstations) as Workstation[];
  },
  async findById(id: string): Promise<Workstation | undefined> {
    const all = await this.findAll();
    return all.find(w => w.id === id);
  },
  async create(data: Omit<Workstation, 'id'>): Promise<Workstation> {
    if (USE_MOCK_DATA) {
      const newItem = { ...data, id: String(Date.now()) } as Workstation;
      mockWorkstations.push(newItem);
      return newItem;
    }
    const all = await this.findAll();
    if (all.find(w => w.name === data.name)) throw new Error(`工序 "${data.name}" 已存在`);
    await DataService.create(TABLE_IDS.workstations, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<Workstation>): Promise<Workstation | undefined> {
    if (USE_MOCK_DATA) {
      const idx = mockWorkstations.findIndex(w => w.id === id);
      if (idx === -1) throw new Error('工序不存在');
      mockWorkstations[idx] = { ...mockWorkstations[idx], ...data };
      return mockWorkstations[idx];
    }
    const all = await this.findAll();
    if (all.find(w => w.id !== id && data.name && w.name === data.name)) throw new Error(`工序 "${data.name}" 已存在`);
    await DataService.update(TABLE_IDS.workstations, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      const idx = mockWorkstations.findIndex(w => w.id === id);
      if (idx !== -1) mockWorkstations.splice(idx, 1);
      return true;
    }
    return await DataService.delete(TABLE_IDS.workstations, id);
  },
};

// ========== 销售订单 ==========
export const SalesOrderRepo = {
  async findAll(): Promise<SalesOrder[]> {
    if (USE_MOCK_DATA) return [...mockSalesOrders];
    return await DataService.list(TABLE_IDS.salesOrders) as SalesOrder[];
  },
  async findById(id: string): Promise<SalesOrder | undefined> {
    const all = await this.findAll();
    return all.find(s => s.id === id);
  },
  async create(data: Omit<SalesOrder, 'id'>): Promise<SalesOrder> {
    if (USE_MOCK_DATA) {
      const newItem = { ...data, id: String(Date.now()) } as SalesOrder;
      mockSalesOrders.push(newItem);
      return newItem;
    }
    const all = await this.findAll();
    if (all.find(s => s.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
    await DataService.create(TABLE_IDS.salesOrders, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<SalesOrder>): Promise<SalesOrder | undefined> {
    if (USE_MOCK_DATA) {
      const idx = mockSalesOrders.findIndex(s => s.id === id);
      if (idx === -1) throw new Error('订单不存在');
      mockSalesOrders[idx] = { ...mockSalesOrders[idx], ...data };
      return mockSalesOrders[idx];
    }
    const all = await this.findAll();
    if (all.find(s => s.id !== id && data.单号 && s.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
    await DataService.update(TABLE_IDS.salesOrders, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      const idx = mockSalesOrders.findIndex(s => s.id === id);
      if (idx !== -1) mockSalesOrders.splice(idx, 1);
      return true;
    }
    return await DataService.delete(TABLE_IDS.salesOrders, id);
  },
};

// ========== 采购订单 ==========
export const PurchaseOrderRepo = {
  async findAll(): Promise<PurchaseOrder[]> {
    if (USE_MOCK_DATA) return [...mockPurchaseOrders];
    return await DataService.list(TABLE_IDS.purchaseOrders) as PurchaseOrder[];
  },
  async findById(id: string): Promise<PurchaseOrder | undefined> {
    const all = await this.findAll();
    return all.find(p => p.id === id);
  },
  async create(data: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      const newItem = { ...data, id: String(Date.now()) } as PurchaseOrder;
      mockPurchaseOrders.push(newItem);
      return newItem;
    }
    const all = await this.findAll();
    if (all.find(p => p.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
    await DataService.create(TABLE_IDS.purchaseOrders, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder | undefined> {
    if (USE_MOCK_DATA) {
      const idx = mockPurchaseOrders.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('订单不存在');
      mockPurchaseOrders[idx] = { ...mockPurchaseOrders[idx], ...data };
      return mockPurchaseOrders[idx];
    }
    const all = await this.findAll();
    if (all.find(p => p.id !== id && data.单号 && p.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
    await DataService.update(TABLE_IDS.purchaseOrders, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      const idx = mockPurchaseOrders.findIndex(p => p.id === id);
      if (idx !== -1) mockPurchaseOrders.splice(idx, 1);
      return true;
    }
    return await DataService.delete(TABLE_IDS.purchaseOrders, id);
  },
};

// ========== 库存 ==========
export const InventoryRepo = {
  async findAll(): Promise<Inventory[]> {
    if (USE_MOCK_DATA) return [...mockInventory];
    return await DataService.list(TABLE_IDS.inventory) as Inventory[];
  },
  async findById(id: string): Promise<Inventory | undefined> {
    const all = await this.findAll();
    return all.find(i => i.id === id);
  },
  async create(data: Omit<Inventory, 'id'>): Promise<Inventory> {
    if (USE_MOCK_DATA) {
      const newItem = { ...data, id: String(Date.now()) } as Inventory;
      mockInventory.push(newItem);
      return newItem;
    }
    const all = await this.findAll();
    if (all.find(i => i.货号 === data.货号)) throw new Error(`货号 "${data.货号}" 已存在`);
    await DataService.create(TABLE_IDS.inventory, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<Inventory>): Promise<Inventory | undefined> {
    if (USE_MOCK_DATA) {
      const idx = mockInventory.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('库存记录不存在');
      mockInventory[idx] = { ...mockInventory[idx], ...data };
      return mockInventory[idx];
    }
    const all = await this.findAll();
    if (all.find(i => i.id !== id && data.货号 && i.货号 === data.货号)) throw new Error(`货号 "${data.货号}" 已存在`);
    await DataService.update(TABLE_IDS.inventory, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      const idx = mockInventory.findIndex(i => i.id === id);
      if (idx !== -1) mockInventory.splice(idx, 1);
      return true;
    }
    return await DataService.delete(TABLE_IDS.inventory, id);
  },
};

// ========== 加工单 ==========
export const ProcessingOrderRepo = {
  async findAll(): Promise<ProcessingOrder[]> {
    if (USE_MOCK_DATA) return [...mockProcessingOrders];
    return await DataService.list(TABLE_IDS.processingOrders) as ProcessingOrder[];
  },
  async findById(id: string): Promise<ProcessingOrder | undefined> {
    const all = await this.findAll();
    return all.find(p => p.id === id);
  },
  async create(data: Omit<ProcessingOrder, 'id'>): Promise<ProcessingOrder> {
    if (USE_MOCK_DATA) {
      const newItem = { ...data, id: String(Date.now()) } as ProcessingOrder;
      mockProcessingOrders.push(newItem);
      return newItem;
    }
    const all = await this.findAll();
    if (all.find(p => p.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
    await DataService.create(TABLE_IDS.processingOrders, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<ProcessingOrder>): Promise<ProcessingOrder | undefined> {
    if (USE_MOCK_DATA) {
      const idx = mockProcessingOrders.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('加工单不存在');
      mockProcessingOrders[idx] = { ...mockProcessingOrders[idx], ...data };
      return mockProcessingOrders[idx];
    }
    const all = await this.findAll();
    if (all.find(p => p.id !== id && data.单号 && p.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
    await DataService.update(TABLE_IDS.processingOrders, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      const idx = mockProcessingOrders.findIndex(p => p.id === id);
      if (idx !== -1) mockProcessingOrders.splice(idx, 1);
      return true;
    }
    return await DataService.delete(TABLE_IDS.processingOrders, id);
  },
};
