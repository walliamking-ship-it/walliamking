# TODO.md - ERP系统开发任务跟踪

## [2026-04-21] 任务：客户新建功能修复

- [x] 排查浏览器POST /api/customers 500错误原因
- [x] 验证保存后数据正确写入Bitable
- [ ] 测试所有模块新建功能

## [2026-04-21] 任务：登录功能优化 ✅ 完成

- [x] 添加友好的错误提示
- [x] 添加登录状态保持
- [x] 添加权限控制

## [2026-04-21] 任务：部署流程改进 ✅ 完成

- [x] 使用Git webhook自动部署 - 创建 `scripts/deploy.sh`
- [x] 解决tar部署文件不更新问题 - 使用rsync同步
- [x] 优化PM2启动参数 - 创建 `ecosystem.config.js`

## [2026-04-21] 任务：权限控制 ✅ 完成

- [x] 创建 `usePermission` Hook - `src/hooks/usePermission.ts`
- [x] 扩展 CrudTable 权限检查 - 支持 create/edit/delete/export 控制

## [2026-04-21] 发票到期提醒 ✅ 完成

- [x] 创建 `src/lib/invoiceReminder.ts` - 发票逾期检查逻辑
- [x] 创建 `/api/invoices/reminders` API - 返回逾期汇总
- [x] 创建 `/invoices/reminders` 页面 - 可视化逾期情况
- [x] 支持按客户/供应商汇总逾期金额
- [x] 支持按严重程度分级（正常/即将到期/已逾期/严重逾期）

## [2026-04-21] 三单匹配验证 ✅ 完成

- [x] 创建 `src/lib/threeWayMatch.ts` - 采购三单匹配验证
- [x] 支持订单金额/收货金额/发票金额三方验证
- [x] 提供匹配状态：matched/partial/over

## [2026-04-21] BOM物料清单 ✅ 完成

- [x] 创建 `src/lib/bom.ts` - BOM物料清单模块
- [x] 支持物料需求计算（含损耗率）
- [x] 支持库存缺口计算
