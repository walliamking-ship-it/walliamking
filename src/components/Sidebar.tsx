'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

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
      { href: '/invoices/reminders', label: '到期提醒', icon: '⏰' },
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
  {
    label: '审批管理',
    icon: '✅',
    items: [
      { href: '/approvals', label: '审批中心', icon: '✅' },
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

// 移动端快捷导航
const MOBILE_QUICK_LINKS: NavItem[] = [
  { href: '/sales-orders', label: '销售单', icon: '📋' },
  { href: '/purchase-orders', label: '采购单', icon: '📦' },
  { href: '/work-orders', label: '施工单', icon: '🔨' },
  { href: '/customers', label: '客户', icon: '👥' },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [currentUser, setCurrentUser] = useState<{username: string; employeeName: string} | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // 加载当前用户
  useEffect(() => {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch {}
    }
  }, []);

  // 关闭抽屉当点击外部
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        // 检查是否点击的是汉堡按钮
        const hamburgerBtn = document.getElementById('hamburger-btn');
        if (hamburgerBtn && hamburgerBtn.contains(e.target as Node)) return;
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  //  ESC 关闭抽屉
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('erp_token');
    localStorage.removeItem('current_user');
    router.push('/login');
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const activeGroup = NAV_GROUPS.find(g =>
    g.items.some(item => isActive(item.href))
  )?.label;

  const toggleGroup = (label: string) =>
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  const closeDrawer = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ── 移动端顶部导航栏 ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white h-12 flex items-center justify-between px-3 shadow-md">
        <button
          id="hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded hover:bg-gray-800 active:bg-gray-700 transition-colors"
          aria-label="打开菜单"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <div className="text-sm font-medium truncate">
          {activeGroup || '工作台'}
        </div>
        <div className="w-8" /> {/* 占位，保持居中 */}
      </header>

      {/* ── 移动端快捷导航 ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex justify-around py-1 px-2 shadow-lg">
        {MOBILE_QUICK_LINKS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeDrawer}
            className={`flex flex-col items-center py-1 px-2 rounded-lg min-w-[56px] ${
              isActive(item.href)
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* ── 桌面端左侧边栏 ── */}
      <aside className="hidden md:flex w-56 bg-gray-900 text-white flex-col flex-shrink-0">
        <SidebarContent
          currentUser={currentUser}
          collapsed={collapsed}
          activeGroup={activeGroup}
          isActive={isActive}
          toggleGroup={toggleGroup}
          handleLogout={handleLogout}
        />
      </aside>

      {/* ── 移动端抽屉式侧边栏 ── */}
      {mobileMenuOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={closeDrawer}
          />
          {/* 抽屉 */}
          <aside
            ref={drawerRef}
            className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-gray-900 text-white flex flex-col shadow-2xl"
            style={{ transform: 'translateX(0)' }}
          >
            <SidebarContent
              currentUser={currentUser}
              collapsed={collapsed}
              activeGroup={activeGroup}
              isActive={isActive}
              toggleGroup={toggleGroup}
              handleLogout={handleLogout}
              onItemClick={closeDrawer}
              showMobileHeader
              onClose={closeDrawer}
            />
          </aside>
        </>
      )}

      {/* ── 主内容区 ── */}
      <main className="flex-1 flex flex-col overflow-hidden pt-12 pb-14 md:pt-0 md:pb-0">
        {children}
      </main>
    </div>
  );
}

// ── 侧边栏内容组件（复用） ──────────────────────────────────
type SidebarContentProps = {
  currentUser: { username: string; employeeName: string } | null;
  collapsed: Record<string, boolean>;
  activeGroup: string | undefined;
  isActive: (href: string) => boolean;
  toggleGroup: (label: string) => void;
  handleLogout: () => void;
  onItemClick?: () => void;
  showMobileHeader?: boolean;
  onClose?: () => void;
};

function SidebarContent({
  currentUser,
  collapsed,
  activeGroup,
  isActive,
  toggleGroup,
  handleLogout,
  onItemClick,
  showMobileHeader,
  onClose,
}: SidebarContentProps) {
  return (
    <>
      {showMobileHeader && (
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-700 bg-gray-900">
          <div>
            <div className="text-sm font-semibold text-white">
              {currentUser?.employeeName || currentUser?.username || '未登录'}
            </div>
            <div className="text-xs text-gray-400">@{currentUser?.username}</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
            aria-label="关闭菜单"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {!showMobileHeader && (
        <div className="px-3 py-3 border-b border-gray-700">
          <div className="text-sm font-semibold text-white">
            {currentUser?.employeeName || currentUser?.username || '未登录'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">@{currentUser?.username}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
        </div>
      )}

      {/* 主导航 */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_GROUPS.map(group => {
          const isOpen = collapsed[group.label] !== true;
          const isGroupActive = activeGroup === group.label;
          return (
            <div key={group.label} className="mb-1">
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

              {isOpen && (
                <div className="ml-3 mt-0.5 border-l border-gray-700">
                  {group.items.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onItemClick}
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
            onClick={onItemClick}
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
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors text-gray-400 hover:bg-gray-800 hover:text-red-400 mt-1"
        >
          <span>🚪</span>
          <span>退出登录</span>
        </button>
      </div>
    </>
  );
}
