'use client';

import { useState, useEffect } from 'react';
import { CrudTable, Column } from '@/components/CrudTable';
import { Vendor } from '@/lib/types';
import { VendorRepo } from '@/lib/repo';

const columns: Column<Vendor>[] = [
  { key: 'code', label: '供应商编号' },
  { key: 'name', label: '供应商名称' },
  { key: 'contact', label: '联系人' },
  { key: 'phone', label: '电话' },
  { key: 'address', label: '地址' },
  { key: 'remark', label: '备注' },
  { key: 'actions', label: '操作' },
];

function VendorForm({ value, onChange }: { value: Partial<Vendor>; onChange: (key: keyof Vendor, v: any) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-600 mb-1">供应商编号</label>
        <input type="text" value={value.code || ''} onChange={e => onChange('code', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: V001" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">供应商名称</label>
        <input type="text" value={value.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 金霸王纸张" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">联系人</label>
        <input type="text" value={value.contact || ''} onChange={e => onChange('contact', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 黄老板" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">电话</label>
        <input type="text" value={value.phone || ''} onChange={e => onChange('phone', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 13888138001" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">地址</label>
        <input type="text" value={value.address || ''} onChange={e => onChange('address', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 广东东莞" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">备注</label>
        <input type="text" value={value.remark || ''} onChange={e => onChange('remark', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="可选" />
      </div>
    </>
  );
}

export default function VendorsPage() {
  const [data, setData] = useState<Vendor[]>([]);

  useEffect(() => {
    VendorRepo.findAll().then(setData);
  }, []);

  const handleAdd = async (item: Omit<Vendor, 'id'>) => {
    await VendorRepo.create(item);
    setData(await VendorRepo.findAll());
  };
  const handleEdit = async (id: string, item: Partial<Vendor>) => {
    await VendorRepo.update(id, item);
    setData(await VendorRepo.findAll());
  };
  const handleDelete = async (id: string) => {
    if (confirm('确认删除？')) {
      await VendorRepo.delete(id);
      setData(await VendorRepo.findAll());
    }
  };

  return (
    <CrudTable title="供应商管理" columns={columns} data={data}
      onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}
      formFields={VendorForm} emptyMessage="暂无供应商数据" />
  );
}
