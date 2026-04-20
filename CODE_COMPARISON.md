# ERP系统代码层面深度对比分析

## 1. 架构模式对比

### ERPClaw 架构
```python
# 使用Query Builder模式
q = (Q.from_(_t_sales_order)
     .select(_t_sales_order.star)
     .where(_t_sales_order.status == ValueWrapper("draft"))
     .where(_t_sales_order.company_id == P()))
conn.execute(q.get_sql(), (company_id,))
```

**特点：**
- 纯Python，无ORM依赖
- Query Builder模式防止SQL注入
- PyPika库实现类型安全的SQL构建
- 所有操作通过`db_query.py`统一入口

### 我们的架构
```typescript
// TypeScript + DataService模式
const result = await DataService.create(TABLE_IDS.salesOrders, data);
const updated = await this.findAll();
```

**特点：**
- 前后端分离，API Routes
- 通过HTTP调用飞书Bitable API
- Repo模式封装数据访问
- 前端直接调用HTTP API

---

## 2. 数据模型对比

### ERPClaw 完整字段
```python
# 销售订单表结构
class SalesOrder:
    id: str (UUID)
    company_id: str
    customer_id: str
    order_date: date
    delivery_date: date
    total_amount: Decimal
    tax_amount: Decimal
    grand_total: Decimal
    status: "draft"|"submitted"|"cancelled"
    # 审计字段
    created_at: datetime
    updated_at: datetime
    created_by: str
```

### 我们的字段
```typescript
// 销售订单类型
interface SalesOrder {
    id: string;
    单号: string;
    客户编号: string;
    客户名称: string;
    日期: string;
    合同金额: number;
    已收款: number;
    未收款项: number;
    收款状态: string;
    送货状态: string;
    ...
}
```

### 关键差异

| 维度 | ERPClaw | 我们 |
|------|---------|------|
| **ID类型** | UUID（全球唯一） | 自动生成record_id |
| **金额精度** | Decimal（高精度） | number（浮点） |
| **状态机** | draft→submit→cancel | 手动状态字段 |
| **审计字段** | created_at, created_by | 无 |
| **公司关联** | company_id必填 | 无公司概念 |

---

## 3. 销售订单创建流程对比

### ERPClaw 流程
```python
def add_sales_order(conn, args):
    # 1. 验证必填字段
    if not args.customer_id:
        err("--customer-id is required")
    if not args.items:
        err("--items is required (JSON array)")
    
    # 2. 验证关联数据存在
    cust = conn.execute(cq.get_sql(), (args.customer_id,)).fetchone()
    if not cust:
        err(f"Active customer {args.customer_id} not found")
    
    # 3. 计算金额（含税）
    total_amount, item_rows = _calculate_line_items(...)
    tax_amount, _ = _calculate_tax(...)
    grand_total = round_currency(total_amount + tax_amount)
    
    # 4. 生成UUID
    so_id = str(uuid.uuid4())
    
    # 5. 插入主表
    so_ins = Q.into(_t_sales_order).insert(...)
    conn.execute(so_ins.get_sql(), (...))
    
    # 6. 批量插入明细
    for row in item_rows:
        conn.execute(soi_ins_sql, (...))
    
    # 7. 审计日志
    audit(conn, "erpclaw-selling", "add-sales-order", "sales_order", so_id, ...)
    
    # 8. 提交事务
    conn.commit()
```

### 我们的流程
```typescript
async create(data: Omit<SalesOrder, 'id'>): Promise<SalesOrder> {
    // 1. 检查单号唯一性
    if (all.find(s => s.单号 === data.单号)) 
        throw new Error(`单号已存在`);
    
    // 2. 直接插入Bitable
    await DataService.create(TABLE_IDS.salesOrders, bitableFields);
    
    // 3. 返回最新记录
    const updated = await this.findAll();
    return updated[updated.length - 1];
}
```

### 差距分析

