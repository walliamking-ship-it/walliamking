'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import { Inventory } from '@/lib/types';
import { InventoryRepo } from '@/lib/repo';

type FilterTab = 'all' | 'alert' | 'out' | 'normal';

export default function InventoryReport() {
  const [data, setData] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try { setData(await InventoryRepo.findAll()); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || [item.产品名称, item.货号, item.分类, item.备注]
      .some(v => v?.toLowerCase().includes(q));
    const current = item.当前库存 || 0;
    const safe = item.安全库存 || 0;
    const below = current < safe;
    const out = current === 0;
    const matchFilter =
      filterTab === 'all' ||
      (filterTab === 'alert' && below && !out) ||
      (filterTab === 'out' && out) ||
      (filterTab === 'normal' && !below && !out);
    return matchSearch && matchFilter;
  });

  // Stats
  const total = data.length;
  const alertCount = data.filter(i => (i.当前库存 || 0) < (i.安全库存 || 0) && (i.当前库存 || 0) > 0).length;
  const outCount = data.filter(i => (i.当前库存 || 0) === 0).length;
  const normalCount = total - alertCount - outCount;
  const totalValue = data.reduce((s, i) => s + (i.当前库存 || 0) * (i.参考进价 || 0), 0);

  const tableColumns: Column<Inventory>[] = [
    { key: '货号', label: '货号', sortable: true },
    { key: '产品名称', label: '产品名称', sortable: true },
    { key: '分类', label: '分类', sortable: true },
    { key: '单位', label: '单位' },
    { key: '当前库存', label: '当前库存', sortable: true },
    { key: '安全库存', label: '安全库存', sortable: true },
    { key: '采购在途', label: '采购在途' },
    { key: '销售在途', label: '销售在途' },
    { key: '参考进价', label: '参考进价' },
    {
      key: '状态',
      label: '状态',
      render: (item: Inventory) => {
        const current = item.当前库存 || 0;
        const safe = item.安全库存 || 0;
        if (current === 0) return <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">已用尽</span>;
        if (current < safe * 0.5) return <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">严重不足</span>;
        if (current < safe) return <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">库存预警</span>;
        return <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">正常</span>;
      },
    },
    { key: '备注', label: '备注' },
  ];

  const tabs = [
    { label: `全部 (${total})`, active: filterTab === 'all', onClick: () => setFilterTab('all') },
    { label: `⚠️ 预警 (${alertCount})`, active: filterTab === 'alert', onClick: () => setFilterTab('alert'), className: alertCount > 0 ? 'text-red-600' : '' },
    { label: `❌ 用尽 (${outCount})`, active: filterTab === 'out', onClick: () => setFilterTab('out'), className: outCount > 0 ? 'text-gray-600' : '' },
    { label: `✅ 正常 (${normalCount})`, active: filterTab === 'normal', onClick: () => setFilterTab('normal') },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b px-5 py-3">
        <h1 className="text-base font-semibold">库存报表</h1>
        <p className="text-xs text-gray-500 mt-0.5">各仓库库存数量汇总与预警分析</p>
      </div>

      <div className="bg-white border-b px-5 py-2 flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索 产品名称 / 货号 / 分类..."
            className="w-64 border rounded px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t.label} onClick={t.onClick}
              className={`px-3 py-1 rounded text-sm ${t.className || ''} ${t.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 px-5 py-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-xs text-gray-500">库存预警</div>
          <div className={`text-xl font-bold mt-1 ${alertCount > 0 ? 'text-orange-500' : 'text-gray-400'}`}>{alertCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-xs text-gray-500">已用尽</div>
          <div className={`text-xl font-bold mt-1 ${outCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>{outCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-xs text-gray-500">库存正常</div>
          <div className="text-xl font-bold text-green-600 mt-1">{normalCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-xs text-gray-500">库存品种数</div>
          <div className="text-xl font-bold text-gray-800 mt-1">{total}</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 pb-5">
        <div className="bg-white rounded-lg shadow-sm border overflow-auto">
          <OrderTable
            columns={tableColumns}
            data={filtered}
            loading={loading}
            emptyMessage="暂无库存数据"
          />
        </div>
      </div>
    </div>
  );
}
