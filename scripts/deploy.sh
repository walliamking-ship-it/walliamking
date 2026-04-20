#!/bin/bash
# ERP系统部署脚本
# 用法: ./scripts/deploy.sh [server]
#   server: 远程服务器部署 (默认: 124.222.108.162)

set -e

APP_NAME="erp-system"
DEPLOY_PATH="/home/ubuntu/erp-system"
SERVER="ubuntu@124.222.108.162"
BRANCH="main"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 获取版本信息
get_version() {
  git log --oneline -1 --format="%h %s" 2>/dev/null || echo "unknown"
}

# 本地构建
build_local() {
  log_info "开始本地构建..."
  npm run build
  log_info "本地构建完成"
}

# 创建部署包（排除不必要的文件）
create_package() {
  log_info "创建部署包..."
  
  # 创建临时目录
  TEMP_DIR=$(mktemp -d)
  PKG_NAME="erp-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"
  
  # 复制必要文件
  mkdir -p "$TEMP_DIR/app"
  rsync -av --exclude='.git' \
            --exclude='node_modules' \
            --exclude='.next' \
            --exclude='*.log' \
            --exclude='.env*' \
            --exclude='coverage' \
            --exclude='.test*' \
            ./ "$TEMP_DIR/app/" 2>/dev/null || \
  tar -czf "/tmp/$PKG_NAME" --exclude='.git' --exclude='node_modules' --exclude='.next' -C . . 2>/dev/null
  
  # 使用rsync复制
  rsync -av --exclude='.git' \
            --exclude='node_modules' \
            --exclude='.next' \
            --exclude='*.log' \
            --exclude='.env*' \
            "$TEMP_DIR/app/" "$SERVER:$DEPLOY_PATH/" 2>/dev/null || \
  echo "Using alternative copy method"
  
  # 清理
  rm -rf "$TEMP_DIR"
  
  echo "/tmp/$PKG_NAME"
}

# 远程服务器部署
deploy_remote() {
  log_info "部署到远程服务器: $SERVER"
  
  VERSION=$(get_version)
  log_info "部署版本: $VERSION"
  
  # 远程执行部署命令
  ssh "$SERVER" "
    set -e
    echo '[INFO] 开始部署ERP系统...'
    cd $DEPLOY_PATH
    
    # 停止服务
    echo '[INFO] 停止服务...'
    pm2 stop $APP_NAME 2>/dev/null || true
    
    # 更新代码
    echo '[INFO] 更新代码...'
    git pull origin $BRANCH
    
    # 安装依赖
    echo '[INFO] 安装依赖...'
    npm install --production
    
    # 构建
    echo '[INFO] 构建...'
    npm run build
    
    # 启动服务
    echo '[INFO] 启动服务...'
    pm2 startOrRestart ecosystem.config.js 2>/dev/null || pm2 start npm --name '$APP_NAME' -- start
    
    # 保存PM2配置
    pm2 save
    
    echo '[INFO] 部署完成!'
  "
  
  log_info "远程部署完成"
}

# GitHub Webhook 自动部署（服务器端）
setup_webhook_server() {
  log_info "设置GitHub Webhook自动部署..."
  
  ssh "$SERVER" "
    # 安装 webhook (如果没有)
    which webhook >/dev/null 2>&1 || {
      echo '[INFO] 安装 webhook...'
      sudo apt-get update && sudo apt-get install -y webhook
    }
    
    # 创建 webhook 配置目录
    mkdir -p ~/webhooks
    
    # 创建 webhook 配置文件
    cat > ~/webhooks/deploy.json << 'EOF'
[
  {
    \"id\": \"erp-deploy\",
    \"execute-command\": \"/home/ubuntu/erp-system/scripts/webhook-handler.sh\",
    \"command-working-directory\": \"/home/ubuntu/erp-system\",
    \"trigger-rule\": {
      \"match\": {
        \"type\": \"payload-hmac-sha256\",
        \"secret\": \"${WEBHOOK_SECRET:-your-webhook-secret}\",
        \"parameter\": {
          \"source\": \"payload\"
        }
      }
    }
  }
]
EOF

    # 创建 webhook 处理脚本
    cat > ~/webhooks/deploy-handler.sh << 'EOF'
#!/bin/bash
set -e

echo "[INFO] 接收到 webhook 触发..."

cd /home/ubuntu/erp-system

# 检查是否是 main 分支
BRANCH=\$(echo \$GITHUB_REF | sed 's/refs\\/heads\\///')
if [ "\$BRANCH" != "main" ]; then
  echo "[INFO] 非 main 分支，跳过部署"
  exit 0
fi

# 停止服务
pm2 stop erp-system 2>/dev/null || true

# 拉取最新代码
git pull origin main

# 安装依赖并构建
npm install --production
npm run build

# 重启服务
pm2 restart erp-system 2>/dev/null || pm2 start npm --name 'erp-system' -- start
pm2 save

echo "[INFO] 部署完成: \$(date)"
EOF

    chmod +x ~/webhooks/deploy-handler.sh
    echo '[INFO] Webhook 配置完成'
  "
  
  log_info "Webhook 服务器端配置完成"
}

# 优化PM2配置
setup_pm2() {
  log_info "优化PM2配置..."
  
  cat > /Users/walliam/.openclaw/workspace/sales/erp-system/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'erp-system',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    cwd: '.',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    exp_backoff_restart_delay: 100,
    max_retries: 3,
    // 日志配置
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    // 最小化日志输出
    merge_logs: true
  }]
};
EOF

  log_info "PM2 配置已创建: ecosystem.config.js"
}

# 主函数
main() {
  log_info "ERP系统部署脚本"
  log_info "版本: $(get_version)"
  
  case "${1:-}" in
    remote)
      deploy_remote
      ;;
    webhook)
      setup_webhook_server
      ;;
    pm2)
      setup_pm2
      ;;
    all)
      setup_pm2
      setup_webhook_server
      ;;
    *)
      echo "用法: $0 [remote|webhook|pm2|all]"
      echo ""
      echo "选项:"
      echo "  remote   - 部署到远程服务器"
      echo "  webhook  - 设置GitHub Webhook自动部署(需在服务器上运行)"
      echo "  pm2      - 生成优化的PM2配置文件"
      echo "  all      - 执行所有设置"
      exit 1
      ;;
  esac
}

main "$@"
