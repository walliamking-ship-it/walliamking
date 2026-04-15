'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { MoneyCell, DateCell } from '@/components/StatusBadge';
import CsvImportModal from '@/components/CsvImportModal';
import { ProcessingOrder } from '@/lib/types';
import { ProcessingOrderRepo } from '@/lib/repo';

const columns: Column<ProcessingOrder>[] = [
  { key: '单号', label: '单号', sortable: true },
  { key: '加工公司', label: '加工公司', sortable: true },
  { key: '加工工序', label: '加工工序' },
  { key: '日期', label: '日期', sortable: true },
  { key: '实际应付', label: '实际应付', sortable: true },
  { key: '已收货', label: '已收货' },
  { key: '未付款', label: '未付款' },
  { key: '已付款', label: '已付款' },
  { key: '付款状态', label: '付款状态', sortable: true },
  { key: '收货状态', label: '收货状态', sortable: true },
  { key: '制单人', label: '制单人' },
  { key: '备注', label: '备注' },
];

function ProcessingOrderForm({ value, onChange }: { value: Partial<ProcessingOrder>; onChange: (key: keyof ProcessingOrder, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">单号 <span className="text-red-500">*</span></label>
        <input type="text" value={value.单号 || ''} onChange={e => onChange('单号', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="JG+日期+序号" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">加工公司 <span className="text-red-500">*</span></label>
        <input type="text" value={value.加工公司 || ''} onChange={e => onChange('加工公司', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="加工公司名称" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">加工工序</label>
        <input type="text" value={value.加工工序 || ''} onChange={e => onChange('加工工序', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="工序名称" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">日期</label>
        <input type="date" value={value.日期 || ''} onChange={e => onChange('日期', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">计划入库日期</label>
        <input type="date" value={value.计划入库日期 || ''} onChange={e => onChange('计划入库日期', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">实际应付</label>
        <input type="number" step="0.01" value={value.实际应付 ?? ''} onChange={e => onChange('实际应付', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">已收货</label>
        <input type="number" step="0.01" value={value.已收货 ?? ''} onChange={e => onChange('已收货', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">已付款</label>
        <input type="number" step="0.01" value={value.已付款 ?? ''} onChange={e => onChange('已付款', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">付款状态</label>
        <select value={value.付款状态 || ''} onChange={e => onChange('付款状态', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="">请选择</option>
          <option value="未付款">未付款</option>
          <option value="部分付款">部分付款</option>
          <option value="全部付款">全部付款</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">收货状态</label>
        <select value={value.收货状态 || ''} onChange={e => onChange('收货状态', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="">请选择</option>
          <option value="未收货">未收货</option>
          <option value="部分收货">部分收货</option>
          <option value="全部收货">全部收货</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">制单人</label>
        <input type="text" value={value.制单人 || ''} onChange={e => onChange('制单人', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="制单人" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">业务员</label>
        <input type="text" value={value.业务员 || ''} onChange={e => onChange('业务员', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="业务员" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">加工地址</label>
        <input type="text" value={value.加工地址 || ''} onChange={e => onChange('加工地址', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="加工地址" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">备注</label>
        <textarea value={value.备注 || ''} onChange={e => onChange('备注', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} placeholder="备注信息" />
      </div>
    </div>
  );
}

function FormModal({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (item: Partial<ProcessingOrder>) => void; initial?: Partial<ProcessingOrder>; }) {
  const [form, setForm] = useState<Partial<ProcessingOrder>>(initial || {});
  useEffect(() => { setForm(initial || {}); }, [initial, open]);
  if (!open) return null;

  const handleSave = () => {
    if (!form.单号 || !form.加工公司) { alert('请填写单号和加工公司'); return; }
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑加工单' : '新建加工单'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5"><ProcessingOrderForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} /></div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function ProcessingOrdersPage() {
  const [data, setData] = useState<ProcessingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ProcessingOrder> | undefined>();
  const [importModalOpen, setImportModalOpen] = useState(false);

  const loadData = async () => { setLoading(true); try { setData(await ProcessingOrderRepo.findAll()); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    return !q || [item.单号, item.加工公司, item.加工工序, item.制单人, item.业务员, item.备注].some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Partial<ProcessingOrder>) => {
    if (editingItem?.id) await ProcessingOrderRepo.update(editingItem.id, form);
    else await ProcessingOrderRepo.create(form as Omit<ProcessingOrder, 'id'>);
    await loadData();
    setEditingItem(undefined);
  };

  const handleCsvImport = async (rows: Record<string, string>[]) => {
    for (const row of rows) {
      const no = row['单号'] || row['编号'] || '';
      const company = row['加工公司'] || '';
      if (!no || !company) continue;
      const existing = data.find(p => p.单号 === no);
      const fields = {
        单号: no, 加工公司: company,
        加工工序: row['加工工序'] || '', 日期: row['日期'] || '',
        计划入库日期: row['计划入库日期'] || '',
        实际应付: parseFloat(row['实际应付'] || '0') || 0,
        已收货: parseFloat(row['已收货'] || '0') || 0,
        未付款: parseFloat(row['未付款'] || '0') || 0,
        已付款: parseFloat(row['已付款'] || '0') || 0,
        付款状态: (row['付款状态'] || '未付款') as '未付款' | '部分付款' | '全部付款',
        收货状态: (row['收货状态'] || '未收货') as '未收货' | '部分收货' | '全部收货',
        制单人: row['制单人'] || '', 业务员: row['业务员'] || '',
        加工地址: row['加工地址'] || '', 备注: row['备注'] || '',
        云仓状态: '', 总箱数: 0, 总体积: 0, 总重量: 0, 入库状态: '', 出库状态: '',
      };
      if (existing) await ProcessingOrderRepo.update(existing.id, fields);
      else await ProcessingOrderRepo.create(fields as Omit<ProcessingOrder, 'id'>);
    }
    await loadData();
  };

  const handleEdit = (item: ProcessingOrder) => { setEditingItem(item); setModalOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm('确定删除该加工单？')) return; await ProcessingOrderRepo.delete(id); await loadData(); };

  const tableColumns: Column<ProcessingOrder>[] = [
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
      <PageHeader title="加工单" searchPlaceholder="搜索 单号 / 加工公司 / 工序 / 制单人 / 业务员 / 备注..." onSearch={setSearch}
        actions={[
          { label: '新建加工单', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem({}); setModalOpen(true); } },
          { label: '导入CSV', icon: '↓', variant: 'default' as const, onClick: () => setImportModalOpen(true) },
          { label: '导出CSV', icon: '↑', variant: 'default' as const, onClick: () => {
            const csv = ['单号,加工公司,加工工序,日期,计划入库日期,实际应付,已收货,已付款,未付款,付款状态,收货状态,制单人,业务员,加工地址,备注',
              ...filtered.map(p => `${p.单号},${p.加工公司},${p.加工工序 || ''},${p.日期},${p.计划入库日期 || ''},${p.实际应付 || 0},${p.已收货 || 0},${p.已付款 || 0},${p.未付款 || 0},${p.付款状态},${p.收货状态},${p.制单人},${p.业务员},${p.加工地址 || ''},${p.备注 || ''}`)].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `加工单_${new Date().toISOString().slice(0,10)}.csv`; a.click();
            URL.revokeObjectURL(url);
          } },
        ]} />
      <div className="flex-1 overflow-auto bg-white">
        <OrderTable columns={tableColumns} data={filtered} loading={loading} emptyMessage="暂无加工单"
          onRowClick={item => handleEdit(item)}
          renderOrderNumber={item => <span className="text-blue-600 font-mono text-xs hover:underline">{item.单号}</span>} />
      </div>
      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(undefined); }} onSave={handleSave} initial={editingItem} />
      <CsvImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleCsvImport}
        headers={['单号', '加工公司', '加工工序', '日期', '计划入库日期', '实际应付', '已收货', '已付款', '付款状态', '收货状态', '制单人', '业务员', '加工地址', '备注']}
        fields={['单号', '加工公司', '加工工序', '日期', '计划入库日期', '实际应付', '已收货', '已付款', '付款状态', '收货状态', '制单人', '业务员', '加工地址', '备注']} />
    </div>
  );
}
