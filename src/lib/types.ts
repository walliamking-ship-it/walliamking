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
  参考进价?: number;
  参考售价?: number;
}

// ========== 销售订单明细 ==========
export interface SalesOrderItem {
  id: string;
  销售订单id: string;
  销售订单号: string;
  序号: number;
  产品id: string;
  产品名称: string;
  物料编码: string;
  规格: string;
  单位: string;
  单价: number;
  数量: number;
  金额: number;
  已送货数量: number;
  备注: string;
}

// ========== 送货单 ==========
export interface DeliveryOrder {
  id: string;
  单号: string;
  销售订单id: string;
  销售订单号: string;
  发货日期: string;
  收货人: string;
  联系电话: string;
  发货仓库: string;
  车牌号: string;
  备注: string;
  状态: '未完成' | '部分收货' | '已完成';
  制单人: string;
  创建时间: string;
}

// ========== 送货单明细 ==========
export interface DeliveryOrderItem {
  id: string;
  送货单id: string;
  送货单号: string;
  销售订单明细id: string;
  销售订单号: string;
  产品名称: string;
  规格: string;
  单位: string;
  本次送货数量: number;
  备注: string;
}

// ========== 采购订单明细 ==========
export interface PurchaseOrderItem {
  id: string;
  采购订单id: string;
  采购订单号: string;
  序号: number;
  产品id: string;
  产品名称: string;
  物料编码: string;
  规格: string;
  单位: string;
  单价: number;
  数量: number;
  金额: number;
  已收货数量: number;
  备注: string;
}

// ========== 收货单 ==========
export interface ReceivingOrder {
  id: string;
  单号: string;
  采购订单id: string;
  采购订单号: string;
  收货日期: string;
  收货人: string;
  联系电话: string;
  收货仓库: string;
  车牌号: string;
  备注: string;
  状态: '未完成' | '部分收货' | '已完成';
  制单人: string;
  创建时间: string;
}

// ========== 仓库 ==========
export interface Warehouse {
  id: string;
  name: string;
  remark: string;
}

// ========== 收货单明细 ==========
export interface ReceivingOrderItem {
  id: string;
  收货单id: string;
  收货单号: string;
  采购订单明细id: string;
  采购订单号: string;
  产品名称: string;
  规格: string;
  单位: string;
  本次收货数量: number;
  备注: string;
}

// ========== 发票类型 ==========
export type InvoiceType = '销售发票' | '采购发票';
export type InvoiceStatus = '未开' | '已开' | '已收票' | '已作废';

// ========== 销售发票 ==========
export interface SalesInvoice {
  id: string;
  单号: string;
  发票号: string;
  开票日期: string;
  客户名称: string;
  关联销售订单ids: string[];
  金额: number;
  税率: number;
  税额: number;
  状态: InvoiceStatus;
  备注: string;
  制单人: string;
}

// ========== 采购发票 ==========
export interface PurchaseInvoice {
  id: string;
  单号: string;
  发票号: string;
  开票日期: string;
  供应商名称: string;
  关联采购订单ids: string[];
  金额: number;
  税率: number;
  税额: number;
  状态: InvoiceStatus;
  备注: string;
  制单人: string;
}

// ========== 员工 ==========
export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: '正常' | '停用';
  roleKey: RoleKey;
}

// ========== 权限小项 ==========
export type Permission =
  | 'customer:view' | 'customer:create' | 'customer:edit' | 'customer:delete'
  | 'vendor:view' | 'vendor:create' | 'vendor:edit' | 'vendor:delete'
  | 'product:view' | 'product:create' | 'product:edit' | 'product:delete'
  | 'sales:view' | 'sales:create' | 'sales:edit' | 'sales:delete' | 'sales:approve'
  | 'purchase:view' | 'purchase:create' | 'purchase:edit' | 'purchase:delete' | 'purchase:approve'
  | 'delivery:view' | 'delivery:create' | 'delivery:edit' | 'delivery:delete'
  | 'receiving:view' | 'receiving:create' | 'receiving:edit' | 'receiving:delete'
  | 'inventory:view' | 'inventory:edit'
  | 'invoice:view' | 'invoice:create' | 'invoice:edit' | 'invoice:delete'
  | 'bill:view' | 'bill:create' | 'bill:edit' | 'bill:delete'
  | 'receipt:view' | 'receipt:create' | 'receipt:edit' | 'receipt:delete'
  | 'payment:view' | 'payment:create' | 'payment:edit' | 'payment:delete'
  | 'scrap:view' | 'scrap:create' | 'scrap:edit' | 'scrap:delete' | 'scrap:approve'
  | 'workorder:view' | 'workorder:create' | 'workorder:edit' | 'workorder:delete'
  | 'jobreport:view' | 'jobreport:create' | 'jobreport:edit'
  | 'report:view' | 'report:export'
  | 'settings:view' | 'settings:edit'
  | 'employee:view' | 'employee:create' | 'employee:edit' | 'employee:delete';

