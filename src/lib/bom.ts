/**
 * BOM物料清单模块 (Bill of Materials)
 * 
 * BOM用于定义产品所需的原材料、辅料和工艺路线
 */

import { Product, Material } from './types';

// BOM项：生产一个产品所需的物料
export interface BOMItem {
  id: string;
  productId: string;        // 产品ID
  productCode: string;      // 产品编号（货号）
  materialId: string;       // 物料ID
  materialCode: string;    // 物料编号
  materialName: string;    // 物料名称
  quantity: number;         // 用量（生产一个单位产品所需）
  unit: string;            // 单位
  isOptional: boolean;      // 是否可选物料
  remark?: string;          // 备注
  lossRate?: number;        // 损耗率（百分比）
}

// BOM组成
export interface BOM {
  id: string;
  productId: string;        // 产品ID
  productCode: string;      // 产品编号
  productName: string;     // 产品名称
  version: string;          // 版本号
  effectiveDate: string;    // 生效日期
  status: 'draft' | 'active' | 'archived';
  items: BOMItem[];         // BOM项列表
  totalCost: number;       // BOM总成本（材料成本合计）
  remark?: string;
  createdBy?: string;
  createdAt?: string;
}

/**
 * 计算BOM物料成本
 */
export function calculateBOMCost(bom: BOM): number {
  return bom.items.reduce((total, item) => {
    const qty = item.quantity * (1 + (item.lossRate || 0) / 100);
    return total + qty; // 假设物料单价为1，实际从物料表获取
  }, 0);
}

/**
 * 根据生产数量计算物料需求
 */
export interface MaterialRequirement {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  requiredQty: number;      // 需求数量（含损耗）
  availableQty: number;     // 可用库存
  shortageQty: number;      // 缺口数量
  isEnough: boolean;
}

export function calculateMaterialRequirements(
  bom: BOM,
  productionQty: number,
  inventoryMap: Map<string, number> // 物料ID -> 库存数量
): MaterialRequirement[] {
  return bom.items.map(item => {
    // 计算需求数量（含损耗）
    const lossRate = item.lossRate || 0;
    const requiredQty = productionQty * item.quantity * (1 + lossRate / 100);
    
    // 获取库存
    const availableQty = inventoryMap.get(item.materialId) || 0;
    const shortageQty = Math.max(0, requiredQty - availableQty);
    
    return {
      materialId: item.materialId,
      materialCode: item.materialCode,
      materialName: item.materialName,
      unit: item.unit,
      requiredQty: Math.round(requiredQty * 1000) / 1000, // 保留3位小数
      availableQty,
      shortageQty: Math.round(shortageQty * 1000) / 1000,
      isEnough: availableQty >= requiredQty,
    };
  });
}

/**
 * BOM层级结构（多级BOM支持）
 */
export interface BOMTreeNode {
  item: BOMItem;
  children: BOMTreeNode[];
  level: number;
}
