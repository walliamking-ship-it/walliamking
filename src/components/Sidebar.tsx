'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const quickLinks = [
  { href: '/sales-orders', label: '销售单', icon: '📋' },
  { href: '/products', label: '产品', icon: '🏷️' },
  { href: '/purchase-orders', label: '采购单', icon: '📦' },
];

const mainNav = [
  { href: '/customers', label: '客户', icon: '👥' },
  { href: '/vendors', label: '供应商', icon: '🏭' },
  { href: '/sales-orders', label: '销售订单', icon: '📋' },
  { href: '/purchase-orders', label: '采购订单', icon: '📦' },
  { href: '/processing-orders', label: '加工单', icon: '🏭' },
  { href: '/inventory', label: '库存', icon: '📦' },
  { href: '/products', label: '产品', icon: '🏷️' },
  { href: '/materials', label: '物料', icon: '📄' },
  { href: '/processes', label: '工艺', icon: '⚙️' },
  { href: '/workstations', label: '工序', icon: '🔧' },
];

const bottomNav = [
  { href: '/reports', label: '报表', icon: '📊' },
  { href: '/settings', label: '商户设置', icon: '⚙️' },
  { href: '/employees', label: '员工管理', icon: '👤' },
  { href: '/logs', label: '业务日志', icon: '📝' },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

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

        {/* 快捷入口 */}
        <div className="px-2 py-2 border-b border-gray-700">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest px-2 py-1">快捷</div>
          {quickLinks.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* 主导航 */}
        <nav className="flex-1 py-2 overflow-y-auto">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest px-3 py-1">功能</div>
          {mainNav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-gray-800 text-white border-l-2 border-blue-400'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* 底部导航 */}
        <div className="py-2 border-t border-gray-700">
          {bottomNav.map(item => (
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

        {/* 更多按钮 */}
        <div className="p-2 border-t border-gray-700">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded text-sm text-gray-400 hover:bg-gray-800 w-full">
            <span>更多</span>
            <span className="ml-auto text-xs">▾</span>
          </button>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
