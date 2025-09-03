#!/bin/sh

ssh root@YOUR_SERVER_IP_ADDRESS <<EOF
  cd /path/to/your/project
  git pull
  docker-compose -f docker-compose.prod.yml up --build -d
  exit
EOF