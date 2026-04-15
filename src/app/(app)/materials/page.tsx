'use client';

import { useState, useEffect } from 'react';
import { CrudTable, Column } from '@/components/CrudTable';
import { Material } from '@/lib/types';
import { MaterialRepo } from '@/lib/repo';

const CATEGORIES = ['纸张', '油墨', '覆膜材料', '辅料', '其他'] as const;

const columns: Column<Material>[] = [
  { key: 'code', label: '物料编号' },
  { key: 'name', label: '物料名称' },
  { key: 'spec', label: '规格' },
  { key: 'unit', label: '单位' },
  { key: 'category', label: '分类' },
  { key: 'remark', label: '备注' },
  { key: 'actions', label: '操作' },
];

function MaterialForm({ value, onChange }: { value: Partial<Material>; onChange: (key: keyof Material, v: any) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-600 mb-1">物料编号</label>
        <input type="text" value={value.code || ''} onChange={e => onChange('code', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: M001" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">物料名称</label>
        <input type="text" value={value.name || ''} onChange={e => onChange('name', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 双铜纸" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">规格</label>
        <input type="text" value={value.spec || ''} onChange={e => onChange('spec', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 128g" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">单位</label>
        <input type="text" value={value.unit || ''} onChange={e => onChange('unit', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: 张、公斤、米" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">分类</label>
        <select value={value.category || ''} onChange={e => onChange('category', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm">
          <option value="">请选择</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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

export default function MaterialsPage() {
  const [data, setData] = useState<Material[]>([]);

  useEffect(() => {
    MaterialRepo.findAll().then(setData);
  }, []);

  const handleAdd = async (item: Omit<Material, 'id'>) => {
    await MaterialRepo.create(item);
    setData(await MaterialRepo.findAll());
  };
  const handleEdit = async (id: string, item: Partial<Material>) => {
    await MaterialRepo.update(id, item);
    setData(await MaterialRepo.findAll());
  };
  const handleDelete = async (id: string) => {
    if (confirm('确认删除？')) {
      await MaterialRepo.delete(id);
      setData(await MaterialRepo.findAll());
    }
  };

  return (
    <CrudTable title="物料管理" columns={columns} data={data}
      onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}
      formFields={MaterialForm} emptyMessage="暂无物料数据" />
  );
}
