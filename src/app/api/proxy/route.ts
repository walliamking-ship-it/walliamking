/**
 * 飞书API代理 - 解决浏览器CORS问题
 * 浏览器 → Next.js API路由 → 飞书API
 */

import { NextRequest, NextResponse } from 'next/server';

// Bitable App Token映射
const APP_TOKEN_MAP: Record<string, string> = {
  // 基础数据Bitable
  'tbl39rTGYqOozWgD': 'EUyCb0aIcavugUsXJaocRtR6n6b', // customers
  'tblaJHIldDm1egUK': 'EUyCb0aIcavugUsXJaocRtR6n6b', // vendors
  'tblXqOpBNKo4btqD': 'EUyCb0aIcavugUsXJaocRtR6n6b', // materials
  'tbl0SuYwqxW5Wulc': 'EUyCb0aIcavugUsXJaocRtR6n6b', // products
  'tblPZgPPQwMiQwWe': 'EUyCb0aIcavugUsXJaocRtR6n6b', // processes
  'tbl91U0HVS4QpbT0': 'EUyCb0aIcavugUsXJaocRtR6n6b', // workstations
  // 订单库存Bitable
  'tblrsogIjpuZHHBq': 'GVgUbTjubaI5m1suvcgctyPOnFc', // salesOrders
  'tblQFJLUW9ijCAYN': 'GVgUbTjubaI5m1suvcgctyPOnFc', // purchaseOrders
  'tbll0QRgcWpOhBS3': 'GVgUbTjubaI5m1suvcgctyPOnFc', // inventory
};

const APP_ID = 'cli_a942474699f85cc1';
const APP_SECRET = 'aY6lJiIPeicpOVzyRMFROCUFRijRY4pf';

const FIELD_MAP: Record<string, string> = {
  'code': '客户编号', 'name': '客户名称', 'contact': '联系人', 'phone': '电话', 'address': '地址', 'remark': '备注',
  'spec': '规格', 'unit': '单位', 'category': '分类',
  'customer': '客户', 'sheetSize': '纸张开数',
  'purchasePrice': '进价', 'salePrice': '售价',
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

async function getToken(): Promise<string> {
  const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET })
  });
  const data = await res.json();
  return data.tenant_access_token;
}

// GET /api/proxy?tableId=xxx&action=list|get&id=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get('tableId') || '';
  const action = searchParams.get('action') || 'list';
  const recordId = searchParams.get('id');

  const appToken = APP_TOKEN_MAP[tableId];
  if (!appToken) return NextResponse.json({ code: 404, msg: 'Table not found' }, { status: 404 });

  try {
    const token = await getToken();
    let url = '';
    let method = 'GET';
    let body: string | undefined;

    if (action === 'list') {
      url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records?page_size=100`;
    } else if (action === 'get' && recordId) {
      url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`;
    }

    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body
    });
    const data = await res.json();

    if (data.code !== 0) return NextResponse.json(data, { status: 500 });

    if (action === 'list') {
      const allItems: any[] = [];
      let pageToken: string | undefined;
      do {
        let listUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records?page_size=100`;
        if (pageToken) listUrl += `&page_token=${pageToken}`;
        
        const listRes = await fetch(listUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        if (listData.code === 0 && listData.data?.items) {
          allItems.push(...listData.data.items.map((r: any) => ({
            id: r.record_id,
            ...cnToEn(r.fields)
          })));
          pageToken = listData.data.has_more ? listData.data.page_token : undefined;
        } else break;
      } while (pageToken);
      return NextResponse.json({ code: 0, data: allItems });
    } else if (action === 'get' && data.data?.record) {
      return NextResponse.json({
        code: 0,
        data: { id: data.data.record.record_id, ...cnToEn(data.data.record.fields) }
      });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ code: 500, msg: e.message });
  }
}

// POST /api/proxy
// Body: { tableId, action, id?, fields? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, action, id, fields } = body;

    const appToken = APP_TOKEN_MAP[tableId];
    if (!appToken) return NextResponse.json({ code: 404, msg: 'Table not found' }, { status: 404 });

    const token = await getToken();
    let url = '';
    let method = 'GET';
    let bodyData: string | undefined;

    if (action === 'create') {
      url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;
      method = 'POST';
      bodyData = JSON.stringify({ fields: enToCn(fields || {}) });
    } else if (action === 'update' && id) {
      url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${id}`;
      method = 'PUT';
      bodyData = JSON.stringify({ fields: enToCn(fields || {}) });
    } else if (action === 'delete' && id) {
      url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${id}`;
      method = 'DELETE';
    }

    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: bodyData
    });
    const data = await res.json();
    return NextResponse.json(data, { status: data.code === 0 ? 200 : 500 });
  } catch (e: any) {
    return NextResponse.json({ code: 500, msg: e.message });
  }
}
