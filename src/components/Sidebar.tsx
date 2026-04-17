'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// ── 菜单结构定义 ──────────────────────────────────────────
type NavItem = { href: string; label: string; icon: string };
type NavGroup = { label: string; icon: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: '综合',
    icon: '🏢',
    items: [
      { href: '/customers', label: '客户', icon: '👥' },
      { href: '/vendors', label: '供应商', icon: '🏭' },
      { href: '/reports', label: '报表中心', icon: '📊' },
    ],
  },
  {
    label: '销售管理',
    icon: '📋',
    items: [
      { href: '/sales-orders', label: '销售订单', icon: '📋' },
      { href: '/delivery-orders', label: '送货单', icon: '🚚' },
    ],
  },
  {
    label: '采购管理',
    icon: '📦',
    items: [
      { href: '/purchase-orders', label: '采购订单', icon: '📦' },
      { href: '/receiving-orders', label: '收货单', icon: '📥' },
    ],
  },
  {
    label: '财务管理',
    icon: '💰',
    items: [
      { href: '/invoices', label: '发票', icon: '🧾' },
      { href: '/payment-receipts', label: '收款单', icon: '💰' },
      { href: '/payment-mades', label: '付款单', icon: '💸' },
      { href: '/bills', label: '账单管理', icon: '📑' },
    ],
  },
  {
    label: '生产管理',
    icon: '🔨',
    items: [
      { href: '/work-orders', label: '施工单', icon: '🔨' },
      { href: '/job-reports', label: '报工管理', icon: '📝' },
      { href: '/workstations', label: '工序', icon: '🔧' },
      { href: '/processes', label: '工艺', icon: '🎨' },
      { href: '/cutting-dies', label: '刀板', icon: '🔪' },
      { href: '/artworks', label: '稿件', icon: '📄' },
    ],
  },
  {
    label: '产品管理',
    icon: '🏷️',
    items: [
      { href: '/inventory', label: '库存', icon: '📦' },
      { href: '/products', label: '产品', icon: '🏷️' },
      { href: '/materials', label: '物料', icon: '📄' },
    ],
  },
];

const BOTTOM_NAV: NavItem[] = [
  { href: '/reports', label: '报表', icon: '📊' },
  { href: '/reports/analytics', label: '管理看板', icon: '📈' },
  { href: '/reports/production-kanban', label: '生产看板', icon: '🏭' },
  { href: '/settings', label: '商户设置', icon: '⚙️' },
  { href: '/employees', label: '员工管理', icon: '👤' },
  { href: '/logs', label: '业务日志', icon: '📝' },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  // 判断当前路径属于哪个一级分组
  const activeGroup = NAV_GROUPS.find(g =>
    g.items.some(item => isActive(item.href))
  )?.label;

  const toggleGroup = (label: string) =>
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧边栏 */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col flex-shrink-0">

        {/* 用户信息 */}
        <div className="px-3 py-3 border-b border-gray-700">
          <div className="text-sm font-semibold text-white">金湛</div>
          <div className="text-xs text-gray-400 mt-0.5">上海申竭诚包装</div>
          <div className="text-xs text-gray-500 mt-0.5">2026年4月15日 星期三</div>
        </div>

        {/* 主导航 — 分组可折叠 */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_GROUPS.map(group => {
            const isOpen = collapsed[group.label] !== true;
            const isGroupActive = activeGroup === group.label;
            return (
              <div key={group.label} className="mb-1">
                {/* 一级菜单头 */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded mx-1 ${
                    isGroupActive
                      ? 'bg-gray-800 text-white border-l-2 border-blue-400'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-base">{group.icon}</span>
                  <span className="flex-1 text-left font-medium">{group.label}</span>
                  <span className={`text-xs transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
                    ▾
                  </span>
                </button>

                {/* 二级菜单 */}
                {isOpen && (
                  <div className="ml-3 mt-0.5 border-l border-gray-700">
                    {group.items.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors rounded ml-1 ${
                          isActive(item.href)
                            ? 'bg-gray-800 text-blue-300 border-l-2 border-blue-400 -ml-px'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        }`}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* 底部导航 */}
        <div className="py-2 border-t border-gray-700">
          {BOTTOM_NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
