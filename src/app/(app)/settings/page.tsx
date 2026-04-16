'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { resetAllData } from '@/lib/localData';
import { getItem, setItem, STORAGE_KEYS } from '@/lib/storage';
import { Employee, ROLES, RoleKey } from '@/lib/types';
import { EmployeeRepo } from '@/lib/repo';

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('1');

  useEffect(() => {
    const stored = getItem<string>(STORAGE_KEYS.lastSync, '');
    setLastSync(stored);

    // Load employees and current user
    EmployeeRepo.findAll().then(emps => {
      setEmployees(emps);
      const storedUserId = getItem<string>(STORAGE_KEYS.currentUser, '1');
      // Verify stored user still exists
      if (emps.find(e => e.id === storedUserId)) {
        setCurrentUserId(storedUserId);
      }
    });
  }, []);

  const currentEmployee = employees.find(e => e.id === currentUserId) || employees[0];
  const currentRole = currentEmployee ? ROLES.find(r => r.key === currentEmployee.roleKey) : undefined;

  const handleSwitchUser = (emp: Employee) => {
    setCurrentUserId(emp.id);
    setItem(STORAGE_KEYS.currentUser, emp.id);
    alert(`已切换为：${emp.name}（${currentRole?.name || emp.roleKey}）\n\n请刷新页面查看权限变化。`);
  };

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

          {/* 模拟多用户切换 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-5 py-3 border-b bg-gray-50 rounded-t-lg">
              <h3 className="font-semibold text-sm text-gray-800">🔄 模拟多用户切换</h3>
            </div>
            <div className="p-5 space-y-4">
              {/* 当前登录用户 */}
              {currentEmployee && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {currentEmployee.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">{currentEmployee.name}</div>
                    <div className="text-xs text-blue-600 mt-0.5">
                      {currentRole?.name || currentEmployee.roleKey} · {currentRole?.description || ''}
                    </div>
                  </div>
                  <span className="text-xs text-blue-500 font-medium bg-blue-100 px-2 py-0.5 rounded">当前登录</span>
                </div>
              )}

              <div className="text-xs text-gray-500">点击下方员工卡片切换登录身份（用于权限测试）：</div>
              <div className="grid grid-cols-2 gap-2">
                {employees.filter(e => e.status === '正常').map(emp => {
                  const role = ROLES.find(r => r.key === emp.roleKey);
                  const isActive = emp.id === currentUserId;
                  return (
                    <button
                      key={emp.id}
                      onClick={() => handleSwitchUser(emp)}
                      className={`text-left px-3 py-2 rounded border text-xs transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isActive ? 'bg-blue-600' : 'bg-gray-400'}`}>
                          {emp.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-700 truncate">{emp.name}</div>
                          <div className="text-gray-400 truncate">{role?.name || emp.roleKey}</div>
                        </div>
                        {isActive && <span className="text-blue-500 text-xs">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 当前用户权限预览 */}
              {currentEmployee && currentRole && (
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">当前用户权限（{currentRole.name}）：</div>
                  <div className="flex flex-wrap gap-1">
                    {currentRole.permissions.map(perm => (
                      <span key={perm} className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs">{perm}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

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
