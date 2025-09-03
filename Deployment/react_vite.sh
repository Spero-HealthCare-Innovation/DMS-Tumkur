#!/bin/bash

REACT_CONF_PATH="/var/www/html/DMS_goa/DMS_client"

cd "${REACT_CONF_PATH}" || { echo "React path not found: ${REACT_CONF_PATH}"; exit 1; }

# Fix permissions (CI-safe way: use Jenkins user instead of $USER)
# sudo chown -R $(whoami):$(whoami) .

# Clean vite cache safely
# [ -d "node_modules/.vite-temp" ] && sudo rm -rf node_modules/.vite-temp

# Ensure node_modules exists
if [ -d "node_modules" ]; then
    echo "node_modules exists, running npm install and build..."
else
    echo "node_modules does not exist, installing dependencies..."
fi

# Run npm install and build (avoid sudo inside Jenkins)
npm install || { echo "React npm installation failed"; exit 1; }
npm run build || { echo "React build failed"; exit 1; }

echo "React Build Created"

