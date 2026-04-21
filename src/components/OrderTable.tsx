'use client';

import { useState } from 'react';
import StatusBadge, { MoneyCell, DateCell } from './StatusBadge';

export interface Column<T> {
  key: string;
  label: string | React.ReactNode;
  sortable?: boolean;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

interface OrderTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  /** 渲染可点击的单号单元格 */
  renderOrderNumber?: (item: T) => React.ReactNode;
  /** 渲染关联单号（如销售单列表显示对应采购单号） */
  renderRelatedOrder?: (item: T) => React.ReactNode;
  /** 行点击事件 */
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  /** 每页条数 */
  pageSize?: number;
  /** 当前展开的行ID */
  expandedId?: string | null;
  /** 渲染展开的子行内容 */
  renderExpanded?: (item: T) => React.ReactNode;
}

export default function OrderTable<T extends { id: string }>({
  columns,
  data,
  renderOrderNumber,
  renderRelatedOrder,
  onRowClick,
  loading,
  emptyMessage = '暂无数据',
  pageSize = 100,
  expandedId,
  renderExpanded,
}: OrderTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = (a as any)[sortKey];
        const bv = (b as any)[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="text-3xl mr-3 animate-spin">⟳</span>
        <span className="mt-2 text-sm">加载中...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {/* 表格 */}
      <div className="overflow-auto flex-1">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {col.sortable && sortKey === col.key && (
                      <span className="text-blue-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                    {col.sortable && sortKey !== col.key && (
                      <span className="text-gray-300">⇅</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-16 text-center text-gray-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((item, idx) => (
                <>
                  <tr
                    key={item.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${expandedId === item.id ? 'bg-blue-50' : ''}`}
                    onClick={() => onRowClick?.(item)}
                  >
                  {columns.map(col => (
                    <td key={col.key} className="px-3 py-2.5 text-sm">
                      {col.key === '单号' && renderOrderNumber ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="text-blue-600 font-mono text-xs">{renderOrderNumber(item)}</div>
                          {renderRelatedOrder && (
                            <div className="text-gray-400 font-mono text-xs">{renderRelatedOrder(item)}</div>
                          )}
                        </div>
                      ) : col.render ? (
                        col.render(item)
                      ) : col.key === '合同金额' || col.key === '已送货' || col.key === '未收款项' || col.key === '已收款' || col.key === '已付款' || col.key === '未付款' ? (
                        <MoneyCell value={(item as any)[col.key]} />
                      ) : col.key === '日期' || col.key === '计划收款日期' || col.key === '计划付款日期' ? (
                        <DateCell value={(item as any)[col.key]} />
                      ) : col.key === '收款状态' || col.key === '送货状态' || col.key === '付款状态' || col.key === '收货状态' ? (
                        <StatusBadge status={(item as any)[col.key]} />
                      ) : (
                        String((item as any)[col.key] ?? '-')
                      )}
                    </td>
                  ))}
                </tr>
                  {expandedId === item.id && renderExpanded && (
                    <tr key={`${item.id}-expanded`} className="border-b border-gray-200 bg-gray-50">
                      <td colSpan={columns.length} className="p-0">
                        {renderExpanded(item)}
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-500">
            共 {sorted.length} 条，第 {page}/{totalPages} 页
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-40"
            >
              首页
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5) {
                if (page > 3) p = page - 2 + i;
                if (page > totalPages - 2) p = totalPages - 4 + i;
              }
              if (p < 1 || p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 text-sm border rounded ${page === p ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-40"
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-40"
            >
              末页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
