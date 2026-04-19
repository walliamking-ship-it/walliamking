'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { MoneyCell, DateCell } from '@/components/StatusBadge';
import { SalesInvoice, PurchaseInvoice, InvoiceStatus, SalesOrder, PurchaseOrder, Customer, Vendor } from '@/lib/types';
import { SalesInvoiceRepo, PurchaseInvoiceRepo, SalesOrderRepo, PurchaseOrderRepo, CustomerRepo, VendorRepo } from '@/lib/repo';

type InvoiceType = 'sales' | 'purchase';

function generateInvoiceNo(): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `FP${dateStr}${seq}`;
}

interface SalesInvoiceForm {
  单号: string;
  发票号: string;
  开票日期: string;
  客户名称: string;
  关联销售订单ids: string[];
  金额: number;
  税率: number;
  税额: number;
  状态: InvoiceStatus;
  备注: string;
  制单人: string;
}

interface PurchaseInvoiceForm {
  单号: string;
  发票号: string;
  开票日期: string;
  供应商名称: string;
  关联采购订单ids: string[];
  金额: number;
  税率: number;
  税额: number;
  状态: InvoiceStatus;
  备注: string;
  制单人: string;
}

function StatusTag({ status }: { status: InvoiceStatus }) {
  const colors: Record<InvoiceStatus, string> = {
    '未开': 'bg-gray-100 text-gray-500',
    '已开': 'bg-blue-50 text-blue-700',
    '已收票': 'bg-green-50 text-green-700',
    '已作废': 'bg-red-50 text-red-500',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>{status}</span>;
}

function SalesInvoiceFormModal({ open, onClose, onSave, initial, salesOrders, customers }: {
  open: boolean; onClose: () => void;
  onSave: (item: Omit<SalesInvoice, 'id'>) => void;
  initial?: SalesInvoice;
  salesOrders: SalesOrder[];
  customers: Customer[];
}) {
  const [form, setForm] = useState<SalesInvoiceForm>({
    单号: '', 发票号: '', 开票日期: '', 客户名称: '',
    关联销售订单ids: [], 金额: 0, 税率: 0.13, 税额: 0,
    状态: '未开', 备注: '', 制单人: '李紫璘',
  });

  useEffect(() => {
    if (open) {
      if (initial?.id) {
        setForm({
          单号: initial.单号, 发票号: initial.发票号, 开票日期: initial.开票日期,
          客户名称: initial.客户名称, 关联销售订单ids: initial.关联销售订单ids,
          金额: initial.金额, 税率: initial.税率, 税额: initial.税额,
          状态: initial.状态, 备注: initial.备注, 制单人: initial.制单人,
        });
      } else {
        setForm({ 单号: generateInvoiceNo(), 发票号: '', 开票日期: new Date().toISOString().slice(0,10), 客户名称: '', 关联销售订单ids: [], 金额: 0, 税率: 0.13, 税额: 0, 状态: '未开', 备注: '', 制单人: '李紫璘' });
      }
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSave = () => {
    if (!form.发票号 || !form.客户名称) { alert('请填写发票号和客户名称'); return; }
    onSave({
      单号: form.单号, 发票号: form.发票号, 开票日期: form.开票日期,
      客户名称: form.客户名称, 关联销售订单ids: form.关联销售订单ids,
      金额: form.金额, 税率: form.税率, 税额: form.税额,
      状态: form.状态, 备注: form.备注, 制单人: form.制单人,
    });
    onClose();
  };

  const updateField = (k: keyof SalesInvoiceForm, v: any) => {
    const next = { ...form, [k]: v };
    if (k === '金额' || k === '税率') {
      next.税额 = parseFloat((next.金额 * next.税率).toFixed(2));
    }
    setForm(next);
  };

  const toggleOrder = (id: string) => {
    const ids = form.关联销售订单ids.includes(id)
      ? form.关联销售订单ids.filter(i => i !== id)
      : [...form.关联销售订单ids, id];
    const so = salesOrders.find(s => ids.includes(s.id));
    setForm(f => ({ ...f, 关联销售订单ids: ids, 客户名称: so ? so.客户名称 : f.客户名称 }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑销售发票' : '新建销售发票'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">单号</label>
              <input type="text" value={form.单号} readOnly
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">发票号 <span className="text-red-500">*</span></label>
              <input type="text" value={form.发票号} onChange={e => updateField('发票号', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="发票号码" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">开票日期</label>
              <input type="date" value={form.开票日期} onChange={e => updateField('开票日期', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">客户名称 <span className="text-red-500">*</span></label>
              <select value={form.客户名称} onChange={e => updateField('客户名称', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="">请选择客户</option>
                {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">金额（含税）</label>
              <input type="number" step="0.01" value={form.金额 || ''} onChange={e => updateField('金额', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">税率</label>
              <select value={form.税率} onChange={e => updateField('税率', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value={0.13}>13%</option>
                <option value={0.09}>9%</option>
                <option value={0.06}>6%</option>
                <option value={0.03}>3%</option>
                <option value={0}>0%</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">税额</label>
              <input type="number" step="0.01" value={form.税额 || ''} readOnly
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">状态</label>
              <select value={form.状态} onChange={e => updateField('状态', e.target.value as InvoiceStatus)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="未开">未开</option>
                <option value="已开">已开</option>
                <option value="已收票">已收票</option>
                <option value="已作废">已作废</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">制单人</label>
              <input type="text" value={form.制单人} onChange={e => updateField('制单人', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">关联销售订单（可多选）</label>
            <div className="border rounded max-h-32 overflow-auto bg-white">
              {salesOrders.length === 0 && <div className="p-2 text-xs text-gray-400">暂无销售订单</div>}
              {salesOrders.map(so => (
                <label key={so.id} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer text-xs">
                  <input type="checkbox" checked={form.关联销售订单ids.includes(so.id)}
                    onChange={() => toggleOrder(so.id)} className="w-3.5 h-3.5 rounded" />
                  <span className="font-mono text-blue-600">{so.单号}</span>
                  <span className="text-gray-500">{so.客户名称}</span>
                  <span className="ml-auto text-gray-400">¥{so.合同金额.toFixed(2)}</span>
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

function PurchaseInvoiceFormModal({ open, onClose, onSave, initial, purchaseOrders, vendors }: {
  open: boolean; onClose: () => void;
  onSave: (item: Omit<PurchaseInvoice, 'id'>) => void;
  initial?: PurchaseInvoice;
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
}) {
  const [form, setForm] = useState<PurchaseInvoiceForm>({
    单号: '', 发票号: '', 开票日期: '', 供应商名称: '',
    关联采购订单ids: [], 金额: 0, 税率: 0.13, 税额: 0,
    状态: '未开', 备注: '', 制单人: '李紫璘',
  });

  useEffect(() => {
    if (open) {
      if (initial?.id) {
        setForm({
          单号: initial.单号, 发票号: initial.发票号, 开票日期: initial.开票日期,
          供应商名称: initial.供应商名称, 关联采购订单ids: initial.关联采购订单ids,
          金额: initial.金额, 税率: initial.税率, 税额: initial.税额,
          状态: initial.状态, 备注: initial.备注, 制单人: initial.制单人,
        });
      } else {
        setForm({ 单号: generateInvoiceNo(), 发票号: '', 开票日期: new Date().toISOString().slice(0,10), 供应商名称: '', 关联采购订单ids: [], 金额: 0, 税率: 0.13, 税额: 0, 状态: '未开', 备注: '', 制单人: '李紫璘' });
      }
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSave = () => {
    if (!form.发票号 || !form.供应商名称) { alert('请填写发票号和供应商名称'); return; }
    onSave({
      单号: form.单号, 发票号: form.发票号, 开票日期: form.开票日期,
      供应商名称: form.供应商名称, 关联采购订单ids: form.关联采购订单ids,
      金额: form.金额, 税率: form.税率, 税额: form.税额,
      状态: form.状态, 备注: form.备注, 制单人: form.制单人,
    });
    onClose();
  };

  const updateField = (k: keyof PurchaseInvoiceForm, v: any) => {
    const next = { ...form, [k]: v };
    if (k === '金额' || k === '税率') {
      next.税额 = parseFloat((next.金额 * next.税率).toFixed(2));
    }
    setForm(next);
  };

  const toggleOrder = (id: string) => {
    const ids = form.关联采购订单ids.includes(id)
      ? form.关联采购订单ids.filter(i => i !== id)
      : [...form.关联采购订单ids, id];
    const po = purchaseOrders.find(p => ids.includes(p.id));
    setForm(f => ({ ...f, 关联采购订单ids: ids, 供应商名称: po ? po.供应商名称 : f.供应商名称 }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑采购发票' : '新建采购发票'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">单号</label>
              <input type="text" value={form.单号} readOnly className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">发票号 <span className="text-red-500">*</span></label>
              <input type="text" value={form.发票号} onChange={e => updateField('发票号', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="发票号码" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">开票日期</label>
              <input type="date" value={form.开票日期} onChange={e => updateField('开票日期', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">供应商名称 <span className="text-red-500">*</span></label>
              <select value={form.供应商名称} onChange={e => updateField('供应商名称', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="">请选择供应商</option>
                {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">金额（含税）</label>
              <input type="number" step="0.01" value={form.金额 || ''} onChange={e => updateField('金额', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">税率</label>
              <select value={form.税率} onChange={e => updateField('税率', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value={0.13}>13%</option>
                <option value={0.09}>9%</option>
                <option value={0.06}>6%</option>
                <option value={0.03}>3%</option>
                <option value={0}>0%</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">税额</label>
              <input type="number" step="0.01" value={form.税额 || ''} readOnly className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">状态</label>
              <select value={form.状态} onChange={e => updateField('状态', e.target.value as InvoiceStatus)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
                <option value="未开">未开</option>
                <option value="已开">已开</option>
                <option value="已收票">已收票</option>
                <option value="已作废">已作废</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">制单人</label>
              <input type="text" value={form.制单人} onChange={e => updateField('制单人', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">关联采购订单（可多选）</label>
            <div className="border rounded max-h-32 overflow-auto bg-white">
              {purchaseOrders.length === 0 && <div className="p-2 text-xs text-gray-400">暂无采购订单</div>}
              {purchaseOrders.map(po => (
                <label key={po.id} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer text-xs">
                  <input type="checkbox" checked={form.关联采购订单ids.includes(po.id)}
                    onChange={() => toggleOrder(po.id)} className="w-3.5 h-3.5 rounded" />
                  <span className="font-mono text-blue-600">{po.单号}</span>
                  <span className="text-gray-500">{po.供应商名称}</span>
                  <span className="ml-auto text-gray-400">¥{po.合同金额.toFixed(2)}</span>
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

export default function InvoicesPage() {
  const [tab, setTab] = useState<InvoiceType>('sales');
  const [salesData, setSalesData] = useState<SalesInvoice[]>([]);
  const [purchaseData, setPurchaseData] = useState<PurchaseInvoice[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSales, setEditingSales] = useState<SalesInvoice | undefined>();
  const [editingPurchase, setEditingPurchase] = useState<PurchaseInvoice | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sInv, pInv, sos, pos, custs, vends] = await Promise.all([
        SalesInvoiceRepo.findAll(),
        PurchaseInvoiceRepo.findAll(),
        SalesOrderRepo.findAll(),
        PurchaseOrderRepo.findAll(),
        CustomerRepo.findAll(),
        VendorRepo.findAll(),
      ]);
      setSalesData(sInv);
      setPurchaseData(pInv);
      setSalesOrders(sos);
      setPurchaseOrders(pos);
      setCustomers(custs);
      setVendors(vends);
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const currentData = tab === 'sales' ? salesData : purchaseData;

  const filtered = currentData.filter(item => {
    const q = search.toLowerCase();
    if (tab === 'sales') {
      const s = item as SalesInvoice;
      return !q || [s.单号, s.发票号, s.客户名称, s.制单人, s.备注].some(v => v?.toLowerCase().includes(q));
    } else {
      const p = item as PurchaseInvoice;
      return !q || [p.单号, p.发票号, p.供应商名称, p.制单人, p.备注].some(v => v?.toLowerCase().includes(q));
    }
  });

  // 更新销售订单的开票状态
  const updateSalesOrderInvoiceStatus = async (salesOrderId: string) => {
    const allInvoices = await SalesInvoiceRepo.findAll();
    const orderInvoices = allInvoices.filter(inv => inv.关联销售订单ids.includes(salesOrderId));
    const order = await SalesOrderRepo.findById(salesOrderId);
    if (!order) return;
    const totalInvoiced = orderInvoices.reduce((s, inv) => s + (inv.金额 || 0), 0);
    const contractAmount = order.合同金额 || 0;
    let invoiceStatus: SalesOrder['开票状态'] = '未开票';
    if (totalInvoiced >= contractAmount && contractAmount > 0) invoiceStatus = '全部开票';
    else if (totalInvoiced > 0) invoiceStatus = '部分开票';
    await SalesOrderRepo.update(salesOrderId, { 开票状态: invoiceStatus });
  };

  // 更新采购订单的开票状态
  const updatePurchaseOrderInvoiceStatus = async (purchaseOrderId: string) => {
    const allInvoices = await PurchaseInvoiceRepo.findAll();
    const orderInvoices = allInvoices.filter(inv => inv.关联采购订单ids.includes(purchaseOrderId));
    const order = await PurchaseOrderRepo.findById(purchaseOrderId);
    if (!order) return;
    const totalInvoiced = orderInvoices.reduce((s, inv) => s + (inv.金额 || 0), 0);
    const contractAmount = order.合同金额 || 0;
    let invoiceStatus: PurchaseOrder['开票状态'] = '未开票';
    if (totalInvoiced >= contractAmount && contractAmount > 0) invoiceStatus = '全部开票';
    else if (totalInvoiced > 0) invoiceStatus = '部分开票';
    await PurchaseOrderRepo.update(purchaseOrderId, { 开票状态: invoiceStatus });
  };

  const handleSalesSave = async (form: Omit<SalesInvoice, 'id'>) => {
    if (editingSales?.id) await SalesInvoiceRepo.update(editingSales.id, form);
    else await SalesInvoiceRepo.create(form);
    // 更新关联销售订单的开票状态
    for (const soId of form.关联销售订单ids) {
      await updateSalesOrderInvoiceStatus(soId);
    }
    await loadData();
    setEditingSales(undefined);
  };

  const handlePurchaseSave = async (form: Omit<PurchaseInvoice, 'id'>) => {
    if (editingPurchase?.id) await PurchaseInvoiceRepo.update(editingPurchase.id, form);
    else await PurchaseInvoiceRepo.create(form);
    // 更新关联采购订单的开票状态
    for (const poId of form.关联采购订单ids) {
      await updatePurchaseOrderInvoiceStatus(poId);
    }
    await loadData();
    setEditingPurchase(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该发票？')) return;
    if (tab === 'sales') await SalesInvoiceRepo.delete(id);
    else await PurchaseInvoiceRepo.delete(id);
    await loadData();
  };

  const salesColumns: Column<SalesInvoice>[] = [
    { key: '单号', label: '单号', sortable: true },
    { key: '发票号', label: '发票号', sortable: true },
    { key: '开票日期', label: '开票日期', sortable: true },
    { key: '客户名称', label: '客户名称', sortable: true },
    { key: '金额', label: '金额', sortable: true },
    { key: '税率', label: '税率', sortable: true },
    { key: '税额', label: '税额', sortable: true },
    { key: '状态', label: '状态', sortable: true, render: (i: SalesInvoice) => <StatusTag status={i.状态} /> },
    { key: '制单人', label: '制单人' },
    { key: '备注', label: '备注' },
    { key: 'actions', label: '操作', render: (i: SalesInvoice) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setEditingSales(i); setModalOpen(true); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">编辑</button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(i.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
      </div>
    )},
  ];

  const purchaseColumns: Column<PurchaseInvoice>[] = [
    { key: '单号', label: '单号', sortable: true },
    { key: '发票号', label: '发票号', sortable: true },
    { key: '开票日期', label: '开票日期', sortable: true },
    { key: '供应商名称', label: '供应商名称', sortable: true },
    { key: '金额', label: '金额', sortable: true },
    { key: '税率', label: '税率', sortable: true },
    { key: '税额', label: '税额', sortable: true },
    { key: '状态', label: '状态', sortable: true, render: (i: PurchaseInvoice) => <StatusTag status={i.状态} /> },
    { key: '制单人', label: '制单人' },
    { key: '备注', label: '备注' },
    { key: 'actions', label: '操作', render: (i: PurchaseInvoice) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setEditingPurchase(i); setModalOpen(true); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">编辑</button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(i.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
      </div>
    )},
  ];

  const tabs = [
    { label: '销售发票', active: tab === 'sales', onClick: () => { setTab('sales'); setSelectedId(null); } },
    { label: '采购发票', active: tab === 'purchase', onClick: () => { setTab('purchase'); setSelectedId(null); } },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="发票管理"
        searchPlaceholder="搜索 单号 / 发票号 / 客户 / 供应商 / 制单人..."
        onSearch={setSearch}
        actions={[
          { label: `新建${tab === 'sales' ? '销售' : '采购'}发票`, icon: '＋', variant: 'primary' as const, onClick: () => {
            if (tab === 'sales') setEditingSales(undefined);
            else setEditingPurchase(undefined);
            setModalOpen(true);
          }},
        ]}
        tabs={tabs}
      />

      <div className="flex-1 overflow-auto bg-white">
        <OrderTable
          columns={(tab === 'sales' ? salesColumns : purchaseColumns) as any}
          data={filtered}
          loading={loading}
          emptyMessage={`暂无${tab === 'sales' ? '销售' : '采购'}发票`}
          onRowClick={item => setSelectedId(selectedId === item.id ? null : item.id)}
          renderOrderNumber={item => <span className="text-blue-600 font-mono text-xs hover:underline">{item.单号}</span>}
        />
      </div>

      {tab === 'sales' && (
        <SalesInvoiceFormModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingSales(undefined); }}
          onSave={handleSalesSave}
          initial={editingSales}
          salesOrders={salesOrders}
          customers={customers}
        />
      )}
      {tab === 'purchase' && (
        <PurchaseInvoiceFormModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingPurchase(undefined); }}
          onSave={handlePurchaseSave}
          initial={editingPurchase}
          purchaseOrders={purchaseOrders}
          vendors={vendors}
        />
      )}
    </div>
  );
}
