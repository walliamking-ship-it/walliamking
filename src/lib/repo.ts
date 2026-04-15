/**
 * 数据仓储层 - 前端直连飞书Bitable API
 */

import { Customer, Vendor, Material, Product, Process, Workstation, SalesOrder, PurchaseOrder, Inventory, ProcessingOrder } from './types';
import { DataService, TABLE_IDS } from './api';

// ========== 客户 ==========
export const CustomerRepo = {
  async findAll(): Promise<Customer[]> {
    return await DataService.list(TABLE_IDS.customers) as Customer[];
  },

  async findById(id: string): Promise<Customer | undefined> {
    const all = await this.findAll();
    return all.find(c => c.id === id);
  },

  async create(data: Omit<Customer, 'id'>): Promise<Customer> {
    const all = await this.findAll();
    if (all.find(c => c.code === data.code)) {
      throw new Error(`客户编号 "${data.code}" 已存在`);
    }
    await DataService.create(TABLE_IDS.customers, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer | undefined> {
    const all = await this.findAll();
    if (all.find(c => c.id !== id && data.code && c.code === data.code)) {
      throw new Error(`客户编号 "${data.code}" 已存在`);
    }
    await DataService.update(TABLE_IDS.customers, id, data);
    return await this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    return await DataService.delete(TABLE_IDS.customers, id);
  },
};

// ========== 供应商 ==========
export const VendorRepo = {
  async findAll(): Promise<Vendor[]> {
    return await DataService.list(TABLE_IDS.vendors) as Vendor[];
  },

  async findById(id: string): Promise<Vendor | undefined> {
    const all = await this.findAll();
    return all.find(v => v.id === id);
  },

  async create(data: Omit<Vendor, 'id'>): Promise<Vendor> {
    const all = await this.findAll();
    if (all.find(v => v.code === data.code)) {
      throw new Error(`供应商编号 "${data.code}" 已存在`);
    }
    await DataService.create(TABLE_IDS.vendors, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },

  async update(id: string, data: Partial<Vendor>): Promise<Vendor | undefined> {
    const all = await this.findAll();
    if (all.find(v => v.id !== id && data.code && v.code === data.code)) {
      throw new Error(`供应商编号 "${data.code}" 已存在`);
    }
    await DataService.update(TABLE_IDS.vendors, id, data);
    return await this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    return await DataService.delete(TABLE_IDS.vendors, id);
  },
};

// ========== 物料 ==========
export const MaterialRepo = {
  async findAll(): Promise<Material[]> {
    return await DataService.list(TABLE_IDS.materials) as Material[];
  },

  async findById(id: string): Promise<Material | undefined> {
    const all = await this.findAll();
    return all.find(m => m.id === id);
  },

  async create(data: Omit<Material, 'id'>): Promise<Material> {
    const all = await this.findAll();
    if (all.find(m => m.code === data.code)) {
      throw new Error(`物料编号 "${data.code}" 已存在`);
    }
    await DataService.create(TABLE_IDS.materials, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },

  async update(id: string, data: Partial<Material>): Promise<Material | undefined> {
    const all = await this.findAll();
    if (all.find(m => m.id !== id && data.code && m.code === data.code)) {
      throw new Error(`物料编号 "${data.code}" 已存在`);
    }
    await DataService.update(TABLE_IDS.materials, id, data);
    return await this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    return await DataService.delete(TABLE_IDS.materials, id);
  },
};

// ========== 产品 ==========
export const ProductRepo = {
  async findAll(): Promise<Product[]> {
    return await DataService.list(TABLE_IDS.products) as Product[];
  },

  async findById(id: string): Promise<Product | undefined> {
    const all = await this.findAll();
    return all.find(p => p.id === id);
  },

  async create(data: Omit<Product, 'id'>): Promise<Product> {
    const all = await this.findAll();
    if (all.find(p => p.code === data.code)) {
      throw new Error(`产品编号 "${data.code}" 已存在`);
    }
    await DataService.create(TABLE_IDS.products, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },

  async update(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const all = await this.findAll();
    if (all.find(p => p.id !== id && data.code && p.code === data.code)) {
      throw new Error(`产品编号 "${data.code}" 已存在`);
    }
    await DataService.update(TABLE_IDS.products, id, data);
    return await this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    return await DataService.delete(TABLE_IDS.products, id);
  },
};

// ========== 工艺 ==========
export const ProcessRepo = {
  async findAll(): Promise<Process[]> {
    return await DataService.list(TABLE_IDS.processes) as Process[];
  },

  async findById(id: string): Promise<Process | undefined> {
    const all = await this.findAll();
    return all.find(p => p.id === id);
  },

  async create(data: Omit<Process, 'id'>): Promise<Process> {
    const all = await this.findAll();
    if (all.find(p => p.name === data.name)) {
      throw new Error(`工艺名称 "${data.name}" 已存在`);
    }
    await DataService.create(TABLE_IDS.processes, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },

  async update(id: string, data: Partial<Process>): Promise<Process | undefined> {
    const all = await this.findAll();
    if (all.find(p => p.id !== id && data.name && p.name === data.name)) {
      throw new Error(`工艺名称 "${data.name}" 已存在`);
    }
    await DataService.update(TABLE_IDS.processes, id, data);
    return await this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    return await DataService.delete(TABLE_IDS.processes, id);
  },
};

// ========== 工序 ==========
export const WorkstationRepo = {
  async findAll(): Promise<Workstation[]> {
    return await DataService.list(TABLE_IDS.workstations) as Workstation[];
  },

  async findById(id: string): Promise<Workstation | undefined> {
    const all = await this.findAll();
    return all.find(w => w.id === id);
  },

  async create(data: Omit<Workstation, 'id'>): Promise<Workstation> {
    const all = await this.findAll();
    if (all.find(w => w.name === data.name)) {
      throw new Error(`工序名称 "${data.name}" 已存在`);
    }
    await DataService.create(TABLE_IDS.workstations, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },

  async update(id: string, data: Partial<Workstation>): Promise<Workstation | undefined> {
    const all = await this.findAll();
    if (all.find(w => w.id !== id && data.name && w.name === data.name)) {
      throw new Error(`工序名称 "${data.name}" 已存在`);
    }
    await DataService.update(TABLE_IDS.workstations, id, data);
    return await this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    return await DataService.delete(TABLE_IDS.workstations, id);
  },
};

// ========== 销售订单 ==========
export const SalesOrderRepo = {
  async findAll(): Promise<SalesOrder[]> {
    return await DataService.list(TABLE_IDS.salesOrders) as SalesOrder[];
  },

  async findById(id: string): Promise<SalesOrder | undefined> {
    const all = await this.findAll();
    return all.find(s => s.id === id);
  },

  async create(data: Omit<SalesOrder, 'id'>): Promise<SalesOrder> {
    const all = await this.findAll();
    if (all.find(s => s.单号 === data.单号)) {
      throw new Error(`销售单号 "${data.单号}" 已存在`);
    }
    await DataService.create(TABLE_IDS.salesOrders, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },

  async update(id: string, data: Partial<SalesOrder>): Promise<SalesOrder | undefined> {
    const all = await this.findAll();
    if (all.find(s => s.id !== id && data.单号 && s.单号 === data.单号)) {
      throw new Error(`销售单号 "${data.单号}" 已存在`);
    }
    await DataService.update(TABLE_IDS.salesOrders, id, data);
    return await this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    return await DataService.delete(TABLE_IDS.salesOrders, id);
  },
};

// ========== 采购订单 ==========
export const PurchaseOrderRepo = {
  async findAll(): Promise<PurchaseOrder[]> {
    return await DataService.list(TABLE_IDS.purchaseOrders) as PurchaseOrder[];
  },

  async findById(id: string): Promise<PurchaseOrder | undefined> {
    const all = await this.findAll();
    return all.find(p => p.id === id);
  },

  async create(data: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> {
    const all = await this.findAll();
    if (all.find(p => p.单号 === data.单号)) {
      throw new Error(`采购单号 "${data.单号}" 已存在`);
    }
    await DataService.create(TABLE_IDS.purchaseOrders, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },

  async update(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const all = await this.findAll();
    if (all.find(p => p.id !== id && data.单号 && p.单号 === data.单号)) {
      throw new Error(`采购单号 "${data.单号}" 已存在`);
    }
    await DataService.update(TABLE_IDS.purchaseOrders, id, data);
    return await this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    return await DataService.delete(TABLE_IDS.purchaseOrders, id);
  },
};

// ========== 库存 ==========
export const InventoryRepo = {
  async findAll(): Promise<Inventory[]> {
    return await DataService.list(TABLE_IDS.inventory) as Inventory[];
  },

  async findById(id: string): Promise<Inventory | undefined> {
    const all = await this.findAll();
    return all.find(i => i.id === id);
  },

  async create(data: Omit<Inventory, 'id'>): Promise<Inventory> {
    const all = await this.findAll();
    if (all.find(i => i.货号 === data.货号)) {
      throw new Error(`货号 "${data.货号}" 已存在`);
    }
    await DataService.create(TABLE_IDS.inventory, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },

  async update(id: string, data: Partial<Inventory>): Promise<Inventory | undefined> {
    const all = await this.findAll();
    if (all.find(i => i.id !== id && data.货号 && i.货号 === data.货号)) {
      throw new Error(`货号 "${data.货号}" 已存在`);
    }
    await DataService.update(TABLE_IDS.inventory, id, data);
    return await this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    return await DataService.delete(TABLE_IDS.inventory, id);
  },
};

// ========== 加工单 ==========
export const ProcessingOrderRepo = {
  async findAll(): Promise<ProcessingOrder[]> {
    return await DataService.list(TABLE_IDS.processingOrders) as ProcessingOrder[];
  },

  async findById(id: string): Promise<ProcessingOrder | undefined> {
    const all = await this.findAll();
    return all.find(p => p.id === id);
  },

  async create(data: Omit<ProcessingOrder, 'id'>): Promise<ProcessingOrder> {
    const all = await this.findAll();
    if (all.find(p => p.单号 === data.单号)) {
      throw new Error(`加工单号 "${data.单号}" 已存在`);
    }
    await DataService.create(TABLE_IDS.processingOrders, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },

  async update(id: string, data: Partial<ProcessingOrder>): Promise<ProcessingOrder | undefined> {
    const all = await this.findAll();
    if (all.find(p => p.id !== id && data.单号 && p.单号 === data.单号)) {
      throw new Error(`加工单号 "${data.单号}" 已存在`);
    }
    await DataService.update(TABLE_IDS.processingOrders, id, data);
    return await this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    return await DataService.delete(TABLE_IDS.processingOrders, id);
  },
};
