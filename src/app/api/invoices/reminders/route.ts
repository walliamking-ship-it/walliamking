import { NextRequest, NextResponse } from 'next/server';
import { TABLE_IDS } from '@/lib/tableIds';
import { SalesInvoice, PurchaseInvoice } from '@/lib/types';
import { getInvoiceReminder, getOverdueSummary } from '@/lib/invoiceReminder';

const APP_ID = 'cli_a9521be8ba351cb2';
const APP_SECRET = '3pjAPhlHHM89rNh94Iu3BcUPqTlCVBJE';
const APP_TOKEN = 'HfLfbLOE5aQCy5sZXHfc281FnDf';

async function getToken(): Promise<string> {
  const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET })
  });
  const data = await res.json();
  return data.tenant_access_token;
}

// 过滤未完成发票（金额 > 已收/已付）
function filterUnpaidInvoices<T extends { 金额: number; 已收金额?: number; 已付金额?: number }>(
  invoices: T[],
  type: 'sales' | 'purchase'
): T[] {
  return invoices.filter(inv => {
    const amount = Number(inv.金额) || 0;
    const received = type === 'sales' ? Number(inv.已收金额) || 0 : Number(inv.已付金额) || 0;
    return amount > received;
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'sales' | 'purchase' | 'all'
  
  try {
    const token = await getToken();
    
    // 获取销售发票
    const salesRes = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_IDS.invoices}/records?page_size=500`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const salesData = await salesRes.json();
    
    if (salesData.code !== 0) {
      return NextResponse.json(salesData, { status: 500 });
    }
    
    // 过滤销售发票（只保留未完成支付的）
    const allSalesInvoices = (salesData.data?.items || []).map((r: any) => r.fields) as SalesInvoice[];
    const unpaidSalesInvoices = filterUnpaidInvoices(allSalesInvoices, 'sales');
    
    // 获取采购发票（同一张表，但可以通过类型区分）
    const allPurchaseInvoices = allSalesInvoices.filter(inv => 
      inv.发票类型?.includes('采购') || inv.关联采购订单号
    );
    const unpaidPurchaseInvoices = filterUnpaidInvoices(allPurchaseInvoices, 'purchase');
    
    // 获取逾期汇总
    const summary = getOverdueSummary(unpaidSalesInvoices, unpaidPurchaseInvoices);
    
    // 根据type返回不同结果
    if (type === 'sales') {
      const reminders = unpaidSalesInvoices.map(inv => getInvoiceReminder(inv, 'sales'));
      return NextResponse.json({
        code: 0,
        data: {
          reminders,
          summary: {
            totalOverdueCount: reminders.filter(r => r.overdueStatus !== 'normal').length,
            totalOverdueAmount: reminders
              .filter(r => r.overdueStatus === 'overdue' || r.overdueStatus === 'critical')
              .reduce((sum, r) => sum + r.amount, 0),
          }
        }
      });
    }
    
    if (type === 'purchase') {
      const reminders = unpaidPurchaseInvoices.map(inv => getInvoiceReminder(inv, 'purchase'));
      return NextResponse.json({
        code: 0,
        data: {
          reminders,
          summary: {
            totalOverdueCount: reminders.filter(r => r.overdueStatus !== 'normal').length,
            totalOverdueAmount: reminders
              .filter(r => r.overdueStatus === 'overdue' || r.overdueStatus === 'critical')
              .reduce((sum, r) => sum + r.amount, 0),
          }
        }
      });
    }
    
    // 返回全部
    return NextResponse.json({
      code: 0,
      data: {
        summary,
        salesReminders: unpaidSalesInvoices.map(inv => getInvoiceReminder(inv, 'sales')),
        purchaseReminders: unpaidPurchaseInvoices.map(inv => getInvoiceReminder(inv, 'purchase')),
      }
    });
    
  } catch (e: any) {
    console.error('Invoice reminders error:', e);
    return NextResponse.json({ code: 500, msg: e.message });
  }
}
