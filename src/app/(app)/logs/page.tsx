'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import ActivityLogList, { ActivityType, addActivity } from '@/components/ActivityLog';

type FilterTab = 'all' | 'customer' | 'vendor' | 'product' | 'sales' | 'purchase' | 'inventory';

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'customer', label: '客户' },
  { key: 'vendor', label: '供应商' },
  { key: 'product', label: '产品' },
  { key: 'sales', label: '销售' },
  { key: 'purchase', label: '采购' },
  { key: 'inventory', label: '库存' },
];

export default function LogsPage() {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = filterTabs.map(t => ({
    label: t.label,
    active: filter === t.key,
    onClick: () => setFilter(t.key),
  }));

  // Demo: add some sample logs on first visit
  const [demoAdded, setDemoAdded] = useState(false);
  if (!demoAdded) {
    setDemoAdded(true);
    addActivity({ type: 'system', action: 'login', description: '用户登录系统', operator: '金湛' });
    addActivity({ type: 'sales', action: 'create', description: '新建销售订单 XS20260415001（白领仕）', operator: '金湛', targetId: '1' });
    addActivity({ type: 'customer', action: 'create', description: '新建客户 天一纺织', operator: '金湛', targetId: '1' });
    addActivity({ type: 'purchase', action: 'create', description: '新建采购订单 CG20260415001（辰跃纸业）', operator: '金湛', targetId: '1' });
    addActivity({ type: 'inventory', action: 'update', description: '更新库存 GWEST 织标 库存数量', operator: '金湛', targetId: '1' });
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="业务日志"
        subtitle="查看所有业务操作记录"
        actions={[
          {
            label: '刷新',
            icon: '🔄',
            variant: 'default' as const,
            onClick: () => setRefreshKey(k => k + 1),
          },
        ]}
        tabs={tabs}
      />

      <div className="flex-1 overflow-auto p-5">
        <div className="max-w-3xl">
          <ActivityLogList key={refreshKey} filter={filter} limit={100} />
        </div>
      </div>
    </div>
  );
}