| 步骤 | ERPClaw | 我们 | 改进建议 |
|------|---------|------|----------|
| 验证关联实体 | ✅ 检查customer存在 | ❌ 只检查单号 | 添加客户/供应商存在性验证 |
| 金额计算 | ✅ 自动含税计算 | ❌ 前端计算 | 后端统一计算 |
| 事务提交 | ✅ conn.commit() | ❌ API自动 | 保持现状（Bitable封装） |
| 审计日志 | ✅ 每次操作记录 | ❌ 无 | 添加操作日志表 |
| 状态机 | ✅ draft→submit | ❌ 手动状态 | 参考状态机设计 |

---

## 4. 库存管理对比

### ERPClaw 库存流程
```python
# 库存流水(SLE - Stock Ledger Entry)
class StockLedgerEntry:
    id: str
    voucher_type: "delivery_note"|"sales_invoice"|...
    voucher_id: str
    item_id: str
    warehouse_id: str
    quantity: Decimal
    rate: Decimal
    amount: Decimal
    posting_date: date
    is_cancelled: bool

# 自动生成库存流水
def insert_sle_entries(conn, voucher_type, voucher_id, items):
    for item in items:
        # 验证批次/序列号
        # 计算金额
        # 插入SLE
        conn.execute(ins_sql, (...))
```

### 我们的库存
```typescript
interface Inventory {
    id: string;
    产品编号: string;
    产品名称: string;
    仓库: string;
    当前库存: number;
    安全库存: number;
    // 缺少批次/序列号
    // 缺少库存流水
}
```

### 差距分析

| 功能 | ERPClaw | 我们 | 优先级 |
|------|---------|------|--------|
| 批次管理 | ✅ | ❌ | P2 |
| 序列号 | ✅ | ❌ | P2 |
| 库存流水 | ✅ 完整SLE | ❌ | P1 |
| 库龄分析 | ✅ | ❌ | P1 |
| 库位管理 | ✅ 多仓库 | ✅ 基础 | - |

---

## 5. 采购订单流程对比

### ERPClaw 采购流程
```
询价单(RFQ) → 供应商报价 → 采购订单(PO) → 采购收货 → 采购发票
```

### 我们采购流程
```
采购订单 → 收货单 → 发票 → 付款单
```

### ERPClaw RFQ功能
```python
# 询价单
def add_rfq(conn, args):
    # 创建询价请求
    # 获取供应商报价
    # 比价
    # 转为PO
```

---

## 6. 财务模块对比（核心差距）

### ERPClaw GL
```python
# 复式记账
class GLEntry:
    voucher_type: str
    voucher_id: str
    account_id: str
    debit: Decimal
    credit: Decimal
    cost_center_id: str
    posting_date: date
    narration: str

# 自动生成借贷方
def create_perpetual_inventory_gl(conn, voucher, items, warehouse_id):
    # 销售时：
    # 借：应收账款 100
    # 贷：销售收入 85
    # 贷：应交税金 15
    
    # 同时：
    # 借：销售成本 60
    # 贷：库存商品 60
```

### 我们系统
- ❌ 无总账(GL)
- ❌ 无复式记账
- ❌ 无科目表
- ❌ 无凭证概念

---

## 7. 代码质量对比

### ERPClaw 优点

1. **类型安全**
```python
from decimal import Decimal, InvalidOperation
grand_total = round_currency(total_amount + tax_amount)
```

2. **参数化查询防注入**
```python
Q.from_(_t_customer).where(_t_customer.id == P())
```

3. **事务管理**
```python
conn.commit()  # 或 conn.rollback()
```

4. **审计追踪**
```python
audit(conn, "module", "action", "table", record_id, new_values={...})
```

5. **验证完整**
```python
if not args.customer_id:
    err("--customer-id is required")
```

### 我们的改进点

