'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge from '@/components/StatusBadge';
import { CuttingDie } from '@/lib/types';
import { CuttingDieRepo } from '@/lib/repo';

const columns: Column<CuttingDie>[] = [
  { key: 'code', label: '刀板编号', sortable: true },
  { key: 'name', label: '刀板名称', sortable: true },
  { key: 'productName', label: '适用产品' },
  { key: 'customerCode', label: '客户' },
  { key: 'dieType', label: '刀板类型' },
  { key: 'size', label: '尺寸' },
  { key: 'status', label: '状态', render: (d: CuttingDie) => <StatusBadge status={d.status} /> },
  { key: 'location', label: '存放位置' },
  { key: 'createDate', label: '建档日期' },
];

function DieForm({ value, onChange }: { value: Partial<CuttingDie>; onChange: (k: keyof CuttingDie, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">刀板编号 <span className="text-red-500">*</span></label>
        <input type="text" value={value.code || ''} onChange={e => onChange('code', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="D001" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">刀板名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="刀板名称" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">适用产品</label>
        <input type="text" value={value.productName || ''} onChange={e => onChange('productName', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="产品名称" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">客户编号</label>
        <input type="text" value={value.customerCode || ''} onChange={e => onChange('customerCode', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="C01" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">刀板类型</label>
        <select value={value.dieType || '啤刀'} onChange={e => onChange('dieType', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="啤刀">啤刀</option>
          <option value="烫金刀">烫金刀</option>
          <option value="压痕刀">压痕刀</option>
          <option value="激光刀">激光刀</option>
          <option value="其他">其他</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">尺寸(mm)</label>
        <input type="text" value={value.size || ''} onChange={e => onChange('size', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="40x60mm" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">状态</label>
        <select value={value.status || '在用'} onChange={e => onChange('status', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="在用">在用</option>
          <option value="库存">库存</option>
          <option value="报废">报废</option>
          <option value="外发">外发</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">存放位置</label>
        <input type="text" value={value.location || ''} onChange={e => onChange('location', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="刀房A区-01" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">建档日期</label>
        <input type="date" value={value.createDate || ''} onChange={e => onChange('createDate', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">备注</label>
        <textarea value={value.remark || ''} onChange={e => onChange('remark', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} />
      </div>
    </div>
  );
}

function FormModal({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void;
  onSave: (item: Partial<CuttingDie>) => void;
  initial?: Partial<CuttingDie>;
}) {
  const [form, setForm] = useState<Partial<CuttingDie>>(initial || {});
  useEffect(() => { setForm(initial || { status: '在用', dieType: '啤刀', createDate: new Date().toISOString().slice(0,10) }); }, [initial, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑刀板' : '新建刀板'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5"><DieForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} /></div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={() => { if (!form.code || !form.name) { alert('请填写编号和名称'); return; } onSave(form); onClose(); }} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function CuttingDiesPage() {
  const [data, setData] = useState<CuttingDie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<CuttingDie> | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadData = async () => { setLoading(true); try { setData(await CuttingDieRepo.findAll()); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(d => {
    const q = search.toLowerCase();
    return !q || [d.code, d.name, d.productName, d.customerCode, d.location].some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Partial<CuttingDie>) => {
    if (editing?.id) { await CuttingDieRepo.update(editing.id, form); }
    else { await CuttingDieRepo.create(form as Omit<CuttingDie, 'id'>); }
    await loadData(); setEditing(undefined);
  };

  const handleEdit = (item: CuttingDie) => { setEditing(item); setModalOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm('确定删除？')) return; await CuttingDieRepo.delete(id); await loadData(); };

  const detailColumns: Column<CuttingDie>[] = [
    ...columns,
    { key: 'actions', label: '操作', render: (d: CuttingDie) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); handleEdit(d); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50">编辑</button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }} className="px-2 py-0.5 text-xs border border-red-300 rounded text-red-600 hover:bg-red-50">删除</button>
      </div>
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="刀板管理" subtitle="刀模/烫金刀/啤刀管理"
        searchPlaceholder="搜索 编号/名称/产品/客户..."
        onSearch={setSearch}
        actions={[{ label: '新建刀板', icon: '＋', variant: 'primary' as const, onClick: () => { setEditing({}); setModalOpen(true); } }]} />
      <div className="flex-1 overflow-auto bg-white px-5 py-3">
        <div className="mb-3 flex gap-4 text-xs">
          <span className="px-2 py-1 bg-green-50 text-green-700 rounded">在用 {data.filter(d => d.status === '在用').length}</span>
          <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded">库存 {data.filter(d => d.status === '库存').length}</span>
          <span className="px-2 py-1 bg-red-50 text-red-700 rounded">报废 {data.filter(d => d.status === '报废').length}</span>
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">外发 {data.filter(d => d.status === '外发').length}</span>
        </div>
        <OrderTable columns={detailColumns} data={filtered} loading={loading} emptyMessage="暂无刀板记录"
          onRowClick={(d) => setSelectedId(selectedId === d.id ? null : d.id)} />
      </div>
      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined); }} onSave={handleSave} initial={editing} />
    </div>
  );
}
