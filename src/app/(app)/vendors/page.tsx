'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import CsvImportModal from '@/components/CsvImportModal';
import { Vendor } from '@/lib/types';
import { VendorRepo } from '@/lib/repo';

const columns: Column<Vendor>[] = [
  { key: 'code', label: '供应商编号', sortable: true },
  { key: 'name', label: '供应商名称', sortable: true },
  { key: 'contact', label: '联系人' },
  { key: 'phone', label: '电话' },
  { key: 'address', label: '地址' },
  { key: 'remark', label: '备注' },
];

function VendorForm({ value, onChange }: { value: Partial<Vendor>; onChange: (key: keyof Vendor, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">供应商编号 <span className="text-red-500">*</span></label>
        <input type="text" value={value.code || ''} onChange={e => onChange('code', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="如: S01" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">供应商名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="供应商全称" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">联系人</label>
        <input type="text" value={value.contact || ''} onChange={e => onChange('contact', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="联系人姓名" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">电话</label>
        <input type="text" value={value.phone || ''} onChange={e => onChange('phone', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="电话/手机" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">地址</label>
        <input type="text" value={value.address || ''} onChange={e => onChange('address', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="详细地址" />
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
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<Vendor>) => void;
  initial?: Partial<Vendor>;
}) {
  const [form, setForm] = useState<Partial<Vendor>>(initial || {});
  useEffect(() => { setForm(initial || {}); }, [initial, open]);
  if (!open) return null;

  const handleSave = () => {
    if (!form.code || !form.name) { alert('请填写供应商编号和供应商名称'); return; }
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑供应商' : '新建供应商'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5">
          <VendorForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} />
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const [data, setData] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Vendor> | undefined>();
  const [importModalOpen, setImportModalOpen] = useState(false);

  const loadData = async () => { setLoading(true); try { setData(await VendorRepo.findAll()); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    return !q || [item.code, item.name, item.contact, item.phone, item.address, item.remark].some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Partial<Vendor>) => {
    if (editingItem?.id) await VendorRepo.update(editingItem.id, form);
    else await VendorRepo.create(form as Omit<Vendor, 'id'>);
    await loadData();
    setEditingItem(undefined);
  };

  const handleCsvImport = async (rows: Record<string, string>[]) => {
    for (const row of rows) {
      const code = row['供应商编号'] || row['编号'] || row['code'] || '';
      const name = row['供应商名称'] || row['名称'] || row['name'] || '';
      if (!code || !name) continue;
      const existing = data.find(v => v.code === code);
      if (existing) {
        await VendorRepo.update(existing.id, {
          name: row['供应商名称'] || row['名称'] || existing.name,
          contact: row['联系人'] || row['contact'] || '',
          phone: row['电话'] || row['phone'] || '',
          address: row['地址'] || row['address'] || '',
          remark: row['备注'] || row['remark'] || '',
        });
      } else {
        await VendorRepo.create({
          code, name: row['供应商名称'] || row['名称'] || name,
          contact: row['联系人'] || row['contact'] || '', phone: row['电话'] || row['phone'] || '',
          address: row['地址'] || row['address'] || '', remark: row['备注'] || row['remark'] || '',
        });
      }
    }
    await loadData();
  };

  const handleEdit = (item: Vendor) => { setEditingItem(item); setModalOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm('确定删除该供应商？')) return; await VendorRepo.delete(id); await loadData(); };

  const tableColumns: Column<Vendor>[] = [
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
      <PageHeader title="供应商管理" searchPlaceholder="搜索 编号 / 名称 / 联系人 / 电话 / 地址 / 备注..." onSearch={setSearch}
        actions={[
          { label: '新建供应商', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem({}); setModalOpen(true); } },
          { label: '导入CSV', icon: '↓', variant: 'default' as const, onClick: () => setImportModalOpen(true) },
          { label: '导出CSV', icon: '↑', variant: 'default' as const, onClick: () => {
            const csv = ['供应商编号,供应商名称,联系人,电话,地址,备注',
              ...filtered.map(v => `${v.code},${v.name},${v.contact},${v.phone},${v.address},${v.remark}`)].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `供应商列表_${new Date().toISOString().slice(0,10)}.csv`; a.click();
            URL.revokeObjectURL(url);
          } },
        ]} />
      <div className="flex-1 overflow-auto bg-white">
        <OrderTable columns={tableColumns} data={filtered} loading={loading} emptyMessage="暂无供应商数据"
          onRowClick={item => handleEdit(item)} renderOrderNumber={item => <span className="text-blue-600 font-mono text-xs hover:underline">{item.code}</span>} />
      </div>
      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(undefined); }} onSave={handleSave} initial={editingItem} />
      <CsvImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleCsvImport}
        headers={['供应商编号', '供应商名称', '联系人', '电话', '地址', '备注']}
        fields={['code', 'name', 'contact', 'phone', 'address', 'remark']} />
    </div>
  );
}
