'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/customers', label: '客户管理' },
  { href: '/vendors', label: '供应商管理' },
  { href: '/sales-orders', label: '销售订单' },
  { href: '/purchase-orders', label: '采购订单' },
  { href: '/materials', label: '物料管理' },
  { href: '/products', label: '产品管理' },
  { href: '/processes', label: '工艺管理' },
  { href: '/workstations', label: '工序管理' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* 侧边栏 */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold">ERP 系统</h1>
          <p className="text-xs text-gray-400">印刷包装管理</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 text-sm hover:bg-gray-800 ${
                pathname === item.href ? 'bg-gray-800 text-blue-400' : 'text-gray-300'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
          数据源: 飞书Bitable
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </main>
    </div>
  );
}
