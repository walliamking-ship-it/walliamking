'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import OrderTable, { Column } from '@/components/OrderTable';
import { Approval, ApprovalType, ApprovalStatus, ApprovalNode, User } from '@/lib/types';
import { ApprovalRepo, UserRepo, EmployeeRepo, SalesOrderRepo, PurchaseOrderRepo } from '@/lib/repo';

const TYPE_LABELS: Record<ApprovalType, string> = {
  sales_order: '销售订单审核',
  purchase_order: '采购订单审核',
  payment: '付款审批',
  scrap: '报废审批',
};

const STATUS_COLORS: Record<ApprovalStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-yellow-50 text-yellow-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-400',
};

const STATUS_LABELS: Record<ApprovalStatus, string> = {
  draft: '草稿',
  pending: '审批中',
  approved: '已通过',
  rejected: '已拒绝',
  withdrawn: '已撤回',
};

function StatusTag({ status }: { status: ApprovalStatus }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function ApprovalFlow({ nodes, currentNode }: { nodes: ApprovalNode[]; currentNode: number }) {
  return (
    <div className="flex items-center gap-1">
      {nodes.map((node, idx) => (
        <div key={node.id} className="flex items-center gap-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
            ${node.状态 === 'approved' ? 'bg-green-500 text-white' :
              node.状态 === 'rejected' ? 'bg-red-500 text-white' :
              idx === currentNode ? 'bg-yellow-400 text-white' :
              'bg-gray-200 text-gray-500'}`}>
            {idx + 1}
          </div>
          {idx < nodes.length - 1 && (
            <div className={`w-4 h-0.5 ${node.状态 === 'approved' ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// 创建审批Modal
function CreateApprovalModal({ open, onClose, onCreated }: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [type, setType] = useState<ApprovalType>('sales_order');
  const [关联单据id, set关联单据id] = useState('');
  const [标题, set标题] = useState('');
  const [approvers, setApprovers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      UserRepo.findAll().then(setAllUsers);
      SalesOrderRepo.findAll().then(setSalesOrders);
      setType('sales_order');
      set关联单据id('');
      set标题('');
      setApprovers([]);
    }
  }, [open]);

  const selectedUserDetails = approvers.map(u => allUsers.find(au => au.username === u)).filter(Boolean) as User[];

  const handleCreate = async () => {
    if (!标题.trim() || approvers.length === 0) { alert('请填写标题并选择审批人'); return; }
    setLoading(true);
    try {
      const nodes: ApprovalNode[] = approvers.map((u, idx) => {
        const user = allUsers.find(au => au.username === u);
        return {
          id: String(Date.now() + idx),
          节点名称: `第${idx + 1}级审批`,
          审批人: u,
          审批人名称: user?.employeeId ? (allUsers.find(au => au.id === user.id)?.username || u) : u,
          状态: 'pending' as const,
        };
      });
      // 填充姓名
      for (const node of nodes) {
        const emp = (await EmployeeRepo.findAll()).find(e => e.id === allUsers.find(au => au.username === node.审批人)?.employeeId);
        if (emp) node.审批人名称 = emp.name;
      }

      const typeName = TYPE_LABELS[type];
      await ApprovalRepo.create({
        单号: `SP${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 900) + 100)}`,
        类型: type as ApprovalType,
        类型名称: typeName,
        关联单据id,
        关联单据号: 关联单据id ? (salesOrders.find(s => s.id === 关联单据id)?.单号 || 关联单据id) : '',
        标题,
        申请人: 'admin',
        申请人名称: '管理员',
        状态: 'draft',
        当前节点: 0,
        节点列表: nodes,
        申请时间: '',
        制单人: 'admin',
      });
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">新建审批</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">审批类型</label>
            <select value={type} onChange={e => setType(e.target.value as ApprovalType)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:border-blue-500 outline-none">
              <option value="sales_order">销售订单审核</option>
              <option value="purchase_order">采购订单审核</option>
              <option value="payment">付款审批</option>
              <option value="scrap">报废审批</option>
            </select>
          </div>
          {type === 'sales_order' && (
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">关联销售订单</label>
              <select value={关联单据id} onChange={e => { set关联单据id(e.target.value); set标题(`销售订单审核 - ${salesOrders.find(s => s.id === e.target.value)?.单号 || ''}`); }}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:border-blue-500 outline-none">
                <option value="">请选择</option>
                {salesOrders.map(s => <option key={s.id} value={s.id}>{s.单号} - {s.客户名称}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">审批标题 <span className="text-red-500">*</span></label>
            <input type="text" value={标题} onChange={e => set标题(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none"
              placeholder="请输入审批标题" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">审批人顺序 <span className="text-red-500">*</span></label>
            <div className="border rounded p-2 space-y-1 min-h-20">
              {selectedUserDetails.map((u, idx) => (
                <div key={u.id} className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">{idx + 1}</span>
                  <span className="flex-1">{u.username}</span>
                  <span className="text-gray-400">第{idx + 1}级审批</span>
                  <button onClick={() => setApprovers(a => a.filter(x => x !== u.username))} className="text-red-400 hover:text-red-600">✕</button>
                </div>
              ))}
              {selectedUserDetails.length === 0 && <div className="text-xs text-gray-400 text-center py-2">点击下方添加审批人</div>}
            </div>
            <select value="" onChange={e => { if (e.target.value && !approvers.includes(e.target.value)) setApprovers(a => [...a, e.target.value]); }}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:border-blue-500 outline-none mt-1">
              <option value="">＋ 添加审批人</option>
              {allUsers.filter(u => u.status === 'active' && !approvers.includes(u.username)).map(u => (
                <option key={u.id} value={u.username}>{u.username}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleCreate} disabled={loading} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">创建审批</button>
        </div>
      </div>
    </div>
  );
}

// 审批详情Modal
function ApprovalDetailModal({ approval, onClose, onAction }: {
  approval: Approval;
  onClose: () => void;
  onAction: () => void;
}) {
  const [意见, set意见] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [loading, setLoading] = useState(false);

  const currentNode = approval.节点列表[approval.当前节点];

  const handleAction = async () => {
    if (!actionType) return;
    setLoading(true);
    try {
      if (actionType === 'approve') await ApprovalRepo.approve(approval.id, currentNode.审批人, 意见);
      else await ApprovalRepo.reject(approval.id, currentNode.审批人, 意见);
      onAction();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">审批详情</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-5 space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-500">审批单号</div>
            <div className="text-blue-600 font-mono">{approval.单号}</div>
            <div className="text-gray-500">审批类型</div>
            <div>{approval.类型名称}</div>
            <div className="text-gray-500">关联单据</div>
            <div>{approval.关联单据号 || '-'}</div>
            <div className="text-gray-500">申请人</div>
            <div>{approval.申请人名称}</div>
            <div className="text-gray-500">申请时间</div>
            <div>{approval.申请时间 || '-'}</div>
            <div className="text-gray-500">当前状态</div>
            <div><StatusTag status={approval.状态} /></div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">标题</div>
            <div className="text-sm font-medium">{approval.标题}</div>
          </div>

          {/* 审批流程 */}
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">审批流程</div>
            <div className="space-y-2">
              {approval.节点列表.map((node, idx) => (
                <div key={node.id} className={`flex items-start gap-3 p-2 rounded border ${idx === approval.当前节点 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
                    ${node.状态 === 'approved' ? 'bg-green-500 text-white' :
                      node.状态 === 'rejected' ? 'bg-red-500 text-white' :
                      idx === approval.当前节点 ? 'bg-yellow-400 text-white' :
                      'bg-gray-200 text-gray-500'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{node.审批人名称}</span>
                      <StatusTag status={node.状态 as ApprovalStatus} />
                    </div>
                    {node.审批时间 && <div className="text-xs text-gray-400 mt-0.5">审批时间：{node.审批时间}</div>}
                    {node.审批意见 && <div className="text-xs text-gray-600 mt-1 p-1 bg-white rounded border">{node.审批意见}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 审批操作 */}
          {approval.状态 === 'pending' && (
            <div className="border-t pt-4 space-y-2">
              <div className="text-xs font-medium text-gray-600">当前审批操作</div>
              <div className="flex gap-2">
                <button onClick={() => setActionType('approve')} className={`flex-1 px-3 py-2 rounded text-sm font-medium border ${actionType === 'approve' ? 'bg-green-50 border-green-400 text-green-700' : 'border-gray-200 hover:bg-green-50'}`}>
                  ✓ 通过
                </button>
                <button onClick={() => setActionType('reject')} className={`flex-1 px-3 py-2 rounded text-sm font-medium border ${actionType === 'reject' ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-200 hover:bg-red-50'}`}>
                  ✕ 拒绝
                </button>
              </div>
              <textarea value={意见} onChange={e => set意见(e.target.value)} placeholder="审批意见（可选）"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none" rows={2} />
              {actionType && (
                <button onClick={handleAction} disabled={loading}
                  className={`w-full px-4 py-2 rounded text-sm font-medium text-white ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}>
                  {loading ? '处理中...' : actionType === 'approve' ? '确认通过' : '确认拒绝'}
                </button>
              )}
            </div>
          )}

          {/* 撤回按钮 */}
          {approval.状态 === 'draft' || approval.状态 === 'pending' ? (
            <div className="border-t pt-3 flex gap-2">
              <button onClick={async () => { await ApprovalRepo.withdraw(approval.id); onAction(); onClose(); }}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">撤回申请</button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  const [data, setData] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ApprovalType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | ''>('');
  const [myPendingOnly, setMyPendingOnly] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('admin');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailApproval, setDetailApproval] = useState<Approval | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      let approvals = await ApprovalRepo.findAll();
      if (myPendingOnly) {
        approvals = await ApprovalRepo.findPending(currentUser);
      }
      setData(approvals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUser(u.username || 'admin');
      } catch {}
    }
  }, [myPendingOnly]);

  const filtered = data.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || [a.单号, a.标题, a.申请人名称, a.关联单据号].some(v => v?.toLowerCase().includes(q));
    const matchType = !typeFilter || a.类型 === typeFilter;
    const matchStatus = !statusFilter || a.状态 === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const columns: Column<Approval>[] = [
    { key: '单号', label: '单号', sortable: true, render: (a: Approval) => (
      <span className="text-blue-600 font-mono text-xs hover:underline cursor-pointer" onClick={() => setDetailApproval(a)}>{a.单号}</span>
    )},
    { key: '标题', label: '标题', sortable: true, render: (a: Approval) => (
      <span className="hover:text-blue-600 cursor-pointer" onClick={() => setDetailApproval(a)}>{a.标题}</span>
    )},
    { key: '类型', label: '类型', render: (a: Approval) => (
      <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">{a.类型名称}</span>
    )},
    { key: '申请人', label: '申请人' },
    { key: '状态', label: '状态', sortable: true, render: (a: Approval) => <StatusTag status={a.状态} /> },
    { key: '进度', label: '进度', render: (a: Approval) => <ApprovalFlow nodes={a.节点列表} currentNode={a.当前节点} /> },
    { key: '申请时间', label: '申请时间' },
    { key: 'actions', label: '操作', render: (a: Approval) => (
      <div className="flex gap-1">
        <button onClick={() => setDetailApproval(a)} className="px-2 py-0.5 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">详情</button>
        {a.状态 === 'draft' && (
          <button onClick={async () => { await ApprovalRepo.submit(a.id); await loadData(); }} className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">提交</button>
        )}
      </div>
    )},
  ];

  const statusTabs = [
    { label: '全部', active: !statusFilter, onClick: () => setStatusFilter('') },
    { label: '草稿', active: statusFilter === 'draft', onClick: () => setStatusFilter('draft') },
    { label: '审批中', active: statusFilter === 'pending', onClick: () => setStatusFilter('pending') },
    { label: '已通过', active: statusFilter === 'approved', onClick: () => setStatusFilter('approved') },
    { label: '已拒绝', active: statusFilter === 'rejected', onClick: () => setStatusFilter('rejected') },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="审批中心"
        subtitle="销售订单/采购订单/付款审批"
        searchPlaceholder="搜索 单号 / 标题 / 申请人..."
        onSearch={setSearch}
        actions={[
          { label: '新建审批', icon: '＋', variant: 'primary' as const, onClick: () => setCreateOpen(true) },
        ]}
      />

      {/* 过滤器工具栏 */}
      <div className="px-5 py-3 bg-gray-50 border-b flex flex-wrap items-center gap-3">
        {/* 类型筛选 */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
          className="text-xs border border-gray-300 rounded px-2 py-1.5 bg-white focus:border-blue-500 outline-none">
          <option value="">全部类型</option>
          <option value="sales_order">销售订单审核</option>
          <option value="purchase_order">采购订单审核</option>
          <option value="payment">付款审批</option>
          <option value="scrap">报废审批</option>
        </select>

        {/* 状态tabs */}
        <div className="flex gap-1">
          {statusTabs.map(t => (
            <button key={t.label} onClick={t.onClick}
              className={`px-3 py-1 text-xs rounded border transition-colors ${t.active ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 我的待办 */}
        <label className="flex items-center gap-1.5 text-xs cursor-pointer ml-auto">
          <input type="checkbox" checked={myPendingOnly} onChange={e => setMyPendingOnly(e.target.checked)} className="w-3.5 h-3.5 rounded" />
          <span className="text-orange-600 font-medium">只看我的待办</span>
        </label>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <OrderTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="暂无审批记录"
        />
      </div>

      {createOpen && (
        <CreateApprovalModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={loadData}
        />
      )}

      {detailApproval && (
        <ApprovalDetailModal
          approval={detailApproval}
          onClose={() => setDetailApproval(null)}
          onAction={loadData}
        />
      )}
    </div>
  );
}
