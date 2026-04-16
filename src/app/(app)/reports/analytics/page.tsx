'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SalesOrder, SalesOrderItem, PurchaseOrder, PurchaseOrderItem, Product } from '@/lib/types';
import { SalesOrderRepo, SalesOrderItemRepo, PurchaseOrderRepo, PurchaseOrderItemRepo, ProductRepo } from '@/lib/repo';

type AnalyticsTab = 'customer' | 'product' | 'vendor';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#f59e0b', '#ef4444'];

interface CustomerKPI { 客户名称: string; 销售总额: number; 成本总额: number; 毛利: number; 毛利率: number; }
interface ProductKPI { 产品名称: string; 物料编码: string; 销售总额: number; 成本总额: number; 毛利: number; 毛利率: number; }
interface VendorKPI { 供应商名称: string; 采购总额: number; }

function exportToExcel(data: any[], filename: string) {
  const headers = Object.keys(data[0] || {});
  const csv = [headers.join(','), ...data.map(row => headers.map(h => {
    const v = row[h];
    return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
  }).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function SimpleBarChart({ data, dataKey, nameKey, title }: { data: any[]; dataKey: string; nameKey: string; title: string }) {
  return (
    <div className="border rounded p-4">
      <div className="text-sm font-medium text-gray-700 mb-3">{title}</div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.slice(0, 10)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={nameKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: any) => typeof v === 'number' ? v.toFixed(2) : v} />
          <Bar dataKey={dataKey} fill="#3b82f6" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SimplePieChart({ data, dataKey, nameKey, title }: { data: any[]; dataKey: string; nameKey: string; title: string }) {
  const total = data.reduce((s, d) => s + (d[dataKey] || 0), 0);
  return (
    <div className="border rounded p-4">
      <div className="text-sm font-medium text-gray-700 mb-3">{title}</div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data.slice(0, 8)}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.slice(0, 8).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v: any) => typeof v === 'number' ? v.toFixed(2) : v} />
        </PieChart>
      </ResponsiveContainer>
      {total > 0 && (
        <div className="text-center text-xs text-gray-500 mt-2">合计：¥{total.toFixed(2)}</div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState<AnalyticsTab>('customer');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-12-31');
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [salesItems, setSalesItems] = useState<SalesOrderItem[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseOrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sos, pos, sis, pis, prods] = await Promise.all([
        SalesOrderRepo.findAll(),
        PurchaseOrderRepo.findAll(),
        SalesOrderItemRepo.findAll(),
        PurchaseOrderItemRepo.findAll(),
        ProductRepo.findAll(),
      ]);
      setSalesOrders(sos);
      setPurchaseOrders(pos);
      setSalesItems(sis);
      setPurchaseItems(pis);
      setProducts(prods);
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const filteredSales = salesOrders.filter(s => s.日期 >= dateFrom && s.日期 <= dateTo);
  const filteredPurchase = purchaseOrders.filter(p => p.日期 >= dateFrom && p.日期 <= dateTo);

  // 按客户汇总
  const customerData: CustomerKPI[] = (() => {
    const map = new Map<string, { sales: number; cost: number }>();
    for (const so of filteredSales) {
      const entry = map.get(so.客户名称) || { sales: 0, cost: 0 };
      entry.sales += so.合同金额;
      // 估算成本：使用产品采购价
      const items = salesItems.filter(i => i.销售订单id === so.id);
      entry.cost += items.reduce((s, i) => {
        const prod = products.find(p => p.id === i.产品id);
        return s + (prod ? prod.purchasePrice * i.数量 : 0);
      }, 0);
      map.set(so.客户名称, entry);
    }
    return Array.from(map.entries()).map(([name, v]) => ({
      客户名称: name,
      销售总额: v.sales,
      成本总额: v.cost,
      毛利: v.sales - v.cost,
      毛利率: v.sales > 0 ? (v.sales - v.cost) / v.sales * 100 : 0,
    })).sort((a, b) => b.销售总额 - a.销售总额);
  })();

  // 按产品汇总
  const productData: ProductKPI[] = (() => {
    const map = new Map<string, { sales: number; cost: number; code: string }>();
    for (const item of salesItems) {
      const so = salesOrders.find(s => s.id === item.销售订单id);
      if (!so || so.日期 < dateFrom || so.日期 > dateTo) continue;
      const entry = map.get(item.产品名称) || { sales: 0, cost: 0, code: item.物料编码 };
      entry.sales += item.金额;
      const prod = products.find(p => p.id === item.产品id);
      entry.cost += prod ? prod.purchasePrice * item.数量 : 0;
      map.set(item.产品名称, entry);
    }
    return Array.from(map.entries()).map(([name, v]) => ({
      产品名称: name,
      物料编码: v.code,
      销售总额: v.sales,
      成本总额: v.cost,
      毛利: v.sales - v.cost,
      毛利率: v.sales > 0 ? (v.sales - v.cost) / v.sales * 100 : 0,
    })).sort((a, b) => b.销售总额 - a.销售总额);
  })();

  // 按供应商汇总
  const vendorData: VendorKPI[] = (() => {
    const map = new Map<string, number>();
    for (const po of filteredPurchase) {
      map.set(po.供应商名称, (map.get(po.供应商名称) || 0) + po.合同金额);
    }
    return Array.from(map.entries()).map(([name, total]) => ({
      供应商名称: name,
      采购总额: total,
    })).sort((a, b) => b.采购总额 - a.采购总额);
  })();

  const tabs = [
    { label: '按客户', active: tab === 'customer', onClick: () => setTab('customer') },
    { label: '按产品', active: tab === 'product', onClick: () => setTab('product') },
    { label: '按供应商', active: tab === 'vendor', onClick: () => setTab('vendor') },
  ];

  const totalSales = customerData.reduce((s, d) => s + d.销售总额, 0);
  const totalCost = customerData.reduce((s, d) => s + d.成本总额, 0);
  const totalProfit = customerData.reduce((s, d) => s + d.毛利, 0);
  const totalMargin = totalSales > 0 ? totalProfit / totalSales * 100 : 0;

  const currentData = tab === 'customer' ? customerData : tab === 'product' ? productData : vendorData;
  const dataKey = tab === 'customer' ? '销售总额' : tab === 'product' ? '销售总额' : '采购总额';
  const nameKey = tab === 'customer' ? '客户名称' : tab === 'product' ? '产品名称' : '供应商名称';

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="管理看板"
        subtitle="多维度盈亏分析"
        actions={[
          { label: '导出Excel', icon: '↑', variant: 'default' as const, onClick: () => {
            if (currentData.length > 0) exportToExcel(currentData, `分析报表_${new Date().toISOString().slice(0,10)}`);
          }},
        ]}
        tabs={tabs}
      />

      {/* 日期筛选 */}
      <div className="px-5 py-3 bg-white border-b flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">日期范围：</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:border-blue-500 focus:outline-none" />
          <span className="text-gray-400">至</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:border-blue-500 focus:outline-none" />
        </div>
        {tab !== 'vendor' && (
          <div className="flex gap-6 ml-4">
            <div className="text-xs"><span className="text-gray-500">销售额：</span><span className="font-mono text-blue-700 font-medium">¥{totalSales.toFixed(2)}</span></div>
            {tab === 'customer' && (<><div className="text-xs"><span className="text-gray-500">成本：</span><span className="font-mono text-orange-600 font-medium">¥{totalCost.toFixed(2)}</span></div>
            <div className="text-xs"><span className="text-gray-500">毛利：</span><span className="font-mono text-green-600 font-medium">¥{totalProfit.toFixed(2)}</span></div>
            <div className="text-xs"><span className="text-gray-500">毛利率：</span><span className="font-mono text-purple-600 font-medium">{totalMargin.toFixed(1)}%</span></div></>)}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1 text-gray-400">加载中...</div>
      ) : (
        <div className="flex-1 overflow-auto p-5 bg-gray-50 space-y-5">
          {/* 图表行 */}
          <div className="grid grid-cols-2 gap-4">
            <SimpleBarChart data={currentData} dataKey={dataKey} nameKey={nameKey} title={tab === 'customer' ? '客户销售额TOP10' : tab === 'product' ? '产品销售额TOP10' : '供应商采购额TOP10'} />
            <SimplePieChart data={currentData} dataKey={dataKey} nameKey={nameKey} title={tab === 'customer' ? '客户销售占比' : tab === 'product' ? '产品销售占比' : '供应商采购占比'} />
          </div>

          {/* 汇总表 */}
          <div className="bg-white rounded border overflow-auto">
            <div className="px-4 py-3 border-b">
              <span className="text-sm font-medium text-gray-700">
                {tab === 'customer' ? '客户维度' : tab === 'product' ? '产品维度' : '供应商维度'} 明细表
              </span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  {tab === 'customer' && <th className="px-3 py-2 font-medium">#</th>}
                  {tab === 'customer' && <th className="px-3 py-2 font-medium">客户名称</th>}
                  {tab === 'product' && <th className="px-3 py-2 font-medium">#</th>}
                  {tab === 'product' && <th className="px-3 py-2 font-medium">产品名称</th>}
                  {tab === 'product' && <th className="px-3 py-2 font-medium">物料编码</th>}
                  {tab === 'vendor' && <th className="px-3 py-2 font-medium">#</th>}
                  {tab === 'vendor' && <th className="px-3 py-2 font-medium">供应商名称</th>}
                  {tab !== 'vendor' && <th className="px-3 py-2 font-medium text-right">销售额</th>}
                  {tab !== 'vendor' && <th className="px-3 py-2 font-medium text-right">成本</th>}
                  {tab !== 'vendor' && <th className="px-3 py-2 font-medium text-right">毛利</th>}
                  {tab !== 'vendor' && <th className="px-3 py-2 font-medium text-right">毛利率</th>}
                  {tab === 'vendor' && <th className="px-3 py-2 font-medium text-right">采购总额</th>}
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 && (
                  <tr><td colSpan={10} className="px-3 py-8 text-center text-gray-400">暂无数据</td></tr>
                )}
                {currentData.map((row, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                    {'客户名称' in row && <td className="px-3 py-2 font-medium">{row.客户名称}</td>}
                    {'产品名称' in row && <td className="px-3 py-2 font-medium">{row.产品名称}</td>}
                    {'物料编码' in row && <td className="px-3 py-2 font-mono text-gray-500">{row.物料编码}</td>}
                    {'供应商名称' in row && <td className="px-3 py-2 font-medium">{row.供应商名称}</td>}
                    {'销售总额' in row && <td className="px-3 py-2 text-right font-mono text-blue-700">¥{row.销售总额.toFixed(2)}</td>}
                    {'成本总额' in row && <td className="px-3 py-2 text-right font-mono text-orange-600">¥{row.成本总额.toFixed(2)}</td>}
                    {'毛利' in row && <td className="px-3 py-2 text-right font-mono text-green-600">¥{row.毛利.toFixed(2)}</td>}
                    {'毛利率' in row && <td className="px-3 py-2 text-right font-mono text-purple-600">{row.毛利率.toFixed(1)}%</td>}
                    {'采购总额' in row && <td className="px-3 py-2 text-right font-mono text-blue-700">¥{row.采购总额.toFixed(2)}</td>}
                  </tr>
                ))}
              </tbody>
              {currentData.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-50 font-medium border-t-2">
                    <td className="px-3 py-2" colSpan={tab === 'vendor' ? 2 : tab === 'product' ? 3 : 2}>合计</td>
                    {tab !== 'vendor' && <td className="px-3 py-2 text-right font-mono text-blue-700">¥{totalSales.toFixed(2)}</td>}
                    {tab !== 'vendor' && <td className="px-3 py-2 text-right font-mono text-orange-600">¥{totalCost.toFixed(2)}</td>}
                    {tab !== 'vendor' && <td className="px-3 py-2 text-right font-mono text-green-600">¥{totalProfit.toFixed(2)}</td>}
                    {tab !== 'vendor' && <td className="px-3 py-2 text-right font-mono text-purple-600">{totalMargin.toFixed(1)}%</td>}
                    {tab === 'vendor' && <td className="px-3 py-2 text-right font-mono text-blue-700">¥{vendorData.reduce((s, d) => s + d.采购总额, 0).toFixed(2)}</td>}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
