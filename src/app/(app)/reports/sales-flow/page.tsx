'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { MoneyCell, DateCell } from '@/components/StatusBadge';
import { SalesOrder } from '@/lib/types';
import { SalesOrderRepo } from '@/lib/repo';

type FilterTab = 'all' | 'thisMonth' | 'lastMonth' | 'thisYear';

export default function SalesFlowReport() {
  const [data, setData] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const loadData = async () => {
    setLoading(true);
    try { setData(await SalesOrderRepo.findAll()); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleTabChange = (tab: FilterTab) => {
    setFilterTab(tab);
    const now = new Date();
    let from = '', to = '';
    if (tab === 'thisMonth') {
      from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    } else if (tab === 'lastMonth') {
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      from = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-01`;
      to = last.toISOString().slice(0, 10);
    } else if (tab === 'thisYear') {
      from = `${now.getFullYear()}-01-01`;
      to = `${now.getFullYear()}-12-31`;
    }
    setDateFrom(from);
    setDateTo(to);
  };

  const filtered = data.filter(item => {
    if (dateFrom && item.日期 < dateFrom) return false;
    if (dateTo && item.日期 > dateTo) return false;
    if (customerFilter) {
      const q = customerFilter.toLowerCase();
      if (!item.客户名称.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Sort by date descending
  const sorted = [...filtered].sort((a, b) => b.日期.localeCompare(a.日期));

  // Summary stats
  const totalContract = filtered.reduce((s, d) => s + (d.合同金额 || 0), 0);
  const totalDelivered = filtered.reduce((s, d) => s + (d.已送货 || 0), 0);
  const totalReceived = filtered.reduce((s, d) => s + (d.已收款 || 0), 0);
  const totalUnpaid = filtered.reduce((s, d) => s + (d.未收款项 || 0), 0);

  const columns: Column<SalesOrder>[] = [
    { key: '单号', label: '单号', sortable: true },
    { key: '客户名称', label: '客户', sortable: true },
    { key: '日期', label: '日期', sortable: true },
    { key: '送货状态', label: '送货状态', sortable: true },
    { key: '收款状态', label: '收款状态', sortable: true },
    { key: '合同金额', label: '合同金额', sortable: true },
    { key: '已送货', label: '已送货', sortable: true },
    { key: '已收款', label: '已收款', sortable: true },
    { key: '未收款项', label: '未收款', sortable: true },
    { key: '制单人', label: '制单人' },
    { key: '备注', label: '备注' },
  ];

  const tableColumns: Column<SalesOrder>[] = [
    ...columns,
    {
      key: 'actions', label: '操作',
      render: (item) => (
        <a href="/sales-orders" className="text-blue-600 hover:underline text-xs">查看详情</a>
      ),
    },
  ];

  const tabs = [
    { label: '全部', active: filterTab === 'all', onClick: () => handleTabChange('all') },
    { label: '本月', active: filterTab === 'thisMonth', onClick: () => handleTabChange('thisMonth') },
    { label: '上月', active: filterTab === 'lastMonth', onClick: () => handleTabChange('lastMonth') },
    { label: '本年', active: filterTab === 'thisYear', onClick: () => handleTabChange('thisYear') },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 报表标题栏 */}
      <div className="bg-white border-b px-5 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">销售流水表</h1>
          <p className="text-xs text-gray-500 mt-0.5">查看所有销售出库记录，支持按时间和客户筛选</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>共 <span className="font-semibold text-gray-800">{filtered.length}</span> 条记录</span>
          <span>合计: <span className="font-semibold text-gray-800">¥{totalContract.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span></span>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white border-b px-5 py-2 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-gray-500">时间:</span>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setFilterTab('all'); }}
            className="border rounded px-2 py-1 text-sm" />
          <span className="text-gray-400">至</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setFilterTab('all'); }}
            className="border rounded px-2 py-1 text-sm" />
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-gray-500">客户:</span>
          <input type="text" value={customerFilter} onChange={e => setCustomerFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-32" placeholder="输入客户名" />
        </div>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t.label} onClick={t.onClick}
              className={`px-3 py-1 text-xs rounded ${t.active ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 px-5 py-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-xs text-gray-500">合同金额合计</div>
          <div className="text-lg font-semibold text-gray-800 mt-1">¥{totalContract.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-xs text-gray-500">已送货合计</div>
          <div className="text-lg font-semibold text-blue-600 mt-1">¥{totalDelivered.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-xs text-gray-500">已收款合计</div>
          <div className="text-lg font-semibold text-green-600 mt-1">¥{totalReceived.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-xs text-gray-500">未收款合计</div>
          <div className={`text-lg font-semibold mt-1 ${totalUnpaid > 0 ? 'text-red-600' : 'text-green-600'}`}>
            ¥{totalUnpaid.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="flex-1 overflow-auto px-5 pb-5">
        <div className="bg-white rounded-lg shadow-sm border">
          <OrderTable
            columns={tableColumns}
            data={sorted}
            loading={loading}
            emptyMessage="暂无销售记录"
          />
        </div>
      </div>
    </div>
  );
}
