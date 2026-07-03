#!/bin/bash
cd /Users/admin/Downloads/SRE-Agent-main
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -R 80:localhost:3000 nokey@localhost.run > /Users/admin/Downloads/SRE-Agent-main/wan.log 2>&1
