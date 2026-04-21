/**
 * 发票到期提醒模块
 * 
 * 自动检查发票逾期情况，提供提醒
 */

import { SalesInvoice, PurchaseInvoice } from './types';

// 发票逾期状态
export type OverdueStatus = 'normal' | 'due_soon' | 'overdue' | 'critical';

// 逾期提醒信息
export interface InvoiceReminder {
  invoiceId: string;
  invoiceNo: string;
  invoiceType: 'sales' | 'purchase';
  customerName?: string;     // 客户名称（销售发票）
  vendorName?: string;       // 供应商名称（采购发票）
  amount: number;
  dueDate: string;
  daysUntilDue: number;      // 距离到期天数（负数表示已逾期）
  overdueStatus: OverdueStatus;
  messages: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// 逾期汇总
export interface OverdueSummary {
  totalOverdueCount: number;      // 逾期发票数量
  totalOverdueAmount: number;     // 逾期总金额
  totalDueSoonCount: number;      // 即将到期数量（7天内）
  totalDueSoonAmount: number;     // 即将到期总金额
  byCustomer: {                    // 按客户/供应商汇总
    name: string;
    count: number;
    amount: number;
  }[];
  urgentInvoices: InvoiceReminder[]; // 紧急发票（逾期30天以上）
}

/**
 * 检查单个发票的逾期状态
 */
export function checkInvoiceStatus(invoice: SalesInvoice | PurchaseInvoice): {
  overdueStatus: OverdueStatus;
  daysUntilDue: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 优先使用到期日期，其次使用开票日期+30天
  let dueDate: Date;
  if (invoice.到期日期) {
    dueDate = new Date(invoice.到期日期);
  } else {
    // 默认30天账期
    dueDate = new Date(invoice.开票日期 || new Date());
    dueDate.setDate(dueDate.getDate() + 30);
  }
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let overdueStatus: OverdueStatus;
  if (daysUntilDue < 0) {
    if (daysUntilDue < -30) {
      overdueStatus = 'critical'; // 逾期30天以上
    } else {
      overdueStatus = 'overdue';  // 逾期
    }
  } else if (daysUntilDue <= 7) {
    overdueStatus = 'due_soon';   // 7天内到期
  } else {
    overdueStatus = 'normal';
  }
  
  return { overdueStatus, daysUntilDue };
}

/**
 * 获取发票提醒信息
 */
export function getInvoiceReminder(
  invoice: SalesInvoice | PurchaseInvoice,
  type: 'sales' | 'purchase'
): InvoiceReminder {
  const { overdueStatus, daysUntilDue } = checkInvoiceStatus(invoice);
  
  const amount = Number(invoice.金额) || 0;
  const receivedOrPaid = type === 'sales' 
    ? Number((invoice as SalesInvoice).已收金额) || 0
    : Number((invoice as PurchaseInvoice).已付金额) || 0;
  const remainingAmount = amount - receivedOrPaid;
  
  const messages: string[] = [];
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';
  
  if (overdueStatus === 'critical') {
    messages.push(`🚨 已逾期${Math.abs(daysUntilDue)}天，资金压力极大！`);
    messages.push(`💰 尚有${remainingAmount.toFixed(2)}元未${type === 'sales' ? '收款' : '付款'}`);
    priority = 'urgent';
  } else if (overdueStatus === 'overdue') {
    messages.push(`⚠️ 已逾期${Math.abs(daysUntilDue)}天`);
    messages.push(`💵 尚有${remainingAmount.toFixed(2)}元未${type === 'sales' ? '收款' : '付款'}`);
    priority = 'high';
  } else if (overdueStatus === 'due_soon') {
    messages.push(`⏰ 即将到期，剩余${daysUntilDue}天`);
    if (remainingAmount > 0) {
      messages.push(`💰 尚有${remainingAmount.toFixed(2)}元未${type === 'sales' ? '收款' : '付款'}`);
    }
    priority = 'medium';
  } else {
    messages.push(`✓ 账期正常，距到期还有${daysUntilDue}天`);
  }
  
  return {
    invoiceId: invoice.id,
    invoiceNo: invoice.单号,
    invoiceType: type,
    customerName: type === 'sales' ? (invoice as SalesInvoice).客户名称 : undefined,
    vendorName: type === 'purchase' ? (invoice as PurchaseInvoice).供应商名称 : undefined,
    amount,
    dueDate: invoice.到期日期 || '',
    daysUntilDue,
    overdueStatus,
    messages,
    priority,
  };
}

/**
 * 获取逾期汇总
 */
export function getOverdueSummary(
  salesInvoices: SalesInvoice[],
  purchaseInvoices: PurchaseInvoice[]
): OverdueSummary {
  const allReminders: InvoiceReminder[] = [
    ...salesInvoices.map(inv => getInvoiceReminder(inv, 'sales')),
    ...purchaseInvoices.map(inv => getInvoiceReminder(inv, 'purchase')),
  ];
  
  const overdueInvoices = allReminders.filter(r => 
    r.overdueStatus === 'overdue' || r.overdueStatus === 'critical'
  );
  const dueSoonInvoices = allReminders.filter(r => r.overdueStatus === 'due_soon');
  
  // 按客户/供应商分组
  const groupByName = allReminders
    .filter(r => r.overdueStatus !== 'normal')
    .reduce((acc, r) => {
      const name = r.invoiceType === 'sales' ? r.customerName : r.vendorName;
      if (name) {
        if (!acc[name]) acc[name] = { name, count: 0, amount: 0 };
        acc[name].count++;
        acc[name].amount += r.amount;
      }
      return acc;
    }, {} as Record<string, { name: string; count: number; amount: number }>);
  
  return {
    totalOverdueCount: overdueInvoices.length,
    totalOverdueAmount: overdueInvoices.reduce((sum, r) => sum + r.amount, 0),
    totalDueSoonCount: dueSoonInvoices.length,
    totalDueSoonAmount: dueSoonInvoices.reduce((sum, r) => sum + r.amount, 0),
    byCustomer: Object.values(groupByName).sort((a, b) => b.amount - a.amount),
    urgentInvoices: allReminders.filter(r => r.overdueStatus === 'critical'),
  };
}
