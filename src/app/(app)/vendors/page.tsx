'use client';

import { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import CsvImportModal from '@/components/CsvImportModal';
import { Vendor } from '@/lib/types';
import { VendorRepo } from '@/lib/repo';
import { exportCsvTemplate } from '@/lib/csvExport';

const columns: Column<Vendor>[] = [
  { key: '供应商编号', label: '供应商编号', sortable: true },
  { key: '供应商名称', label: '供应商名称', sortable: true },
  { key: '联系人', label: '联系人' },
  { key: '电话', label: '电话' },
  { key: '税号', label: '税号' },
  { key: '银行帐号', label: '银行帐号' },
  { key: '开户行名称', label: '开户行' },
  { key: '地址', label: '地址' },
  { key: '备注', label: '备注' },
];

function VendorForm({ value, onChange, readOnlyCode }: { value: Partial<Vendor>; onChange: (key: keyof Vendor, v: any) => void; readOnlyCode?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">供应商编号 <span className="text-red-500">*</span></label>
        <input type="text" value={value.供应商编号 || ''} readOnly={readOnlyCode}
          onChange={readOnlyCode ? undefined : e => onChange('供应商编号', e.target.value)}
          className={`w-full border rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none ${readOnlyCode ? 'bg-gray-100 border-gray-200 text-gray-600' : 'border-gray-300'}`}
          placeholder="自动生成" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">供应商名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.供应商名称 || ''} onChange={e => onChange('供应商名称', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="供应商全称" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">联系人</label>
        <input type="text" value={value.联系人 || ''} onChange={e => onChange('联系人', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="联系人姓名" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">电话</label>
        <input type="text" value={value.电话 || ''} onChange={e => onChange('电话', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="电话/手机" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">地址</label>
        <input type="text" value={value.地址 || ''} onChange={e => onChange('地址', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="详细地址" />
      </div>
      {/* 开票信息 */}
      <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-500 mb-2">📋 开票信息</p>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">税号</label>
        <input type="text" value={value.税号 || ''} onChange={e => onChange('税号', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="统一社会信用代码" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">银行帐号</label>
        <input type="text" value={value.银行帐号 || ''} onChange={e => onChange('银行帐号', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="银行帐号" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">开户行号</label>
        <input type="text" value={value.开户行号 || ''} onChange={e => onChange('开户行号', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="联行号/支行号" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">开户行名称</label>
        <input type="text" value={value.开户行名称 || ''} onChange={e => onChange('开户行名称', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="开户行全称" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">备注</label>
        <textarea value={value.备注 || ''} onChange={e => onChange('备注', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} placeholder="备注信息" />
      </div>
    </div>
  );
}

function generateVendorCode(existing: Vendor[]): string {
  const codes = existing
    .map(v => v.供应商编号)
    .filter(Boolean)
    .filter(code => /^S\d+$/.test(code))
    .map(code => parseInt(code.slice(1), 10));
  const max = codes.length > 0 ? Math.max(...codes) : 0;
  return `S${String(max + 1).padStart(3, '0')}`;
}

function FormModal({ open, onClose, onSave, initial, existingVendors }: {
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<Vendor>) => void;
  initial?: Partial<Vendor>;
  existingVendors: Vendor[];
}) {
  const [form, setForm] = useState<Partial<Vendor>>(initial || {});
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      if (initial?.id) {
        setForm(initial);
      } else {
        setForm({ 供应商编号: generateVendorCode(existingVendors), 供应商名称: '', 联系人: '', 电话: '', 地址: '', 备注: '', 税号: '', 银行帐号: '', 开户行号: '', 开户行名称: '' });
      }
    } else if (open && initial?.id) {
      setForm(initial);
    }
    prevOpenRef.current = open;
  }, [open, initial]);
  if (!open) return null;

  const handleSave = async () => {
    if (!form.供应商编号 || !form.供应商名称) { alert('请填写供应商编号和供应商名称'); return; }
    try {
      await onSave(form);
      onClose();
    } catch (e: any) {
      alert('保存失败: ' + (e?.message || '未知错误'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑供应商' : '新建供应商'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5">
          <VendorForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} readOnlyCode={!initial?.id} />
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  const loadData = async () => { setLoading(true); try { setData(await VendorRepo.findAll()); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    return !q || [item.供应商编号, item.供应商名称, item.联系人, item.电话, item.地址, item.备注].some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Partial<Vendor>) => {
    if (editingItem?.id) await VendorRepo.update(editingItem.id, form);
    else await VendorRepo.create(form as Omit<Vendor, 'id'>);
    await loadData();
    setEditingItem(undefined);
  };

  const handleCsvImport = async (rows: Record<string, string>[]) => {
    for (const row of rows) {
      const code = row['供应商编号'] || row['编号'] || '';
      const name = row['供应商名称'] || row['名称'] || '';
      if (!code || !name) continue;
      const existing = data.find(v => v.供应商编号 === code);
      if (existing) {
        await VendorRepo.update(existing.id, {
          name: row['供应商名称'] || row['名称'] || existing.供应商名称,
          联系人: row['联系人'] || '',
          电话: row['电话'] || '',
          地址: row['地址'] || '',
          备注: row['备注'] || '',
        });
      } else {
        await VendorRepo.create({
          code, name: row['供应商名称'] || row['名称'] || name,
          联系人: row['联系人'] || '', 电话: row['电话'] || '',
          地址: row['地址'] || '', 备注: row['备注'] || '',
        });
      }
    }
    await loadData();
  };

  const handleEdit = (item: Vendor) => { setEditingItem(item); setModalOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm('确定删除该供应商？')) return; await VendorRepo.delete(id); await loadData(); };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(i => i.id)));
  };

  const handleBatchDelete = () => { if (selectedIds.size === 0) return; setShowBatchConfirm(true); };

  const confirmBatchDelete = async () => {
    for (const id of selectedIds) await VendorRepo.delete(id);
    setSelectedIds(new Set());
    setShowBatchConfirm(false);
    await loadData();
  };

  const selectColumn: Column<Vendor> = {
    key: 'select',
    label: <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll} className="w-4 h-4 rounded" />,
    render: (item: Vendor) => <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 rounded" onClick={e => e.stopPropagation()} />,
  };

  const tableColumns: Column<Vendor>[] = [
    selectColumn,
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
      {selectedIds.size > 0 && (
        <div className="px-5 py-2 bg-blue-50 border-b flex items-center justify-between">
          <span className="text-sm text-blue-700">已选择 <strong>{selectedIds.size}</strong> 项</span>
          <div className="flex gap-2">
            <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100">取消选择</button>
            <button onClick={handleBatchDelete} className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">批量删除 ({selectedIds.size})</button>
          </div>
        </div>
      )}
      <PageHeader title="供应商管理" searchPlaceholder="搜索 编号 / 名称 / 联系人 / 电话 / 地址 / 备注..." onSearch={setSearch}
        actions={[
          { label: '新建供应商', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem({}); setModalOpen(true); } },
          { label: '导入CSV', icon: '↓', variant: 'default' as const, onClick: () => setImportModalOpen(true) },
          { label: '导出CSV模版', icon: '↓', variant: 'default' as const, onClick: () => exportCsvTemplate(['供应商编号', '供应商名称', '联系人', '电话', '地址', '备注'], '供应商') },
          { label: '导出CSV', icon: '↑', variant: 'default' as const, onClick: () => {
            const csv = ['供应商编号,供应商名称,联系人,电话,地址,备注',
              ...filtered.map(v => `${v.供应商编号},${v.供应商名称},${v.联系人},${v.电话},${v.地址},${v.备注}`)].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `供应商列表_${new Date().toISOString().slice(0,10)}.csv`; a.click();
            URL.revokeObjectURL(url);
          }
 },
        ]} />
      <div className="flex-1 overflow-auto bg-white">
        <OrderTable columns={tableColumns} data={filtered} loading={loading} emptyMessage="暂无供应商数据"
          onRowClick={item => handleEdit(item)} renderOrderNumber={item => <span className="text-blue-600 font-mono text-xs hover:underline">{item.供应商编号}</span>} />
      </div>
      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(undefined); }} onSave={handleSave} initial={editingItem} existingVendors={data} />
      <CsvImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleCsvImport}
        headers={['供应商编号', '供应商名称', '联系人', '电话', '地址', '备注']}
        fields={['供应商编号', '供应商名称', '联系人', '电话', '地址', '备注']} />
      {showBatchConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">确认批量删除</h3>
            <p className="text-gray-600 mb-6">确定要删除选中的 <strong>{selectedIds.size}</strong> 个供应商吗？此操作不可撤销。</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowBatchConfirm(false)} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">取消</button>
              <button onClick={confirmBatchDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
