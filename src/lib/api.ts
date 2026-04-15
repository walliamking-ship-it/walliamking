/**
 * 飞书 Bitable API - 前端直连（浏览器CORS）
 */

const APP_TOKEN = 'EUyCb0aIcavugUsXJaocRtR6n6b';

async function getToken(): Promise<string> {
  const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: 'cli_a9521be8ba351cb2',
      app_secret: '3pjAPhlHHM89rNh94Iu3BcUPqTlCVBJE'
    })
  });
  const data = await res.json();
  return data.tenant_access_token;
}

async function bitableRequest(tableId: string, action: 'list' | 'create' | 'update' | 'delete', recordId?: string, fields?: Record<string, unknown>) {
  const token = await getToken();
  let url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records`;
  let method = 'GET';
  let body: string | undefined;

  if (action === 'list') {
    url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records`;
    method = 'GET';
  } else if (action === 'create') {
    method = 'POST';
    body = JSON.stringify({ fields });
  } else if (action === 'update' && recordId) {
    url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records/${recordId}`;
    method = 'PUT';
    body = JSON.stringify({ fields });
  } else if (action === 'delete' && recordId) {
    url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records/${recordId}`;
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
};
