from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(Vehical_base_location)
admin.site.register(Vehical)
admin.site.register(Device_version)
admin.site.register(Device_version_info)
admin.site.register(vehicle_login_info)
admin.site.register(employee_clockin_info)
admin.site.register(incident_vehicles) 
admin.site.register(PcrReport)