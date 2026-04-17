'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge from '@/components/StatusBadge';
import { Artwork } from '@/lib/types';
import { ArtworkRepo } from '@/lib/repo';

const columns: Column<Artwork>[] = [
  { key: 'code', label: '稿件编号', sortable: true },
  { key: 'name', label: '稿件名称', sortable: true },
  { key: 'productName', label: '产品' },
  { key: 'customerCode', label: '客户' },
  { key: 'version', label: '版本' },
  { key: 'fileFormat', label: '文件格式' },
  { key: 'colors', label: '颜色' },
  { key: 'size', label: '尺寸' },
  { key: 'status', label: '状态', render: (a: Artwork) => <StatusBadge status={a.status} /> },
  { key: 'createDate', label: '建档日期' },
];

function ArtworkForm({ value, onChange }: { value: Partial<Artwork>; onChange: (k: keyof Artwork, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">稿件编号 <span className="text-red-500">*</span></label>
        <input type="text" value={value.code || ''} onChange={e => onChange('code', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="A001" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">稿件名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="稿件名称" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">产品名称</label>
        <input type="text" value={value.productName || ''} onChange={e => onChange('productName', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="产品名称" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">客户编号</label>
        <input type="text" value={value.customerCode || ''} onChange={e => onChange('customerCode', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="C01" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">版本号</label>
        <input type="text" value={value.version || ''} onChange={e => onChange('version', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="V1.0" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">文件格式</label>
        <select value={value.fileFormat || 'PDF'} onChange={e => onChange('fileFormat', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="PDF">PDF</option>
          <option value="AI">AI</option>
          <option value="PSD">PSD</option>
          <option value="CDR">CDR</option>
          <option value="其他">其他</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">颜色</label>
        <input type="text" value={value.colors || ''} onChange={e => onChange('colors', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="4C+1P" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">尺寸</label>
        <input type="text" value={value.size || ''} onChange={e => onChange('size', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="40x60mm" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">状态</label>
        <select value={value.status || '草稿'} onChange={e => onChange('status', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="草稿">草稿</option>
          <option value="已定稿">已定稿</option>
          <option value="已归档">已归档</option>
          <option value="已作废">已作废</option>
        </select>
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
  onSave: (item: Partial<Artwork>) => void;
  initial?: Partial<Artwork>;
}) {
  const [form, setForm] = useState<Partial<Artwork>>(initial || {});
  useEffect(() => { setForm(initial || { status: '草稿', fileFormat: 'PDF', createDate: new Date().toISOString().slice(0,10) }); }, [initial, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑稿件' : '新建稿件'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5"><ArtworkForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} /></div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={() => { if (!form.code || !form.name) { alert('请填写编号和名称'); return; } onSave(form); onClose(); }} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function ArtworksPage() {
  const [data, setData] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Artwork> | undefined>();

  const loadData = async () => { setLoading(true); try { setData(await ArtworkRepo.findAll()); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(a => {
    const q = search.toLowerCase();
    return !q || [a.code, a.name, a.productName, a.customerCode].some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Partial<Artwork>) => {
    if (editing?.id) { await ArtworkRepo.update(editing.id, form); }
    else { await ArtworkRepo.create(form as Omit<Artwork, 'id'>); }
    await loadData(); setEditing(undefined);
  };

  const handleEdit = (item: Artwork) => { setEditing(item); setModalOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm('确定删除？')) return; await ArtworkRepo.delete(id); await loadData(); };

  const detailColumns: Column<Artwork>[] = [
    ...columns,
    { key: 'actions', label: '操作', render: (a: Artwork) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); handleEdit(a); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50">编辑</button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }} className="px-2 py-0.5 text-xs border border-red-300 rounded text-red-600 hover:bg-red-50">删除</button>
      </div>
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="稿件管理" subtitle="设计稿/菲林/印前文件管理"
        searchPlaceholder="搜索 编号/名称/产品/客户..."
        onSearch={setSearch}
        actions={[{ label: '新建稿件', icon: '＋', variant: 'primary' as const, onClick: () => { setEditing({}); setModalOpen(true); } }]} />
      <div className="flex-1 overflow-auto bg-white px-5 py-3">
        <div className="mb-3 flex gap-4 text-xs">
          <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded">草稿 {data.filter(a => a.status === '草稿').length}</span>
          <span className="px-2 py-1 bg-green-50 text-green-700 rounded">已定稿 {data.filter(a => a.status === '已定稿').length}</span>
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">已归档 {data.filter(a => a.status === '已归档').length}</span>
        </div>
        <OrderTable columns={detailColumns} data={filtered} loading={loading} emptyMessage="暂无稿件记录"
          onRowClick={() => {}} />
      </div>
      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined); }} onSave={handleSave} initial={editing} />
    </div>
  );
}
