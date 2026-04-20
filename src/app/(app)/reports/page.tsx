'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SalesOrder, PurchaseOrder, Inventory, JobReport, WorkOrder, Product } from '@/lib/types';
import { SalesOrderRepo, PurchaseOrderRepo, InventoryRepo, JobReportRepo, WorkOrderRepo, ProductRepo } from '@/lib/repo';

function Card({ title, value, sub, icon, color }: {
  title: string; value: string | number; sub?: string; icon: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };
  return (
    <div className={`rounded-lg border p-4 ${colorMap[color] || colorMap.gray}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium opacity-80">{title}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
          {sub && <div className="text-xs mt-1 opacity-70">{sub}</div>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

function AlertItem({ type, message, href }: { type: 'warn' | 'danger' | 'info'; message: string; href?: string }) {
  const style = type === 'danger' ? 'bg-red-50 border-red-200 text-red-700' : type === 'warn' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-blue-50 border-blue-200 text-blue-700';
  const icon = type === 'danger' ? '🔴' : type === 'warn' ? '🟡' : '🔵';
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded border text-xs ${style}`}>
      <span>{icon}</span>
      <span className="flex-1">{message}</span>
      {href && <Link href={href} className="underline font-medium ml-2">查看→</Link>}
    </div>
  );
}

