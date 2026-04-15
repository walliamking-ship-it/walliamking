'use client';

interface StatusBadgeProps {
  status: string;
  type?: 'payment' | 'delivery' | 'general';
}

const statusConfig: Record<string, { bg: string; text: string; type: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  // 收款状态
  '全部收款': { bg: 'bg-green-50', text: 'text-green-700', type: 'success' },
  '部分收款': { bg: 'bg-orange-50', text: 'text-orange-700', type: 'warning' },
  '未收款': { bg: 'bg-red-50', text: 'text-red-700', type: 'danger' },
  // 送货状态
  '全部送货': { bg: 'bg-green-50', text: 'text-green-700', type: 'success' },
  '部分送货': { bg: 'bg-orange-50', text: 'text-orange-700', type: 'warning' },
  '未送货': { bg: 'bg-red-50', text: 'text-red-700', type: 'danger' },
  // 付款状态
  '全部付款': { bg: 'bg-green-50', text: 'text-green-700', type: 'success' },
  '部分付款': { bg: 'bg-orange-50', text: 'text-orange-700', type: 'warning' },
  '未付款': { bg: 'bg-red-50', text: 'text-red-700', type: 'danger' },
  // 收货状态
  '全部收货': { bg: 'bg-green-50', text: 'text-green-700', type: 'success' },
  '部分收货': { bg: 'bg-orange-50', text: 'text-orange-700', type: 'warning' },
  '未收货': { bg: 'bg-red-50', text: 'text-red-700', type: 'danger' },
  // 通用
  '已完成': { bg: 'bg-green-50', text: 'text-green-700', type: 'success' },
  '进行中': { bg: 'bg-blue-50', text: 'text-blue-700', type: 'info' },
  '已取消': { bg: 'bg-gray-100', text: 'text-gray-600', type: 'default' },
  '待处理': { bg: 'bg-yellow-50', text: 'text-yellow-700', type: 'warning' },
};

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: 'bg-gray-50', text: 'text-gray-700', type: 'default' as const };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {status}
    </span>
  );
}

export function MoneyCell({ value, className = '' }: { value: number; className?: string }) {
  const formatted = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(value || 0);

  const isZero = value === 0;
  const isNegative = value < 0;

  return (
    <span className={`font-mono text-sm ${isNegative ? 'text-red-600' : isZero ? 'text-gray-400' : 'text-gray-900'} ${className}`}>
      {formatted}
    </span>
  );
}

export function DateCell({ value }: { value: string }) {
  if (!value) return <span className="text-gray-400">-</span>;
  // 格式化为 YYYY-MM-DD
  const d = new Date(value);
  if (isNaN(d.getTime())) return <span>{value}</span>;
  return (
    <span className="text-gray-700">
      {d.getFullYear()}-{String(d.getMonth() + 1).padStart(2, '0')}-{String(d.getDate()).padStart(2, '0')}
    </span>
  );
}
