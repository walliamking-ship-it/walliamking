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
    merge_logs: true
  }]
};