export default function DashboardPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [jobReports, setJobReports] = useState<JobReport[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      SalesOrderRepo.findAll(), PurchaseOrderRepo.findAll(),
      InventoryRepo.findAll(), JobReportRepo.findAll(),
      WorkOrderRepo.findAll(), ProductRepo.findAll(),
    ]).then(([so, po, inv, jr, wo, pr]) => {
      setSalesOrders(so); setPurchaseOrders(po);
      setInventory(inv); setJobReports(jr);
      setWorkOrders(wo); setProducts(pr);
      setLoading(false);
    });
  }, []);

  // 计算汇总数据
  const totalContract = salesOrders.reduce((s, o) => s + Number(o.合同金额 || 0), 0);
  const totalUnpaid = salesOrders.reduce((s, o) => s + Number(o.未收款项 || 0), 0);
  const totalPaid = salesOrders.reduce((s, o) => s + Number(o.已收款 || 0), 0);
  const unpaidOrders = salesOrders.filter(o => o.未收款项 > 0).length;
  const undeliveredOrders = salesOrders.filter(o => o.送货状态 === '未送货' || o.送货状态 === '部分送货').length;

  // 采购
  const totalPurchase = purchaseOrders.reduce((s, o) => s + Number(o.合同金额 || 0), 0);
  const totalUnpaidPO = purchaseOrders.reduce((s, o) => s + Number(o.未付款 || 0), 0);

  // 库存预警
  const lowStock = inventory.filter(i => i.当前库存 <= i.安全库存 && i.当前库存 > 0);
  const outOfStock = inventory.filter(i => i.当前库存 <= 0);

  // 报工待审核
  const pendingReports = jobReports.filter(r => r.状态 === '待审核');

  // 生产进度
  const inProduction = workOrders.filter(w => w.状态 === '生产中').length;
  const completedOrders = workOrders.filter(w => w.状态 === '已完成' || w.状态 === '已入库').length;

  // 逾期应收（计划收款日期已过但未收完）
  const today = new Date().toISOString().slice(0, 10);
  const overdueAR = salesOrders.filter(o => o.计划收款日期 && o.计划收款日期 < today && o.未收款项 > 0);

  // 月度销售趋势（近6个月）
  const monthlySales: Record<string, number> = {};
  salesOrders.forEach(o => {
    if (o.日期) {
      const month = o.日期.slice(0, 7);
      monthlySales[month] = (monthlySales[month] || 0) + (o.合同金额 || 0);
    }
  });
  const monthlyData = Object.entries(monthlySales).sort().slice(-6).map(([month, amount]) => ({ month, amount: Math.round(amount) }));

  // 收款状态分布
  const arStatus = {
    unpaid: salesOrders.filter(o => o.收款状态 === '未收款').length,
    partial: salesOrders.filter(o => o.收款状态 === '部分收款').length,
    paid: salesOrders.filter(o => o.收款状态 === '全部收款').length,
  };

  // 客户销售排行TOP5
  const customerSales: Record<string, number> = {};
  salesOrders.forEach(o => {
    customerSales[o.客户名称] = (customerSales[o.客户名称] || 0) + (o.合同金额 || 0);
  });
  const topCustomers = Object.entries(customerSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // 产品销售排行TOP5
  const productSales: Record<string, number> = {};
  salesOrders.forEach(o => {
    productSales[o.客户名称] = (productSales[o.客户名称] || 0) + (o.合同金额 || 0);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* 顶部标题 */}
      <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">经营驾驶舱</h1>
          <p className="text-xs text-gray-500 mt-0.5">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/reports/analytics" className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50">经营分析</Link>
          <Link href="/reports/sales-flow" className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50">销售流水</Link>
          <Link href="/reports/ar-summary" className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50">应收汇总</Link>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* KPI卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card title="合同总额" value={`¥${totalContract?.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`} sub={`共 ${salesOrders.length} 张订单`} icon="📋" color="blue" />
          <Card title="应收款项" value={`¥${totalUnpaid?.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`} sub={`${unpaidOrders} 张订单未收完`} icon="💰" color="red" />
          <Card title="已收款" value={`¥${totalPaid?.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`} sub="本月回款" icon="✅" color="green" />
          <Card title="未完成送货" value={undeliveredOrders} sub="张订单待送货" icon="🚚" color="orange" />
        </div>

        {/* 采购 + 生产 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card title="采购总额" value={`¥${totalPurchase?.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`} sub={`共 ${purchaseOrders.length} 张采购单`} icon="📦" color="purple" />
          <Card title="应付账款" value={`¥${totalUnpaidPO?.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`} sub="待付款" icon="💸" color="orange" />
          <Card title="生产中" value={inProduction} sub="张施工单" icon="🔨" color="blue" />
          <Card title="待审核报工" value={pendingReports.length} sub="条报工记录" icon="📝" color="gray" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 警示面板 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">⚠️ 警示提醒</h3>
            {overdueAR.length > 0 && (
              <AlertItem type="danger" message={`${overdueAR.length} 张订单逾期未收款`} href="/reports/ar-summary" />
            )}
            {outOfStock.length > 0 && (
              <AlertItem type="danger" message={`${outOfStock.length} 种产品库存为零`} href="/reports/inventory" />
            )}
            {lowStock.length > 0 && (
              <AlertItem type="warn" message={`${lowStock.length} 种产品低于安全库存`} href="/reports/inventory" />
            )}
            {pendingReports.length > 0 && (
              <AlertItem type="info" message={`${pendingReports.length} 条报工待审核`} href="/job-reports" />
            )}
            {overdueAR.length === 0 && outOfStock.length === 0 && lowStock.length === 0 && pendingReports.length === 0 && (
              <div className="text-xs text-gray-400 text-center py-4">暂无警示信息 ✓</div>
            )}
          </div>

          {/* 月度销售趋势 */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">📈 月度销售趋势</h3>
            {monthlyData.length > 0 ? (
              <div className="space-y-2">
                {monthlyData.map(d => (
                  <div key={d.month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16">{d.month}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (d.amount / (monthlyData[monthlyData.length-1]?.amount || 1)) * 100)}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                        ¥{d.amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center py-8">暂无销售数据</div>
            )}
          </div>

          {/* 收款状态分布 */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">💰 应收款状态分布</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-xs text-gray-600">未收款</span>
                </div>
                <span className="text-sm font-semibold text-red-600">{arStatus.unpaid} 张</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                  <span className="text-xs text-gray-600">部分收款</span>
                </div>
                <span className="text-sm font-semibold text-orange-600">{arStatus.partial} 张</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-xs text-gray-600">全部收款</span>
                </div>
                <span className="text-sm font-semibold text-green-600">{arStatus.paid} 张</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>收款率</span>
                <span>{salesOrders.length > 0 ? ((arStatus.paid / salesOrders.length) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${salesOrders.length > 0 ? (arStatus.paid / salesOrders.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 客户销售排行 + 产品快速入口 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 客户销售排行 */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-700">🏆 客户销售排行 TOP5</h3>
              <Link href="/reports/analytics" className="text-xs text-blue-600 hover:underline">查看全部→</Link>
            </div>
            {topCustomers.length > 0 ? (
              <div className="space-y-2">
                {topCustomers.map(([name, amount], idx) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded text-xs flex items-center justify-center font-bold ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : idx === 1 ? 'bg-gray-300 text-gray-700' : idx === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-500'}`}>
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-700 truncate">{name}</span>
                    <span className="text-sm font-semibold text-blue-600">¥{Number(amount)?.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center py-6">暂无销售数据</div>
            )}
          </div>

          {/* 快捷入口 */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">⚡ 快捷入口</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '新建销售单', href: '/sales-orders', icon: '📋', color: 'blue' },
                { label: '新建采购单', href: '/purchase-orders', icon: '📦', color: 'green' },
                { label: '报工登记', href: '/job-reports', icon: '📝', color: 'orange' },
                { label: '库存查询', href: '/inventory', icon: '📦', color: 'purple' },
                { label: '客户管理', href: '/customers', icon: '👥', color: 'gray' },
                { label: '工艺管理', href: '/processes', icon: '🎨', color: 'pink' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs text-gray-600 text-center">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
