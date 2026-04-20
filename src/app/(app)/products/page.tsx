'use client';

import { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import CsvImportModal from '@/components/CsvImportModal';
import { Product } from '@/lib/types';
import { ProductRepo } from '@/lib/repo';
import { exportCsvTemplate } from '@/lib/csvExport';

const columns: Column<Product>[] = [
  { key: 'code', label: '货号', sortable: true },
  { key: 'name', label: '产品名称', sortable: true },
  { key: 'spec', label: '规格型号' },
  { key: 'unit', label: '单位', sortable: true },
  { key: 'category', label: '分类' },
  { key: 'purchasePrice', label: '进价', sortable: true },
  { key: 'salePrice', label: '售价', sortable: true },
  { key: 'remark', label: '备注' },
];

function ProductForm({ value, onChange, readOnlyCode }: { value: Partial<Product>; onChange: (key: keyof Product, v: any) => void; readOnlyCode?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">货号</label>
        <input type="text" value={value.code || ''} readOnly={readOnlyCode}
          onChange={readOnlyCode ? undefined : e => onChange('code', e.target.value)}
          className={`w-full border rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none ${readOnlyCode ? 'bg-gray-100 border-gray-200 text-gray-600' : 'border-gray-300'}`}
          placeholder="自动生成" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">产品名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="产品名称" required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">规格型号</label>
        <input type="text" value={value.spec || ''} onChange={e => onChange('spec', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="如: 110*36mm" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">单位</label>
        <input type="text" value={value.unit || ''} onChange={e => onChange('unit', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="个/套/吨" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">产品分类</label>
        <input type="text" value={value.category || ''} onChange={e => onChange('category', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="分类" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">客户</label>
        <input type="text" value={value.customer || ''} onChange={e => onChange('customer', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="如: C05-白领仕" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">进价（元）</label>
        <input type="number" step="0.001" value={value.purchasePrice ?? ''} onChange={e => onChange('purchasePrice', Number(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.000" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">售价（元）</label>
        <input type="number" step="0.001" value={value.salePrice ?? ''} onChange={e => onChange('salePrice', Number(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0.000" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-500 mb-0.5">备注</label>
        <textarea value={value.remark || ''} onChange={e => onChange('remark', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" rows={2} placeholder="备注信息" />
      </div>
    </div>
  );
}

function generateProductCode(existing: Product[]): string {
  const codes = existing
    .map(p => p.code)
    .filter(Boolean)
    .filter(code => /^P\d+$/.test(code))
    .map(code => parseInt(code.slice(1), 10));
  const max = codes.length > 0 ? Math.max(...codes) : 0;
  return `P${String(max + 1).padStart(4, '0')}`;
}

function FormModal({ open, onClose, onSave, initial, existingProducts }: {
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<Product>) => void;
  initial?: Partial<Product>;
  existingProducts: Product[];
}) {
  const [form, setForm] = useState<Partial<Product>>(initial || {});

  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      if (initial?.id) {
        setForm(initial);
      } else {
        setForm({ code: generateProductCode(existingProducts), name: '', spec: '', unit: '', category: '', customer: '', purchasePrice: 0, salePrice: 0, remark: '' });
      }
    } else if (open && initial?.id) {
      setForm(initial);
    }
    prevOpenRef.current = open;
  }, [open, initial]);

  if (!open) return null;

  const handleSave = async () => {
    if (!form.name) { alert('请填写产品名称'); return; }
    try {
      await onSave(form);
      onClose();
    } catch (e: any) {
      alert('保存失败: ' + (e?.message || '未知错误'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑产品' : '新建产品'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5">
          <ProductForm value={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} readOnlyCode={!initial?.id} />
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Product> | undefined>();
  const [importModalOpen, setImportModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try { setData(await ProductRepo.findAll()); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    return !q || [item.code, item.name, item.spec, item.unit, item.category, item.customer, item.remark]
      .some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Partial<Product>) => {
    if (editingItem?.id) await ProductRepo.update(editingItem.id, form);
    else await ProductRepo.create(form as Omit<Product, 'id'>);
    await loadData();
    setEditingItem(undefined);
  };

  const handleCsvImport = async (rows: Record<string, string>[]) => {
    for (const row of rows) {
      const code = row['货号'] || row['code'] || '';
      const name = row['产品名称'] || row['名称'] || row['name'] || '';
      if (!name) continue;
      const existing = data.find(p => p.code === code);
      const fields = {
        code, name,
        spec: row['规格型号'] || row['spec'] || '',
        unit: row['单位'] || row['unit'] || '个',
        category: row['分类'] || row['category'] || '',
        customer: row['客户'] || row['customer'] || '',
        purchasePrice: parseFloat(row['进价'] || row['purchasePrice'] || '0') || 0,
        salePrice: parseFloat(row['售价'] || row['salePrice'] || '0') || 0,
        remark: row['备注'] || row['remark'] || '',
      };
      if (existing) { await ProductRepo.update(existing.id, fields); }
      else { await ProductRepo.create(fields as Omit<Product, 'id'>); }
    }
    await loadData();
  };

  const handleEdit = (item: Product) => { setEditingItem(item); setModalOpen(true); };
  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该产品？')) return;
    await ProductRepo.delete(id);
    await loadData();
  };

  const tableColumns: Column<Product>[] = [
    ...columns,
    {
      key: 'actions', label: '操作',
      render: (item) => (
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
            className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">编辑</button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
            className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="产品管理"
        searchPlaceholder="搜索 货号 / 名称 / 规格 / 分类 / 客户 / 备注..."
        onSearch={setSearch}
        actions={[
          { label: '新建产品', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem({}); setModalOpen(true); } },
          { label: '导入CSV', icon: '↓', variant: 'default' as const, onClick: () => setImportModalOpen(true) },
          { label: '导出CSV模版', icon: '↓', variant: 'default' as const, onClick: () => exportCsvTemplate(['货号', '产品名称', '规格型号', '单位', '分类', '客户', '进价', '售价', '备注'], '产品') },
          { label: '导出CSV', icon: '↑', variant: 'default' as const, onClick: () => {
            const csv = ['货号,产品名称,规格型号,单位,分类,客户,进价,售价,备注',
              ...filtered.map(p => `${p.code},${p.name},${p.spec},${p.unit},${p.category},${p.customer},${p.purchasePrice},${p.salePrice},${p.remark}`)].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `产品列表_${new Date().toISOString().slice(0,10)}.csv`; a.click();
            URL.revokeObjectURL(url);
          }
 },
        ]}
      />

      <div className="flex-1 overflow-auto bg-white">
        <OrderTable
          columns={tableColumns}
          data={filtered}
          loading={loading}
          emptyMessage="暂无产品数据"
          onRowClick={handleEdit}
          renderOrderNumber={item => <span className="text-blue-600 font-mono text-xs hover:underline">{item.code}</span>}
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(undefined); }}
        onSave={handleSave}
        initial={editingItem}
        existingProducts={data}
      />
      <CsvImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleCsvImport}
        headers={['货号', '产品名称', '规格型号', '单位', '分类', '客户', '进价', '售价', '备注']}
        fields={['code', 'name', 'spec', 'unit', 'category', 'customer', 'purchasePrice', 'salePrice', 'remark']} />
    </div>
  );
}
