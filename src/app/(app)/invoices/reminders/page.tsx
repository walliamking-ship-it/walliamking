'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';

interface Reminder {
  invoiceId: string;
  invoiceNo: string;
  invoiceType: 'sales' | 'purchase';
  customerName?: string;
  vendorName?: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  overdueStatus: 'normal' | 'due_soon' | 'overdue' | 'critical';
  messages: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface Summary {
  totalOverdueCount: number;
  totalOverdueAmount: number;
  totalDueSoonCount: number;
  totalDueSoonAmount: number;
  byCustomer: { name: string; count: number; amount: number }[];
  urgentInvoices: Reminder[];
}

export default function InvoiceRemindersPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [salesReminders, setSalesReminders] = useState<Reminder[]>([]);
  const [purchaseReminders, setPurchaseReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'purchase'>('all');

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices/reminders');
      const data = await res.json();
      if (data.code === 0) {
        setSummary(data.data.summary);
        setSalesReminders(data.data.salesReminders);
        setPurchaseReminders(data.data.purchaseReminders);
      }
    } catch (e) {
      console.error('Failed to fetch reminders:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-600 text-white';
      case 'overdue': return 'bg-orange-500 text-white';
      case 'due_soon': return 'bg-yellow-500 text-white';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critical': return '严重逾期';
      case 'overdue': return '已逾期';
      case 'due_soon': return '即将到期';
      default: return '正常';
    }
  };

  const displayReminders = activeTab === 'sales' ? salesReminders
    : activeTab === 'purchase' ? purchaseReminders
    : [...salesReminders, ...purchaseReminders];

  const overdueReminders = displayReminders.filter(r => r.overdueStatus !== 'normal');

  return (
    <div className="p-6">
      <PageHeader 
        title="发票到期提醒" 
        subtitle="自动检查发票逾期情况"
      />

      {loading ? (
        <div className="text-center py-20 text-gray-500">加载中...</div>
      ) : (
        <>
          {/* 汇总卡片 */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-600 text-2xl font-bold">{summary.totalOverdueCount}</div>
                <div className="text-red-500 text-sm">逾期发票</div>
                <div className="text-red-400 text-xs mt-1">¥{summary.totalOverdueAmount.toLocaleString()}</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-yellow-600 text-2xl font-bold">{summary.totalDueSoonCount}</div>
                <div className="text-yellow-500 text-sm">即将到期</div>
                <div className="text-yellow-400 text-xs mt-1">¥{summary.totalDueSoonAmount.toLocaleString()}</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-600 text-2xl font-bold">{summary.byCustomer.length}</div>
                <div className="text-blue-500 text-sm">涉及单位</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-orange-600 text-2xl font-bold">{summary.urgentInvoices.length}</div>
                <div className="text-orange-500 text-sm">紧急处理</div>
              </div>
            </div>
          )}

          {/* Tab切换 */}
          <div className="flex gap-2 mb-4">
            {(['all', 'sales', 'purchase'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === 'all' ? '全部' : tab === 'sales' ? '销售发票' : '采购发票'}
              </button>
            ))}
          </div>

          {/* 逾期列表 */}
          {overdueReminders.length > 0 ? (
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">状态</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">发票号</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">类型</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">客户/供应商</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">金额</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">到期日</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">提醒</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueReminders.map(reminder => (
                    <tr key={reminder.invoiceId} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(reminder.overdueStatus)}`}>
                          {getStatusText(reminder.overdueStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{reminder.invoiceNo}</td>
                      <td className="px-4 py-3 text-sm">
                        {reminder.invoiceType === 'sales' ? '销售' : '采购'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {reminder.customerName || reminder.vendorName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        ¥{reminder.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {reminder.dueDate || '未设置'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {reminder.messages.join(' ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-12 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <div className="text-gray-600">太棒了！暂无逾期发票</div>
              <div className="text-gray-400 text-sm mt-1">所有发票都在正常账期内</div>
            </div>
          )}

          {/* 按客户汇总 */}
          {summary && summary.byCustomer.length > 0 && (
            <div className="mt-6 bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">逾期汇总（按单位）</h3>
              <div className="space-y-3">
                {summary.byCustomer.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.count}张发票逾期</div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-600 font-bold">¥{item.amount.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
