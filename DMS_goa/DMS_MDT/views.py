from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import *  
from .models import *
from django.contrib.auth import authenticate
import hashlib
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework import status
from rest_framework.decorators import api_view
from django.utils import timezone
from admin_web.models import *
import math
# from datetime import datetime
from datetime import datetime, timedelta

from datetime import datetime

class Register_veh(APIView):
    def post(self, request):
        data=UserRegistrationSerializer(data=request.data)
        if data.is_valid():
            data.save()
            return Response(data.data)
        return Response(data.errors)
    
class VehicleLogin(APIView):
    def post(self, request):
        print('one')
        vehiseri={
            "veh_number" : request.data.get('vehicleNumber'),
            "veh_default_mobile" : request.data.get('password')
        }
        print('on2e')
        lat = request.data.get('lat')
        long = request.data.get('lng')
        
        # vehicle_serializer = vehicleserializer(data=vehiseri)
        # if not vehicle_serializer.is_valid():
        #     return Response(vehicle_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        print('12')
        veh_number = request.data.get('vehicleNumber')
        password = request.data.get('password')
        employee_ids = list(request.data.get('pilotid[]').replace('[','').replace(']','').replace(',',''))
        # print(employee_ids, 'ids')
        employee_photo = request.FILES.getlist('photo[]')
        # print(employee_photo, 'photos')
        user = authenticate(user_username=veh_number, password=password)
        if not user:
            return Response({
                            "data": None,
                            "error": {
                                "code": 1,
                                "message": 'Invalid credentials'
                            }
                        }, status=status.HTTP_401_UNAUTHORIZED)
        user_obj = DMS_User.objects.filter(user_username=veh_number, user_is_deleted=False).last()
        if not user_obj:
            return Response({
                        "data": None,
                        "error": {
                            "code": 1,
                            "message": 'User not found'
                        }
                    }, status=status.HTTP_200_OK)
        if user_obj.user_is_login:
            return Response({
                "data": None,
                "error": {
                    "code": 1,
                    "message": 'User already logged in'
                }
            }, status=status.HTTP_200_OK)
        vehicle_obj = Vehical.objects.filter(user=user_obj).last()
        if not vehicle_obj:
            return Response({
                "data": None,
                "error": {
                    "code": 1,
                    "message": 'Vehicle not found'
                }
            }, status=status.HTTP_404_NOT_FOUND)
        active_employees = employee_clockin_info.objects.filter(emp_id__in=employee_ids, clock_out_in_status =1,status=1)
        if active_employees.exists():
            conflict_messages = [
                f"Employee '{e.emp_id.emp_name}' is already logged in on vehicle '{e.veh_id.veh_number}'"
                for e in active_employees
            ]
            return Response({
                    "data": None,
                    "error": {
                        "code": 1,
                        "message": str(conflict_messages)
                    }
                }, status=status.HTTP_200_OK)
        # emp_data = [{'emp_clockin_time': now(),'emp_id': emp_id,'veh_id': vehicle_obj.veh_id} for emp_id in employee_ids]
        emp_data = [{'emp_clockin_time': timezone.now(),'emp_id': emp_id,'veh_id': vehicle_obj.veh_id, 'emp_image':emp_image} for emp_id, emp_image in zip(employee_ids,employee_photo)]
        # print(emp_data, 'datas')
        emp_serializer = emp_clockin_serializer(data=emp_data, many=True)
        if not emp_serializer.is_valid():
            return Response(emp_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        emp_serializer.save()
        user_obj.user_is_login = True
        user_obj.save()
        previous_sessions = vehicle_login_info.objects.filter(veh_id=vehicle_obj.veh_id, status=1)
        for session in previous_sessions:
            session.status = 2
            session.veh_logout_time = timezone.now()
            session.save()
        login_data = {
            'veh_login_time': timezone.now(),
            'veh_id': vehicle_obj.veh_id,
            'latitude':lat,
            'longitude':long,
        }
        print(login_data)
        login_serializer = vehi_login_info_serializer(data=login_data)
        if not login_serializer.is_valid():
            return Response(login_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        login_serializer.save()
        token = RefreshToken.for_user(user)
        return Response({
                        "data": {
                            "userName": "Pilot - Mr.Madhukar Narsing Kamble, Pilot - Mr.Israr Jabbar Khan",
                            "message": "Successfully Login",
                            'access': str(token.access_token),
                            'refresh': str(token),
                        },
                        "error": None
                        }, status=status.HTTP_200_OK)
    
class VehicleLogout(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            veh_number = request.data.get('veh_number')
            logout_odometer = request.data.get('logoutOdometer')
            logout_question = request.data.get('logoutquestion')
            uploaded_image = request.FILES.get('uploadedimage')
            type_val = request.data.get('type')

            if not all([refresh_token, veh_number]):
                return Response({
                    "data": {
                        "code": 1,
                        "message": "Not Logout"
                    },
                    "error": None
                }, status=status.HTTP_200_OK)

            user_obj = DMS_User.objects.filter(user_username=veh_number).last()
            if not user_obj:
                return Response({
                    "data": {
                        "code": 1,
                        "message": "User does not exist"
                    },
                    "error": None
                }, status=status.HTTP_200_OK)

            if not user_obj.user_is_login:
                return Response({
                    "data": {
                        "code": 1,
                        "message": "User already logged out"
                    },
                    "error": None
                }, status=status.HTTP_200_OK)

            try:
                token_obj = RefreshToken(refresh_token)
                token_obj.blacklist()
            except TokenError:
                # return Response({
                #     "data": {
                #         "code": 1,
                #         "message": "Invalid or expired refresh token"
                #     },
                #     "error": None
                # }, status=status.HTTP_200_OK)
                pass

            vehicle_obj = Vehical.objects.filter(veh_number=veh_number).last()
            if not vehicle_obj:
                return Response({
                    "data": {
                        "code": 1,
                        "message": "Vehicle not found"
                    },
                    "error": None
                }, status=status.HTTP_200_OK)

            # Update active vehicle sessions
            active_vehicle_sessions = vehicle_login_info.objects.filter(veh_id=vehicle_obj.veh_id, status=1)
            for session in active_vehicle_sessions:
                session.clock_out_in_status = 2
                session.veh_logout_time = timezone.now()
                if logout_odometer:
                    session.logout_odometer = logout_odometer
                if logout_question:
                    session.logout_question = logout_question
                if uploaded_image:
                    session.logout_image = uploaded_image
                session.save()

            # Update employee sessions
            active_employee_sessions = employee_clockin_info.objects.filter(
                veh_id=vehicle_obj.veh_id, 
                clock_out_in_status=1, 
                status=1
            )
            for emp in active_employee_sessions:
                emp.clock_out_in_status = 2
                emp.emp_clockout_time = timezone.now()
                emp.save()

            user_obj.user_is_login = False
            user_obj.save()

            return Response({
                "data": {
                    "code": 1,
                    "message": "Successfully Logout"
                },
                "error": None
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "data": {
                    "code": 1,
                    "message": "Not Logout"
                },
                "error": None
            }, status=status.HTTP_200_OK)
        
class employee_list(APIView):
    def get(self,request):
        user = DMS_Employee.objects.filter(emp_is_deleted=False)
        return Response('done')
    
class add_device(APIView):
    def post(self,request):
        print(request.data,'1')
        data = {}
        data['os_version'] = request.data.get('osVersion')
        data['device_platform'] = 1 if request.data.get('devicePlatform') == 'Android' else 2 if request.data.get('devicePlatform') == 'iOS' else None
        data['app_version'] = request.data.get('appVersion')
        data['device_timezone'] = request.data.get('deviceTimezone')
        data['date_time'] = request.data.get('deviceCurrentTimestamp')
        data['device_token'] = request.data.get('token')
        data['model_name'] = request.data.get('modelName')
        if request.data['deviceId'] != 0:
            device = Device_version.objects.filter(device_id=request.data['deviceId']).last()
            device = add_device_serializer(device,data=data)
        else:
            device = add_device_serializer(data=data)
        if device.is_valid():
            device.save()
            if device.data['device_platform']== 'Android':
                device_version=Device_version_info.objects.filter(os_name=1, status=1).last()
            else:
                device_version=Device_version_info.objects.filter(os_name=2, status=1).last()
            return Response({
                    "data": {
                        "deviceId": device.data['device_id'],
                        "versionInfo":{
                                        "id": device_version.device_version_id,
                                        "devicePlatform": "Android" if device_version.os_name == 1 else "iOS",
                                        "currentVersion": int(device_version.app_current_version) if device_version.app_current_version else None,
                                        "lastCompulsoryVersion": int(device_version.app_compulsory_version) if device_version.app_compulsory_version else None,
                                        "locationPath": device_version.app_location
                                    }
                    },
                    "error": None
                }, status=status.HTTP_201_CREATED)
        else:
            return Response ({
                    "data": None,
                    "error": device.errors
                }, status=status.HTTP_201_CREATED)
class get_base_location_vehicle(APIView):
    def get(self, request):
        veh_base = Vehical_base_location.objects.filter(status=1)
        veh_base_serializer = base_location_vehicle_serializer(veh_base, many=True)
        return Response(veh_base_serializer.data, status=status.HTTP_200_OK)
    
# class get_vehicle(APIView):
#     def get(self, request):
#         veh_base_location = request.GET.get("veh_base_loc")
#         responder = request.GET.get("responder")
#         lat = request.GET.get("lat")
#         long = request.GET.get("long")

#         veh = Vehical.objects.filter(status=1)

#         if veh_base_location:
#             veh = veh.filter(veh_base_location=veh_base_location)

#         if responder:
#             veh = veh.filter(responder=responder)

#         veh_serializer = vehicle_serializer(veh, many=True)
#         return Response(veh_serializer.data, status=status.HTTP_200_OK)

class get_vehicle(APIView):
    def get(self, request):
        veh_base_location = request.GET.get("veh_base_loc")
        responder = request.GET.get("responder")
        lat = request.GET.get("lat")
        long = request.GET.get("long")
        veh_num = request.GET.get("veh_num")

        veh = Vehical.objects.filter(status=1)

        if veh_base_location:
            veh = veh.filter(veh_base_location=veh_base_location)

        if responder:
            veh = veh.filter(responder=responder)
        if veh_num:
            veh = veh.filter(veh_number=veh_num)

        # Convert to float (only if lat/long provided)
        try:
            lat = float(lat)
            long = float(long)
        except (TypeError, ValueError):
            lat, long = None, None

        veh_data = []
        for v in veh:
            v_data = {
                "veh_id": v.veh_id,
                "veh_number": v.veh_number,  
                "veh_base_location": v.veh_base_location.bs_name if v.veh_base_location and v.veh_base_location.bs_name else None,  
                "veh_app_lat": v.veh_app_lat,
                "veh_app_log": v.veh_app_log,
                "veh_gps_lat": v.veh_gps_lat,
                "veh_gps_log": v.veh_gps_log,
                "vehical_status": v.vehical_status,
            }

            if lat and long and v.veh_app_lat and v.veh_gps_log:
                # Calculate distance (km) using haversine
                distance_km = self.haversine(lat, long, float(v.veh_app_lat), float(v.veh_gps_log))
                v_data["distance_km"] = round(distance_km, 2)

                # Calculate ETA (hours) assuming avg speed = 40 km/h
                avg_speed = 40.0  # km/h
                eta_hours = distance_km / avg_speed if avg_speed > 0 else 0
                eta_minutes = eta_hours * 60
                v_data["eta_minutes"] = round(eta_minutes, 1)
            else:
                v_data["distance_km"] = None
                v_data["eta_minutes"] = None

            veh_data.append(v_data)

        return Response(veh_data, status=status.HTTP_200_OK)

    def haversine(self, lat1, lon1, lat2, lon2):
        """
        Calculate great-circle distance between two points (lat1, lon1) and (lat2, lon2)
        Returns distance in kilometers
        """
        R = 6371  # Earth radius in km
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)

        a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c
    
class emp_clockinout(APIView):
    def post(self, request):
        data={}
        # request.data['latitude']=request.data.pop('lat')
        # request.data['longitude']=request.data.pop('lng')
        # data['veh_login_time']=request.data.get('veh_login_time')
        # data['veh_logout_time']=request.data.get('veh_logout_time')
        # data['veh_login_time']=request.data.get('clockTime') if request.data.get('clockTime')=='in' else data['veh_logout_time']=request.data.get('veh_logout_time') if request.data.get('clock_out_in_status') else None
        if request.data.get('clockTime') == 'in':
            data['veh_login_time'] = request.data.get('clockTime')
        elif request.data.get('clock_out_in_status'):
            data['veh_logout_time'] = request.data.get('veh_logout_time')
        else:
            data['veh_logout_time'] = None
 
        data['veh_id']=Vehical.objects.filter(veh_number=request.data.get('vehicleNumber')).last().veh_id if request.data.get('vehicleNumber') else None
        data['latitude']=request.data.get('lat')
        data['longitude']=request.data.get('lng')
        data['device_id']=request.data.get('device_id')
        employee = emp_clockin_serializer(data=data)
        if employee.is_valid():
            employee.save()
            return Response(employee.data, status=status.HTTP_201_CREATED)
        return Response(employee.errors, status=status.HTTP_400_BAD_REQUEST)

class Vehical_department_wise(APIView):
    def get(self, request):
        # vehicle_number = request.data.get('vehicleNumber')
        vehicle_responder = request.data.get('responder')
        inc_veh = Vehical.objects.filter(dep_id=vehicle_responder,status=1)
        vehicles = Vehical_department_wise_serializer(inc_veh, many=True)
        return Response({'data':vehicles.data})
 

# vehicleNumber:MH-14-CL-0463
# userId:297
# lat:18.595993
# lng:73.7587962
# clockTime:2025-05-22 14:32:19
# clock_out_in_status:in

@api_view(["POST"])
def update_pcr_report(request):
    data = request.data

    inc_id = int(data.get("inc_id"))
    status_code = int(data.get("status"))
    ambulance_no = data.get("ambulance_no")
    lat = data.get("lat")
    lng = data.get("lng")
    at_scene_remark = data.get("at_scene_remark")
    from_scene_remark = data.get("from_scene_remark")
    at_scene_photo = request.FILES.get("at_scene_photo")
    from_scene_photo = request.FILES.get("from_scene_photo")

    inc_id = DMS_Incident.objects.filter(inc_id=inc_id).last()
    ambulance_no = Vehical.objects.filter(veh_number=ambulance_no).last()
    try:
        # ✅ record get or create (based on incident id)
        report, created = PcrReport.objects.get_or_create(
            incident_id=inc_id,
            defaults={"pcr_id": inc_id, "amb_no": ambulance_no}
        )

        report.status = status_code
        report.amb_no = ambulance_no

        # ✅ Enum wise updates
        if status_code == PcrStatusEnum.Acknowledge.value:
            report.acknowledge_time = timezone.now()
            report.acknowledge_lat = lat
            report.acknowledge_lng = lng
            report.status = 1
            code = 2
            message = "Acknowledged and inserted successfully."

        elif status_code == PcrStatusEnum.StartedFromBase.value:
            report.start_from_base_time = timezone.now()
            report.start_fr_bs_loc_lat = lat
            report.start_fr_bs_loc_lng = lng
            report.status = 2
            code = 3
            message = "Status updated successfully."

        elif status_code == PcrStatusEnum.AtScene.value:
            report.at_scene_time = timezone.now()
            report.at_scene_lat = lat
            report.at_scene_lng = lng
            if at_scene_remark:
                report.at_scene_remark = at_scene_remark
            if at_scene_photo:
                report.at_scene_photo = at_scene_photo
            report.status = 3
            code = 4
            message = "Status updated successfully."
            
        elif status_code == PcrStatusEnum.DepartedFromScene.value:
            report.from_scene_time = timezone.now()
            report.from_scene_lat = lat
            report.from_scene_lng = lng
            if from_scene_remark:
                report.from_scene_remark = from_scene_remark
            if from_scene_photo:
                report.from_scene_photo = from_scene_photo
            report.status = 4
            code = 5
            message = "Status updated successfully."
            
        elif status_code == PcrStatusEnum.BackToBase.value:
            report.back_to_base_time = timezone.now()
            report.back_to_bs_loc_lat = lat
            report.back_to_bs_loc_lng = lng
            report.status = 5
            code = 6
            message = "Status updated successfully."
            

        elif status_code == PcrStatusEnum.Abandoned.value:
            report.abandoned_time = timezone.now()
            report.abandoned_lat = lat
            report.abandoned_lng = lng
            
            code = 7
            message = "Status updated successfully."

        # ✅ Extra handling for incident_vehicles
        if status_code == 1:  # Acknowledge
            incident_vehicles.objects.filter(incident_id=inc_id).update(pcr_status=2)

        # elif status_code == 6:  # Back to Base
        #     incident_vehicles.objects.filter(incident_id=inc_id).update(pcr_status=3)

        report.save()
        # return Response(
        #     {"message": "PCR Report updated successfully", "status": "success"},
        #     status=status.HTTP_200_OK
        # )
    
        return Response({
            "data": {
                "code": code,
                "message": message
            },
            "error": None
        })

    except Exception as e:
        return Response(
            {"message": f"Error: {str(e)}", "status": "failed"},
            status=status.HTTP_400_BAD_REQUEST
        )

class get_alldriverparameters(APIView):
    def post(self, request):
        try:
            user_id = request.user.user_id
        except AttributeError:
            return Response({"data": [],"error": None},status=status.HTTP_401_UNAUTHORIZED)
        inc_id = request.data["incidentId"]
        print("inc id in assign inc call", inc_id)
        pcr_rep = PcrReport.objects.get(incident_id = inc_id, amb_no__user = user_id)
        # assign_inc_objs_arr = []
        assign_inc_obj = {
            "id": str(pcr_rep.incident_id.inc_id),
            "acknowledge": pcr_rep.acknowledge_time,
            "startFromBaseLocation": pcr_rep.start_from_base_time,
            "atScene": pcr_rep.at_scene_time,
            "fromScene": pcr_rep.from_scene_time,
            "backToBaseLocation": pcr_rep.back_to_base_time,
            "inDateTime": pcr_rep.incident_id.inc_added_date
        } 
        # assign_inc_objs_arr.append(assign_inc_obj)
        return Response({"data": assign_inc_obj, "error": None}, status=status.HTTP_200_OK)

class get_assign_inc_calls(APIView):
    # def get(self, request):
    def post(self, request):
        try:
            user_id = request.user.user_id
        except AttributeError:
            return Response(
                {"data": [],"error": None},status=status.HTTP_401_UNAUTHORIZED)
        
        inc_veh = incident_vehicles.objects.filter(veh_id__user = user_id, status=1, jobclosure_status=2).order_by("-added_date")
        assign_inc_objs_arr = []
        for veh in inc_veh:
            assign_inc_obj = {
                "incidentId": str(veh.incident_id.inc_id),
                "incidentDate": veh.incident_id.inc_added_date,
                "incidentTime": veh.incident_id.inc_added_date,
                "callType": veh.incident_id.disaster_type.disaster_name,
                "lat": veh.incident_id.latitude,
                "long": veh.incident_id.longitude,
                "incidentAddress": veh.incident_id.location,
                "incidentStatus": str(veh.pcr_status),
                "currentStatus": {
                    "code": 5,
                    "outOfSych": "false",
                    "message": "Already back to base"
                },
                "incidentCallsStatus": "In-progress",
                "clikable": "true",
                "progress": "true",
                "completed": "false",
                "onsceneCare": None
            }
            assign_inc_objs_arr.append(assign_inc_obj)
        # inc_veh_serializer = incident_veh_serializer(inc_veh, many=True)
        return Response({"data": assign_inc_objs_arr, "error": None}, status=status.HTTP_200_OK)
    

# class get_assign_completed_inc_calls(APIView):
#     def post(self, request):
#         try:
#             user_id = request.user.user_id
#         except AttributeError:
#             return Response(
#                 {"data": [],"error": None},status=status.HTTP_401_UNAUTHORIZED)
        
#         print("user id in assign inc call", user_id)
#         inc_veh = incident_vehicles.objects.filter(veh_id__user = user_id, status=1, jobclosure_status=1).order_by("-added_date")
#         print("incident vehicles:", inc_veh)
#         assign_inc_objs_arr = []
#         for veh in inc_veh:
#             incident_datetime = veh.incident_id.inc_added_date  # already a datetime object
#             incidentDate = incident_datetime.strftime("%Y-%m-%d")   # e.g. "2025-08-25"
#             incidentTime = incident_datetime.strftime("%H:%M:%S")   # e.g. "12:13:20"
#             assign_inc_obj = {
#                 "incidentId": str(veh.incident_id.inc_id),
#                 "incidentDate": incidentDate,
#                 "incidentTime": incidentTime,
#                 "callType": "Emergency",
#                 "CallerRelationName": "",
#                 "incidentCallsStatus": "Completed",
#                 "callerName":"Vinayak"
#             } 
#             assign_inc_objs_arr.append(assign_inc_obj)
#         return Response({"data": assign_inc_objs_arr, "error": None}, status=status.HTTP_200_OK)


class get_assign_completed_inc_calls(APIView):
    def post(self, request):
        try:
            user_id = request.user.user_id
        except AttributeError:
            return Response(
                {"data": [],"error": None},status=status.HTTP_401_UNAUTHORIZED)
        
        print("user id in assign inc call", user_id)
        inc_veh = incident_vehicles.objects.filter(veh_id__user = user_id, status=1, jobclosure_status=1).order_by("-added_date")
        print("incident vehicles:", inc_veh)
        assign_inc_objs_arr = []
        for veh in inc_veh:
            incident_datetime = veh.incident_id.inc_modified_date  # already a datetime object
            incidentDate = incident_datetime.strftime("%Y-%m-%d")   # e.g. "2025-08-25"
            incidentTime = incident_datetime.strftime("%H:%M:%S")   # e.g. "12:13:20"
            assign_inc_obj = {
                "incidentId": str(veh.incident_id.inc_id),
                "incidentDate": incidentDate,
                "incidentTime": incidentTime,
                "callType": veh.incident_id.call_type.call_type_name if veh.incident_id.call_type else None,
                "CallerRelationName": "",
                "incidentCallsStatus": "Completed",
                "callerName":veh.incident_id.caller_id.caller_name if veh.incident_id.caller_id else None
            } 
            assign_inc_objs_arr.append(assign_inc_obj)
        return Response({"data": assign_inc_objs_arr, "error": None}, status=status.HTTP_200_OK)

class get_assign_inc_calls(APIView):
    def post(self, request):
        user_id = request.user.user_id
        # print("user id in assign inc call", user_id)
        inc_veh = incident_vehicles.objects.filter(veh_id__user = user_id, status=1, jobclosure_status=2).order_by("-added_date")
        # print("incident vehicles:", inc_veh)
        assign_inc_objs_arr = []
        for veh in inc_veh:
            pcr_exists = PcrReport.objects.filter(incident_id=veh.incident_id).last()
            print(pcr_exists)
            assign_inc_obj = {
                "incidentId": str(veh.incident_id.inc_id),
                "incidentDate": veh.incident_id.inc_added_date,
                "incidentTime": veh.incident_id.inc_added_date,
                # "callType": veh.incident_id.disaster_type.disaster_name if veh.incident_id.disaster_type else None,
                "callType": veh.incident_id.call_type.call_type_name if veh.incident_id.call_type else None,
                "callerName":veh.incident_id.caller_id.caller_name if veh.incident_id.caller_id else None,
                "lat": veh.incident_id.latitude,
                "long": veh.incident_id.longitude,
                "incidentAddress": veh.incident_id.location,
                "incidentStatus": str(veh.pcr_status),
                "currentStatus": {
                    "code": pcr_exists.status if pcr_exists else 0,
                    "outOfSych": "false",
                    "message": "Already back to base"
                },
                "incidentCallsStatus": "Pending" if veh.pcr_status==1 else "In-progress" if veh.pcr_status == 2 else "Complete",
                "clikable": "true",
                "progress": "true",
                "completed": "true" if veh.jobclosure_status==1 else "false",
                "onsceneCare": None
            }
            assign_inc_objs_arr.append(assign_inc_obj)
        # inc_veh_serializer = incident_veh_serializer(inc_veh, many=True)
        return Response({"data": assign_inc_objs_arr}, status=status.HTTP_200_OK)

class vehicleotp(APIView):
    def post(self, request):
        vehicle_number = request.data.get('vehicleNumber')
        password = request.data.get('password')  # This should be MD5 hashed from client

        if not all([vehicle_number, password]):
            return Response({
                "data": None,
                "error": {
                    "code": 1,
                    "message": 'Missing required fields'
                }
            }, status=status.HTTP_200_OK)
        
        try:
            user = authenticate(user_username=vehicle_number, password=password)
            if not user:
                return Response({
                    "data": None,
                    "error": {
                        "code": 1,
                        "message": 'Invalid credentials'
                    }
                }, status=status.HTTP_200_OK)

            user_obj = DMS_User.objects.filter(user_username=vehicle_number, user_is_deleted=False).last()
            if not user_obj:
                return Response({
                    "data": None,
                    "error": {
                        "code": 1,
                        "message": 'User not found'
                    }
                }, status=status.HTTP_200_OK)

            return Response({
                    "data": {
                        "type": 1,
                        "isGovtAmbulance": True
                    },
                    "error": None
                }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "data": None,
                "error": {
                    "code": 1,
                    "message": 'Vehicle Number not registered'
                }
            }, status=status.HTTP_200_OK)

class userlist(APIView):
    def post(self, request):
        users = DMS_Employee.objects.filter(emp_is_deleted=False,user_id__user_is_deleted=False)
        user_data = []
        for user in users:
            user_data.append({
                "id": user.emp_id,
                "name": user.emp_name,
                "clg_name": str(user.user_id.user_id),
                
            })
        return Response({
            "data": user_data,
            "error": None
        }, status=status.HTTP_200_OK)
    





class closure_Post_api_app(APIView):
    def post(self, request):
        try:
            inccc = request.data.get('incidentId')
            vehicle_no=request.user
            print(vehicle_no)
            vehicl_dtls = Vehical.objects.get(veh_number=vehicle_no)
            inc_dtl = DMS_Incident.objects.get(inc_id=inccc)
            dpt_dtl = vehicl_dtls.responder
            ex_cl_dtl = DMS_incident_closure.objects.filter(incident_id=inc_dtl, responder=dpt_dtl,vehicle_no=vehicl_dtls, closure_is_deleted=False)
            if ex_cl_dtl.exists():
                # return Response({"msg":f"Closure already done for incident {inc_dtl.incident_id} of that department/Responder {dpt_dtl.responder_name} with vehicle no {vehicle_no}"},
                                #  status=status.HTTP_200_OK)
                return Response({"data": {"code": 1,"message": "Case Closure Successfully"},"error": None})
            log_in_user = employee_clockin_info.objects.filter(veh_id=vehicl_dtls,clock_out_in_status=1,status=1)
            print(vehicle_no)
            cls_dtl_add = DMS_incident_closure.objects.create(
                incident_id=inc_dtl,
                responder=dpt_dtl,
                vehicle_no=vehicl_dtls,
                closure_acknowledge=request.data.get('acknowledge'),
                closure_start_base_location=request.data.get('startFromBaseLoc'),
                closure_at_scene=request.data.get('atScene'),
                closure_from_scene=request.data.get('fromScene'),
                closure_back_to_base=request.data.get('backToBaseLoc'),
                closure_responder_name=log_in_user.values_list('emp_id__emp_name', flat=True).first() if log_in_user.exists() else '',
                closure_is_deleted=False,
                closure_added_by=request.user,
                closure_added_date=datetime.now(),
                closure_modified_by=request.user,
                closure_modified_date=datetime.now(),
                closure_remark=request.data.get('remark')
            )
            inc_vh = incident_vehicles.objects.filter(incident_id=inc_dtl, veh_id=vehicl_dtls, status=1)
            if inc_vh.exists():
                inc_vh.update(jobclosure_status=1,pcr_status=3)
                
            invh_dtl = incident_vehicles.objects.filter(veh_id=vehicl_dtls,jobclosure_status=2)
            if invh_dtl.exists() and invh_dtl.exclude(jobclosure_status=1).exists() and vehicl_dtls:
                # vehicl_dtls.update(vehical_status=1)
                vehicl_dtls.vehical_status = 1
                vehicl_dtls.save()
            # return Response({"msg": f"Closure for {dpt_dtl.responder_name} - {vehicl_dtls.veh_number} is done",}, status=status.HTTP_201_CREATED)
            return Response({"data": {"code": 1,"message": "Case Closure Successfully"},"error": None})
        except DMS_Incident.DoesNotExist:
            return Response({"data": None,"error": {"code": 1,"message": "Case Closure Not Successfully"}})
        except DMS_Department.DoesNotExist:
            return Response({"data": None,"error": {"code": 1,"message": "Case Closure Not Successfully"}})
        except Exception as e:
            # return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({"data": None,"error": {"code": 1,"message": "Case Closure Not Successfully"}})
        




class Userlistambvise(APIView):
    def post(self, request):
        try:
            vehical_no=request.data.get("vehicleNumber")
            vehicl_dtls = Vehical.objects.get(veh_number=vehical_no)
            emp_cl_dtls = employee_clockin_info.objects.filter(veh_id=vehicl_dtls,clock_out_in_status=1,status=1)
            data = []
            for emp in emp_cl_dtls:
                data.append({
                    "id": emp.emp_id.emp_id,
                    "name": emp.emp_id.emp_name,
                    "clg_name": str(emp.emp_id.user_id.user_id),
                    "in_out_status": "In" if emp.clock_out_in_status == 1 else "out",
                    "clock_in_time": emp.emp_clockin_time,
                    "clock_out_time": emp.emp_clockout_time
                })
            return Response({"data": data,"error": None}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"data": [],"error": {"code": 1,"message": "Vehicle not found"}, "ex_error":str(e)}, status=status.HTTP_200_OK)  








