'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import StatusBadge, { DateCell } from '@/components/StatusBadge';
import { ReceivingOrder, ReceivingOrderItem, PurchaseOrder, PurchaseOrderItem, Warehouse } from '@/lib/types';
import { ReceivingOrderRepo, ReceivingOrderItemRepo, PurchaseOrderRepo, PurchaseOrderItemRepo, WarehouseRepo } from '@/lib/repo';
import { exportCsvTemplate } from '@/lib/csvExport';

const columns: Column<ReceivingOrder>[] = [
  { key: '单号', label: '单号', sortable: true },
  { key: '采购订单号', label: '关联采购单号', sortable: true },
  { key: '收货日期', label: '收货日期', sortable: true },
  { key: '收货人', label: '收货人', sortable: true },
  { key: '联系电话', label: '联系电话' },
  { key: '收货仓库', label: '收货仓库', sortable: true },
  { key: '车牌号', label: '车牌号' },
  { key: '状态', label: '状态', sortable: true },
  { key: '制单人', label: '制单人', sortable: true },
  { key: '备注', label: '备注' },
];

interface ReceivingItemRow {
  采购订单明细id: string;
  产品名称: string;
  规格: string;
  单位: string;
  本次收货数量: number;
  备注: string;
}

function generateReceivingNo(): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `RK${dateStr}${seq}`;
}

