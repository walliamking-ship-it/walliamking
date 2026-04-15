/**
 * 数据仓储层 - 支持本地持久化模式
 * USE_MOCK_DATA=true 时数据保存到浏览器localStorage，刷新页面不丢失
 */

import { Customer, Vendor, Material, Product, Process, Workstation, SalesOrder, PurchaseOrder, Inventory, ProcessingOrder } from './types';
import { DataService, TABLE_IDS } from './api';
import { USE_MOCK_DATA } from './mock-data';
import {
  getCustomers, setCustomers,
  getVendors, setVendors,
  getMaterials, setMaterials,
  getProducts, setProducts,
  getProcesses, setProcesses,
  getWorkstations, setWorkstations,
  getSalesOrders, setSalesOrders,
  getPurchaseOrders, setPurchaseOrders,
  getInventory, setInventory,
  getProcessingOrders, setProcessingOrders,
} from './localData';

// ========== 客户 ==========
export const CustomerRepo = {
  async findAll(): Promise<Customer[]> {
    if (USE_MOCK_DATA) return getCustomers();
    return await DataService.list(TABLE_IDS.customers) as Customer[];
  },
  async findById(id: string): Promise<Customer | undefined> {
    const all = await this.findAll();
    return all.find(c => c.id === id);
  },
  async create(data: Omit<Customer, 'id'>): Promise<Customer> {
    if (USE_MOCK_DATA) {
      const all = getCustomers();
      if (all.find(c => c.code === data.code)) throw new Error(`客户编号 "${data.code}" 已存在`);
      const newItem = { ...data, id: String(Date.now()) } as Customer;
      setCustomers([...all, newItem]);
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
      const all = getCustomers();
      const idx = all.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('客户不存在');
      if (data.code && all.find(c => c.id !== id && c.code === data.code)) throw new Error(`客户编号 "${data.code}" 已存在`);
      const updated = [...all];
      updated[idx] = { ...updated[idx], ...data };
      setCustomers(updated);
      return updated[idx];
    }
    const all = await this.findAll();
    if (data.code && all.find(c => c.id !== id && c.code === data.code)) throw new Error(`客户编号 "${data.code}" 已存在`);
    await DataService.update(TABLE_IDS.customers, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      const all = getCustomers();
      setCustomers(all.filter(c => c.id !== id));
      return true;
    }
    return await DataService.delete(TABLE_IDS.customers, id);
  },
};

// ========== 供应商 ==========
export const VendorRepo = {
  async findAll(): Promise<Vendor[]> {
    if (USE_MOCK_DATA) return getVendors();
    return await DataService.list(TABLE_IDS.vendors) as Vendor[];
  },
  async findById(id: string): Promise<Vendor | undefined> {
    const all = await this.findAll();
    return all.find(v => v.id === id);
  },
  async create(data: Omit<Vendor, 'id'>): Promise<Vendor> {
    if (USE_MOCK_DATA) {
      const all = getVendors();
      if (all.find(v => v.code === data.code)) throw new Error(`供应商编号 "${data.code}" 已存在`);
      const newItem = { ...data, id: String(Date.now()) } as Vendor;
      setVendors([...all, newItem]);
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
      const all = getVendors();
      const idx = all.findIndex(v => v.id === id);
      if (idx === -1) throw new Error('供应商不存在');
      if (data.code && all.find(v => v.id !== id && v.code === data.code)) throw new Error(`供应商编号 "${data.code}" 已存在`);
      const updated = [...all];
      updated[idx] = { ...updated[idx], ...data };
      setVendors(updated);
      return updated[idx];
    }
    const all = await this.findAll();
    if (data.code && all.find(v => v.id !== id && v.code === data.code)) throw new Error(`供应商编号 "${data.code}" 已存在`);
    await DataService.update(TABLE_IDS.vendors, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      setVendors(getVendors().filter(v => v.id !== id));
      return true;
    }
    return await DataService.delete(TABLE_IDS.vendors, id);
  },
};

