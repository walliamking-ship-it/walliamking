'use client';

import PageHeader from '@/components/PageHeader';

export default function EmployeesPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="员工管理" subtitle="员工账号与权限配置" />

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-3">👤</div>
          <div className="font-medium text-gray-800">员工管理</div>
          <div className="text-sm text-gray-500 mt-1">多用户权限系统开发中</div>
          <div className="mt-4 text-xs text-gray-400">
            当前版本为单人使用模式，无需登录。<br />
            完整权限系统（员工账号/角色/权限）正在开发中。
          </div>
        </div>
      </div>
    </div>
  );
}
