/**
 * 三单匹配验证模块 (Purchase Three-Way Matching)
 * 
 * 采购三单匹配是指：
 * 1. 采购订单 (Purchase Order) - 采购合同
 * 2. 收货单 (Receiving Order) - 实际入库货物
 * 3. 发票 (Invoice) - 供应商开具的发票
 * 
 * 匹配验证规则：
 * - 订单金额 = 收货数量 × 单价
 * - 发票金额应 ≤ 订单未完成金额
 * - 发票金额应 ≤ 收货单未核销金额
 */

import { PurchaseOrder, ReceivingOrder, PurchaseInvoice } from './types';

// 三单匹配状态
export type MatchStatus = 'matched' | 'partial' | 'over' | 'unmatched';

export interface MatchResult {
  status: MatchStatus;
  orderAmount: number;          // 订单金额
  receivedAmount: number;       // 收货金额
  invoicedAmount: number;       // 发票金额
  matchedAmount: number;        // 已匹配金额
  remainingOrderAmount: number; // 订单剩余金额
  remainingReceivingAmount: number; // 收货单剩余金额
  messages: string[];           // 验证消息
}

/**
 * 验证采购订单、收货单、发票三单匹配
 */
export function verifyThreeWayMatch(
  order: PurchaseOrder,
  receiving: ReceivingOrder,
  invoice: PurchaseInvoice
): MatchResult {
  const messages: string[] = [];
  
  const orderAmount = Number(order.合同金额) || 0;
  const receivedAmount = Number(receiving.收货数量) || Number(receiving.收货金额) || 0;
  const invoicedAmount = Number(invoice.金额) || 0;
  
  // 计算已匹配金额（假设收货单和发票都是部分匹配）
  const matchedAmount = Math.min(orderAmount, receivedAmount, invoicedAmount);
  
  // 订单剩余
  const remainingOrderAmount = orderAmount - matchedAmount;
  
  // 收货单剩余
  const remainingReceivingAmount = receivedAmount - matchedAmount;
  
  // 判断匹配状态
  let status: MatchStatus;
  if (Math.abs(invoicedAmount - matchedAmount) < 0.01) {
    status = 'matched';
    messages.push('✓ 三单金额匹配');
  } else if (invoicedAmount < matchedAmount) {
    status = 'partial';
    messages.push(`⚠ 发票金额(${invoicedAmount})小于订单/收货金额(${matchedAmount})`);
  } else {
    status = 'over';
    messages.push(`✗ 发票金额(${invoicedAmount})超过订单/收货金额(${matchedAmount})`);
  }
  
  // 金额验证
  if (invoicedAmount > orderAmount) {
    messages.push(`✗ 发票金额(${invoicedAmount})超过订单金额(${orderAmount})`);
  }
  
  if (invoicedAmount > receivedAmount) {
    messages.push(`✗ 发票金额(${invoicedAmount})超过收货金额(${receivedAmount})`);
  }
  
  // 供应商验证
  if (order.供应商名称 && invoice.供应商名称 && order.供应商名称 !== invoice.供应商名称) {
    messages.push(`✗ 订单供应商(${order.供应商名称})与发票供应商(${invoice.供应商名称})不一致`);
  }
  
  // 日期验证
  if (receiving.收货日期 && invoice.开票日期) {
    if (new Date(invoice.开票日期) < new Date(receiving.收货日期)) {
      messages.push(`⚠ 发票日期(${invoice.开票日期})早于收货日期(${receiving.收货日期})`);
    }
  }
  
  return {
    status,
    orderAmount,
    receivedAmount,
    invoicedAmount,
    matchedAmount,
    remainingOrderAmount,
    remainingReceivingAmount,
    messages,
  };
}

/**
 * 批量验证：检查某采购订单的所有发票匹配情况
 */
export interface OrderMatchSummary {
  orderId: string;
  orderNo: string;
  orderAmount: number;
  totalInvoiced: number;       // 已开票总额
  totalPaid: number;           // 已付款总额
  remainingAmount: number;     // 未开票金额
  matchDetails: {
    invoiceId: string;
    invoiceNo: string;
    invoiceAmount: number;
    status: MatchStatus;
  }[];
}

export function getOrderMatchSummary(
  order: PurchaseOrder,
  invoices: PurchaseInvoice[]
): OrderMatchSummary {
  const orderAmount = Number(order.合同金额) || 0;
  
  const matchDetails = invoices.map(inv => {
    // 简化验证：直接比较金额
    const status: MatchStatus = 
      Math.abs(inv.金额 - orderAmount) < 0.01 ? 'matched' :
      inv.金额 < orderAmount ? 'partial' : 'over';
    
    return {
      invoiceId: inv.id,
      invoiceNo: inv.单号,
      invoiceAmount: inv.金额,
      status,
    };
  });
  
  const totalInvoiced = matchDetails.reduce((sum, d) => sum + d.invoiceAmount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (Number(inv.已付金额) || 0), 0);
  
  return {
    orderId: order.id,
    orderNo: order.单号,
    orderAmount,
    totalInvoiced,
    totalPaid,
    remainingAmount: orderAmount - totalInvoiced,
    matchDetails,
  };
}
