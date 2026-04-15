'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';

const settingsGroups = [
  {
    title: '基本信息',
    items: [
      { label: '企业名称', value: '上海申竭诚包装科技有限公司', type: 'text' },
      { label: '联系人', value: '金湛', type: 'text' },
      { label: '联系电话', value: '13900000001', type: 'tel' },
      { label: '地址', value: '上海市青浦区', type: 'text' },
    ],
  },
  {
    title: '系统设置',
    items: [
      { label: '数据存储模式', value: '模拟数据模式 (USE_MOCK_DATA=true)', type: 'info' },
      { label: '飞书Bitable', value: '已连接', type: 'info' },
      { label: '飞书App ID', value: 'cli_a942474699f85cc1', type: 'info' },
      { label: '基础数据Bitable', value: 'EUyCb0aIcavugUsXJaocRtR6n6b', type: 'info' },
      { label: '订单数据Bitable', value: 'GVgUbTjubaI5m1suvcgctyPOnFc', type: 'info' },
    ],
  },
  {
    title: '打印设置',
    items: [
      { label: '销售送货单模板', value: '标准模板 v1.0', type: 'info' },
      { label: '采购入库单模板', value: '标准模板 v1.0', type: 'info' },
      { label: '默认打印份数', value: '2', type: 'text' },
    ],
  },
];

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="商户设置" subtitle="系统配置与参数设置" />

      <div className="flex-1 overflow-auto p-5">
        <div className="max-w-2xl space-y-6">
          {settingsGroups.map(group => (
            <div key={group.title} className="bg-white rounded-lg shadow-sm border">
              <div className="px-5 py-3 border-b bg-gray-50 rounded-t-lg">
                <h3 className="font-semibold text-sm text-gray-800">{group.title}</h3>
              </div>
              <div className="divide-y">
                {group.items.map(item => (
                  <div key={item.label} className="flex items-center px-5 py-3">
                    <div className="w-40 text-sm text-gray-600 flex-shrink-0">{item.label}</div>
                    <div className="flex-1">
                      {item.type === 'text' ? (
                        <input
                          type="text"
                          defaultValue={item.value}
                          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <span className={`text-sm ${item.label.includes('Bitable') || item.label.includes('App') ? 'font-mono text-gray-500' : 'text-gray-800'}`}>
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-700">
            <div className="font-semibold mb-1">💡 提示</div>
            <ul className="list-disc list-inside space-y-0.5">
              <li>当前为本地开发模式，数据存储在浏览器内存中</li>
              <li>切换到真实飞书Bitable需要配置写入权限</li>
              <li>部分设置修改后需要刷新页面生效</li>
              <li>正式环境建议使用环境变量配置敏感信息</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 text-sm border rounded hover:bg-gray-100">重置</button>
            <button
              onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              {saved ? '✓ 已保存' : '保存设置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
