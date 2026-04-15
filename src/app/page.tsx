'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { CustomerRepo, VendorRepo, ProductRepo, SalesOrderRepo, PurchaseOrderRepo } from '@/lib/repo';

function StatCard({ label, value, color, href }: { label: string; value: number; color: string; href: string }) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
            <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
          </div>
          <div className={`w-10 h-10 rounded-full ${color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
            <div className={`w-3 h-3 rounded-full ${color.replace('text-', 'bg-')}`} />
          </div>
        </div>
      </div>
    </Link>
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

function DashboardContent() {
  const [stats, setStats] = useState({ customers: 0, vendors: 0, products: 0, salesOrders: 0, purchaseOrders: 0 });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [customers, vendors, products, salesOrders, purchaseOrders] = await Promise.all([
          CustomerRepo.findAll(), VendorRepo.findAll(), ProductRepo.findAll(),
          SalesOrderRepo.findAll(), PurchaseOrderRepo.findAll(),
        ]);
        setStats({ customers: customers.length, vendors: vendors.length, products: products.length,
          salesOrders: salesOrders.length, purchaseOrders: purchaseOrders.length });
        const sorted = [...salesOrders].sort((a, b) => {
          const da = a.日期 ? new Date(a.日期).getTime() : 0;
          const db = b.日期 ? new Date(b.日期).getTime() : 0;
          return db - da;
        });
        setRecentSales(sorted.slice(0, 5));
      } catch (e) { console.error('Failed to load dashboard:', e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">工作台</h1>
        <p className="text-xs text-gray-500 mt-0.5">上海申竭诚包装 · 2026年4月15日 星期三</p>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">快捷入口</div>
          <div className="flex flex-wrap gap-2">
            <QuickAction label="新建销售单" href="/sales-orders" icon="📋" />
            <QuickAction label="新建采购单" href="/purchase-orders" icon="📦" />
            <QuickAction label="客户管理" href="/customers" icon="👥" />
            <QuickAction label="产品管理" href="/products" icon="🏷️" />
            <QuickAction label="库存查看" href="/inventory" icon="📦" />
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">数据概览</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard label="客户" value={stats.customers} color="text-blue-600" href="/customers" />
            <StatCard label="供应商" value={stats.vendors} color="text-green-600" href="/vendors" />
            <StatCard label="产品" value={stats.products} color="text-purple-600" href="/products" />
            <StatCard label="销售订单" value={stats.salesOrders} color="text-orange-600" href="/sales-orders" />
            <StatCard label="采购订单" value={stats.purchaseOrders} color="text-teal-600" href="/purchase-orders" />
          </div>
        </div>
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
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">日期</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">合同金额</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">收款状态</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">送货状态</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((order, i) => (
                    <tr key={order.id} className={`border-b border-gray-50 hover:bg-blue-50/30 ${i !== recentSales.length - 1 ? 'border-b' : ''}`}>
                      <td className="px-4 py-2.5"><Link href="/sales-orders" className="text-blue-600 font-mono text-xs hover:underline">{order.单号}</Link></td>
                      <td className="px-4 py-2.5 text-sm text-gray-700">{order.客户名称}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-500">{order.日期 || '-'}</td>
                      <td className="px-4 py-2.5 text-right text-sm font-mono text-gray-900">{order.合同金额 != null ? `¥${Number(order.合同金额).toFixed(2)}` : '-'}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${order.收款状态 === '全部收款' ? 'bg-green-50 text-green-700' : order.收款状态 === '部分收款' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'}`}>{order.收款状态 || '未收款'}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${order.送货状态 === '全部送货' ? 'bg-green-50 text-green-700' : order.送货状态 === '部分送货' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'}`}>{order.送货状态 || '未送货'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">功能模块</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/customers', label: '客户管理', icon: '👥', desc: '客户信息管理' },
              { href: '/vendors', label: '供应商管理', icon: '🏭', desc: '供应商信息' },
              { href: '/sales-orders', label: '销售订单', icon: '📋', desc: '销售单据管理' },
              { href: '/purchase-orders', label: '采购订单', icon: '📦', desc: '采购单据管理' },
              { href: '/processing-orders', label: '加工单', icon: '🏭', desc: '委托加工管理' },
              { href: '/inventory', label: '库存管理', icon: '📦', desc: '库存查询盘点' },
              { href: '/products', label: '产品管理', icon: '🏷️', desc: '产品信息维护' },
              { href: '/processes', label: '工艺工序', icon: '⚙️', desc: '生产工艺设置' },
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
