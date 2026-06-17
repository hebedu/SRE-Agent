#!/bin/bash

# 获取脚本所在目录
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

PORT=3000

echo "正在检查并停止局域网服务 (关闭 screen 会话)..."
screen -S sre_app -X quit >/dev/null 2>&1

PID=$(lsof -t -i:$PORT)

if [ ! -z "$PID" ]; then
  kill -9 $PID
  echo "✅ 成功停止局域网服务 (PID: $PID)"
else
  echo "✅ 局域网服务已停止 (端口 $PORT 未被占用)"
fi
