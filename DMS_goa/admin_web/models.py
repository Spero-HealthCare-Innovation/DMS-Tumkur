from django.db import models
from DMS_MDT.models import Vehical
from django_enumfield import enum
from django.utils import timezone
from django.core.validators import RegexValidator
# from joinfield.joinfield import JoinField
import datetime

from django.db import models, IntegrityError


from django.utils import timezone

from django.contrib.auth.models import(
	BaseUserManager,AbstractBaseUser
)
from django_enumfield import enum

class status_enum(enum.Enum):
	Active = 1
	Inactive = 2
	Delete = 3
	__default__ = Active
 
class jobclosure_status(enum.Enum):
    completed = 1
    pending = 2

    __default__ = pending 

class summary_enum(enum.Enum):
    Emergency=1
    Non_Emergency=2

class division_enum(enum.Enum):
    South=1
    North=2
    Central=3

class media_enum(enum.Enum):
    Twitter=0
    FB=1
    News=2
    RSS=3 
    Reddit=4

class DMS_State(models.Model):
    state_id = models.AutoField(primary_key=True)
    state_name = models.CharField(max_length=255)
    state_is_deleted = models.BooleanField(default=False)
    state_added_by = models.CharField(max_length=255, null=True, blank=True)
    state_added_date = models.DateTimeField(auto_now=True)
    state_modified_by = models.CharField(max_length=255, null=True, blank=True)
    state_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)

class DMS_District(models.Model):
    dis_id = models.AutoField(primary_key=True)
    state_id = models.ForeignKey(DMS_State, on_delete=models.CASCADE)
    dis_name = models.CharField(max_length=255)
    dis_is_deleted = models.BooleanField(default=False)
    dis_added_by = models.CharField(max_length=255, null=True, blank=True)
    dis_added_date = models.DateTimeField(auto_now=True,)
    dis_modified_by = models.CharField(max_length=255, null=True, blank=True)
    dis_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)

class DMS_Tahsil(models.Model):
    tah_id = models.AutoField(primary_key=True)
    dis_id = models.ForeignKey(DMS_District, on_delete=models.CASCADE)
    tah_name = models.CharField(max_length=255)
    tah_is_deleted = models.BooleanField(default=False)
    tah_added_by = models.CharField(max_length=255, null=True, blank=True)
    tah_added_date = models.DateTimeField(auto_now=True,)
    tah_modified_by = models.CharField(max_length=255, null=True, blank=True)
    tah_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)

class DMS_City(models.Model):
    cit_id = models.AutoField(primary_key=True)
    tah_id = models.ForeignKey(DMS_Tahsil, on_delete=models.CASCADE)
    cit_name = models.CharField(max_length=255)
    cit_is_deleted = models.BooleanField(default=False)
    cit_added_by = models.CharField(max_length=255, null=True, blank=True)
    cit_added_date = models.DateTimeField(auto_now=True,)
    cit_modified_by = models.CharField(max_length=255, null=True, blank=True)
    cit_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)

class DMS_Department(models.Model):
    dep_id = models.AutoField(primary_key=True)
    dep_name = models.CharField(max_length=255)
    dep_is_central = models.BooleanField(default=False)
    state_id = models.ForeignKey(DMS_State, on_delete=models.CASCADE)
    dis_id = models.ForeignKey(DMS_District, on_delete=models.CASCADE)
    tah_id = models.ForeignKey(DMS_Tahsil, on_delete=models.CASCADE)
    cit_id = models.ForeignKey(DMS_City, on_delete=models.CASCADE)
    disaster_id = models.ForeignKey('DMS_Disaster_Type', on_delete=models.CASCADE)
    dep_is_deleted = models.BooleanField(default=False)
    dep_added_by = models.CharField(max_length=255, null=True, blank=True)
    dep_added_date =  models.DateTimeField(auto_now=True)
    dep_modified_by = models.CharField(max_length=255, null=True, blank=True)
    dep_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    

class DMS_Group(models.Model):
    grp_id = models.AutoField(primary_key=True)
    grp_code = models.CharField(max_length=100,null=True, blank=True)
    permission_status = models.IntegerField(null=True, blank=True)
    grp_name = models.CharField(max_length=255,null=True, blank=True)
    dep_id = models.ForeignKey(DMS_Department, on_delete=models.CASCADE,null=True, blank=True)
    grp_is_deleted = models.BooleanField(default=False)
    grp_added_date = models.DateTimeField(auto_now=True)
    grp_added_by = models.CharField(max_length=255, null=True, blank=True)
    grp_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    grp_modified_by = models.CharField(max_length=255, null=True, blank=True)
    

class DMS_Module(models.Model):
    mod_id = models.AutoField(primary_key=True)
    mod_code = models.CharField(max_length=100)
    mod_name = models.CharField(max_length=255)
    mod_group_id = models.ForeignKey(DMS_Group, on_delete=models.CASCADE)
    mod_is_deleted = models.BooleanField(default=False)
    mod_added_date = models.DateTimeField(auto_now=True)
    mod_added_by = models.CharField(max_length=255, null=True, blank=True)
    mod_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    mod_modified_by = models.CharField(max_length=255, null=True, blank=True)
    

class DMS_SubModule(models.Model):
    sub_mod_id = models.AutoField(primary_key=True)
    mod_id = models.ForeignKey(DMS_Module, on_delete=models.CASCADE)
    sub_mod_name = models.CharField(max_length=255)
    sub_mod_is_deleted = models.BooleanField(default=False)
    sub_mod_added_date = models.DateTimeField(auto_now=True)
    sub_mod_added_by = models.CharField(max_length=255, null=True, blank=True)
    sub_mod_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    sub_mod_modified_by = models.CharField(max_length=255, null=True, blank=True)

