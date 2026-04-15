// 客户
export interface Customer {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  remark: string;
}

// 供应商
export interface Vendor {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  remark: string;
}

// 物料
export interface Material {
  id: string;
  code: string;
  name: string;
  spec: string;
  unit: string;
  category: '纸张' | '油墨' | '覆膜材料' | '辅料' | '其他';
  remark: string;
}

// 产品
export interface Product {
  id: string;
  code: string;
  name: string;
  spec: string;
  customer: string;
  sheetSize: number;
  remark: string;
}

// 工艺
export interface Process {
  id: string;
  name: string;
  unitPrice: number;
  outsource: boolean;
  remark: string;
}

// 工序
export interface Workstation {
  id: string;
  name: string;
  sequence: number;
  outsource: boolean;
  remark: string;
}
