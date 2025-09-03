import logging
from django.apps import apps

class DatabaseLogHandler(logging.Handler):
    """Custom logging handler to log messages into the database"""

    def emit(self, record):
        if not apps.ready:  # Ensure apps are loaded before accessing models
            return
        
        try:
            LogEntry = apps.get_model('admin_web', 'LogEntry')  # Lazy load model
            LogEntry.objects.create(
                level=record.levelname,
                message=record.getMessage(),
                module=record.module
            )
        except Exception as e:
            print(f"Logging Error: {e}")
