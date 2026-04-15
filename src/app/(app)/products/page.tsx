'use client';

import { useState, useEffect } from 'react';
import { CrudTable, Column } from '@/components/CrudTable';
import { Product } from '@/lib/types';
import { ProductRepo } from '@/lib/repo';

const columns: Column<Product>[] = [
  { key: 'code', label: '产品编号' },
  { key: 'name', label: '产品名称' },
  { key: 'spec', label: '规格' },
  { key: 'customer', label: '客户' },
  { key: 'sheetSize', label: '纸张开数' },
  { key: 'remark', label: '备注' },
  { key: 'actions', label: '操作' },
];

function ProductForm({ value, onChange }: { value: Partial<Product>; onChange: (key: keyof Product, v: any) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-600 mb-1">产品编号</label>
        <input type="text" value={value.code || ''} onChange={e => onChange('code', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: P001" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">产品名称</label>
        <input type="text" value={value.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 运动鞋吊牌" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">规格</label>
        <input type="text" value={value.spec || ''} onChange={e => onChange('spec', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 10*15cm" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">客户</label>
        <input type="text" value={value.customer || ''} onChange={e => onChange('customer', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 李宁体育" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">纸张开数</label>
        <input type="number" value={value.sheetSize || ''} onChange={e => onChange('sheetSize', Number(e.target.value))}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 16" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">备注</label>
        <input type="text" value={value.remark || ''} onChange={e => onChange('remark', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" />
      </div>
    </>
  );
}

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);

  useEffect(() => {
    ProductRepo.findAll().then(setData);
  }, []);

  const handleAdd = async (item: Omit<Product, 'id'>) => {
    await ProductRepo.create(item);
    setData(await ProductRepo.findAll());
  };
  const handleEdit = async (id: string, item: Partial<Product>) => {
    await ProductRepo.update(id, item);
    setData(await ProductRepo.findAll());
  };
  const handleDelete = async (id: string) => {
    if (confirm('确认删除？')) {
      await ProductRepo.delete(id);
      setData(await ProductRepo.findAll());
    }
  };

  return (
    <CrudTable title="产品管理" columns={columns} data={data}
      onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}
      formFields={ProductForm} emptyMessage="暂无产品数据" />
  );
}
