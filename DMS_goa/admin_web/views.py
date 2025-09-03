from django.shortcuts import render
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
# from .permissions import IsAdmin, IsManager, IsERO
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from .serializers import *
from rest_framework import status
from admin_web.renders import UserRenderer
from django.contrib.auth import authenticate
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import AccessToken
from geopy.geocoders import Nominatim
from django.http import JsonResponse
from django.db.models import Count, Q
from django.db.models.functions import TruncDate

import ast
import tweepy
import json
from datetime import datetime, timedelta
from langdetect import detect
from deep_translator import GoogleTranslator
import re
# from .constants import LOCATION_KEYWORDS, BLOCKLIST, EMS_KEYWORDS
from admin_web.utils.facebook_scraper import scrape_facebook_posts
from admin_web.utils.twitter_scraper import scrape_pune_ems_tweets
from admin_web.constants import KEYWORDS, PUNE_LOCATIONS, query
from admin_web.utils.news_scraper import news_dms_scraper
from DMS_MDT.models import employee_clockin_info, incident_vehicles
from admin_web.utils.rss_scrapper import scrape_rss_feeds
from admin_web.utils.reddit_scraper import scrape_reddit_feeds


class DMS_department_post_api(APIView):
    def post(self,request):
        data = request.data
        dep_name = data.get('dep_name')


        if DMS_Department.objects.filter(dep_name=dep_name).exists():
            return Response(
                {"detail": "Department with this dep_name already exists."},
                status=status.HTTP_409_CONFLICT
            )

        serializers=DMS_department_serializer(data=request.data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data,status=status.HTTP_201_CREATED)
        return Response(serializers.errors,status=status.HTTP_400_BAD_REQUEST) 

class DMS_department_put_api(APIView):
    def get(self, request, dep_id):
        snippet = DMS_Department.objects.filter(dep_id=dep_id,dep_is_deleted=False)
        serializers = DMS_department_serializer(snippet, many=True)
        return Response(serializers.data)

    def put(self, request, dep_id):
        try:
            instance = DMS_Department.objects.get(dep_id=dep_id)
        except DMS_Department.DoesNotExist:
            return Response({"error": "Department not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DMS_department_serializer(instance, data=request.data, partial=True)  # partial=True allows partial updates

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DMS_department_delete_api(APIView):
    def get(self, request, dep_id):
        try:
            instance = DMS_Department.objects.get(dep_id=dep_id, dep_is_deleted=False)
        except DMS_Department.DoesNotExist:
            return Response({"error": "Department not found or already deleted."}, status=status.HTTP_404_NOT_FOUND)
        serializer = DMS_department_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, dep_id):
        try:
            instance = DMS_Department.objects.get(dep_id=dep_id, dep_is_deleted=False)
        except DMS_Department.DoesNotExist:
            return Response({"error": "Department not found or already deleted."}, status=status.HTTP_404_NOT_FOUND)

        instance.dep_is_deleted = True
        instance.save()
        return Response({"message": "Department soft deleted successfully."}, status=status.HTTP_200_OK)


class DMS_Group_post_api(APIView):
    def post(self,request):
        data = request.data
        grp_name = data.get('grp_name')


        if DMS_Group.objects.filter(grp_name=grp_name).exists():
            return Response(
                {"detail": "Group with this grp_name already exists."},
                status=status.HTTP_409_CONFLICT
            )


        serializers=DMS_Group_serializer(data=request.data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data,status=status.HTTP_201_CREATED)
        return Response(serializers.errors,status=status.HTTP_400_BAD_REQUEST) 

class DMS_Group_put_api(APIView):
    def get(self, request, grp_id):
        snippet = DMS_Group.objects.filter(grp_id=grp_id,grp_is_deleted=False)
        serializers = DMS_Group_serializer(snippet, many=True)
        return Response(serializers.data)

    def put(self, request, grp_id):
        try:
            instance = DMS_Group.objects.get(grp_id=grp_id)
        except DMS_Group.DoesNotExist:
            return Response({"error": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DMS_Group_serializer(instance, data=request.data, partial=True)  # partial=True allows partial updates

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DMS_Group_delete_api(APIView):
    def get(self, request, grp_id):
        try:
            instance = DMS_Group.objects.get(grp_id=grp_id, grp_is_deleted=False)
        except DMS_Group.DoesNotExist:
            return Response({"error": "Group not found or already deleted."}, status=status.HTTP_404_NOT_FOUND)
        serializer = DMS_Group_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, grp_id):
        try:
            instance = DMS_Group.objects.get(grp_id=grp_id, grp_is_deleted=False)
        except DMS_Group.DoesNotExist:
            return Response({"error": "Group not found or already deleted."}, status=status.HTTP_404_NOT_FOUND)

        instance.grp_is_deleted = True
        instance.save()
        return Response({"message": "Group soft deleted successfully."}, status=status.HTTP_200_OK)

class DMS_User_get_api(APIView):
    def get(self,request):
        snippet = DMS_User.objects.filter(user_is_deleted=False).order_by('-user_added_date')
        serializers = DMS_User_GET_serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)

class DMS_User_post_api(APIView):
    def post(self,request):
        data = request.data
        user_name = data.get('user_name')


        if DMS_User.objects.filter(user_name=user_name).exists():
            return Response(
                {"detail": "Employee with this emp_name already exists."},
                status=status.HTTP_409_CONFLICT
            )
        serializers=DMS_User_serializer(data=request.data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data,status=status.HTTP_201_CREATED)
        return Response(serializers.errors,status=status.HTTP_400_BAD_REQUEST) 
    

class DMS_User_Idwise_get_api(APIView):
    def get(self,request,user_id):
        snippet = DMS_User.objects.filter(user_is_deleted=False,user_id=user_id).order_by('-emp_added_date')
        serializers = DMS_User_GET_serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)

class DMS_User_put_api(APIView):
    def get(self, request, user_id):
        snippet = DMS_User.objects.filter(user_id=user_id,user_is_deleted=False)
        serializers = DMS_User_GET_serializer(snippet, many=True)
        return Response(serializers.data)

    def put(self, request, user_id):
        try:
            instance = DMS_User.objects.get(user_id=user_id)
        except DMS_User.DoesNotExist:
            return Response({"error": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DMS_User_serializer(instance, data=request.data, partial=True)  # partial=True allows partial updates

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DMS_User_delete_api(APIView):
    def get(self, request, user_id):
        try:
            instance = DMS_User.objects.get(user_id=user_id, user_is_deleted=False)
        except DMS_User.DoesNotExist:
            return Response({"error": "Employee not found or already deleted."}, status=status.HTTP_404_NOT_FOUND)
        serializer = DMS_User_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        try:
            instance = DMS_User.objects.get(user_id=user_id, user_is_deleted=False)
        except DMS_User.DoesNotExist:
            return Response({"error": "Employee not found or already deleted."}, status=status.HTTP_404_NOT_FOUND)

        instance.user_is_deleted = True
        instance.save()
        return Response({"message": "Employee soft deleted successfully."}, status=status.HTTP_200_OK)

 
class DMS_state_get_api(APIView):
    
    def get(self,request):
        snippet = DMS_State.objects.filter(state_is_deleted=False)
        serializers = DMS_State_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)

class DMS_state_idwise_get_api(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request,state_id):
        snippet = DMS_State.objects.filter(state_id=state_id,state_is_deleted=False)
        serializers = DMS_State_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)
    
class DMS_district_get_api(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        snippet = DMS_District.objects.filter(dis_is_deleted=False)
        serializers = DMS_District_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)

class DMS_district_idwise_get_api(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request,state_id):
        snippet = DMS_District.objects.filter(state_id=state_id,dis_is_deleted=False)
        serializers = DMS_District_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)

class DMS_Tahsil_get_api(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        snippet = DMS_Tahsil.objects.filter(tah_is_deleted=False)
        serializers = DMS_Tahsil_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)   


class DMS_Tahsil_idwise_get_api(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request,dis_id):
        snippet = DMS_Tahsil.objects.filter(dis_id=dis_id,tah_is_deleted=False)
        serializers = DMS_Tahsil_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)
    
class DMS_City_get_api(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        snippet = DMS_City.objects.filter(cit_is_deleted=False)
        serializers = DMS_City_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)

class DMS_City_idwise_get_api(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request,tah_id):
        snippet = DMS_City.objects.filter(tah_id=tah_id,cit_is_deleted=False)
        serializers = DMS_City_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)

class DMS_Group_get_api(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        snippet = DMS_Group.objects.filter(grp_is_deleted=False).order_by('-grp_added_date')
        serializers = DMS_Group_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)
    
class DMS_Group_idwise_get_api(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request,grp_id):
        snippet = DMS_Group.objects.filter(grp_id=grp_id,grp_is_deleted=False)
        serializers = DMS_Group_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)
    
class DMS_Department_get_api(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        snippet = DMS_Department.objects.filter(dep_is_deleted=False)
        serializers = DMS_Department_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)
    
class DMS_Department_idwise_get_api(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request,dep_id):
        snippet = DMS_Department.objects.filter(dep_id=dep_id,dep_is_deleted=False)
        serializers = DMS_Department_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)
 


# class CaptchaTokenObtainPairView(TokenObtainPairView):
#     serializer_class = CaptchaTokenObtainPairSerializer


class CaptchaAPIView(APIView):
    def get(self, request):
        new_captcha = CaptchaStore.generate_key()
        image_url = captcha_image_url(new_captcha)
        return Response({
            'captcha_key': new_captcha,
            'captcha_image_url': image_url,
        })



def get_tokens_for_user(user, log_id):
    refresh = RefreshToken.for_user(user)
    emp_obj = DMS_Employee.objects.get(user_id=user.user_id)
    group = str(user.grp_id.grp_id)
    print("user---123", user)
    print("group---123", user.grp_id.grp_id)
    permissions_data = []
    if group:
        incs = DMS_Group.objects.get(grp_id=group)
        pers = agg_save_permissions.objects.filter(role=group)
        group_name = incs.grp_name
        
        for permission in pers:
            permission_info = {
                'modules_submodule': permission.modules_submodule,
                # 'permission_status': permission.permission_status,
                'Department_id': permission.source.dep_id,
                'Department_name': permission.source.dep_name,  
                'Group_id': permission.role.grp_id,  
    }
            permissions_data.append(permission_info)
    else:
        group_name = None
              
    return {
        "refresh" : str(refresh),
        "access" : str(refresh.access_token),
        "permissions": permissions_data,
        "colleague": {
                'id': user.user_id,
                'emp_name': user.user_username,
                'email': emp_obj.emp_email,
                'phone_no': emp_obj.emp_contact_no,
                'user_group': group,
                'log_id': log_id
            },
        "user_group" :group,
    }
 
 
