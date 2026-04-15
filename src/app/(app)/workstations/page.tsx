'use client';

import { useState, useEffect } from 'react';
import { CrudTable, Column } from '@/components/CrudTable';
import { Workstation } from '@/lib/types';
import { WorkstationRepo } from '@/lib/repo';

const columns: Column<Workstation>[] = [
  { key: 'sequence', label: '顺序' },
  { key: 'name', label: '工序名称' },
  {
    key: 'outsource', label: '是否委外',
    render: (w) => w.outsource ? '是' : '否'
  },
  { key: 'remark', label: '备注' },
  { key: 'actions', label: '操作' },
];

function WorkstationForm({ value, onChange }: { value: Partial<Workstation>; onChange: (key: keyof Workstation, v: any) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-600 mb-1">工序名称</label>
        <input type="text" value={value.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 裁切" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">顺序</label>
        <input type="number" value={value.sequence || ''} onChange={e => onChange('sequence', Number(e.target.value))}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 3" />
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

export default function WorkstationsPage() {
  const [data, setData] = useState<Workstation[]>([]);

  useEffect(() => {
    WorkstationRepo.findAll().then(setData);
  }, []);

  const handleAdd = async (item: Omit<Workstation, 'id'>) => {
    await WorkstationRepo.create(item);
    setData(await WorkstationRepo.findAll());
  };
  const handleEdit = async (id: string, item: Partial<Workstation>) => {
    await WorkstationRepo.update(id, item);
    setData(await WorkstationRepo.findAll());
  };
  const handleDelete = async (id: string) => {
    if (confirm('确认删除？')) {
      await WorkstationRepo.delete(id);
      setData(await WorkstationRepo.findAll());
    }
  };

  return (
    <CrudTable title="工序管理" columns={columns} data={data}
      onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}
      formFields={WorkstationForm} emptyMessage="暂无工序数据" />
  );
}