// ========== 角色Key ==========
export type RoleKey = 'owner' | 'admin' | 'sales_director' | 'sales' | 'purchase' | 'warehouse' | 'finance' | 'viewer';

// ========== 角色定义 ==========
export interface Role {
  key: RoleKey;
  name: string;
  permissions: Permission[];
  description: string;
}

// 预定义角色（参考秒账）
export const ROLES: Role[] = [
  {
    key: 'owner',
    name: '老板',
    description: '拥有系统所有权限，可管理所有模块',
    permissions: [
      'customer:view', 'customer:create', 'customer:edit', 'customer:delete',
      'vendor:view', 'vendor:create', 'vendor:edit', 'vendor:delete',
      'product:view', 'product:create', 'product:edit', 'product:delete',
      'sales:view', 'sales:create', 'sales:edit', 'sales:delete', 'sales:approve',
      'purchase:view', 'purchase:create', 'purchase:edit', 'purchase:delete', 'purchase:approve',
      'delivery:view', 'delivery:create', 'delivery:edit', 'delivery:delete',
      'receiving:view', 'receiving:create', 'receiving:edit', 'receiving:delete',
      'inventory:view', 'inventory:edit',
      'invoice:view', 'invoice:create', 'invoice:edit', 'invoice:delete',
      'report:view', 'report:export',
      'settings:view', 'settings:edit',
      'employee:view', 'employee:create', 'employee:edit', 'employee:delete',
    ],
  },
  {
    key: 'admin',
    name: '管理员',
    description: '拥有除系统设置外的所有权限',
    permissions: [
      'customer:view', 'customer:create', 'customer:edit', 'customer:delete',
      'vendor:view', 'vendor:create', 'vendor:edit', 'vendor:delete',
      'product:view', 'product:create', 'product:edit', 'product:delete',
      'sales:view', 'sales:create', 'sales:edit', 'sales:delete', 'sales:approve',
      'purchase:view', 'purchase:create', 'purchase:edit', 'purchase:delete', 'purchase:approve',
      'delivery:view', 'delivery:create', 'delivery:edit', 'delivery:delete',
      'receiving:view', 'receiving:create', 'receiving:edit', 'receiving:delete',
      'inventory:view', 'inventory:edit',
      'invoice:view', 'invoice:create', 'invoice:edit', 'invoice:delete',
      'report:view', 'report:export',
      'settings:view',
      'employee:view', 'employee:create', 'employee:edit', 'employee:delete',
    ],
  },
  {
    key: 'sales_director',
    name: '销售主管',
    description: '客户/产品/销售/送货/报表的查看+新建+编辑（无删除）',
    permissions: [
      'customer:view', 'customer:create', 'customer:edit',
      'product:view', 'product:create', 'product:edit',
      'sales:view', 'sales:create', 'sales:edit',
      'delivery:view', 'delivery:create', 'delivery:edit',
      'invoice:view',
      'report:view', 'report:export',
    ],
  },
  {
    key: 'sales',
    name: '业务员',
    description: '查看和管理自己创建的客户/销售单/送货单',
    permissions: [
      'customer:view', 'customer:create', 'customer:edit',
      'product:view',
      'sales:view', 'sales:create', 'sales:edit',
      'delivery:view', 'delivery:create', 'delivery:edit',
      'invoice:view',
      'report:view',
    ],
  },
  {
    key: 'purchase',
    name: '采购人员',
    description: '供应商/采购/收货管理',
    permissions: [
      'vendor:view', 'vendor:create', 'vendor:edit',
      'product:view',
      'purchase:view', 'purchase:create', 'purchase:edit',
      'receiving:view', 'receiving:create', 'receiving:edit',
      'invoice:view', 'invoice:create',
      'report:view',
    ],
  },
  {
    key: 'warehouse',
    name: '仓管人员',
    description: '库存/入库/出库管理',
    permissions: [
      'product:view',
      'inventory:view', 'inventory:edit',
      'delivery:view', 'delivery:create', 'delivery:edit',
      'receiving:view', 'receiving:create', 'receiving:edit',
      'report:view',
    ],
  },
  {
    key: 'finance',
    name: '财务',
    description: '所有订单+发票+收款付款',
    permissions: [
      'customer:view',
      'vendor:view',
      'product:view',
      'sales:view', 'sales:edit',
      'purchase:view', 'purchase:edit',
      'delivery:view',
      'receiving:view',
      'inventory:view',
      'invoice:view', 'invoice:create', 'invoice:edit', 'invoice:delete',
      'report:view', 'report:export',
    ],
  },
  {
    key: 'viewer',
    name: '查看者',
    description: '仅查看数据，无编辑权限',
    permissions: [
      'customer:view', 'vendor:view', 'product:view',
      'sales:view', 'purchase:view',
      'delivery:view', 'receiving:view',
      'inventory:view',
      'invoice:view',
      'report:view',
    ],
  },
];

