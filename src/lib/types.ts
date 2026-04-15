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

// 销售订单
export interface SalesOrder {
  id: string;
  单号: string;
  客户名称: string;
  日期: string;
  合同金额: number;
  已送货: number;
  未收款项: number;
  已收款: number;
  收款状态: '未收款' | '部分收款' | '全部收款';
  送货状态: '未送货' | '部分送货' | '全部送货';
  制单人: string;
  业务员: string;
  计划收款日期: string;
  备注: string;
}

// 采购订单
export interface PurchaseOrder {
  id: string;
  单号: string;
  供应商名称: string;
  日期: string;
  合同金额: number;
  已收货: number;
  未付款: number;
  已付款: number;
  付款状态: '未付款' | '部分付款' | '全部付款';
  收货状态: '未收货' | '部分收货' | '全部收货';
  制单人: string;
  业务员: string;
  计划付款日期: string;
  收货地址: string;
  备注: string;
}

// 库存
export interface Inventory {
  id: string;
  产品名称: string;
  货号: string;
  分类: '原材料' | '成品' | '半成品' | '辅料';
  单位: string;
  当前库存: number;
  安全库存: number;
  采购在途: number;
  销售在途: number;
  备注: string;
}
