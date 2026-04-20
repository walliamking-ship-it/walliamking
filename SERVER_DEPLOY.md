# 服务器部署信息

## 腾讯云服务器

**IP地址**: 124.222.108.162

**登录方式**: VNC / SSH

**账号**: ubuntu
**密码**: jin2zhan7!

---

## 服务状态

**ERP系统**: http://124.222.108.162

**SSH连接**:
```bash
ssh ubuntu@124.222.108.162
# 密码: jin2zhan7!
```

---

## 部署路径

- **代码目录**: `/home/ubuntu/erp-system`
- **PM2服务名**: erp-system
- **Node版本**: 20.20.2

---

## 常用命令

```bash
# SSH连接
ssh ubuntu@124.222.108.162

# 重启ERP服务
ssh ubuntu@124.222.108.162 "cd /home/ubuntu/erp-system && pm2 restart erp-system"

# 查看日志
ssh ubuntu@124.222.108.162 "pm2 logs erp-system --lines 50"

# 重新构建并部署
ssh ubuntu@124.222.108.162 "
  cd /home/ubuntu/erp-system
  tar -xzf /home/ubuntu/erp-fix.tar.gz  # 先上传修复包
  npm run build
  pm2 restart erp-system
"
```

---

## 更新日志

- 2026-04-20: 首次记录腾讯云服务器信息
