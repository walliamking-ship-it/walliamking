import { NextRequest, NextResponse } from 'next/server';
import { TABLE_IDS } from '@/lib/tableIds';

const APP_ID = 'cli_a9521be8ba351cb2';
const APP_SECRET = '3pjAPhlHHM89rNh94Iu3BcUPqTlCVBJE';
const APP_TOKEN = 'HfLfbLOE5aQCy5sZXHfc281FnDf';

function toCamelCase(entity: string): string {
  return entity.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

function getTableId(entity: string): string | undefined {
  const key = toCamelCase(entity);
  return (TABLE_IDS as Record<string, string>)[key];
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

// ============================================
// 字段映射（英文 → 中文）
// ============================================

const BASE_MAP: Record<string, string> = {
  'contactPhone': '联系电话',
  'processName': '工序名称', 'processCode': '工序编号', 'description': '描述',
  'processType': '工艺类型', 'flowType': '流程类型', 'steps': '步骤',
};

const VENDOR_MAP: Record<string, string> = {
  'code': '供应商编号', 'name': '供应商名称', 'contact': '联系人',
  'phone': '电话', 'address': '地址', 'remark': '备注',
  'taxNumber': '税号', 'bankAccount': '银行帐号', 'bankCode': '开户行号', 'bankName': '开户行名称',
};

const CUSTOMER_MAP: Record<string, string> = {
  'code': '客户编号', 'name': '客户名称', 'contact': '联系人',
  'phone': '电话', 'address': '地址', 'remark': '备注',
  'taxNumber': '税号', 'bankAccount': '银行帐号', 'bankCode': '开户行号', 'bankName': '开户行名称',
};

const PRODUCT_MAP: Record<string, string> = {
  'code': '货号', 'productName': '产品名称', 'spec': '规格型号',
  'unit': '单位', 'customer': '客户', 'category': '分类',
  'purchasePrice': '进价', 'salePrice': '售价', 'remark': '备注',
};

const MATERIAL_MAP: Record<string, string> = {
  'code': '物料编号', 'name': '物料名称', 'spec': '规格',
  'unit': '单位', 'category': '分类', 'remark': '备注',
};

const SO_MAP: Record<string, string> = {
  'no': '单号', '客户名称': '客户名称', 'date': '日期',
  'contractAmount': '合同金额', 'paidAmount': '已收款', 'unpaidAmount': '未收款项',
  'deliveryAmount': '已送货', 'paymentStatus': '收款状态', 'deliveryStatus': '送货状态',
  'invoicingStatus': '开票状态', 'creator': '制单人', 'salesperson': '业务员',
  'plannedDeliveryDate': '计划送货日期', 'plannedPaymentDate': '计划收款日期', 'remark': '备注',
};

const PO_MAP: Record<string, string> = {
  'no': '单号', 'supplierName': '供应商', '供应商名称': '供应商', 'date': '日期',
  'contractAmount': '合同金额', 'paidAmount': '已付款', 'unpaidAmount': '未付款',
  'paymentStatus': '付款状态', 'deliveryStatus': '收货状态', 'creator': '制单人', 'remark': '备注',
};

const WO_MAP: Record<string, string> = {
  'no': '单号', 'salesOrderNo': '关联销售订单号', 'productName': '产品名称',
  'materialCode': '物料编码', 'spec': '规格', 'unit': '单位',
  'planQty': '计划数量', 'completedQty': '已完成数量', 'productionUnit': '生产单位',
  'executor': '执行单位', 'status': '状态',
  'planStartDate': '计划开始日期', 'planEndDate': '计划完成日期',
  'actualStartDate': '实际开始日期', 'actualEndDate': '实际完成日期',
  'creator': '制单人', 'remark': '备注',
};

const DO_MAP: Record<string, string> = {
  'no': '单号', 'salesOrderNo': '关联销售订单号', '客户名称': '客户名称',
  '送货日期': '送货日期', '送货地址': '送货地址', '仓库': '仓库',
  'creator': '制单人', 'remark': '备注', 'status': '状态',
};

const RO_MAP: Record<string, string> = {
  'no': '单号', 'purchaseOrderNo': '关联采购订单号', 'supplierName': '供应商',
  '收货日期': '收货日期', '收货地址': '收货地址', '仓库': '仓库',
  'creator': '制单人', 'remark': '备注', 'status': '状态',
};

const PR_MAP: Record<string, string> = {
  'no': '单号', '客户名称': '客户名称', 'salesOrderNo': '关联销售订单号',
  '收款日期': '收款日期', '收款方式': '收款方式', '收款金额': '收款金额',
  'status': '状态', 'creator': '制单人', 'remark': '备注',
};

const PM_MAP: Record<string, string> = {
  'no': '单号', 'supplierName': '供应商', 'purchaseOrderNo': '关联采购订单号',
  '付款日期': '付款日期', '付款方式': '付款方式', '付款金额': '付款金额',
  'status': '状态', 'creator': '制单人', 'remark': '备注',
};

const INV_MAP: Record<string, string> = {
  'warehouse': '仓库', '名称': '名称', 'spec': '规格',
  'unit': '单位', 'stockQuantity': '库存数量', 'inTransitQuantity': '在途数量',
  'safeStock': '安全库存', 'costPrice': '成本价', 'remark': '备注',
};

const INVOICE_MAP: Record<string, string> = {
  '类型': '发票类型', 'no': '单号', '发票号': '发票号',
  '客户名称': '客户名称', 'supplierName': '供应商',
  'salesOrderNo': '关联销售订单号', 'purchaseOrderNo': '关联采购订单号',
  '开票日期': '开票日期', '金额': '金额', '税率': '税率', '税额': '税额',
  'status': '状态', 'creator': '制单人', 'remark': '备注',
};

const JR_MAP: Record<string, string> = {
  'no': '单号', 'workOrderNo': '关联施工单号', '工序名称': '工序名称',
  '报工数量': '报工数量', '合格数量': '合格数量', '不合格数量': '不合格数量',
  '报工人员': '报工人员', '报工日期': '报工日期', '生产班组': '生产班组', 'remark': '备注',
};

const SCRAP_MAP: Record<string, string> = {
  'no': '单号', 'workOrderNo': '关联施工单号', '物料名称': '物料名称',
  'spec': '规格', 'unit': '单位', '报废数量': '报废数量',
  '报废原因': '报废原因', '报废日期': '报废日期', '处理方式': '处理方式',
  'creator': '制单人', 'remark': '备注',
};

function getFieldMap(tableId: string): Record<string, string> {
  const map: Record<string, string> = { ...BASE_MAP };
  if (tableId === 'tblmzQPQFNHBmDIz') return { ...map, ...VENDOR_MAP };
  if (tableId === 'tbl6i3ISskNbntwl') return { ...map, ...CUSTOMER_MAP };
  if (tableId === 'tblVj4gqWCKr06qO') return { ...map, ...PRODUCT_MAP };
  if (tableId === 'tblImy02DzQZAL7b') return { ...map, ...MATERIAL_MAP };
  if (tableId === 'tblwOVw10twy4sQB') return { ...map, ...SO_MAP };
  if (tableId === 'tblve9n3goCwJFDB') return { ...map, ...PO_MAP };
  if (tableId === 'tbl8mOvOWR5xnMOH') return { ...map, ...WO_MAP };
  if (tableId === 'tblTCHv9BeSoLPxi') return { ...map, ...DO_MAP };
  if (tableId === 'tbl4LRvJ5xs30YsV') return { ...map, ...RO_MAP };
  if (tableId === 'tblOCRAKy5waMDaB') return { ...map, ...PR_MAP };
  if (tableId === 'tblJLL0nJbsfeFPu') return { ...map, ...PM_MAP };
  if (tableId === 'tblaHsdww8fItDA7') return { ...map, ...INV_MAP };
  if (tableId === 'tbl7Sk9HeIrn6UBX') return { ...map, ...INVOICE_MAP };
  if (tableId === 'tblUuX9gW4yhRHye') return { ...map, ...JR_MAP };
  if (tableId === 'tblKL2h8Q5M4kBbM') return { ...map, ...SCRAP_MAP };
  return map;
}

function enToCn(data: Record<string, unknown>, tableId: string): Record<string, unknown> {
  const fieldMap = getFieldMap(tableId);
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    result[fieldMap[k] || k] = v;
  }
  return result;
}

function cnToEn(fields: Record<string, unknown>, tableId: string): Record<string, unknown> {
  const fieldMap = getFieldMap(tableId);
  const reverseMap: Record<string, string> = {};
  for (const [en, cn] of Object.entries(fieldMap)) {
    reverseMap[cn] = en;
  }
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    result[reverseMap[k] || k] = v;
  }
  return result;
}

