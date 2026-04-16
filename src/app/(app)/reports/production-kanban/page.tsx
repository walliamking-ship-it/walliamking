'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { SalesOrder, WorkOrder, JobReport } from '@/lib/types';
import { SalesOrderRepo, WorkOrderRepo, JobReportRepo } from '@/lib/repo';

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-16 text-right">{value} / {total}</span>
    </div>
  );
}

function KanbanCard({ so, workOrders }: { so: SalesOrder; workOrders: WorkOrder[] }) {
  const woList = workOrders.filter(w => w.关联销售订单id === so.id);
  const totalProduced = woList.reduce((s, w) => s + w.已完成数量, 0);
  const totalPlanned = woList.reduce((s, w) => s + w.计划数量, 0);
  const overallPct = totalPlanned > 0 ? Math.round((totalProduced / totalPlanned) * 100) : 0;

  const statusColor = (() => {
    if (woList.length === 0) return 'bg-gray-50 border-gray-200';
    if (woList.every(w => w.状态 === '已完成' || w.状态 === '已入库')) return 'bg-green-50 border-green-200';
    if (woList.some(w => w.状态 === '生产中')) return 'bg-yellow-50 border-yellow-200';
    return 'bg-white border-gray-200';
  })();

  const statusBadge = (() => {
    if (woList.length === 0) return <span className="text-xs text-gray-400">未下达施工单</span>;
    if (woList.every(w => w.状态 === '已完成' || w.状态 === '已入库')) return <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">已完成</span>;
    if (woList.some(w => w.状态 === '生产中')) return <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">生产中</span>;
    return <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">待生产</span>;
  })();

  return (
    <div className={`border rounded-lg p-4 space-y-3 transition-colors ${statusColor}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-blue-600 text-xs font-medium">{so.单号}</div>
          <div className="text-sm text-gray-800 font-medium mt-0.5">{so.客户名称}</div>
        </div>
        {statusBadge}
      </div>

      {/* 总体进度 */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>总进度</span>
          <span className="font-medium text-blue-600">{overallPct}%</span>
        </div>
        <ProgressBar value={totalProduced} total={totalPlanned} />
      </div>

      {/* 各施工单 */}
      {woList.length > 0 ? (
        <div className="space-y-2 border-t pt-2">
          {woList.map(wo => {
            const pct = wo.计划数量 > 0 ? Math.round((wo.已完成数量 / wo.计划数量) * 100) : 0;
            const woStatusColor = wo.状态 === '已完成' || wo.状态 === '已入库' ? 'bg-green-100 text-green-700'
              : wo.状态 === '生产中' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600';
            return (
              <div key={wo.id} className="bg-white/60 rounded p-2 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-mono text-gray-600">{wo.单号}</div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${woStatusColor}`}>{wo.状态}</span>
                </div>
                <div className="text-xs text-gray-500">{wo.产品名称} × {wo.计划数量}</div>
                <ProgressBar value={wo.已完成数量} total={wo.计划数量} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-gray-400 text-center py-2">暂无施工单</div>
      )}
    </div>
  );
}

export default function ProductionKanbanPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'全部' | '待生产' | '生产中' | '已完成'>('全部');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sos, wos] = await Promise.all([SalesOrderRepo.findAll(), WorkOrderRepo.findAll()]);
      setSalesOrders(sos);
      setWorkOrders(wos);
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const filtered = salesOrders.filter(so => {
    const q = search.toLowerCase();
    const matchSearch = !q || [so.单号, so.客户名称].some(v => v?.toLowerCase().includes(q));
    if (!matchSearch) return false;

    const woList = workOrders.filter(w => w.关联销售订单id === so.id);
    if (statusFilter === '全部') return true;
    if (statusFilter === '待生产') return woList.length === 0 || woList.every(w => w.状态 === '待生产');
    if (statusFilter === '生产中') return woList.some(w => w.状态 === '生产中');
    if (statusFilter === '已完成') return woList.length > 0 && woList.every(w => w.状态 === '已完成' || w.状态 === '已入库');
    return true;
  });

  const tabs = [
    { label: '全部', active: statusFilter === '全部', onClick: () => setStatusFilter('全部') },
    { label: '待生产', active: statusFilter === '待生产', onClick: () => setStatusFilter('待生产') },
    { label: '生产中', active: statusFilter === '生产中', onClick: () => setStatusFilter('生产中') },
    { label: '已完成', active: statusFilter === '已完成', onClick: () => setStatusFilter('已完成') },
  ];

  const stats = (() => {
    const all = salesOrders;
    const withWo = new Set(workOrders.map(w => w.关联销售订单id));
    const producing = new Set(workOrders.filter(w => w.状态 === '生产中').map(w => w.关联销售订单id));
    const done = new Set(workOrders.filter(w => w.状态 === '已完成' || w.状态 === '已入库').map(w => w.关联销售订单id));
    return {
      total: all.length,
      notStarted: all.filter(s => !withWo.has(s.id)).length,
      producing: all.filter(s => producing.has(s.id)).length,
      done: all.filter(s => done.has(s.id)).length,
    };
  })();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="生产看板"
        subtitle="按销售订单查看生产进度"
        searchPlaceholder="搜索 销售单号 / 客户名称..."
        onSearch={setSearch}
        tabs={tabs}
      />

      {/* 统计行 */}
      {!loading && (
        <div className="px-5 py-3 bg-white border-b flex gap-6">
          <div className="text-xs"><span className="text-gray-500">销售订单总数：</span><span className="font-medium text-gray-800">{stats.total}</span></div>
          <div className="text-xs"><span className="text-gray-500">待生产：</span><span className="font-medium text-gray-400">{stats.notStarted}</span></div>
          <div className="text-xs"><span className="text-gray-500">生产中：</span><span className="font-medium text-yellow-600">{stats.producing}</span></div>
          <div className="text-xs"><span className="text-gray-500">已完成/已入库：</span><span className="font-medium text-green-600">{stats.done}</span></div>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-gray-50 p-5">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">暂无数据</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filtered.map(so => (
              <KanbanCard key={so.id} so={so} workOrders={workOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
