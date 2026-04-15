/**
 * 飞书 Bitable API 数据访问层
 * 支持模拟数据和真实API切换
 */

const APP_TOKEN = 'EUyCb0aIcavugUsXJaocRtR6n6b';
const BITABLE_TOKEN = process.env.FEISHU_BITABLE_TOKEN || 't-g1044enK73LFTOL3VFFOA67GBYPE6QJU6TTXNUIE';

// 动态获取token (每次请求前获取新token)
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

// 通用Bitable API调用
async function bitableRequest(tableId: string, action: 'list' | 'create' | 'update' | 'delete', recordId?: string, fields?: Record<string, unknown>) {
  const token = await getToken();
  const baseUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records`;

  let url = baseUrl;
  let method = 'GET';
  let body: string | undefined;

  if (action === 'list') {
    url = baseUrl;
    method = 'GET';
  } else if (action === 'create') {
    url = baseUrl;
    method = 'POST';
    body = JSON.stringify({ fields });
  } else if (action === 'update' && recordId) {
    url = `${baseUrl}/${recordId}`;
    method = 'PUT';
    body = JSON.stringify({ fields });
  } else if (action === 'delete' && recordId) {
    url = `${baseUrl}/${recordId}`;
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

// 字段名映射 (中文field_name -> 英文key)
const FIELD_MAP: Record<string, string> = {
  '客户编号': 'code',
  '客户名称': 'name',
  '联系人': 'contact',
  '电话': 'phone',
  '地址': 'address',
  '备注': 'remark',
  '供应商编号': 'code',
  '供应商名称': 'name',
  '物料编号': 'code',
  '物料名称': 'name',
  '规格': 'spec',
  '单位': 'unit',
  '分类': 'category',
  '产品编号': 'code',
  '产品名称': 'name',
  '客户': 'customer',
  '纸张开数': 'sheetSize',
  '工艺名称': 'name',
  '单价': 'unitPrice',
  '是否委外': 'outsource',
  '工序名称': 'name',
  '顺序': 'sequence',
};

// 将Bitable记录转为JS对象
function parseRecord(record: any, tableId: string): any {
  const fields = record.fields;
  const mapped: any = { id: record.record_id };

  for (const [key, value] of Object.entries(fields)) {
    const englishKey = FIELD_MAP[key] || key;
    mapped[englishKey] = value;
  }

  return mapped;
}

// 通用CRUD操作
export const DataService = {
  // 列表
  async list(tableId: string): Promise<any[]> {
    const res = await bitableRequest(tableId, 'list');
    if (res.code === 0 && res.data?.items) {
      return res.data.items.map((r: any) => parseRecord(r, tableId));
    }
    return [];
  },

  // 创建
  async create(tableId: string, data: Record<string, unknown>): Promise<boolean> {
    // 将英文key转回中文field_name
    const reverseMap: Record<string, string> = Object.fromEntries(
      Object.entries(FIELD_MAP).map(([cn, en]) => [en, cn])
    );

    const fields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const cnKey = reverseMap[key] || key;
      fields[cnKey] = value;
    }

    const res = await bitableRequest(tableId, 'create', undefined, fields);
    return res.code === 0;
  },

  // 更新
  async update(tableId: string, recordId: string, data: Record<string, unknown>): Promise<boolean> {
    const reverseMap: Record<string, string> = Object.fromEntries(
      Object.entries(FIELD_MAP).map(([cn, en]) => [en, cn])
    );

    const fields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const cnKey = reverseMap[key] || key;
      fields[cnKey] = value;
    }

    const res = await bitableRequest(tableId, 'update', recordId, fields);
    return res.code === 0;
  },

  // 删除
  async delete(tableId: string, recordId: string): Promise<boolean> {
    const res = await bitableRequest(tableId, 'delete', recordId);
    return res.code === 0;
  },
};

// 各模块表ID
export const TABLE_IDS = {
  customers: 'tbl39rTGYqOozWgD',  // 客户表
  vendors: 'tblaJHIldDm1egUK',    // 供应商表
  materials: 'tblXqOpBNKo4btqD',  // 物料表
  products: 'tbl0SuYwqxW5Wulc',   // 产品表
  processes: 'tblPZgPPQwMiQwWe',  // 工艺表
  workstations: 'tbl91U0HVS4QpbT0', // 工序表
};
