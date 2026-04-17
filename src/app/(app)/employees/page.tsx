'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import { Employee, User, ROLES, Role, RoleKey, Permission } from '@/lib/types';
import { EmployeeRepo, UserRepo } from '@/lib/repo';
import { hashPassword } from '@/lib/auth';

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
  const [activeTab, setActiveTab] = useState<'employees' | 'users'>('employees');
  const [data, setData] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Employee | undefined>();
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permEmployee, setPermEmployee] = useState<Employee | undefined>();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [resetPwdModalOpen, setResetPwdModalOpen] = useState(false);
  const [resetPwdUser, setResetPwdUser] = useState<User | undefined>();
  const [newPassword, setNewPassword] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      setData(await EmployeeRepo.findAll());
      setUsers(await UserRepo.findAll());
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(e => {
    const q = search.toLowerCase();
    const roleName = ROLES.find(r => r.key === e.roleKey)?.name || '';
    return !q || [e.name, roleName, e.phone, e.email].some(v => v?.toLowerCase().includes(q));
  });

  // ========== 用户账号相关 ==========
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return !q || [u.username, u.employeeId].some(v => v?.toLowerCase().includes(q));
  });

  const employees = data; // 重命名方便使用
  const getEmployeeName = (empId: string) => employees.find(e => e.id === empId)?.name || empId;

  const handleCreateUser = async (username: string, employeeId: string, roleKey: RoleKey, password: string) => {
    const passwordHash = await hashPassword(password);
    await UserRepo.create({ username, passwordHash, employeeId, roleKey, status: 'active', createdAt: new Date().toISOString().split('T')[0] });
    await loadData();
    setUserModalOpen(false);
  };

  const handleResetPassword = async () => {
    if (!resetPwdUser || !newPassword) return;
    const passwordHash = await hashPassword(newPassword);
    await UserRepo.updatePassword(resetPwdUser.id, passwordHash);
    await loadData();
    setResetPwdModalOpen(false);
    setNewPassword('');
    alert('密码已重置！');
  };

  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await UserRepo.update(user.id, { status: newStatus });
    await loadData();
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('确定删除该账号？')) return;
    await UserRepo.delete(id);
    await loadData();
  };

  const userColumns: Column<User>[] = [
    { key: 'username', label: '用户名', sortable: true },
    { key: 'employeeId', label: '关联员工', sortable: true, render: (u: User) => getEmployeeName(u.employeeId) },
    { key: 'roleKey', label: '角色', sortable: true, render: (u: User) => <RoleTag roleKey={u.roleKey} /> },
    { key: 'status', label: '状态', sortable: true, render: (u: User) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${u.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {u.status === 'active' ? '正常' : '停用'}
      </span>
    )},
    { key: 'createdAt', label: '创建日期' },
    { key: 'lastLogin', label: '最后登录', render: (u: User) => u.lastLogin || '-' },
    { key: 'actions', label: '操作', render: (u: User) => (
      <div className="flex gap-1">
        <button onClick={(ev) => { ev.stopPropagation(); setResetPwdUser(u); setNewPassword(''); setResetPwdModalOpen(true); }} className="px-2 py-0.5 text-xs border rounded hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600">重置密码</button>
        <button onClick={(ev) => { ev.stopPropagation(); handleToggleUserStatus(u); }} className={`px-2 py-0.5 text-xs border rounded hover:bg-gray-50 ${u.status === 'active' ? 'hover:border-gray-400 hover:text-gray-600' : 'hover:border-green-300 hover:text-green-600'}`}>{u.status === 'active' ? '停用' : '启用'}</button>
        <button onClick={(ev) => { ev.stopPropagation(); handleDeleteUser(u.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
      </div>
    )},
  ];

  // ========== 员工列表相关 ==========
  const filteredEmployees = data.filter(e => {
    const q = search.toLowerCase();
    const roleName = ROLES.find(r => r.key === e.roleKey)?.name || '';
    return !q || [e.name, roleName, e.phone, e.email].some(v => v?.toLowerCase().includes(q));
  });

  const handleSaveEmployee = async (form: Omit<Employee, 'id'>) => {
    if (editingItem?.id) {
      await EmployeeRepo.update(editingItem.id, form);
    } else {
      await EmployeeRepo.create(form);
    }
    await loadData();
    setEditingItem(undefined);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('确定删除该员工？')) return;
    await EmployeeRepo.delete(id);
    await loadData();
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
        <button onClick={(ev) => { ev.stopPropagation(); handleDeleteEmployee(e.id); }} className="px-2 py-0.5 text-xs border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600">删除</button>
      </div>
    )},
  ];

  const openPermModal = (emp: Employee) => {
    setPermEmployee(emp);
    setPermModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="员工 & 账号管理"
        subtitle="员工信息与系统登录账号管理"
        searchPlaceholder="搜索..."
        onSearch={setSearch}
        actions={activeTab === 'employees' ? [
          { label: '新建员工', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingItem(undefined); setModalOpen(true); } },
        ] : [
          { label: '新建账号', icon: '＋', variant: 'primary' as const, onClick: () => { setEditingUser(undefined); setUserModalOpen(true); } },
        ]}
      />

      {/* Tab切换 */}
      <div className="bg-white px-5 pt-4 border-b">
        <div className="flex gap-1">
          <button onClick={() => setActiveTab('employees')} className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors ${activeTab === 'employees' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            员工列表 ({data.length})
          </button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors ${activeTab === 'users' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            登录账号 ({users.length})
          </button>
        </div>
      </div>
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
        {activeTab === 'employees' ? (
          <>
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
              data={filteredEmployees}
              loading={loading}
              emptyMessage="暂无员工数据"
            />
          </>
        ) : (
          <div className="mt-4">
            <OrderTable
              columns={userColumns}
              data={filteredUsers}
              loading={loading}
              emptyMessage="暂无账号数据"
            />
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <div className="font-medium">💡 提示</div>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• 每个员工可以关联多个系统账号</li>
                <li>• 密码默认: admin123，建议创建后立即修改</li>
                <li>• 停用账号后该用户无法登录系统</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <EmployeeFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(undefined); }}
        onSave={handleSaveEmployee}
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

      {/* 用户账号Modal */}
      <UserFormModal
        open={userModalOpen}
        onClose={() => { setUserModalOpen(false); setEditingUser(undefined); }}
        onSave={handleCreateUser}
        employees={employees}
      />

      {/* 重置密码Modal */}
      <ResetPwdModal
        open={resetPwdModalOpen}
        onClose={() => { setResetPwdModalOpen(false); setResetPwdUser(undefined); setNewPassword(''); }}
        user={resetPwdUser}
        newPassword={newPassword}
        onChange={setNewPassword}
        onConfirm={handleResetPassword}
      />
    </div>
  );
}

