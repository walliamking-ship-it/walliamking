// ========== 客户 ==========
export interface Customer {
  id: string;
  code: string;      // 客户编号
  name: string;      // 客户名称
  contact: string;   // 联系人
  phone: string;     // 电话
  address: string;   // 地址
  remark: string;    // 备注
}

// ========== 供应商 ==========
export interface Vendor {
  id: string;
  code: string;      // 供应商编号
  name: string;      // 供应商名称
  contact: string;   // 联系人
  phone: string;     // 电话
  address: string;   // 地址
  remark: string;    // 备注
}

// ========== 物料 ==========
export interface Material {
  id: string;
  code: string;      // 物料编号
  name: string;      // 物料名称
  spec: string;      // 规格型号
  unit: string;      // 单位
  category: string;  // 分类
  remark: string;    // 备注
}

// ========== 产品 ==========
export interface Product {
  id: string;
  code: string;      // 产品编号（货号）
  name: string;      // 产品名称
  spec: string;      // 规格型号
  unit: string;      // 单位
  category: string;  // 产品分类
  customer: string;  // 客户
  purchasePrice: number; // 进价
  salePrice: number;    // 售价
  remark: string;    // 备注
}

// ========== 工艺 ==========
export interface Process {
  id: string;
  name: string;      // 工艺名称
  unitPrice: number; // 单价
  outsource: boolean; // 是否委外
  remark: string;    // 备注
}

// ========== 工序 ==========
export interface Workstation {
  id: string;
  name: string;      // 工序名称
  sequence: number;  // 顺序
  outsource: boolean; // 是否委外
  remark: string;    // 备注
}

// ========== 销售订单 ==========
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
  // 详情页扩展字段
  送货地址?: string;
  仓库?: string;
  整单折扣?: number;
  优惠金额?: number;
  送货日期?: string;
  云仓状态?: string;
  总箱数?: number;
  总体积?: number;
  总重量?: number;
}

// ========== 采购订单 ==========
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

// ========== 库存 ==========
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

// ========== 加工单 ==========
export interface ProcessingOrder {
  id: string;
  单号: string;
  加工公司: string;
  加工工序: string;
  日期: string;
  计划入库日期: string;
  实际应付: number;
  已收货: number;
  未付款: number;
  已付款: number;
  付款状态: '未付款' | '部分付款' | '全部付款';
  收货状态: '未收货' | '部分收货' | '全部收货';
  制单人: string;
  业务员: string;
  备注: string;
  加工地址: string;
  云仓状态: string;
  总箱数: number;
  总体积: number;
  总重量: number;
  入库状态: string;
  出库状态: string;
}