class DMS_Action(models.Model):
    ac_id = models.AutoField(primary_key=True)
    ac_name = models.CharField(max_length=255)
    sub_mod_id = models.ForeignKey(DMS_SubModule, on_delete=models.CASCADE)
    ac_is_deleted = models.BooleanField(default=False)
    ac_added_by = models.CharField(max_length=255, null=True, blank=True)
    ac_added_date = models.DateTimeField(auto_now=True)
    ac_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    ac_modified_by = models.CharField(max_length=255, null=True, blank=True)

class DMS_Permission(models.Model):
    per_id = models.AutoField(primary_key=True)
    grp_id = models.ForeignKey(DMS_Group, on_delete=models.CASCADE)
    mod_submod_per = models.TextField()  
    screen_no = models.CharField(max_length=100)
    per_is_deleted = models.BooleanField(default=False)
    per_added_date = models.DateTimeField(auto_now=True)
    per_added_by = models.CharField(max_length=255, null=True, blank=True)
    per_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    per_modified_by = models.CharField(max_length=255, null=True, blank=True)
    

class DMS_Disaster_Type(models.Model):
    disaster_id = models.AutoField(primary_key=True)
    disaster_name = models.CharField(max_length=255)
    disaster_rng_high = models.CharField(max_length=255,null=True, blank=True)
    disaster_rng_medium = models.CharField(max_length=255,null=True, blank=True)
    disaster_rng_low = models.CharField(max_length=255,null=True, blank=True)
    disaster_is_deleted = models.BooleanField(default=False)
    disaster_added_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    disaster_added_by = models.CharField(max_length=255, null=True, blank=True)
    disaster_modified_by = models.CharField(max_length=255, null=True, blank=True)
    disaster_modified_date = models.DateTimeField(null=True, blank=True)
    disaster_parent = models.ForeignKey("ParentComplaint", on_delete=models.CASCADE, null=True, blank=True)
    



# # Custom User Manager
# class DMS_Employee_Manager(BaseUserManager):

#     def create_user(self, emp_username, grp_id, emp_name, emp_email, emp_contact_no, emp_dob, emp_doj, emp_is_login, state_id, dist_id, tahsil_id, city_id, emp_is_deleted, emp_added_by, emp_modified_by,ward_id,password=None, password2=None):

#         """
#         Creates and saves a User with the given email, name, tc and password.
#         """
#         if not emp_username:
#             raise ValueError('User must have an user id')

#         user = self.model(
#             emp_email=self.normalize_email(emp_email),
#             emp_username = emp_username,
#             emp_name = emp_name,
#             emp_contact_no = emp_contact_no,
#             emp_dob = emp_dob,
#             emp_doj = emp_doj,
#             emp_is_login = emp_is_login,
#             state_id = state_id, 
#             dist_id = dist_id,
# 			tahsil_id = tahsil_id,
#             grp_id = grp_id,
#             city_id = city_id,
#             emp_is_deleted = emp_is_deleted,
#             emp_added_by = emp_added_by,
#             emp_modified_by = emp_modified_by,
#             ward_id=ward_id,
#         )

#         user.set_password(password)
#         user.save(using=self._db)
#         return user

#     def create_superuser(self, emp_username, grp_id, emp_name, emp_email, emp_contact_no, emp_dob, emp_doj, emp_is_login, state_id, dist_id, tahsil_id, city_id,ward_id, emp_is_deleted, emp_added_by, emp_modified_by, password=None,):

#         """Creates and saves a superuser with the given email, name, tc and password."""
#         user = self.create_user(
#             password=password,
#             emp_email=emp_email,
#             emp_username = emp_username,
#             emp_name = emp_name,
#             emp_contact_no = emp_contact_no,
#             emp_dob = emp_dob,
#             emp_doj = emp_doj,
#             emp_is_login = emp_is_login,
#             state_id = state_id, 
#             dist_id = dist_id,
# 			tahsil_id = tahsil_id,
#             grp_id = grp_id,
#             city_id = city_id,
#             emp_is_deleted = emp_is_deleted,
#             emp_added_by = emp_added_by,
#             emp_modified_by = emp_modified_by,
#             ward_id=ward_id,
#         )

#         user.is_admin = True
#         user.save(using=self._db)
#         return user



