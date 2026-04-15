'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { MoneyCell, DateCell } from '@/components/StatusBadge';
import PrintTemplate from '@/components/PrintTemplate';
import CsvImportModal from '@/components/CsvImportModal';
import { SalesOrder } from '@/lib/types';
import { SalesOrderRepo } from '@/lib/repo';

type FilterTab = 'all' | 'unpaid' | 'undelivered' | 'draft' | 'delivered';

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'undelivered', label: '未完成' },
  { key: 'draft', label: '草稿' },
  { key: 'delivered', label: '送货单' },
  { key: 'all', label: '销售流水表' },
];

const columns: Column<SalesOrder>[] = [
  { key: '单号', label: '单号', sortable: true },
  { key: '客户名称', label: '客户名称', sortable: true },
  { key: '日期', label: '日期', sortable: true },
  { key: '合同金额', label: '合同金额', sortable: true },
  { key: '已送货', label: '已送货', sortable: true },
  { key: '未收款项', label: '未收款项', sortable: true },
  { key: '已收款', label: '已收款', sortable: true },
  { key: '收款状态', label: '收款状态', sortable: true },
  { key: '送货状态', label: '送货状态', sortable: true },
  { key: '制单人', label: '制单人', sortable: true },
  { key: '备注', label: '备注' },
];

