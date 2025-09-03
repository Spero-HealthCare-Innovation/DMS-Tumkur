from django.db import models
from django_enumfield import enum
from django.contrib.auth.hashers import make_password
from django.utils import timezone



class pcr_status_enum(enum.Enum):
    Pending = 1
    Inprogress = 2
    Complete = 3
    __default__ = Pending
     
 

class status_enum(enum.Enum):
	Active = 1
	Inactive = 2
	Delete = 3
	__default__ = Active
 
class device_platform(enum.Enum):
    Androind = 1
    IOS = 2
    
class check_in_out_status(enum.Enum):
    check_in = 1
    check_out = 2
    
    __default__ = check_in
    
class vehicle_status(enum.Enum):
    free = 1
    buzy = 2
    maintenance = 3

    __default__ = free

class jobclosure_status(enum.Enum):
    completed = 1
    pending = 2

    __default__ = pending 
    
    
class PcrStatusEnum(enum.Enum):
    Acknowledge = 1
    StartedFromBase = 2
    AtScene = 3
    DepartedFromScene = 4
    BackToBase = 5
    Abandoned = 6

    __default__ = Acknowledge
    
    
class yesno_enum(enum.Enum):
    Yes = 1
    No = 2
    __default__ = Yes

class Vehical_base_location(models.Model):
    bs_id = models.AutoField(primary_key=True)
    bs_name = models.CharField(max_length=100)
    bs_state = models.ForeignKey("admin_web.DMS_State", on_delete=models.CASCADE)
    bs_district = models.ForeignKey("admin_web.DMS_District", on_delete=models.CASCADE)
    bs_tahsil = models.ForeignKey("admin_web.DMS_Tahsil", on_delete=models.CASCADE)
    bs_city = models.ForeignKey("admin_web.DMS_City", on_delete=models.CASCADE)
    bs_ward = models.ForeignKey("admin_web.DMS_Ward", on_delete=models.CASCADE)
    bs_address = models.TextField(null=True)
    bs_lat = models.DecimalField(max_digits=9,decimal_places=6, null=True)
    bs_long = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    status = enum.EnumField(status_enum, null=True)
    bs_added_by = models.CharField(max_length=200, null=True)
    bs_added_date = models.DateTimeField(auto_now_add=True)
    bs_modify_by = models.CharField(max_length=200, null=True)
    bs_modify_date = models.DateTimeField(auto_now=True)

# Create your models here.
class Vehical(models.Model):
    veh_id = models.AutoField(primary_key=True)
    veh_number = models.CharField(max_length=50, null=True, unique=True)
    veh_default_mobile = models.CharField(max_length=15, null=True)
    veh_base_location = models.ForeignKey(Vehical_base_location, on_delete=models.CASCADE, null=True)
    veh_hash = models.TextField(null=True)
    veh_state = models.ForeignKey("admin_web.DMS_State", on_delete=models.CASCADE, null=True)
    veh_district = models.ForeignKey("admin_web.DMS_District" ,on_delete=models.CASCADE, null=True)
    veh_tahsil = models.ForeignKey("admin_web.DMS_Tahsil", on_delete=models.CASCADE, null=True)
    veh_city = models.ForeignKey("admin_web.DMS_City", on_delete=models.CASCADE, null=True)
    veh_app_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    veh_app_log = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    veh_gps_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    veh_gps_log = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    veh_address = models.TextField(null=True)
    veh_ward_id = models.ForeignKey("admin_web.DMS_Ward", on_delete=models.CASCADE, null=True)
    dep_id = models.ForeignKey("admin_web.DMS_Department", on_delete=models.CASCADE,null=True, blank=True)
    responder = models.ForeignKey("admin_web.DMS_Responder", on_delete=models.CASCADE,null=True, blank=True)
    user = models.ForeignKey("admin_web.DMS_User", on_delete=models.CASCADE, null=True)
    vehical_status = enum.EnumField(vehicle_status, null=True)
    status = enum.EnumField(status_enum, null=True)
    vehis_login = models.BooleanField(default=False)
    veh_added_by = models.CharField(max_length=100, null=True)
    veh_added_date = models.DateTimeField(auto_now_add=True)
    veh_modify_by = models.CharField(max_length=100, null=True)
    veh_modify_date = models.DateTimeField(auto_now=True)
      
    def save(self, *args, **kwargs):
        from admin_web.models import DMS_User
        user = DMS_User.objects.filter(user_username=self.veh_number).last()
        if user:
            user.password = make_password(self.veh_default_mobile)
        return super().save(*args, **kwargs)
    
class Device_version(models.Model):
    device_id = models.AutoField(primary_key=True)
    os_version = models.CharField(max_length=9, null=True)
    device_platform = enum.EnumField(device_platform, null=True)
    app_version = models.CharField(max_length=9, null=True)
    device_timezone = models.CharField(max_length=50, null=True)
    date_time = models.DateTimeField(auto_now_add=True)
    device_token = models.TextField(null=True)
    model_name = models.CharField(max_length=200, null=True)
    status = enum.EnumField(status_enum, null=True)
    
class Device_version_info(models.Model):
    device_version_id = models.AutoField(primary_key=True)
    os_name = enum.EnumField(device_platform, null=True)
    os_version = models.CharField(max_length=100, null=True)
    app_location = models.URLField(max_length=500, null=True)
    app_current_version = models.CharField(max_length=50, null=True)
    app_compulsory_version = models.CharField(max_length=50, null=True)
    status = enum.EnumField(status_enum)
    added_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)
    
