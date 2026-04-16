'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import { JobReport, WorkOrder } from '@/lib/types';
import { JobReportRepo, WorkOrderRepo } from '@/lib/repo';

function generateReportNo(): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `BG${dateStr}${seq}`;
}

function JobReportFormModal({ open, onClose, onSave, workOrders }: {
  open: boolean; onClose: () => void;
  onSave: (item: Omit<JobReport, 'id'>) => void;
  workOrders: WorkOrder[];
}) {
  const [form, setForm] = useState({
    单号: '', 工单id: '', 工单号: '', 工序序号: 0, 工序名称: '',
    执行单位: '', 报工数量: 0, 报工日期: '', 报工人: '李紫璘',
    合格率: 100, 不良数量: 0, 备注: '', 创建时间: new Date().toISOString(),
  });

  useEffect(() => {
    if (open) {
      setForm({ 单号: generateReportNo(), 工单id: '', 工单号: '', 工序序号: 0, 工序名称: '', 执行单位: '', 报工数量: 0, 报工日期: new Date().toISOString().slice(0,10), 报工人: '李紫璘', 合格率: 100, 不良数量: 0, 备注: '', 创建时间: new Date().toISOString() });
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
    setForm(f => ({ ...f, 工序序号: seq, 工序名称: proc.工序名称 }));
  };

  if (!open) return null;

  const currentWo = workOrders.find(w => w.id === form.工单id);
  const availableProcesses = currentWo?.工序列表 || [];

  const handleSave = () => {
    if (!form.工单id || !form.工序名称) { alert('请选择工单和工序'); return; }
    if (form.报工数量 <= 0) { alert('报工数量必须大于0'); return; }
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
              <label className="block text-xs text-gray-500 mb-0.5">报工数量 <span className="text-red-500">*</span></label>
              <input type="number" step="1" value={form.报工数量 || ''} onChange={e => updateField('报工数量', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
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

export default function JobReportsPage() {
  const [data, setData] = useState<JobReport[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reports, orders] = await Promise.all([JobReportRepo.findAll(), WorkOrderRepo.findAll()]);
      setData(reports);
      setWorkOrders(orders);
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

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

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该报工记录？')) return;
    await JobReportRepo.delete(id);
    await loadData();
  };

  const columns: Column<JobReport>[] = [
    { key: '单号', label: '报工单号', sortable: true },
    { key: '工单号', label: '工单号', sortable: true },
    { key: '工序序号', label: '工序' },
    { key: '工序名称', label: '工序名称', sortable: true },
    { key: '执行单位', label: '执行单位' },
    { key: '报工数量', label: '报工数量', sortable: true },
    { key: '报工日期', label: '报工日期', sortable: true },
    { key: '报工人', label: '报工人', sortable: true },
    { key: '合格率', label: '合格率' },
    { key: '不良数量', label: '不良数量' },
    { key: '备注', label: '备注' },
    { key: 'actions', label: '操作', render: (r: JobReport) => (
      <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="报工记录"
        searchPlaceholder="搜索 单号 / 工单号 / 工序 / 报工人..."
        onSearch={setSearch}
        actions={[
          { label: '新建报工', icon: '＋', variant: 'primary' as const, onClick: () => setModalOpen(true) },
        ]}
      />
      <div className="flex-1 overflow-auto bg-white">
        <OrderTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="暂无报工记录"
          onRowClick={() => {}}
          renderOrderNumber={r => <span className="text-blue-600 font-mono text-xs hover:underline">{r.单号}</span>}
        />
      </div>

      <JobReportFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        workOrders={workOrders}
      />
    </div>
  );
}
