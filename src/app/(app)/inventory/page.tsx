'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import { Inventory } from '@/lib/types';
import { InventoryRepo } from '@/lib/repo';

const columns: Column<Inventory>[] = [
  { key: '产品名称', label: '产品名称', sortable: true },
  { key: '货号', label: '货号', sortable: true },
  { key: '分类', label: '分类', sortable: true },
  { key: '单位', label: '单位' },
  { key: '当前库存', label: '当前库存', sortable: true },
  { key: '安全库存', label: '安全库存', sortable: true },
  { key: '采购在途', label: '采购在途' },
  { key: '销售在途', label: '销售在途' },
  { key: '备注', label: '备注' },
];

function InventoryForm({ value, onChange }: { value: Partial<Inventory>; onChange: (key: keyof Inventory, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">产品名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.产品名称 || ''} onChange={e => onChange('产品名称', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="产品名称" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">货号</label>
        <input type="text" value={value.货号 || ''} onChange={e => onChange('货号', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="货号" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">分类</label>
        <select value={value.分类 || ''} onChange={e => onChange('分类', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="">请选择</option>
          <option value="原材料">原材料</option>
          <option value="成品">成品</option>
          <option value="半成品">半成品</option>
          <option value="辅料">辅料</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">单位</label>
        <input type="text" value={value.单位 || ''} onChange={e => onChange('单位', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="个/套/吨" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">当前库存</label>
        <input type="number" value={value.当前库存 ?? ''} onChange={e => onChange('当前库存', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">安全库存</label>
        <input type="number" value={value.安全库存 ?? ''} onChange={e => onChange('安全库存', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">采购在途</label>
        <input type="number" value={value.采购在途 ?? ''} onChange={e => onChange('采购在途', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">销售在途</label>
        <input type="number" value={value.销售在途 ?? ''} onChange={e => onChange('销售在途', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">备注</label>
        <textarea value={value.备注 || ''} onChange={e => onChange('备注', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} placeholder="备注信息" />
      </div>
    </div>
  );
}

function FormModal({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (item: Partial<Inventory>) => void; initial?: Partial<Inventory>; }) {
  const [form, setForm] = useState<Partial<Inventory>>(initial || {});
  useEffect(() => { setForm(initial || {}); }, [initial, open]);
  if (!open) return null;

  const handleSave = () => {
    if (!form.产品名称) { alert('请填写产品名称'); return; }
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑库存' : '新建库存'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5"><InventoryForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} /></div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [data, setData] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Inventory> | undefined>();

  const loadData = async () => { setLoading(true); try { setData(await InventoryRepo.findAll()); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    return !q || [item.产品名称, item.货号, item.分类, item.单位, item.备注].some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Partial<Inventory>) => {
    if (editingItem?.id) await InventoryRepo.update(editingItem.id, form);
    else await InventoryRepo.create(form as Omit<Inventory, 'id'>);
    await loadData();
    setEditingItem(undefined);
  };

  const handleEdit = (item: Inventory) => { setEditingItem(item); setModalOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm('确定删除该库存记录？')) return; await InventoryRepo.delete(id); await loadData(); };

  const tableColumns: Column<Inventory>[] = [
    ...columns,
    { key: 'actions', label: '操作', render: (item) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">编辑</button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
      </div>
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="库存管理" searchPlaceholder="搜索 产品名称 / 货号 / 分类 / 备注..." onSearch={setSearch}
        actions={[{ label: '新建库存', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem({}); setModalOpen(true); } }, { label: '批量操作', onClick: () => alert('批量操作功能开发中') }]} />
      <div className="flex-1 overflow-auto bg-white">
        <OrderTable columns={tableColumns} data={filtered} loading={loading} emptyMessage="暂无库存数据"
          onRowClick={item => handleEdit(item)}
          renderOrderNumber={item => <span className="text-blue-600 font-mono text-xs hover:underline">{item.货号}</span>} />
      </div>
      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(undefined); }} onSave={handleSave} initial={editingItem} />
    </div>
  );
}
