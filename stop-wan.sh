#!/bin/bash

echo "正在停止外网穿透服务 (关闭 screen 会话)..."
screen -S sre_wan -X quit >/dev/null 2>&1

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

echo "✅ 外网服务已停止。"
