'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge from '@/components/StatusBadge';
import { WorkOrder, WorkOrderProcess, SalesOrder, Product, Process } from '@/lib/types';
import { WorkOrderRepo, SalesOrderRepo, ProductRepo, ProcessRepo, InventoryRepo } from '@/lib/repo';
import { exportCsvTemplate } from '@/lib/csvExport';

function generateWorkOrderNo(): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `SG${dateStr}${seq}`;
}

const defaultProcess = (): WorkOrderProcess => ({
  序号: 1,
  工序名称: '',
  执行单位: '',
  计划数量: 0,
  已完成数量: 0,
  状态: '待报工',
});

function WorkOrderFormModal({ open, onClose, onSave, initial, salesOrders, products, processes }: {
  open: boolean; onClose: () => void;
  onSave: (item: Omit<WorkOrder, 'id'>) => void;
  initial?: WorkOrder;
  salesOrders: SalesOrder[];
  products: Product[];
  processes: Process[];
}) {
  const [form, setForm] = useState({
    单号: '', 关联销售订单id: '', 关联销售订单号: '', 产品名称: '', 物料编码: '',
    规格: '', 单位: '', 计划数量: 0, 已完成数量: 0,
    生产单位: 'external' as 'internal' | 'external',
    执行单位: '', 工序列表: [] as WorkOrderProcess[],
    状态: '待生产' as WorkOrder['状态'],
    计划开始日期: '', 计划完成日期: '', 实际开始日期: '', 实际完成日期: '',
    备注: '', 制单人: '李紫璘', 创建时间: new Date().toISOString(),
  });
  const [processesText, setProcessesText] = useState('');

  useEffect(() => {
    if (open) {
      if (initial?.id) {
        setForm({
          单号: initial.单号, 关联销售订单id: initial.关联销售订单id || '',
          关联销售订单号: initial.关联销售订单号 || '', 产品名称: initial.产品名称,
          物料编码: initial.物料编码, 规格: initial.规格, 单位: initial.单位,
          计划数量: initial.计划数量, 已完成数量: initial.已完成数量,
          生产单位: initial.生产单位, 执行单位: initial.执行单位,
          工序列表: initial.工序列表, 状态: initial.状态,
          计划开始日期: initial.计划开始日期, 计划完成日期: initial.计划完成日期,
          实际开始日期: initial.实际开始日期 || '', 实际完成日期: initial.实际完成日期 || '',
          备注: initial.备注, 制单人: initial.制单人, 创建时间: initial.创建时间,
        });
        setProcessesText(initial.工序列表.map(p => p.工序名称).join('、'));
      } else {
        setForm({ 单号: generateWorkOrderNo(), 关联销售订单id: '', 关联销售订单号: '', 产品名称: '', 物料编码: '', 规格: '', 单位: '', 计划数量: 0, 已完成数量: 0, 生产单位: 'external', 执行单位: '', 工序列表: [], 状态: '待生产', 计划开始日期: '', 计划完成日期: '', 实际开始日期: '', 实际完成日期: '', 备注: '', 制单人: '李紫璘', 创建时间: new Date().toISOString() });
        setProcessesText('');
      }
    }
  }, [open, initial]);

  const updateField = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSoChange = (id: string) => {
    const so = salesOrders.find(s => s.id === id);
    setForm(f => ({ ...f, 关联销售订单id: id, 关联销售订单号: so?.单号 || '' }));
  };

  const handleProductChange = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (prod) {
      setForm(f => ({ ...f, 产品名称: prod.name, 物料编码: prod.code, 规格: prod.spec, 单位: prod.unit }));
    }
  };

  const handleProcessesChange = (text: string) => {
    setProcessesText(text);
    const names = text.split('、').map(s => s.trim()).filter(Boolean);
    const existingMap = new Map(form.工序列表.map(p => [p.工序名称, p]));
    const newList: WorkOrderProcess[] = names.map((name, idx) => {
      const existing = existingMap.get(name);
      if (existing) return existing;
      return { 序号: idx + 1, 工序名称: name, 执行单位: form.执行单位, 计划数量: form.计划数量, 已完成数量: 0, 状态: '待报工' as const };
    });
    setForm(f => ({ ...f, 工序列表: newList }));
  };

  if (!open) return null;

  const handleSave = async () => {
    if (!form.产品名称) { alert('请选择或填写产品'); return; }
    try {
      await onSave(form as Omit<WorkOrder, 'id'>);
      onClose();
    } catch (e: any) { alert('保存失败: ' + (e?.message || '未知错误')); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑施工单' : '新建施工单'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">单号</label>
              <input type="text" value={form.单号} readOnly className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">关联销售订单</label>
              <select value={form.关联销售订单id} onChange={e => handleSoChange(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="">不关联</option>
                {salesOrders.map(s => <option key={s.id} value={s.id}>{s.单号} - {s.客户名称}</option>)})
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">产品（从产品列表选择）</label>
              <select value='' onChange={e => handleProductChange(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="">请选择产品</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.产品名称} ({p.货号})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">产品名称</label>
              <input type="text" value={form.产品名称} onChange={e => updateField('产品名称', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="手动填写或自动带出" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">物料编码</label>
              <input type="text" value={form.物料编码} readOnly className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">规格</label>
              <input type="text" value={form.规格} onChange={e => updateField('规格', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">单位</label>
              <input type="text" value={form.单位} readOnly className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">计划数量</label>
              <input type="number" step="1" value={form.计划数量 || ''} onChange={e => updateField('计划数量', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">生产单位</label>
              <select value={form.生产单位} onChange={e => updateField('生产单位', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="internal">内部</option>
                <option value="external">外部（委外）</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">执行单位</label>
              <input type="text" value={form.执行单位} onChange={e => updateField('执行单位', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                placeholder={form.生产单位 === 'internal' ? '内部部门名称' : '供应商名称'} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">计划开始日期</label>
              <input type="date" value={form.计划开始日期} onChange={e => updateField('计划开始日期', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">计划完成日期</label>
              <input type="date" value={form.计划完成日期} onChange={e => updateField('计划完成日期', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">状态</label>
              <select value={form.状态} onChange={e => updateField('状态', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="待生产">待生产</option>
                <option value="生产中">生产中</option>
                <option value="已完成">已完成</option>
                <option value="已入库">已入库</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">制单人</label>
              <input type="text" value={form.制单人} onChange={e => updateField('制单人', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">工序明细（用顿号分隔，如：裁切、印刷、烫金、糊盒）</label>
            <input type="text" value={processesText} onChange={e => handleProcessesChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="裁切、印刷、烫金、糊盒" />
            {form.工序列表.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {form.工序列表.map((p, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded border border-blue-200">
                    {idx + 1}. {p.工序名称}
                  </span>
                ))}
              </div>
            )}
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

function StatusTag({ status }: { status: WorkOrder['状态'] }) {
  const colors: Record<WorkOrder['状态'], string> = {
    '待生产': 'bg-gray-100 text-gray-600',
    '生产中': 'bg-yellow-50 text-yellow-700',
    '已完成': 'bg-green-50 text-green-700',
    '已入库': 'bg-blue-50 text-blue-700',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>{status}</span>;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const color = pct >= 100 ? 'bg-green-500' : pct > 50 ? 'bg-blue-500' : 'bg-yellow-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden w-16">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8">{pct}%</span>
    </div>
  );
}

function ProcessStatusTag({ status }: { status: WorkOrderProcess['状态'] }) {
  const colors: Record<WorkOrderProcess['状态'], string> = {
    '待报工': 'bg-gray-100 text-gray-500',
    '报工中': 'bg-yellow-50 text-yellow-700',
    '已完成': 'bg-green-50 text-green-700',
  };
  return <span className={`inline-flex px-1.5 py-0.5 rounded text-xs ${colors[status]}`}>{status}</span>;
}

export default function WorkOrdersPage() {
  const [data, setData] = useState<WorkOrder[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkOrder['状态'] | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkOrder | undefined>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orders, sos, prods, procs] = await Promise.all([
        WorkOrderRepo.findAll(),
        SalesOrderRepo.findAll(),
        ProductRepo.findAll(),
        ProcessRepo.findAll(),
      ]);
      setData(orders);
      setSalesOrders(sos);
      setProducts(prods);
      setProcesses(procs);
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(w => {
    const q = search.toLowerCase();
    return (!q || [w.单号, w.产品名称, w.物料编码, w.执行单位, w.备注].some(v => v?.toLowerCase().includes(q)))
      && (!statusFilter || w.状态 === statusFilter);
  });

  const handleSave = async (form: Omit<WorkOrder, 'id'>) => {
    if (editingItem?.id) await WorkOrderRepo.update(editingItem.id, form);
    else await WorkOrderRepo.create(form);
    await loadData();
    setEditingItem(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该施工单？')) return;
    await WorkOrderRepo.delete(id);
    await loadData();
  };

  const columns: Column<WorkOrder>[] = [
    { key: '单号', label: '单号', sortable: true },
    { key: '关联销售订单号', label: '关联销售单' },
    { key: '产品名称', label: '产品', sortable: true },
    { key: '计划数量', label: '计划数量', sortable: true },
    { key: '已完成数量', label: '已完成', sortable: true },
    { key: 'progress', label: '进度', render: (w: WorkOrder) => <ProgressBar value={w.已完成数量} max={w.计划数量} /> },
    { key: '执行单位', label: '执行单位' },
    { key: '状态', label: '状态', sortable: true, render: (w: WorkOrder) => <StatusTag status={w.状态} /> },
    { key: '计划完成日期', label: '计划完成' },
    { key: 'actions', label: '操作', render: (w: WorkOrder) => (
      <div className="flex gap-1">
        {w.状态 === '待生产' && (
          <button onClick={(e) => { e.stopPropagation(); handleStatusChange(w, '生产中'); }} className="px-2 py-0.5 text-xs border border-yellow-300 rounded text-yellow-700 hover:bg-yellow-50">开始</button>
        )}
        {w.状态 === '生产中' && (
          <button onClick={(e) => { e.stopPropagation(); handleStatusChange(w, '已完成'); }} className="px-2 py-0.5 text-xs border border-green-300 rounded text-green-700 hover:bg-green-50">完成</button>
        )}
        {w.状态 === '已完成' && (
          <button onClick={(e) => { e.stopPropagation(); handleStatusChange(w, '已入库'); }} className="px-2 py-0.5 text-xs border border-blue-300 rounded text-blue-700 hover:bg-blue-50">入库</button>
        )}
        <button onClick={(e) => { e.stopPropagation(); setEditingItem(w); setModalOpen(true); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">详情</button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(w.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
      </div>
    )},
  ];

  const handleStatusChange = async (w: WorkOrder, newStatus: WorkOrder['状态']) => {
    if (newStatus === '已完成' && !w.工序列表.every(p => p.状态 === '已完成')) {
      const confirmed = confirm('该工单尚有未完成的工序，确定要标记为已完成吗？');
      if (!confirmed) return;
    }
    await WorkOrderRepo.update(w.id, { 状态: newStatus });
    if (newStatus === '已完成') {
      await WorkOrderRepo.update(w.id, { 实际完成日期: new Date().toISOString().slice(0, 10) });
    }
    // 入库：自动更新库存
    if (newStatus === '已入库') {
      const inventory = await InventoryRepo.findAll();
      const existing = inventory.find(i => i.货号 === w.物料编码 || i.产品名称 === w.产品名称);
      if (existing) {
        await InventoryRepo.update(existing.id, { 当前库存: (existing.当前库存 || 0) + w.已完成数量 });
        alert(`入库成功！\n产品：${w.产品名称}\n入库数量：${w.已完成数量}\n当前库存：${(existing.当前库存 || 0) + w.已完成数量}`);
      } else {
        alert(`库存中未找到对应产品 [${w.产品名称}]，请先在库存管理中添加该产品记录！\n入库数量：${w.已完成数量}`);
      }
    }
    await loadData();
  };

  const statusTabs = [
    { label: '全部', active: !statusFilter, onClick: () => setStatusFilter('') },
    { label: '待生产', active: statusFilter === '待生产', onClick: () => setStatusFilter('待生产') },
    { label: '生产中', active: statusFilter === '生产中', onClick: () => setStatusFilter('生产中') },
    { label: '已完成', active: statusFilter === '已完成', onClick: () => setStatusFilter('已完成') },
    { label: '已入库', active: statusFilter === '已入库', onClick: () => setStatusFilter('已入库') },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="施工单"
        searchPlaceholder="搜索 单号 / 产品 / 物料编码 / 执行单位..."
        onSearch={setSearch}
        actions={[
          { label: '从销售订单生成', icon: '📋', variant: 'default' as const, onClick: () => setGenerateModalOpen(true) },
          { label: '新建施工单', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem(undefined); setModalOpen(true); } },
          { label: '导出CSV模版', icon: '↓', variant: 'default' as const, onClick: () => exportCsvTemplate(['单号', '关联销售订单号', '产品名称', '规格', '单位', '计划数量', '计划开始日期', '计划完成日期', '实际开始日期', '实际完成日期', '状态', '执行人', '备注'], '施工单') },
        ]}
        tabs={statusTabs}
      />
      <div className="flex-1 overflow-auto bg-white">
        <OrderTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="暂无施工单"
          expandedId={expandedId}
          onRowClick={w => setExpandedId(expandedId === w.id ? null : w.id)}
          renderOrderNumber={w => <span className="text-blue-600 font-mono text-xs hover:underline">{w.单号}</span>}
          renderExpanded={(w) => {
            const procs = w.工序列表 || [];
            const completedProcs = procs.filter(p => p.状态 === '已完成').length;
            return (
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-medium text-gray-600">工序列表 ({completedProcs}/{procs.length} 完成)</div>
                  <ProgressBar value={completedProcs} max={procs.length} />
                </div>
                {procs.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-3">暂无工序</div>
                ) : (
                  <div className="space-y-1">
                    {procs.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white rounded p-2 text-xs border">
                        <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium">{idx + 1}</span>
                        <span className="flex-1 font-medium text-gray-700">{p.工序名称}</span>
                        <span className="text-gray-400">{p.执行单位}</span>
                        <span className="text-gray-400">{p.计划数量}{w.单位 || '件'}</span>
                        <span className="text-gray-400">{p.已完成数量}{w.单位 || '件'}</span>
                        <ProcessStatusTag status={p.状态} />
                        {p.报工时间 && <span className="text-gray-400">{p.报工时间}</span>}
                        {p.报工人 && <span className="text-gray-400">{p.报工人}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {w.备注 && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
                    备注：{w.备注}
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>

      <WorkOrderFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(undefined); }}
        onSave={handleSave}
        initial={editingItem}
        salesOrders={salesOrders}
        products={products}
        processes={processes}
      />

      {/* 从销售订单生成施工单 */}
      <GenerateWorkOrderModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        salesOrders={salesOrders}
        products={products}
        onGenerated={async (wo) => {
          await WorkOrderRepo.create(wo);
          await loadData();
          setGenerateModalOpen(false);
        }
}
      />
    </div>
  );
}

// 从销售订单生成施工单的Modal
function GenerateWorkOrderModal({ open, onClose, salesOrders, products, onGenerated }: {
  open: boolean;
  onClose: () => void;
  salesOrders: SalesOrder[];
  products: Product[];
  onGenerated: (wo: Omit<WorkOrder, 'id'>) => void;
}) {
  const [selectedSoId, setSelectedSoId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [form, setForm] = useState({ 执行单位: '', 计划开始日期: '', 计划完成日期: '', 备注: '' });

  useEffect(() => {
    if (open) { setSelectedSoId(''); setSelectedProductId(''); setForm({ 执行单位: '', 计划开始日期: '', 计划完成日期: '', 备注: '' }); }
  }, [open]);

  const selectedSo = salesOrders.find(s => s.id === selectedSoId);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleGenerate = () => {
    if (!selectedSo || !selectedProduct) { alert('请选择销售订单和产品'); return; }
    const wo: Omit<WorkOrder, 'id'> = {
      单号: generateWorkOrderNo(),
      关联销售订单id: selectedSo.id,
      关联销售订单号: selectedSo.单号,
      产品名称: selectedProduct.产品名称,
      物料编码: selectedProduct.货号,
      规格: selectedProduct.spec || '',
      单位: selectedProduct.unit || '',
      计划数量: 0,
      已完成数量: 0,
      生产单位: 'external',
      执行单位: form.执行单位,
      工序列表: [],
      状态: '待生产',
      计划开始日期: form.计划开始日期,
      计划完成日期: form.计划完成日期,
      实际开始日期: '',
      实际完成日期: '',
      备注: form.备注,
      制单人: '李紫璘',
      创建时间: new Date().toISOString(),
    };
    onGenerated(wo);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">从销售订单生成施工单</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">选择销售订单 <span className="text-red-500">*</span></label>
            <select value={selectedSoId} onChange={e => { setSelectedSoId(e.target.value); setSelectedProductId(''); }}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:border-blue-500 outline-none">
              <option value="">请选择销售订单</option>
              {salesOrders.filter(s => s.送货状态 !== '全部送货').map(s => (
                <option key={s.id} value={s.id}>{s.单号} - {s.客户名称}</option>
              ))}
            </select>
          </div>
          {selectedSo && (
            <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
              <div>客户：{selectedSo.客户名称}</div>
              <div>日期：{selectedSo.日期}</div>
              <div>合同金额：¥{selectedSo.合同金额?.toLocaleString()}</div>
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">选择产品 <span className="text-red-500">*</span></label>
            <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:border-blue-500 outline-none">
              <option value="">请选择产品</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.产品名称} ({p.货号})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">执行单位</label>
            <input type="text" value={form.执行单位} onChange={e => setForm(f => ({ ...f, 执行单位: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none" placeholder="如：外发-华新印刷" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">计划开始日期</label>
              <input type="date" value={form.计划开始日期} onChange={e => setForm(f => ({ ...f, 计划开始日期: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">计划完成日期</label>
              <input type="date" value={form.计划完成日期} onChange={e => setForm(f => ({ ...f, 计划完成日期: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">备注</label>
            <input type="text" value={form.备注} onChange={e => setForm(f => ({ ...f, 备注: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none" placeholder="备注信息" />
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleGenerate} disabled={!selectedSoId || !selectedProductId}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">生成施工单</button>
        </div>
      </div>
    </div>
  );
}
