# import os
# import django

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "DMS_goa.settings")
# django.setup()


# import os
# import sys
# import django

# # Add the project root to sys.path
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "DMS_goa.settings")
# django.setup()



import os
import sys
import django

# Absolute path to the directory containing DMS_goa
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add BASE_DIR to sys.path so Python can find DMS_goa module
sys.path.append(BASE_DIR)

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "DMS_goa.settings")

# Setup Django
django.setup()
