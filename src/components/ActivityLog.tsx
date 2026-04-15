'use client';

import { useState, useEffect, useCallback } from 'react';

export type ActivityType = 'customer' | 'vendor' | 'product' | 'sales' | 'purchase' | 'inventory' | 'process' | 'system';
export type ActivityAction = 'create' | 'update' | 'delete' | 'login' | 'logout';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  action: ActivityAction;
  description: string;
  operator: string;
  timestamp: string;
  targetId?: string;
  targetName?: string;
}

const LOG_STORAGE_KEY = 'erp_activity_logs';

// In-memory store for activity logs (would be persisted to backend in production)
let logs: ActivityLog[] = [];
let nextId = 1;

export function addActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
  const newLog: ActivityLog = {
    ...log,
    id: String(nextId++),
    timestamp: new Date().toISOString(),
  };
  logs = [newLog, ...logs].slice(0, 200); // Keep last 200
  // Persist to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs.slice(0, 50)));
  }
  return newLog;
}

export function getActivities(limit = 50): ActivityLog[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOG_STORAGE_KEY);
  if (stored) {
    try { logs = JSON.parse(stored); } catch {}
  }
  return logs.slice(0, limit);
}

const TYPE_LABELS: Record<ActivityType, string> = {
  customer: '客户', vendor: '供应商', product: '产品', sales: '销售订单',
  purchase: '采购订单', inventory: '库存', process: '工序', system: '系统',
};

const ACTION_LABELS: Record<ActivityAction, string> = {
  create: '新建', update: '编辑', delete: '删除', login: '登录', logout: '登出',
};

const TYPE_ICONS: Record<ActivityType, string> = {
  customer: '👥', vendor: '🏭', product: '🏷️', sales: '📋',
  purchase: '📦', inventory: '📦', process: '⚙️', system: '⚙️',
};

interface LogItemProps { log: ActivityLog; }
function LogItem({ log }: LogItemProps) {
  const time = new Date(log.timestamp);
  const timeStr = time.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-4">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
        {TYPE_ICONS[log.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">[{TYPE_LABELS[log.type]}]</span>
          <span className="font-medium text-gray-800">{log.description}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
          <span>{log.operator || '系统'}</span>
          <span>·</span>
          <span>{timeStr}</span>
        </div>
      </div>
      <div className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
        log.action === 'create' ? 'bg-green-50 text-green-700' :
        log.action === 'update' ? 'bg-blue-50 text-blue-700' :
        log.action === 'delete' ? 'bg-red-50 text-red-700' :
        'bg-gray-100 text-gray-600'
      }`}>
        {ACTION_LABELS[log.action]}
      </div>
    </div>
  );
}

interface ActivityLogListProps {
  filter?: ActivityType | 'all';
  limit?: number;
  showHeader?: boolean;
}

export default function ActivityLogList({ filter = 'all', limit = 50, showHeader = false }: ActivityLogListProps) {
  const [items, setItems] = useState<ActivityLog[]>([]);

  const load = useCallback(() => {
    const all = getActivities(200);
    const filtered = filter === 'all' ? all : all.filter(l => l.type === filter);
    setItems(filtered.slice(0, limit));
  }, [filter, limit]);

  useEffect(() => { load(); }, [load]);

  // Reload when storage changes (for cross-tab sync)
  useEffect(() => {
    const handler = () => load();
    window.addEventListener('storage', handler);
    const interval = setInterval(load, 5000);
    return () => { window.removeEventListener('storage', handler); clearInterval(interval); };
  }, [load]);

  if (showHeader) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-sm">业务日志</h3>
          <button onClick={load} className="text-xs text-blue-600 hover:underline">刷新</button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">暂无日志记录</div>
          ) : (
            items.map(log => <LogItem key={log.id} log={log} />)
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {items.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">暂无日志记录</div>
      ) : (
        items.map(log => <LogItem key={log.id} log={log} />)
      )}
    </div>
  );
}