# class DMS_Employee(AbstractBaseUser):
#     emp_id = models.AutoField(primary_key=True, auto_created=True)
#     emp_username = models.CharField(max_length=100,unique=True, null=True, blank=True)
#     emp_name = models.CharField(max_length=255, null=True, blank=True)
#     emp_contact_no = models.CharField(max_length=15, null=True, blank=True)
#     emp_email = models.EmailField(max_length=255,unique=True,null= True,blank=True)
#     emp_dob = models.DateField(null=True, blank=True)
#     emp_doj = models.DateField(null=True, blank=True)
#     emp_is_login = models.BooleanField(default=False, null=True, blank=True)
#     grp_id = models.ForeignKey(DMS_Group,on_delete=models.CASCADE,null=True, blank=True)
#     state_id = models.ForeignKey(DMS_State, on_delete=models.CASCADE,null=True, blank=True)
#     dist_id = models.ForeignKey(DMS_District, on_delete=models.CASCADE,null=True, blank=True)
#     tahsil_id = models.ForeignKey(DMS_Tahsil, on_delete=models.CASCADE,null=True, blank=True)
#     city_id = models.ForeignKey(DMS_City, on_delete=models.CASCADE,null=True, blank=True)
#     ward_id = models.ForeignKey('DMS_Ward', on_delete=models.CASCADE,null=True, blank=True)
#     # grp_id = models.CharField(max_length=255, null=True, blank=True)
#     # state_id = models.CharField(max_length=255, null=True, blank=True)
#     # dist_id = models.CharField(max_length=255, null=True, blank=True)
#     # tahsil_id = models.CharField(max_length=255, null=True, blank=True)
#     # city_id = models.CharField(max_length=255, null=True, blank=True)
#     is_admin = models.BooleanField(default=False, blank=True)
#     emp_is_deleted = models.BooleanField(default=False)
#     emp_added_by = models.CharField(max_length=255, null=True, blank=True)
#     emp_added_date = models.DateTimeField(auto_now_add=True,null=True)
#     emp_modified_by = models.CharField(max_length=255, null=True, blank=True)
#     emp_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
 

#     username = None
#     email = None

#     objects = DMS_Employee_Manager()

#     EMAIL_FIELD = 'emp_email'
#     GROUP_FIELD = 'grp_id'


#     USERNAME_FIELD = 'emp_username'


#     REQUIRED_FIELDS = ['grp_id', 'emp_name', 'emp_email', 'emp_contact_no', 'emp_dob', 'emp_doj', 'emp_is_login', 'state_id', 'dist_id', 'tahsil_id', 'city_id','ward_id', 'emp_is_deleted', 'emp_added_by', 'emp_modified_by']

#     def __str__(self):
#         return str(self.emp_username)

#     def has_perm(self, perm, obj=None):
#         "Does the user have a specific permission?"
#         # Simplest possible answer: Yes, always
#         return self.is_admin

#     def has_module_perms(self, app_label):
#         "Does the user have permissions to view the app `app_label`?"
#         # Simplest possible answer: Yes, always
#         return True

#     @property
#     def is_staff(self):
#         "Is the user a member of staff?"
#         # Simplest possible answer: All admins are staff
#         return self.is_admin


    
# class DMS_WebLogin(models.Model):
#     log_id = models.AutoField(primary_key=True)
#     emp_id = models.ForeignKey(DMS_Employee, on_delete=models.CASCADE)
#     emp_login_time = models.DateTimeField(auto_now=True)
#     emp_logout_time = models.DateTimeField(null=True, blank=True)
#     log_status = models.CharField(max_length=50) 
#     log_added_date = models.DateTimeField(auto_now=True)
#     log_added_by = models.CharField(max_length=255, null=True, blank=True)
#     log_modified_by = models.CharField(max_length=255, null=True, blank=True)





class DMS_User_Manager(BaseUserManager):
   
    def create_user(self, user_username, grp_id,password=None, password2=None):
 
        """
        Creates and saves a User with the given email, name, tc and password.
        """
        if not user_username:
            raise ValueError('User must have an user id')
 
        user = self.model(
            # user_email=self.normalize_email(user_email),
            user_username = user_username,
            # user_name = user_name,
            # user_contact_no = user_contact_no,
            # user_is_login = user_is_login,
            grp_id = grp_id,
            # user_is_deleted = user_is_deleted,
            # user_added_by = user_added_by,
            # user_modified_by = user_modified_by,
        )
 
        user.set_password(password)
        user.save(using=self._db)
        return user

    # def create_superuser(self, user_username, grp_id, user_name, user_email, user_contact_no, user_is_login, user_is_deleted, user_added_by, user_modified_by, password=None,):
    def create_superuser(self, user_username, grp_id, password=None):

        """Creates and saves a superuser with the given email, name, tc and password."""
        user = self.create_user(
            password=password,
            # user_email=user_email,
            grp_id=grp_id,
            user_username = user_username,
            # user_name = user_name,
            # user_contact_no = user_contact_no,
            # user_is_login = user_is_login,
            # user_is_deleted = user_is_deleted,
            # user_added_by = user_added_by,
            # user_modified_by = user_modified_by,
        )
 
        user.is_admin = True
        user.save(using=self._db)
        return user
# ==========================================================================================================

class DMS_User(AbstractBaseUser):
    user_id = models.AutoField(primary_key=True, auto_created=True)
    user_username = models.CharField(max_length=100,unique=True, null=True, blank=True)
    grp_id = models.ForeignKey(DMS_Group,on_delete=models.CASCADE,null=True, blank=True)
    user_is_login = models.BooleanField(default=False, null=True, blank=True)
    is_admin = models.BooleanField(default=False, blank=True)
    user_is_deleted = models.BooleanField(default=False)
    user_added_by = models.CharField(max_length=255, null=True, blank=True)
    user_added_date = models.DateTimeField(auto_now_add=True,null=True)
    user_modified_by = models.CharField(max_length=255, null=True, blank=True)
    user_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
 
 
    username = None
    email = None
 
    objects = DMS_User_Manager()
 
    # EMAIL_FIELD = 'user_email'
    GROUP_FIELD = 'grp_id'
 
 
    USERNAME_FIELD = 'user_username'
 
 
    REQUIRED_FIELDS = []
 
    def __str__(self):
        return str(self.user_username)
 
    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return self.is_admin
 
    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True
 
    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin
 
 
 
