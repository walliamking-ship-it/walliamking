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
