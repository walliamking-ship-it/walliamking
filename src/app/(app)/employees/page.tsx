'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import { Employee, ROLES, Role, RoleKey, Permission } from '@/lib/types';
import { EmployeeRepo } from '@/lib/repo';

const ALL_PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: 'customer:view', label: '查看', group: '客户' },
  { key: 'customer:create', label: '新建', group: '客户' },
  { key: 'customer:edit', label: '编辑', group: '客户' },
  { key: 'customer:delete', label: '删除', group: '客户' },
  { key: 'vendor:view', label: '查看', group: '供应商' },
  { key: 'vendor:create', label: '新建', group: '供应商' },
  { key: 'vendor:edit', label: '编辑', group: '供应商' },
  { key: 'vendor:delete', label: '删除', group: '供应商' },
  { key: 'product:view', label: '查看', group: '产品' },
  { key: 'product:create', label: '新建', group: '产品' },
  { key: 'product:edit', label: '编辑', group: '产品' },
  { key: 'product:delete', label: '删除', group: '产品' },
  { key: 'sales:view', label: '查看', group: '销售订单' },
  { key: 'sales:create', label: '新建', group: '销售订单' },
  { key: 'sales:edit', label: '编辑', group: '销售订单' },
  { key: 'sales:delete', label: '删除', group: '销售订单' },
  { key: 'sales:approve', label: '审批', group: '销售订单' },
  { key: 'purchase:view', label: '查看', group: '采购订单' },
  { key: 'purchase:create', label: '新建', group: '采购订单' },
  { key: 'purchase:edit', label: '编辑', group: '采购订单' },
  { key: 'purchase:delete', label: '删除', group: '采购订单' },
  { key: 'purchase:approve', label: '审批', group: '采购订单' },
  { key: 'delivery:view', label: '查看', group: '送货单' },
  { key: 'delivery:create', label: '新建', group: '送货单' },
  { key: 'delivery:edit', label: '编辑', group: '送货单' },
  { key: 'delivery:delete', label: '删除', group: '送货单' },
  { key: 'receiving:view', label: '查看', group: '收货单' },
  { key: 'receiving:create', label: '新建', group: '收货单' },
  { key: 'receiving:edit', label: '编辑', group: '收货单' },
  { key: 'receiving:delete', label: '删除', group: '收货单' },
  { key: 'inventory:view', label: '查看', group: '库存' },
  { key: 'inventory:edit', label: '编辑', group: '库存' },
  { key: 'invoice:view', label: '查看', group: '发票' },
  { key: 'invoice:create', label: '新建', group: '发票' },
  { key: 'invoice:edit', label: '编辑', group: '发票' },
  { key: 'invoice:delete', label: '删除', group: '发票' },
  { key: 'report:view', label: '查看', group: '报表' },
  { key: 'report:export', label: '导出', group: '报表' },
  { key: 'settings:view', label: '查看', group: '系统设置' },
  { key: 'settings:edit', label: '编辑', group: '系统设置' },
  { key: 'employee:view', label: '查看', group: '员工管理' },
  { key: 'employee:create', label: '新建', group: '员工管理' },
  { key: 'employee:edit', label: '编辑', group: '员工管理' },
  { key: 'employee:delete', label: '删除', group: '员工管理' },
];

