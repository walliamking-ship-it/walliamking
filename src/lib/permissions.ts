/**
 * 权限工具函数
 * 用于检查和获取用户角色权限
 */

import { Permission, RoleKey, ROLES } from './types';

/**
 * 检查指定角色是否拥有某项权限
 */
export function hasPermission(role: RoleKey, permission: Permission): boolean {
  const roleData = ROLES.find(r => r.key === role);
  if (!roleData) return false;
  return roleData.permissions.includes(permission);
}

/**
 * 获取指定角色的所有权限列表
 */
export function getRolePermissions(role: RoleKey): Permission[] {
  const roleData = ROLES.find(r => r.key === role);
  return roleData?.permissions || [];
}

/**
 * 获取所有权限项（去重，按group分组）
 */
export function getAllPermissions(): { key: Permission; label: string; group: string }[] {
  return [
    // 客户
    { key: 'customer:view', label: '查看', group: '客户' },
    { key: 'customer:create', label: '新建', group: '客户' },
    { key: 'customer:edit', label: '编辑', group: '客户' },
    { key: 'customer:delete', label: '删除', group: '客户' },
    // 供应商
    { key: 'vendor:view', label: '查看', group: '供应商' },
    { key: 'vendor:create', label: '新建', group: '供应商' },
    { key: 'vendor:edit', label: '编辑', group: '供应商' },
    { key: 'vendor:delete', label: '删除', group: '供应商' },
    // 产品
    { key: 'product:view', label: '查看', group: '产品' },
    { key: 'product:create', label: '新建', group: '产品' },
    { key: 'product:edit', label: '编辑', group: '产品' },
    { key: 'product:delete', label: '删除', group: '产品' },
    // 销售订单
    { key: 'sales:view', label: '查看', group: '销售订单' },
    { key: 'sales:create', label: '新建', group: '销售订单' },
    { key: 'sales:edit', label: '编辑', group: '销售订单' },
    { key: 'sales:delete', label: '删除', group: '销售订单' },
    { key: 'sales:approve', label: '审批', group: '销售订单' },
    // 采购订单
    { key: 'purchase:view', label: '查看', group: '采购订单' },
    { key: 'purchase:create', label: '新建', group: '采购订单' },
    { key: 'purchase:edit', label: '编辑', group: '采购订单' },
    { key: 'purchase:delete', label: '删除', group: '采购订单' },
    { key: 'purchase:approve', label: '审批', group: '采购订单' },
    // 送货单
    { key: 'delivery:view', label: '查看', group: '送货单' },
    { key: 'delivery:create', label: '新建', group: '送货单' },
    { key: 'delivery:edit', label: '编辑', group: '送货单' },
    { key: 'delivery:delete', label: '删除', group: '送货单' },
    // 收货单
    { key: 'receiving:view', label: '查看', group: '收货单' },
    { key: 'receiving:create', label: '新建', group: '收货单' },
    { key: 'receiving:edit', label: '编辑', group: '收货单' },
    { key: 'receiving:delete', label: '删除', group: '收货单' },
    // 库存
    { key: 'inventory:view', label: '查看', group: '库存' },
    { key: 'inventory:edit', label: '编辑', group: '库存' },
    // 发票
    { key: 'invoice:view', label: '查看', group: '发票' },
    { key: 'invoice:create', label: '新建', group: '发票' },
    { key: 'invoice:edit', label: '编辑', group: '发票' },
    { key: 'invoice:delete', label: '删除', group: '发票' },
    // 账单
    { key: 'bill:view', label: '查看', group: '账单' },
    { key: 'bill:create', label: '新建', group: '账单' },
    { key: 'bill:edit', label: '编辑', group: '账单' },
    { key: 'bill:delete', label: '删除', group: '账单' },
    // 收款单
    { key: 'receipt:view', label: '查看', group: '收款单' },
    { key: 'receipt:create', label: '新建', group: '收款单' },
    { key: 'receipt:edit', label: '编辑', group: '收款单' },
    { key: 'receipt:delete', label: '删除', group: '收款单' },
    // 付款单
    { key: 'payment:view', label: '查看', group: '付款单' },
    { key: 'payment:create', label: '新建', group: '付款单' },
    { key: 'payment:edit', label: '编辑', group: '付款单' },
    { key: 'payment:delete', label: '删除', group: '付款单' },
    // 报废
    { key: 'scrap:view', label: '查看', group: '报废管理' },
    { key: 'scrap:create', label: '新建', group: '报废管理' },
    { key: 'scrap:edit', label: '编辑', group: '报废管理' },
    { key: 'scrap:delete', label: '删除', group: '报废管理' },
    { key: 'scrap:approve', label: '审批', group: '报废管理' },
    // 生产工单
    { key: 'workorder:view', label: '查看', group: '生产工单' },
    { key: 'workorder:create', label: '新建', group: '生产工单' },
    { key: 'workorder:edit', label: '编辑', group: '生产工单' },
    { key: 'workorder:delete', label: '删除', group: '生产工单' },
    // 报工记录
    { key: 'jobreport:view', label: '查看', group: '报工记录' },
    { key: 'jobreport:create', label: '新建', group: '报工记录' },
    { key: 'jobreport:edit', label: '编辑', group: '报工记录' },
    // 报表
    { key: 'report:view', label: '查看', group: '报表' },
    { key: 'report:export', label: '导出', group: '报表' },
    // 系统设置
    { key: 'settings:view', label: '查看', group: '系统设置' },
    { key: 'settings:edit', label: '编辑', group: '系统设置' },
    // 员工管理
    { key: 'employee:view', label: '查看', group: '员工管理' },
    { key: 'employee:create', label: '新建', group: '员工管理' },
    { key: 'employee:edit', label: '编辑', group: '员工管理' },
    { key: 'employee:delete', label: '删除', group: '员工管理' },
  ];
}
