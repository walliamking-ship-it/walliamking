'use client';

import PageHeader from '@/components/PageHeader';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="商户设置" subtitle="系统配置与个性化设置" />

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
          {[
            { label: '商户信息', desc: '公司名称、地址、联系方式' },
            { label: '打印设置', desc: '单据格式、打印模板' },
            { label: '价格设置', desc: '默认售价、进价策略' },
            { label: '仓库设置', desc: '仓库管理、库存预警' },
            { label: '权限管理', desc: '员工账号、角色权限（开发中）' },
            { label: '数据备份', desc: '数据导出与备份' },
          ].map(item => (
            <div key={item.label} className="px-5 py-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800 text-sm">{item.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
              <span className="text-gray-300 text-sm">›</span>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="font-medium text-orange-800 text-sm">🔧 功能开发中</div>
          <div className="text-xs text-orange-700 mt-1">
            完整的商户设置功能正在开发，基础配置已可用。
          </div>
        </div>
      </div>
    </div>
  );
}
