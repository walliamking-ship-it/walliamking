'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { MoneyCell, DateCell } from '@/components/StatusBadge';
import PurchasePrintTemplate from '@/components/PurchasePrintTemplate';
import CsvImportModal from '@/components/CsvImportModal';
import { PurchaseOrder } from '@/lib/types';
import { PurchaseOrderRepo } from '@/lib/repo';

const columns: Column<PurchaseOrder>[] = [
  { key: '单号', label: '单号', sortable: true },
  { key: '供应商名称', label: '供应商名称', sortable: true },
  { key: '日期', label: '日期', sortable: true },
  { key: '合同金额', label: '合同金额', sortable: true },
  { key: '已收货', label: '已收货', sortable: true },
  { key: '未付款', label: '未付款', sortable: true },
  { key: '已付款', label: '已付款', sortable: true },
  { key: '付款状态', label: '付款状态', sortable: true },
  { key: '收货状态', label: '收货状态', sortable: true },
  { key: '制单人', label: '制单人' },
  { key: '备注', label: '备注' },
];

function PurchaseOrderForm({ value, onChange }: { value: Partial<PurchaseOrder>; onChange: (key: keyof PurchaseOrder, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">单号 <span className="text-red-500">*</span></label>
        <input type="text" value={value.单号 || ''} onChange={e => onChange('单号', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="CG+日期+序号" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">供应商名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.供应商名称 || ''} onChange={e => onChange('供应商名称', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="S01-供应商名" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">日期</label>
        <input type="date" value={value.日期 || ''} onChange={e => onChange('日期', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">计划付款日期</label>
        <input type="date" value={value.计划付款日期 || ''} onChange={e => onChange('计划付款日期', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">合同金额</label>
        <input type="number" step="0.01" value={value.合同金额 ?? ''} onChange={e => onChange('合同金额', parseFloat(e.target.value) || 0)}
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
        <label className="block text-xs text-gray-500 mb-0.5">收货地址</label>
        <input type="text" value={value.收货地址 || ''} onChange={e => onChange('收货地址', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="收货地址" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">备注</label>
        <textarea value={value.备注 || ''} onChange={e => onChange('备注', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} placeholder="备注信息" />
      </div>
    </div>
  );
}

function FormModal({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (item: Partial<PurchaseOrder>) => void; initial?: Partial<PurchaseOrder>; }) {
  const [form, setForm] = useState<Partial<PurchaseOrder>>(initial || {});
  useEffect(() => { setForm(initial || {}); }, [initial, open]);
  if (!open) return null;

  const handleSave = () => {
    if (!form.单号 || !form.供应商名称) { alert('请填写单号和供应商名称'); return; }
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑采购订单' : '新建采购订单'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5"><PurchaseOrderForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} /></div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseOrdersPage() {
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<PurchaseOrder> | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<PurchaseOrder | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const loadData = async () => { setLoading(true); try { setData(await PurchaseOrderRepo.findAll()); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    return !q || [item.单号, item.供应商名称, item.制单人, item.业务员, item.备注].some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Partial<PurchaseOrder>) => {
    if (editingItem?.id) await PurchaseOrderRepo.update(editingItem.id, form);
    else await PurchaseOrderRepo.create(form as Omit<PurchaseOrder, 'id'>);
    await loadData();
    setEditingItem(undefined);
  };

  const handleCsvImport = async (rows: Record<string, string>[]) => {
    for (const row of rows) {
      const no = row['单号'] || row['编号'] || '';
      const vendor = row['供应商名称'] || row['供应商'] || '';
      if (!no || !vendor) continue;
      const existing = data.find(p => p.单号 === no);
      const fields = {
        单号: no, 供应商名称: vendor,
        日期: row['日期'] || new Date().toISOString().slice(0,10),
        计划付款日期: row['计划付款日期'] || '',
        合同金额: parseFloat(row['合同金额'] || '0') || 0,
        已收货: parseFloat(row['已收货'] || '0') || 0,
        未付款: parseFloat(row['未付款'] || '0') || 0,
        已付款: parseFloat(row['已付款'] || '0') || 0,
        付款状态: (row['付款状态'] || '未付款') as '未付款' | '部分付款' | '全部付款',
        收货状态: (row['收货状态'] || '未收货') as '未收货' | '部分收货' | '全部收货',
        制单人: row['制单人'] || '', 业务员: row['业务员'] || '',
        收货地址: row['收货地址'] || '', 备注: row['备注'] || '',
      };
      if (existing) await PurchaseOrderRepo.update(existing.id, fields);
      else await PurchaseOrderRepo.create(fields as Omit<PurchaseOrder, 'id'>);
    }
    await loadData();
  };

  const handleEdit = (item: PurchaseOrder) => { setEditingItem(item); setModalOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm('确定删除该采购订单？')) return; await PurchaseOrderRepo.delete(id); await loadData(); };

  const tableColumns: Column<PurchaseOrder>[] = [
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
      <PageHeader title="采购订单" searchPlaceholder="搜索 单号 / 供应商名称 / 制单人 / 业务员 / 备注..." onSearch={setSearch}
        actions={[
          { label: '新建采购单', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem({}); setModalOpen(true); } },
          { label: '导入CSV', icon: '↓', variant: 'default' as const, onClick: () => setImportModalOpen(true) },
          { label: '导出CSV', icon: '↑', variant: 'default' as const, onClick: () => {
            const csv = ['单号,供应商名称,日期,合同金额,已收货,已付款,未付款,付款状态,收货状态,制单人,业务员,收货地址,备注',
              ...filtered.map(p => `${p.单号},${p.供应商名称},${p.日期},${p.合同金额},${p.已收货},${p.已付款},${p.未付款 || 0},${p.付款状态},${p.收货状态},${p.制单人},${p.业务员},${p.收货地址 || ''},${p.备注 || ''}`)].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `采购订单_${new Date().toISOString().slice(0,10)}.csv`; a.click();
            URL.revokeObjectURL(url);
          } },
        ]} />
      <div className="flex-1 overflow-auto bg-white">
        <OrderTable columns={tableColumns} data={filtered} loading={loading} emptyMessage="暂无采购订单"
          onRowClick={item => setSelectedId(selectedId === item.id ? null : item.id)}
          renderOrderNumber={item => <span className="text-blue-600 font-mono text-xs hover:underline">{item.单号}</span>} />
      </div>
      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(undefined); }} onSave={handleSave} initial={editingItem} />

      {/* 详情侧边栏 */}
      {selectedId && (() => {
        const item = data.find(d => d.id === selectedId);
        if (!item) return null;
        return (
          <div className="w-80 border-l bg-white flex flex-col flex-shrink-0">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm">订单详情</h3>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-500">单号</div>
                <div className="text-blue-600 font-mono">{item.单号}</div>
                <div className="text-gray-500">供应商</div>
                <div className="font-medium">{item.供应商名称}</div>
                <div className="text-gray-500">日期</div>
                <div><DateCell value={item.日期} /></div>
                <div className="text-gray-500">制单人</div>
                <div>{item.制单人 || '-'}</div>
                <div className="text-gray-500">业务员</div>
                <div>{item.业务员 || '-'}</div>
                <div className="text-gray-500">付款状态</div>
                <div><StatusBadge status={item.付款状态} /></div>
                <div className="text-gray-500">收货状态</div>
                <div><StatusBadge status={item.收货状态} /></div>
                <div className="text-gray-500">计划付款</div>
                <div><DateCell value={item.计划付款日期} /></div>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-gray-500">合同金额</span><MoneyCell value={item.合同金额} /></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">已收货</span><MoneyCell value={item.已收货} /></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">已付款</span><MoneyCell value={item.已付款} /></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">未付款</span><MoneyCell value={item.未付款} className={item.未付款 > 0 ? 'text-red-600 font-semibold' : ''} /></div>
              </div>
              {item.收货地址 && <div className="border-t pt-3"><div className="text-xs text-gray-500 mb-1">收货地址</div><div className="text-xs text-gray-700">{item.收货地址}</div></div>}
              {item.备注 && <div className="border-t pt-3"><div className="text-xs text-gray-500 mb-1">备注</div><div className="text-xs text-gray-700">{item.备注}</div></div>}
            </div>
            <div className="p-3 border-t flex gap-2">
              <button onClick={() => handleEdit(item)} className="flex-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50">编辑</button>
              <button onClick={() => setPrintOrder(item)} className="flex-1 px-3 py-1.5 text-sm border rounded hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">打印</button>
              <button onClick={() => handleDelete(item.id)} className="flex-1 px-3 py-1.5 text-sm border rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200">删除</button>
            </div>
          </div>
        );
      })()}

      {/* 打印弹窗 */}
      {printOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setPrintOrder(null)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl overflow-auto max-h-[95vh]" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b flex items-center justify-between bg-gray-50">
              <h2 className="text-base font-semibold">打印入库单 - {printOrder.单号}</h2>
              <button onClick={() => setPrintOrder(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="p-4">
              <PurchasePrintTemplate order={printOrder} />

      <CsvImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleCsvImport}
        headers={['单号', '供应商名称', '日期', '合同金额', '已收货', '已付款', '付款状态', '收货状态', '制单人', '业务员', '收货地址', '备注']}
        fields={['单号', '供应商名称', '日期', '合同金额', '已收货', '已付款', '付款状态', '收货状态', '制单人', '业务员', '收货地址', '备注']} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
