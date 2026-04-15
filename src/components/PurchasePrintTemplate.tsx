'use client';

import { useRef } from 'react';
import { PurchaseOrder } from '@/lib/types';

interface PurchasePrintTemplateProps {
  order: PurchaseOrder;
}

export default function PurchasePrintTemplate({ order }: PurchasePrintTemplateProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (ref.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>采购入库单 - ${order.单号}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'SimSun', '宋体', serif; font-size: 14px; color: #000; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
    .header .order-no { font-size: 13px; color: #666; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 20px; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 12px; }
    .info-item { display: flex; gap: 4px; }
    .info-item .label { color: #666; min-width: 70px; }
    .info-item .value { font-weight: bold; }
    .info-item .value.green { color: #009900; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px; background: #f5f5f5; padding: 12px; border-radius: 4px; }
    .summary-item { text-align: center; }
    .summary-item .label { font-size: 12px; color: #666; margin-bottom: 2px; }
    .summary-item .value { font-size: 16px; font-weight: bold; }
    .summary-item .value.red { color: #cc0000; }
    .summary-item .value.green { color: #009900; }
    .summary-item .value.blue { color: #0066cc; }
    .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; font-size: 12px; color: #666; }
    .footer-item { text-align: center; }
    .footer-item .sign { border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  ${ref.current.innerHTML}
</body>
</html>`);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
      }
    }
  };

  const formatMoney = (v: number) => v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button onClick={handlePrint}
          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
          🖨️ 打印入库单
        </button>
        <span className="text-xs text-gray-500">单号: <span className="font-mono">{order.单号}</span></span>
      </div>

      <div ref={ref} className="bg-white p-6 border rounded-lg" style={{ width: '210mm', minHeight: '297mm' }}>
        <div className="header">
          <h1>采购入库单</h1>
          <div className="order-no">No. {order.单号}</div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="label">供应商:</span>
            <span className="value green">{order.供应商名称}</span>
          </div>
          <div className="info-item">
            <span className="label">日期:</span>
            <span className="value">{order.日期}</span>
          </div>
          <div className="info-item">
            <span className="label">制单人:</span>
            <span className="value">{order.制单人 || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">业务员:</span>
            <span className="value">{order.业务员 || '-'}</span>
          </div>
          <div className="info-item">
            <span className="label">付款状态:</span>
            <span className="value">{order.付款状态}</span>
          </div>
          <div className="info-item">
            <span className="label">收货状态:</span>
            <span className="value">{order.收货状态}</span>
          </div>
          <div className="info-item">
            <span className="label">计划付款:</span>
            <span className="value">{order.计划付款日期 || '-'}</span>
          </div>
          {order.收货地址 && (
            <div className="info-item full">
              <span className="label">收货地址:</span>
              <span className="value">{order.收货地址}</span>
            </div>
          )}
        </div>

        <div className="summary-grid">
          <div className="summary-item">
            <div className="label">合同金额</div>
            <div className="value">¥{formatMoney(order.合同金额 || 0)}</div>
          </div>
          <div className="summary-item">
            <div className="label">已收货</div>
            <div className="value blue">¥{formatMoney(order.已收货 || 0)}</div>
          </div>
          <div className="summary-item">
            <div className="label">已付款</div>
            <div className="value green">¥{formatMoney(order.已付款 || 0)}</div>
          </div>
          <div className="summary-item">
            <div className="label">未付款</div>
            <div className={`value ${(order.未付款 || 0) > 0 ? 'red' : 'green'}`}>
              ¥{formatMoney(order.未付款 || 0)}
            </div>
          </div>
        </div>

        {order.备注 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm">
            <span className="font-semibold text-yellow-800">备注:</span> {order.备注}
          </div>
        )}

        <div className="footer">
          <div className="footer-item">
            <div>供应商签收</div>
            <div className="sign">签名: ______________</div>
          </div>
          <div className="footer-item">
            <div>收货人</div>
            <div className="sign">签名: ______________</div>
          </div>
          <div className="footer-item">
            <div>日期</div>
            <div className="sign">日期: ______________</div>
          </div>
        </div>
      </div>
    </div>
  );
}
