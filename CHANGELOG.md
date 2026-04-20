# CHANGELOG.md - ERP系统变更记录

## [Unreleased]

### Added
- 客户管理模块基础CRUD
- 供应商管理模块基础CRUD
- 产品管理模块基础CRUD
- 销售订单/采购订单模块
- 库存管理模块

### Changed
- 仪表盘金额显示修复（使用Number()转换）
- 所有模块Modal添加try-catch错误处理

### Fixed
- Dashboard reduce计算字符串拼接问题
- 登录循环Bug（直接修改服务器layout.tsx）
- Form useEffect导致表单重置问题

## [2026-04-20]

### Added
- 腾讯云服务器部署（124.222.108.162）
- PM2进程管理
- nginx反向代理配置

### Changed
- 移除登录验证（临时）

### Known Issues
- 客户新建在浏览器中返回500（cURL测试正常）
- 浏览器缓存导致JS文件过期
