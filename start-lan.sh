#!/bin/bash

# 获取脚本所在目录
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

PORT=3000

echo "正在检查端口 $PORT 是否被占用..."
# 检查端口是否被占用
PID=$(lsof -t -i:$PORT)

if [ ! -z "$PID" ]; then
  echo "端口 $PORT 已被进程 $PID 占用，正在停止该进程以应用新部署..."
  kill -9 $PID
  sleep 1
fi

echo "正在编译最新前端代码..."
npm run build

echo "正在后台启动局域网服务 (使用 screen 托管)..."
# 停止旧的 screen 会话以防冲突
screen -S sre_app -X quit >/dev/null 2>&1
# 启动新的 screen 会话运行 node 服务
screen -dmS sre_app /Users/admin/Downloads/SRE-Agent-main/run-server.sh


# 等待三秒检查是否成功启动
sleep 3
NEW_PID=$(lsof -t -i:$PORT)

if [ ! -z "$NEW_PID" ]; then
  echo "=============================================="
  echo "✅ 局域网服务已在后台成功运行！(PID: $NEW_PID)"
  echo "💡 提示：此时您可以安全地关闭 Antigravity 或终端，不会影响局域网访问。"
  echo "=============================================="
  
  # 获取本机 IP 地址
  IP_LIST=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}')
  echo "🏠 本地访问地址: http://localhost:$PORT"
  echo "🌐 局域网访问地址:"
  for IP in $IP_LIST; do
    echo "   http://$IP:$PORT"
  done
  echo "=============================================="
  echo "📝 运行日志已写入: server.log"
  echo "🛑 如需停止服务，请运行: ./stop-lan.sh"
  echo "=============================================="
else
  echo "❌ 启动失败，请查看 server.log 中的错误日志。"
fi