1. **缺少参数验证** - 可以添加
```typescript
function validateSalesOrder(data: Partial<SalesOrder>) {
    const errors: string[] = [];
    if (!data.客户名称) errors.push('客户名称必填');
    if (!data.单号) errors.push('单号必填');
    if (errors.length > 0) throw new Error(errors.join(', '));
}
```

2. **缺少审计日志** - 建议添加Bitable记录表
```typescript
interface AuditLog {
    id: string;
    table: string;
    record_id: string;
    action: 'create' | 'update' | 'delete';
    operator: string;
    timestamp: string;
    changes: string; // JSON
}
```

3. **金额精度** - 使用整数存储（分）
```typescript
合同金额: number; // 分，整数存储避免浮点精度问题
```

4. **唯一性验证** - 需要更严格的检查
```typescript
// 检查单号格式
if (!/^XS\d{11}$/.test(data.单号)) {
    throw new Error('单号格式不正确');
}
```

---

## 8. 具体改进建议

### 短期改进 (1-2周)

1. **添加验证层**
```typescript
// src/lib/validators.ts
export function validateCustomer(data: Partial<Customer>): string[] {
    const errors: string[] = [];
    if (!data.客户名称) errors.push('客户名称必填');
    if (data.电话 && !/^\d+$/.test(data.电话)) errors.push('电话格式错误');
    return errors;
}
```

2. **添加审计日志表**
```typescript
// 在Bitable创建审计表
const AuditLogRepo = {
    async log(action: string, table: string, recordId: string, changes: object) {
        await DataService.create(TABLE_IDS.auditLogs, {
            操作: action,
            表名: table,
            记录ID: recordId,
            变更内容: JSON.stringify(changes),
            操作时间: new Date().toISOString(),
            操作人: 'system'
        });
    }
};
```

3. **金额统一为分**
```typescript
// 所有金额字段改为分
合同金额: number; // 单位：分
已收款: number;  // 单位：分

// 格式化显示
function formatMoney(cents: number): string {
    return (cents / 100).toFixed(2);
}
```

### 中期改进 (1个月)

4. **添加工序管理** - 完善施工单流程
5. **添加批次/序列号** - 库存管理增强
6. **添加库存流水** - 完整的进出库记录

### 长期改进 (2-3个月)

7. **财务报表** - P&L, Balance Sheet
8. **账龄分析** - AR/AP Aging
9. **复式记账** - GL模块

---

## 9. 代码示例对比

### ERPClaw 查询
```python
# 获取客户的未付款发票
def get_outstanding_invoices(conn, customer_id):
    q = (Q.from_(_t_sales_invoice)
         .select(_t_sales_invoice.star)
         .where(_t_sales_invoice.customer_id == P())
         .where(_t_sales_invoice.status == ValueWrapper("submitted"))
         .where(_t_sales_invoice.outstanding_amount > P()))
    return conn.execute(q.get_sql(), (customer_id, 0)).fetchall()
```

### 我们查询
```typescript
// 获取客户的未付款订单
async findUnpaidOrders(customerId: string) {
    const all = await this.findAll();
    return all.filter(o => 
        o.客户编号 === customerId && 
        o.收款状态 !== '全部收款'
    );
}
```

---

## 10. 总结

### ERPClaw 领先的地方
1. **完整的财务GL** - 复式记账
2. **审计追踪** - 每步操作可追溯
3. **状态机** - 严谨的草稿→提交→取消流程
4. **事务完整性** - 原子性操作
5. **数据验证** - 严格的参数检查

### 我们的优势
1. **云端协作** - 多人实时访问
2. **移动端** - 响应式设计
3. **飞书集成** - 直接在飞书使用
4. **实时同步** - 无需手动备份

### 优先改进项
1. 添加客户/供应商存在性验证
2. 添加审计日志表
3. 添加发票到期检查功能
4. 添加库存预警功能
5. 添加财务报表（P&L, Balance Sheet）
