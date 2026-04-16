'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { MoneyCell, DateCell } from '@/components/StatusBadge';
import PurchasePrintTemplate from '@/components/PurchasePrintTemplate';
import CsvImportModal from '@/components/CsvImportModal';
import { PurchaseOrder, PurchaseOrderItem, Product } from '@/lib/types';
import { PurchaseOrderRepo, PurchaseOrderItemRepo, ProductRepo, WarehouseRepo, ReceivingOrderRepo, ReceivingOrderItemRepo } from '@/lib/repo';

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

interface OrderItemRow {
  id?: string;
  产品id: string;
  产品名称: string;
  物料编码: string;
  规格: string;
  单位: string;
  单价: number;
  数量: number;
  金额: number;
  已收货数量: number;
  备注: string;
}

function buildOrderItemRow(p?: Partial<OrderItemRow>): OrderItemRow {
  return {
    id: p?.id || '',
    产品id: p?.产品id || '',
    产品名称: p?.产品名称 || '',
    物料编码: p?.物料编码 || '',
    规格: p?.规格 || '',
    单位: p?.单位 || '',
    单价: p?.单价 ?? 0,
    数量: p?.数量 ?? 0,
    金额: p?.金额 ?? 0,
    已收货数量: p?.已收货数量 ?? 0,
    备注: p?.备注 || '',
  };
}

