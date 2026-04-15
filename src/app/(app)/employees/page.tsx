'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';

interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: '正常' | '停用';
}

const mockEmployees: Employee[] = [
  { id: '1', name: '金湛', role: '管理员', phone: '13900000001', email: 'jinzhan@shanghai-shenji.com', status: '正常' },
  { id: '2', name: '李紫璘', role: '业务员', phone: '13900000002', email: 'lizilin@shanghai-shenji.com', status: '正常' },
  { id: '3', name: '王明', role: '采购员', phone: '13900000003', email: 'wangming@shanghai-shenji.com', status: '正常' },
  { id: '4', name: '张会计', role: '财务', phone: '13900000004', email: 'zhangkuaiji@shanghai-shenji.com', status: '正常' },
  { id: '5', name: '仓管小李', role: '仓管', phone: '13900000005', email: 'cangguan@shanghai-shenji.com', status: '正常' },
];

export default function EmployeesPage() {
  const [data] = useState<Employee[]>(mockEmployees);
  const [search, setSearch] = useState('');

  const filtered = data.filter(e => {
    const q = search.toLowerCase();
    return !q || [e.name, e.role, e.phone, e.email].some(v => v?.toLowerCase().includes(q));
  });

  const tableColumns: Column<Employee>[] = [
    { key: 'name', label: '姓名', sortable: true },
    { key: 'role', label: '角色', sortable: true },
    { key: 'phone', label: '电话' },
    { key: 'email', label: '邮箱' },
    { key: 'status', label: '状态', sortable: true, render: (e: Employee) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${e.status === '正常' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {e.status}
      </span>
    )},
    { key: 'actions', label: '操作', render: () => (
      <div className="flex gap-1">
        <button className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">编辑</button>
      </div>
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="员工管理"
        subtitle="企业内部员工账号管理"
        searchPlaceholder="搜索 姓名 / 角色 / 电话 / 邮箱..."
        onSearch={setSearch}
        actions={[
          { label: '新建员工', icon: '＋', variant: 'primary' as const, onClick: () => alert('员工管理功能开发中，开通权限后自动同步飞书通讯录') },
        ]}
      />
      <div className="flex-1 overflow-auto bg-white px-5 py-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-xs text-yellow-700">
          💡 员工账号与飞书通讯录打通，新建员工将自动同步到飞书。权限管理功能正在开发中。
        </div>
        <OrderTable
          columns={tableColumns}
          data={filtered}
          loading={false}
          emptyMessage="暂无员工数据"
        />
      </div>
    </div>
  );
}
