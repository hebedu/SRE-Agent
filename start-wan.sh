#!/bin/bash

# 获取脚本所在目录
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

PORT=3000
LOG_FILE="wan.log"

echo "正在检查是否已有外网穿透服务运行..."
screen -S sre_wan -X quit >/dev/null 2>&1

# 强力杀掉可能残留的所有穿透进程（包括 cloudflared, localtunnel, lt, ssh 隧道）
PID_CF=$(ps -ef | grep "cloudflared" | grep -v grep | awk '{print $2}')
PID_LT=$(ps -ef | grep -E "localtunnel|bin/lt" | grep -v grep | awk '{print $2}')
PID_SSH=$(ps -ef | grep "nokey@localhost.run" | grep -v grep | awk '{print $2}')

if [ ! -z "$PID_CF" ]; then
  kill -9 $PID_CF >/dev/null 2>&1
fi
if [ ! -z "$PID_LT" ]; then
  kill -9 $PID_LT >/dev/null 2>&1
fi
if [ ! -z "$PID_SSH" ]; then
  kill -9 $PID_SSH >/dev/null 2>&1
fi
sleep 1

# 清空旧日志
> "$LOG_FILE"

echo "正在后台启动外网穿透服务 (使用 screen 托管)..."
screen -dmS sre_wan /Users/admin/Downloads/SRE-Agent-main/run-wan.sh

echo "正在等待生成公网访问地址..."
for i in {1..15}; do
  sleep 1
  # 匹配形如 https://xxx.lhr.life 的 URL
  URL=$(grep -oE "https://[a-zA-Z0-9.-]+\.lhr\.life" "$LOG_FILE" | head -n 1)
  if [ ! -z "$URL" ]; then
    echo "=============================================="
    echo "✅ 外网服务已成功上线 (已开启静态资源 Gzip 压缩分发)！"
    echo "🌐 公网访问地址: $URL"
    echo "=============================================="
    echo "💡 提示：此时任何人均可直接点击上方链接秒开您的服务，无需任何 IP 验证。"
    echo "📝 运行日志已写入: $LOG_FILE"
    echo "🛑 如需停止服务，请运行: ./stop-wan.sh"
    echo "=============================================="
    exit 0
  fi
done

echo "❌ 获取公网地址超时，请检查 $LOG_FILE 查看错误信息。"
exit 1
