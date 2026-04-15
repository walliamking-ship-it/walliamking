'use client';

import { useState, useEffect } from 'react';
import { CrudTable, Column } from '@/components/CrudTable';
import { PurchaseOrder } from '@/lib/types';
import { PurchaseOrderRepo } from '@/lib/repo';

const columns: Column<PurchaseOrder>[] = [
  { key: '单号', label: '单号' },
  { key: '供应商名称', label: '供应商名称' },
  { key: '日期', label: '日期' },
  { key: '合同金额', label: '合同金额' },
  { key: '已收货', label: '已收货' },
  { key: '未付款', label: '未付款' },
  { key: '已付款', label: '已付款' },
  { key: '付款状态', label: '付款状态' },
  { key: '收货状态', label: '收货状态' },
  { key: '制单人', label: '制单人' },
  { key: '业务员', label: '业务员' },
  { key: '收货地址', label: '收货地址' },
  { key: '备注', label: '备注' },
  { key: 'actions', label: '操作' },
];

const exportHeaders = [
  { key: '单号' as keyof PurchaseOrder, label: '单号' },
  { key: '供应商名称' as keyof PurchaseOrder, label: '供应商名称' },
  { key: '日期' as keyof PurchaseOrder, label: '日期' },
  { key: '合同金额' as keyof PurchaseOrder, label: '合同金额' },
  { key: '已收货' as keyof PurchaseOrder, label: '已收货' },
  { key: '未付款' as keyof PurchaseOrder, label: '未付款' },
  { key: '已付款' as keyof PurchaseOrder, label: '已付款' },
  { key: '付款状态' as keyof PurchaseOrder, label: '付款状态' },
  { key: '收货状态' as keyof PurchaseOrder, label: '收货状态' },
  { key: '制单人' as keyof PurchaseOrder, label: '制单人' },
  { key: '业务员' as keyof PurchaseOrder, label: '业务员' },
  { key: '计划付款日期' as keyof PurchaseOrder, label: '计划付款日期' },
  { key: '收货地址' as keyof PurchaseOrder, label: '收货地址' },
  { key: '备注' as keyof PurchaseOrder, label: '备注' },
];

const searchKeys: (keyof PurchaseOrder)[] = ['单号', '供应商名称', '制单人', '业务员', '收货地址', '备注'];

function PurchaseOrderForm({ value, onChange }: { value: Partial<PurchaseOrder>; onChange: (key: keyof PurchaseOrder, v: any) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-600 mb-1">单号 <span className="text-red-500">*</span></label>
        <input type="text" value={value.单号 || ''} onChange={e => onChange('单号', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: CG20260415001" required />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">供应商名称 <span className="text-red-500">*</span></label>
        <input type="text" value={value.供应商名称 || ''} onChange={e => onChange('供应商名称', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="如: S02-捷成印刷" required />
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
        <label className="block text-sm text-gray-600 mb-1">已收货</label>
        <input type="number" value={value.已收货 || ''} onChange={e => onChange('已收货', parseFloat(e.target.value) || 0)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">未付款</label>
        <input type="number" value={value.未付款 || ''} onChange={e => onChange('未付款', parseFloat(e.target.value) || 0)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">已付款</label>
        <input type="number" value={value.已付款 || ''} onChange={e => onChange('已付款', parseFloat(e.target.value) || 0)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">付款状态</label>
        <select value={value.付款状态 || ''} onChange={e => onChange('付款状态', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm">
          <option value="">请选择</option>
          <option value="未付款">未付款</option>
          <option value="部分付款">部分付款</option>
          <option value="全部付款">全部付款</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">收货状态</label>
        <select value={value.收货状态 || ''} onChange={e => onChange('收货状态', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm">
          <option value="">请选择</option>
          <option value="未收货">未收货</option>
          <option value="部分收货">部分收货</option>
          <option value="全部收货">全部收货</option>
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
        <label className="block text-sm text-gray-600 mb-1">计划付款日期</label>
        <input type="date" value={value.计划付款日期 || ''} onChange={e => onChange('计划付款日期', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" />
      </div>
      <div className="col-span-2">
        <label className="block text-sm text-gray-600 mb-1">收货地址</label>
        <input type="text" value={value.收货地址 || ''} onChange={e => onChange('收货地址', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="详细收货地址" />
      </div>
      <div className="col-span-2">
        <label className="block text-sm text-gray-600 mb-1">备注</label>
        <textarea value={value.备注 || ''} onChange={e => onChange('备注', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" rows={3} placeholder="关联的销售单号、物流信息等" />
      </div>
    </>
  );
}

export default function PurchaseOrdersPage() {
  const [data, setData] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    PurchaseOrderRepo.findAll().then(setData);
  }, []);

  const handleAdd = async (item: Omit<PurchaseOrder, 'id'>) => {
    await PurchaseOrderRepo.create(item);
    setData(await PurchaseOrderRepo.findAll());
  };

  const handleEdit = async (id: string, item: Partial<PurchaseOrder>) => {
    await PurchaseOrderRepo.update(id, item);
    setData(await PurchaseOrderRepo.findAll());
  };

  const handleDelete = async (id: string) => {
    await PurchaseOrderRepo.delete(id);
    setData(await PurchaseOrderRepo.findAll());
  };

  return (
    <CrudTable
      title="采购订单"
      columns={columns}
      data={data}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      formFields={PurchaseOrderForm}
      emptyMessage="暂无采购订单数据"
      searchKeys={searchKeys}
      exportHeaders={exportHeaders}
    />
  );
}
