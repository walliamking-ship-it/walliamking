import { NextRequest, NextResponse } from 'next/server';

const APP_TOKEN = 'EUyCb0aIcavugUsXJaocRtR6n6b';

const TABLE_IDS: Record<string, string> = {
  customers: 'tbl39rTGYqOozWgD',
  vendors: 'tblaJHIldDm1egUK',
  materials: 'tblXqOpBNKo4btqD',
  products: 'tbl0SuYwqxW5Wulc',
  processes: 'tblPZgPPQwMiQwWe',
  workstations: 'tbl91U0HVS4QpbT0',
};

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

const FIELD_MAP: Record<string, string> = {
  'code': '客户编号', 'name': '客户名称', 'contact': '联系人', 'phone': '电话', 'address': '地址', 'remark': '备注',
  'spec': '规格', 'unit': '单位', 'category': '分类', 'customer': '客户', 'sheetSize': '纸张开数',
  'unitPrice': '单价', 'outsource': '是否委外', 'sequence': '顺序',
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(FIELD_MAP).map(([en, cn]) => [cn, en])
);

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const tableId = TABLE_IDS[entity];
  if (!tableId) return NextResponse.json({ code: 404, msg: 'Entity not found' }, { status: 404 });

  try {
    const token = await getToken();
    const res = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    if (d.code !== 0) return NextResponse.json(d, { status: 500 });

    const items = (d.data?.items || []).map((r: any) => ({
      id: r.record_id,
      ...cnToEn(r.fields)
    }));
    return NextResponse.json({ code: 0, data: items });
  } catch (e: any) {
    return NextResponse.json({ code: 500, msg: e.message });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const tableId = TABLE_IDS[entity];
  if (!tableId) return NextResponse.json({ code: 404, msg: 'Entity not found' }, { status: 404 });

  try {
    const body = await request.json();
    const token = await getToken();
    const fields = enToCn(body);
    const res = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    const d = await res.json();
    if (d.code !== 0) return NextResponse.json(d, { status: 500 });
    const record = d.data.record;
    return NextResponse.json({ code: 0, data: { id: record.record_id, ...cnToEn(record.fields) } });
  } catch (e: any) {
    return NextResponse.json({ code: 500, msg: e.message });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const tableId = TABLE_IDS[entity];
  if (!tableId) return NextResponse.json({ code: 404, msg: 'Entity not found' }, { status: 404 });

  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ code: 400, msg: 'Missing id' }, { status: 400 });
    const token = await getToken();
    const fields = enToCn(data);
    const res = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    const d = await res.json();
    return NextResponse.json(d, { status: d.code === 0 ? 200 : 500 });
  } catch (e: any) {
    return NextResponse.json({ code: 500, msg: e.message });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const tableId = TABLE_IDS[entity];
  if (!tableId) return NextResponse.json({ code: 404, msg: 'Entity not found' }, { status: 404 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ code: 400, msg: 'Missing id' }, { status: 400 });
    const token = await getToken();
    const res = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    return NextResponse.json(d, { status: d.code === 0 ? 200 : 500 });
  } catch (e: any) {
    return NextResponse.json({ code: 500, msg: e.message });
  }
}
