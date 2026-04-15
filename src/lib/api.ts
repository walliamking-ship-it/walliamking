/**
 * 飞书 Bitable API - 前端直连（浏览器CORS）
 */

// 基础数据Bitable（客户/供应商/物料/产品/工艺/工序）
const APP_TOKEN_BASE = 'EUyCb0aIcavugUsXJaocRtR6n6b';
// 订单库存Bitable（销售订单/采购订单/库存表）
const APP_TOKEN_ORDER = 'GVgUbTjubaI5m1suvcgctyPOnFc';

function getAppToken(tableId: string): string {
  // 订单相关表使用独立的Bitable
  if (tableId.startsWith('tblrs') || tableId.startsWith('tblQF') || tableId.startsWith('tbll0Q')) {
    return APP_TOKEN_ORDER;
  }
  return APP_TOKEN_BASE;
}

async function getToken(): Promise<string> {
  const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: 'cli_a942474699f85cc1',
      app_secret: 'aY6lJiIPeicpOVzyRMFROCUFRijRY4pf'
    })
  });
  const data = await res.json();
  return data.tenant_access_token;
}

async function bitableRequest(tableId: string, action: 'list' | 'create' | 'update' | 'delete', recordId?: string, fields?: Record<string, unknown>) {
  const token = await getToken();
  const appToken = getAppToken(tableId);
  let url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;
  let method = 'GET';
  let body: string | undefined;

  if (action === 'list') {
    url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;
    method = 'GET';
  } else if (action === 'create') {
    method = 'POST';
    body = JSON.stringify({ fields });
  } else if (action === 'update' && recordId) {
    url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`;
    method = 'PUT';
    body = JSON.stringify({ fields });
  } else if (action === 'delete' && recordId) {
    url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`;
    method = 'DELETE';
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body
  });
  return res.json();
}

const FIELD_MAP: Record<string, string> = {
  'code': '客户编号', 'name': '客户名称', 'contact': '联系人', 'phone': '电话', 'address': '地址', 'remark': '备注',
  'spec': '规格', 'unit': '单位', 'category': '分类', 'customer': '客户', 'sheetSize': '纸张开数',
  'unitPrice': '单价', 'outsource': '是否委外', 'sequence': '顺序',
};
const REVERSE_MAP: Record<string, string> = Object.fromEntries(Object.entries(FIELD_MAP).map(([en, cn]) => [cn, en]));

function cnToEn(fields: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    result[REVERSE_MAP[k] || k] = v;
  }
  return result;
}

function enToCn(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    result[FIELD_MAP[k] || k] = v;
  }
  return result;
}

export const DataService = {
  async list(tableId: string): Promise<any[]> {
    const res = await bitableRequest(tableId, 'list');
    if (res.code === 0 && res.data?.items) {
      return res.data.items.map((r: any) => ({ id: r.record_id, ...cnToEn(r.fields) }));
    }
    return [];
  },

  async create(tableId: string, data: Record<string, unknown>): Promise<boolean> {
    const fields = enToCn(data);
    const res = await bitableRequest(tableId, 'create', undefined, fields);
    return res.code === 0;
  },

  async update(tableId: string, recordId: string, data: Record<string, unknown>): Promise<boolean> {
    const fields = enToCn(data);
    const res = await bitableRequest(tableId, 'update', recordId, fields);
    return res.code === 0;
  },

  async delete(tableId: string, recordId: string): Promise<boolean> {
    const res = await bitableRequest(tableId, 'delete', recordId);
    return res.code === 0;
  },
};

export const TABLE_IDS = {
  customers: 'tbl39rTGYqOozWgD',
  vendors: 'tblaJHIldDm1egUK',
  materials: 'tblXqOpBNKo4btqD',
  products: 'tbl0SuYwqxW5Wulc',
  processes: 'tblPZgPPQwMiQwWe',
  workstations: 'tbl91U0HVS4QpbT0',
  // 订单库存（新Bitable）
  salesOrders: 'tblrsogIjpuZHHBq',
  purchaseOrders: 'tblQFJLUW9ijCAYN',
  inventory: 'tbll0QRgcWpOhBS3',
};
