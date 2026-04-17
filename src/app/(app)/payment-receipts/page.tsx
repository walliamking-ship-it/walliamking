'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { MoneyCell, DateCell } from '@/components/StatusBadge';
import { PaymentReceipt, SalesOrder } from '@/lib/types';
import { PaymentReceiptRepo, SalesOrderRepo, SalesOrderItemRepo } from '@/lib/repo';

function generateReceiptNo(): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `SK${dateStr}${seq}`;
}

const PAYMENT_METHODS = ['现金', '银行转账', '微信', '支付宝', '其他'] as const;

function PaymentReceiptFormModal({ open, onClose, onSave, initial, salesOrders }: {
  open: boolean; onClose: () => void;
  onSave: (item: Omit<PaymentReceipt, 'id'>) => void;
  initial?: PaymentReceipt;
  salesOrders: SalesOrder[];
}) {
  const [form, setForm] = useState({
    单号: '', 收款日期: '', 客户名称: '', 关联销售订单ids: [] as string[],
    收款方式: '银行转账' as typeof PAYMENT_METHODS[number], 收款金额: 0,
    备注: '', 状态: '未确认' as '未确认' | '已确认', 制单人: '李紫璘',
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      if (initial?.id) {
        setForm({
          单号: initial.单号, 收款日期: initial.收款日期, 客户名称: initial.客户名称,
          关联销售订单ids: initial.关联销售订单ids, 收款方式: initial.收款方式,
          收款金额: initial.收款金额, 备注: initial.备注, 状态: initial.状态, 制单人: initial.制单人,
        });
        setSelectedIds(new Set(initial.关联销售订单ids));
      } else {
        setForm({ 单号: generateReceiptNo(), 收款日期: new Date().toISOString().slice(0,10), 客户名称: '', 关联销售订单ids: [], 收款方式: '银行转账', 收款金额: 0, 备注: '', 状态: '未确认', 制单人: '李紫璘' });
        setSelectedIds(new Set());
      }
    }
  }, [open, initial]);

  const updateField = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleOrder = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
    const total = salesOrders.filter(s => next.has(s.id)).reduce((sum, s) => sum + (s.合同金额 - s.已收款), 0);
    setForm(f => ({ ...f, 关联销售订单ids: Array.from(next), 收款金额: total }));
  };

  if (!open) return null;

  const handleSave = () => {
    if (!form.客户名称) { alert('请选择客户'); return; }
    if (selectedIds.size === 0) { alert('请至少选择一个销售订单'); return; }
    onSave({ ...form, 关联销售订单ids: Array.from(selectedIds) } as Omit<PaymentReceipt, 'id'>);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑收款单' : '新建收款单'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">单号</label>
              <input type="text" value={form.单号} readOnly className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">收款日期</label>
              <input type="date" value={form.收款日期} onChange={e => updateField('收款日期', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">客户名称 <span className="text-red-500">*</span></label>
              <input type="text" value={form.客户名称} onChange={e => updateField('客户名称', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="客户名称" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">收款方式</label>
              <select value={form.收款方式} onChange={e => updateField('收款方式', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">收款金额</label>
              <input type="number" step="0.01" value={form.收款金额 || ''} onChange={e => updateField('收款金额', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">状态</label>
              <select value={form.状态} onChange={e => updateField('状态', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="未确认">未确认</option>
                <option value="已确认">已确认</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">制单人</label>
              <input type="text" value={form.制单人} onChange={e => updateField('制单人', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">关联销售订单（勾选后自动计算未收余额合计）</label>
            <div className="border rounded max-h-48 overflow-auto bg-white">
              {salesOrders.length === 0 && <div className="p-3 text-xs text-gray-400">暂无销售订单</div>}
              {salesOrders.map(so => (
                <label key={so.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-xs border-b last:border-b-0">
                  <input type="checkbox" checked={selectedIds.has(so.id)} onChange={() => toggleOrder(so.id)} className="w-3.5 h-3.5 rounded" />
                  <span className="font-mono text-blue-600">{so.单号}</span>
                  <span className="text-gray-500">{so.客户名称}</span>
                  <span className="ml-auto text-right">
                    <span className="text-gray-400 text-xs">欠{so.未收款项.toFixed(2)}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">备注</label>
            <textarea value={form.备注} onChange={e => updateField('备注', e.target.value)}
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

export default function PaymentReceiptsPage() {
  const [data, setData] = useState<PaymentReceipt[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentReceipt | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [receipts, orders] = await Promise.all([
        PaymentReceiptRepo.findAll(),
        SalesOrderRepo.findAll(),
      ]);
      setData(receipts);
      setSalesOrders(orders);
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(r => {
    const q = search.toLowerCase();
    return !q || [r.单号, r.客户名称, r.制单人, r.备注].some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Omit<PaymentReceipt, 'id'>) => {
    if (editingItem?.id) {
      await PaymentReceiptRepo.update(editingItem.id, form);
    } else {
      await PaymentReceiptRepo.create(form);
      // 自动更新关联的销售订单已收款和状态
      if (form.状态 === '已确认') {
        // 计算各订单未收款合计
        const totalUnpaid = form.关联销售订单ids.reduce((sum, soId) => {
          const so = salesOrders.find(s => s.id === soId);
          return sum + (so ? (so.未收款项 || 0) : 0);
        }, 0);
        // 按未收款比例分配收款金额
        for (const soId of form.关联销售订单ids) {
          const so = salesOrders.find(s => s.id === soId);
          if (!so) continue;
          const unpaid = so.未收款项 || 0;
          const ratio = totalUnpaid > 0 ? unpaid / totalUnpaid : 1 / form.关联销售订单ids.length;
          const amountToAdd = Math.min(form.收款金额 * ratio, unpaid);
          if (amountToAdd <= 0) continue;
          const newReceived = (so.已收款 || 0) + amountToAdd;
          const newUnpaid = Math.max(0, (so.合同金额 || 0) - newReceived);
          const new收款状态 = newUnpaid <= 0 ? '全部收款' : '部分收款';
          await SalesOrderRepo.update(soId, {
            已收款: newReceived,
            未收款项: newUnpaid,
            收款状态: new收款状态,
          });
        }
      }
    }
    await loadData();
    setEditingItem(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该收款单？')) return;
    await PaymentReceiptRepo.delete(id);
    await loadData();
  };

  const columns: Column<PaymentReceipt>[] = [
    { key: '单号', label: '单号', sortable: true },
    { key: '收款日期', label: '收款日期', sortable: true },
    { key: '客户名称', label: '客户', sortable: true },
    { key: '收款方式', label: '收款方式' },
    { key: '收款金额', label: '收款金额', sortable: true },
    { key: '状态', label: '状态', sortable: true },
    { key: '制单人', label: '制单人' },
    { key: '备注', label: '备注' },
    { key: 'actions', label: '操作', render: (r: PaymentReceipt) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setEditingItem(r); setModalOpen(true); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">编辑</button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
      </div>
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="收款单"
        searchPlaceholder="搜索 单号 / 客户 / 制单人 / 备注..."
        onSearch={setSearch}
        actions={[
          { label: '新建收款单', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem(undefined); setModalOpen(true); } },
        ]}
      />
      <div className="flex-1 overflow-auto bg-white">
        <OrderTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="暂无收款单"
          onRowClick={item => setSelectedId(selectedId === item.id ? null : item.id)}
          renderOrderNumber={r => <span className="text-blue-600 font-mono text-xs hover:underline">{r.单号}</span>}
        />
      </div>

      <PaymentReceiptFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(undefined); }}
        onSave={handleSave}
        initial={editingItem}
        salesOrders={salesOrders}
      />
    </div>
  );
}
