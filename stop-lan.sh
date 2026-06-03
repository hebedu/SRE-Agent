#!/bin/bash

# 获取脚本所在目录
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

PORT=3000

echo "正在检查并停止运行在端口 $PORT 的局域网服务..."
PID=$(lsof -t -i:$PORT)

if [ ! -z "$PID" ]; then
  kill -9 $PID
  echo "✅ 成功停止局域网服务 (PID: $PID)"
else
  echo "ℹ️ 未发现正在运行的局域网服务 (端口 $PORT 未被占用)"
fi