function RoleTag({ roleKey }: { roleKey: RoleKey }) {
  const role = ROLES.find(r => r.key === roleKey);
  const colors: Record<string, string> = {
    owner: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    sales_director: 'bg-green-100 text-green-700',
    sales: 'bg-emerald-100 text-emerald-700',
    purchase: 'bg-orange-100 text-orange-700',
    warehouse: 'bg-yellow-100 text-yellow-700',
    finance: 'bg-pink-100 text-pink-700',
    viewer: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${colors[roleKey] || 'bg-gray-100 text-gray-600'}`}>
      {role?.name || roleKey}
    </span>
  );
}

function PermissionModal({ open, onClose, employee, roles }: {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  roles: Role[];
}) {
  const [selectedRole, setSelectedRole] = useState<RoleKey>(employee.roleKey);
  const [customPerms, setCustomPerms] = useState<Set<Permission>>(new Set());
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedRole(employee.roleKey);
      setUseCustom(false);
      setCustomPerms(new Set());
    }
  }, [open, employee]);

  const currentRole = roles.find(r => r.key === selectedRole);
  const displayPerms = useCustom ? customPerms : new Set(currentRole?.permissions || []);

  const togglePerm = (perm: Permission) => {
    const next = new Set(customPerms);
    if (next.has(perm)) next.delete(perm); else next.add(perm);
    setCustomPerms(next);
  };

  const handleSave = () => {
    EmployeeRepo.update(employee.id, { roleKey: selectedRole });
    onClose();
  };

  if (!open) return null;

  const groups = ALL_PERMISSIONS.reduce((acc, p) => {
    if (!acc[p.group]) acc[p.group] = [];
    acc[p.group].push(p);
    return acc;
  }, {} as Record<string, typeof ALL_PERMISSIONS>);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">权限配置 - {employee.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-5">
          {/* 角色选择 */}
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">选择角色</div>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(role => (
                <button
                  key={role.key}
                  onClick={() => { setSelectedRole(role.key); setUseCustom(false); }}
                  className={`text-left px-3 py-2 rounded border text-xs transition-colors ${
                    selectedRole === role.key && !useCustom
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="font-medium">{role.name}</div>
                  <div className="text-gray-400 mt-0.5 leading-3">{role.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 权限明细 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xs font-medium text-gray-700">权限明细</div>
              <label className="flex items-center gap-1 text-xs text-orange-600 cursor-pointer">
                <input type="checkbox" checked={useCustom} onChange={e => setUseCustom(e.target.checked)} className="w-3 h-3 rounded" />
                自定义调整
              </label>
            </div>
            <div className="border rounded">
              {Object.entries(groups).map(([group, perms]) => (
                <div key={group} className="border-b last:border-b-0">
                  <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-600">{group}</div>
                  <div className="px-3 py-2 flex flex-wrap gap-1">
                    {perms.map(perm => {
                      const checked = displayPerms.has(perm.key);
                      return (
                        <label key={perm.key} className="flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => useCustom && togglePerm(perm.key)}
                            disabled={!useCustom}
                            className="w-3.5 h-3.5 rounded text-blue-600 disabled:opacity-50"
                          />
                          <span className={checked ? 'text-blue-700 font-medium' : 'text-gray-400'}>{perm.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

function EmployeeFormModal({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void;
  onSave: (item: Omit<Employee, 'id'>) => void;
  initial?: Employee;
}) {
  const [form, setForm] = useState<Partial<Employee>>({});
  useEffect(() => { setForm(initial || { status: '正常', roleKey: 'viewer' }); }, [initial, open]);
  if (!open) return null;

  const handleSave = () => {
    if (!form.name) { alert('请填写姓名'); return; }
    onSave(form as Omit<Employee, 'id'>);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial?.id ? '编辑员工' : '新建员工'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">姓名 <span className="text-red-500">*</span></label>
            <input type="text" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="姓名" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">角色</label>
            <select value={form.roleKey || 'viewer'} onChange={e => setForm(f => ({ ...f, roleKey: e.target.value as RoleKey }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
              {ROLES.map(r => <option key={r.key} value={r.key}>{r.name} - {r.description}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">电话</label>
            <input type="text" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="电话" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">邮箱</label>
            <input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="邮箱" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">状态</label>
            <select value={form.status || '正常'} onChange={e => setForm(f => ({ ...f, status: e.target.value as '正常' | '停用' }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
              <option value="正常">正常</option>
              <option value="停用">停用</option>
            </select>
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Employee | undefined>();
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permEmployee, setPermEmployee] = useState<Employee | undefined>();

  const loadData = async () => {
    setLoading(true);
    try { setData(await EmployeeRepo.findAll()); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(e => {
    const q = search.toLowerCase();
    const roleName = ROLES.find(r => r.key === e.roleKey)?.name || '';
    return !q || [e.name, roleName, e.phone, e.email].some(v => v?.toLowerCase().includes(q));
  });

  const handleSave = async (form: Omit<Employee, 'id'>) => {
    if (editingItem?.id) {
      await EmployeeRepo.update(editingItem.id, form);
    } else {
      await EmployeeRepo.create(form);
    }
    await loadData();
    setEditingItem(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该员工？')) return;
    await EmployeeRepo.delete(id);
    await loadData();
  };

  const openPermModal = (emp: Employee) => {
    setPermEmployee(emp);
    setPermModalOpen(true);
  };

  const columns: Column<Employee>[] = [
    { key: 'name', label: '姓名', sortable: true },
    { key: 'roleKey', label: '角色', sortable: true, render: (e: Employee) => <RoleTag roleKey={e.roleKey} /> },
    { key: 'phone', label: '电话' },
    { key: 'email', label: '邮箱' },
    { key: 'status', label: '状态', sortable: true, render: (e: Employee) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${e.status === '正常' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {e.status}
      </span>
    )},
    { key: 'actions', label: '操作', render: (e: Employee) => (
      <div className="flex gap-1">
        <button onClick={(ev) => { ev.stopPropagation(); openPermModal(e); }} className="px-2 py-0.5 text-xs border rounded hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600">权限</button>
        <button onClick={(ev) => { ev.stopPropagation(); setEditingItem(e); setModalOpen(true); }} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">编辑</button>
        <button onClick={(ev) => { ev.stopPropagation(); handleDelete(e.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
      </div>
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="员工管理"
        subtitle="企业内部员工账号与权限管理"
        searchPlaceholder="搜索 姓名 / 角色 / 电话 / 邮箱..."
        onSearch={setSearch}
        actions={[
          { label: '新建员工', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem(undefined); setModalOpen(true); } },
        ]}
      />
      <div className="flex-1 overflow-auto bg-white px-5 py-4">
        {/* 角色说明 */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {ROLES.map(role => (
            <div key={role.key} className="bg-gray-50 rounded p-2 text-xs">
              <div className="font-medium text-gray-700">{role.name}</div>
              <div className="text-gray-400 mt-0.5 leading-3">{role.description}</div>
            </div>
          ))}
        </div>
        <OrderTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="暂无员工数据"
        />
      </div>

      <EmployeeFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(undefined); }}
        onSave={handleSave}
        initial={editingItem}
      />

      {permEmployee && (
        <PermissionModal
          open={permModalOpen}
          onClose={() => { setPermModalOpen(false); setPermEmployee(undefined); }}
          employee={permEmployee}
          roles={ROLES}
        />
      )}
    </div>
  );
}
