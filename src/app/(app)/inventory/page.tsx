'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import { Inventory } from '@/lib/types';
import { InventoryRepo } from '@/lib/repo';
import { exportCsvTemplate } from '@/lib/csvExport';

const columns: Column<Inventory>[] = [
  { key: '产品名称', label: '产品名称', sortable: true },
  { key: '货号', label: '货号', sortable: true },
  { key: '分类', label: '分类', sortable: true },
  { key: '单位', label: '单位' },
  { key: '当前库存', label: '当前库存', sortable: true },
  { key: '安全库存', label: '安全库存', sortable: true },
  { key: '采购在途', label: '采购在途' },
  { key: '销售在途', label: '销售在途' },
  { key: '备注', label: '备注' },
];

function InventoryForm({ value, onChange }: { value: Partial<Inventory>; onChange: (key: keyof Inventory, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">产品名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.产品名称 || ''} onChange={e => onChange('产品名称', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="产品名称" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">货号</label>
        <input type="text" value={value.货号 || ''} onChange={e => onChange('货号', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="货号" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">分类</label>
        <select value={value.分类 || ''} onChange={e => onChange('分类', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="">请选择</option>
          <option value="原材料">原材料</option>
          <option value="成品">成品</option>
          <option value="半成品">半成品</option>
          <option value="辅料">辅料</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">单位</label>
        <input type="text" value={value.单位 || ''} onChange={e => onChange('单位', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="个/套/吨" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">当前库存</label>
        <input type="number" value={value.当前库存 ?? ''} onChange={e => onChange('当前库存', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">安全库存</label>
        <input type="number" value={value.安全库存 ?? ''} onChange={e => onChange('安全库存', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">采购在途</label>
        <input type="number" value={value.采购在途 ?? ''} onChange={e => onChange('采购在途', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">销售在途</label>
        <input type="number" value={value.销售在途 ?? ''} onChange={e => onChange('销售在途', parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">备注</label>
        <textarea value={value.备注 || ''} onChange={e => onChange('备注', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} placeholder="备注信息" />
      </div>
    </div>
  );
}

function FormModal({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (item: Partial<Inventory>) => void; initial?: Partial<Inventory>; }) {
  const [form, setForm] = useState<Partial<Inventory>>(initial || {});
  useEffect(() => { setForm(initial || {}); }, [initial, open]);
  if (!open) return null;

  const handleSave = async () => {
    if (!form.产品名称) { alert('请填写产品名称'); return; }
    try {
      await onSave(form);
      onClose();
    } catch (e: any) { alert('保存失败: ' + (e?.message || '未知错误')); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑库存' : '新建库存'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5"><InventoryForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} /></div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [data, setData] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Inventory> | undefined>();
  const [filterTab, setFilterTab] = useState<'all' | 'alert' | 'normal'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  const loadData = async () => { setLoading(true); try { setData(await InventoryRepo.findAll()); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || [item.产品名称, item.货号, item.分类, item.单位, item.备注].some(v => v?.toLowerCase().includes(q));
    const below = (item.当前库存 || 0) < (item.安全库存 || 0);
    const matchFilter = filterTab === 'all' || (filterTab === 'alert' && below) || (filterTab === 'normal' && !below);
    return matchSearch && matchFilter;
  });

  const handleSave = async (form: Partial<Inventory>) => {
    if (editingItem?.id) await InventoryRepo.update(editingItem.id, form);
    else await InventoryRepo.create(form as Omit<Inventory, 'id'>);
    await loadData();
    setEditingItem(undefined);
  };

  const handleEdit = (item: Inventory) => { setEditingItem(item); setModalOpen(true); };
  
  const handleDelete = async (id: string) => { 
    if (!confirm('确定删除该库存记录？')) return; 
    await InventoryRepo.delete(id); 
    await loadData(); 
  };

  // 批量选择
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(i => i.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    setShowBatchConfirm(true);
  };

  const confirmBatchDelete = async () => {
    for (const id of selectedIds) {
      await InventoryRepo.delete(id);
    }
    setSelectedIds(new Set());
    setShowBatchConfirm(false);
    await loadData();
  };

  // Stats
  const totalItems = data.length;
  const alertItems = data.filter(i => (i.当前库存 || 0) < (i.安全库存 || 0)).length;
  const normalItems = totalItems - alertItems;
  const lowItems = data.filter(i => (i.当前库存 || 0) < (i.安全库存 || 0) * 0.5).length;

  const stockColumn = columns.find(c => c.key === '当前库存');
  const alertColumns: Column<Inventory>[] = columns.map(col => {
    if (col.key === '当前库存') {
      return {
        ...col,
        render: (item: Inventory) => {
          const current = item.当前库存 || 0;
          const safe = item.安全库存 || 0;
          const below = current < safe;
          const critical = safe > 0 && current < safe * 0.5;
          return (
            <div className="flex items-center gap-1">
              {below && <span className="text-red-500 text-xs" title="低于安全库存">⚠️</span>}
              <span className={below ? (critical ? 'text-red-600 font-bold' : 'text-orange-500 font-semibold') : 'text-gray-800'}>
                {current?.toLocaleString()}
              </span>
            </div>
          );
        },
      };
    }
    return col;
  });

  // 添加选择列
  const selectColumn: Column<Inventory> = {
    key: 'select',
    label: (
      <input 
        type="checkbox" 
        checked={filtered.length > 0 && selectedIds.size === filtered.length}
        onChange={toggleSelectAll}
        className="w-4 h-4 rounded"
      />
    ),
    render: (item: Inventory) => (
      <input 
        type="checkbox" 
        checked={selectedIds.has(item.id)}
        onChange={() => toggleSelect(item.id)}
        className="w-4 h-4 rounded"
        onClick={e => e.stopPropagation()}
      />
    ),
  };

  const tableColumns: Column<Inventory>[] = [
    selectColumn,
    ...alertColumns,
    { key: 'actions', label: '操作', render: (item) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">编辑</button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
      </div>
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 预警统计卡片 */}
      <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-white border-b">
        <div className={`p-3 rounded-lg border ${alertItems > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="text-xs text-gray-500">库存预警</div>
          <div className={`text-xl font-bold mt-1 ${alertItems > 0 ? 'text-red-600' : 'text-gray-400'}`}>{alertItems}</div>
          {alertItems > 0 && <div className="text-xs text-red-500 mt-0.5">低于安全库存</div>}
        </div>
        <div className="p-3 rounded-lg border bg-orange-50 border-orange-200">
          <div className="text-xs text-gray-500">严重不足</div>
          <div className={`text-xl font-bold mt-1 ${lowItems > 0 ? 'text-orange-600' : 'text-gray-400'}`}>{lowItems}</div>
          {lowItems > 0 && <div className="text-xs text-orange-500 mt-0.5">低于安全库存50%</div>}
        </div>
        <div className="p-3 rounded-lg border bg-green-50 border-green-200">
          <div className="text-xs text-gray-500">库存正常</div>
          <div className="text-xl font-bold text-green-600 mt-1">{normalItems}</div>
        </div>
        <div className="p-3 rounded-lg border bg-gray-50 border-gray-200">
          <div className="text-xs text-gray-500">库存总计</div>
          <div className="text-xl font-bold text-gray-800 mt-1">{totalItems}</div>
        </div>
      </div>

      {/* 批量操作栏 */}
      {selectedIds.size > 0 && (
        <div className="px-5 py-2 bg-blue-50 border-b flex items-center justify-between">
          <span className="text-sm text-blue-700">已选择 <strong>{selectedIds.size}</strong> 项</span>
          <div className="flex gap-2">
            <button 
              onClick={() => { setSelectedIds(new Set()); }}
              className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
            >
              取消选择
            </button>
            <button 
              onClick={handleBatchDelete}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              批量删除 ({selectedIds.size})
            </button>
          </div>
        </div>
      )}

      <PageHeader title="库存管理" searchPlaceholder="搜索 产品名称 / 货号 / 分类 / 备注..." onSearch={setSearch}
        actions={[
          { label: '新建库存', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem({}); setModalOpen(true); } },
          { label: '导出CSV模版', icon: '↓', variant: 'default' as const, onClick: () => exportCsvTemplate(['仓库', '名称', '规格', '单位', '库存数量', '在途数量', '安全库存', '成本价', '备注'], '库存') },
        ]}
        tabs={[
          { label: `全部 (${totalItems})`, active: filterTab === 'all', onClick: () => setFilterTab('all') },
          { label: `⚠️ 预警 (${alertItems})`, active: filterTab === 'alert', onClick: () => setFilterTab('alert'), className: alertItems > 0 ? 'text-red-600' : '' },
          { label: `正常 (${normalItems})`, active: filterTab === 'normal', onClick: () => setFilterTab('normal') },
        ]} />
      <div className="flex-1 overflow-auto bg-white">
        <OrderTable columns={tableColumns} data={filtered} loading={loading} emptyMessage="暂无库存数据"
          onRowClick={item => handleEdit(item)}
          renderOrderNumber={item => <span className="text-blue-600 font-mono text-xs hover:underline">{item.货号}</span>} />
      </div>
      <FormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(undefined); }} onSave={handleSave} initial={editingItem} />

      {/* 批量删除确认 */}
      {showBatchConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">确认批量删除</h3>
            <p className="text-gray-600 mb-6">
              确定要删除选中的 <strong>{selectedIds.size}</strong> 项库存记录吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowBatchConfirm(false)}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
              >
                取消
              </button>
              <button 
                onClick={confirmBatchDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