class DMS_Employee(models.Model):
    emp_id = models.AutoField(primary_key=True, auto_created=True)
    emp_name = models.CharField(max_length=255, null=True, blank=True)
    emp_contact_no = models.CharField(max_length=15, null=True, blank=True)
    emp_email = models.EmailField(max_length=255,unique=True,null= True,blank=True)
    emp_dob = models.DateField(null=True, blank=True)
    emp_doj = models.DateField(null=True, blank=True)
    user_id = models.ForeignKey(DMS_User,on_delete=models.CASCADE,null=True, blank=True)
    state_id = models.ForeignKey(DMS_State, on_delete=models.CASCADE,null=True, blank=True)
    dist_id = models.ForeignKey(DMS_District, on_delete=models.CASCADE,null=True, blank=True)
    tahsil_id = models.ForeignKey(DMS_Tahsil, on_delete=models.CASCADE,null=True, blank=True)
    city_id = models.ForeignKey(DMS_City, on_delete=models.CASCADE,null=True, blank=True)
    ward_id = models.ForeignKey('DMS_Ward', on_delete=models.CASCADE,null=True, blank=True)
    emp_is_deleted = models.BooleanField(default=False)
    emp_added_by = models.CharField(max_length=255, null=True, blank=True)
    emp_added_date = models.DateTimeField(auto_now_add=True,null=True)
    emp_modified_by = models.CharField(max_length=255, null=True, blank=True)
    emp_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
 
 
   
class DMS_WebLogin(models.Model):
    log_id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(DMS_User, on_delete=models.CASCADE)
    emp_login_time = models.DateTimeField(auto_now=True)
    emp_logout_time = models.DateTimeField(null=True, blank=True)
    log_status = models.CharField(max_length=50)
    log_added_date = models.DateTimeField(auto_now=True)
    log_added_by = models.CharField(max_length=255, null=True, blank=True)
    log_modified_by = models.CharField(max_length=255, null=True, blank=True)





class DMS_Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    dep_id = models.ForeignKey(DMS_Department, on_delete=models.CASCADE)
    disaster_id = models.ForeignKey(DMS_Disaster_Type, on_delete=models.CASCADE)
    grp_id = models.ForeignKey(DMS_Group, on_delete=models.CASCADE)
    role_is_deleted = models.BooleanField(default=False)
    role_added_by = models.CharField(max_length=255, null=True, blank=True)
    role_added_date = models.DateTimeField(auto_now=True)
    role_modified_by = models.CharField(max_length=255, null=True, blank=True)
    role_modified_date = models.DateTimeField(null=True, blank=True)
  
class Weather_alerts(models.Model):
    pk_id = models.AutoField(primary_key=True)
    alert_code = models.CharField(max_length=255, null=True, blank=True, unique=True)
    latitude = models.FloatField(null=True,blank=True)
    longitude = models.FloatField(null=True,blank=True)
    elevation = models.FloatField(null=True,blank=True)
    timezone = models.TextField(null=True,blank=True)
    timezone_abbreviation = models.TextField(null=True,blank=True)
    utc_offset_seconds = models.IntegerField(null=True,blank=True)
    alert_datetime = models.DateTimeField(auto_now=True)
    temperature_2m = models.FloatField(null=True,blank=True)
    triger_status = models.IntegerField(null=True,blank=True)
    rain = models.FloatField(null=True,blank=True)
    precipitation = models.FloatField(null=True,blank=True)
    weather_code = models.IntegerField(null=True,blank=True)
    disaster_id = models.ForeignKey(DMS_Disaster_Type,on_delete=models.CASCADE,null=True,blank=True)
    ward = models.ForeignKey('DMS_Ward',on_delete=models.CASCADE,null=True,blank=True)
    relative_humidity_2m = models.IntegerField(null=True,blank=True)
    weather_code = models.IntegerField(null=True,blank=True)
    cloud_cover = models.IntegerField(null=True,blank=True)
    wind_speed_10m = models.FloatField(null=True,blank=True)   
    wind_gusts_10m  = models.FloatField(null=True,blank=True)      
    wind_direction_10m = models.IntegerField(null=True,blank=True)   
    visibility = models.FloatField(null=True,blank=True)       
    alert_type = models.IntegerField(null=True,blank=True)
    added_by=models.CharField(max_length=255,null=True,blank=True)
    added_date = models.DateTimeField(auto_now=True)
    modified_by = models.CharField(max_length=255, null=True, blank=True)
    modified_date = models.DateTimeField(null=True, blank=True)
    
    # def save(self, *args, **kwargs):
    #     if not self.alert_code:
    #         latest = Weather_alerts.objects.order_by('-pk_id').first()
    #         if latest and latest.alert_code and latest.alert_code.startswith('CALL-'):
    #             try:
    #                 last_number = int(latest.alert_code.split('-')[1])
    #             except:
    #                 last_number = 0
    #         else:
    #             last_number = 0
    #         self.alert_code = f"CALL-{last_number + 1:02d}"
    #     super().save(*args, **kwargs)
    
class DMS_SOP(models.Model):
    sop_id=models.AutoField(primary_key=True)
    sop_description=models.TextField(null=True,blank=True)
    disaster_id = models.ForeignKey(DMS_Disaster_Type,on_delete=models.CASCADE)
    sop_is_deleted = models.BooleanField(default=False)
    sop_added_by=models.CharField(max_length=255,null=True,blank=True)
    sop_added_date = models.DateTimeField(auto_now=True)
    sop_modified_by = models.CharField(max_length=255, null=True, blank=True)
    sop_modified_date = models.DateTimeField(null=True, blank=True)


