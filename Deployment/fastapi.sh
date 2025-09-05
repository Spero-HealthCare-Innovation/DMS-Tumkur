#!/bin/bash

PJ_BASE_PATH="/var/www/html/DMS_goa/Deployment"
VENV_PATH="./vvenv"
FASTAPI_SERVICE="/etc/systemd/system/dms_uvicorn_fastapi.service"
NGINX_CONF="/etc/nginx/sites-available/dms_goa_fastapi_7777.conf"
SOCKET_FILE="/tmp/dms_uvicorn_fastapi.sock"

echo "========= Starting FastAPI Setup ========="

# Create or activate virtual environment
if [ -d "$VENV_PATH" ]; then
    echo "[✓] Python virtual environment exists."
else
    echo "[+] Creating virtual environment..."
    python3 -m venv "$VENV_PATH"
    echo "[✓] Virtual environment created."
fi

# Activate venv and install dependencies
source "$VENV_PATH/bin/activate"
pip install -r "/var/www/html/DMS_goa/requirnment.txt"

# Remove stale socket if it exists
if [ -S "$SOCKET_FILE" ]; then
    echo "[~] Removing stale Uvicorn socket..."
    sudo rm -f "$SOCKET_FILE"
fi

# Copy FastAPI systemd service
if [ -f "$FASTAPI_SERVICE" ]; then
    echo "[✓] dms_uvicorn_fastapi.service already exists."
else
    echo "[+] Copying FastAPI systemd service file..."
    sudo cp -f "$PJ_BASE_PATH/gunicorn_proxy/dms_uvicorn_fastapi.service" "$FASTAPI_SERVICE"
    echo "[✓] FastAPI service copied."
fi

# Copy and enable FastAPI nginx conf
if [ -f "$NGINX_CONF" ]; then
    echo "[✓] FastAPI nginx conf already exists."
else
    echo "[+] Copying FastAPI nginx conf..."
    sudo cp -f "$PJ_BASE_PATH/nginx_proxy/dms_goa_fastapi_7777.conf" /etc/nginx/sites-available/
    sudo ln -sf /etc/nginx/sites-available/dms_goa_fastapi_7777.conf /etc/nginx/sites-enabled/
    echo "[✓] FastAPI nginx conf copied and enabled."
fi

# Reload systemd and start FastAPI
sudo systemctl daemon-reload
sudo systemctl enable dms_uvicorn_fastapi
sudo systemctl restart dms_uvicorn_fastapi
sudo systemctl status dms_uvicorn_fastapi

echo "========= FastAPI Setup Completed ========="