class UserLoginView(APIView):
    renderer_classes = [UserRenderer]
    def post(self, request, format=None):
        request.data['user_username'] = request.data.get('emp_username')
        # Validate using the CAPTCHA + credential serializer
        serializer1 = CaptchaTokenObtainPairSerializer(data=request.data)
        serializer1.is_valid(raise_exception=True)
        print("request.data--", request.data)
 
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user_username = serializer.data.get('user_username')
            password = serializer.data.get('password')
            print("=========", user_username, password)
            user = authenticate(user_username=user_username, password=password)
            print("user--", user)
            if user is not None:
                user = DMS_User.objects.get(user_username=user.user_username)
                if user.user_is_deleted != False:
                    return Response({'msg':'Login access denied. Please check your permissions or reach out to support for help.'},status=status.HTTP_401_UNAUTHORIZED)
                if user.user_is_login is False: 
                    user.user_is_login = True
                    user.save()
                    print("Login entry")
                    login_entry_obj = DMS_WebLogin.objects.create(user_id=user, log_status=1, log_added_by=user.user_username)
                    print("login entry added--", login_entry_obj)
                    token = get_tokens_for_user(user , login_entry_obj.log_id)
                    return Response({'token':token,'msg':'Logged in Successfully'},status=status.HTTP_200_OK)
                else:
                    return Response({'msg':'User Already Logged In. Please check.'},status=status.HTTP_200_OK)
            else:
                return Response({'errors':{'non_field_errors':['UserId or Password is not valid']}},status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]  # Only logged-in users can log out
 
    def post(self, request):
        try:
            print("1", request.user)
            user_obj = DMS_User.objects.get(user_username=request.user)
            if user_obj.user_is_login is True:
                user_obj.user_is_login = False
                user_obj.save()
               
            refresh_token = request.data.get("refresh_token")
            log_id = request.data.get("log_id")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()  # Blacklist the token
                login_entry_obj = DMS_WebLogin.objects.get(log_id=log_id)
                login_entry_obj.logout_time = datetime.now()
                login_entry_obj.log_status = 2
                login_entry_obj.save()
                return Response({"message": "Logged out successfully"}, status=200)
            return Response({"error": "Refresh token is required"}, status=400)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=400)
        
        
# class CombinedAPIView(APIView):
#     # renderer_classes = [UserRenderer]
#     # permission_classes = [IsAuthenticated]
#     def get(self, request, format=None):
#         permission_modules = DMS_Module.objects.filter()
#         modules_serializer = Mmoduleserializer(permission_modules, many=True)

#         permission_objects = DMS_SubModule.objects.filter()
#         permission_serializer = permission_sub_Serializer(permission_objects, many=True)

        
#         combined_data = []
#         for module_data in modules_serializer.data:
#             module_id = module_data["mod_id"]
#             module_name = module_data["mod_name"]
#             group_id = module_data["mod_group_id"]
#             group_name = module_data["grp_name"]
            

#             submodules = [submodule for submodule in permission_serializer.data if submodule["mod_id"] == module_id]

#             formatted_data = {
#                 "group_id": group_id,
#                 "group_name": group_name,
#                 "module_id": module_id,
#                 "name": module_name,
#                 "submodules": submodules
#             }

#             combined_data.append(formatted_data)

#         final_data = combined_data

#         return Response(final_data)


    
    