// ========== 用户账号表单Modal ==========
function UserFormModal({ open, onClose, onSave, employees }: {
  open: boolean;
  onClose: () => void;
  onSave: (username: string, employeeId: string, roleKey: RoleKey, password: string) => void;
  employees: Employee[];
}) {
  const [username, setUsername] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [roleKey, setRoleKey] = useState<RoleKey>('viewer');
  const [password, setPassword] = useState('admin123');

  useEffect(() => {
    if (open) {
      setUsername('');
      setEmployeeId(employees[0]?.id || '');
      setRoleKey('viewer');
      setPassword('admin123');
    }
  }, [open, employees]);

  if (!open) return null;

  const handleSave = () => {
    if (!username.trim()) { alert('请填写用户名'); return; }
    if (!employeeId) { alert('请选择关联员工'); return; }
    if (password.length < 6) { alert('密码长度至少6位'); return; }
    onSave(username.trim(), employeeId, roleKey, password);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">新建登录账号</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">用户名 <span className="text-red-500">*</span></label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="登录用户名" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">关联员工 <span className="text-red-500">*</span></label>
            <select value={employeeId} onChange={e => setEmployeeId(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
              <option value="">请选择员工</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({ROLES.find(r => r.key === emp.roleKey)?.name})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">角色权限</label>
            <select value={roleKey} onChange={e => setRoleKey(e.target.value as RoleKey)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white">
              {ROLES.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">初始密码 <span className="text-red-500">*</span></label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="密码" />
            <div className="mt-1 text-xs text-yellow-600">默认密码: admin123，建议创建后立即修改</div>
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">创建账号</button>
        </div>
      </div>
    </div>
  );
}

// ========== 重置密码Modal ==========
function ResetPwdModal({ open, onClose, user, newPassword, onChange, onConfirm }: {
  open: boolean;
  onClose: () => void;
  user: User | undefined;
  newPassword: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
}) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">重置密码 - {user.username}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">新密码</label>
            <input type="text" value={newPassword} onChange={e => onChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="请输入新密码" />
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={onConfirm} disabled={newPassword.length < 6} className="px-4 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50">确认重置</button>
        </div>
      </div>
    </div>
  );
}