function OrderItemsEditor({ rows, onChange }: { rows: OrderItemRow[]; onChange: (rows: OrderItemRow[]) => void }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    ProductRepo.findAll().then(setProducts);
  }, []);

  const updateRow = (idx: number, field: keyof OrderItemRow, value: any) => {
    const updated = [...rows];
    const row = { ...updated[idx], [field]: value };
    if (field === '产品id') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        row.产品名称 = prod.name;
        row.物料编码 = prod.code;
        row.规格 = prod.spec;
        row.单位 = prod.unit;
        row.单价 = prod.purchasePrice;
        row.金额 = prod.purchasePrice * row.数量;
      }
    }
    if (field === '单价' || field === '数量') {
      row.金额 = row.单价 * row.数量;
    }
    updated[idx] = row;
    onChange(updated);
  };

  const addRow = () => onChange([...rows, buildOrderItemRow()]);
  const deleteRow = (idx: number) => onChange(rows.filter((_, i) => i !== idx));

  return (
    <div className="mt-4 border rounded">
      <div className="px-3 py-2 bg-gray-50 border-b flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">订单明细</span>
        <button type="button" onClick={addRow} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">+ 添加明细</button>
      </div>
      {rows.length === 0 && <div className="p-4 text-center text-xs text-gray-400">暂无明细，点击上方按钮添加</div>}
      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-2 py-1.5 font-medium w-8">#</th>
                <th className="px-2 py-1.5 font-medium min-w-[140px]">产品</th>
                <th className="px-2 py-1.5 font-medium">物料编码</th>
                <th className="px-2 py-1.5 font-medium">规格</th>
                <th className="px-2 py-1.5 font-medium">单位</th>
                <th className="px-2 py-1.5 font-medium">单价</th>
                <th className="px-2 py-1.5 font-medium">数量</th>
                <th className="px-2 py-1.5 font-medium">金额</th>
                <th className="px-2 py-1.5 font-medium">已收货</th>
                <th className="px-2 py-1.5 font-medium">备注</th>
                <th className="px-2 py-1.5 font-medium w-12">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-2 py-1 text-gray-400">{idx + 1}</td>
                  <td className="px-1 py-1">
                    <select
                      value={row.产品id}
                      onChange={e => updateRow(idx, '产品id', e.target.value)}
                      className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 focus:outline-none bg-white"
                    >
                      <option value="">请选择产品</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-1 py-1"><span className="font-mono text-gray-600">{row.物料编码}</span></td>
                  <td className="px-1 py-1 text-gray-600">{row.规格}</td>
                  <td className="px-1 py-1 text-gray-600">{row.单位}</td>
                  <td className="px-1 py-1">
                    <input type="number" step="0.01" value={row.单价 || ''}
                      onChange={e => updateRow(idx, '单价', parseFloat(e.target.value) || 0)}
                      className="w-20 border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 focus:outline-none" />
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" step="1" value={row.数量 || ''}
                      onChange={e => updateRow(idx, '数量', parseInt(e.target.value) || 0)}
                      className="w-16 border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 focus:outline-none" />
                  </td>
                  <td className="px-1 py-1"><span className="font-mono text-blue-600">{row.金额.toFixed(2)}</span></td>
                  <td className="px-1 py-1 text-gray-500">{row.已收货数量}</td>
                  <td className="px-1 py-1">
                    <input type="text" value={row.备注}
                      onChange={e => updateRow(idx, '备注', e.target.value)}
                      className="w-20 border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 focus:outline-none" />
                  </td>
                  <td className="px-1 py-1 text-center">
                    <button type="button" onClick={() => deleteRow(idx)} className="text-red-400 hover:text-red-600 text-xs">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-medium">
                  <td colSpan={7} className="px-2 py-1.5 text-right text-gray-600">合计</td>
                  <td className="px-2 py-1.5 font-mono text-blue-700">{rows.reduce((s, r) => s + r.金额, 0).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-gray-500">{rows.reduce((s, r) => s + r.已收货数量, 0)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

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

function FormModal({ open, onClose, onSave, initial, initialItems }: {
  open: boolean; onClose: () => void;
  onSave: (item: Partial<PurchaseOrder>, items: OrderItemRow[]) => void;
  initial?: Partial<PurchaseOrder>;
  initialItems?: OrderItemRow[];
}) {
  const [form, setForm] = useState<Partial<PurchaseOrder>>(initial || {});
  const [items, setItems] = useState<OrderItemRow[]>(initialItems || []);
  useEffect(() => { setForm(initial || {}); setItems(initialItems || []); }, [initial, initialItems, open]);
  if (!open) return null;

  const handleSave = () => {
    if (!form.单号 || !form.供应商名称) { alert('请填写单号和供应商名称'); return; }
    onSave(form, items);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑采购订单' : '新建采购订单'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5">
          <PurchaseOrderForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} />
          <OrderItemsEditor rows={items} onChange={setItems} />
        </div>
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
  const [editingItems, setEditingItems] = useState<OrderItemRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<PurchaseOrder | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, PurchaseOrderItem[]>>({});
  const [warehouses, setWarehouses] = useState<{id: string; name: string}[]>([]);
  const [receivingModalOpen, setReceivingModalOpen] = useState(false);
  const [receivingSourceOrder, setReceivingSourceOrder] = useState<PurchaseOrder | null>(null);
  const [receivingForm, setReceivingForm] = useState({ 收货仓库: '', 收货人: '', 联系电话: '', 车牌号: '', 备注: '' });

  const loadData = async () => { setLoading(true); try { setData(await PurchaseOrderRepo.findAll()); } finally { setLoading(false); } };
  useEffect(() => { loadData(); WarehouseRepo.findAll().then(ws => setWarehouses(ws.map(w => ({ id: w.id, name: w.name })))); }, []);

  const loadOrderItems = async (purchaseOrderId: string) => {
    if (!orderItemsMap[purchaseOrderId]) {
      const items = await PurchaseOrderItemRepo.findByPurchaseOrderId(purchaseOrderId);
      setOrderItemsMap(prev => ({ ...prev, [purchaseOrderId]: items }));
    }
  };

  const handleRowClick = async (item: PurchaseOrder) => {
    const newId = expandedId === item.id ? null : item.id;
    setExpandedId(newId);
    if (newId) await loadOrderItems(newId);
  };

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    return !q || [item.单号, item.供应商名称, item.制单人, item.业务员, item.备注].some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Partial<PurchaseOrder>, rows: OrderItemRow[]) => {
    if (editingItem?.id) {
      await PurchaseOrderRepo.update(editingItem.id, form);
      const existingItems = await PurchaseOrderItemRepo.findByPurchaseOrderId(editingItem.id);
      for (const ei of existingItems) await PurchaseOrderItemRepo.delete(ei.id);
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (r.产品id) {
          await PurchaseOrderItemRepo.create({
            采购订单id: editingItem.id,
            采购订单号: form.单号!,
            序号: i + 1,
            产品id: r.产品id,
            产品名称: r.产品名称,
            物料编码: r.物料编码,
            规格: r.规格,
            单位: r.单位,
            单价: r.单价,
            数量: r.数量,
            金额: r.金额,
            已收货数量: r.已收货数量,
            备注: r.备注,
          });
        }
      }
    } else {
      const created = await PurchaseOrderRepo.create(form as Omit<PurchaseOrder, 'id'>);
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (r.产品id) {
          await PurchaseOrderItemRepo.create({
            采购订单id: created.id,
            采购订单号: created.单号,
            序号: i + 1,
            产品id: r.产品id,
            产品名称: r.产品名称,
            物料编码: r.物料编码,
            规格: r.规格,
            单位: r.单位,
            单价: r.单价,
            数量: r.数量,
            金额: r.金额,
            已收货数量: r.已收货数量,
            备注: r.备注,
          });
        }
      }
    }
    await loadData();
    setEditingItem(undefined);
    setEditingItems([]);
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

  const handleEdit = async (item: PurchaseOrder) => {
    const items = await PurchaseOrderItemRepo.findByPurchaseOrderId(item.id);
    setEditingItems(items.map(i => ({
      id: i.id, 产品id: i.产品id, 产品名称: i.产品名称,
      物料编码: i.物料编码, 规格: i.规格, 单位: i.单位,
      单价: i.单价, 数量: i.数量, 金额: i.金额,
      已收货数量: i.已收货数量, 备注: i.备注,
    })));
    setEditingItem(item);
    setModalOpen(true);
  };
  const handleDelete = async (id: string) => { if (!confirm('确定删除该采购订单？')) return; await PurchaseOrderRepo.delete(id); await loadData(); };

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
    for (const id of selectedIds) await PurchaseOrderRepo.delete(id);
    setSelectedIds(new Set());
    setShowBatchConfirm(false);
    await loadData();
  };

  const selectColumn = {
    key: 'select',
    label: <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll} className="w-4 h-4 rounded" />,
    render: (item: PurchaseOrder) => <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 rounded" onClick={e => e.stopPropagation()} />,
  };

  const renderExpanded = (item: PurchaseOrder) => {
    const items = orderItemsMap[item.id] || [];
    return (
      <div className="p-3 bg-gray-50 border-t">
        <div className="text-xs font-medium text-gray-600 mb-2">订单明细</div>
        {items.length === 0 && <div className="text-xs text-gray-400">暂无明细</div>}
        {items.length > 0 && (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 bg-white">
                <th className="px-2 py-1 font-medium">#</th>
                <th className="px-2 py-1 font-medium">产品名称</th>
                <th className="px-2 py-1 font-medium">物料编码</th>
                <th className="px-2 py-1 font-medium">规格</th>
                <th className="px-2 py-1 font-medium">单位</th>
                <th className="px-2 py-1 font-medium">单价</th>
                <th className="px-2 py-1 font-medium">数量</th>
                <th className="px-2 py-1 font-medium">金额</th>
                <th className="px-2 py-1 font-medium">已收货</th>
                <th className="px-2 py-1 font-medium">备注</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr key={row.id} className="border-t bg-white hover:bg-gray-50">
                  <td className="px-2 py-1 text-gray-400">{idx + 1}</td>
                  <td className="px-2 py-1">{row.产品名称}</td>
                  <td className="px-2 py-1 font-mono text-gray-600">{row.物料编码}</td>
                  <td className="px-2 py-1 text-gray-600">{row.规格}</td>
                  <td className="px-2 py-1 text-gray-600">{row.单位}</td>
                  <td className="px-2 py-1 font-mono">{row.单价.toFixed(2)}</td>
                  <td className="px-2 py-1">{row.数量}</td>
                  <td className="px-2 py-1 font-mono text-blue-600">{row.金额.toFixed(2)}</td>
                  <td className="px-2 py-1 text-gray-500">{row.已收货数量}</td>
                  <td className="px-2 py-1 text-gray-500">{row.备注}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-3 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setReceivingSourceOrder(item); setReceivingForm({ 收货仓库: '', 收货人: '', 联系电话: '', 车牌号: '', 备注: '' }); setReceivingModalOpen(true); }}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
          >
            ＋ 生成收货单
          </button>
        </div>
      </div>
    );
  };

  const tableColumns: Column<PurchaseOrder>[] = [
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
      <PageHeader title="采购订单" searchPlaceholder="搜索 单号 / 供应商名称 / 制单人 / 业务员 / 备注..." onSearch={setSearch}
        actions={[
          { label: '新建采购单', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem({}); setEditingItems([]); setModalOpen(true); } },
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
          expandedId={expandedId}
          onRowClick={item => { setSelectedId(selectedId === item.id ? null : item.id); handleRowClick(item); }}
          renderOrderNumber={item => <span className="text-blue-600 font-mono text-xs hover:underline">{item.单号}</span>}
          renderExpanded={renderExpanded} />
      </div>
      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(undefined); setEditingItems([]); }} onSave={handleSave} initial={editingItem} initialItems={editingItems} />

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

      {printOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setPrintOrder(null)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl overflow-auto max-h-[95vh]" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b flex items-center justify-between bg-gray-50">
              <h2 className="text-base font-semibold">打印入库单 - {printOrder.单号}</h2>
              <button onClick={() => setPrintOrder(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="p-4">
              <PurchasePrintTemplate order={printOrder} />
            </div>
          </div>
        </div>
      )}

      <CsvImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleCsvImport}
        headers={['单号', '供应商名称', '日期', '合同金额', '已收货', '已付款', '付款状态', '收货状态', '制单人', '业务员', '收货地址', '备注']}
        fields={['单号', '供应商名称', '日期', '合同金额', '已收货', '已付款', '付款状态', '收货状态', '制单人', '业务员', '收货地址', '备注']} />

      {showBatchConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">确认批量删除</h3>
            <p className="text-gray-600 mb-6">确定要删除选中的 <strong>{selectedIds.size}</strong> 条采购订单吗？此操作不可撤销。</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowBatchConfirm(false)} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">取消</button>
              <button onClick={confirmBatchDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">确认删除</button>
            </div>
          </div>
        </div>
      )}

      {/* 生成收货单弹窗 */}
      {receivingModalOpen && receivingSourceOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setReceivingModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <h2 className="text-base font-semibold">生成收货单</h2>
              <button onClick={() => setReceivingModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-blue-50 rounded p-3 text-sm">
                <div className="text-blue-700 font-medium">关联采购订单：{receivingSourceOrder.单号}</div>
                <div className="text-blue-600 text-xs mt-1">供应商：{receivingSourceOrder.供应商名称}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">收货仓库 <span className="text-red-500">*</span></label>
                <select value={receivingForm.收货仓库} onChange={e => setReceivingForm(f => ({ ...f, 收货仓库: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
                  <option value="">请选择仓库</option>
                  {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">收货人</label>
                <input type="text" value={receivingForm.收货人} onChange={e => setReceivingForm(f => ({ ...f, 收货人: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="收货人姓名" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">联系电话</label>
                <input type="text" value={receivingForm.联系电话} onChange={e => setReceivingForm(f => ({ ...f, 联系电话: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="手机或电话" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">车牌号</label>
                <input type="text" value={receivingForm.车牌号} onChange={e => setReceivingForm(f => ({ ...f, 车牌号: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="如沪A12345" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">备注</label>
                <textarea value={receivingForm.备注} onChange={e => setReceivingForm(f => ({ ...f, 备注: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" rows={2} placeholder="备注信息" />
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
              <button onClick={() => setReceivingModalOpen(false)} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
              <button onClick={async () => {
                if (!receivingForm.收货仓库) { alert('请选择收货仓库'); return; }
                const items = orderItemsMap[receivingSourceOrder.id] || [];
                const today = new Date().toISOString().slice(0,10);
                const seq = String(Date.now() % 1000).padStart(3,'0');
                const receivingNo = `RK${today.replace(/-/g,'')}${seq}`;
                const receiving = await ReceivingOrderRepo.create({
                  单号: receivingNo, 采购订单id: receivingSourceOrder.id, 采购订单号: receivingSourceOrder.单号,
                  收货日期: today, 收货仓库: receivingForm.收货仓库, 收货人: receivingForm.收货人,
                  联系电话: receivingForm.联系电话, 车牌号: receivingForm.车牌号, 备注: receivingForm.备注,
                  状态: '未完成', 制单人: receivingSourceOrder.制单人 || '', 创建时间: new Date().toISOString(),
                });
                for (const item of items) {
                  await ReceivingOrderItemRepo.create({
                    收货单id: receiving.id, 收货单号: receivingNo,
                    采购订单明细id: item.id, 采购订单号: receivingSourceOrder.单号,
                    产品名称: item.产品名称, 规格: item.规格, 单位: item.单位,
                    本次收货数量: item.数量 - item.已收货数量, 备注: '',
                  });
                }
                await PurchaseOrderRepo.update(receivingSourceOrder.id, { 收货状态: '部分收货' });
                await loadData();
                setReceivingModalOpen(false);
                alert(`收货单 ${receivingNo} 已生成！`);
              }} className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700">确认生成</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
