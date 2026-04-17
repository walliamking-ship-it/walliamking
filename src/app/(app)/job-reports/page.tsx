'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { MoneyCell } from '@/components/StatusBadge';
import { JobReport, WorkOrder, Workstation } from '@/lib/types';
import { JobReportRepo, WorkOrderRepo, WorkstationRepo } from '@/lib/repo';

function generateReportNo(): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `BG${dateStr}${seq}`;
}

// 工资汇总行
interface WageSummaryRow {
  id: string;
  worker: string;
  totalQuantity: number;
  totalWage: number;
  reportCount: number;
}

function JobReportFormModal({ open, onClose, onSave, workOrders, workstations }: {
  open: boolean; onClose: () => void;
  onSave: (item: Omit<JobReport, 'id'>) => void;
  workOrders: WorkOrder[];
  workstations: Workstation[];
}) {
  const [form, setForm] = useState({
    单号: '', 工单id: '', 工单号: '', 工序序号: 0, 工序名称: '',
    执行单位: '', 工序单价: 0, 报工数量: 0, 报工日期: '', 报工人: '李紫璘',
    合格率: 100, 不良数量: 0, 备注: '', 创建时间: new Date().toISOString(),
  });

  useEffect(() => {
    if (open) {
      setForm({ 单号: generateReportNo(), 工单id: '', 工单号: '', 工序序号: 0, 工序名称: '', 执行单位: '', 工序单价: 0, 报工数量: 0, 报工日期: new Date().toISOString().slice(0,10), 报工人: '李紫璘', 合格率: 100, 不良数量: 0, 备注: '', 创建时间: new Date().toISOString() });
    }
  }, [open]);

  const updateField = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleWorkOrderChange = (id: string) => {
    const wo = workOrders.find(w => w.id === id);
    if (!wo) return;
    setForm(f => ({ ...f, 工单id: id, 工单号: wo.单号, 执行单位: wo.执行单位 }));
  };

  const handleProcessChange = (seq: number) => {
    const wo = workOrders.find(w => w.id === form.工单id);
    if (!wo) return;
    const proc = wo.工序列表.find(p => p.序号 === seq);
    if (!proc) return;
    // 尝试从工序表获取单价
    const ws = workstations.find(w => w.name === proc.工序名称);
    const unitPrice = ws?.unitPrice || 0;
    setForm(f => ({ ...f, 工序序号: seq, 工序名称: proc.工序名称, 工序单价: unitPrice }));
  };

  if (!open) return null;

  const currentWo = workOrders.find(w => w.id === form.工单id);
  const availableProcesses = currentWo?.工序列表 || [];

  const handleSave = () => {
    if (!form.工单id || !form.工序名称) { alert('请选择工单和工序'); return; }
    if (form.报工数量 <= 0) { alert('报工数量必须大于0'); return; }
    if (form.工序单价 <= 0) { alert('请设置工序单价'); return; }
    onSave(form as Omit<JobReport, 'id'>);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">新建报工记录</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">单号</label>
            <input type="text" value={form.单号} readOnly className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">工单 <span className="text-red-500">*</span></label>
            <select value={form.工单id} onChange={e => handleWorkOrderChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
              <option value="">请选择工单</option>
              {workOrders.filter(w => w.状态 === '生产中' || w.状态 === '待生产').map(w => (
                <option key={w.id} value={w.id}>{w.单号} - {w.产品名称} ({w.执行单位})</option>
              ))}
            </select>
          </div>
          {availableProcesses.length > 0 && (
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">工序 <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {availableProcesses.map(p => (
                  <button key={p.序号} type="button"
                    onClick={() => handleProcessChange(p.序号)}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${form.工序序号 === p.序号 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}`}>
                    {p.序号}. {p.工序名称} ({p.已完成数量}/{p.计划数量})
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">执行单位</label>
              <input type="text" value={form.执行单位} readOnly className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">工序单价 (元/件)</label>
              <input type="number" step="0.01" min={0} value={form.工序单价 || ''} onChange={e => updateField('工序单价', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">报工数量 <span className="text-red-500">*</span></label>
              <input type="number" step="1" value={form.报工数量 || ''} onChange={e => updateField('报工数量', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">预估工资</label>
              <input type="text" value={`¥${((form.报工数量 || 0) * (form.工序单价 || 0)).toFixed(2)}`} readOnly
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-gray-50 text-green-700 font-medium" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">报工日期</label>
              <input type="date" value={form.报工日期} onChange={e => updateField('报工日期', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">报工人</label>
              <input type="text" value={form.报工人} onChange={e => updateField('报工人', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">合格率 (%)</label>
              <input type="number" step="0.1" min={0} max={100} value={form.合格率 ?? 100} onChange={e => updateField('合格率', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">不良数量</label>
              <input type="number" step="1" min={0} value={form.不良数量 ?? 0} onChange={e => updateField('不良数量', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">备注</label>
            <textarea value={form.备注} onChange={e => updateField('备注', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} />
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

type ViewTab = 'reports' | 'wages';

export default function JobReportsPage() {
  const [data, setData] = useState<JobReport[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewTab, setViewTab] = useState<ViewTab>('reports');
  // 工资汇总相关
  const [wageStart, setWageStart] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10);
  });
  const [wageEnd, setWageEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [wageSummary, setWageSummary] = useState<Record<string, WageSummaryRow>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [reports, orders, ws] = await Promise.all([
        JobReportRepo.findAll(), WorkOrderRepo.findAll(), WorkstationRepo.findAll()
      ]);
      setData(reports);
      setWorkOrders(orders);
      setWorkstations(ws);
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  // 加载工资汇总
  const loadWageSummary = async () => {
    const summary = await JobReportRepo.getWageSummary(wageStart, wageEnd);
    const rows: Record<string, WageSummaryRow> = {};
    for (const [worker, info] of Object.entries(summary)) {
      rows[worker] = {
        id: worker,
        worker,
        totalQuantity: info.totalQuantity,
        totalWage: info.totalWage,
        reportCount: info.reports.length,
      };
    }
    setWageSummary(rows);
  };
  useEffect(() => { if (viewTab === 'wages') loadWageSummary(); }, [viewTab, wageStart, wageEnd, data]);

  const filtered = data.filter(r => {
    const q = search.toLowerCase();
    return !q || [r.单号, r.工单号, r.工序名称, r.报工人, r.备注].some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Omit<JobReport, 'id'>) => {
    const created = await JobReportRepo.create(form);
    // 自动更新工单工序状态和完成数量
    const wo = workOrders.find(w => w.id === form.工单id);
    if (wo) {
      const updatedList = wo.工序列表.map(p => {
        if (p.序号 === form.工序序号) {
          const newCompleted = p.已完成数量 + form.报工数量;
          return { ...p, 已完成数量: newCompleted, 状态: newCompleted >= p.计划数量 ? '已完成' as const : '报工中' as const, 报工时间: form.报工日期, 报工人: form.报工人 };
        }
        return p;
      });
      const allDone = updatedList.every(p => p.状态 === '已完成');
      await WorkOrderRepo.update(wo.id, {
        工序列表: updatedList,
        已完成数量: updatedList.reduce((s, p) => s + p.已完成数量, 0),
        状态: allDone ? '已完成' as const : '生产中' as const,
      });
    }
    await loadData();
  };

  const handleConfirm = async (id: string) => {
    await JobReportRepo.update(id, { 状态: '已确认' });
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该报工记录？')) return;
    await JobReportRepo.delete(id);
    await loadData();
  };

  const wageColumns: Column<WageSummaryRow>[] = [
    { key: 'worker', label: '工人', sortable: true },
    { key: 'reportCount', label: '报工次数', sortable: true },
    { key: 'totalQuantity', label: '总数量', sortable: true, render: (row: WageSummaryRow) => <span className="font-mono">{row.totalQuantity.toLocaleString()}</span> },
    { key: 'totalWage', label: '计件工资合计', sortable: true, render: (row: WageSummaryRow) => <MoneyCell value={row.totalWage} className="text-green-700 font-semibold" /> },
  ];

  const columns: Column<JobReport>[] = [
    { key: '单号', label: '报工单号', sortable: true },
    { key: '工单号', label: '工单号', sortable: true },
    { key: '工序名称', label: '工序', sortable: true },
    { key: '执行单位', label: '执行单位' },
    { key: '报工数量', label: '报工数量', sortable: true, render: (r: JobReport) => <span className="font-mono">{r.报工数量.toLocaleString()}</span> },
    { key: '工序单价', label: '单价', render: (r: JobReport) => <MoneyCell value={r.工序单价} /> },
    { key: '计件工资', label: '工资', sortable: true, render: (r: JobReport) => <MoneyCell value={r.计件工资} className="text-green-700 font-semibold" /> },
    { key: '报工日期', label: '日期', sortable: true },
    { key: '报工人', label: '报工人', sortable: true },
    { key: '状态', label: '状态', render: (r: JobReport) => <StatusBadge status={r.状态} /> },
    { key: 'actions', label: '操作', render: (r: JobReport) => (
      <div className="flex gap-1">
        {r.状态 === '待审核' && (
          <button onClick={(e) => { e.stopPropagation(); handleConfirm(r.id); }} className="px-2 py-0.5 text-xs border border-green-300 rounded text-green-700 hover:bg-green-50">确认</button>
        )}
        <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }} className="px-2 py-0.5 text-xs border border-red-300 rounded text-red-600 hover:bg-red-50">删除</button>
      </div>
    )},
  ];

  const tabs = [
    { label: '报工记录', active: viewTab === 'reports', onClick: () => setViewTab('reports') },
    { label: '工资汇总', active: viewTab === 'wages', onClick: () => setViewTab('wages') },
  ];

  const summaryRows = Object.values(wageSummary);
  const totalWage = summaryRows.reduce((s, r) => s + r.totalWage, 0);
  const totalQty = summaryRows.reduce((s, r) => s + r.totalQuantity, 0);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="报工管理"
        searchPlaceholder="搜索..."
        onSearch={setSearch}
        tabs={tabs}
        actions={viewTab === 'reports' ? [
          { label: '新建报工', icon: '＋', variant: 'primary' as const, onClick: () => setModalOpen(true) },
        ] : [
          { label: '刷新汇总', icon: '↻', variant: 'default' as const, onClick: loadWageSummary },
        ]}
      />

      {viewTab === 'wages' && (
        <div className="px-5 py-3 bg-orange-50 border-b flex items-center gap-4">
          <span className="text-xs text-gray-600">时间范围：</span>
          <input type="date" value={wageStart} onChange={e => setWageStart(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:border-blue-500 focus:outline-none" />
          <span className="text-xs text-gray-400">至</span>
          <input type="date" value={wageEnd} onChange={e => setWageEnd(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:border-blue-500 focus:outline-none" />
          <span className="text-xs text-gray-500 ml-4">合计：</span>
          <span className="text-xs font-semibold text-green-700">¥{totalWage.toFixed(2)}</span>
          <span className="text-xs text-gray-400 ml-2">总数量：</span>
          <span className="text-xs font-semibold">{totalQty.toLocaleString()}</span>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-white">
        {viewTab === 'reports' ? (
          <OrderTable
            columns={columns}
            data={filtered}
            loading={loading}
            emptyMessage="暂无报工记录"
            onRowClick={() => {}}
            renderOrderNumber={r => <span className="text-blue-600 font-mono text-xs hover:underline">{r.单号}</span>}
          />
        ) : (
          <>
            <OrderTable
              columns={wageColumns}
              data={summaryRows}
              loading={loading}
              emptyMessage="该时间段无报工记录"
              onRowClick={() => {}}
            />
            {summaryRows.length > 0 && (
              <div className="px-5 py-3 bg-gray-50 border-t flex justify-end gap-8 text-xs">
                <span className="text-gray-500">合计</span>
                <span className="font-semibold text-green-700">¥{totalWage.toFixed(2)}</span>
              </div>
            )}
          </>
        )}
      </div>

      <JobReportFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        workOrders={workOrders}
        workstations={workstations}
      />
    </div>
  );
}
