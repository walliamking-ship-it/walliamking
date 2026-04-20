'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { DateCell } from '@/components/StatusBadge';
import { ScrapOrder, Inventory, Warehouse } from '@/lib/types';
import { ScrapOrderRepo, InventoryRepo, WarehouseRepo } from '@/lib/repo';

function generateScrapNo(): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `BF${dateStr}${seq}`;
}

function ScrapOrderFormModal({ open, onClose, onSave, initial, inventory, warehouses }: {
  open: boolean; onClose: () => void;
  onSave: (item: Omit<ScrapOrder, 'id'>) => void;
  initial?: ScrapOrder;
  inventory: Inventory[];
  warehouses: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({
    单号: '', 报废日期: '', 仓库: '', 关联库存id: '', 产品名称: '', 物料编码: '',
    规格: '', 单位: '', 报废数量: 0, 报废原因: '', 报废金额: 0,
    状态: '待审批' as ScrapOrder['状态'], 备注: '', 制单人: '李紫璘', 审批人: '',
    创建时间: new Date().toISOString(),
  });

  useEffect(() => {
    if (open) {
      if (initial?.id) {
        setForm({
          单号: initial.单号, 报废日期: initial.报废日期, 仓库: initial.仓库,
          关联库存id: initial.关联库存id, 产品名称: initial.产品名称,
          物料编码: initial.物料编码, 规格: initial.规格, 单位: initial.单位,
          报废数量: initial.报废数量, 报废原因: initial.报废原因, 报废金额: initial.报废金额,
          状态: initial.状态, 备注: initial.备注, 制单人: initial.制单人,
          审批人: initial.审批人, 创建时间: initial.创建时间,
        });
      } else {
        setForm({ 单号: generateScrapNo(), 报废日期: new Date().toISOString().slice(0,10), 仓库: '', 关联库存id: '', 产品名称: '', 物料编码: '', 规格: '', 单位: '', 报废数量: 0, 报废原因: '', 报废金额: 0, 状态: '待审批', 备注: '', 制单人: '李紫璘', 审批人: '', 创建时间: new Date().toISOString() });
      }
    }
  }, [open, initial]);

  const updateField = (k: string, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === '关联库存id') {
      const inv = inventory.find(i => i.id === v);
      if (inv) {
        setForm(f => ({
          ...f, 关联库存id: v, 产品名称: inv.产品名称, 物料编码: inv.货号,
          规格: '', 单位: inv.单位,
        }));
      }
    }
  };

  if (!open) return null;

  const handleSave = async () => {
    if (!form.仓库 || !form.产品名称 || form.报废数量 <= 0) {
      alert('请填写仓库、产品和报废数量');
      return;
    }
    try {
      await onSave(form as Omit<ScrapOrder, 'id'>);
      onClose();
    } catch (e: any) {
      alert('保存失败: ' + (e?.message || '未知错误'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑报废单' : '新建报废单'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">单号</label>
              <input type="text" value={form.单号} readOnly className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">报废日期</label>
              <input type="date" value={form.报废日期} onChange={e => updateField('报废日期', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">仓库</label>
              <select value={form.仓库} onChange={e => updateField('仓库', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="">请选择仓库</option>
                {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">产品（从库存选择）</label>
              <select value={form.关联库存id} onChange={e => updateField('关联库存id', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="">请选择库存产品</option>
                {inventory.map(i => <option key={i.id} value={i.id}>{i.产品名称} ({i.货号}) - 库存:{i.当前库存}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">物料编码</label>
              <input type="text" value={form.物料编码} readOnly className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">产品名称</label>
              <input type="text" value={form.产品名称} onChange={e => updateField('产品名称', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
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
              <label className="block text-xs text-gray-500 mb-0.5">报废数量</label>
              <input type="number" step="1" value={form.报废数量 || ''} onChange={e => updateField('报废数量', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">报废金额</label>
              <input type="number" step="0.01" value={form.报废金额 || ''} onChange={e => updateField('报废金额', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">状态</label>
              <select value={form.状态} onChange={e => updateField('状态', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="待审批">待审批</option>
                <option value="已审批">已审批</option>
                <option value="已处理">已处理</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">制单人</label>
              <input type="text" value={form.制单人} onChange={e => updateField('制单人', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">报废原因</label>
            <input type="text" value={form.报废原因} onChange={e => updateField('报废原因', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="报废原因" />
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

function StatusTag({ status }: { status: ScrapOrder['状态'] }) {
  const colors: Record<ScrapOrder['状态'], string> = {
    '待审批': 'bg-yellow-100 text-yellow-700',
    '已审批': 'bg-blue-50 text-blue-700',
    '已处理': 'bg-green-50 text-green-700',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>{status}</span>;
}

export default function ScrapOrdersPage() {
  const [data, setData] = useState<ScrapOrder[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScrapOrder | undefined>();

  const loadData = async () => {
    setLoading(true);
    try {
      const [scraps, inv, whs] = await Promise.all([
        ScrapOrderRepo.findAll(),
        InventoryRepo.findAll(),
        WarehouseRepo.findAll(),
      ]);
      setData(scraps);
      setInventory(inv);
      setWarehouses(whs.map(w => ({ id: w.id, name: w.name })));
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(s => {
    const q = search.toLowerCase();
    return !q || [s.单号, s.产品名称, s.物料编码, s.报废原因, s.制单人].some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Omit<ScrapOrder, 'id'>) => {
    if (editingItem?.id) {
      const updated = await ScrapOrderRepo.update(editingItem.id, form);
      // 已处理时自动扣减库存
      if (form.状态 === '已处理' && updated && updated.关联库存id) {
        const inv = inventory.find(i => i.id === updated.关联库存id);
        if (inv) {
          await InventoryRepo.update(updated.关联库存id, {
            当前库存: Math.max(0, inv.当前库存 - updated.报废数量),
          });
        }
      }
    } else {
      await ScrapOrderRepo.create(form);
    }
    await loadData();
    setEditingItem(undefined);
  };

  const handleApprove = async (item: ScrapOrder) => {
    if (item.状态 !== '待审批') return;
    await ScrapOrderRepo.update(item.id, { 状态: '已审批' });
    await loadData();
  };

  const handleProcess = async (item: ScrapOrder) => {
    if (item.状态 !== '已审批') return;
    await ScrapOrderRepo.update(item.id, { 状态: '已处理' });
    // 扣减库存
    if (item.关联库存id) {
      const inv = inventory.find(i => i.id === item.关联库存id);
      if (inv) {
        await InventoryRepo.update(item.关联库存id, {
          当前库存: Math.max(0, inv.当前库存 - item.报废数量),
        });
      }
    }
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该报废单？')) return;
    await ScrapOrderRepo.delete(id);
    await loadData();
  };

  const columns: Column<ScrapOrder>[] = [
    { key: '单号', label: '单号', sortable: true },
    { key: '报废日期', label: '报废日期', sortable: true },
    { key: '仓库', label: '仓库', sortable: true },
    { key: '产品名称', label: '产品名称', sortable: true },
    { key: '物料编码', label: '物料编码' },
    { key: '报废数量', label: '报废数量', sortable: true },
    { key: '报废金额', label: '报废金额', sortable: true },
    { key: '状态', label: '状态', sortable: true, render: (s: ScrapOrder) => <StatusTag status={s.状态} /> },
    { key: '制单人', label: '制单人' },
    { key: '备注', label: '备注' },
    { key: 'actions', label: '操作', render: (s: ScrapOrder) => (
      <div className="flex gap-1">
        {s.状态 === '待审批' && (
          <button onClick={(e) => { e.stopPropagation(); handleApprove(s); }} className="px-2 py-0.5 text-xs border border-yellow-300 rounded text-yellow-600 hover:bg-yellow-50">审批</button>
        )}
        {s.状态 === '已审批' && (
          <button onClick={(e) => { e.stopPropagation(); handleProcess(s); }} className="px-2 py-0.5 text-xs border border-green-300 rounded text-green-600 hover:bg-green-50">执行</button>
        )}
        <button onClick={(e) => { e.stopPropagation(); setEditingItem(s); setModalOpen(true); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">编辑</button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
      </div>
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="报废管理"
        searchPlaceholder="搜索 单号 / 产品 / 物料编码 / 原因 / 制单人..."
        onSearch={setSearch}
        actions={[
          { label: '新建报废单', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem(undefined); setModalOpen(true); } },
        ]}
      />
      <div className="flex-1 overflow-auto bg-white">
        <OrderTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="暂无报废单"
          onRowClick={() => {}}
          renderOrderNumber={s => <span className="text-blue-600 font-mono text-xs hover:underline">{s.单号}</span>}
        />
      </div>

      <ScrapOrderFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(undefined); }}
        onSave={handleSave}
        initial={editingItem}
        inventory={inventory}
        warehouses={warehouses}
      />
    </div>
  );
}
