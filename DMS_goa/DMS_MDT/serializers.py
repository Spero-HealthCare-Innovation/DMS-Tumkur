from rest_framework import serializers
from DMS_MDT.models import *
from admin_web.models import DMS_Group, DMS_User
# class vehical_serializer(serializers.ModelSerializer):
#     class Meta:
#         model = Vehical
#         fields = ['veh_id','veh_number','veh_default_mobile']
class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehical
        fields = ['veh_number', 'veh_default_mobile']
    
    def create(self, validated_data):
        print(validated_data['veh_number'])
        print(validated_data['veh_default_mobile'])
        grp_obj = DMS_Group.objects.get(grp_id=1)
        if Vehical.objects.filter(veh_number=validated_data['veh_number']).exists():
            raise serializers.ValidationError("Vehicle with this number already exists.")
        try:
            username = validated_data['veh_number']
            mobile = validated_data['veh_default_mobile']
        except ValueError:
            return serializers.ValidationError("enter proper user name and mobile number")
        if not username: 
            raise serializers.ValidationError("please enter vehicle no")
        if not mobile: 
            raise serializers.ValidationError("please enter vehicle contact number")
        user = DMS_User.objects.create_user(
            user_username=username,
            password=mobile,
            grp_id=grp_obj
        )
        print(user.user_id)
        Vehicals = Vehical.objects.create(
            veh_number=username,
            veh_default_mobile=mobile,
            user=user
            )
        return Vehicals

class vehicleserializer(serializers.ModelSerializer):
    class Meta: 
        model = Vehical
        fields = ['veh_number', 'veh_default_mobile']

class vehi_login_info_serializer(serializers.ModelSerializer):
    class Meta:
        model = vehicle_login_info
        fields = ['veh_login_id','veh_login_time','veh_logout_time','veh_id', 'latitude', 'longitude', 'device_id']
        
class emp_clockin_serializer(serializers.ModelSerializer):
    class Meta:
        model = employee_clockin_info
        fields = ['emp_clockin_id','emp_clockin_time','clock_out_in_status','emp_id','veh_id', 'emp_image']
        
class add_device_serializer(serializers.ModelSerializer):
    # class Meta:
    #     model = Device_version_info 
    #     fields = ['device_version_id','os_name','os_version','app_location','app_current_version','app_compulsory_version']
    class Meta:
        model = Device_version
        fields = ['device_id','os_version', 'device_platform', 'app_version', 'device_timezone', 'date_time', 'device_token', 'model_name']
     
class inc_veh_serialiZers(serializers.ModelSerializer):
    class Meta:
        model = incident_vehicles
        fields = ["inc_veh_id","incident_id","veh_id","dep_id"]
        
class Vehical_department_wise_serializer(serializers.ModelSerializer):
    class Meta:
        model = Vehical
        fields = ["veh_id","veh_number"] 

class base_location_vehicle_serializer(serializers.ModelSerializer):
    class Meta:
        model = Vehical_base_location
        fields = "__all__"

class incident_veh_serializer(serializers.ModelSerializer):
    class Meta:
        model = incident_vehicles
        fields = "__all__"
        
class vehicle_serializer(serializers.ModelSerializer):
    class Meta:
        model = Vehical
        fields = "__all__"