class vehicle_login_info(models.Model):
    veh_login_id = models.AutoField(primary_key=True)
    veh_login_time = models.DateTimeField(null=True)
    veh_logout_time = models.DateTimeField(null=True)
    status = enum.EnumField(status_enum, null=True)
    veh_id = models.ForeignKey(Vehical, on_delete=models.CASCADE, null=True)
    clock_out_in_status = enum.EnumField(check_in_out_status, null=True)
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)
    device_id = models.IntegerField(null=True)
    login_odometer = models.IntegerField(null=True)
    logout_odometer = models.IntegerField(null=True)
    logout_question = enum.EnumField(yesno_enum, null=True)
    logout_image = models.FileField(upload_to='media_files/vehicle_logout/', null=True)
    
class employee_clockin_info(models.Model):
    emp_clockin_id = models.AutoField(primary_key=True)
    emp_clockin_time = models.DateTimeField(null=True)
    emp_clockout_time = models.DateTimeField(null=True)
    status = enum.EnumField(status_enum, null=True)
    latitude = models.FloatField(null = True)
    longitude = models.FloatField(null = True)
    clock_out_in_status = enum.EnumField(check_in_out_status, null=True)
    emp_id = models.ForeignKey("admin_web.DMS_Employee", on_delete=models.CASCADE, null=True)
    veh_id = models.ForeignKey(Vehical, on_delete=models.CASCADE, null=True)
    emp_image = models.FileField(upload_to='media_files/Mdt_employee/', null=True)
    
class incident_vehicles(models.Model):
    inc_veh_id = models.AutoField(primary_key=True)
    incident_id=models.ForeignKey("admin_web.DMS_Incident",on_delete=models.CASCADE,null=True,blank=True)
    veh_id = models.ForeignKey(Vehical, on_delete=models.CASCADE,null=True)
    dep_id = models.ForeignKey("admin_web.DMS_Department", on_delete=models.CASCADE,null=True, blank=True)
    status = enum.EnumField(status_enum, null=True)
    jobclosure_status = enum.EnumField(jobclosure_status, null=True)
    pcr_status = enum.EnumField(pcr_status_enum, null=True)
    added_by = models.CharField(max_length=100, null=True)
    added_date = models.DateTimeField(auto_now_add=True)
    modify_by = models.CharField(max_length=100, null=True)
    modify_date = models.DateTimeField(auto_now=True)
    
    
# class incident_wise_vehicle(models.Model):
#     inc_veh_id = models.AutoField(primary_key=True)
#     incident_id=models.ForeignKey("admin_web.DMS_Incident",on_delete=models.CASCADE,null=True,blank=True)
#     veh_id = models.ForeignKey(Vehical, on_delete=models.CASCADE, to_field='veh_number', null=True)
#     dep_id = models.ForeignKey("admin_web.DMS_Department", on_delete=models.CASCADE,null=True, blank=True)
#     jobclosure_status = enum.EnumField(jobclosure_status, null=True)
#     status = enum.EnumField(status_enum, null=True)
#     added_by = models.CharField(max_length=100, null=True)
#     added_date = models.DateTimeField(auto_now_add=True)
#     modify_by = models.CharField(max_length=100, null=True)
#     modify_date = models.DateTimeField(auto_now=True)
    
    
    

class PcrReport(models.Model):
    pcr_id = models.TextField(primary_key=True)

    incident_id = models.ForeignKey("admin_web.DMS_Incident", on_delete=models.CASCADE, null=True)
    amb_no = models.ForeignKey(Vehical, on_delete=models.CASCADE, null=True)
    status = enum.EnumField(PcrStatusEnum, null=True)

    acknowledge_time = models.DateTimeField(null=True, blank=True)
    acknowledge_lat = models.FloatField(null=True, blank=True)
    acknowledge_lng = models.FloatField(null=True, blank=True)

    start_from_base_time = models.DateTimeField(null=True, blank=True)
    start_fr_bs_loc_lat = models.FloatField(null=True, blank=True)
    start_fr_bs_loc_lng = models.FloatField(null=True, blank=True)

    at_scene_time = models.DateTimeField(null=True, blank=True)
    at_scene_remark = models.TextField(null=True, blank=True)
    at_scene_photo = models.FileField(upload_to='media_files/at_scene_photo/', null=True)
    at_scene_lat = models.FloatField(null=True, blank=True)
    at_scene_lng = models.FloatField(null=True, blank=True)

    from_scene_time = models.DateTimeField(null=True, blank=True)
    from_scene_photo = models.FileField(upload_to='media_files/from_scene_photo/', null=True)
    from_scene_remark = models.TextField(null=True, blank=True)
    from_scene_lat = models.FloatField(null=True, blank=True)
    from_scene_lng = models.FloatField(null=True, blank=True)

    back_to_base_time = models.DateTimeField(null=True, blank=True)
    back_to_bs_loc_lat = models.FloatField(null=True, blank=True)
    back_to_bs_loc_lng = models.FloatField(null=True, blank=True)

    abandoned_time = models.DateTimeField(null=True, blank=True)
    abandoned_lat = models.FloatField(null=True, blank=True)
    abandoned_lng = models.FloatField(null=True, blank=True)

    added_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)  
    added_by = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "pcr_report"
