'use client';

import { ReactNode } from 'react';

interface ActionButton {
  label: string;
  icon?: string;
  onClick?: () => void;
  variant?: 'primary' | 'default' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
}

interface FilterTab {
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
  className?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** 主要操作按钮（一般在标题右侧） */
  actions?: ActionButton[];
  /** 筛选标签页 */
  tabs?: FilterTab[];
  /** 搜索框placeholder */
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  /** 额外内容（插在操作按钮和标签页之间） */
  extra?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  tabs,
  searchPlaceholder,
  onSearch,
  extra,
  children,
}: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      {/* 标题栏 + 操作按钮 */}
      <div className="px-5 py-3 flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* 操作按钮 */}
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`
                  px-3 py-1.5 rounded text-sm font-medium transition-colors
                  ${action.variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                    action.variant === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                    action.variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                    action.variant === 'warning' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}
                  ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 搜索 + 额外内容 + 标签页 */}
      {(searchPlaceholder || extra || (tabs && tabs.length > 0)) && (
        <div className="px-5 py-2 flex items-center gap-3 border-t border-gray-100">
          {/* 搜索框 */}
          {searchPlaceholder && (
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
                onChange={e => onSearch?.(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm w-64 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            </div>
          )}

          {/* 额外内容 */}
          {extra && <div className="flex-1">{extra}</div>}

          {/* 筛选标签 */}
          {tabs && tabs.length > 0 && (
            <div className="flex items-center gap-1 ml-auto">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={tab.onClick}
                  className={`px-3 py-1 rounded text-sm transition-colors ${tab.className || ''} ${
                    tab.active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                      tab.active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 页面内容 */}
      {children && <div>{children}</div>}
    </div>
  );
}