class call_recieved_enum(enum.Enum):
    WhatsApp=1
    Social_Media=2
    
class DMS_Caller(models.Model):
    caller_pk_id = models.AutoField(primary_key=True)
    caller_no = models.BigIntegerField(null=True,blank=True)
    caller_name = models.CharField(max_length=255,null=True,blank=True)    
    caller_is_deleted = models.BooleanField(default=False)
    caller_added_by = models.CharField(max_length=255,null=True,blank=True)
    caller_added_date = models.DateTimeField(auto_now=True)
    call_recieved_from = enum.EnumField(call_recieved_enum,null=True,blank=True)
    caller_modified_by = models.CharField(max_length=255, null=True, blank=True)
    caller_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)

from django.utils.timezone import now
from django.db.models import Max
import re
class DMS_Incident(models.Model):
    inc_id = models.AutoField(primary_key=True)
    incident_id = models.CharField(max_length=255, unique=True, blank=True)
    # responder_scope = models.JSONField(null=True,blank=True)
    responder_scope = models.ManyToManyField('DMS_Responder',blank=True)
    alert_id = models.ForeignKey(Weather_alerts,on_delete=models.CASCADE,null=True,blank=True)
    caller_id = models.ForeignKey(DMS_Caller,on_delete=models.CASCADE,null=True,blank=True)
    notify_id = models.ForeignKey('DMS_Notify',on_delete=models.CASCADE,null=True,blank=True)
    alert_type = models.IntegerField(null=True,blank=True)
    location = models.TextField(null=True,blank=True)  
    summary = models.ForeignKey('DMS_Summary',on_delete=models.CASCADE,null=True,blank=True)
    latitude = models.FloatField(null=True,blank=True)
    longitude = models.FloatField(null=True,blank=True)
    inc_type =  models.IntegerField(null=True,blank=True,default=1)#emergency=1 2=nonemergency
    disaster_type = models.ForeignKey(DMS_Disaster_Type,on_delete=models.CASCADE,null=True,blank=True)
    comment_id = models.ForeignKey('DMS_Comments',on_delete=models.CASCADE,null=True,blank=True)
    alert_code = models.CharField(max_length=255,null=True,blank=True)
    alert_division=enum.EnumField(division_enum,null=True,blank=True)
    # inc_datetime = models.DateTimeField(auto_now=True)
    mode = models.IntegerField(null=True,blank=True)
    time = models.TimeField(null=True,blank=True)
    ward = models.ForeignKey('DMS_Ward',on_delete=models.CASCADE,null=True,blank=True)
    # ward_officer = models.ManyToManyField(
    #     'DMS_Ward',
    #     blank=True,
    #     related_name='ward_officer_scopes'
    # )
    tahsil = models.ForeignKey(DMS_Tahsil,on_delete=models.CASCADE,null=True,blank=True)
    district = models.ForeignKey(DMS_District,on_delete=models.CASCADE,null=True,blank=True)
    ward_officer = models.JSONField(null=True,blank=True)
    inc_is_deleted = models.BooleanField(default=False)
    clouser_status = models.BooleanField(default=False,null=True,blank=True)
    inc_added_by=models.CharField(max_length=255,null=True,blank=True)
    inc_added_date = models.DateTimeField(auto_now=True)
    inc_modified_by = models.CharField(max_length=255, null=True, blank=True)
    inc_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    call_recieved_from = enum.EnumField(call_recieved_enum,null=True,blank=True)
    call_type = models.ForeignKey('CallType',on_delete=models.CASCADE,null=True,blank=True)
    parent_complaint = models.ForeignKey('ParentComplaint',on_delete=models.CASCADE,null=True,blank=True)
 
 
    
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None

        if is_new and not self.incident_id:
            today_str = now().strftime('%Y%m%d')

            latest_incident = DMS_Incident.objects.filter(
                incident_id__startswith=today_str
            ).aggregate(Max('incident_id'))

            latest_id = latest_incident['incident_id__max']
            if latest_id:
                match = re.search(rf'{today_str}(\d+)', latest_id)
                last_seq = int(match.group(1)) if match else 0
                new_seq = last_seq + 1
            else:
                new_seq = 1

            self.incident_id = f"{today_str}{str(new_seq).zfill(5)}"

        super().save(*args, **kwargs)
    
    # def save(self, *args, **kwargs):
    #     is_new = self.pk is None
    #     super().save(*args, **kwargs)  

    #     if is_new and not self.incident_id:
    #         date_prefix = now().strftime('%Y%m%d')
    #         self.incident_id = f"{date_prefix}{str(self.inc_id).zfill(5)}"
    #         super().save(update_fields=['incident_id'])
    

    # def save(self, *args, **kwargs):
    #     is_new = self.pk is None
    #     super().save(*args, **kwargs)

    #     if is_new and not self.incident_id:
    #         date_prefix = now().strftime('%Y%m%d')
    #         self.incident_id = f"{date_prefix}{str(self.inc_id).zfill(5)}"
    #         super().save(update_fields=['incident_id'])

    #     if is_new and not self.alert_code:
    #         timestamp = now().strftime('%Y%m%d%H%M%S')
            
    #         latest_alert = DMS_Incident.objects.filter(alert_code__icontains='CALL-').order_by('-inc_id').first()
    #         if latest_alert and latest_alert.alert_code and 'CALL-' in latest_alert.alert_code:
    #             try:
    #                 last_number = int(latest_alert.alert_code.split('CALL-')[1])
    #             except:
    #                 last_number = 0
    #         else:
    #             last_number = 0

    #         next_number = last_number + 1
    #         self.alert_code = f"{timestamp}-CALL-{next_number:02d}"
    #         super().save(update_fields=['alert_code'])




