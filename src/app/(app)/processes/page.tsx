'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { MoneyCell } from '@/components/StatusBadge';
import { Process, ProcessCategory } from '@/lib/types';
import { ProcessRepo } from '@/lib/repo';

const CATEGORIES: ProcessCategory[] = ['印刷', '表面处理', '印后加工', '成型', '组装', '其他'];

const columns: Column<Process>[] = [
  { key: 'name', label: '工艺名称', sortable: true },
  { key: 'category', label: '分类' },
  { key: 'unitPrice', label: '单价', sortable: true, render: (p: Process) => <MoneyCell value={p.unitPrice} /> },
  { key: 'unit', label: '单位' },
  { key: 'outsource', label: '委外', render: (p: Process) => <StatusBadge status={p.outsource ? '是' : '否'} /> },
  { key: 'machineTypes', label: '适用机台' },
  { key: 'hasDie', label: '需刀板', render: (p: Process) => p.hasDie ? <span className="text-orange-600 text-xs">✓</span> : <span className="text-gray-300">-</span> },
  { key: 'hasArtwork', label: '需稿件', render: (p: Process) => p.hasArtwork ? <span className="text-orange-600 text-xs">✓</span> : <span className="text-gray-300">-</span> },
  { key: 'remark', label: '备注' },
];

function ProcessForm({ value, onChange }: { value: Partial<Process>; onChange: (k: keyof Process, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">工艺名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="工艺名称" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">工艺分类</label>
        <select value={value.category || '其他'} onChange={e => onChange('category', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">计价单价</label>
        <input type="number" step="0.01" min={0} value={value.unitPrice ?? ''} onChange={e => onChange('unitPrice', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">计价单位</label>
        <select value={value.unit || '件'} onChange={e => onChange('unit', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="件">件</option>
          <option value="个">个</option>
          <option value="张">张</option>
          <option value="色令">色令</option>
          <option value="色令/件">色令/件</option>
          <option value="米">米</option>
          <option value="令">令</option>
          <option value="本">本</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">适用机台</label>
        <input type="text" value={value.machineTypes || ''} onChange={e => onChange('machineTypes', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="如：四色胶印机/柔印机" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">是否委外</label>
        <select value={value.outsource ? '是' : '否'} onChange={e => onChange('outsource', e.target.value === '是')}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="否">否</option>
          <option value="是">是</option>
        </select>
      </div>
      <div className="flex gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">需刀板</label>
          <input type="checkbox" checked={value.hasDie || false} onChange={e => onChange('hasDie', e.target.checked)}
            className="w-4 h-4 mt-1" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">需稿件/菲林</label>
          <input type="checkbox" checked={value.hasArtwork || false} onChange={e => onChange('hasArtwork', e.target.checked)}
            className="w-4 h-4 mt-1" />
        </div>
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">备注</label>
        <textarea value={value.remark || ''} onChange={e => onChange('remark', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} placeholder="备注信息" />
      </div>
    </div>
  );
}

function FormModal({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void; onSave: (item: Partial<Process>) => void; initial?: Partial<Process>;
}) {
  const [form, setForm] = useState<Partial<Process>>(initial || { category: '其他', unit: '件', outsource: false });
  useEffect(() => { setForm(initial || { category: '其他', unit: '件', outsource: false }); }, [initial, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑工艺' : '新建工艺'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5"><ProcessForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} /></div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={() => { if (!form.name) { alert('请填写工艺名称'); return; } onSave(form); onClose(); }} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function ProcessesPage() {
  const [data, setData] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Process> | undefined>();

  const loadData = async () => { setLoading(true); try { setData(await ProcessRepo.findAll()); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(p => {
    const q = search.toLowerCase();
    return !q || [p.name, p.category, p.machineTypes, p.remark].some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Partial<Process>) => {
    if (editing?.id) { await ProcessRepo.update(editing.id, form); }
    else { await ProcessRepo.create(form as Omit<Process, 'id'>); }
    await loadData(); setEditing(undefined);
  };

  const handleEdit = (item: Process) => { setEditing(item); setModalOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm('确定删除该工艺？')) return; await ProcessRepo.delete(id); await loadData(); };

  const detailColumns: Column<Process>[] = [
    ...columns,
    { key: 'actions', label: '操作', render: (p: Process) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50">编辑</button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="px-2 py-0.5 text-xs border border-red-300 rounded text-red-600 hover:bg-red-50">删除</button>
      </div>
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="工艺管理" subtitle="印刷工艺、表面处理、印后加工等"
        searchPlaceholder="搜索 工艺名称/分类/机台..."
        onSearch={setSearch}
        actions={[{ label: '新建工艺', icon: '＋', variant: 'primary' as const, onClick: () => { setEditing({}); setModalOpen(true); } }]} />
      <div className="flex-1 overflow-auto bg-white px-5 py-3">
        <div className="mb-3 flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <span key={c} className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-600">
              {c} {data.filter(p => p.category === c).length}
            </span>
          ))}
        </div>
        <OrderTable columns={detailColumns} data={filtered} loading={loading} emptyMessage="暂无工艺"
          onRowClick={() => {}} />
      </div>
      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined); }} onSave={handleSave} initial={editing} />
    </div>
  );
}
