'use client';

import PageHeader from '@/components/PageHeader';

const reportModules = [
  { label: '销售流水表', desc: '按日期查看所有销售出库记录', icon: '📋', href: '/sales-orders' },
  { label: '采购流水表', desc: '按日期查看所有采购入库记录', icon: '📦', href: '/purchase-orders' },
  { label: '送货提醒表', desc: '即将到期或逾期的送货计划', icon: '🚚', href: '/sales-orders' },
  { label: '收款欠款汇总', desc: '客户应收款汇总与账龄分析', icon: '💰', href: '/sales-orders' },
  { label: '库存报表', desc: '各仓库库存数量与金额汇总', icon: '📊', href: '/inventory' },
  { label: '产品销售总览', desc: '各产品销售数量与金额统计', icon: '🏷️', href: '/products' },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="报表中心" subtitle="经营数据统计与分析" />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportModules.map(report => (
            <div key={report.label} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
              <div className="text-3xl mb-3">{report.icon}</div>
              <div className="font-semibold text-gray-800">{report.label}</div>
              <div className="text-sm text-gray-500 mt-1">{report.desc}</div>
              <div className="mt-3">
                <a href={report.href} className="text-xs text-blue-600 hover:underline">进入报表 →</a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="font-medium text-yellow-800 text-sm">⚠️ 报表功能开发中</div>
          <div className="text-xs text-yellow-700 mt-1">
            目前各模块数据已可正常访问，完整报表功能（交叉分析、导出Excel、自定义时间范围）正在开发中。
          </div>
        </div>
      </div>
    </div>
  );
}
