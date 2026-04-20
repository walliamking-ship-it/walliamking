# PLAN.md - ERP系统架构决策

## 技术栈

- **前端**: Next.js 16 (App Router) + React + TypeScript + TailwindCSS
- **后端**: Next.js API Routes (Node.js)
- **数据库**: 飞书Bitable (HfLfbLOE5aQCy5sZXHfc281FnDf)
- **部署**: 腾讯云VPS (124.222.108.162) + PM2 + nginx

## 数据流

```
浏览器 ←→ API Routes (/api/[entity]) ←→ 飞书Bitable API
              ↓
         DataService (客户端)
```

## 核心模块

| 模块 | 状态 | 说明 |
|------|------|------|
| 客户管理 | ✅ | 基础CRUD完成 |
| 供应商管理 | ✅ | 基础CRUD完成 |
| 产品管理 | ✅ | 基础CRUD完成 |
| 销售订单 | ✅ | 含明细表 |
| 采购订单 | ✅ | 含明细表 |
| 库存管理 | ✅ | 库存预警 |
| 施工单 | ✅ | 生产管理 |
| 送货单/收货单 | ✅ | 物流管理 |
| 发票/收款/付款 | ✅ | 财务管理 |

## 待优化项

1. **部署流程**: 当前tar打包部署有文件更新问题，考虑使用Git hooks
2. **缓存策略**: 浏览器JS/CSS缓存导致功能不更新
3. **认证系统**: 当前临时禁用，需要恢复并完善权限控制

## 文件结构

```
erp-system/
├── src/
│   ├── app/
│   │   ├── (app)/          # 受保护的页面
│   │   ├── api/            # API路由
│   │   └── login/          # 登录页
│   ├── components/         # 公共组件
│   └── lib/               # 工具函数
│       ├── api.ts          # DataService
│       ├── repo.ts         # 数据仓储
│       ├── tableIds.ts     # Bitable表ID
│       └── types.ts        # TypeScript类型
├── public/
└── package.json
```