function SalesOrderForm({ value, onChange }: { value: Partial<SalesOrder>; onChange: (key: keyof SalesOrder, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">单号 <span className="text-red-500">*</span></label>
        <input type="text" value={value.单号 || ''} onChange={e => onChange('单号', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="XS+日期+序号" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">客户名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.客户名称 || ''} onChange={e => onChange('客户名称', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="C01-客户名" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">日期</label>
        <input type="date" value={value.日期 || ''} onChange={e => onChange('日期', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">计划收款日期</label>
        <input type="date" value={value.计划收款日期 || ''} onChange={e => onChange('计划收款日期', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">合同金额</label>
        <input type="number" step="0.01" value={value.合同金额 ?? ''} onChange={e => onChange('合同金额', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">已送货</label>
        <input type="number" step="0.01" value={value.已送货 ?? ''} onChange={e => onChange('已送货', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">已收款</label>
        <input type="number" step="0.01" value={value.已收款 ?? ''} onChange={e => onChange('已收款', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">收款状态</label>
        <select value={value.收款状态 || ''} onChange={e => onChange('收款状态', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="">请选择</option>
          <option value="未收款">未收款</option>
          <option value="部分收款">部分收款</option>
          <option value="全部收款">全部收款</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">送货状态</label>
        <select value={value.送货状态 || ''} onChange={e => onChange('送货状态', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="">请选择</option>
          <option value="未送货">未送货</option>
          <option value="部分送货">部分送货</option>
          <option value="全部送货">全部送货</option>
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
        <label className="block text-xs text-gray-500 mb-0.5">备注</label>
        <textarea value={value.备注 || ''} onChange={e => onChange('备注', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} placeholder="送货地址、快递单号等" />
      </div>
    </div>
  );
}

function FormModal({ open, onClose, onSave, initial }: {
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<SalesOrder>) => void;
  initial?: Partial<SalesOrder>;
}) {
  const [form, setForm] = useState<Partial<SalesOrder>>(initial || {});

  useEffect(() => {
    setForm(initial || {});
  }, [initial, open]);

  if (!open) return null;

  const handleSave = () => {
    if (!form.单号 || !form.客户名称) {
      alert('请填写单号和客户名称');
      return;
    }
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑销售订单' : '新建销售订单'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5">
          <SalesOrderForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} />
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function SalesOrdersPage() {
  const [data, setData] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<SalesOrder> | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<SalesOrder | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const all = await SalesOrderRepo.findAll();
      setData(all);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || [item.单号, item.客户名称, item.制单人, item.业务员, item.备注]
      .some(v => v?.toLowerCase().includes(q));
    const matchFilter = filter === 'all' || filter === 'draft' ||
      (filter === 'undelivered' && (item.送货状态 === '未送货' || item.送货状态 === '部分送货')) ||
      (filter === 'delivered' && item.送货状态 === '全部送货');
    return matchSearch && matchFilter;
  });

  const handleSave = async (form: Partial<SalesOrder>) => {
    if (editingItem?.id) {
      await SalesOrderRepo.update(editingItem.id, form);
    } else {
      await SalesOrderRepo.create(form as Omit<SalesOrder, 'id'>);
    }
    await loadData();
    setEditingItem(undefined);
  };

  const handleCsvImport = async (rows: Record<string, string>[]) => {
    for (const row of rows) {
      const no = row['单号'] || row['编号'] || '';
      const customer = row['客户名称'] || row['客户'] || '';
      if (!no || !customer) continue;
      const existing = data.find(s => s.单号 === no);
      const fields = {
        单号: no, 客户名称: customer,
        日期: row['日期'] || '', 计划收款日期: row['计划收款日期'] || '',
        合同金额: parseFloat(row['合同金额'] || '0') || 0,
        已送货: parseFloat(row['已送货'] || '0') || 0,
        已收款: parseFloat(row['已收款'] || '0') || 0,
        未收款项: parseFloat(row['未收款项'] || '0') || 0,
        收款状态: (row['收款状态'] || '未收款') as '未收款' | '部分收款' | '全部收款',
        送货状态: (row['送货状态'] || '未送货') as '未送货' | '部分送货' | '全部送货',
        制单人: row['制单人'] || '', 业务员: row['业务员'] || '',
        备注: row['备注'] || '',
      };
      if (existing) await SalesOrderRepo.update(existing.id, fields);
      else await SalesOrderRepo.create(fields as Omit<SalesOrder, 'id'>);
    }
    await loadData();
  };

  const handleEdit = (item: SalesOrder) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条销售订单？')) return;
    await SalesOrderRepo.delete(id);
    await loadData();
  };

  const tabs = [
    { label: '未完成', active: filter === 'undelivered', onClick: () => setFilter('undelivered') },
    { label: '草稿', active: filter === 'draft', onClick: () => setFilter('draft') },
    { label: '送货单', active: filter === 'delivered', onClick: () => setFilter('delivered') },
    { label: '销售流水表', active: false, onClick: () => alert('销售流水表功能开发中') },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="销售订单"
        searchPlaceholder="搜索 单号 / 客户名称 / 制单人 / 业务员 / 备注..."
        onSearch={setSearch}
        actions={[
          { label: '新建销售单', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem({}); setModalOpen(true); } },
          { label: '导入CSV', icon: '↓', variant: 'default' as const, onClick: () => setImportModalOpen(true) },
          { label: '导出CSV', icon: '↑', variant: 'default' as const, onClick: () => {
            const csv = ['单号,客户名称,日期,合同金额,已送货,未收款项,已收款,收款状态,送货状态,制单人,业务员,计划收款日期,备注',
              ...filtered.map(s => `${s.单号},${s.客户名称},${s.日期},${s.合同金额},${s.已送货},${s.未收款项 || 0},${s.已收款},${s.收款状态},${s.送货状态},${s.制单人},${s.业务员},${s.计划收款日期 || ''},${s.备注 || ''}`)].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `销售订单_${new Date().toISOString().slice(0,10)}.csv`; a.click();
            URL.revokeObjectURL(url);
          } },
        ]}
        tabs={tabs}
      />

      <div className="flex-1 overflow-auto bg-white">
        <OrderTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="暂无销售订单"
          onRowClick={item => setSelectedId(selectedId === item.id ? null : item.id)}
          renderOrderNumber={item => (
            <span className="text-blue-600 font-mono text-xs hover:underline">{item.单号}</span>
          )}
        />
      </div>

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
                <div className="text-gray-500">客户</div>
                <div className="font-medium">{item.客户名称}</div>
                <div className="text-gray-500">日期</div>
                <div><DateCell value={item.日期} /></div>
                <div className="text-gray-500">制单人</div>
                <div>{item.制单人 || '-'}</div>
                <div className="text-gray-500">业务员</div>
                <div>{item.业务员 || '-'}</div>
                <div className="text-gray-500">收款状态</div>
                <div><StatusBadge status={item.收款状态} /></div>
                <div className="text-gray-500">送货状态</div>
                <div><StatusBadge status={item.送货状态} /></div>
                <div className="text-gray-500">计划收款</div>
                <div><DateCell value={item.计划收款日期} /></div>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">合同金额</span>
                  <MoneyCell value={item.合同金额} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">已送货</span>
                  <MoneyCell value={item.已送货} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">已收款</span>
                  <MoneyCell value={item.已收款} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">未收款</span>
                  <MoneyCell value={item.未收款项} className={item.未收款项 > 0 ? 'text-red-600 font-semibold' : ''} />
                </div>
              </div>
              {item.备注 && (
                <div className="border-t pt-3">
                  <div className="text-xs text-gray-500 mb-1">备注</div>
                  <div className="text-xs text-gray-700">{item.备注}</div>
                </div>
              )}
            </div>
            <div className="p-3 border-t flex gap-2">
              <button onClick={() => handleEdit(item)} className="flex-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50">编辑</button>
              <button onClick={() => setPrintOrder(item)} className="flex-1 px-3 py-1.5 text-sm border rounded hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">打印</button>
              <button onClick={() => handleDelete(item.id)} className="flex-1 px-3 py-1.5 text-sm border rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200">删除</button>
            </div>
          </div>
        );
      })()}

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(undefined); }}
        onSave={handleSave}
        initial={editingItem}
      />
      {/* 打印弹窗 */}
      {printOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setPrintOrder(null)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl overflow-auto max-h-[95vh]" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b flex items-center justify-between bg-gray-50">
              <h2 className="text-base font-semibold">打印送货单 - {printOrder.单号}</h2>
              <button onClick={() => setPrintOrder(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="p-4">
              <PrintTemplate order={printOrder} />
            </div>
          </div>
        </div>
      )}

      <CsvImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleCsvImport}
        headers={['单号', '客户名称', '日期', '合同金额', '已送货', '已收款', '收款状态', '送货状态', '制单人', '业务员', '计划收款日期', '备注']}
        fields={['单号', '客户名称', '日期', '合同金额', '已送货', '已收款', '收款状态', '送货状态', '制单人', '业务员', '计划收款日期', '备注']} />
    </div>
  );
}