class DMS_Group_put_api(APIView):
    def get(self, request, grp_id):
        snippet = DMS_Group.objects.filter(grp_id=grp_id,grp_is_deleted=False)
        serializers = DMS_Group_Serializer(snippet, many=True)
        return Response(serializers.data)

    def put(self, request, grp_id):
        try:
            instance = DMS_Group.objects.get(grp_id=grp_id)
        except DMS_Group.DoesNotExist:
            return Response({"error": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DMS_Group_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class DMS_ChangePassword_put_api(APIView):
    def get(self, request, user_id):
        snippet = DMS_User.objects.filter(user_id=user_id,user_is_deleted=False)
        serializers = ChangePasswordGetSerializer(snippet, many=True)
        return Response(serializers.data)

    def put(self, request, user_id):
        try:
            instance = DMS_User.objects.get(user_id=user_id)
        except DMS_User.DoesNotExist:
            return Response({"error": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChangePasswordputSerializer(instance, data=request.data, partial=True)  # partial=True allows partial updates


        plain_password = request.data['password']
        hashed_password = make_password(plain_password)
        print("++++++++", hashed_password, plain_password)
        request.data['password'] = hashed_password
        request.data['password2'] = hashed_password
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class DMS_ChangePassword_api(APIView):
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("here--------------------")
        serializer = ChangePasswordSerializer(data=request.data)
        user = request.user

        if serializer.is_valid():
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            
            if not user.check_password(old_password):
                return Response({"old_password": "Wrong password."}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


# class DMS_ForgotPassword_api(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         user_id = request.data['user_id']
#         new_password = request.data['new_password']
#         confirm_password = request.data['confirm_password']

#         if new_password != confirm_password:
#             return Response({"detail": "Passwords do not match."}, status=status.HTTP_200_OK)
        
#         user = DMS_User.objects.get(user_id=user_id)
#         print("User_______________________---", user)

#         serializer = ForgotPasswordSerializer(data=request.data)

#         if serializer.is_valid():
#             newpassword = serializer.validated_data['new_password']
#             confirmpassword = serializer.validated_data['confirm_password']
            
#             user.set_password(confirmpassword)
#             user.save()
#             return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = DMS_User.objects.get(user_email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_link = f"http://localhost:3000/reset-password/{uid}/{token}/"
            # Or send as POST URL: /api/accounts/reset-confirm/{uid}/{token}/

            send_mail(
                "Password Reset",
                f"Click the link to reset your password: {reset_link}",
                "noreply@yourapp.com",
                [email],
                fail_silently=False,
            )
            return Response({"detail": "Password reset link sent."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# accounts/views.py
class PasswordResetConfirmView(APIView):
    def post(self, request, uid, token):
        data = {
            "uid": uid,
            "token": token,
            "new_password": request.data.get("new_password"),
        }
        serializer = PasswordResetConfirmSerializer(data=data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"detail": "Password has been reset successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class DMS_Sop_get_api(APIView):
    def get(self,request):
        snippet = DMS_SOP.objects.filter(sop_is_deleted=False)
        serializers = SopSerializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)

class DMS_Sop_post_api(APIView):
    def post(self, request):
        disaster_id = request.data.get('disaster_id')

        if disaster_id is None:
            return Response({"error": "disaster_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        existing = DMS_SOP.objects.filter(disaster_id=disaster_id, sop_is_deleted=False).first()
        
        if existing:
            return Response(
                {"error": "SOP for this disaster_id already exists."},
                status=status.HTTP_409_CONFLICT
            )
        
        serializer = SopSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DMS_Sop_put_api(APIView):
    def get(self, request, sop_id):
        snippet = DMS_SOP.objects.filter(sop_id=sop_id)
        serializers = SopSerializer(snippet, many=True)
        return Response(serializers.data)

    def put(self, request, sop_id):
        try:
            instance = DMS_SOP.objects.get(sop_id=sop_id)
        except DMS_SOP.DoesNotExist:
            return Response({"error": "Sop not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = Sop_Put_Serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
class DMS_Sop_delete_api(APIView):
    def get(self, request, sop_id):
        try:
            instance = DMS_SOP.objects.get(sop_id=sop_id, sop_is_deleted=False)
        except DMS_SOP.DoesNotExist:
            return Response({"error": "Sop not found or already deleted."}, status=status.HTTP_404_NOT_FOUND)
        serializer = SopSerializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, sop_id):
        try:
            instance = DMS_SOP.objects.get(sop_id=sop_id, sop_is_deleted=False)
        except DMS_SOP.DoesNotExist:
            return Response({"error": "Sop not found or already deleted."}, status=status.HTTP_404_NOT_FOUND)

        instance.sop_is_deleted = True
        instance.save()
        return Response({"message": "Sop soft deleted successfully."}, status=status.HTTP_200_OK)

 
class DMS_Disaster_Type_Get_API(APIView):
    def get(self,request):
        snippet = DMS_Disaster_Type.objects.filter(disaster_is_deleted=False)
        serializers = DMS_Disaster_Type_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)

class DMS_Disaster_Type_Idwise_Get_API(APIView):
    def get(self,request,disaster_id):
        snippet = DMS_Disaster_Type.objects.filter(disaster_is_deleted=False,disaster_id=disaster_id)
        serializers = DMS_Disaster_Type_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)
    

class DMS_Alert_idwise_get_api(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        print("request user-- ",request.user)
        alert_id = request.GET.get('id')
        st = request.GET.get('st')
        if alert_id and st == 1:
            print("1")
            alert_obj = Weather_alerts.objects.get(pk_id=alert_id)
            alert_obj.triger_status = 1
            alert_obj.modified_by = str(request.user)
            alert_obj.save()
            print("done")
        else:
            print("2")
            alert_obj = Weather_alerts.objects.get(pk_id=alert_id)
            alert_obj.triger_status = 2
            alert_obj.modified_by = str(request.user)
            alert_obj.save()
            print("done 2")
        serializers = WeatherAlertSerializer(alert_obj,many=False)
        return Response(serializers.data, status=status.HTTP_200_OK)
    
class DMS_Incident_Post_api(APIView):
    def post(self,request):
        serializers=Incident_Serializer(data=request.data)
        if serializers.is_valid():
            serializers.save()
            print(serializers.data.get('inc_id'))
            alert_id = request.data['alert_id']
        
            # Initialize the geocoder
            geolocator = Nominatim(user_agent="nikita.speroinfosystems@gmail.com")

            if alert_id:
                try:
                    weather_obj = Weather_alerts.objects.get(pk_id=alert_id)
                    weather_obj.triger_status = 3
                    weather_obj.save()
                    print(f"Weather_alerts updated: triger_status set to 3 for alert_id {alert_id}")
                except Weather_alerts.DoesNotExist:
                    print(f"Weather_alerts with pk_id={alert_id} not found")

                Inc_obj = DMS_Incident.objects.filter(alert_id=alert_id).last()
                print("inc obj-", Inc_obj)

                if Inc_obj:
                    latitude = Inc_obj.latitude
                    longitude = Inc_obj.longitude

                    # Reverse geocoding
                    location = geolocator.reverse((latitude, longitude), language='en')
                    print("location.address---", location.address)

                    Inc_obj.location = location.address
                    Inc_obj.save()

            sinc = serializers.data.get('inc_id')
            incc = DMS_Incident.objects.get(inc_id=sinc)

            external_api_payload = {
                "caller_name": "",
                "caller_no": "",
                "location": "",
                "summary": "",
                "disaster_name": incc.disaster_type.disaster_name if incc.disaster_type else None,
                "inc_type": incc.disaster_type.disaster_id if incc.disaster_type else None,
                "incident_id": str(incc.incident_id),
                "latitude": str(incc.latitude),
                "longitude": str(incc.longitude),
                "dms_lat": str(incc.latitude),
                "dms_lng": str(incc.longitude),
                "alert_type": ("High" if incc.alert_type == 1 else"Medium" if incc.alert_type == 2 else"Low" if incc.alert_type == 3 else"Very Low" if incc.alert_type == 4 else"")
            } 
            print(external_api_payload)
            external_response = requests.post(
                "http://210.212.165.119/Spero_DMS/dms/alert_details",
                json=external_api_payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )

            if external_response.status_code == 200:
                external_api_result = external_response.json()
            else:
                external_api_result = {
                    "error": f"Status {external_response.status_code}",
                    "response": external_response.text
                }
            aaa = DMS_Comments.objects.filter(incident_id=incc).last()
            nn = {"incident_id": incc.incident_id,"alert_comment": aaa.comments}
            external_response = requests.post(
                    "http://210.212.165.119/Spero_DMS/dms/alert_comments",
                    json=nn,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
            print(external_response.json())

            data = {
                "sr_dt":serializers.data,
                "external_api_result":external_api_result
            }
            return Response(data, status=status.HTTP_201_CREATED)
        else:
            print("hiiiiiii else")
            return Response(serializers.errors,status=status.HTTP_400_BAD_REQUEST)





class DMS_Comments_Post_api(APIView):
    def post(self,request):
        serializers=Comments_Serializer(data=request.data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data,status=status.HTTP_201_CREATED)
        return Response(serializers.errors,status=status.HTTP_400_BAD_REQUEST)

class alerts_get_api(APIView):
    def get(self, request, disaster_id):
        sop_responses = DMS_SOP.objects.filter(disaster_id=disaster_id)
        sop_serializer = Sop_Response_Procedure_Serializer(sop_responses, many=True)
        return Response(sop_serializer.data, status=status.HTTP_200_OK)
    
    
# class Manual_Call_Incident_api(APIView):
#     def post(self, request, *args, **kwargs):
#         data = request.data

#         incident_fields = [
#             'inc_type', 'disaster_type', 'alert_type', 'location', 'summary',
#             'responder_scope', 'latitude', 'longitude', 'caller_id',
#             'inc_added_by', 'inc_modified_by', 'incident_id', 'inc_id','time','mode',
#         ]
#         caller_fields = ['caller_no', 'caller_name', 'caller_added_by', 'caller_modified_by']
#         comments_fields = ['comments', 'comm_added_by', 'comm_modified_by']

#         incident_data = {field: data.get(field) for field in incident_fields}
#         caller_data = {field: data.get(field) for field in caller_fields}
#         comments_data = {field: data.get(field) for field in comments_fields}

#         # Step 1: Save caller
#         caller_serializer = Manual_call_data_Serializer(data=caller_data)
#         if not caller_serializer.is_valid():
#             return Response({"caller_errors": caller_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
#         caller_instance = caller_serializer.save()
#         incident_data['caller_id'] = caller_instance.pk

#         # Step 2: Save incident
#         incident_serializer = Manual_call_incident_dispatch_Serializer(data=incident_data)
#         if not incident_serializer.is_valid():
#             return Response({"incident_errors": incident_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
#         incident_instance = incident_serializer.save()

#         base_code = incident_instance.incident_id
#         total_calls = DMS_Incident.objects.filter(alert_code__icontains='CALL-').count()
#         new_call_number = total_calls + 1
#         alert_code = f"CALL-{base_code}"
#         incident_instance.alert_code = alert_code
#         incident_instance.save()

#         # Step 3: Save comments with incident_id = incident_instance.inc_id
#         comments_data['incident_id'] = incident_instance.inc_id  # IMPORTANT: assign inc_id
#         comments_serializer = manual_Comments_Serializer(data=comments_data)
#         if not comments_serializer.is_valid():
#             return Response({"comments_errors": comments_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
#         comments_instance = comments_serializer.save()

#         incident_instance.comment_id = comments_instance
#         incident_instance.save()

#         # Step 4: Save Weather Alert
#         weather_alert_data = {
#             "alert_code": incident_instance.alert_code,
#             "disaster_id": incident_instance.disaster_type.pk if incident_instance.disaster_type else None,
#             "latitude": incident_instance.latitude,
#             "longitude": incident_instance.longitude,
#             "added_by": incident_instance.inc_added_by,
#             "modified_by": incident_instance.inc_modified_by,
#             "alert_type": incident_instance.alert_type
#         }
#         weather_alert_serializer = WeatherAlertSerializer(data=weather_alert_data)
#         if not weather_alert_serializer.is_valid():
#             return Response({"weather_alert_errors": weather_alert_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
#         weather_alert_instance = weather_alert_serializer.save()

#         # views.py (inside Manual_Call_Incident_api)
#         dms_notify_data = {
#             "incident_id": incident_instance.inc_id,  # <-- This line adds inc_id to the notify record
#             "disaster_type": incident_instance.disaster_type.pk if incident_instance.disaster_type else None,
#             "alert_type_id": incident_instance.responder_scope,
#             "added_by": incident_instance.inc_added_by
#         }

#         dms_notify_serializer = DMS_NotifySerializer(data=dms_notify_data)
#         if not dms_notify_serializer.is_valid():
#             return Response({"dms_notify_errors": dms_notify_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

#         dms_notify_instance = dms_notify_serializer.save()

#         incident_instance.notify_id = dms_notify_instance
#         incident_instance.save()


#         return Response({
#             "message": "Manual call, caller, comment, weather alert, and DMS notify created successfully.",
#             "incident": incident_serializer.data,
#             "caller": caller_serializer.data,
#             "comments": comments_serializer.data,
#             "weather_alert": weather_alert_serializer.data,
#             "dms_notify": dms_notify_serializer.data
#         }, status=status.HTTP_201_CREATED)



import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import DMS_Incident
from .serializers import (
    Manual_call_data_Serializer,
    Manual_call_incident_dispatch_Serializer,
    manual_Comments_Serializer,
    WeatherAlertSerializer,
    DMS_NotifySerializer,
)


class Manual_Call_Incident_api(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        incident_fields = [
            'inc_type', 'disaster_type', 'alert_type', 'location', 'summary',
            'responder_scope', 'latitude', 'longitude', 'caller_id',
            'inc_added_by', 'inc_modified_by', 'incident_id', 'inc_id', 'time', 'mode',
            'ward','district','ward_officer','tahsil','call_recieved_from','call_type','parent_complaint'
        ]
        caller_fields = ['caller_no', 'caller_name', 'caller_added_by', 'caller_modified_by','call_recieved_from']
        comments_fields = ['comments', 'comm_added_by', 'comm_modified_by']

        incident_data = {field: data.get(field) for field in incident_fields}
        caller_data = {field: data.get(field) for field in caller_fields}
        comments_data = {field: data.get(field) for field in comments_fields}

       
        caller_serializer = Manual_call_data_Serializer(data=caller_data)
        if not caller_serializer.is_valid():
            return Response({"caller_errors": caller_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        caller_instance = caller_serializer.save()
        incident_data['caller_id'] = caller_instance.pk
        incident_serializer = Manual_call_incident_dispatch_Serializer(data=incident_data)
        if not incident_serializer.is_valid():
            return Response({"incident_errors": incident_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        incident_instance = incident_serializer.save()
        base_code = incident_instance.incident_id
        alert_code = f"CALL-{base_code}"
        incident_instance.alert_code = alert_code
        incident_instance.save()

        vehicle_list = data.get("vehicle", [])
        if vehicle_list:
            for veh_id in vehicle_list:
                try:
                    print(f"Trying to fetch vehicle with veh_id={veh_id}")
                    veh = Vehical.objects.get(veh_id=veh_id)
                    veh.vehical_status = 2  # Mark vehicle as 'in use'
                    veh.save(update_fields=['vehical_status'])
                    incident_vehicles.objects.create(
                        incident_id=incident_instance,
                        veh_id=veh,  # FK is to_field='veh_id', so Vehical object works
                        dep_id=veh.dep_id if hasattr(veh, 'dep_id') else None,
                        status=1,   # or status_enum.ACTIVE
                        added_by=incident_instance.inc_added_by
                    )
                    print(f"incident_vehicles created for veh_id={veh_id}")
                except Vehical.DoesNotExist:
                    print(f"Vehicle not found: veh_id={veh_id}")


        comments_data['incident_id'] = incident_instance.inc_id
        comments_serializer = manual_Comments_Serializer(data=comments_data)
        if not comments_serializer.is_valid():
            return Response({"comments_errors": comments_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        comments_instance = comments_serializer.save()
        incident_instance.comment_id = comments_instance
        incident_instance.save()
        
        nn = {"incident_id": incident_instance.incident_id,"alert_comment": comments_instance.comments}
        external_response = requests.post(
                "http://210.212.165.119/Spero_DMS/dms/alert_comments",
                json=nn,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
        print(external_response.json()
 )
 
       
        weather_alert_data = {
            "alert_code": alert_code,
            "disaster_id": incident_instance.disaster_type.pk if incident_instance.disaster_type else None,
            "latitude": incident_instance.latitude,
            "longitude": incident_instance.longitude,
            "added_by": incident_instance.inc_added_by,
            "modified_by": incident_instance.inc_modified_by,
            "alert_type": incident_instance.alert_type
        }
        print("Weather alert data:", weather_alert_data)
        weather_alert_serializer = WeatherAlertSerializer(data=weather_alert_data)
        if not weather_alert_serializer.is_valid():
            print("Weather alert serializer errors:", weather_alert_serializer.errors)
            return Response({"weather_alert_errors": weather_alert_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        weather_alert_instance = weather_alert_serializer.save()
        print("Saved weather alert.")

        # Step 5: Save DMS notify
        dms_notify_data = {
            "incident_id": incident_instance.inc_id,
            "disaster_type": incident_instance.disaster_type.pk if incident_instance.disaster_type else None,
            "alert_type_id": list(incident_instance.responder_scope.values_list("pk", flat=True)),
            "added_by": incident_instance.inc_added_by
        }
        print("DMS notify data:", dms_notify_data)
        dms_notify_serializer = DMS_NotifySerializer(data=dms_notify_data)
        if not dms_notify_serializer.is_valid():
            print("DMS notify serializer errors:", dms_notify_serializer.errors)
            return Response({"dms_notify_errors": dms_notify_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        dms_notify_instance = dms_notify_serializer.save()
        incident_instance.notify_id = dms_notify_instance
        incident_instance.save()
        print("Saved DMS notify.")

        # Step 6: Send to external API
        external_api_payload = {
        "caller_name": caller_instance.caller_name,
        "caller_no": caller_instance.caller_no,
        "disaster_name": str(incident_instance.disaster_type.disaster_name) if incident_instance.disaster_type else "",
        "location": incident_instance.location,
        "summary": str(incident_instance.summary.summary),
        # "inc_type": "NON_MCI" if incident_instance.inc_type == 1 else "NON_EME_CALL" if incident_instance.inc_type == 2 else "",
        "inc_type": incident_instance.disaster_type.disaster_id if incident_instance.disaster_type else None,
        "incident_id": str(incident_instance.incident_id),
        "latitude": str(incident_instance.latitude),
        "longitude": str(incident_instance.longitude),
        "dms_lat": str(incident_instance.latitude),
        "dms_lng": str(incident_instance.longitude),
        "alert_type": ("High" if incident_instance.alert_type == 1 else"Medium" if incident_instance.alert_type == 2 else"Low" if incident_instance.alert_type == 3 else"Very Low" if incident_instance.alert_type == 4 else""
        ""
)
    }
        print("ssssssssssssssssssssssssss",external_api_payload)
        print("Sending to external API:", external_api_payload)

        try:
            external_response = requests.post(
                "http://210.212.165.119/Spero_DMS/dms/alert_details",
                json=external_api_payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            print("External API status:", external_response.status_code)
            print("External API raw response:", external_response.text)
            if external_response.status_code == 200:
                external_api_result = external_response.json()
            else:
                external_api_result = {
                    "error": f"Status {external_response.status_code}",
                    "response": external_response.text
                }
        except Exception as e:
            print("Exception during external API call:", str(e))
            external_api_result = {"error": str(e)}

        # Final response
        return Response({
            "message": "Manual call, caller, comment, weather alert, DMS notify created successfully and external API called.",
            "incident": incident_serializer.data,
            "caller": caller_serializer.data,
            "comments": comments_serializer.data,
            "weather_alert": weather_alert_serializer.data,
            "dms_notify": dms_notify_serializer.data,
            "external_api_response": external_api_result,

            "response": {
                # "call_received_from": caller_instance.call_recieved_from.value if caller_instance.call_recieved_from else None,
                # "call_type": incident_instance.disaster_type.disaster_parent.call_type_id.call_type_id if incident_instance.disaster_type and incident_instance.disaster_type.disaster_parent and incident_instance.disaster_type.disaster_parent.call_type_id else None,  
                # "parent_complaint": incident_instance.disaster_type.disaster_parent.pc_id if incident_instance.disaster_type and incident_instance.disaster_type.disaster_parent else None,
                }

        }, status=status.HTTP_201_CREATED)



class Responder_Scope_Get_api(APIView):
    def get(self, request, disaster_id):
        print("disaster_id--", disaster_id)

        # Get SOPs related to the disaster
        sop_responses = DMS_SOP.objects.filter(disaster_id=disaster_id)
        sop_serializer = Sop_Response_Procedure_Serializer(sop_responses, many=True)

        # Get all disaster responders for the disaster
        disaster_responders = DMS_Disaster_Responder.objects.filter(
            dr_is_deleted=False,
            dis_id=disaster_id
        )
        print("disaster_responders--", disaster_responders)

        responder_scope_data = []

        for dr in disaster_responders:
            # res_id is ManyToMany → use .all()
            responders = dr.res_id.all()
            for responder in responders:
                responder_scope_data.append({
                    "res_id": responder.responder_id,
                    "responder_name": responder.responder_name
                })

        return Response({
            "sop_responses": sop_serializer.data,
            "responder_scope": responder_scope_data
        }, status=status.HTTP_200_OK)

        
class DMS_Summary_Get_API(APIView):
    def get(self,request,summary_type):
        snippet = DMS_Summary.objects.filter(summary_type=summary_type)
        serializers = DMS_Summary_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)
    
# class DMS_responder_post_api(APIView):
#     def post(self,request):
#         serializers=Responder_serializer(data=request.data)
#         if serializers.is_valid():
#             serializers.save()
#             return Response(serializers.data,status=status.HTTP_201_CREATED)
#         return Response(serializers.errors,status=status.HTTP_400_BAD_REQUEST)


# class DMS_responder_put_api(APIView):
#     def get(self, request, responder_id):
#         snippet = DMS_Responder.objects.filter(responder_id=responder_id,responder_is_deleted=False)
#         serializers = Responder_Serializer(snippet, many=True)
#         return Response(serializers.data)

#     def put(self, request, responder_id):
#         try:
#             instance = DMS_Responder.objects.get(responder_id=responder_id)
#         except DMS_Responder.DoesNotExist:
#             return Response({"error": "Responder not found."}, status=status.HTTP_404_NOT_FOUND)

#         serializer = Responder_serializer(instance, data=request.data, partial=True)

#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
# class DMS_responder_delete_api(APIView):
#     def get(self, request, responder_id):
#         try:
#             instance = DMS_Responder.objects.get(responder_id=responder_id, responder_is_deleted=False)
#         except DMS_SOP.DoesNotExist:
#             return Response({"error": "Responder not found or already deleted."}, status=status.HTTP_404_NOT_FOUND)
#         serializer = Responder_Serializer(instance)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def delete(self, request, sop_id):
#         try:
#             instance = DMS_Responder.objects.get(responder_id=responder_id, responder_is_deleted=False)
#         except DMS_Responder.DoesNotExist:
#             return Response({"error": "Responder not found or already deleted."}, status=status.HTTP_404_NOT_FOUND)

#         instance.responder_is_deleted = True
#         instance.save()
#         return Response({"message": "Responder soft deleted successfully."}, status=status.HTTP_200_OK)

class GetResponderList_api(APIView):
    def get(self, request):
        responders = DMS_Responder.objects.filter(responder_is_deleted=False)
        serializer = Responder_Serializer(responders, many=True)
        return Response(serializer.data)


class disaster_responder_Post_api(APIView):
    def post(self, request):
        dis_id = request.data.get('dis_id')

        if dis_id is None:
            return Response({"error": "dis_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        existing = DMS_Disaster_Responder.objects.filter(dis_id=dis_id, dr_is_deleted=False).first()

        if existing:
            return Response(
                {"error": "This dis_id already exists."},
                status=status.HTTP_409_CONFLICT
            )

        serializers = Responder_Scope_post_Serializer(data=request.data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data, status=status.HTTP_201_CREATED)
        return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)


class Disaster_Responder_put(APIView):
    def get(self, request, pk_id):
        snippet = DMS_Disaster_Responder.objects.filter(pk_id=pk_id,dr_is_deleted=False)
        serializers = DisasterResponderSerializer(snippet, many=True)
        return Response(serializers.data)
    def put(self,request,pk_id):
        try:
            instance =DMS_Disaster_Responder.objects.get(pk_id=pk_id)
        except DMS_Disaster_Responder.DoesNotExist:
            return Response({"error": "record not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DisasterResponderSerializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class Disaster_responder_delete_api(APIView):
    def get(self, request, pk_id):
        try:
            instance = DMS_Disaster_Responder.objects.get(pk_id=pk_id, dr_is_deleted=False)
        except DMS_Disaster_Responder.DoesNotExist:
            return Response({"error": "record not found or already deleted."}, status=status.HTTP_404_NOT_FOUND)
        serializer = Responder_Serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk_id):
        try:
            instance = DMS_Disaster_Responder.objects.get(pk_id=pk_id, dr_is_deleted=False)
        except DMS_Disaster_Responder.DoesNotExist:
            return Response({"error": "record not found or already deleted."}, status=status.HTTP_404_NOT_FOUND)

        instance.dr_is_deleted = True
        instance.save()
        return Response({"message": "Record soft deleted successfully."}, status=status.HTTP_200_OK)


# class disaster_responder_Post_api(APIView):
#     def post(self,request):
#         serializers=DisasterResponderPostSerializer(data=request.data)
#         if serializers.is_valid():
#             serializers.save()
#             return Response(serializers.data,status=status.HTTP_201_CREATED)
#         return Response(serializers.errors,status=status.HTTP_400_BAD_REQUEST)


class DMS_Disaster_Responder_GET_API(APIView):
    def get(self, request):
        pk_id = request.query_params.get('pk_id')
        queryset = DMS_Disaster_Responder.objects.filter(dr_is_deleted=False)

        if pk_id is not None:
            queryset = queryset.filter(pk_id=pk_id)

        response_data = []

        for obj in queryset:
            serialized_data = DisasterResponderSerializer(obj).data

            res_ids = obj.res_id if isinstance(obj.res_id, list) else []

            responder_details = list(
                DMS_Responder.objects
                .filter(responder_id__in=res_ids)
                .values('responder_id', 'responder_name')
            )

            serialized_data['res_id'] = responder_details

            response_data.append(serialized_data)

        return Response(response_data)


# class closure_Post_api(APIView):
#     def post(self, request):
        
#         inccc = request.data.get('incident_id')
#         print(inccc,'innnnnnnnn')
#         nnnnnn = DMS_Incident.objects.get(inc_id=inccc)
#         nnnnnn.clouser_status = True
#         nnnnnn.save()
#         serializer = ClosureSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()

#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)







class closure_Post_api(APIView):
    def post(self, request):
        try:
            inccc = request.data.get('incident_id')
            dpt = request.data.get('responder')
            vehicle_no=request.data.get('vehicle_no')

            vehicl_dtls = Vehical.objects.get(veh_id=vehicle_no)
            inc_dtl = DMS_Incident.objects.get(incident_id=inccc)
            dpt_dtl = DMS_Responder.objects.get(responder_name=dpt)  
            ex_cl_dtl = DMS_incident_closure.objects.filter(incident_id=inc_dtl, responder=dpt_dtl,vehicle_no=vehicl_dtls, closure_is_deleted=False)
            if ex_cl_dtl.exists():
                return Response({"msg":f"Closure already done for incident {inc_dtl.incident_id} of that department/Responder {dpt_dtl.responder_name} with vehicle no {vehicle_no}"},
                                 status=status.HTTP_200_OK)
            cls_dtl_add = DMS_incident_closure.objects.create(
                incident_id=inc_dtl,
                responder=dpt_dtl,
                vehicle_no=vehicl_dtls,
                closure_acknowledge=request.data.get('closure_acknowledge'),
                closure_start_base_location=request.data.get('closure_start_base_location'),
                closure_at_scene=request.data.get('closure_at_scene'),
                closure_from_scene=request.data.get('closure_from_scene'),
                closure_back_to_base=request.data.get('closure_back_to_base'),
                closure_responder_name=request.data.get('closure_responder_name'),
                closure_is_deleted=False,
                closure_added_by=request.data.get('closure_added_by'),
                closure_modified_by=request.data.get('closure_modified_by'),
                closure_modified_date=request.data.get('closure_modified_date'),
                closure_remark=request.data.get('closure_remark')
            )
            inc_vh = incident_vehicles.objects.filter(incident_id=inc_dtl, veh_id=vehicl_dtls, status=1)
            if inc_vh.exists():
                inc_vh.update(jobclosure_status=1,pcr_status=3)
            else:
                add_inc_vh = incident_vehicles.objects.create(incident_id=inc_dtl, veh_id=vehicl_dtls, status=1,jobclosure_status=1,pcr_status=3,added_by=request.data.get('closure_added_by'))
                
            invh_dtl = incident_vehicles.objects.filter(veh_id=vehicl_dtls,jobclosure_status=2)
            if invh_dtl.exists() and invh_dtl.exclude(jobclosure_status=1).exists() and vehicl_dtls:
                # vehicl_dtls.update(vehical_status=1)
                vehicl_dtls.vehical_status = 1
                vehicl_dtls.save()
            return Response({"msg": f"Closure for {dpt_dtl.responder_name} - {vehicl_dtls.veh_number} is done",}, status=status.HTTP_201_CREATED)
        except DMS_Incident.DoesNotExist:
            return Response({"error": "Incident not found."}, status=status.HTTP_404_NOT_FOUND)
        except DMS_Department.DoesNotExist:
            return Response({"error": "Department not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        






class closure_Post_api_app(APIView):
    def post(self, request):
        try:
            inccc = request.data.get('incidentId')
            vehicle_no=request.user
            print(vehicle_no)
            vehicl_dtls = Vehical.objects.get(veh_number=vehicle_no)
            inc_dtl = DMS_Incident.objects.get(incident_id=inccc)
            dpt_dtl = vehicl_dtls.responder
            ex_cl_dtl = DMS_incident_closure.objects.filter(incident_id=inc_dtl, responder=dpt_dtl,vehicle_no=vehicl_dtls, closure_is_deleted=False)
            if ex_cl_dtl.exists():
                return Response({"msg":f"Closure already done for incident {inc_dtl.incident_id} of that department/Responder {dpt_dtl.responder_name} with vehicle no {vehicle_no}"},
                                 status=status.HTTP_200_OK)
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
            inc_vh.update(jobclosure_status=1)
            invh_dtl = incident_vehicles.objects.filter(veh_id=vehicl_dtls,jobclosure_status=0)
            if invh_dtl.exists() and invh_dtl.exclude(jobclosure_status=1).exists():
                vehicl_dtls.update(vehical_status=1)
            return Response({"msg": f"Closure for {dpt_dtl.responder_name} - {vehicl_dtls.veh_number} is done",}, status=status.HTTP_201_CREATED)
        except DMS_Incident.DoesNotExist:
            return Response({"error": "Incident not found."}, status=status.HTTP_404_NOT_FOUND)
        except DMS_Department.DoesNotExist:
            return Response({"error": "Department not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        





# class closure_Post_api(APIView):
#     def post(self, request):
#         try:
#             inccc = request.data.get('incident_id')
#             dpt = request.data.get('responder')

#             inc_dtl = DMS_Incident.objects.get(incident_id=inccc)
#             dpt_dtl = DMS_Responder.objects.get(responder_name=dpt)
#             inc_dpts = DMS_Notify.objects.filter(incident_id=inc_dtl, not_is_deleted=False)
#             inc_dpts_ids = sorted([int(j) for i in inc_dpts for j in i.alert_type_id])
#             get_closure_dtl = DMS_incident_closure.objects.filter(
#                 incident_id=inc_dtl, responder=dpt_dtl, closure_is_deleted=False
#             )
#             all_clsr_dtls = DMS_incident_closure.objects.filter(incident_id=inc_dtl, closure_is_deleted=False)
#             if get_closure_dtl.exists():
#                 inc_dtl.clouser_status = True
#                 inc_dtl.save()
#                 cl_dpts = sorted(all_clsr_dtls.values_list('responder', flat=True))
#                 unmatched_from_inc = set(inc_dpts_ids) - set(cl_dpts)
#                 get_unmatch_dpt_clsr_ntdn = DMS_Responder.objects.filter(responder_id__in=unmatched_from_inc)
#                 dpts_unm_nms = get_unmatch_dpt_clsr_ntdn.values_list('responder_name', flat=True)
#                 return Response({"msg":f"Closure already done for incident {inc_dtl.incident_id} of that department/Responder {dpt_dtl.responder_name}",
#                                  "Closure_Pending_Responders": dpts_unm_nms},status=status.HTTP_200_OK)
#             else:
#                 cls_dtl_add = DMS_incident_closure.objects.create(
#                     incident_id=inc_dtl,
#                     responder=dpt_dtl,
#                     vehicle_no=request.data.get('vehicle_no'),
#                     closure_acknowledge=request.data.get('closure_acknowledge'),
#                     closure_start_base_location=request.data.get('closure_start_base_location'),
#                     closure_at_scene=request.data.get('closure_at_scene'),
#                     closure_from_scene=request.data.get('closure_from_scene'),
#                     closure_back_to_base=request.data.get('closure_back_to_base'),
#                     incident_responder_by=request.data.get('incident_responder_by'),
#                     closure_is_deleted=False,
#                     closure_added_by=request.data.get('closure_added_by'),
#                     closure_modified_by=request.data.get('closure_modified_by'),
#                     closure_modified_date=request.data.get('closure_modified_date'),
#                     closure_remark=request.data.get('closure_remark')
#                 )
                
#                 cl_dpts = sorted(all_clsr_dtls.values_list('responder', flat=True))
#                 if cl_dpts == inc_dpts_ids:
#                     inc_dtl.clouser_status = True
#                     inc_dtl.save()
#                     return Response("Closure done for all departments.", status=status.HTTP_201_CREATED)
#                 else:
#                     unmatched_from_inc = set(inc_dpts_ids) - set(cl_dpts)
#                     get_unmatch_dpt_clsr_ntdn = DMS_Responder.objects.filter(responder_id__in=unmatched_from_inc)
#                     dpts_unm_nms = get_unmatch_dpt_clsr_ntdn.values_list('responder_name', flat=True)
#                     if len(dpts_unm_nms) == 0:
#                         return Response({
#                             "msg": f"Closure for {dpt_dtl.responder_name} is done",
#                             "Departments": "All Department Closure Done"
#                         }, status=status.HTTP_201_CREATED)
#                     else: 
#                         return Response({
#                         "msg": f"Closure for {dpt_dtl.responder_name} is done, but remaining departments pending: {list(dpts_unm_nms)}",
#                         "Departments": list(dpts_unm_nms)
#                     }, status=status.HTTP_201_CREATED)

#         except DMS_Incident.DoesNotExist:
#             return Response({"error": "Incident not found."}, status=status.HTTP_404_NOT_FOUND)
#         except DMS_Department.DoesNotExist:
#             return Response({"error": "Department not found."}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        



class closure_Post_api2(APIView):
    def post(self, request):
        closure_inc_id = request.data.get('closure_inc_id')
        print(closure_inc_id, 'closure_inc_id')

        try:
            incident_obj = DMS_Incident.objects.get(incident_id=closure_inc_id)
            incident_obj.clouser_status = True
            incident_obj.save()
        except DMS_Incident.DoesNotExist:
            return Response({"error": "Incident not found"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ClosureSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class comment_idwise_get_api(APIView):
    def get(self, request, incident_id):
        comments_qs = DMS_Comments.objects.filter(incident_id=incident_id, comm_is_deleted=False)
        comment_texts = comments_qs.values_list('comments', flat=True)
        data = {
            "incident_id": incident_id,
            "comments": list(comment_texts)
        }
        return Response(data, status=status.HTTP_200_OK)

class DMS_comment_Get_API(APIView):
    def get(self,request):
        snippet = DMS_Comments.objects.all()
        serializers = CommentSerializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)

# class dispatch_sop_Get_API(APIView):
#     def get(self,request):
#         snippet = DMS_Incident.objects.all().order_by('-inc_added_date')
#         serializers = dispatchsopserializer(snippet,many=True)
#         print(serializers.data)
#         return Response(serializers.data,status=status.HTTP_200_OK)


class dispatch_sop_Get_API(APIView):
    def get(self,request):
        snippet = DMS_Incident.objects.filter(clouser_status=False).order_by('-inc_added_date')
        serializers = dispatchsopserializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)

class dispatch_sop_Idwise_Get_API(APIView):
    def get(self,request, inc_id):
        snippet = DMS_Incident.objects.filter(inc_is_deleted=False,inc_id=inc_id)
        serializers = dispatchsopserializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)
    








from django.shortcuts import get_object_or_404
# class CommentPostView(APIView):
#     def post(self, request, incident_id):
#         # Use correct PK field: inc_id
#         incident_instance = get_object_or_404(DMS_Incident, inc_id=incident_id)

#         serializer = Comment_Post_Serializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(incident_id=incident_instance)
            
#             aaa=DMS_Incident.objects.filter(inc_id=incident_id)
            
#             nn = {"incident_id": aaa.incident_id,"alert_comment": serializer.data.get('comments')}
#             external_response = requests.post(
#                     "http://210.212.165.119/Spero_DMS/dms/alert_details",
#                     json=nn,
#                     headers={"Content-Type": "application/json"},
#                     timeout=10
#                 )
#             print(external_response.json()
#  )
            
            
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import requests

class CommentPostView(APIView):
    def post(self, request, incident_id):
        incident_instance = get_object_or_404(DMS_Incident, inc_id=incident_id)

        serializer = Comment_Post_Serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(incident_id=incident_instance)
            
            aaa = DMS_Incident.objects.get(inc_id=incident_id)
            
            nn = {
                "incident_id": aaa.incident_id,
                "alert_comment": serializer.data.get('comments')
            }

            try:
                external_response = requests.post(
                    "http://210.212.165.119/Spero_DMS/dms/alert_details",
                    json=nn,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                external_data = external_response.json()
            except requests.exceptions.RequestException as e:
                external_data = {"error": str(e)}

            return Response({
                "local_data": serializer.data,
                "external_api_response": external_data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class incident_get_Api(APIView):
    def get(self, request, inc_id):
        # Directly get the incident object
        incident_qs = DMS_Incident.objects.filter(inc_id=inc_id).order_by('inc_added_date')
        incident_serializer = incident_get_serializer(incident_qs, many=True)
        incident_data = incident_serializer.data

        # Get responder IDs directly from the ArrayField
        responder_ids = []
        if incident_data:
            raw_ids = incident_data[0].get('responder_scope', [])
            responder_ids = [int(rid) for rid in raw_ids if str(rid).isdigit()]

        # Get responder details
        veh_data = incident_vehicles.objects.filter(incident_id=inc_id, status=1)
        print("veh_data--", veh_data)

        responders = DMS_Responder.objects.filter(
            responder_id__in=responder_ids
        ).values('responder_id', 'responder_name')

        responder_details = []
        for responder in responders:
            veh_data = incident_vehicles.objects.filter(
                incident_id=inc_id,
                status=1
            ).values(
                'veh_id__veh_id',
                'veh_id__veh_number'
            )

            vehicles = [
                {
                    "vehicle_id": v["veh_id__veh_id"],
                    "vehicle_number": v["veh_id__veh_number"]
                }
                for v in veh_data
            ]

            responder_details.append({
                "responder_id": responder["responder_id"],
                "responder_name": responder["responder_name"],
                "vehicles": vehicles
            })
        

        # Get related comments
        comments_qs = DMS_Comments.objects.filter(incident_id=inc_id, comm_is_deleted=False)
        comment_texts = comments_qs.values('comm_id', 'comments','comm_added_by','comm_added_date')

        # Final response
        data = {
            "incident_details": incident_data,
            "inc_id": inc_id,
            "comments": list(comment_texts),
            "responders scope": responder_details
        }
        return Response(data, status=status.HTTP_200_OK)



#-----------------------------cancel Dispatch API ----------------------
class UpdateTriggerStatusAPIView(APIView):
    def post(self, request):
        pk_id = request.data.get('id')

        if not pk_id:
            return Response({'status': False, 'message': 'ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            record = Weather_alerts.objects.get(pk_id=pk_id)
        except Weather_alerts.DoesNotExist:
            return Response({'status': False, 'message': 'Record not found.'}, status=status.HTTP_404_NOT_FOUND)

        if record.triger_status == 2:
            record.triger_status = 1
            record.save(update_fields=['triger_status'])
            return Response({'status': True, 'message': f'Record with ID {pk_id} updated successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': False,
                'message': f'Record with ID {pk_id} already has triger_status = {record.triger_status}.'
            }, status=status.HTTP_200_OK)
            


        
# class incident_wise_responder_list(APIView):
#     def get(self, request,inc_id):
#         res_lst = list(set([]))
#         nid = DMS_Notify.objects.filter(incident_id=inc_id)
#         for i in nid:
#             for j in list(set(i.alert_type_id)):
#                 res_lst.append(j)
#         kk=[]
#         vv = DMS_incident_closure.objects.filter(incident_id=inc_id, closure_is_deleted=False)
#         rs_ids = set(vv.values_list('responder', flat=True))
#         ll = sorted(set(int(x) for x in res_lst if int(x) not in rs_ids))
#         for m in ll:
#             mm=DMS_Responder.objects.get(responder_id=int(m))
#             dt={
#                 'responder_id':mm.responder_id,
#                 'responder_name':mm.responder_name
#                  }
#             kk.append(dt)
#         return Response(kk)




# class incident_wise_responder_list(APIView):

#     def get(self, request, inc_id):
#         nid = incident_vehicles.objects.filter(incident_id=inc_id,status=1).exclude(jobclosure_status=1).select_related("veh_id__responder")
#         if not nid.exists():
#             return Response({"data": [], "error": {"code": 1, "message": "No vehicles found"}})
#         grouped = {}
#         for i in nid:
#             if i.veh_id and i.veh_id.responder:
#                 responder_id = i.veh_id.responder.responder_id
#                 responder_name = i.veh_id.responder.responder_name
#                 if responder_id not in grouped:
#                     grouped[responder_id] = {
#                         "responder_id": responder_id,
#                         "responder_name": responder_name,
#                         "vehicle": []
#                     }
#                 grouped[responder_id]["vehicle"].append({
#                     "veh_id": i.veh_id.veh_id,
#                     "vehicle_no": i.veh_id.veh_number
#                 })  

#         return Response(list(grouped.values()), status=status.HTTP_200_OK)





class incident_wise_responder_list(APIView):
    def get(self, request, inc_id):
        inc_dtl = DMS_Incident.objects.get(inc_id=inc_id)
        kk = []
        for i in inc_dtl.responder_scope.all():
            vh_dtl=Vehical.objects.filter(responder=i,status=1)
            vehi_dtl = []
            for j in vh_dtl:
                inc_vh = incident_vehicles.objects.filter(incident_id=inc_dtl, veh_id=j, jobclosure_status=1,status=1)
                is_vehical_close = True if inc_vh.exists() else False
                if is_vehical_close == False:
                    vehi_dtl.append({
                        "veh_id": j.veh_id,
                        "vehicle_no": j.veh_number
                    })
            if vehi_dtl:
                kk.append(  {
                "responder_id": i.responder_id,
                "responder_name": i.responder_name,
                "vehicle": vehi_dtl

            })
        return Response(kk)




        





class Ward_get_API(APIView):
    def get(self,request,tah_id):
        ward = DMS_Ward.objects.filter(tah_id=tah_id).order_by('pk_id')
        serializer = Ward_get_Serializer(ward,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)


class Ward_Officer_get_API(APIView):
    def get(self,request,ward_id):
        print("ward_id--",ward_id)
        # ward = DMS_Employee.objects.filter(ward_id=ward_id,grp_id_id__grp_name='Ward Officer')
        ward = DMS_Employee.objects.filter(ward_id=ward_id)
        serializer = Ward_officer_get_Serializer(ward,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    
    
bearer_token = "AAAAAAAAAAAAAAAAAAAAAH8RxwEAAAAADjjrmkM1ZPBPnjoHuBAtqlh6Mac%3DqqBg9lR831CiXLU7t8J1lpHBGgG8ZXU1CoD8fIMUGyX0SwXarN"
client = tweepy.Client(bearer_token=bearer_token)
class twitter_post_api(APIView):

    def post(self, request):
        results, error = scrape_pune_ems_tweets(client, query, KEYWORDS, PUNE_LOCATIONS)

        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        saved_count = 0
        for item in results:
            # print(item['user'])
            TwitterDMS.objects.create(
                media_status=int(item['media_status']),
                text=item['text'],
                translated_text=item['translated_text'],
                user=item['user'],
                language=item['language'],
                region=item['region'],
                date_time=item['date_time'],
                link=item['link']
            )
            saved_count += 1
        # saved = 0
        # for data in results:
        #     serializer = TwitterDMSSerializer(data=data)
        #     if serializer.is_valid():
        #         serializer.save()
        #         saved += 1
        #     else:
        #         print(serializer.errors)

        return Response({
            "message": "Tweets saved",
            "saved_count": saved_count
        }, status=status.HTTP_201_CREATED)
            
class FacebookPostScrapeAPIView(APIView):
    def post(self, request):
        posts = scrape_facebook_posts()

        saved_count = 0
        for item in posts:
            # print(item['user'])
            TwitterDMS.objects.create(
                media_status=int(item['media_status']),
                text=item['text'],
                translated_text=item['translated_text'],
                user=item['user'],
                language=item['language'],
                region=item['region'],
                date_time=item['date_time'],
                link=item['link']
            )
            saved_count += 1
        # saved = 0
        # for data in posts:
        #     serializer = TwitterDMSSerializer(data=data)
        #     if serializer.is_valid():
        #         serializer.save()
        #         saved += 1
        #     else:
        #         print(serializer.errors)

        return Response({
            "message": f"{saved_count} posts saved to the database.",
            "total_scraped": len(posts)
        }, status=status.HTTP_200_OK)

class NewsScraperAPIView(APIView):
    def post(self, request):
        api_key = "6def2a5e5f1b470eb186cf10a7a3bc73"  # OR read from settings

        final_data, error = news_dms_scraper(api_key)
        # print(final_data)
        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        saved_count = 0
        for item in final_data:
            # print(item['user'])
            TwitterDMS.objects.create(
                media_status=int(item['media_status']),
                text=item['text'],
                translated_text=item['translated_text'],
                user=item['user'],
                language=item['language'],
                region=item['region'],
                date_time=item['date_time'],
                link=item['link']
            )
            saved_count += 1
            # if not TwitterDMS.objects.filter(link=item["link"]).exists():
            #     serializer = TwitterDMSSerializer(data=item)
            #     if serializer.is_valid():
            #         serializer.save()
            #         saved_count += 1
            #     else:
            #         print(serializer.errors)

        return Response(
            {
                "message": f"Scraped {len(final_data)} posts, saved {saved_count} new items."
            },
            status=status.HTTP_200_OK
        )
#===================permission Module (mayank)===========================================

# class CombinedAPIView(APIView):
#     renderer_classes = [UserRenderer]
#     permission_classes = [IsAuthenticated]
#     def get(self, request, format=None):
#         permission_modules = Permission_module.objects.filter()
#         modules_serializer = Moduleserializer(permission_modules, many=True)

#         permission_objects = permission.objects.filter()
#         permission_serializer = permission_sub_Serializer(permission_objects, many=True)
        
#         action_objects = permission_action.objects.filter()
#         action_serializer = action_sub_Serializer(action_objects, many=True)

        


#         combined_data = []
#         for module_data in modules_serializer.data:
#             module_id = module_data["module_id"]
#             module_name = module_data["name"]
#             source_id = module_data["Source_id"]

#             submodules = [submodule for submodule in permission_serializer.data if submodule["module"] == module_id]
#             actions = [action for action in action_serializer.data if action["sub_module"]]

#             formatted_data = {
#                 "module_id": module_id,
#                 "name": module_name,
#                 "Source_id": source_id,
#                 "submodules": submodules,
#                 "actions": actions
#             }

#             combined_data.append(formatted_data)

#         final_data = combined_data

#         return Response(final_data)

class CombinedAPIView(APIView):
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        permission_modules = Permission_module.objects.all().order_by("module_id")
        modules_serializer = Moduleserializer(permission_modules, many=True)

        permission_objects = permission.objects.all()
        permission_serializer = permission_sub_Serializer(permission_objects, many=True)

        action_objects = permission_action.objects.all()
        action_serializer = action_sub_Serializer(action_objects, many=True)

        combined_data = []
        for module_data in modules_serializer.data:
            module_id = module_data["module_id"]
            module_name = module_data["name"]
            source_id = module_data["Source_id"]

            # Filter submodules for the current module
            submodules = [submodule for submodule in permission_serializer.data if submodule["module"] == module_id]

            # Get IDs of those submodules
            submodule_ids = [sub["Permission_id"] for sub in submodules]

            # Filter actions belonging to these submodules
            actions = [action for action in action_serializer.data if action["sub_module"] in submodule_ids]

            formatted_data = {
                "module_id": module_id,
                "name": module_name,
                "Source_id": source_id,
                "submodules": submodules,
                "actions": actions
            }

            combined_data.append(formatted_data)

        return Response(combined_data)
    

# class GetPermissionAPIView(APIView):
#     renderer_classes = [UserRenderer]
#     permission_classes = [IsAuthenticated]
#     serializer_class = SavePermissionSerializer

#     def get(self, request, source, role, *args, **kwargs):
#         permissions = agg_save_permissions.objects.filter(source=source, role=role)
#         serializer = self.serializer_class(permissions, many=True)
#         return Response(serializer.data)


class GetPermissionAPIView(APIView):
    # renderer_classes = [UserRenderer]
    # permission_classes = [IsAuthenticated]

    def get(self, request, source, role, *args, **kwargs):
        permissions = agg_save_permissions.objects.filter(source=source, role=role)
        
        data = []
        for perm in permissions:
            data.append({
                "id": perm.id,
                "source": perm.source.dep_id if perm.source else None,  
                "role": perm.role.grp_id if perm.role else None,
                "modules_submodule": perm.modules_submodule
            })
        
        return JsonResponse(data, safe=False)





class CreatePermissionAPIView(APIView):
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated]
    serializer_class = SavePermissionSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdatePermissionAPIView(APIView):
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated]
    serializer_class = SavePermissionSerializer

    def put(self, request, id):
        try:
            permission = agg_save_permissions.objects.get(id=id)
        except agg_save_permissions.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(permission, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


# class AggSourceListAPIView(APIView):
#     def get(self, request):
#         sources = agg_source.objects.filter(is_deleted=False).only('source_pk_id', 'source').order_by('source')
#         serializer = AggSourceSerializer(sources, many=True)
#         return Response(serializer.data)

# from admin_web.sms_utils import send_bulk_sms
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt

# @csrf_exempt
# def send_sms_view(request):
#     mobile_numbers = "918551995260,918551995260"  
#     message_content = "Dear RAJ, Ambulance dispatched : 52754, Ambulance contact : 00000000, Unm Lifecare- Spero CAD"

#     response = send_bulk_sms(mobile_numbers, message_content)
#     return JsonResponse({"status": "success", "api_response": response})


# s
        
class FetchRssAPIView(APIView):
    def post(self, request):
        # urls = request.data.get('feeds')
        # if not isinstance(urls, list):
        #     return Response({'error': 'Provide a list of feed URLs'}, status=status.HTTP_400_BAD_REQUEST)

        items = scrape_rss_feeds()
        saved_count = 0
        for item in items:
            # print(item['user'])
            TwitterDMS.objects.create(
                media_status=int(item['media_status']),
                text=item['summary'],
                translated_text=item['translated_text'],
                user=item['author'],
                language=item['language'],
                region=item['region'],
                date_time=item['date_time'],
                link=item['link']
            )
            saved_count += 1
        # saved = 0
        # for item in items:
        #     obj, created = TwitterDMS.objects.update_or_create(
        #         link=item['link'],
        #         defaults=item
        #     )
        #     if created:
        #         saved += 1

        return Response({'saved_count': saved_count}, status=status.HTTP_200_OK)
    
class FetchRedditAPIView(APIView):
    def post(self, request):
        items = scrape_reddit_feeds()
        # print(items)
        saved_count = 0
        for item in items:
            # print(item['user'])
            TwitterDMS.objects.create(
                media_status=int(item['media_status']),
                text=item['summary'],
                translated_text=item['translated_text'],
                user=item['author'],
                language=item['language'],
                region=item['region'],
                date_time=item['date_time'],
                link=item['link']
            )
            saved_count += 1
        return Response({'saved_count': saved_count}, status=status.HTTP_200_OK)


class Call_TypeAPIView(APIView):
    def get(self, request):
        call_types = CallType.objects.filter(call_type_is_deleted=False)
        serializer = CallTypeSerializer(call_types, many=True)
        return Response(serializer.data)

# class parentcomplaint(APIView):
#     def get(self, request):
#         complaint = ParentComplaint.objects.filter(parent_is_deleted=False)
#         serializer = ParentComplaintSerializer(complaint, many=True)
#         return Response(serializer.data)

class ParentComplaintByCallType(APIView):
    def get(self, request, call_type_id):
        complaints = ParentComplaint.objects.filter(call_type_id=call_type_id, parent_is_deleted=False)
        
        if complaints.exists():
            serializer = ParentComplaintSerializer(complaints, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"message": "No complaints found for this call_type"}, status=status.HTTP_404_NOT_FOUND)

# class DMS_Disaster_Type_disaster_parent_Get_API(APIView):
#     def get(self,request,disaster_parent):
#         snippet = DMS_Disaster_Type.objects.filter(disaster_parent=disaster_parent,disaster_is_deleted=False)
#         serializers = DMS_Disaster_Type_Serializer(snippet,many=True)
#         return Response(serializers.data,status=status.HTTP_200_OK)

class DMS_Disaster_Type_disaster_parent_Get_API(APIView):
    def get(self,request,disaster_parent):
        snippet = DMS_Disaster_Type.objects.filter(disaster_parent=disaster_parent,disaster_is_deleted=False)
        serializers = DMS_Disaster_Type_Serializer(snippet,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)
    
    
    
class IncidentDashboardCount(APIView):
    def get(self, request):
        today = now().date()

        # Last month range
        first_day_this_month = today.replace(day=1)
        last_month_end = first_day_this_month - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)

        # --- Total Calls ---
        total_calls = DMS_Incident.objects.filter(inc_is_deleted=False).count()
        total_emergency = DMS_Incident.objects.filter(inc_is_deleted=False, inc_type=1).count()
        total_non_emergency = DMS_Incident.objects.filter(inc_is_deleted=False, inc_type=2).count()

        # --- Today Calls ---
        today_calls = DMS_Incident.objects.filter(inc_is_deleted=False, inc_added_date__date=today).count()
        today_emergency = DMS_Incident.objects.filter(inc_is_deleted=False, inc_type=1, inc_added_date__date=today).count()
        today_non_emergency = DMS_Incident.objects.filter(inc_is_deleted=False, inc_type=2, inc_added_date__date=today).count()

        # --- Last Month Calls ---
        last_month_calls = DMS_Incident.objects.filter(
            inc_is_deleted=False,
            inc_added_date__date__gte=last_month_start,
            inc_added_date__date__lte=last_month_end
        ).count()

        last_month_emergency = DMS_Incident.objects.filter(
            inc_is_deleted=False,
            inc_type=1,
            inc_added_date__date__gte=last_month_start,
            inc_added_date__date__lte=last_month_end
        ).count()

        last_month_non_emergency = DMS_Incident.objects.filter(
            inc_is_deleted=False,
            inc_type=2,
            inc_added_date__date__gte=last_month_start,
            inc_added_date__date__lte=last_month_end
        ).count()

        data = {
            "total": {
                "all": total_calls,
                "emergency": total_emergency,
                "non_emergency": total_non_emergency,
            },
            "today": {
                "all": today_calls,
                "emergency": today_emergency,
                "non_emergency": today_non_emergency,
            },
            "last_month": {
                "all": last_month_calls,
                "emergency": last_month_emergency,
                "non_emergency": last_month_non_emergency,
            }
        }

        return Response(data)
    
    
class DispatchClosureDashboardCount(APIView):
    def get(self, request):
        today = now().date()

        # Last month range
        first_day_this_month = today.replace(day=1)
        last_month_end = first_day_this_month - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)

        # ---------------- Total Dispatch ----------------
        total_dispatch = DMS_Incident.objects.filter(
            inc_type=1,
            inc_is_deleted=False,
            incident_vehicles__isnull=False   # Join with incident_vehicles
        ).distinct().count()

        # ---------------- Today Dispatch ----------------
        today_dispatch = DMS_Incident.objects.filter(
            inc_type=1,
            inc_is_deleted=False,
            incident_vehicles__isnull=False,
            inc_added_date__date=today
        ).distinct().count()

        # ---------------- Last Month Dispatch ----------------
        last_month_dispatch = DMS_Incident.objects.filter(
            inc_type=1,
            inc_is_deleted=False,
            incident_vehicles__isnull=False,
            inc_added_date__date__gte=last_month_start,
            inc_added_date__date__lte=last_month_end
        ).distinct().count()

        # ---------------- Total Closure ----------------
        total_closure = DMS_incident_closure.objects.filter(
            closure_is_deleted=False
        ).count()

        # ---------------- Today Closure ----------------
        today_closure = DMS_incident_closure.objects.filter(
            closure_is_deleted=False,
            closure_added_date__date=today
        ).count()

        # ---------------- Last Month Closure ----------------
        last_month_closure = DMS_incident_closure.objects.filter(
            closure_is_deleted=False,
            closure_added_date__date__gte=last_month_start,
            closure_added_date__date__lte=last_month_end
        ).count()

        data = {
            "dispatch": {
                "total": total_dispatch,
                "today": today_dispatch,
                "last_month": last_month_dispatch,
            },
            "closure": {
                "total": total_closure,
                "today": today_closure,
                "last_month": last_month_closure,
            }
        }

        return Response(data)



def average_time(queryset):
    """Convert queryset of time objects into average time"""
    times = [t.time for t in queryset if t.time]  # Filter out null values
    if not times:
        return None

    total_seconds = 0
    for t in times:
        total_seconds += t.hour * 3600 + t.minute * 60 + t.second

    avg_seconds = total_seconds // len(times)

    hours = avg_seconds // 3600
    minutes = (avg_seconds % 3600) // 60
    seconds = avg_seconds % 60

    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"


def average_response_time(queryset):
    """Calculate average response time (closure - created)"""
    durations = []
    for closure in queryset:
        if closure.incident_id and closure.incident_id.inc_added_date and closure.closure_added_date:
            diff = closure.closure_added_date - closure.incident_id.inc_added_date
            durations.append(diff.total_seconds())

    if not durations:
        return None

    avg_seconds = sum(durations) // len(durations)
    return str(timedelta(seconds=avg_seconds))

class AverageCallTimeDashboard(APIView):
    def get(self, request):
        today = now().date()

        # Last month range
        first_day_this_month = today.replace(day=1)
        last_month_end = first_day_this_month - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)

        # --- Total Avg ---
        total_avg = average_time(DMS_Incident.objects.filter(
            inc_is_deleted=False,
            inc_type=1,
            time__isnull=False
        ).only("time"))

        # --- Today Avg ---
        today_avg = average_time(DMS_Incident.objects.filter(
            inc_is_deleted=False,
            inc_type=1,
            time__isnull=False,
            inc_added_date__date=today
        ).only("time"))

        # --- Last Month Avg ---
        last_month_avg = average_time(DMS_Incident.objects.filter(
            inc_is_deleted=False,
            inc_type=1,
            time__isnull=False,
            inc_added_date__date__gte=last_month_start,
            inc_added_date__date__lte=last_month_end
        ).only("time"))
        
        # --- Average Response Time ---
        total_response = average_response_time(DMS_incident_closure.objects.filter(
            closure_is_deleted=False
        ).select_related("incident_id"))

        today_response = average_response_time(DMS_incident_closure.objects.filter(
            closure_is_deleted=False,
            closure_added_date__date=today
        ).select_related("incident_id"))

        last_month_response = average_response_time(DMS_incident_closure.objects.filter(
            closure_is_deleted=False,
            closure_added_date__date__gte=last_month_start,
            closure_added_date__date__lte=last_month_end
        ).select_related("incident_id"))

        data = {
            "average_dispatch_time": {
                "total": total_avg,
                "today": today_avg,
                "last_month": last_month_avg,
            },
            "average_response_time": {
                "total": total_response,
                "today": today_response,
                "last_month": last_month_response,
            }
        }

        return Response(data)


class CallTypeWiseCount(APIView):
    def get(self, request):
        today = now().date()
        start_of_month = today.replace(day=1)
        last_month_start = (start_of_month - timedelta(days=1)).replace(day=1)
        last_month_end = start_of_month - timedelta(days=1)

        call_type_counts = (
            CallType.objects.filter(call_type_is_deleted=False)
            .annotate(
                total=Count(
                    "dms_incident",
                    filter=Q(dms_incident__inc_is_deleted=False),
                ),
                today_count=Count(
                    "dms_incident",
                    filter=Q(
                        dms_incident__inc_is_deleted=False,
                        dms_incident__inc_added_date__gte=today,
                        dms_incident__inc_added_date__lt=today + timedelta(days=1),
                    ),
                ),
                last_month_count=Count(
                    "dms_incident",
                    filter=Q(
                        dms_incident__inc_is_deleted=False,
                        dms_incident__inc_added_date__gte=last_month_start,
                        dms_incident__inc_added_date__lte=last_month_end,
                    ),
                ),
            )
            .values("call_type_id", "call_type_name", "total", "today_count", "last_month_count")
        )

        result = [
            {
                "id": item["call_type_id"],
                "name": item["call_type_name"],
                "total": item["total"],
                "today": item["today_count"],
                "last_month": item["last_month_count"],
            }
            for item in call_type_counts
        ]

        return Response({"call_type_counts": result})
    
    
    
class ChiefComplaintWiseCount(APIView):
    def get(self, request, call_type_id):
        today = now().date()
        start_of_month = today.replace(day=1)
        last_month_start = (start_of_month - timedelta(days=1)).replace(day=1)
        last_month_end = start_of_month - timedelta(days=1)

        complaints = (
            ParentComplaint.objects.filter(
                parent_is_deleted=False,
                call_type_id=call_type_id
            )
            .annotate(
                total=Count(
                    "dms_incident",
                    filter=Q(dms_incident__inc_is_deleted=False),
                ),
                today_count=Count(
                    "dms_incident",
                    filter=Q(
                        dms_incident__inc_is_deleted=False,
                        dms_incident__inc_added_date__gte=today,
                        dms_incident__inc_added_date__lt=today + timedelta(days=1),
                    ),
                ),
                last_month_count=Count(
                    "dms_incident",
                    filter=Q(
                        dms_incident__inc_is_deleted=False,
                        dms_incident__inc_added_date__gte=last_month_start,
                        dms_incident__inc_added_date__lte=last_month_end,
                    ),
                ),
            )
            .values("pc_id", "pc_name", "total", "today_count", "last_month_count")
        )

        result = [
            {
                "id": item["pc_id"],
                "name": item["pc_name"],
                "total": item["total"],
                "today": item["today_count"],
                "last_month": item["last_month_count"],
            }
            for item in complaints
        ]

        return Response({"chief_complaints": result})
    
    
    
class SubChiefComplaintWiseCount(APIView):
    def get(self, request, pc_id):
        today = now().date()
        start_of_month = today.replace(day=1)
        last_month_start = (start_of_month - timedelta(days=1)).replace(day=1)
        last_month_end = start_of_month - timedelta(days=1)

        sub_complaints = (
            DMS_Disaster_Type.objects.filter(
                disaster_is_deleted=False,
                disaster_parent_id=pc_id
            )
            .annotate(
                total=Count(
                    "dms_incident",
                    filter=Q(dms_incident__inc_is_deleted=False),
                ),
                today_count=Count(
                    "dms_incident",
                    filter=Q(
                        dms_incident__inc_is_deleted=False,
                        dms_incident__inc_added_date__gte=today,
                        dms_incident__inc_added_date__lt=today + timedelta(days=1),
                    ),
                ),
                last_month_count=Count(
                    "dms_incident",
                    filter=Q(
                        dms_incident__inc_is_deleted=False,
                        dms_incident__inc_added_date__gte=last_month_start,
                        dms_incident__inc_added_date__lte=last_month_end,
                    ),
                ),
            )
            .values("disaster_id", "disaster_name", "total", "today_count", "last_month_count")
        )

        result = [
            {
                "id": item["disaster_id"],
                "name": item["disaster_name"],
                "total": item["total"],
                "today": item["today_count"],
                "last_month": item["last_month_count"],
            }
            for item in sub_complaints
        ]

        return Response({"sub_chief_complaints": result})
    
    
class GisAnaIncidentFilterAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        # Query parameters le rahe hain
        start_date = request.query_params.get("start_date", None)
        end_date = request.query_params.get("end_date", None)
        call_type = request.query_params.get("call_type", None)
        parent_complaint = request.query_params.get("parent_complaint", None)

        # Base queryset
        queryset = DMS_Incident.objects.filter(inc_is_deleted=False, inc_type=1)  # sirf emergency calls

        # Date filter (agar start_date aur end_date diye ho)
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                end = datetime.strptime(end_date, "%Y-%m-%d")
                queryset = queryset.filter(inc_added_date__date__range=[start, end])
            except Exception as e:
                return Response({"error": f"Invalid date format, use YYYY-MM-DD. {str(e)}"}, status=400)

        # Call type filter
        if call_type:
            queryset = queryset.filter(call_type=call_type)

        # Chief complaint filter
        if parent_complaint:
            queryset = queryset.filter(parent_complaint=parent_complaint)

        # Response format
        data = []
        for obj in queryset:
            data.append({
                "incident_id": obj.incident_id,
                "location": obj.location,
                "latitude": obj.latitude,
                "longitude": obj.longitude,
                "district": obj.district.dis_name if obj.district else None,  # assuming DMS_District has dst_name
                "clouser_status": obj.clouser_status
            })

        return Response(data, status=200)