// ========== 账单 ==========
export interface Bill {
  id: string;
  单号: string;
  账单类型: '月度账单' | '自定义账单';
  客户名称: string;
  账期: string;
  开始日期: string;
  结束日期: string;
  关联销售订单ids: string[];
  应收金额: number;
  已收金额: number;
  未收金额: number;
  状态: '未结清' | '部分结清' | '已结清';
  备注: string;
  制单人: string;
  创建时间: string;
}

// ========== 收款单 ==========
export interface PaymentReceipt {
  id: string;
  单号: string;
  收款日期: string;
  客户名称: string;
  关联销售订单ids: string[];
  收款方式: '现金' | '银行转账' | '微信' | '支付宝' | '其他';
  收款金额: number;
  备注: string;
  状态: '未确认' | '已确认';
  制单人: string;
}

// ========== 付款单 ==========
export interface PaymentMade {
  id: string;
  单号: string;
  付款日期: string;
  供应商名称: string;
  关联采购订单ids: string[];
  付款方式: '现金' | '银行转账' | '微信' | '支付宝' | '其他';
  付款金额: number;
  备注: string;
  状态: '未确认' | '已确认';
  制单人: string;
}

// ========== 报废单 ==========
export interface ScrapOrder {
  id: string;
  单号: string;
  报废日期: string;
  仓库: string;
  关联销售订单id?: string;
  关联采购订单id?: string;
  关联库存id: string;
  产品名称: string;
  物料编码: string;
  规格: string;
  报废数量: number;
  单位: string;
  报废原因: string;
  报废金额: number;
  状态: '待审批' | '已审批' | '已处理';
  备注: string;
  制单人: string;
  审批人: string;
  创建时间: string;
}

// ========== 生产工单工序 ==========
export interface WorkOrderProcess {
  序号: number;
  工序名称: string;
  执行单位: string;
  计划数量: number;
  已完成数量: number;
  状态: '待报工' | '报工中' | '已完成';
  报工时间?: string;
  报工人?: string;
  备注?: string;
}

// ========== 生产工单 ==========
export interface WorkOrder {
  id: string;
  单号: string;
  关联销售订单id?: string;
  关联销售订单号?: string;
  产品名称: string;
  物料编码: string;
  规格: string;
  单位: string;
  计划数量: number;
  已完成数量: number;
  生产单位: 'internal' | 'external';
  执行单位: string;
  工序列表: WorkOrderProcess[];
  状态: '待生产' | '生产中' | '已完成' | '已入库';
  计划开始日期: string;
  计划完成日期: string;
  实际开始日期?: string;
  实际完成日期?: string;
  备注: string;
  制单人: string;
  创建时间: string;
}

// ========== 报工记录 ==========
export interface JobReport {
  id: string;
  单号: string;
  工单id: string;
  工单号: string;
  工序序号: number;
  工序名称: string;
  执行单位: string;
  报工数量: number;
  报工日期: string;
  报工人: string;
  合格率?: number;
  不良数量?: number;
  备注: string;
  创建时间: string;
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
