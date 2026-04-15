'use client';

import { useState, useEffect } from 'react';
import { CrudTable, Column } from '@/components/CrudTable';
import { SalesOrder } from '@/lib/types';
import { SalesOrderRepo } from '@/lib/repo';

const columns: Column<SalesOrder>[] = [
  { key: '单号', label: '单号' },
  { key: '客户名称', label: '客户名称' },
  { key: '日期', label: '日期' },
  { key: '合同金额', label: '合同金额' },
  { key: '已送货', label: '已送货' },
  { key: '未收款项', label: '未收款项' },
  { key: '已收款', label: '已收款' },
  { key: '收款状态', label: '收款状态' },
  { key: '送货状态', label: '送货状态' },
  { key: '制单人', label: '制单人' },
  { key: '业务员', label: '业务员' },
  { key: '备注', label: '备注' },
  { key: 'actions', label: '操作' },
];

const exportHeaders = [
  { key: '单号' as keyof SalesOrder, label: '单号' },
  { key: '客户名称' as keyof SalesOrder, label: '客户名称' },
  { key: '日期' as keyof SalesOrder, label: '日期' },
  { key: '合同金额' as keyof SalesOrder, label: '合同金额' },
  { key: '已送货' as keyof SalesOrder, label: '已送货' },
  { key: '未收款项' as keyof SalesOrder, label: '未收款项' },
  { key: '已收款' as keyof SalesOrder, label: '已收款' },
  { key: '收款状态' as keyof SalesOrder, label: '收款状态' },
  { key: '送货状态' as keyof SalesOrder, label: '送货状态' },
  { key: '制单人' as keyof SalesOrder, label: '制单人' },
  { key: '业务员' as keyof SalesOrder, label: '业务员' },
  { key: '计划收款日期' as keyof SalesOrder, label: '计划收款日期' },
  { key: '备注' as keyof SalesOrder, label: '备注' },
];

const searchKeys: (keyof SalesOrder)[] = ['单号', '客户名称', '制单人', '业务员', '备注'];

function SalesOrderForm({ value, onChange }: { value: Partial<SalesOrder>; onChange: (key: keyof SalesOrder, v: any) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-600 mb-1">单号 <span className="text-red-500">*</span></label>
        <input type="text" value={value.单号 || ''} onChange={e => onChange('单号', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: XS20260415001" required />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">客户名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.客户名称 || ''} onChange={e => onChange('客户名称', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: C01-天一纺织" required />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">日期</label>
        <input type="date" value={value.日期 || ''} onChange={e => onChange('日期', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">合同金额</label>
        <input type="number" value={value.合同金额 || ''} onChange={e => onChange('合同金额', parseFloat(e.target.value) || 0)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">已送货</label>
        <input type="number" value={value.已送货 || ''} onChange={e => onChange('已送货', parseFloat(e.target.value) || 0)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">未收款项</label>
        <input type="number" value={value.未收款项 || ''} onChange={e => onChange('未收款项', parseFloat(e.target.value) || 0)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">已收款</label>
        <input type="number" value={value.已收款 || ''} onChange={e => onChange('已收款', parseFloat(e.target.value) || 0)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">收款状态</label>
        <select value={value.收款状态 || ''} onChange={e => onChange('收款状态', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm">
          <option value="">请选择</option>
          <option value="未收款">未收款</option>
          <option value="部分收款">部分收款</option>
          <option value="全部收款">全部收款</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">送货状态</label>
        <select value={value.送货状态 || ''} onChange={e => onChange('送货状态', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm">
          <option value="">请选择</option>
          <option value="未送货">未送货</option>
          <option value="部分送货">部分送货</option>
          <option value="全部送货">全部送货</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">制单人</label>
        <input type="text" value={value.制单人 || ''} onChange={e => onChange('制单人', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="制单人姓名" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">业务员</label>
        <input type="text" value={value.业务员 || ''} onChange={e => onChange('业务员', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="业务员姓名" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">计划收款日期</label>
        <input type="date" value={value.计划收款日期 || ''} onChange={e => onChange('计划收款日期', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" />
      </div>
      <div className="col-span-2">
        <label className="block text-sm text-gray-600 mb-1">备注</label>
        <textarea value={value.备注 || ''} onChange={e => onChange('备注', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" rows={3} placeholder="送货单号、物流信息等" />
      </div>
    </>
  );
}

export default function SalesOrdersPage() {
  const [data, setData] = useState<SalesOrder[]>([]);

  useEffect(() => {
    SalesOrderRepo.findAll().then(setData);
  }, []);

  const handleAdd = async (item: Omit<SalesOrder, 'id'>) => {
    await SalesOrderRepo.create(item);
    setData(await SalesOrderRepo.findAll());
  };

  const handleEdit = async (id: string, item: Partial<SalesOrder>) => {
    await SalesOrderRepo.update(id, item);
    setData(await SalesOrderRepo.findAll());
  };

  const handleDelete = async (id: string) => {
    await SalesOrderRepo.delete(id);
    setData(await SalesOrderRepo.findAll());
  };

  return (
    <CrudTable
      title="销售订单"
      columns={columns}
      data={data}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      formFields={SalesOrderForm}
      emptyMessage="暂无销售订单数据"
      searchKeys={searchKeys}
      exportHeaders={exportHeaders}
    />
  );
}