class DMS_Comments(models.Model):
    comm_id = models.AutoField(primary_key=True)
    alert_id = models.ForeignKey(Weather_alerts,on_delete=models.CASCADE,null=True,blank=True)
    incident_id=models.ForeignKey(DMS_Incident,on_delete=models.CASCADE,null=True,blank=True)
    comments = models.TextField(null=True, blank=True)
    comm_chat = models.BooleanField(default=False)
    comm_is_deleted= models.BooleanField(default=False)
    comm_added_by=models.CharField(max_length=255,null=True,blank=True)
    comm_added_date = models.DateTimeField(auto_now=True)
    comm_modified_by = models.CharField(max_length=255, null=True, blank=True)
    comm_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    

class DMS_Alert_Type(models.Model):
    alert_id = models.AutoField(primary_key=True)
    alert_name = models.CharField(max_length=255,null=True,blank=True)
    alert_code = models.CharField(max_length=255,null=True,blank=True)
    alert_is_deleted= models.BooleanField(default=False)
    alert_added_by=models.CharField(max_length=255,null=True,blank=True)
    alert_added_date = models.DateTimeField(auto_now=True)
    alert_modified_by = models.CharField(max_length=255, null=True, blank=True)
    alert_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    
class DMS_Notify(models.Model):
    not_id = models.AutoField(primary_key=True)
    # alert_type_id = models.JSONField(null=True,blank=True)
    alert_type_id = models.ManyToManyField(
        'DMS_Responder',
        blank=True
    )
    incident_id=models.ForeignKey(DMS_Incident,on_delete=models.CASCADE,null=True,blank=True)
    disaster_type = models.ForeignKey(DMS_Disaster_Type,on_delete=models.CASCADE,null=True,blank=True)
    not_is_deleted= models.BooleanField(default=False)
    not_added_by=models.CharField(max_length=255,null=True,blank=True)
    not_added_date = models.DateTimeField(auto_now=True)
    not_modified_by = models.CharField(max_length=255, null=True, blank=True)
    not_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    

class DMS_Responder(models.Model):
    responder_id = models.AutoField(primary_key=True)
    responder_name = models.CharField(max_length=255)
    responder_is_deleted = models.BooleanField(default=False)
    responder_added_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    responder_added_by = models.CharField(max_length=255, null=True, blank=True)
    responder_modified_by = models.CharField(max_length=255, null=True, blank=True)
    responder_modified_date = models.DateTimeField(null=True, blank=True)
    
    
class DMS_Disaster_Responder(models.Model):
    pk_id = models.AutoField(primary_key=True)
    # res_id = models.JSONField()
    res_id = models.ManyToManyField(
        'DMS_Responder',
        blank=True,
        null=True
    )
    dis_id = models.ForeignKey(DMS_Disaster_Type,on_delete=models.CASCADE,null=True, blank=True)
    dr_is_deleted = models.BooleanField(default=False)
    dr_added_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    dr_added_by = models.CharField(max_length=255, null=True, blank=True)
    dr_modified_by = models.CharField(max_length=255, null=True, blank=True)
    dr_modified_date = models.DateTimeField(null=True, blank=True)
    
    


class DMS_incident_closure(models.Model):
    closure_id=models.AutoField(primary_key=True)
    incident_id=models.ForeignKey(DMS_Incident,on_delete=models.CASCADE,null=True,blank=True)
    responder = models.ForeignKey(DMS_Responder, on_delete=models.CASCADE, null=True, blank=True)
    # vehicle_no = models.CharField(max_length=100, null= True, blank=True)
    vehicle_no = models.ForeignKey(Vehical, on_delete=models.CASCADE, null=True, blank=True)
    closure_acknowledge=models.DateTimeField(null=True, blank=True)
    closure_start_base_location=models.DateTimeField(null=True, blank=True)
    closure_at_scene=models.DateTimeField(null=True, blank=True)
    closure_from_scene=models.DateTimeField(null=True, blank=True)
    closure_back_to_base=models.DateTimeField(null=True, blank=True)
    closure_is_abundant = models.BooleanField(default=False)
    closure_abundant=models.DateTimeField(null=True, blank=True)
    closure_is_deleted = models.BooleanField(default=False)
    image = models.FileField(upload_to='media_files/', null=True, blank=True)
    audio = models.FileField(upload_to='media_files/', null=True, blank=True)
    video = models.FileField(upload_to='media_files/', null=True, blank=True)
    closure_inc_id = models.CharField(max_length=255, null=True, blank=True)
    closure_amb_no = models.CharField(max_length=255, null=True, blank=True)
    closure_responder_name = models.CharField(max_length=100, null=True, blank=True)
    closure_added_by = models.CharField(max_length=255, null=True, blank=True)
    closure_added_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    closure_modified_by = models.CharField(max_length=255, null=True, blank=True)
    closure_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    closure_remark=models.CharField(max_length=255, null=True, blank=True)



class DMS_Summary(models.Model):
    sum_id = models.AutoField(primary_key=True)
    summary = models.CharField(max_length=5555, null=True, blank=True)
    sum_is_deleted = models.BooleanField(default=False)
    summary_type=enum.EnumField(summary_enum,null=True,blank=True)
    sum_added_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    sum_added_by = models.CharField(max_length=255, null=True, blank=True)
    sum_modified_by = models.CharField(max_length=255, null=True, blank=True)
    sum_modified_date = models.DateTimeField(null=True, blank=True)


