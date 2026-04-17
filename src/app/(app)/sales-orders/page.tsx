'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { MoneyCell, DateCell } from '@/components/StatusBadge';
import PrintTemplate from '@/components/PrintTemplate';
import CsvImportModal from '@/components/CsvImportModal';
import { SalesOrder, SalesOrderItem, Product, DeliveryOrder, PaymentReceipt, SalesInvoice, CuttingDie, Artwork } from '@/lib/types';
import { SalesOrderRepo, SalesOrderItemRepo, ProductRepo, WarehouseRepo, DeliveryOrderRepo, DeliveryOrderItemRepo, PaymentReceiptRepo, SalesInvoiceRepo, CuttingDieRepo, ArtworkRepo, CustomerRepo } from '@/lib/repo';

type FilterTab = 'all' | 'unpaid' | 'undelivered' | 'draft' | 'delivered';

function generateSalesOrderNo(): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `XS${dateStr}${seq}`;
}

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
  { key: '开票状态', label: '开票状态', sortable: true },
  { key: '制单人', label: '制单人', sortable: true },
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
  已送货数量: number;
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
    已送货数量: p?.已送货数量 ?? 0,
    备注: p?.备注 || '',
  };
}

function OrderItemsEditor({ rows, onChange }: { rows: OrderItemRow[]; onChange: (rows: OrderItemRow[]) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductSelect, setShowProductSelect] = useState<number | null>(null);

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
        row.单价 = prod.salePrice;
        row.金额 = prod.salePrice * row.数量;
      }
    }
    if (field === '单价' || field === '数量') {
      row.金额 = row.单价 * row.数量;
    }
    updated[idx] = row;
    onChange(updated);
  };

  const addRow = () => {
    onChange([...rows, buildOrderItemRow()]);
  };

  const deleteRow = (idx: number) => {
    const updated = rows.filter((_, i) => i !== idx);
    onChange(updated);
  };

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
                <th className="px-2 py-1.5 font-medium">已送货</th>
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
                  <td className="px-1 py-1 text-gray-500">{row.已送货数量}</td>
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
                  <td className="px-2 py-1.5 text-gray-500">{rows.reduce((s, r) => s + r.已送货数量, 0)}</td>
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

