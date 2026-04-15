'use client';

import PageHeader from '@/components/PageHeader';

export default function LogsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="业务日志" subtitle="操作记录与审计追踪" />

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-3">📝</div>
          <div className="font-medium text-gray-800">业务日志</div>
          <div className="text-sm text-gray-500 mt-1">操作审计功能开发中</div>
          <div className="mt-4 text-xs text-gray-400">
            记录所有增删改查操作，支持追溯与审计。<br />
            完整日志系统正在开发中。
          </div>
        </div>
      </div>
    </div>
  );
}
