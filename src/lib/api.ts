/**
 * 数据服务层 - 调用实体API（绕过proxy认证问题）
 */

import { TABLE_IDS } from './tableIds';

// 反向映射：tableId → entity名称
const TABLE_TO_ENTITY: Record<string, string> = Object.fromEntries(
  Object.entries(TABLE_IDS).map(([k, v]) => [v, k])
);

// 实体名称（camelCase转kebab-case）
function toKebab(name: string): string {
  return name.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// 客户端数据服务 - 直接调用实体API（无需认证）
export const DataService = {
  async list(tableId: string): Promise<any[]> {
    const entity = TABLE_TO_ENTITY[tableId];
    if (!entity) {
      console.error('Unknown tableId:', tableId);
      return [];
    }
    const res = await fetch(`/api/${toKebab(entity)}`);
    const data = await res.json();
    if (data.code === 0) return data.data || [];
    if (data.code === 401) return []; // 未登录时返回空，不报错
    console.error('DataService.list error:', data);
    return [];
  },

  async create(tableId: string, fields: Record<string, unknown>): Promise<{ success: boolean; id?: string; error?: string }> {
    const entity = TABLE_TO_ENTITY[tableId];
    if (!entity) return { success: false, error: 'Unknown tableId' };
    try {
      const res = await fetch(`/api/${toKebab(entity)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      const data = await res.json();
      if (data.code === 0) return { success: true, id: data.data?.id };
      return { success: false, error: data.msg || 'Create failed' };
    } catch (e: any) {
      console.error('DataService.create error:', e);
      return { success: false, error: e?.message || 'Network error' };
    }
  },

  async update(tableId: string, recordId: string, fields: Record<string, unknown>): Promise<boolean> {
    const entity = TABLE_TO_ENTITY[tableId];
    if (!entity) return false;
    const res = await fetch(`/api/${toKebab(entity)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: recordId, ...fields })
    });
    const data = await res.json();
    return data.code === 0;
  },

  async delete(tableId: string, recordId: string): Promise<boolean> {
    const entity = TABLE_TO_ENTITY[tableId];
    if (!entity) return false;
    const res = await fetch(`/api/${toKebab(entity)}?id=${recordId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.code === 0;
  },
};

export { TABLE_IDS };
