'use client';

import { useState, useEffect } from 'react';
import { CrudTable, Column } from '@/components/CrudTable';
import { Process } from '@/lib/types';
import { ProcessRepo } from '@/lib/repo';

const columns: Column<Process>[] = [
  { key: 'name', label: '工艺名称' },
  {
    key: 'unitPrice', label: '单价(元)',
    render: (p) => `¥${p.unitPrice.toFixed(2)}`
  },
  {
    key: 'outsource', label: '是否委外',
    render: (p) => p.outsource ? '是' : '否'
  },
  { key: 'remark', label: '备注' },
  { key: 'actions', label: '操作' },
];

function ProcessForm({ value, onChange }: { value: Partial<Process>; onChange: (key: keyof Process, v: any) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-600 mb-1">工艺名称</label>
        <input type="text" value={value.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 烫金" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">单价 (元)</label>
        <input type="number" step="0.01" value={value.unitPrice || ''} onChange={e => onChange('unitPrice', Number(e.target.value))}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 0.15" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">是否委外</label>
        <select value={value.outsource ? 'true' : 'false'} onChange={e => onChange('outsource', e.target.value === 'true')}
          className="w-full border rounded px-3 py-2 text-sm">
          <option value="false">否</option>
          <option value="true">是</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">备注</label>
        <input type="text" value={value.remark || ''} onChange={e => onChange('remark', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" />
      </div>
    </>
  );
}

export default function ProcessesPage() {
  const [data, setData] = useState<Process[]>([]);

  useEffect(() => {
    ProcessRepo.findAll().then(setData);
  }, []);

  const handleAdd = async (item: Omit<Process, 'id'>) => {
    await ProcessRepo.create(item);
    setData(await ProcessRepo.findAll());
  };
  const handleEdit = async (id: string, item: Partial<Process>) => {
    await ProcessRepo.update(id, item);
    setData(await ProcessRepo.findAll());
  };
  const handleDelete = async (id: string) => {
    if (confirm('确认删除？')) {
      await ProcessRepo.delete(id);
      setData(await ProcessRepo.findAll());
    }
  };

  return (
    <CrudTable title="工艺管理" columns={columns} data={data}
      onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}
      formFields={ProcessForm} emptyMessage="暂无工艺数据" />
  );
}