class DMS_Disaster_Severity(models.Model):
    pk_id = models.AutoField(primary_key=True)
    hazard_types = models.CharField(max_length=255,null=True,blank=True)
    hazard_rng_low = models.CharField(max_length=255,null=True, blank=True)
    hazard_rng_medium = models.CharField(max_length=255,null=True, blank=True)
    hazard_rng_high = models.CharField(max_length=255,null=True, blank=True)
    unit = models.CharField(max_length=255,null=True,blank=True)
    is_deleted = models.BooleanField(default=False)
    added_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    added_by = models.CharField(max_length=255, null=True, blank=True)
    modified_by = models.CharField(max_length=255, null=True, blank=True)
    modified_date = models.DateTimeField(null=True, blank=True)
    

class DMS_Ward(models.Model):
    pk_id = models.AutoField(primary_key=True)
    ward_name = models.CharField(max_length=255,null=True,blank=True)
    tah_id = models.ForeignKey(DMS_Tahsil, on_delete=models.CASCADE)
    city_id = models.ForeignKey(DMS_City,on_delete=models.CASCADE) 
    ward_is_deleted = models.BooleanField(default=False)
    ward_added_by = models.CharField(max_length=255, null=True, blank=True)
    ward_added_date = models.DateTimeField(auto_now=True)
    ward_modified_by = models.CharField(max_length=255, null=True, blank=True)
    ward_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)

class DMS_Ward_Officers(models.Model):
    officer_id = models.AutoField(primary_key=True)
    ward_id = models.ManyToManyField(
        'DMS_Ward',
        blank=True,
        null=True
    )
    officer_name = models.CharField(max_length=255,null=True,blank=True)
    officer_contact = models.CharField(max_length=255,null=True,blank=True)
    officer_dept = models.CharField(max_length=255,null=True,blank=True)
    officer_designation = models.CharField(max_length=255,null=True,blank=True) 
    officer_is_deleted = models.BooleanField(default=False)
    officer_added_by = models.CharField(max_length=255, null=True, blank=True)
    officer_added_date = models.DateTimeField(auto_now=True)
    officer_modified_by = models.CharField(max_length=255, null=True, blank=True)
    officer_modified_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    


