import Link from 'next/link';

const modules = [
  { href: '/customers', label: '客户管理', color: 'bg-blue-500' },
  { href: '/vendors', label: '供应商管理', color: 'bg-green-500' },
  { href: '/materials', label: '物料管理', color: 'bg-yellow-500' },
  { href: '/products', label: '产品管理', color: 'bg-purple-500' },
  { href: '/processes', label: '工艺管理', color: 'bg-pink-500' },
  { href: '/workstations', label: '工序管理', color: 'bg-indigo-500' },
];

export default function HomePage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ERP管理系统</h1>
        <p className="text-gray-500 text-sm mt-1">印刷包装企业资源规划系统 — 数据存储于飞书多维表格</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(mod => (
          <Link key={mod.href} href={mod.href}>
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${mod.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                  {mod.label[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{mod.label}</h3>
                  <p className="text-sm text-gray-400">增删改查</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">系统说明</h2>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• 数据已连接<strong>飞书多维表格</strong>，增删改查实时保存</li>
          <li>• 基础数据模块（客户/供应商/物料/产品/工艺/工序）已完成</li>
          <li>• 后续依次开发：销售订单 → 生产工单 → 采购管理 → 仓库 → 财务</li>
        </ul>
      </div>
    </div>
  );
}
