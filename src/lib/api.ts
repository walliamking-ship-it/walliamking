/**
 * 数据服务层 - 通过Next.js API代理访问飞书Bitable（解决CORS问题）
 */

import { TABLE_IDS } from './tableIds';

// 客户端数据服务 - 调用我们的API代理
export const DataService = {
  async list(tableId: string): Promise<any[]> {
    const res = await fetch(`/api/proxy?tableId=${tableId}&action=list`);
    const data = await res.json();
    if (data.code === 0) return data.data || [];
    console.error('DataService.list error:', data);
    return [];
  },

  async create(tableId: string, fields: Record<string, unknown>): Promise<boolean> {
    const res = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, action: 'create', fields })
    });
    const data = await res.json();
    return data.code === 0;
  },

  async update(tableId: string, recordId: string, fields: Record<string, unknown>): Promise<boolean> {
    const res = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, action: 'update', id: recordId, fields })
    });
    const data = await res.json();
    return data.code === 0;
  },

  async delete(tableId: string, recordId: string): Promise<boolean> {
    const res = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, action: 'delete', id: recordId })
    });
    const data = await res.json();
    return data.code === 0;
  },
};

export { TABLE_IDS };
