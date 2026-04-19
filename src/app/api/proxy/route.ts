/**
 * 飞书API代理 - 解决浏览器CORS问题
 * 浏览器 → Next.js API路由 → 飞书API
 * 
 * 更新：2026-04-16 使用PD账号创建的新Bitable
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

// 验证用户Token
async function verifyUserToken(request: NextRequest): Promise<{ valid: boolean; error?: string }> {
  const cookieHeader = request.headers.get('cookie');
  const userToken = getTokenFromCookie(cookieHeader);
  
  if (!userToken) {
    return { valid: false, error: '未登录' };
  }
  
  const payload = await verifyToken(userToken);
  if (!payload) {
    return { valid: false, error: '登录已过期' };
  }
  
  return { valid: true };
}

// PD账号凭证 (cli_a9521be8ba351cb2)
const APP_ID = process.env.FEISHU_APP_ID || 'cli_a942474699f85cc1';
const APP_SECRET = process.env.FEISHU_APP_SECRET || 'aY6lJiIPeicpOVzyRMFROCUFRijRY4pf';

// 新Bitable App Token
const APP_TOKEN = 'HfLfbLOE5aQCy5sZXHfc281FnDf';

// 新Bitable 表名→新tableId映射
const NEW_TABLE_ID_MAP: Record<string, string> = {
  'tbl6i3ISskNbntwl': 'tbl6i3ISskNbntwl',  // 客户表
  'tblmzQPQFNHBmDIz': 'tblmzQPQFNHBmDIz',  // 供应商表
  'tblVj4gqWCKr06qO': 'tblVj4gqWCKr06qO',  // 产品表
  'tblImy02DzQZAL7b': 'tblImy02DzQZAL7b',  // 物料表
  'tblwOVw10twy4sQB': 'tblwOVw10twy4sQB',  // 销售订单
  'tblve9n3goCwJFDB': 'tblve9n3goCwJFDB',  // 采购订单
  'tblaHsdww8fItDA7': 'tblaHsdww8fItDA7',  // 库存表
  'tbl8kwvXcRF0MsnN': 'tbl8kwvXcRF0MsnN',  // 工艺表
  'tbl480Hyy0UijS5f': 'tbl480Hyy0UijS5f',  // 工序表
  'tbl8mOvOWR5xnMOH': 'tbl8mOvOWR5xnMOH',  // 施工单
};

// 旧tableId → 新tableId 映射（保持repo.ts兼容性）
const TABLE_ID_MAP: Record<string, string> = {
  // 基础数据（旧Bitable ID → 新Bitable ID）
  'tbl39rTGYqOozWgD': 'tbl6i3ISskNbntwl',  // customers → 客户表
  'tblaJHIldDm1egUK': 'tblmzQPQFNHBmDIz',  // vendors → 供应商表
  'tblXqOpBNKo4btqD': 'tblImy02DzQZAL7b',  // materials → 物料表
  'tbl0SuYwqxW5Wulc': 'tblVj4gqWCKr06qO',  // products → 产品表
  'tblPZgPPQwMiQwWe': 'tbl8kwvXcRF0MsnN',  // processes → 工艺表
  'tbl91U0HVS4QpbT0': 'tbl480Hyy0UijS5f',  // workstations → 工序表
  // 订单库存（旧Bitable ID → 新Bitable ID）
  'tblrsogIjpuZHHBq': 'tblwOVw10twy4sQB',  // salesOrders → 销售订单
  'tblQFJLUW9ijCAYN': 'tblve9n3goCwJFDB',  // purchaseOrders → 采购订单
  'tbll0QRgcWpOhBS3': 'tblaHsdww8fItDA7',  // inventory → 库存表
  'tblWorkOrders': 'tbl8mOvOWR5xnMOH',  // workOrders → 施工单
};

// 销售订单表专用字段映射（英文 → 中文）
const SO_FIELD_MAP: Record<string, string> = {
  'no': '单号',
  'salesOrderItems': '销售订单明细',
  '客户名称': '客户名称',
  'date': '日期',
  'contractAmount': '合同金额',
  'deliveryAmount': '已送货',
  'paidAmount': '已收款',
  'unpaidAmount': '未收款项',
  'paymentStatus': '收款状态',
  'deliveryStatus': '送货状态',
  'invoicingStatus': '开票状态',
  'creator': '制单人',
  'salesperson': '业务员',
  'plannedDeliveryDate': '计划送货日期',
  'plannedPaymentDate': '计划收款日期',
  'remark': '备注',
};

// 通用英文字段 → 中文字段名 映射（客户表）
const FIELD_MAP: Record<string, string> = {
  'code': '客户编号', 'name': '客户名称', 'contact': '联系人', 'phone': '电话', 'address': '地址', 'remark': '备注',
  'spec': '规格', 'unit': '单位', 'category': '分类',
  'customer': '客户', 'purchasePrice': '进价', 'salePrice': '售价',
  'unitPrice': '单价', 'outsource': '是否委外', 'sequence': '顺序',
  'supplier': '供应商', 'date': '日期', 'contractAmount': '合同金额',
  'paidAmount': '已付款', 'unpaidAmount': '未付款', 'deliveryAmount': '已送货',
  'paymentStatus': '付款状态', 'deliveryStatus': '送货状态', 'creator': '制单人', 'salesperson': '业务员',
  'warehouse': '仓库', 'stockQuantity': '库存数量', 'inTransitQuantity': '在途数量', 'safeStock': '安全库存', 'costPrice': '成本价',
};

// 供应商表专用字段映射（覆盖通用映射）
const VENDOR_FIELD_MAP: Record<string, string> = {
  'code': '供应商编号',
  'name': '供应商名称',
  'contact': '联系人',
  'contactPhone': '联系电话',
  'phone': '电话',
  'address': '地址',
  'remark': '备注',
};

// 采购订单表专用字段映射
const PO_FIELD_MAP: Record<string, string> = {
  'no': '单号',
  'purchaseOrderItems': '采购订单明细',
  'supplier': '供应商',
  'supplierName': '供应商名称',
  'date': '日期',
  'contractAmount': '合同金额',
  'paidAmount': '已付款',
  'unpaidAmount': '未付款',
  'paymentStatus': '付款状态',
  'deliveryStatus': '收货状态',
  'invoicingStatus': '开票状态',
  'creator': '制单人',
  'salesperson': '业务员',
  'plannedDeliveryDate': '计划收货日期',
  'plannedPaymentDate': '计划付款日期',
  'receivedAmount': '已收货',
  'deliveryAddress': '收货地址',
  'remark': '备注',
};

// 库存表专用字段映射
const INV_FIELD_MAP: Record<string, string> = {
  'name': '名称',
  'productName': '名称',
  'code': '货号',
  'spec': '规格',
  'unit': '单位',
  'category': '分类',
  'warehouse': '仓库',
  'stockQuantity': '库存数量',
  'inTransitQuantity': '在途数量',
  'safeStock': '安全库存',
  'costPrice': '成本价',
  'remark': '备注',
  'qty': '库存数量',
};

// 产品表专用字段映射
const PRODUCT_FIELD_MAP: Record<string, string> = {
  'productName': '产品名称',
  'code': '货号',
  'spec': '规格型号',
  'unit': '单位',
  'customer': '客户',
  'category': '分类',
  'purchasePrice': '进价',
  'salePrice': '售价',
};

// 施工单专用字段映射
const WO_FIELD_MAP: Record<string, string> = {
  'no': '单号',
  'salesOrderNo': '关联销售订单号',
  'productName': '产品名称',
  'materialCode': '物料编码',
  'spec': '规格',
  'unit': '单位',
  'planQty': '计划数量',
  'completedQty': '已完成数量',
  'productionUnit': '生产单位',
  'executor': '执行单位',
  'status': '状态',
  'planStartDate': '计划开始日期',
  'planEndDate': '计划完成日期',
  'actualStartDate': '实际开始日期',
  'actualEndDate': '实际完成日期',
  'remark': '备注',
  'creator': '制单人',
  'createdAt': '创建时间',
};

// 根据tableId获取英→中字段映射
function getFieldMap(tableId: string): Record<string, string> {
  const vid = TABLE_ID_MAP[tableId] || tableId;
  if (vid === 'tbl6i3ISskNbntwl') return { ...FIELD_MAP };                         // customers
  if (vid === 'tblmzQPQFNHBmDIz') return { ...FIELD_MAP, ...VENDOR_FIELD_MAP }; // vendors
  if (vid === 'tblVj4gqWCKr06qO') return { ...FIELD_MAP, ...PRODUCT_FIELD_MAP }; // products
  if (vid === 'tblImy02DzQZAL7b') return { ...FIELD_MAP };                         // materials
  if (vid === 'tblwOVw10twy4sQB') return { ...FIELD_MAP, ...SO_FIELD_MAP };     // sales orders
  if (vid === 'tblve9n3goCwJFDB') return { ...FIELD_MAP, ...PO_FIELD_MAP };     // purchase orders
  if (vid === 'tblaHsdww8fItDA7') return { ...FIELD_MAP, ...INV_FIELD_MAP };     // inventory
  if (vid === 'tbl8kwvXcRF0MsnN') return { ...FIELD_MAP };                         // processes
  if (vid === 'tbl480Hyy0UijS5f') return { ...FIELD_MAP };                         // workstations
  if (vid === 'tbl8mOvOWR5xnMOH') return { ...FIELD_MAP, ...WO_FIELD_MAP };     // work orders
  return FIELD_MAP;
}

// 根据tableId获取中→英反向映射
function getReverseMap(tableId: string): Record<string, string> {
  const fieldMap = getFieldMap(tableId);
  return Object.fromEntries(Object.entries(fieldMap).map(([en, cn]) => [cn, en]));
}

// 中文字段 → 英文 转换（支持按表特定映射）
function cnToEn(fields: Record<string, unknown>, tableId?: string): Record<string, unknown> {
  const reverseMap = tableId ? getReverseMap(tableId) : Object.fromEntries(Object.entries(FIELD_MAP).map(([en, cn]) => [cn, en]));
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    result[reverseMap[k] || k] = v;
  }
  return result;
}

// 英文字段 → 中文 转换（带tableId特定映射）
function enToCn(fields: Record<string, unknown>, tableId?: string): Record<string, unknown> {
  const fieldMap = tableId ? getFieldMap(tableId) : FIELD_MAP;
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    result[fieldMap[k] || k] = v;
  }
  return result;
}

// 获取tenant_access_token
async function getToken(): Promise<string> {
  const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET })
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Auth failed: ${data.msg}`);
  return data.tenant_access_token;
}

// GET /api/proxy?tableId=xxx&action=list|get&id=xxx
export async function GET(request: NextRequest) {
  // 验证用户登录
  const auth = await verifyUserToken(request);
  if (!auth.valid) {
    return NextResponse.json({ code: 401, msg: auth.error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get('tableId') || '';
  const action = searchParams.get('action') || 'list';
  const recordId = searchParams.get('id');

  // 映射到新tableId
  const newTableId = TABLE_ID_MAP[tableId] || tableId;
  if (!newTableId) return NextResponse.json({ code: 404, msg: 'Table not found' }, { status: 404 });

  try {
    const token = await getToken();

    // 分页获取所有记录
    if (action === 'list') {
      const allItems: any[] = [];
      let pageToken: string | undefined;

      do {
        let listUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${newTableId}/records?page_size=100`;
        if (pageToken) listUrl += `&page_token=${pageToken}`;

        const listRes = await fetch(listUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();

        if (listData.code === 0 && listData.data?.items) {
          allItems.push(...listData.data.items.map((r: any) => ({
            id: r.record_id,
            ...cnToEn(r.fields, tableId)
          })));
          pageToken = listData.data.has_more ? listData.data.page_token : undefined;
        } else {
          return NextResponse.json(listData, { status: listData.code === 0 ? 200 : 500 });
        }
      } while (pageToken);

      return NextResponse.json({ code: 0, data: allItems });
    }

    // 获取单条记录
    if (action === 'get' && recordId) {
      const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${newTableId}/records/${recordId}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code !== 0) return NextResponse.json(data, { status: 500 });
      return NextResponse.json({
        code: 0,
        data: { id: data.data.record.record_id, ...cnToEn(data.data.record.fields, tableId) }
      });
    }

    return NextResponse.json({ code: 400, msg: 'Invalid action' });
  } catch (e: any) {
    return NextResponse.json({ code: 500, msg: e.message });
  }
}

// POST /api/proxy
// Body: { tableId, action, id?, fields? }
export async function POST(request: NextRequest) {
  // 验证用户登录
  const auth = await verifyUserToken(request);
  if (!auth.valid) {
    return NextResponse.json({ code: 401, msg: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tableId, action, id, fields } = body;

    // 映射到新tableId
    const newTableId = TABLE_ID_MAP[tableId] || tableId;
    if (!newTableId) return NextResponse.json({ code: 404, msg: 'Table not found' }, { status: 404 });

    const token = await getToken();
    let url = '';
    let method = 'GET';
    let bodyData: string | undefined;

    if (action === 'create') {
      url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${newTableId}/records`;
      method = 'POST';
      bodyData = JSON.stringify({ fields: enToCn(fields || {}, tableId) });
    } else if (action === 'update' && id) {
      url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${newTableId}/records/${id}`;
      method = 'PUT';
      bodyData = JSON.stringify({ fields: enToCn(fields || {}, tableId) });
    } else if (action === 'delete' && id) {
      url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${newTableId}/records/${id}`;
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

// 新Bitable信息（2026-04-16创建）
// App Token: HfLfbLOE5aQCy5sZXHfc281FnDf
// URL: https://icnpgd3iqenx.feishu.cn/base/HfLfbLOE5aQCy5sZXHfc281FnDf
