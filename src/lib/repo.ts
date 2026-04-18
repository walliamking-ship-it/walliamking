/**
 * 数据仓储层 - 支持本地持久化模式
 * USE_MOCK_DATA=true 时数据保存到浏览器localStorage，刷新页面不丢失
 */

import { Customer, Vendor, Material, Product, Process, Workstation, SalesOrder, PurchaseOrder, Inventory, SalesOrderItem, DeliveryOrder, DeliveryOrderItem, PurchaseOrderItem, ReceivingOrder, ReceivingOrderItem, Warehouse, Employee, User, SalesInvoice, PurchaseInvoice, Bill, PaymentReceipt, PaymentMade, ScrapOrder, WorkOrder, JobReport, CuttingDie, Artwork, Approval } from './types';
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
  getSalesOrderItems, setSalesOrderItems,
  getDeliveryOrders, setDeliveryOrders,
  getDeliveryOrderItems, setDeliveryOrderItems,
  getPurchaseOrders, setPurchaseOrders,
  getPurchaseOrderItems, setPurchaseOrderItems,
  getReceivingOrders, setReceivingOrders,
  getReceivingOrderItems, setReceivingOrderItems,
  getWarehouses, setWarehouses,
  getEmployees, setEmployees,
  getSalesInvoices, setSalesInvoices,
  getPurchaseInvoices, setPurchaseInvoices,
  getBills, setBills,
  getPaymentReceipts, setPaymentReceipts,
  getPaymentMades, setPaymentMades,
  getScrapOrders, setScrapOrders,
  getWorkOrders, setWorkOrders,
  getJobReports, setJobReports,
  getInventory, setInventory,
  getCuttingDies, setCuttingDies,
  getArtworks, setArtworks,
  getUsers, setUsers,
  getApprovals, setApprovals,
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
  /**
   * 从订单明细重新计算并更新订单的合同金额、已送货、未收款项、收款状态、送货状态
   * 调用时机：新建/编辑订单明细后
   */
  async recomputeAmounts(id: string): Promise<SalesOrder | undefined> {
    const order = await this.findById(id);
    if (!order) return undefined;
    const items = await SalesOrderItemRepo.findBySalesOrderId(id);
    const contractAmount = items.reduce((s, i) => s + i.金额, 0);
    // 已送货 = 订单明细中已交货的数量 × 对应单价的求和
    const deliveredAmount = items.reduce((s, i) => s + i.已送货数量 * i.单价, 0);
    const receivedPayment = order.已收款 ?? 0;
    const unpaidAmount = Math.max(0, contractAmount - receivedPayment);
    // 计算收款状态
    let paymentStatus: SalesOrder['收款状态'] = '未收款';
    if (receivedPayment > 0 && receivedPayment < contractAmount) paymentStatus = '部分收款';
    else if (receivedPayment >= contractAmount) paymentStatus = '全部收款';
    // 计算送货状态
    let deliveryStatus: SalesOrder['送货状态'] = '未送货';
    if (deliveredAmount > 0 && deliveredAmount < contractAmount) deliveryStatus = '部分送货';
    else if (deliveredAmount >= contractAmount) deliveryStatus = '全部送货';
    return await this.update(id, {
      合同金额: contractAmount,
      已送货: deliveredAmount,
      未收款项: unpaidAmount,
      收款状态: paymentStatus,
      送货状态: deliveryStatus,
    });
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
  /**
   * 从订单明细重新计算并更新订单的合同金额、已收货、未付款、付款状态、收货状态
   */
  async recomputeAmounts(id: string): Promise<PurchaseOrder | undefined> {
    const order = await this.findById(id);
    if (!order) return undefined;
    const items = await PurchaseOrderItemRepo.findByPurchaseOrderId(id);
    const contractAmount = items.reduce((s, i) => s + (i.金额 || 0), 0);
    const receivedAmount = items.reduce((s, i) => s + (i.已收货数量 || 0) * (i.单价 || 0), 0);
    const paidAmount = order.已付款 ?? 0;
    const unpaidAmount = Math.max(0, contractAmount - paidAmount);
    // 计算付款状态
    let paymentStatus: PurchaseOrder['付款状态'] = '未付款';
    if (paidAmount > 0 && paidAmount < contractAmount) paymentStatus = '部分付款';
    else if (paidAmount >= contractAmount) paymentStatus = '全部付款';
    // 计算收货状态
    let receivingStatus: PurchaseOrder['收货状态'] = '未收货';
    if (receivedAmount > 0 && receivedAmount < contractAmount) receivingStatus = '部分收货';
    else if (receivedAmount >= contractAmount) receivingStatus = '全部收货';
    return await this.update(id, {
      合同金额: contractAmount,
      已收货: receivedAmount,
      未付款: unpaidAmount,
      付款状态: paymentStatus,
      收货状态: receivingStatus,
    });
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

// ========== 仓库 ==========
export const WarehouseRepo = {
  async findAll() {
    return getWarehouses();
  },
};

// ========== 销售订单明细 ==========
export const SalesOrderItemRepo = {
  async findAll(): Promise<SalesOrderItem[]> {
    return getSalesOrderItems();
  },
  async findById(id: string): Promise<SalesOrderItem | undefined> {
    return getSalesOrderItems().find(i => i.id === id);
  },
  async findBySalesOrderId(salesOrderId: string): Promise<SalesOrderItem[]> {
    return getSalesOrderItems().filter(i => i.销售订单id === salesOrderId);
  },
  async create(data: Omit<SalesOrderItem, 'id'>): Promise<SalesOrderItem> {
    const newItem = { ...data, id: String(Date.now()) } as SalesOrderItem;
    setSalesOrderItems([...getSalesOrderItems(), newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<SalesOrderItem>): Promise<SalesOrderItem | undefined> {
    const all = getSalesOrderItems();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setSalesOrderItems(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setSalesOrderItems(getSalesOrderItems().filter(i => i.id !== id));
    return true;
  },
  async deleteBySalesOrderId(salesOrderId: string): Promise<boolean> {
    setSalesOrderItems(getSalesOrderItems().filter(i => i.销售订单id !== salesOrderId));
    return true;
  },
};

// ========== 送货单 ==========
export const DeliveryOrderRepo = {
  async findAll(): Promise<DeliveryOrder[]> {
    return getDeliveryOrders();
  },
  async findById(id: string): Promise<DeliveryOrder | undefined> {
    return getDeliveryOrders().find(d => d.id === id);
  },
  async create(data: Omit<DeliveryOrder, 'id'>): Promise<DeliveryOrder> {
    const all = getDeliveryOrders();
    if (all.find(d => d.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
    const newItem = { ...data, id: String(Date.now()) } as DeliveryOrder;
    setDeliveryOrders([...all, newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<DeliveryOrder>): Promise<DeliveryOrder | undefined> {
    const all = getDeliveryOrders();
    const idx = all.findIndex(d => d.id === id);
    if (idx === -1) return undefined;
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setDeliveryOrders(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setDeliveryOrders(getDeliveryOrders().filter(d => d.id !== id));
    setDeliveryOrderItems(getDeliveryOrderItems().filter(i => i.送货单id !== id));
    return true;
  },
};

// ========== 送货单明细 ==========
export const DeliveryOrderItemRepo = {
  async findAll(): Promise<DeliveryOrderItem[]> {
    return getDeliveryOrderItems();
  },
  async findByDeliveryOrderId(deliveryOrderId: string): Promise<DeliveryOrderItem[]> {
    return getDeliveryOrderItems().filter(i => i.送货单id === deliveryOrderId);
  },
  async create(data: Omit<DeliveryOrderItem, 'id'>): Promise<DeliveryOrderItem> {
    const newItem = { ...data, id: String(Date.now()) } as DeliveryOrderItem;
    setDeliveryOrderItems([...getDeliveryOrderItems(), newItem]);
    return newItem;
  },
  async delete(id: string): Promise<boolean> {
    setDeliveryOrderItems(getDeliveryOrderItems().filter(i => i.id !== id));
    return true;
  },
};

// ========== 采购订单明细 ==========
export const PurchaseOrderItemRepo = {
  async findAll(): Promise<PurchaseOrderItem[]> {
    return getPurchaseOrderItems();
  },
  async findById(id: string): Promise<PurchaseOrderItem | undefined> {
    return getPurchaseOrderItems().find(i => i.id === id);
  },
  async findByPurchaseOrderId(purchaseOrderId: string): Promise<PurchaseOrderItem[]> {
    return getPurchaseOrderItems().filter(i => i.采购订单id === purchaseOrderId);
  },
  async create(data: Omit<PurchaseOrderItem, 'id'>): Promise<PurchaseOrderItem> {
    const newItem = { ...data, id: String(Date.now()) } as PurchaseOrderItem;
    setPurchaseOrderItems([...getPurchaseOrderItems(), newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<PurchaseOrderItem>): Promise<PurchaseOrderItem | undefined> {
    const all = getPurchaseOrderItems();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setPurchaseOrderItems(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setPurchaseOrderItems(getPurchaseOrderItems().filter(i => i.id !== id));
    return true;
  },
  async deleteByPurchaseOrderId(purchaseOrderId: string): Promise<boolean> {
    setPurchaseOrderItems(getPurchaseOrderItems().filter(i => i.采购订单id !== purchaseOrderId));
    return true;
  },
};

// ========== 收货单 ==========
export const ReceivingOrderRepo = {
  async findAll(): Promise<ReceivingOrder[]> {
    return getReceivingOrders();
  },
  async findById(id: string): Promise<ReceivingOrder | undefined> {
    return getReceivingOrders().find(r => r.id === id);
  },
  async create(data: Omit<ReceivingOrder, 'id'>): Promise<ReceivingOrder> {
    const all = getReceivingOrders();
    if (all.find(r => r.单号 === data.单号)) throw new Error(`单号 "${data.单号}" 已存在`);
    const newItem = { ...data, id: String(Date.now()) } as ReceivingOrder;
    setReceivingOrders([...all, newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<ReceivingOrder>): Promise<ReceivingOrder | undefined> {
    const all = getReceivingOrders();
    const idx = all.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setReceivingOrders(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setReceivingOrders(getReceivingOrders().filter(r => r.id !== id));
    setReceivingOrderItems(getReceivingOrderItems().filter(i => i.收货单id !== id));
    return true;
  },
};

// ========== 收货单明细 ==========
export const ReceivingOrderItemRepo = {
  async findAll(): Promise<ReceivingOrderItem[]> {
    return getReceivingOrderItems();
  },
  async findByReceivingOrderId(receivingOrderId: string): Promise<ReceivingOrderItem[]> {
    return getReceivingOrderItems().filter(i => i.收货单id === receivingOrderId);
  },
  async create(data: Omit<ReceivingOrderItem, 'id'>): Promise<ReceivingOrderItem> {
    const newItem = { ...data, id: String(Date.now()) } as ReceivingOrderItem;
    setReceivingOrderItems([...getReceivingOrderItems(), newItem]);
    return newItem;
  },
  async delete(id: string): Promise<boolean> {
    setReceivingOrderItems(getReceivingOrderItems().filter(i => i.id !== id));
    return true;
  },
};

// ========== 员工 ==========
export const EmployeeRepo = {
  async findAll(): Promise<Employee[]> {
    return getEmployees();
  },
  async findById(id: string): Promise<Employee | undefined> {
    return getEmployees().find(e => e.id === id);
  },
  async create(data: Omit<Employee, 'id'>): Promise<Employee> {
    const all = getEmployees();
    const newItem = { ...data, id: String(Date.now()) } as Employee;
    setEmployees([...all, newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<Employee>): Promise<Employee | undefined> {
    const all = getEmployees();
    const idx = all.findIndex(e => e.id === id);
    if (idx === -1) return undefined;
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setEmployees(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setEmployees(getEmployees().filter(e => e.id !== id));
    return true;
  },
};

// ========== 销售发票 ==========
export const SalesInvoiceRepo = {
  async findAll(): Promise<SalesInvoice[]> {
    return getSalesInvoices();
  },
  async findById(id: string): Promise<SalesInvoice | undefined> {
    return getSalesInvoices().find(i => i.id === id);
  },
  async findBySalesOrderId(salesOrderId: string): Promise<SalesInvoice[]> {
    return getSalesInvoices().filter(i => i.关联销售订单ids.includes(salesOrderId));
  },
  async create(data: Omit<SalesInvoice, 'id'>): Promise<SalesInvoice> {
    const newItem = { ...data, id: String(Date.now()) } as SalesInvoice;
    setSalesInvoices([...getSalesInvoices(), newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<SalesInvoice>): Promise<SalesInvoice | undefined> {
    const all = getSalesInvoices();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setSalesInvoices(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setSalesInvoices(getSalesInvoices().filter(i => i.id !== id));
    return true;
  },
};

// ========== 采购发票 ==========
export const PurchaseInvoiceRepo = {
  async findAll(): Promise<PurchaseInvoice[]> {
    return getPurchaseInvoices();
  },
  async findById(id: string): Promise<PurchaseInvoice | undefined> {
    return getPurchaseInvoices().find(i => i.id === id);
  },
  async findByPurchaseOrderId(purchaseOrderId: string): Promise<PurchaseInvoice[]> {
    return getPurchaseInvoices().filter(i => i.关联采购订单ids.includes(purchaseOrderId));
  },
  async create(data: Omit<PurchaseInvoice, 'id'>): Promise<PurchaseInvoice> {
    const newItem = { ...data, id: String(Date.now()) } as PurchaseInvoice;
    setPurchaseInvoices([...getPurchaseInvoices(), newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<PurchaseInvoice>): Promise<PurchaseInvoice | undefined> {
    const all = getPurchaseInvoices();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setPurchaseInvoices(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setPurchaseInvoices(getPurchaseInvoices().filter(i => i.id !== id));
    return true;
  },
};

// ========== 账单 ==========
export const BillRepo = {
  async findAll(): Promise<Bill[]> {
    return getBills();
  },
  async findById(id: string): Promise<Bill | undefined> {
    return getBills().find(b => b.id === id);
  },
  async findByCustomer(customerName: string): Promise<Bill[]> {
    return getBills().filter(b => b.客户名称 === customerName);
  },
  async create(data: Omit<Bill, 'id'>): Promise<Bill> {
    const newItem = { ...data, id: String(Date.now()) } as Bill;
    setBills([...getBills(), newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<Bill>): Promise<Bill | undefined> {
    const all = getBills();
    const idx = all.findIndex(b => b.id === id);
    if (idx === -1) return undefined;
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setBills(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setBills(getBills().filter(b => b.id !== id));
    return true;
  },
};

// ========== 收款单 ==========
export const PaymentReceiptRepo = {
  async findAll(): Promise<PaymentReceipt[]> {
    return getPaymentReceipts();
  },
  async findById(id: string): Promise<PaymentReceipt | undefined> {
    return getPaymentReceipts().find(p => p.id === id);
  },
  async findBySalesOrderId(salesOrderId: string): Promise<PaymentReceipt[]> {
    return getPaymentReceipts().filter(p => p.关联销售订单ids.includes(salesOrderId));
  },
  async create(data: Omit<PaymentReceipt, 'id'>): Promise<PaymentReceipt> {
    const newItem = { ...data, id: String(Date.now()) } as PaymentReceipt;
    setPaymentReceipts([...getPaymentReceipts(), newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<PaymentReceipt>): Promise<PaymentReceipt | undefined> {
    const all = getPaymentReceipts();
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setPaymentReceipts(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setPaymentReceipts(getPaymentReceipts().filter(p => p.id !== id));
    return true;
  },
};

// ========== 付款单 ==========
export const PaymentMadeRepo = {
  async findAll(): Promise<PaymentMade[]> {
    return getPaymentMades();
  },
  async findById(id: string): Promise<PaymentMade | undefined> {
    return getPaymentMades().find(p => p.id === id);
  },
  async findByPurchaseOrderId(purchaseOrderId: string): Promise<PaymentMade[]> {
    return getPaymentMades().filter(p => p.关联采购订单ids.includes(purchaseOrderId));
  },
  async create(data: Omit<PaymentMade, 'id'>): Promise<PaymentMade> {
    const newItem = { ...data, id: String(Date.now()) } as PaymentMade;
    setPaymentMades([...getPaymentMades(), newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<PaymentMade>): Promise<PaymentMade | undefined> {
    const all = getPaymentMades();
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setPaymentMades(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setPaymentMades(getPaymentMades().filter(p => p.id !== id));
    return true;
  },
};

// ========== 报废单 ==========
export const ScrapOrderRepo = {
  async findAll(): Promise<ScrapOrder[]> {
    return getScrapOrders();
  },
  async findById(id: string): Promise<ScrapOrder | undefined> {
    return getScrapOrders().find(s => s.id === id);
  },
  async create(data: Omit<ScrapOrder, 'id'>): Promise<ScrapOrder> {
    const newItem = { ...data, id: String(Date.now()) } as ScrapOrder;
    setScrapOrders([...getScrapOrders(), newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<ScrapOrder>): Promise<ScrapOrder | undefined> {
    const all = getScrapOrders();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setScrapOrders(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setScrapOrders(getScrapOrders().filter(s => s.id !== id));
    return true;
  },
};

// ========== 生产工单 ==========
export const WorkOrderRepo = {
  async findAll(): Promise<WorkOrder[]> {
    if (USE_MOCK_DATA) return getWorkOrders();
    return await DataService.list(TABLE_IDS.workOrders) as WorkOrder[];
  },
  async findById(id: string): Promise<WorkOrder | undefined> {
    const all = await this.findAll();
    return all.find(w => w.id === id);
  },
  async findBySalesOrderId(salesOrderId: string): Promise<WorkOrder[]> {
    const all = await this.findAll();
    return all.filter(w => w.关联销售订单id === salesOrderId);
  },
  async create(data: Omit<WorkOrder, 'id'>): Promise<WorkOrder> {
    if (USE_MOCK_DATA) {
      const newItem = { ...data, id: String(Date.now()) } as WorkOrder;
      setWorkOrders([...getWorkOrders(), newItem]);
      return newItem;
    }
    await DataService.create(TABLE_IDS.workOrders, data);
    const updated = await this.findAll();
    return updated[updated.length - 1];
  },
  async update(id: string, data: Partial<WorkOrder>): Promise<WorkOrder | undefined> {
    if (USE_MOCK_DATA) {
      const all = getWorkOrders();
      const idx = all.findIndex(w => w.id === id);
      if (idx === -1) return undefined;
      const updated = [...all];
      updated[idx] = { ...updated[idx], ...data };
      setWorkOrders(updated);
      return updated[idx];
    }
    await DataService.update(TABLE_IDS.workOrders, id, data);
    return await this.findById(id);
  },
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      setWorkOrders(getWorkOrders().filter(w => w.id !== id));
      return true;
    }
    return await DataService.delete(TABLE_IDS.workOrders, id);
  },
};

// ========== 报工记录 ==========
export const JobReportRepo = {
  async findAll(): Promise<JobReport[]> {
    return getJobReports();
  },
  async findByWorkOrderId(workOrderId: string): Promise<JobReport[]> {
    return getJobReports().filter(j => j.工单id === workOrderId);
  },
  async create(data: Omit<JobReport, 'id'>): Promise<JobReport> {
    // 自动计算计件工资 = 报工数量 × 工序单价
    const wage = (data.报工数量 || 0) * (data.工序单价 || 0);
    const newItem = { ...data, id: String(Date.now()), 计件工资: wage, 状态: '待审核' as const } as JobReport;
    setJobReports([...getJobReports(), newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<JobReport>): Promise<JobReport | undefined> {
    const all = getJobReports();
    const idx = all.findIndex(j => j.id === id);
    if (idx === -1) return undefined;
    const updated = [...all];
    // 重新计算工资
    const quantity = data.报工数量 ?? all[idx].报工数量;
    const unitPrice = data.工序单价 ?? all[idx].工序单价;
    const wage = quantity * unitPrice;
    updated[idx] = { ...updated[idx], ...data, 计件工资: wage };
    setJobReports(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setJobReports(getJobReports().filter(j => j.id !== id));
    return true;
  },
  /**
   * 按工人+时间段汇总计件工资
   * 用于工资报表
   */
  async getWageSummary(startDate: string, endDate: string): Promise<Record<string, {
    worker: string;
    totalQuantity: number;
    totalWage: number;
    reports: JobReport[];
  }>> {
    const all = getJobReports().filter(r => {
      if (!r.报工日期) return false;
      return r.报工日期 >= startDate && r.报工日期 <= endDate && r.状态 !== '已作废';
    });
    const summary: Record<string, { worker: string; totalQuantity: number; totalWage: number; reports: JobReport[] }> = {};
    for (const r of all) {
      if (!summary[r.报工人]) {
        summary[r.报工人] = { worker: r.报工人, totalQuantity: 0, totalWage: 0, reports: [] };
      }
      summary[r.报工人].totalQuantity += r.报工数量;
      summary[r.报工人].totalWage += r.计件工资;
      summary[r.报工人].reports.push(r);
    }
    return summary;
  },
};

// ========== 刀板管理 ==========
export const CuttingDieRepo = {
  async findAll(): Promise<CuttingDie[]> {
    return getCuttingDies();
  },
  async findById(id: string): Promise<CuttingDie | undefined> {
    return getCuttingDies().find(d => d.id === id);
  },
  async create(data: Omit<CuttingDie, 'id'>): Promise<CuttingDie> {
    const all = getCuttingDies();
    if (all.find(d => d.code === data.code)) throw new Error(`刀板编号 "${data.code}" 已存在`);
    const newItem = { ...data, id: String(Date.now()) } as CuttingDie;
    setCuttingDies([...all, newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<CuttingDie>): Promise<CuttingDie | undefined> {
    const all = getCuttingDies();
    const idx = all.findIndex(d => d.id === id);
    if (idx === -1) return undefined;
    if (data.code && all.find(d => d.id !== id && d.code === data.code)) throw new Error(`刀板编号 "${data.code}" 已存在`);
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setCuttingDies(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setCuttingDies(getCuttingDies().filter(d => d.id !== id));
    return true;
  },
};

// ========== 稿件管理 ==========
export const ArtworkRepo = {
  async findAll(): Promise<Artwork[]> {
    return getArtworks();
  },
  async findById(id: string): Promise<Artwork | undefined> {
    return getArtworks().find(a => a.id === id);
  },
  async create(data: Omit<Artwork, 'id'>): Promise<Artwork> {
    const all = getArtworks();
    if (all.find(a => a.code === data.code)) throw new Error(`稿件编号 "${data.code}" 已存在`);
    const newItem = { ...data, id: String(Date.now()) } as Artwork;
    setArtworks([...all, newItem]);
    return newItem;
  },
  async update(id: string, data: Partial<Artwork>): Promise<Artwork | undefined> {
    const all = getArtworks();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    if (data.code && all.find(a => a.id !== id && a.code === data.code)) throw new Error(`稿件编号 "${data.code}" 已存在`);
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setArtworks(updated);
    return updated[idx];
  },
  async delete(id: string): Promise<boolean> {
    setArtworks(getArtworks().filter(a => a.id !== id));
    return true;
  },
};

// ========== 用户登录 ==========
export const UserRepo = {
  async findAll(): Promise<User[]> {
    return getUsers();
  },

  async findByUsername(username: string): Promise<User | undefined> {
    return getUsers().find(u => u.username === username);
  },

  async findById(id: string): Promise<User | undefined> {
    return getUsers().find(u => u.id === id);
  },

  async create(data: Omit<User, 'id'>): Promise<User> {
    if (getUsers().find(u => u.username === data.username)) {
      throw new Error(`用户名 "${data.username}" 已存在`);
    }
    const newUser = { ...data, id: String(Date.now()) } as User;
    setUsers([...getUsers(), newUser]);
    return newUser;
  },

  async update(id: string, data: Partial<User>): Promise<User | undefined> {
    const all = getUsers();
    const idx = all.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    if (data.username && all.find(u => u.id !== id && u.username === data.username)) {
      throw new Error(`用户名 "${data.username}" 已存在`);
    }
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setUsers(updated);
    return updated[idx];
  },

  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const all = getUsers();
    const idx = all.findIndex(u => u.id === id);
    if (idx === -1) return false;
    const updated = [...all];
    updated[idx] = { ...updated[idx], passwordHash };
    setUsers(updated);
    return true;
  },

  async delete(id: string): Promise<boolean> {
    setUsers(getUsers().filter(u => u.id !== id));
    return true;
  },
};

// ========== 审批流 ==========
export const ApprovalRepo = {
  async findAll(): Promise<Approval[]> {
    return getApprovals();
  },

  async findById(id: string): Promise<Approval | undefined> {
    return getApprovals().find(a => a.id === id);
  },

  async findByType(type: Approval['类型']): Promise<Approval[]> {
    return getApprovals().filter(a => a.类型 === type);
  },

  async findPending(approver: string): Promise<Approval[]> {
    return getApprovals().filter(a =>
      a.状态 === 'pending' &&
      a.节点列表.some(n => n.审批人 === approver && n.状态 === 'pending')
    );
  },

  async findBy关联单据id(关联单据id: string): Promise<Approval[]> {
    return getApprovals().filter(a => a.关联单据id ===关联单据id);
  },

  async create(data: Omit<Approval, 'id'>): Promise<Approval> {
    const newItem = { ...data, id: String(Date.now()) } as Approval;
    setApprovals([...getApprovals(), newItem]);
    return newItem;
  },

  async update(id: string, data: Partial<Approval>): Promise<Approval | undefined> {
    const all = getApprovals();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    const updated = [...all];
    updated[idx] = { ...updated[idx], ...data };
    setApprovals(updated);
    return updated[idx];
  },

  async approve(id: string, approver: string, 审批意见?: string): Promise<boolean> {
    const all = getApprovals();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return false;
    const approval = all[idx];
    const currentNode = approval.节点列表[approval.当前节点];
    if (!currentNode || currentNode.审批人 !== approver) return false;

    // 更新当前节点
    currentNode.状态 = 'approved';
    currentNode.审批时间 = new Date().toISOString().slice(0, 10);
    currentNode.审批意见 = 审批意见;

    // 移动到下一节点或完成
    const nextNodeIdx = approval.当前节点 + 1;
    if (nextNodeIdx >= approval.节点列表.length) {
      // 全部审批完成
      approval.状态 = 'approved';
      approval.完成时间 = new Date().toISOString().slice(0, 10);
    } else {
      approval.当前节点 = nextNodeIdx;
    }

    setApprovals([...all]);
    return true;
  },

  async reject(id: string, approver: string, 审批意见?: string): Promise<boolean> {
    const all = getApprovals();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return false;
    const approval = all[idx];
    const currentNode = approval.节点列表[approval.当前节点];
    if (!currentNode || currentNode.审批人 !== approver) return false;

    currentNode.状态 = 'rejected';
    currentNode.审批时间 = new Date().toISOString().slice(0, 10);
    currentNode.审批意见 = 审批意见;
    approval.状态 = 'rejected';
    approval.完成时间 = new Date().toISOString().slice(0, 10);

    setApprovals([...all]);
    return true;
  },

  async withdraw(id: string): Promise<boolean> {
    const all = getApprovals();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return false;
    const approval = all[idx];
    if (approval.状态 !== 'pending' && approval.状态 !== 'draft') return false;
    approval.状态 = 'withdrawn';
    setApprovals([...all]);
    return true;
  },

  async submit(id: string): Promise<boolean> {
    const all = getApprovals();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return false;
    const approval = all[idx];
    if (approval.状态 !== 'draft') return false;
    approval.状态 = 'pending';
    approval.申请时间 = new Date().toISOString().slice(0, 10);
    setApprovals([...all]);
    return true;
  },

  async delete(id: string): Promise<boolean> {
    setApprovals(getApprovals().filter(a => a.id !== id));
    return true;
  },
};