function ReceivingOrderForm({ value, onChange, purchaseOrders }: {
  value: Partial<ReceivingOrder>;
  onChange: (key: keyof ReceivingOrder, v: any) => void;
  purchaseOrders: PurchaseOrder[];
}) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    WarehouseRepo.findAll().then(setWarehouses);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">单号</label>
        <input type="text" value={value.单号 || ''} onChange={e => onChange('单号', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-gray-100" placeholder="自动生成" readOnly />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">关联采购订单 <span className="text-red-500">*</span></label>
        <select value={value.采购订单id || ''} onChange={e => {
          const po = purchaseOrders.find(p => p.id === e.target.value);
          onChange('采购订单id', e.target.value);
          onChange('采购订单号', po?.单号 || '');
        }}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="">请选择采购订单</option>
          {purchaseOrders.map(p => (
            <option key={p.id} value={p.id}>{p.单号} - {p.供应商名称}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">收货日期 <span className="text-red-500">*</span></label>
        <input type="date" value={value.收货日期 || ''} onChange={e => onChange('收货日期', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">收货人 <span className="text-red-500">*</span></label>
        <input type="text" value={value.收货人 || ''} onChange={e => onChange('收货人', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="收货人姓名" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">联系电话</label>
        <input type="text" value={value.联系电话 || ''} onChange={e => onChange('联系电话', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="电话" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">收货仓库</label>
        <select value={value.收货仓库 || ''} onChange={e => onChange('收货仓库', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="">请选择仓库</option>
          {warehouses.map(w => <option key={w.id} value={w.仓库}>{w.仓库}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">车牌号</label>
        <input type="text" value={value.车牌号 || ''} onChange={e => onChange('车牌号', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="沪A12345" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">制单人</label>
        <input type="text" value={value.制单人 || ''} onChange={e => onChange('制单人', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="制单人" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">备注</label>
        <textarea value={value.备注 || ''} onChange={e => onChange('备注', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} placeholder="备注信息" />
      </div>
    </div>
  );
}

function ReceivingItemsSelector({ purchaseOrderId, purchaseOrderNo, onChange }: {
  purchaseOrderId: string;
  purchaseOrderNo: string;
  onChange: (rows: ReceivingItemRow[]) => void;
}) {
  const [availableItems, setAvailableItems] = useState<PurchaseOrderItem[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!purchaseOrderId) { setAvailableItems([]); return; }
    PurchaseOrderItemRepo.findByPurchaseOrderId(purchaseOrderId).then(items => {
      setAvailableItems(items.filter(i => i.已收货数量 < i.数量));
    });
  }, [purchaseOrderId]);

  const toggleItem = (itemId: string) => {
    const next = { ...selected };
    if (next[itemId]) delete next[itemId]; else next[itemId] = 1;
    setSelected(next);
    const rows: ReceivingItemRow[] = Object.keys(next).map(id => {
      const item = availableItems.find(i => i.id === id)!;
      return {
        采购订单明细id: id,
        产品名称: item.产品名称,
        规格: item.规格,
        单位: item.单位,
        本次收货数量: next[id],
        备注: '',
      };
    });
    onChange(rows);
  };

  const updateQty = (itemId: string, qty: number) => {
    const next = { ...selected, [itemId]: qty };
    setSelected(next);
    const rows: ReceivingItemRow[] = Object.keys(next).map(id => {
      const item = availableItems.find(i => i.id === id)!;
      return {
        采购订单明细id: id,
        产品名称: item.产品名称,
        规格: item.规格,
        单位: item.单位,
        本次收货数量: next[id],
        备注: '',
      };
    });
    onChange(rows);
  };

  if (!purchaseOrderId) {
    return <div className="text-xs text-gray-400 p-4 text-center">请先选择关联的采购订单</div>;
  }

  if (availableItems.length === 0) {
    return <div className="text-xs text-gray-400 p-4 text-center">该采购订单暂无未完成明细</div>;
  }

  return (
    <div className="mt-4 border rounded">
      <div className="px-3 py-2 bg-gray-50 border-b">
        <span className="text-sm font-medium text-gray-700">选择产品（从采购订单 {purchaseOrderNo} 的未完成明细中）</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-2 py-1.5 font-medium w-8">选择</th>
              <th className="px-2 py-1.5 font-medium">产品名称</th>
              <th className="px-2 py-1.5 font-medium">规格</th>
              <th className="px-2 py-1.5 font-medium">单位</th>
              <th className="px-2 py-1.5 font-medium">订单数量</th>
              <th className="px-2 py-1.5 font-medium">已收货</th>
              <th className="px-2 py-1.5 font-medium">可收数量</th>
              <th className="px-2 py-1.5 font-medium">本次收货</th>
            </tr>
          </thead>
          <tbody>
            {availableItems.map(item => {
              const remaining = item.数量 - item.已收货数量;
              const checked = !!selected[item.id];
              return (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-2 py-1 text-center">
                    <input type="checkbox" checked={checked}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 rounded" />
                  </td>
                  <td className="px-2 py-1">{item.产品名称}</td>
                  <td className="px-2 py-1 text-gray-600">{item.规格}</td>
                  <td className="px-2 py-1 text-gray-600">{item.单位}</td>
                  <td className="px-2 py-1">{item.数量}</td>
                  <td className="px-2 py-1 text-gray-500">{item.已收货数量}</td>
                  <td className="px-2 py-1 text-blue-600 font-medium">{remaining}</td>
                  <td className="px-2 py-1">
                    {checked && (
                      <input type="number" min={1} max={remaining} value={selected[item.id]}
                        onChange={e => updateQty(item.id, parseInt(e.target.value) || 1)}
                        className="w-20 border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 focus:outline-none" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormModal({ open, onClose, onSave, initial, purchaseOrders }: {
  open: boolean; onClose: () => void;
  onSave: (item: Partial<ReceivingOrder>, items: ReceivingItemRow[]) => void;
  initial?: Partial<ReceivingOrder>;
  purchaseOrders: PurchaseOrder[];
}) {
  const [form, setForm] = useState<Partial<ReceivingOrder>>({});
  const [items, setItems] = useState<ReceivingItemRow[]>([]);

  useEffect(() => {
    if (open) {
      if (initial?.id) {
        setForm(initial);
        ReceivingOrderItemRepo.findByReceivingOrderId(initial.id).then(ri => {
          setItems(ri.map(i => ({
            采购订单明细id: i.采购订单明细id,
            产品名称: i.产品名称,
            规格: i.规格,
            单位: i.单位,
            本次收货数量: i.本次收货数量,
            备注: i.备注,
          })));
        });
      } else {
        setForm({ 单号: generateReceivingNo(), 状态: '未完成', 制单人: '李紫璘', 创建时间: new Date().toISOString() });
        setItems([]);
      }
    }
  }, [initial, open]);

  if (!open) return null;

  const handleSave = async () => {
    if (!form.采购订单id || !form.收货日期 || !form.收货人) {
      alert('请填写必填项：关联采购订单、收货日期、收货人');
      return;
    }
    if (items.length === 0) {
      alert('请至少选择一项产品');
      return;
    }
    try {
      await onSave(form, items);
      onClose();
    } catch (e: any) { alert('保存失败: ' + (e?.message || '未知错误')); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑收货单' : '新建收货单'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5">
          <ReceivingOrderForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} purchaseOrders={purchaseOrders} />
          <ReceivingItemsSelector
            purchaseOrderId={form.采购订单id || ''}
            purchaseOrderNo={form.采购订单号 || ''}
            onChange={setItems}
          />
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function ReceivingOrdersPage() {
  const [data, setData] = useState<ReceivingOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ReceivingOrder> | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [itemsMap, setItemsMap] = useState<Record<string, ReceivingOrderItem[]>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [orders, pos] = await Promise.all([
        ReceivingOrderRepo.findAll(),
        PurchaseOrderRepo.findAll(),
      ]);
      setData(orders);
      setPurchaseOrders(pos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const loadItems = async (id: string) => {
    if (!itemsMap[id]) {
      const items = await ReceivingOrderItemRepo.findByReceivingOrderId(id);
      setItemsMap(prev => ({ ...prev, [id]: items }));
    }
  };

  const handleRowClick = async (item: ReceivingOrder) => {
    const newId = expandedId === item.id ? null : item.id;
    setExpandedId(newId);
    if (newId) await loadItems(newId);
  };

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    return !q || [item.单号, item.采购订单号, item.收货人, item.收货仓库, item.车牌号, item.备注]
      .some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Partial<ReceivingOrder>, rows: ReceivingItemRow[]) => {
    if (editingItem?.id) {
      await ReceivingOrderRepo.update(editingItem.id, form);
      const existingItems = await ReceivingOrderItemRepo.findByReceivingOrderId(editingItem.id);
      for (const ei of existingItems) await ReceivingOrderItemRepo.delete(ei.id);
      for (const r of rows) {
        await ReceivingOrderItemRepo.create({
          收货单id: editingItem.id,
          收货单号: form.单号!,
          采购订单明细id: r.采购订单明细id,
          采购订单号: form.采购订单号!,
          产品名称: r.产品名称,
          规格: r.规格,
          单位: r.单位,
          本次收货数量: r.本次收货数量,
          备注: r.备注,
        });
      }
    } else {
      const created = await ReceivingOrderRepo.create(form as Omit<ReceivingOrder, 'id'>);
      for (const r of rows) {
        await ReceivingOrderItemRepo.create({
          收货单id: created.id,
          收货单号: created.单号,
          采购订单明细id: r.采购订单明细id,
          采购订单号: created.采购订单号,
          产品名称: r.产品名称,
          规格: r.规格,
          单位: r.单位,
          本次收货数量: r.本次收货数量,
          备注: r.备注,
        });
      }
    }
    await loadData();
    setEditingItem(undefined);
  };

  const handleEdit = (item: ReceivingOrder) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  // 确认完成收货单：更新采购订单明细已收货数量，并重新计算收货状态
  const handleComplete = async (item: ReceivingOrder) => {
    if (!confirm(`确认完成收货单 ${item.单号}？\n这将更新关联采购订单的已收货数量。`)) return;
    const receivingItems = await ReceivingOrderItemRepo.findByReceivingOrderId(item.id);
    const qtyMap: Record<string, number> = {};
    for (const ri of receivingItems) {
      qtyMap[ri.采购订单明细id] = (qtyMap[ri.采购订单明细id] || 0) + (ri.本次收货数量 || 0);
    }
    for (const [itemId, addQty] of Object.entries(qtyMap)) {
      const poItem = await PurchaseOrderItemRepo.findById(itemId);
      if (poItem) {
        await PurchaseOrderItemRepo.update(itemId, {
          已收货数量: (poItem.已收货数量 || 0) + addQty,
        });
      }
    }
    await ReceivingOrderRepo.update(item.id, { 状态: '已完成' });
    if (item.采购订单id) {
      await PurchaseOrderRepo.recomputeAmounts(item.采购订单id);
    }
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该收货单？')) return;
    await ReceivingOrderRepo.delete(id);
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

  const selectColumn = {
    key: 'select',
    label: <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll} className="w-4 h-4 rounded" />,
    render: (item: ReceivingOrder) => <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 rounded" onClick={e => e.stopPropagation()} />,
  };

  const renderExpanded = (item: ReceivingOrder) => {
    const items = itemsMap[item.id] || [];
    return (
      <div className="p-3 bg-gray-50 border-t">
        <div className="text-xs font-medium text-gray-600 mb-2">收货明细</div>
        {items.length === 0 && <div className="text-xs text-gray-400">暂无明细</div>}
        {items.length > 0 && (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 bg-white">
                <th className="px-2 py-1 font-medium">#</th>
                <th className="px-2 py-1 font-medium">产品名称</th>
                <th className="px-2 py-1 font-medium">规格</th>
                <th className="px-2 py-1 font-medium">单位</th>
                <th className="px-2 py-1 font-medium">本次收货数量</th>
                <th className="px-2 py-1 font-medium">备注</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr key={row.id} className="border-t bg-white hover:bg-gray-50">
                  <td className="px-2 py-1 text-gray-400">{idx + 1}</td>
                  <td className="px-2 py-1">{row.产品名称}</td>
                  <td className="px-2 py-1 text-gray-600">{row.规格}</td>
                  <td className="px-2 py-1 text-gray-600">{row.单位}</td>
                  <td className="px-2 py-1 font-mono text-blue-600">{row.本次收货数量}</td>
                  <td className="px-2 py-1 text-gray-500">{row.备注}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {selectedIds.size > 0 && (
        <div className="px-5 py-2 bg-blue-50 border-b flex items-center justify-between">
          <span className="text-sm text-blue-700">已选择 <strong>{selectedIds.size}</strong> 项</span>
          <div className="flex gap-2">
            <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100">取消选择</button>
          </div>
        </div>
      )}
      <PageHeader
        title="收货单"
        searchPlaceholder="搜索 单号 / 采购单号 / 收货人 / 仓库 / 车牌号..."
        onSearch={setSearch}
        actions={[
          { label: '新建收货单', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem({}); setModalOpen(true); } },
          { label: '导出CSV模版', icon: '↓', variant: 'default' as const, onClick: () => exportCsvTemplate(['单号', '关联采购订单号', '供应商名称', '收货日期', '收货地址', '仓库', '备注', '状态'], '收货单') },
        ]}
      />

      <div className="flex-1 overflow-auto bg-white">
        <OrderTable
          columns={[selectColumn, ...columns]}
          data={filtered}
          loading={loading}
          emptyMessage="暂无收货单"
          expandedId={expandedId}
          onRowClick={item => { setSelectedId(selectedId === item.id ? null : item.id); handleRowClick(item); }}
          renderOrderNumber={item => <span className="text-blue-600 font-mono text-xs hover:underline">{item.单号}</span>}
          renderExpanded={renderExpanded}
        />
      </div>

      {selectedId && (() => {
        const item = data.find(d => d.id === selectedId);
        if (!item) return null;
        return (
          <div className="w-80 border-l bg-white flex flex-col flex-shrink-0">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm">收货单详情</h3>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-500">单号</div>
                <div className="text-blue-600 font-mono">{item.单号}</div>
                <div className="text-gray-500">关联采购单</div>
                <div className="font-medium">{item.采购订单号}</div>
                <div className="text-gray-500">收货日期</div>
                <div><DateCell value={item.收货日期} /></div>
                <div className="text-gray-500">收货人</div>
                <div>{item.收货人}</div>
                <div className="text-gray-500">联系电话</div>
                <div>{item.联系电话 || '-'}</div>
                <div className="text-gray-500">收货仓库</div>
                <div>{item.收货仓库 || '-'}</div>
                <div className="text-gray-500">车牌号</div>
                <div>{item.车牌号 || '-'}</div>
                <div className="text-gray-500">制单人</div>
                <div>{item.制单人 || '-'}</div>
                <div className="text-gray-500">状态</div>
                <div><StatusBadge status={item.状态} /></div>
              </div>
              {item.备注 && (
                <div className="border-t pt-3">
                  <div className="text-xs text-gray-500 mb-1">备注</div>
                  <div className="text-xs text-gray-700">{item.备注}</div>
                </div>
              )}
            </div>
            <div className="p-3 border-t flex gap-2">
              {item.状态 !== '已完成' && (
                <button onClick={() => handleComplete(item)} className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700">确认完成</button>
              )}
              <button onClick={() => handleEdit(item)} className="flex-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50">编辑</button>
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
        purchaseOrders={purchaseOrders}
      />
    </div>
  );
}
