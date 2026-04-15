'use client';

import { useState, useEffect } from 'react';
import { CrudTable, Column } from '@/components/CrudTable';
import { Customer } from '@/lib/types';
import { CustomerRepo } from '@/lib/repo';

const columns: Column<Customer>[] = [
  { key: 'code', label: '客户编号' },
  { key: 'name', label: '客户名称' },
  { key: 'contact', label: '联系人' },
  { key: 'phone', label: '电话' },
  { key: 'address', label: '地址' },
  { key: 'remark', label: '备注' },
  { key: 'actions', label: '操作' },
];

const exportHeaders = [
  { key: 'code' as keyof Customer, label: '客户编号' },
  { key: 'name' as keyof Customer, label: '客户名称' },
  { key: 'contact' as keyof Customer, label: '联系人' },
  { key: 'phone' as keyof Customer, label: '电话' },
  { key: 'address' as keyof Customer, label: '地址' },
  { key: 'remark' as keyof Customer, label: '备注' },
];

const searchKeys: (keyof Customer)[] = ['code', 'name', 'contact', 'phone', 'address', 'remark'];

function CustomerForm({ value, onChange }: { value: Partial<Customer>; onChange: (key: keyof Customer, v: any) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-600 mb-1">客户编号 <span className="text-red-500">*</span></label>
        <input type="text" value={value.code || ''} onChange={e => onChange('code', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: C001" required />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">客户名称</label>
        <input type="text" value={value.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 李宁体育" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">联系人</label>
        <input type="text" value={value.contact || ''} onChange={e => onChange('contact', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 张经理" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">电话</label>
        <input type="text" value={value.phone || ''} onChange={e => onChange('phone', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 13800138001" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">地址</label>
        <input type="text" value={value.address || ''} onChange={e => onChange('address', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 北京朝阳区" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">备注</label>
        <input type="text" value={value.remark || ''} onChange={e => onChange('remark', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" />
      </div>
    </>
  );
}

export default function CustomersPage() {
  const [data, setData] = useState<Customer[]>([]);

  useEffect(() => {
    CustomerRepo.findAll().then(setData);
  }, []);

  const handleAdd = async (item: Omit<Customer, 'id'>) => {
    await CustomerRepo.create(item);
    setData(await CustomerRepo.findAll());
  };

  const handleEdit = async (id: string, item: Partial<Customer>) => {
    await CustomerRepo.update(id, item);
    setData(await CustomerRepo.findAll());
  };

  const handleDelete = async (id: string) => {
    await CustomerRepo.delete(id);
    setData(await CustomerRepo.findAll());
  };

  return (
    <CrudTable
      title="客户管理"
      columns={columns}
      data={data}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      formFields={CustomerForm}
      emptyMessage="暂无客户数据"
      searchKeys={searchKeys}
      exportHeaders={exportHeaders}
    />
  );
}
