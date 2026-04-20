'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { MoneyCell, DateCell } from '@/components/StatusBadge';
import { Bill, SalesOrder } from '@/lib/types';
import { BillRepo, SalesOrderRepo, CustomerRepo } from '@/lib/repo';

function generateBillNo(): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `ZD${dateStr}${seq}`;
}

interface BillFormData {
  单号: string;
  账单类型: '月度账单' | '自定义账单';
  客户名称: string;
  账期: string;
  开始日期: string;
  结束日期: string;
  关联销售订单ids: string[];
  应收金额: number;
  已收金额: number;
  未收金额: number;
  状态: '未结清' | '部分结清' | '已结清';
  备注: string;
  制单人: string;
}

function BillFormModal({ open, onClose, onSave, initial, customers, salesOrders }: {
  open: boolean; onClose: () => void;
  onSave: (item: Omit<Bill, 'id'>) => void;
  initial?: Bill;
  customers: { id: string; name: string }[];
  salesOrders: SalesOrder[];
}) {
  const [form, setForm] = useState<BillFormData>({
    单号: '', 账单类型: '月度账单', 客户名称: '', 账期: '', 开始日期: '', 结束日期: '',
    关联销售订单ids: [], 应收金额: 0, 已收金额: 0, 未收金额: 0,
    状态: '未结清', 备注: '', 制单人: '李紫璘',
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      if (initial?.id) {
        setForm({
          单号: initial.单号, 账单类型: initial.账单类型, 客户名称: initial.客户名称,
          账期: initial.账期, 开始日期: initial.开始日期, 结束日期: initial.结束日期,
          关联销售订单ids: initial.关联销售订单ids,
          应收金额: initial.应收金额, 已收金额: initial.已收金额, 未收金额: initial.未收金额,
          状态: initial.状态, 备注: initial.备注, 制单人: initial.制单人,
        });
        setSelectedIds(new Set(initial.关联销售订单ids));
      } else {
        setForm({ 单号: generateBillNo(), 账单类型: '月度账单', 客户名称: '', 账期: '', 开始日期: '', 结束日期: '', 关联销售订单ids: [], 应收金额: 0, 已收金额: 0, 未收金额: 0, 状态: '未结清', 备注: '', 制单人: '李紫璘' });
        setSelectedIds(new Set());
      }
    }
  }, [open, initial]);

  const updateField = (k: keyof BillFormData, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
  };

  const handleCustomerChange = (name: string, period?: string) => {
    setForm(f => ({ ...f, 客户名称: name, 账期: period || f.账期 }));
    if (period) {
      const [year, month] = period.split('-');
      const start = `${year}-${month}-01`;
      const end = `${year}-${month}-31`;
      setForm(f => ({ ...f, 客户名称: name, 账期: period, 开始日期: start, 结束日期: end }));
    }
  };

  const toggleOrder = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
    const total = salesOrders.filter(s => next.has(s.id)).reduce((sum, s) => sum + s.合同金额, 0);
    const received = salesOrders.filter(s => next.has(s.id)).reduce((sum, s) => sum + s.已收款, 0);
    setForm(f => ({ ...f, 关联销售订单ids: Array.from(next), 应收金额: total, 已收金额: received, 未收金额: total - received }));
  };

  if (!open) return null;

  const customerOrders = salesOrders.filter(s => s.客户名称 === form.客户名称);

  const handleSave = async () => {
    if (!form.客户名称) { alert('请选择客户'); return; }
    try {
      await onSave({
        ...form, 关联销售订单ids: Array.from(selectedIds),
        未收金额: form.应收金额 - form.已收金额,
      } as Omit<Bill, 'id'>);
      onClose();
    } catch (e: any) { alert('保存失败: ' + (e?.message || '未知错误')); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑账单' : '新建账单'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">单号</label>
              <input type="text" value={form.单号} readOnly className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">账单类型</label>
              <select value={form.账单类型} onChange={e => setForm(f => ({ ...f, 账单类型: e.target.value as '月度账单' | '自定义账单' }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="月度账单">月度账单</option>
                <option value="自定义账单">自定义账单</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">客户名称 <span className="text-red-500">*</span></label>
              <select value={form.客户名称} onChange={e => handleCustomerChange(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="">请选择客户</option>
                {customers.map(c => <option key={c.id} value={c.客户名称}>{c.客户名称}</option>)}
              </select>
            </div>
            {form.账单类型 === '月度账单' && (
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">账期（月份）</label>
                <input type="month" value={form.账期} onChange={e => handleCustomerChange(form.客户名称, e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            )}
            {form.账单类型 === '自定义账单' && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">开始日期</label>
                  <input type="date" value={form.开始日期} onChange={e => setForm(f => ({ ...f, 开始日期: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">结束日期</label>
                  <input type="date" value={form.结束日期} onChange={e => setForm(f => ({ ...f, 结束日期: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">应收金额</label>
              <input type="number" step="0.01" value={form.应收金额 || ''} readOnly
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">已收金额</label>
              <input type="number" step="0.01" value={form.已收金额 || ''} onChange={e => {
                const received = parseFloat(e.target.value) || 0;
                setForm(f => ({ ...f, 已收金额: received, 未收金额: f.应收金额 - received }));
              }}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">未收金额</label>
              <input type="number" step="0.01" value={form.应收金额 - form.已收金额} readOnly
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">状态</label>
              <select value={form.状态} onChange={e => setForm(f => ({ ...f, 状态: e.target.value as any }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="未结清">未结清</option>
                <option value="部分结清">部分结清</option>
                <option value="已结清">已结清</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">制单人</label>
              <input type="text" value={form.制单人} onChange={e => setForm(f => ({ ...f, 制单人: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          {form.客户名称 && (
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">选择销售订单（勾选后自动汇总金额）</label>
              <div className="border rounded max-h-48 overflow-auto bg-white">
                {customerOrders.length === 0 && <div className="p-3 text-xs text-gray-400">该客户暂无销售订单</div>}
                {customerOrders.map(so => (
                  <label key={so.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b last:border-b-0">
                    <input type="checkbox" checked={selectedIds.has(so.id)} onChange={() => toggleOrder(so.id)} className="w-3.5 h-3.5 rounded" />
                    <span className="font-mono text-blue-600">{so.单号}</span>
                    <span className="text-gray-500">{so.日期}</span>
                    <span className="ml-auto text-gray-400">¥{so.合同金额.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-0.5">备注</label>
            <textarea value={form.备注} onChange={e => setForm(f => ({ ...f, 备注: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} />
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function BillsPage() {
  const [data, setData] = useState<Bill[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Bill | undefined>();

  const loadData = async () => {
    setLoading(true);
    try {
      const [bills, orders, custs] = await Promise.all([
        BillRepo.findAll(),
        SalesOrderRepo.findAll(),
        CustomerRepo.findAll(),
      ]);
      setData(bills);
      setSalesOrders(orders);
      setCustomers(custs.map(c => ({ id: c.id, name: c.客户名称 })));
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(b => {
    const q = search.toLowerCase();
    return (!q || [b.单号, b.客户名称, b.制单人, b.备注].some(v => v?.toLowerCase().includes(q)))
      && (!customerFilter || b.客户名称 === customerFilter);
  });

  const handleSave = async (form: Omit<Bill, 'id'>) => {
    if (editingItem?.id) await BillRepo.update(editingItem.id, form);
    else await BillRepo.create(form);
    await loadData();
    setEditingItem(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该账单？')) return;
    await BillRepo.delete(id);
    await loadData();
  };

  const columns: Column<Bill>[] = [
    { key: '单号', label: '单号', sortable: true },
    { key: '账单类型', label: '类型', sortable: true },
    { key: '客户名称', label: '客户', sortable: true },
    { key: '账期', label: '账期', sortable: true },
    { key: '应收金额', label: '应收', sortable: true },
    { key: '已收金额', label: '已收', sortable: true },
    { key: '未收金额', label: '未收', sortable: true },
    { key: '状态', label: '状态', sortable: true },
    { key: '制单人', label: '制单人' },
    { key: '备注', label: '备注' },
    { key: 'actions', label: '操作', render: (b: Bill) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setEditingItem(b); setModalOpen(true); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">编辑</button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
      </div>
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="账单管理"
        searchPlaceholder="搜索 单号 / 客户 / 制单人 / 备注..."
        onSearch={setSearch}
        actions={[
          { label: '新建账单', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem(undefined); setModalOpen(true); } },
        ]}
      />
      {customers.length > 0 && (
        <div className="px-5 py-2 bg-white border-b flex gap-2 items-center">
          <span className="text-xs text-gray-500">客户筛选：</span>
          <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:border-blue-500 focus:outline-none bg-white">
            <option value="">全部客户</option>
            {customers.map(c => <option key={c.id} value={c.客户名称}>{c.客户名称}</option>)}
          </select>
          {customerFilter && <button onClick={() => setCustomerFilter('')} className="text-xs text-blue-600 hover:underline">清除筛选</button>}
        </div>
      )}
      <div className="flex-1 overflow-auto bg-white">
        <OrderTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="暂无账单"
          onRowClick={item => {}}
          renderOrderNumber={b => <span className="text-blue-600 font-mono text-xs hover:underline">{b.单号}</span>}
        />
      </div>

      <BillFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(undefined); }}
        onSave={handleSave}
        initial={editingItem}
        customers={customers}
        salesOrders={salesOrders}
      />
    </div>
  );
}
