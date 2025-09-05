#!/bin/bash

PJ_BASE_PATH="/var/www/html/DMS_goa/Deployment"
# Activate virtual environment
echo "Runining gunicorn sh file"
pwd
echo "current dir"

# source vvenv/bin/activate


if [ -d "vvenv" ]; then
    echo "Python virtual environment exists." 
    source vvenv/bin/activate
else
    python3 -m venv vvenv
    echo "Current Directory: $PWD"
    # pip install -r requirnment.txt
fi

echo "pip freeze in gunicorn.sh"

pip freeze
cd DMS_goa

# Django operations
# echo "python3 manage.py makemigrations"
# python manage.py makemigrations
# python manage.py migrate
python manage.py collectstatic --noinput

echo "Migrations and static files collected."

# Copy Gunicorn Socket if not present
if [ -f "/etc/systemd/system/dms_gunicorn_django.socket" ]; then
    echo "Gunicorn Socket already present"
else
    echo "Copying Gunicorn Socket file..."
    sudo cp -rf "$PJ_BASE_PATH/gunicorn_proxy/dms_gunicorn_django.socket" /etc/systemd/system/
    echo "Gunicorn Socket copied successfully."
fi

# Copy Gunicorn Service if not present
if [ -f "/etc/systemd/system/dms_gunicorn_django.service" ]; then
    echo "Gunicorn Service already present"
else
    echo "Copying Gunicorn Service file..."
    sudo cp -rf "$PJ_BASE_PATH/gunicorn_proxy/dms_gunicorn_django.service" /etc/systemd/system/
    echo "Gunicorn Service copied successfully."
fi

# Show user and current directory
echo "Current User: $USER"
echo "Current Directory: $PWD"
 
# Reload systemd and restart Gunicorn
sudo systemctl daemon-reload
sudo systemctl restart dms_gunicorn_django
sudo systemctl enable dms_gunicorn_django
 
# Check Gunicorn status
sudo systemctl status dms_gunicorn_django