function SalesOrderForm({ value, onChange }: { value: Partial<SalesOrder>; onChange: (key: keyof SalesOrder, v: any) => void }) {
  const [customers, setCustomers] = useState<any[]>([]);
  useEffect(() => { CustomerRepo.findAll().then(setCustomers); }, []);
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">单号</label>
        <div className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-gray-50 text-gray-500">
          {value.单号 || '自动生成'}
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">客户名称 <span className="text-red-500">*</span></label>
        <select value={value.客户名称 || ''} onChange={e => onChange('客户名称', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white" required>
          <option value="">请选择客户</option>
          {customers.map(c => <option key={c.id} value={c.name}>{c.name} ({c.code})</option>)}
        </select>
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
        <label className="block text-xs text-gray-500 mb-0.5">开票状态</label>
        <select value={value.开票状态 || ''} onChange={e => onChange('开票状态', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="">请选择</option>
          <option value="未开票">未开票</option>
          <option value="部分开票">部分开票</option>
          <option value="全部开票">全部开票</option>
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

function FormModal({ open, onClose, onSave, initial, initialItems }: {
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<SalesOrder>, items: OrderItemRow[]) => void;
  initial?: Partial<SalesOrder>;
  initialItems?: OrderItemRow[];
}) {
  const [form, setForm] = useState<Partial<SalesOrder>>(initial || {});
  const [items, setItems] = useState<OrderItemRow[]>(initialItems || []);

  useEffect(() => {
    setForm(initial || {});
    setItems(initialItems || []);
  }, [initial, initialItems, open]);

  if (!open) return null;

  const handleSave = () => {
    if (!form.客户名称) {
      alert('请选择客户名称');
      return;
    }
    onSave(form, items);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑销售订单' : '新建销售订单'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5">
          <SalesOrderForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} />
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

export default function SalesOrdersPage() {
  const [data, setData] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<SalesOrder> | undefined>();
  const [editingItems, setEditingItems] = useState<OrderItemRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<SalesOrder | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, SalesOrderItem[]>>({});
  const [warehouses, setWarehouses] = useState<{id: string; name: string}[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allDeliveryOrders, setAllDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [allPaymentReceipts, setAllPaymentReceipts] = useState<PaymentReceipt[]>([]);
  const [allInvoices, setAllInvoices] = useState<SalesInvoice[]>([]);
  const [allCuttingDies, setAllCuttingDies] = useState<CuttingDie[]>([]);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [detailTab, setDetailTab] = useState<'basic' | 'delivery' | 'payment' | 'invoice' | 'tools'>('basic');
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliverySourceOrder, setDeliverySourceOrder] = useState<SalesOrder | null>(null);
  const [deliveryForm, setDeliveryForm] = useState({ 发货仓库: '', 收货人: '', 联系电话: '', 车牌号: '', 备注: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const all = await SalesOrderRepo.findAll();
      setData(all);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); WarehouseRepo.findAll().then(ws => setWarehouses(ws.map(w => ({ id: w.id, name: w.name })))); ProductRepo.findAll().then(setAllProducts); }, []);

  // 加载关联数据（当选中订单时）
  useEffect(() => {
    if (!selectedId) return;
    // 同时加载订单明细
    if (!orderItemsMap[selectedId]) {
      SalesOrderItemRepo.findBySalesOrderId(selectedId).then(items => {
        setOrderItemsMap(prev => ({ ...prev, [selectedId]: items }));
      });
    }
    Promise.all([
      DeliveryOrderRepo.findAll(),
      PaymentReceiptRepo.findAll(),
      SalesInvoiceRepo.findAll(),
      CuttingDieRepo.findAll(),
      ArtworkRepo.findAll(),
    ]).then(([dos, prs, invs, dies, arts]) => {
      setAllDeliveryOrders(dos);
      setAllPaymentReceipts(prs);
      setAllInvoices(invs);
      setAllCuttingDies(dies);
      setAllArtworks(arts);
    });
  }, [selectedId]);

  // 选中订单的关联数据
  const selectedOrder = data.find(d => d.id === selectedId);
  const orderItems = selectedId ? (orderItemsMap[selectedId] || []) : [];
  const linkedDeliveries = allDeliveryOrders.filter(d => d.销售订单id === selectedId);
  const linkedPayments = allPaymentReceipts.filter(p => selectedId && p.关联销售订单ids.includes(selectedId));
  const linkedInvoices = allInvoices.filter(i => selectedId && i.关联销售订单ids.includes(selectedId));
  // 刀版/稿件：按订单明细中的产品ID匹配
  const productIdsInOrder = orderItems.map(i => i.产品id).filter(Boolean);
  const linkedCuttingDies = allCuttingDies.filter(d => d.productId && productIdsInOrder.includes(d.productId));
  const linkedArtworks = allArtworks.filter(a => {
    const p = allProducts.find(p => p.id === a.productId);
    return p && productIdsInOrder.includes(p.id);
  });

  const loadOrderItems = async (salesOrderId: string) => {
    if (!orderItemsMap[salesOrderId]) {
      const items = await SalesOrderItemRepo.findBySalesOrderId(salesOrderId);
      setOrderItemsMap(prev => ({ ...prev, [salesOrderId]: items }));
    }
  };

  const handleRowClick = async (item: SalesOrder) => {
    const newId = expandedId === item.id ? null : item.id;
    setExpandedId(newId);
    if (newId) {
      await loadOrderItems(newId);
    }
  };

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || [item.单号, item.客户名称, item.制单人, item.业务员, item.备注]
      .some(v => v?.toLowerCase().includes(q));
    const matchFilter = filter === 'all' || filter === 'draft' ||
      (filter === 'undelivered' && (item.送货状态 === '未送货' || item.送货状态 === '部分送货')) ||
      (filter === 'delivered' && item.送货状态 === '全部送货');
    return matchSearch && matchFilter;
  });

  const handleSave = async (form: Partial<SalesOrder>, rows: OrderItemRow[]) => {
    // 计算合同金额 = 明细金额合计
    const computed合同金额 = rows.filter(r => r.产品id).reduce((s, r) => s + r.金额, 0);
    const updatedForm = { ...form, 合同金额: computed合同金额 };
    if (editingItem?.id) {
      await SalesOrderRepo.update(editingItem.id, updatedForm);
      const existingItems = await SalesOrderItemRepo.findBySalesOrderId(editingItem.id);
      for (const ei of existingItems) await SalesOrderItemRepo.delete(ei.id);
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (r.产品id) {
          await SalesOrderItemRepo.create({
            销售订单id: editingItem.id,
            销售订单号: form.单号!,
            序号: i + 1,
            产品id: r.产品id,
            产品名称: r.产品名称,
            物料编码: r.物料编码,
            规格: r.规格,
            单位: r.单位,
            单价: r.单价,
            数量: r.数量,
            金额: r.金额,
            已送货数量: r.已送货数量,
            备注: r.备注,
          });
        }
      }
      // 重新计算订单金额/状态
      await SalesOrderRepo.recomputeAmounts(editingItem.id);
    } else {
      const created = await SalesOrderRepo.create({ ...updatedForm, id: String(Date.now()) } as Omit<SalesOrder, 'id'>);
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (r.产品id) {
          await SalesOrderItemRepo.create({
            销售订单id: created.id,
            销售订单号: created.单号,
            序号: i + 1,
            产品id: r.产品id,
            产品名称: r.产品名称,
            物料编码: r.物料编码,
            规格: r.规格,
            单位: r.单位,
            单价: r.单价,
            数量: r.数量,
            金额: r.金额,
            已送货数量: r.已送货数量,
            备注: r.备注,
          });
        }
      }
      // 重新计算订单金额/状态
      await SalesOrderRepo.recomputeAmounts(created.id);
    }
    await loadData();
    setEditingItem(undefined);
    setEditingItems([]);
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
        开票状态: (row['开票状态'] || '未开票') as '未开票' | '部分开票' | '全部开票',
        制单人: row['制单人'] || '', 业务员: row['业务员'] || '',
        备注: row['备注'] || '',
      };
      if (existing) await SalesOrderRepo.update(existing.id, fields);
      else await SalesOrderRepo.create(fields as Omit<SalesOrder, 'id'>);
    }
    await loadData();
  };

  const handleEdit = async (item: SalesOrder) => {
    const items = await SalesOrderItemRepo.findBySalesOrderId(item.id);
    setEditingItems(items.map(i => ({
      id: i.id,
      产品id: i.产品id,
      产品名称: i.产品名称,
      物料编码: i.物料编码,
      规格: i.规格,
      单位: i.单位,
      单价: i.单价,
      数量: i.数量,
      金额: i.金额,
      已送货数量: i.已送货数量,
      备注: i.备注,
    })));
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条销售订单？')) return;
    await SalesOrderRepo.delete(id);
    await loadData();
  };

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
    for (const id of selectedIds) await SalesOrderRepo.delete(id);
    setSelectedIds(new Set());
    setShowBatchConfirm(false);
    await loadData();
  };

  const selectColumn = {
    key: 'select',
    label: <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll} className="w-4 h-4 rounded" />,
    render: (item: SalesOrder) => <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 rounded" onClick={e => e.stopPropagation()} />,
  };

  const expandedItems = expandedId ? orderItemsMap[expandedId] || [] : [];

  const renderExpanded = (item: SalesOrder) => {
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
                <th className="px-2 py-1 font-medium">已送货</th>
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
                  <td className="px-2 py-1 text-gray-500">{row.已送货数量}</td>
                  <td className="px-2 py-1 text-gray-500">{row.备注}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-3 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setDeliverySourceOrder(item); setDeliveryForm({ 发货仓库: '', 收货人: '', 联系电话: '', 车牌号: '', 备注: '' }); setDeliveryModalOpen(true); }}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
          >
            ＋ 生成送货单
          </button>
        </div>
      </div>
    );
  };

  const tabs = [
    { label: '未完成', active: filter === 'undelivered', onClick: () => setFilter('undelivered') },
    { label: '草稿', active: filter === 'draft', onClick: () => setFilter('draft') },
    { label: '送货单', active: filter === 'delivered', onClick: () => setFilter('delivered') },
    { label: '销售流水表', active: false, onClick: () => alert('销售流水表功能开发中') },
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
      <PageHeader
        title="销售订单"
        searchPlaceholder="搜索 单号 / 客户名称 / 制单人 / 业务员 / 备注..."
        onSearch={setSearch}
        actions={[
          { label: '新建销售单', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem({ 单号: generateSalesOrderNo() }); setEditingItems([]); setModalOpen(true); } },
          { label: '导入CSV', icon: '↓', variant: 'default' as const, onClick: () => setImportModalOpen(true) },
          { label: '导出CSV', icon: '↑', variant: 'default' as const, onClick: () => {
            const csv = ['单号,客户名称,日期,合同金额,已送货,未收款项,已收款,收款状态,送货状态,开票状态,制单人,业务员,计划收款日期,备注',
              ...filtered.map(s => `${s.单号},${s.客户名称},${s.日期},${s.合同金额},${s.已送货},${s.未收款项 || 0},${s.已收款},${s.收款状态},${s.送货状态},${s.开票状态 || '未开票'},${s.制单人},${s.业务员},${s.计划收款日期 || ''},${s.备注 || ''}`)].join('\n');
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
          columns={[selectColumn, ...columns]}
          data={filtered}
          loading={loading}
          emptyMessage="暂无销售订单"
          expandedId={expandedId}
          onRowClick={item => { setSelectedId(selectedId === item.id ? null : item.id); handleRowClick(item); }}
          renderOrderNumber={item => (
            <span className="text-blue-600 font-mono text-xs hover:underline">{item.单号}</span>
          )}
          renderExpanded={renderExpanded}
        />
      </div>

      {/* 详情侧边栏 */}
      {selectedId && selectedOrder && (
        <div className="w-96 border-l bg-white flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="font-semibold text-sm">订单详情</h3>
            <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          {/* 基本信息 */}
          <div className="px-4 py-3 border-b grid grid-cols-2 gap-2 text-xs bg-gray-50">
            <div className="text-gray-500">单号</div>
            <div className="text-blue-600 font-mono">{selectedOrder.单号}</div>
            <div className="text-gray-500">客户</div>
            <div className="font-medium">{selectedOrder.客户名称}</div>
            <div className="text-gray-500">日期</div>
            <div><DateCell value={selectedOrder.日期} /></div>
            <div className="text-gray-500">收款状态</div>
            <div><StatusBadge status={selectedOrder.收款状态} /></div>
            <div className="text-gray-500">送货状态</div>
            <div><StatusBadge status={selectedOrder.送货状态} /></div>
            <div className="text-gray-500">合同金额</div>
            <MoneyCell value={selectedOrder.合同金额} />
            <div className="text-gray-500">已收款</div>
            <MoneyCell value={selectedOrder.已收款} />
            <div className="text-gray-500">未收款</div>
            <MoneyCell value={selectedOrder.未收款项} className={selectedOrder.未收款项 > 0 ? 'text-red-600 font-semibold' : ''} />
          </div>

          {/* Tab切换 */}
          <div className="flex border-b bg-gray-50">
            {[
              { key: 'basic', label: '明细' },
              { key: 'delivery', label: `送货单${linkedDeliveries.length > 0 ? `(${linkedDeliveries.length})` : ''}` },
              { key: 'payment', label: `收款${linkedPayments.length > 0 ? `(${linkedPayments.length})` : ''}` },
              { key: 'invoice', label: `发票${linkedInvoices.length > 0 ? `(${linkedInvoices.length})` : ''}` },
              { key: 'tools', label: `刀版/稿${linkedCuttingDies.length + linkedArtworks.length > 0 ? `(${linkedCuttingDies.length + linkedArtworks.length})` : ''}` },
            ].map(tab => (
              <button key={tab.key} onClick={() => setDetailTab(tab.key as typeof detailTab)}
                className={`flex-1 px-2 py-2 text-xs font-medium border-b-2 transition-colors ${detailTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab内容 */}
          <div className="flex-1 overflow-auto p-3">
            {/* 基本明细 */}
            {detailTab === 'basic' && (
              <div className="space-y-3">
                <div className="text-xs font-medium text-gray-600">订单明细 ({orderItems.length}项)</div>
                {orderItems.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">暂无明细</div>
                ) : (
                  <div className="space-y-1">
                    {orderItems.map((row, idx) => (
                      <div key={row.id || idx} className="bg-gray-50 rounded p-2 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-blue-600">{row.产品名称}</span>
                          <span className="text-gray-500">×{row.数量}{row.单位}</span>
                        </div>
                        <div className="flex justify-between mt-1 text-gray-400">
                          <span>单价 ¥{row.单价.toFixed(2)}</span>
                          <span className="text-blue-600">¥{row.金额.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedOrder.备注 && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
                    <div className="font-medium mb-1">备注</div>
                    {selectedOrder.备注}
                  </div>
                )}
              </div>
            )}

            {/* 送货单 */}
            {detailTab === 'delivery' && (
              <div className="space-y-2">
                {linkedDeliveries.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">暂无送货单</div>
                ) : (
                  linkedDeliveries.map(d => (
                    <div key={d.id} className="border rounded p-2 text-xs">
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-blue-600 font-mono">{d.单号}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${d.状态 === '已完成' ? 'bg-green-100 text-green-700' : d.状态 === '部分收货' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{d.状态}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-gray-500">
                        <div>收货人：{d.收货人}</div>
                        <div>电话：{d.联系电话}</div>
                        <div>仓库：{d.发货仓库}</div>
                        <div>日期：{d.发货日期}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 收款记录 */}
            {detailTab === 'payment' && (
              <div className="space-y-2">
                {linkedPayments.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">暂无收款记录</div>
                ) : (
                  linkedPayments.map(p => (
                    <div key={p.id} className="border rounded p-2 text-xs">
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-blue-600 font-mono">{p.单号}</span>
                        <span className="text-green-600 font-semibold">+¥{p.收款金额.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-gray-500">
                        <div>日期：{p.收款日期}</div>
                        <div>方式：{p.收款方式}</div>
                        <div>状态：{p.状态}</div>
                        <div>制单：{p.制单人}</div>
                      </div>
                      {p.备注 && <div className="mt-1 text-gray-400">备注：{p.备注}</div>}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 发票 */}
            {detailTab === 'invoice' && (
              <div className="space-y-2">
                {linkedInvoices.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">暂无发票</div>
                ) : (
                  linkedInvoices.map(inv => (
                    <div key={inv.id} className="border rounded p-2 text-xs">
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-blue-600 font-mono">{inv.单号}</span>
                        <span className="text-orange-600 font-semibold">¥{inv.金额.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-gray-500">
                        <div>发票号：{inv.发票号}</div>
                        <div>税率：{(inv.税率 * 100).toFixed(0)}%</div>
                        <div>税额：¥{inv.税额.toLocaleString()}</div>
                        <div>状态：{inv.状态}</div>
                        <div>开票日期：{inv.开票日期}</div>
                        <div>制单：{inv.制单人}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 刀版/稿件 */}
            {detailTab === 'tools' && (
              <div className="space-y-3">
                {linkedCuttingDies.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">🔪 刀版 ({linkedCuttingDies.length})</div>
                    {linkedCuttingDies.map(d => (
                      <div key={d.id} className="border rounded p-2 text-xs mb-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-orange-700">{d.code} - {d.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${d.status === '在用' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{d.status}</span>
                        </div>
                        <div className="text-gray-400 mt-0.5">
                          {d.dieType} | {d.size || '无尺寸'} | {d.location || '无位置'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {linkedArtworks.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">📄 稿件 ({linkedArtworks.length})</div>
                    {linkedArtworks.map(a => (
                      <div key={a.id} className="border rounded p-2 text-xs mb-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-purple-700">{a.code} - {a.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${a.status === '已定稿' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{a.status}</span>
                        </div>
                        <div className="text-gray-400 mt-0.5">
                          {a.fileFormat} | {a.colors} | {a.version}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {linkedCuttingDies.length === 0 && linkedArtworks.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-4">暂无关联刀版或稿件</div>
                )}
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          <div className="p-3 border-t flex gap-2">
            <button onClick={() => handleEdit(selectedOrder)} className="flex-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50">编辑</button>
            <button onClick={() => setPrintOrder(selectedOrder)} className="flex-1 px-3 py-1.5 text-sm border rounded hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">打印</button>
            <button onClick={() => handleDelete(selectedOrder.id)} className="flex-1 px-3 py-1.5 text-sm border rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200">删除</button>
          </div>
        </div>
      )}

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(undefined); setEditingItems([]); }}
        onSave={handleSave}
        initial={editingItem}
        initialItems={editingItems}
      />
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
        headers={['单号', '客户名称', '日期', '合同金额', '已送货', '已收款', '收款状态', '送货状态', '开票状态', '制单人', '业务员', '计划收款日期', '备注']}
        fields={['单号', '客户名称', '日期', '合同金额', '已送货', '已收款', '收款状态', '送货状态', '开票状态', '制单人', '业务员', '计划收款日期', '备注']} />
      {showBatchConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">确认批量删除</h3>
            <p className="text-gray-600 mb-6">确定要删除选中的 <strong>{selectedIds.size}</strong> 条销售订单吗？此操作不可撤销。</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowBatchConfirm(false)} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">取消</button>
              <button onClick={confirmBatchDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">确认删除</button>
            </div>
          </div>
        </div>
      )}

      {/* 生成送货单弹窗 */}
      {deliveryModalOpen && deliverySourceOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDeliveryModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <h2 className="text-base font-semibold">生成送货单</h2>
              <button onClick={() => setDeliveryModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-blue-50 rounded p-3 text-sm">
                <div className="text-blue-700 font-medium">关联销售订单：{deliverySourceOrder.单号}</div>
                <div className="text-blue-600 text-xs mt-1">客户：{deliverySourceOrder.客户名称}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">发货仓库 <span className="text-red-500">*</span></label>
                <select value={deliveryForm.发货仓库} onChange={e => setDeliveryForm(f => ({ ...f, 发货仓库: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
                  <option value="">请选择仓库</option>
                  {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">收货人</label>
                <input type="text" value={deliveryForm.收货人} onChange={e => setDeliveryForm(f => ({ ...f, 收货人: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="收货人姓名" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">联系电话</label>
                <input type="text" value={deliveryForm.联系电话} onChange={e => setDeliveryForm(f => ({ ...f, 联系电话: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="手机或电话" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">车牌号</label>
                <input type="text" value={deliveryForm.车牌号} onChange={e => setDeliveryForm(f => ({ ...f, 车牌号: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="如沪A12345" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">备注</label>
                <textarea value={deliveryForm.备注} onChange={e => setDeliveryForm(f => ({ ...f, 备注: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" rows={2} placeholder="备注信息" />
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
              <button onClick={() => setDeliveryModalOpen(false)} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
              <button onClick={async () => {
                if (!deliveryForm.发货仓库) { alert('请选择发货仓库'); return; }
                const items = orderItemsMap[deliverySourceOrder.id] || [];
                const today = new Date().toISOString().slice(0,10);
                const seq = String(Date.now() % 1000).padStart(3,'0');
                const deliveryNo = `SH${today.replace(/-/g,'')}${seq}`;
                const delivery = await DeliveryOrderRepo.create({
                  单号: deliveryNo, 销售订单id: deliverySourceOrder.id, 销售订单号: deliverySourceOrder.单号,
                  发货日期: today, 发货仓库: deliveryForm.发货仓库, 收货人: deliveryForm.收货人,
                  联系电话: deliveryForm.联系电话, 车牌号: deliveryForm.车牌号, 备注: deliveryForm.备注,
                  状态: '未完成', 制单人: deliverySourceOrder.制单人 || '', 创建时间: new Date().toISOString(),
                });
                for (const item of items) {
                  await DeliveryOrderItemRepo.create({
                    送货单id: delivery.id, 送货单号: deliveryNo,
                    销售订单明细id: item.id, 销售订单号: deliverySourceOrder.单号,
                    产品名称: item.产品名称, 规格: item.规格, 单位: item.单位,
                    本次送货数量: item.数量 - item.已送货数量, 备注: '',
                  });
                }
                await SalesOrderRepo.update(deliverySourceOrder.id, { 送货状态: '部分送货' });
                await loadData();
                setDeliveryModalOpen(false);
                alert(`送货单 ${deliveryNo} 已生成！`);
              }} className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700">确认生成</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
