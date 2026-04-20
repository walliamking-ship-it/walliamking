'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { CustomerRepo, VendorRepo, ProductRepo, SalesOrderRepo, PurchaseOrderRepo, InventoryRepo } from '@/lib/repo';

function StatCard({ label, value, color, href, sub }: { label: string; value: number; color: string; href: string; sub?: string }) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
            <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
            {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
          </div>
          <div className={`w-10 h-10 rounded-full ${color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
            <div className={`w-3 h-3 rounded-full ${color.replace('text-', 'bg-')}`} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function MoneyCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-bold mt-1 ${color}`}>
        ¥{value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  );
}

function QuickAction({ label, href, icon }: { label: string; href: string; icon: string }) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
    </Link>
  );
}

function OrderRow({ order, type }: { order: any; type: 'sales' | 'purchase' }) {
  const statusField = type === 'sales' ? order.收款状态 : order.付款状态;
  const statusOk = statusField === (type === 'sales' ? '全部收款' : '全部付款');
  const statusPartial = statusField === (type === 'sales' ? '部分收款' : '部分付款');
  return (
    <tr className="border-b border-gray-50 hover:bg-blue-50/30">
      <td className="px-4 py-2.5">
        <Link href={type === 'sales' ? '/sales-orders' : '/purchase-orders'}
          className="text-blue-600 font-mono text-xs hover:underline">{order.单号}</Link>
      </td>
      <td className="px-4 py-2.5 text-sm text-gray-700 truncate max-w-32">
        {type === 'sales' ? order.客户名称 : order.供应商名称}
      </td>
      <td className="px-4 py-2.5 text-right text-sm font-mono text-gray-900">
        {order.合同金额 != null ? `¥${Number(order.合同金额).toFixed(2)}` : '-'}
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
          statusOk ? 'bg-green-50 text-green-700' : statusPartial ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
        }`}>{statusField || '未收款'}</span>
      </td>
    </tr>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState({ customers: 0, vendors: 0, products: 0, salesOrders: 0, purchaseOrders: 0, inventoryAlerts: 0 });
  const [financial, setFinancial] = useState({ totalContract: 0, totalReceived: 0, totalUnpaid: 0 });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [customers, vendors, products, salesOrders, purchaseOrders, inventory] = await Promise.all([
          CustomerRepo.findAll(), VendorRepo.findAll(), ProductRepo.findAll(),
          SalesOrderRepo.findAll(), PurchaseOrderRepo.findAll(), InventoryRepo.findAll(),
        ]);
        const safeArr = (arr: any) => Array.isArray(arr) ? arr : [];
        const alerts = safeArr(inventory).filter((i: any) => (i.当前库存 || 0) < (i.安全库存 || 0)).length;
        setStats({ customers: safeArr(customers).length, vendors: safeArr(vendors).length, products: safeArr(products).length,
          salesOrders: safeArr(salesOrders).length, purchaseOrders: safeArr(purchaseOrders).length, inventoryAlerts: alerts });

        const so = safeArr(salesOrders);
        const totalContract = so.reduce((s: number, o: any) => s + Number(o.合同金额 || 0), 0);
        const totalReceived = so.reduce((s: number, o: any) => s + Number(o.已收款 || 0), 0);
        const totalUnpaid = so.reduce((s: number, o: any) => s + Number(o.未收款项 || 0), 0);
        setFinancial({ totalContract, totalReceived, totalUnpaid });

        const sortedSales = so.sort((a: any, b: any) => (b.日期 || '').localeCompare(a.日期 || ''));
        setRecentSales(sortedSales.slice(0, 5));

        const po = safeArr(purchaseOrders);
        const sortedPurchases = po.sort((a: any, b: any) => (b.日期 || '').localeCompare(a.日期 || ''));
        setRecentPurchases(sortedPurchases.slice(0, 5));
      } catch (e) { console.error('Failed to load dashboard:', e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">工作台</h1>
        <p className="text-xs text-gray-500 mt-0.5">上海申竭诚包装 · {dateStr}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* 快捷入口 */}
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">快捷入口</div>
          <div className="flex flex-wrap gap-2">
            <QuickAction label="新建销售单" href="/sales-orders" icon="📋" />
            <QuickAction label="新建采购单" href="/purchase-orders" icon="📦" />
            <QuickAction label="客户管理" href="/customers" icon="👥" />
            <QuickAction label="产品管理" href="/products" icon="🏷️" />
            <QuickAction label="库存查看" href="/inventory" icon="📦" />
            <QuickAction label="报表中心" href="/reports" icon="📊" />
          </div>
        </div>

        {/* 财务汇总 */}
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">销售财务汇总</div>
          <div className="grid grid-cols-3 gap-3">
            <MoneyCard label="合同总额" value={financial.totalContract} color="text-gray-800" />
            <MoneyCard label="已收款" value={financial.totalReceived} color="text-green-600" />
            <MoneyCard label="未收款" value={financial.totalUnpaid} color={financial.totalUnpaid > 0 ? 'text-red-600' : 'text-green-600'} />
          </div>
        </div>

        {/* 数据概览 */}
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">数据概览</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="客户" value={stats.customers} color="text-blue-600" href="/customers" />
            <StatCard label="供应商" value={stats.vendors} color="text-green-600" href="/vendors" />
            <StatCard label="产品" value={stats.products} color="text-purple-600" href="/products" />
            <StatCard label="销售订单" value={stats.salesOrders} color="text-orange-600" href="/sales-orders" />
            <StatCard label="采购订单" value={stats.purchaseOrders} color="text-teal-600" href="/purchase-orders" />
            <StatCard label="库存预警" value={stats.inventoryAlerts} color={stats.inventoryAlerts > 0 ? 'text-red-600' : 'text-gray-400'} href="/inventory" sub="低于安全库存" />
          </div>
        </div>

        {/* 最近订单 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider">最近销售订单</div>
              <Link href="/sales-orders" className="text-xs text-blue-600 hover:underline">查看全部 →</Link>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">加载中...</div>
              ) : recentSales.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">暂无销售订单 · <Link href="/sales-orders" className="text-blue-600 hover:underline">去新建</Link></div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">单号</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">客户</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">金额</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">收款</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map(order => <OrderRow key={order.id} order={order} type="sales" />)}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider">最近采购订单</div>
              <Link href="/purchase-orders" className="text-xs text-blue-600 hover:underline">查看全部 →</Link>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">加载中...</div>
              ) : recentPurchases.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">暂无采购订单 · <Link href="/purchase-orders" className="text-blue-600 hover:underline">去新建</Link></div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">单号</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">供应商</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">金额</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">付款</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPurchases.map(order => <OrderRow key={order.id} order={order} type="purchase" />)}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* 功能模块 */}
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">功能模块</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/customers', label: '客户管理', icon: '👥', desc: '客户信息管理' },
              { href: '/vendors', label: '供应商管理', icon: '🏭', desc: '供应商信息' },
              { href: '/sales-orders', label: '销售订单', icon: '📋', desc: '销售单据管理' },
              { href: '/purchase-orders', label: '采购订单', icon: '📦', desc: '采购单据管理' },
              { href: '/inventory', label: '库存管理', icon: '📦', desc: '库存查询盘点' },
              { href: '/products', label: '产品管理', icon: '🏷️', desc: '产品信息维护' },
              { href: '/reports', label: '报表中心', icon: '📊', desc: '经营数据分析' },
            ].map(mod => (
              <Link key={mod.href} href={mod.href}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                  <div className="text-2xl mb-2">{mod.icon}</div>
                  <div className="font-medium text-sm text-gray-800">{mod.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{mod.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Sidebar>
      <DashboardContent />
    </Sidebar>
  );
}
