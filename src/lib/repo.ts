/**
 * 数据仓储层 - 调用本地API路由
 * 路由代理飞书Bitable API，避免跨域问题
 */

import {
  Customer, Vendor, Material, Product, Process, Workstation
} from './types';

const BASE = '';

// ========== 客户 ==========
export const CustomerRepo = {
  async findAll(): Promise<Customer[]> {
    const res = await fetch(`${BASE}/api/customers`);
    const d = await res.json();
    return d.code === 0 ? d.data : [];
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
    const res = await fetch(`${BASE}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const d = await res.json();
    if (d.code !== 0) throw new Error(d.msg || 'create failed');
    return d.data;
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer | undefined> {
    const all = await this.findAll();
    if (all.find(c => c.id !== id && data.code && c.code === data.code)) {
      throw new Error(`客户编号 "${data.code}" 已存在`);
    }
    const res = await fetch(`${BASE}/api/customers`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });
    const d = await res.json();
    if (d.code !== 0) throw new Error(d.msg || 'update failed');
    return d.data;
  },

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${BASE}/api/customers?id=${id}`, { method: 'DELETE' });
    const d = await res.json();
    return d.code === 0;
  },
};

// ========== 供应商 ==========
export const VendorRepo = {
  async findAll(): Promise<Vendor[]> {
    const res = await fetch(`${BASE}/api/vendors`);
    const d = await res.json();
    return d.code === 0 ? d.data : [];
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
    const res = await fetch(`${BASE}/api/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const d = await res.json();
    if (d.code !== 0) throw new Error(d.msg || 'create failed');
    return d.data;
  },

  async update(id: string, data: Partial<Vendor>): Promise<Vendor | undefined> {
    const all = await this.findAll();
    if (all.find(v => v.id !== id && data.code && v.code === data.code)) {
      throw new Error(`供应商编号 "${data.code}" 已存在`);
    }
    const res = await fetch(`${BASE}/api/vendors`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });
    const d = await res.json();
    if (d.code !== 0) throw new Error(d.msg || 'update failed');
    return d.data;
  },

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${BASE}/api/vendors?id=${id}`, { method: 'DELETE' });
    const d = await res.json();
    return d.code === 0;
  },
};

// ========== 物料 ==========
export const MaterialRepo = {
  async findAll(): Promise<Material[]> {
    const res = await fetch(`${BASE}/api/materials`);
    const d = await res.json();
    return d.code === 0 ? d.data : [];
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
    const res = await fetch(`${BASE}/api/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const d = await res.json();
    if (d.code !== 0) throw new Error(d.msg || 'create failed');
    return d.data;
  },

  async update(id: string, data: Partial<Material>): Promise<Material | undefined> {
    const all = await this.findAll();
    if (all.find(m => m.id !== id && data.code && m.code === data.code)) {
      throw new Error(`物料编号 "${data.code}" 已存在`);
    }
    const res = await fetch(`${BASE}/api/materials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });
    const d = await res.json();
    if (d.code !== 0) throw new Error(d.msg || 'update failed');
    return d.data;
  },

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${BASE}/api/materials?id=${id}`, { method: 'DELETE' });
    const d = await res.json();
    return d.code === 0;
  },
};

// ========== 产品 ==========
export const ProductRepo = {
  async findAll(): Promise<Product[]> {
    const res = await fetch(`${BASE}/api/products`);
    const d = await res.json();
    return d.code === 0 ? d.data : [];
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
    const res = await fetch(`${BASE}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const d = await res.json();
    if (d.code !== 0) throw new Error(d.msg || 'create failed');
    return d.data;
  },

  async update(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const all = await this.findAll();
    if (all.find(p => p.id !== id && data.code && p.code === data.code)) {
      throw new Error(`产品编号 "${data.code}" 已存在`);
    }
    const res = await fetch(`${BASE}/api/products`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });
    const d = await res.json();
    if (d.code !== 0) throw new Error(d.msg || 'update failed');
    return d.data;
  },

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${BASE}/api/products?id=${id}`, { method: 'DELETE' });
    const d = await res.json();
    return d.code === 0;
  },
};

// ========== 工艺 ==========
export const ProcessRepo = {
  async findAll(): Promise<Process[]> {
    const res = await fetch(`${BASE}/api/processes`);
    const d = await res.json();
    return d.code === 0 ? d.data : [];
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
    const res = await fetch(`${BASE}/api/processes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const d = await res.json();
    if (d.code !== 0) throw new Error(d.msg || 'create failed');
    return d.data;
  },

  async update(id: string, data: Partial<Process>): Promise<Process | undefined> {
    const all = await this.findAll();
    if (all.find(p => p.id !== id && data.name && p.name === data.name)) {
      throw new Error(`工艺名称 "${data.name}" 已存在`);
    }
    const res = await fetch(`${BASE}/api/processes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });
    const d = await res.json();
    if (d.code !== 0) throw new Error(d.msg || 'update failed');
    return d.data;
  },

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${BASE}/api/processes?id=${id}`, { method: 'DELETE' });
    const d = await res.json();
    return d.code === 0;
  },
};

// ========== 工序 ==========
export const WorkstationRepo = {
  async findAll(): Promise<Workstation[]> {
    const res = await fetch(`${BASE}/api/workstations`);
    const d = await res.json();
    return d.code === 0 ? d.data : [];
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
    const res = await fetch(`${BASE}/api/workstations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const d = await res.json();
    if (d.code !== 0) throw new Error(d.msg || 'create failed');
    return d.data;
  },

  async update(id: string, data: Partial<Workstation>): Promise<Workstation | undefined> {
    const all = await this.findAll();
    if (all.find(w => w.id !== id && data.name && w.name === data.name)) {
      throw new Error(`工序名称 "${data.name}" 已存在`);
    }
    const res = await fetch(`${BASE}/api/workstations`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });
    const d = await res.json();
    if (d.code !== 0) throw new Error(d.msg || 'update failed');
    return d.data;
  },

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${BASE}/api/workstations?id=${id}`, { method: 'DELETE' });
    const d = await res.json();
    return d.code === 0;
  },
};
