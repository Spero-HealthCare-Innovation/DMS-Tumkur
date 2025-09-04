#!/bin/bash
# set -e  # <-- stop immediately if any command fails

if [ -d "vvenv" ]; then
    echo "Python virtual environment exists." 
else
    python3 -m venv vvenv
fi

echo "Current Directory: $PWD"

# Activate venv in the same shell
source vvenv/bin/activate

echo "Python vvenv activated"
echo "Installing current dependencies - pip install -r requirnment.txt"
echo "Current Directory: $PWD"
pip install --upgrade pip setuptools wheel   # Always upgrade pip first
echo "Current Directory: $PWD"
pip install -r requirnment.txt
pip freeze
echo "pip freeze in envsetup"

echo "vvenv setup finished"
