'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import CsvImportModal from '@/components/CsvImportModal';
import { Workstation } from '@/lib/types';
import { WorkstationRepo } from '@/lib/repo';
import { exportCsvTemplate } from '@/lib/csvExport';

import StatusBadge, { MoneyCell } from '@/components/StatusBadge';

const columns: Column<Workstation>[] = [
  { key: 'name', label: '工序名称', sortable: true },
  { key: 'sequence', label: '顺序', sortable: true },
  { key: 'unitPrice', label: '计件单价', sortable: true, render: (w: Workstation) => <MoneyCell value={w.unitPrice} /> },
  { key: 'unit', label: '单位' },
  { key: 'outsource', label: '是否委外', render: (w: Workstation) => <StatusBadge status={w.outsource ? '是' : '否'} /> },
  { key: 'remark', label: '备注' },
];

function WorkstationForm({ value, onChange }: { value: Partial<Workstation>; onChange: (key: keyof Workstation, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">工序名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="工序名称" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">顺序</label>
        <input type="number" value={value.sequence ?? ''} onChange={e => onChange('sequence', parseInt(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="1" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">计件单价 (元/件)</label>
        <input type="number" step="0.01" min={0} value={value.unitPrice ?? ''} onChange={e => onChange('unitPrice', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">计件单位</label>
        <select value={value.unit || '件'} onChange={e => onChange('unit', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="件">件</option>
          <option value="个">个</option>
          <option value="张">张</option>
          <option value="色令/件">色令/件</option>
          <option value="米">米</option>
          <option value="令">令</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">是否委外</label>
        <select value={value.outsource ? '是' : '否'} onChange={e => onChange('outsource', e.target.value === '是')}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="否">否</option>
          <option value="是">是</option>
        </select>
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">备注</label>
        <textarea value={value.remark || ''} onChange={e => onChange('remark', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} placeholder="备注信息" />
      </div>
    </div>
  );
}

function FormModal({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (item: Partial<Workstation>) => void; initial?: Partial<Workstation>; }) {
  const [form, setForm] = useState<Partial<Workstation>>(initial || {});
  useEffect(() => { setForm(initial || {}); }, [initial, open]);
  if (!open) return null;
  const handleSave = async () => { if (!form.name) { alert('请填写工序名称'); return; } try { await onSave(form); onClose(); } catch (e: any) { alert('保存失败: ' + (e?.message || '未知错误')); } };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑工序' : '新建工序'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5"><WorkstationForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} /></div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function WorkstationsPage() {
  const [data, setData] = useState<Workstation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Workstation> | undefined>();
  const [importModalOpen, setImportModalOpen] = useState(false);

  const loadData = async () => { setLoading(true); try { setData(await WorkstationRepo.findAll()); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(item => { const q = search.toLowerCase(); return !q || [item.name, item.remark].some(v => v?.toLowerCase().includes(q)); });
  const handleSave = async (form: Partial<Workstation>) => { if (editingItem?.id) await WorkstationRepo.update(editingItem.id, form); else await WorkstationRepo.create(form as Omit<Workstation, 'id'>); await loadData(); setEditingItem(undefined); };
  const handleCsvImport = async (rows: Record<string, string>[]) => {
    for (const row of rows) {
      const name = row['工序名称'] || row['名称'] || '';
      if (!name) continue;
      const existing = data.find(w => w.name === name);
      const fields = { name, sequence: parseInt(row['顺序'] || row['sequence'] || '0') || 0, outsource: row['是否委外'] === '是' || row['outsource'] === 'true', remark: row['备注'] || '' };
      if (existing) { await WorkstationRepo.update(existing.id, fields); }
      else { await WorkstationRepo.create(fields as Omit<Workstation, 'id'>); }
    }
    await loadData();
  };
  const handleEdit = (item: Workstation) => { setEditingItem(item); setModalOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm('确定删除该工序？')) return; await WorkstationRepo.delete(id); await loadData(); };

  const tableColumns: Column<Workstation>[] = [...columns, { key: 'actions', label: '操作', render: (item) => (
    <div className="flex gap-1">
      <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">编辑</button>
      <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
    </div>
  )}];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="工序管理" searchPlaceholder="搜索 工序名称 / 备注..." onSearch={setSearch}
        actions={[
          { label: '新建工序', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem({}); setModalOpen(true); } },
          { label: '导入CSV', icon: '↓', variant: 'default' as const, onClick: () => setImportModalOpen(true) },
          { label: '导出CSV模版', icon: '↓', variant: 'default' as const, onClick: () => exportCsvTemplate(['工序名称', '顺序', '是否委外', '备注'], '工序') },
          { label: '导出CSV', icon: '↑', variant: 'default' as const, onClick: () => {
            const csv = ['工序名称,顺序,是否委外,备注',
              ...filtered.map(w => `${w.name},${w.sequence},${w.outsource ? '是' : '否'},${w.remark}`)].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `工序列表_${new Date().toISOString().slice(0,10)}.csv`; a.click();
            URL.revokeObjectURL(url);
          }
 },
        ]} />
      <div className="flex-1 overflow-auto bg-white">
        <OrderTable columns={tableColumns} data={filtered} loading={loading} emptyMessage="暂无工序数据" onRowClick={item => handleEdit(item)} />
      </div>
      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(undefined); }} onSave={handleSave} initial={editingItem} />
      <CsvImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleCsvImport}
        headers={['工序名称', '顺序', '是否委外', '备注']}
        fields={['name', 'sequence', 'outsource', 'remark']} />
    </div>
  );
}