// ============================================
// GET /api/[entity] — 列表
// ============================================
export async function GET(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const tableId = getTableId(entity);
  if (!tableId) return NextResponse.json({ code: 404, msg: 'Entity not found' }, { status: 404 });

  try {
    const token = await getToken();
    const res = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    if (d.code !== 0) return NextResponse.json(d, { status: 500 });

    // 所有表都直接返回Bitable字段名，不做转换（Bitable统一使用中文字段名）
    const needConvert = false;
    const items = (d.data?.items || []).map((r: any) => ({
      id: r.record_id,
      ...(needConvert ? cnToEn(r.fields, tableId) : r.fields)
    }));

    // 添加缓存头，允许浏览器缓存5分钟
    const response = NextResponse.json({ code: 0, data: items });
    response.headers.set('Cache-Control', 'private, max-age=300');
    return response;
  } catch (e: any) {
    return NextResponse.json({ code: 500, msg: e.message });
  }
}

// ============================================
// POST /api/[entity] — 新建
// ============================================
export async function POST(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const tableId = getTableId(entity);
  if (!tableId) return NextResponse.json({ code: 404, msg: 'Entity not found' }, { status: 404 });

  // 唯一性验证字段
  const UNIQUE_KEYS: Record<string, string> = {
    customers: '客户编号',
    vendors: '供应商编号',
    products: '货号',
    materials: '物料编号',
    salesOrders: '单号',
    purchaseOrders: '单号',
    salesOrderItems: '序号',
    purchaseOrderItems: '序号',
    workOrders: '单号',
    deliveryOrders: '单号',
    receivingOrders: '单号',
    invoices: '单号',
    paymentReceipts: '单号',
    paymentMades: '单号',
    jobReports: '单号',
    scrapOrders: '单号',
  };

  try {
    const body = await request.json();
    const uniqueKey = UNIQUE_KEYS[toCamelCase(entity)];

    // 唯一性检查
    if (uniqueKey && body[uniqueKey]) {
      const checkToken = await getToken();
      // Bitable使用中文字段名，直接查找
      const checkRes = await fetch(
        `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records?page_size=500`,
        { headers: { 'Authorization': `Bearer ${checkToken}` } }
      );
      const checkData = await checkRes.json();
      if (checkData.code === 0) {
        const existing = (checkData.data?.items || []).find((r: any) => {
          const val = r.fields[uniqueKey];
          return val !== undefined && String(val) === String(body[uniqueKey]);
        });
        if (existing) {
          return NextResponse.json({ code: 409, msg: `${uniqueKey} "${body[uniqueKey]}" 已存在，请使用其他编号` }, { status: 409 });
        }
      }
    }

    // 直接透传字段（Bitable使用中文字段名）
    const fields = body;
    const token = await getToken();
    const res = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    const d = await res.json();
    if (d.code !== 0) return NextResponse.json(d, { status: 500 });
    const record = d.data.record;
    return NextResponse.json({ code: 0, data: { id: record.record_id, ...record.fields } });
  } catch (e: any) {
    return NextResponse.json({ code: 500, msg: e.message });
  }
}

// ============================================
// PUT /api/[entity] — 更新
// ============================================
export async function PUT(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const tableId = getTableId(entity);
  if (!tableId) return NextResponse.json({ code: 404, msg: 'Entity not found' }, { status: 404 });

  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ code: 400, msg: 'Missing record id' }, { status: 400 });
    const token = await getToken();
    const fields = updates;  // 直接透传，不转换
    const res = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    const d = await res.json();
    if (d.code !== 0) return NextResponse.json(d, { status: 500 });
    return NextResponse.json({ code: 0, data: { id: d.data.record.record_id } });
  } catch (e: any) {
    return NextResponse.json({ code: 500, msg: e.message });
  }
}

// ============================================
// DELETE /api/[entity] — 删除
// ============================================
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const tableId = getTableId(entity);
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
    if (d.code !== 0) return NextResponse.json(d, { status: 500 });
    return NextResponse.json({ code: 0, data: {} });
  } catch (e: any) {
    return NextResponse.json({ code: 500, msg: e.message });
  }
}