// ========== 物料 ==========
export const MaterialRepo = {
  async findAll(): Promise<Material[]> {
    if (USE_MOCK_DATA) return getMaterials();
    return await DataService.list(TABLE_IDS.materials) as Material[];
  },
  async findById(id: string): Promise<Material | undefined> {
    const all = await this.findAll();
    return all.find(m => m.id === id);
  },
  async create(data: Omit<Material, 'id'>): Promise<Material> {
    if (USE_MOCK_DATA) {
      const all = getMaterials();
      if (data.code && all.find(m => m.code === data.code)) throw new Error(`物料编号 "${data.code}" 已存在`);
      const newItem = { ...data, id: String(Date.now()) } as Material;
      setMaterials([...all, newItem]);
      return newItem;
    }
    const all = await this.findAll();
    if (data.code && all.find(m => m.code === data.code)) throw new Error(`物料编号 "${data.code}" 已存在`);
    await DataService.create(TABLE_IDS.materials, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<Material>): Promise<Material | undefined> {
    if (USE_MOCK_DATA) {
      const all = getMaterials();
      const idx = all.findIndex(m => m.id === id);
      if (idx === -1) throw new Error('物料不存在');
      if (data.code && all.find(m => m.id !== id && m.code === data.code)) throw new Error(`物料编号 "${data.code}" 已存在`);
      const updated = [...all];
      updated[idx] = { ...updated[idx], ...data };
      setMaterials(updated);
      return updated[idx];
    }
    const all = await this.findAll();
    if (data.code && all.find(m => m.id !== id && m.code === data.code)) throw new Error(`物料编号 "${data.code}" 已存在`);
    await DataService.update(TABLE_IDS.materials, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      setMaterials(getMaterials().filter(m => m.id !== id));
      return true;
    }
    return await DataService.delete(TABLE_IDS.materials, id);
  },
};

// ========== 产品 ==========
export const ProductRepo = {
  async findAll(): Promise<Product[]> {
    if (USE_MOCK_DATA) return getProducts();
    return await DataService.list(TABLE_IDS.products) as Product[];
  },
  async findById(id: string): Promise<Product | undefined> {
    const all = await this.findAll();
    return all.find(p => p.id === id);
  },
  async create(data: Omit<Product, 'id'>): Promise<Product> {
    if (USE_MOCK_DATA) {
      const all = getProducts();
      if (data.code && all.find(p => p.code === data.code)) throw new Error(`货号 "${data.code}" 已存在`);
      const newItem = { ...data, id: String(Date.now()) } as Product;
      setProducts([...all, newItem]);
      return newItem;
    }
    const all = await this.findAll();
    if (data.code && all.find(p => p.code === data.code)) throw new Error(`货号 "${data.code}" 已存在`);
    await DataService.create(TABLE_IDS.products, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<Product>): Promise<Product | undefined> {
    if (USE_MOCK_DATA) {
      const all = getProducts();
      const idx = all.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('产品不存在');
      if (data.code && all.find(p => p.id !== id && p.code === data.code)) throw new Error(`货号 "${data.code}" 已存在`);
      const updated = [...all];
      updated[idx] = { ...updated[idx], ...data };
      setProducts(updated);
      return updated[idx];
    }
    const all = await this.findAll();
    if (data.code && all.find(p => p.id !== id && p.code === data.code)) throw new Error(`货号 "${data.code}" 已存在`);
    await DataService.update(TABLE_IDS.products, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      setProducts(getProducts().filter(p => p.id !== id));
      return true;
    }
    return await DataService.delete(TABLE_IDS.products, id);
  },
};

// ========== 工艺 ==========
export const ProcessRepo = {
  async findAll(): Promise<Process[]> {
    if (USE_MOCK_DATA) return getProcesses();
    return await DataService.list(TABLE_IDS.processes) as Process[];
  },
  async findById(id: string): Promise<Process | undefined> {
    const all = await this.findAll();
    return all.find(p => p.id === id);
  },
  async create(data: Omit<Process, 'id'>): Promise<Process> {
    if (USE_MOCK_DATA) {
      const all = getProcesses();
      if (all.find(p => p.name === data.name)) throw new Error(`工艺 "${data.name}" 已存在`);
      const newItem = { ...data, id: String(Date.now()) } as Process;
      setProcesses([...all, newItem]);
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
      const all = getProcesses();
      const idx = all.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('工艺不存在');
      if (data.name && all.find(p => p.id !== id && p.name === data.name)) throw new Error(`工艺 "${data.name}" 已存在`);
      const updated = [...all];
      updated[idx] = { ...updated[idx], ...data };
      setProcesses(updated);
      return updated[idx];
    }
    const all = await this.findAll();
    if (data.name && all.find(p => p.id !== id && p.name === data.name)) throw new Error(`工艺 "${data.name}" 已存在`);
    await DataService.update(TABLE_IDS.processes, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      setProcesses(getProcesses().filter(p => p.id !== id));
      return true;
    }
    return await DataService.delete(TABLE_IDS.processes, id);
  },
};

// ========== 工序 ==========
export const WorkstationRepo = {
  async findAll(): Promise<Workstation[]> {
    if (USE_MOCK_DATA) return getWorkstations();
    return await DataService.list(TABLE_IDS.workstations) as Workstation[];
  },
  async findById(id: string): Promise<Workstation | undefined> {
    const all = await this.findAll();
    return all.find(w => w.id === id);
  },
  async create(data: Omit<Workstation, 'id'>): Promise<Workstation> {
    if (USE_MOCK_DATA) {
      const all = getWorkstations();
      if (all.find(w => w.name === data.name)) throw new Error(`工序 "${data.name}" 已存在`);
      const newItem = { ...data, id: String(Date.now()) } as Workstation;
      setWorkstations([...all, newItem]);
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
      const all = getWorkstations();
      const idx = all.findIndex(w => w.id === id);
      if (idx === -1) throw new Error('工序不存在');
      if (data.name && all.find(w => w.id !== id && w.name === data.name)) throw new Error(`工序 "${data.name}" 已存在`);
      const updated = [...all];
      updated[idx] = { ...updated[idx], ...data };
      setWorkstations(updated);
      return updated[idx];
    }
    const all = await this.findAll();
    if (data.name && all.find(w => w.id !== id && w.name === data.name)) throw new Error(`工序 "${data.name}" 已存在`);
    await DataService.update(TABLE_IDS.workstations, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      setWorkstations(getWorkstations().filter(w => w.id !== id));
      return true;
    }
    return await DataService.delete(TABLE_IDS.workstations, id);
  },
};

// ========== 销售订单 ==========
export const SalesOrderRepo = {
  async findAll(): Promise<SalesOrder[]> {
    if (USE_MOCK_DATA) return getSalesOrders();
    return await DataService.list(TABLE_IDS.salesOrders) as SalesOrder[];
  },
  async findById(id: string): Promise<SalesOrder | undefined> {
    const all = await this.findAll();
    return all.find(s => s.id === id);
  },
  async create(data: Omit<SalesOrder, 'id'>): Promise<SalesOrder> {
    if (USE_MOCK_DATA) {
      const all = getSalesOrders();
      if (all.find(s => s.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
      const newItem = { ...data, id: String(Date.now()) } as SalesOrder;
      setSalesOrders([...all, newItem]);
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
      const all = getSalesOrders();
      const idx = all.findIndex(s => s.id === id);
      if (idx === -1) throw new Error('订单不存在');
      if (data.单号 && all.find(s => s.id !== id && s.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
      const updated = [...all];
      updated[idx] = { ...updated[idx], ...data };
      setSalesOrders(updated);
      return updated[idx];
    }
    const all = await this.findAll();
    if (data.单号 && all.find(s => s.id !== id && s.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
    await DataService.update(TABLE_IDS.salesOrders, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      setSalesOrders(getSalesOrders().filter(s => s.id !== id));
      return true;
    }
    return await DataService.delete(TABLE_IDS.salesOrders, id);
  },
};

// ========== 采购订单 ==========
export const PurchaseOrderRepo = {
  async findAll(): Promise<PurchaseOrder[]> {
    if (USE_MOCK_DATA) return getPurchaseOrders();
    return await DataService.list(TABLE_IDS.purchaseOrders) as PurchaseOrder[];
  },
  async findById(id: string): Promise<PurchaseOrder | undefined> {
    const all = await this.findAll();
    return all.find(p => p.id === id);
  },
  async create(data: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      const all = getPurchaseOrders();
      if (all.find(p => p.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
      const newItem = { ...data, id: String(Date.now()) } as PurchaseOrder;
      setPurchaseOrders([...all, newItem]);
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
      const all = getPurchaseOrders();
      const idx = all.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('订单不存在');
      if (data.单号 && all.find(p => p.id !== id && p.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
      const updated = [...all];
      updated[idx] = { ...updated[idx], ...data };
      setPurchaseOrders(updated);
      return updated[idx];
    }
    const all = await this.findAll();
    if (data.单号 && all.find(p => p.id !== id && p.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
    await DataService.update(TABLE_IDS.purchaseOrders, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      setPurchaseOrders(getPurchaseOrders().filter(p => p.id !== id));
      return true;
    }
    return await DataService.delete(TABLE_IDS.purchaseOrders, id);
  },
};

// ========== 库存 ==========
export const InventoryRepo = {
  async findAll(): Promise<Inventory[]> {
    if (USE_MOCK_DATA) return getInventory();
    return await DataService.list(TABLE_IDS.inventory) as Inventory[];
  },
  async findById(id: string): Promise<Inventory | undefined> {
    const all = await this.findAll();
    return all.find(i => i.id === id);
  },
  async create(data: Omit<Inventory, 'id'>): Promise<Inventory> {
    if (USE_MOCK_DATA) {
      const all = getInventory();
      if (data.货号 && all.find(i => i.货号 === data.货号)) throw new Error(`货号 "${data.货号}" 已存在`);
      const newItem = { ...data, id: String(Date.now()) } as Inventory;
      setInventory([...all, newItem]);
      return newItem;
    }
    const all = await this.findAll();
    if (data.货号 && all.find(i => i.货号 === data.货号)) throw new Error(`货号 "${data.货号}" 已存在`);
    await DataService.create(TABLE_IDS.inventory, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<Inventory>): Promise<Inventory | undefined> {
    if (USE_MOCK_DATA) {
      const all = getInventory();
      const idx = all.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('库存记录不存在');
      if (data.货号 && all.find(i => i.id !== id && i.货号 === data.货号)) throw new Error(`货号 "${data.货号}" 已存在`);
      const updated = [...all];
      updated[idx] = { ...updated[idx], ...data };
      setInventory(updated);
      return updated[idx];
    }
    const all = await this.findAll();
    if (data.货号 && all.find(i => i.id !== id && i.货号 === data.货号)) throw new Error(`货号 "${data.货号}" 已存在`);
    await DataService.update(TABLE_IDS.inventory, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      setInventory(getInventory().filter(i => i.id !== id));
      return true;
    }
    return await DataService.delete(TABLE_IDS.inventory, id);
  },
};

// ========== 加工单 ==========
export const ProcessingOrderRepo = {
  async findAll(): Promise<ProcessingOrder[]> {
    if (USE_MOCK_DATA) return getProcessingOrders();
    return await DataService.list(TABLE_IDS.processingOrders) as ProcessingOrder[];
  },
  async findById(id: string): Promise<ProcessingOrder | undefined> {
    const all = await this.findAll();
    return all.find(p => p.id === id);
  },
  async create(data: Omit<ProcessingOrder, 'id'>): Promise<ProcessingOrder> {
    if (USE_MOCK_DATA) {
      const all = getProcessingOrders();
      if (all.find(p => p.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
      const newItem = { ...data, id: String(Date.now()) } as ProcessingOrder;
      setProcessingOrders([...all, newItem]);
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
      const all = getProcessingOrders();
      const idx = all.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('加工单不存在');
      if (data.单号 && all.find(p => p.id !== id && p.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
      const updated = [...all];
      updated[idx] = { ...updated[idx], ...data };
      setProcessingOrders(updated);
      return updated[idx];
    }
    const all = await this.findAll();
    if (data.单号 && all.find(p => p.id !== id && p.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
    await DataService.update(TABLE_IDS.processingOrders, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      setProcessingOrders(getProcessingOrders().filter(p => p.id !== id));
      return true;
    }
    return await DataService.delete(TABLE_IDS.processingOrders, id);
  },
};
