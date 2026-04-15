'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { resetAllData } from '@/lib/localData';
import { getItem, STORAGE_KEYS } from '@/lib/storage';

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
    title: '数据存储',
    items: [
      { label: '存储模式', value: '浏览器本地存储 (localStorage)', type: 'info' },
      { label: '数据持久化', value: '✅ 已启用（刷新页面不丢失）', type: 'success' },
      { label: '最后同步', value: '—', type: 'info', key: 'lastSync' },
    ],
  },
  {
    title: '飞书集成',
    items: [
      { label: '飞书Bitable读取', value: '✅ 正常', type: 'success' },
      { label: '飞书Bitable写入', value: '⚠️ 需开通写入权限', type: 'warning' },
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
  const [lastSync, setLastSync] = useState<string>('');

  useEffect(() => {
    const stored = getItem<string>(STORAGE_KEYS.lastSync, '');
    setLastSync(stored);
  }, []);

  const handleResetData = () => {
    if (!confirm('确定重置所有数据？此操作不可恢复！\n\n将清除所有本地数据并恢复为秒账默认数据。')) return;
    resetAllData();
    setLastSync(new Date().toISOString());
    alert('数据已重置为默认数据，请刷新页面查看。');
  };

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
                {group.items.map(item => {
                  let displayValue = item.value;
                  if (item.key === 'lastSync' && lastSync) {
                    displayValue = new Date(lastSync).toLocaleString('zh-CN');
                  }
                  return (
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
                          <span className={`text-sm ${
                            item.type === 'success' ? 'text-green-600 font-medium' :
                            item.type === 'warning' ? 'text-orange-600 font-medium' :
                            item.label.includes('App ID') || item.label.includes('Bitable') ? 'font-mono text-gray-500' :
                            'text-gray-800'
                          }`}>
                            {displayValue}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 数据管理 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-5 py-3 border-b bg-gray-50 rounded-t-lg">
              <h3 className="font-semibold text-sm text-gray-800">数据管理</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">重置为默认数据</div>
                  <div className="text-xs text-gray-500 mt-0.5">清除所有本地数据，恢复为秒账初始数据</div>
                </div>
                <button
                  onClick={handleResetData}
                  className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50">
                  重置数据
                </button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-700">
            <div className="font-semibold mb-1">💡 提示</div>
            <ul className="list-disc list-inside space-y-0.5">
              <li>当前数据保存在浏览器localStorage中，<strong>刷新页面不会丢失</strong></li>
              <li>切换浏览器或清除缓存将丢失数据</li>
              <li>开通飞书Bitable写入权限后，可实现云端同步</li>
              <li>如需导出数据，可使用各页面的&quot;导出CSV&quot;功能</li>
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
