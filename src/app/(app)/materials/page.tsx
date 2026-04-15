'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import { Material } from '@/lib/types';
import { MaterialRepo } from '@/lib/repo';

const columns: Column<Material>[] = [
  { key: 'code', label: '物料编号', sortable: true },
  { key: 'name', label: '物料名称', sortable: true },
  { key: 'spec', label: '规格型号' },
  { key: 'unit', label: '单位' },
  { key: 'category', label: '分类' },
  { key: 'remark', label: '备注' },
];

function MaterialForm({ value, onChange }: { value: Partial<Material>; onChange: (key: keyof Material, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">物料编号 <span className="text-red-500">*</span></label>
        <input type="text" value={value.code || ''} onChange={e => onChange('code', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="如: M001" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">物料名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="物料名称" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">规格型号</label>
        <input type="text" value={value.spec || ''} onChange={e => onChange('spec', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="规格型号" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">单位</label>
        <input type="text" value={value.unit || ''} onChange={e => onChange('unit', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="个/套/吨" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">分类</label>
        <input type="text" value={value.category || ''} onChange={e => onChange('category', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="分类" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">备注</label>
        <textarea value={value.remark || ''} onChange={e => onChange('remark', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} placeholder="备注信息" />
      </div>
    </div>
  );
}

function FormModal({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (item: Partial<Material>) => void; initial?: Partial<Material>; }) {
  const [form, setForm] = useState<Partial<Material>>(initial || {});
  useEffect(() => { setForm(initial || {}); }, [initial, open]);
  if (!open) return null;
  const handleSave = () => { if (!form.code || !form.name) { alert('请填写物料编号和物料名称'); return; } onSave(form); onClose(); };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑物料' : '新建物料'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5"><MaterialForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} /></div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function MaterialsPage() {
  const [data, setData] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Material> | undefined>();

  const loadData = async () => { setLoading(true); try { setData(await MaterialRepo.findAll()); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(item => { const q = search.toLowerCase(); return !q || [item.code, item.name, item.spec, item.unit, item.category, item.remark].some(v => v?.toLowerCase().includes(q)); });
  const handleSave = async (form: Partial<Material>) => { if (editingItem?.id) await MaterialRepo.update(editingItem.id, form); else await MaterialRepo.create(form as Omit<Material, 'id'>); await loadData(); setEditingItem(undefined); };
  const handleEdit = (item: Material) => { setEditingItem(item); setModalOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm('确定删除该物料？')) return; await MaterialRepo.delete(id); await loadData(); };

  const tableColumns: Column<Material>[] = [...columns, { key: 'actions', label: '操作', render: (item) => (
    <div className="flex gap-1">
      <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">编辑</button>
      <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
    </div>
  )}];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="物料管理" searchPlaceholder="搜索 编号 / 名称 / 规格 / 分类 / 备注..." onSearch={setSearch}
        actions={[{ label: '新建物料', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem({}); setModalOpen(true); } }, { label: '批量操作', onClick: () => alert('批量操作功能开发中') }]} />
      <div className="flex-1 overflow-auto bg-white">
        <OrderTable columns={tableColumns} data={filtered} loading={loading} emptyMessage="暂无物料数据" onRowClick={item => handleEdit(item)}
          renderOrderNumber={item => <span className="text-blue-600 font-mono text-xs hover:underline">{item.code}</span>} />
      </div>
      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(undefined); }} onSave={handleSave} initial={editingItem} />
    </div>
  );
}