class Clockinout(APIView):
    def post(self, request):
        try:
            vehical_no=request.data.get("vehicleNumber")
            emp_id=request.data.get("userId")
            clock_time=request.data.get("clockTime")
            clock_out_in_status=request.data.get("clock_out_in_status")
            emp_image = request.FILES.get('photo')
            lat=request.data.get("lat")
            lng=request.data.get("lng")
            
            vh_dtl = Vehical.objects.get(veh_number=vehical_no)
            if clock_out_in_status  == 'in' :
                dtd = employee_clockin_info.objects.create(
                    emp_clockin_time=clock_time or None,
                    emp_clockout_time= None,
                    emp_id=DMS_Employee.objects.get(emp_id=emp_id),
                    veh_id=vh_dtl,
                    clock_out_in_status=1 if clock_out_in_status == 'in' else 2,
                    status=1,
                    latitude=lat if lat else None,
                    longitude=lng if lng else None,
                    emp_image=emp_image if emp_image else None,
                )
                return Response({"data": {"code": 1,"message": "Clock-in successful"},"error": None}, status=status.HTTP_201_CREATED)
            else:
                clin_dt = employee_clockin_info.objects.filter(emp_id=emp_id,veh_id=vh_dtl,clock_out_in_status=1,status=1).last()
                if clin_dt:
                    clin_dt.emp_clockout_time=clock_time if clock_time else None
                    clin_dt.clock_out_in_status=2 if clock_out_in_status == 'out' else 1
                    clin_dt.latitude=lat if lat else None
                    clin_dt.longitude=lng if lng else None
                    clin_dt.save()
                    return Response({"data": {"code": 1,"message": "Clock-out successful"},"error": None}, status=status.HTTP_201_CREATED)
                else:
                    return Response({"data": None,"error": {"code": 1,"message": "Employee not found or already clocked out"}}, status=status.HTTP_200_OK)  
        except Exception as e:
            return Response({"data": None,"error": {"code": 1,"message": "Clock in/out Not Successfully"}}, status=status.HTTP_200_OK)
			
			
#Dashboard---------------------Mayank

class VehicalDashboardCount(APIView):
    def get(self, request):
        today = now().date()

        # Total Vehicles
        total_vehicle = Vehical.objects.count()

        # Today Added Vehicles
        today_vehicle = Vehical.objects.filter(veh_added_date__date=today).count()

        # Last Month Vehicles
        first_day_this_month = today.replace(day=1)
        last_month_end = first_day_this_month - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)

        last_month_vehicle = Vehical.objects.filter(
            veh_added_date__date__gte=last_month_start,
            veh_added_date__date__lte=last_month_end,
            status=1
        ).count()

        data = {
            "total_vehicle_today": total_vehicle,
            # "today_vehicle": today_vehicle,
            "last_month_vehicle": last_month_vehicle,
        }

        return Response(data)
 