class DMS_open_weather_alerts(models.Model):
    alert_id = models.AutoField(primary_key=True)
    alert_code = models.CharField(max_length=255, null=True, blank=True, unique=True)
    location_ward = models.TextField()
    ward_id = models.IntegerField(null=True, blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    current_weather_time = models.DateTimeField()
    forecast_time = models.DateTimeField()
    last_updated = models.DateTimeField()
    temperature = models.FloatField(null=True, blank=True)
    feels_like = models.FloatField(null=True, blank=True)
    temp_min = models.FloatField(null=True, blank=True)
    temp_max = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    pressure = models.FloatField(null=True, blank=True)
    sea_level = models.FloatField(null=True, blank=True)
    grnd_level = models.FloatField(null=True, blank=True)
    visibility = models.FloatField(null=True, blank=True)
    wind_speed = models.FloatField(null=True, blank=True)
    wind_deg = models.FloatField(null=True, blank=True)
    wind_gust = models.FloatField(null=True, blank=True)
    cloud_coverage = models.FloatField(null=True, blank=True)
    weather_main = models.CharField(max_length=100, null=True, blank=True)
    weather_desc = models.CharField(max_length=200, null=True, blank=True)
    rain_past_1h = models.FloatField(null=True, blank=True)
    snow_past_1h = models.FloatField(null=True, blank=True)
    rain_forecast_3h = models.FloatField(null=True, blank=True)
    alerts = models.JSONField(null=True, blank=True)
    triger_status = models.IntegerField(null=True,blank=True)
    disaster_id = models.ForeignKey(DMS_Disaster_Type,on_delete=models.CASCADE,null=True,blank=True)
    alert_type = models.CharField(max_length=255, null=True, blank=True)
    added_by = models.CharField(max_length=255, null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True)  # Only once at creation
    modified_by = models.CharField(max_length=255, null=True, blank=True)
    modified_date = models.DateTimeField(auto_now=True)   # Every time on update
 
    def __str__(self):
        return f"{self.alert_id } @ {self.current_weather_time}"
    
class TwitterDMS(models.Model):
    id = models.AutoField(primary_key=True)
    text = models.TextField(null=True, blank=True)
    translated_text = models.TextField(null=True, blank=True)
    user = models.CharField(max_length=1000,null=True, blank=True)
    language = models.CharField(max_length=1000, blank=True, null=True)
    region = models.CharField(max_length=500,null=True, blank=True)
    link = models.CharField(max_length=10000,null=True, blank=True)
    media_status = enum.EnumField(media_enum,null=True,blank=True)
    date_time = models.DateTimeField(null=True, blank=True)
    added_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    def __str__(self):
        return self.tweet_id



    
    
# ___________ Source ___________________________
class agg_source(models.Model): 
    source_pk_id = models.AutoField(primary_key=True)
    source_code = models.CharField(max_length=255, editable=False, unique=True)
    created_date = models.DateField(default=timezone.now, editable=False)

    source = models.CharField(max_length=255,unique=True)
    # Group_id = models.ForeignKey('agg_mas_group',on_delete=models.CASCADE,null=True)

    is_deleted = models.BooleanField(default=False)
    added_by =	models.IntegerField(null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True, blank=True)
    modify_by =	models.IntegerField(null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    def generate_id(self):
        last_id = agg_source.objects.filter(created_date=self.created_date).order_by('-source_code').first()
        if last_id and '-' in last_id.source_code:
            last_id_parts = last_id.source_code.split('-')
            if len(last_id_parts) >= 2:
                last_id_value = int(last_id_parts[1][-5:])
                new_id_value = last_id_value + 1   
                
                return int(str(self.created_date.strftime('%d%m%Y')) + str(new_id_value).zfill(5))
        
        return int(str(self.created_date.strftime('%d%m%Y')) + '00001')

    def save(self, *args, **kwargs):
        if not self.source_code:
            generated_id = self.generate_id()
            self.source_code = f"SOURCE-{generated_id}"
            super(agg_source, self).save(*args, **kwargs)
            
            
            
class role(models.Model):
    role_id = models.AutoField(primary_key=True)
    # permission_name = models.ForeignKey('permission',on_delete=models.CASCADE,null=True)
    Group_id = models.ForeignKey('DMS_Group',on_delete=models.CASCADE,null=True)
    source =models.ForeignKey('DMS_Department',on_delete=models.CASCADE,null=True)
    # modules = models.ForeignKey('Permission_module',on_delete=models.CASCADE,null=True)
    # guard_name = models.CharField(max_length=255)
    role_is_deleted = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    added_by =	models.IntegerField(null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True, blank=True)
    modify_by =	models.IntegerField(null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    
class Permission_module(models.Model):
    module_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=250, null=True)
    Source_id = models.ForeignKey("DMS_Department", on_delete=models.CASCADE,null = True)
    added_date = models.DateTimeField(auto_now_add=True)
    added_by = models.IntegerField(blank=True, null=True)
    modify_by =	models.IntegerField(null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.name

    
class permission(models.Model):
    Permission_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    module = models.ForeignKey("Permission_module", on_delete=models.CASCADE,null = True)
    # source =models.ForeignKey('agg_source',on_delete=models.CASCADE,null=True)
    source =models.ForeignKey('DMS_Department',on_delete=models.CASCADE,null=True)
    # guard_name = models.CharField(max_length=255)
    added_by =	models.IntegerField(null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True, blank=True)
    modify_by =	models.IntegerField(null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.name     
    
    
class permission_action(models.Model):
    action_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    sub_module = models.ForeignKey("permission", on_delete=models.CASCADE,null = True)
    # source =models.ForeignKey('agg_source',on_delete=models.CASCADE,null=True)
    # guard_name = models.CharField(max_length=255)
    added_by =	models.IntegerField(null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True, blank=True)
    modify_by =	models.IntegerField(null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.name     

      


class agg_save_permissions(models.Model):
    id = models.AutoField(primary_key=True)
    source =models.ForeignKey('DMS_Department',on_delete=models.CASCADE,null=True)
    role = models.ForeignKey('DMS_Group',on_delete=models.CASCADE,null=False)
    modules_submodule = models.JSONField(null=True)
    # modules = models.ForeignKey('Permission_module',on_delete=models.CASCADE,null=True)
    # sub_module = models.ManyToManyField('Permission', related_name='roles', blank=True)
    added_date = models.DateTimeField(auto_now_add=True)
    added_by = models.IntegerField(blank=True, null=True)
    modify_by =	models.IntegerField(null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True)
    
    
class DMS_Disaster_Severity2(models.Model):
    pk_id = models.AutoField(primary_key=True)
    hazard_types = models.CharField(max_length=255,null=True,blank=True)
    hazard_rng_low = models.CharField(max_length=255,null=True, blank=True)
    hazard_rng_medium = models.CharField(max_length=255,null=True, blank=True)
    hazard_rng_high = models.CharField(max_length=255,null=True, blank=True)
    unit = models.CharField(max_length=255,null=True,blank=True)
    is_deleted = models.BooleanField(default=False)
    added_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    added_by = models.CharField(max_length=255, null=True, blank=True)
    modified_by = models.CharField(max_length=255, null=True, blank=True)
    modified_date = models.DateTimeField(null=True, blank=True)





class CallType(models.Model):
    call_type_id = models.AutoField(primary_key=True)
    call_type_name = models.CharField(max_length=100, null=True, blank=True)
    call_type_code = models.CharField(max_length=50, null=True, blank=True)
    call_type_is_deleted = models.BooleanField(default=False)
    added_date = models.DateTimeField(auto_now=True, null=True, blank=True)
    added_by = models.CharField(max_length=255, null=True, blank=True)
    modified_by = models.CharField(max_length=255, null=True, blank=True)
    modified_date = models.DateTimeField(null=True, blank=True)
 
class ParentComplaint(models.Model):
    pc_id = models.AutoField(primary_key=True)
    pc_code = models.CharField(max_length=100, null=True, blank=True)
    pc_type = models.CharField(max_length=100, null=True, blank=True)
    pc_name = models.CharField(max_length=100, null=True, blank=True)
    parent_is_deleted = models.BooleanField(default=False)
    call_type_id = models.ForeignKey(CallType, on_delete=models.CASCADE,null=False, blank=True)
    added_date = models.DateTimeField(auto_now=True, null=True, blank=True)
    added_by = models.CharField(max_length=255, null=True, blank=True)
    modified_by = models.CharField(max_length=255, null=True, blank=True)
    modified_date = models.DateTimeField(null=True, blank=True)