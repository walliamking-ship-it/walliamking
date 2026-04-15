'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { MoneyCell } from '@/components/StatusBadge';
import { SalesOrder, Customer } from '@/lib/types';
import { SalesOrderRepo } from '@/lib/repo';
import { CustomerRepo } from '@/lib/repo';

interface ArCustomer {
  id: string;
  customerName: string;
  customerCode: string;
  totalContract: number;
  totalDelivered: number;
  totalReceived: number;
  totalUnpaid: number;
  orderCount: number;
}

export default function ArSummaryReport() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showZero, setShowZero] = useState(true); // Show customers with 0 unpaid

  const loadData = async () => {
    setLoading(true);
    try {
      const [o, c] = await Promise.all([SalesOrderRepo.findAll(), CustomerRepo.findAll()]);
      setOrders(o);
      setCustomers(c);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // Group by customer
  const customerMap = new Map<string, ArCustomer>();
  for (const o of orders) {
    const name = o.客户名称;
    if (!customerMap.has(name)) {
      customerMap.set(name, {
        id: name,
        customerName: name,
        customerCode: name.split('-')[0] || '',
        totalContract: 0,
        totalDelivered: 0,
        totalReceived: 0,
        totalUnpaid: 0,
        orderCount: 0,
      });
    }
    const entry = customerMap.get(name)!;
    entry.totalContract += o.合同金额 || 0;
    entry.totalDelivered += o.已送货 || 0;
    entry.totalReceived += o.已收款 || 0;
    entry.totalUnpaid += o.未收款项 || 0;
    entry.orderCount += 1;
  }

  let summary: ArCustomer[] = Array.from(customerMap.values());

  // Sort by unpaid descending (most owed first)
  summary.sort((a, b) => b.totalUnpaid - a.totalUnpaid);

  const filtered = summary.filter(c => {
    if (!showZero && c.totalUnpaid === 0) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.customerName.toLowerCase().includes(q) || c.customerCode.toLowerCase().includes(q);
    }
    return true;
  });

  // Stats
  const totalAr = summary.reduce((s, c) => s + c.totalUnpaid, 0);
  const totalOrders = summary.reduce((s, c) => s + c.orderCount, 0);
  const customersWithAr = summary.filter(c => c.totalUnpaid > 0).length;

  const columns: Column<ArCustomer>[] = [
    { key: 'customerCode', label: '客户编号', sortable: true },
    { key: 'customerName', label: '客户名称', sortable: true },
    { key: 'orderCount', label: '订单数', sortable: true },
    { key: 'totalContract', label: '合同总额', sortable: true },
    { key: 'totalDelivered', label: '已送货', sortable: true },
    { key: 'totalReceived', label: '已收款', sortable: true },
    { key: 'totalUnpaid', label: '未收款', sortable: true },
    { key: 'status', label: '状态', sortable: false },
  ];

  const tableColumns: Column<ArCustomer>[] = columns.map(col => {
    if (col.key === 'totalContract' || col.key === 'totalDelivered' || col.key === 'totalReceived') {
      return { ...col, render: (item) => <MoneyCell value={item[col.key as keyof ArCustomer] as number} /> };
    }
    if (col.key === 'totalUnpaid') {
      return {
        ...col,
        render: (item) => {
          const val = item.totalUnpaid;
          return <MoneyCell value={val} className={val > 0 ? 'text-red-600 font-semibold' : 'text-green-600'} />;
        },
      };
    }
    if (col.key === 'status') {
      return {
        ...col,
        render: (item) => {
          if (item.totalUnpaid === 0) return <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">已结清</span>;
          if (item.totalUnpaid > 50000) return <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">欠款高</span>;
          return <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">有欠款</span>;
        },
      };
    }
    return col;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 报表标题 */}
      <div className="bg-white border-b px-5 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">收款欠款汇总</h1>
          <p className="text-xs text-gray-500 mt-0.5">客户应收款汇总，按未收金额从高到低排列</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span>共 <span className="font-semibold text-gray-800">{customersWithAr}</span> 位客户有欠款</span>
          <span>总欠款: <span className="font-semibold text-red-600">¥{totalAr.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span></span>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white border-b px-5 py-2 flex items-center gap-4">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-gray-500">搜索:</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-40" placeholder="客户编号/名称" />
        </div>
        <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={showZero} onChange={e => setShowZero(e.target.checked)} className="rounded" />
          显示已结清客户
        </label>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 px-5 py-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-xs text-gray-500">欠款总额</div>
          <div className="text-xl font-bold text-red-600 mt-1">¥{totalAr.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-xs text-gray-500">有欠款客户</div>
          <div className="text-xl font-bold text-gray-800 mt-1">{customersWithAr}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-xs text-gray-500">总订单数</div>
          <div className="text-xl font-bold text-gray-800 mt-1">{totalOrders}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-xs text-gray-500">平均欠款</div>
          <div className="text-xl font-bold text-gray-800 mt-1">
            ¥{customersWithAr > 0 ? (totalAr / customersWithAr).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="flex-1 overflow-auto px-5 pb-5">
        <div className="bg-white rounded-lg shadow-sm border overflow-auto">
          <OrderTable
            columns={tableColumns}
            data={filtered}
            loading={loading}
            emptyMessage="暂无欠款数据"
          />
        </div>
      </div>
    </div>
  );
}
