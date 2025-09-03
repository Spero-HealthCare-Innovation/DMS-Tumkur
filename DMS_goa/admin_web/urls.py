from django.urls import path
# from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

urlpatterns = [
    #===================================Kirti==================================================
    path('department_post/',DMS_department_post_api.as_view(),name='department_post'),
    path('department_put/<int:dep_id>/',DMS_department_put_api.as_view(),name='department_put'),
    path('department_delete/<int:dep_id>/',DMS_department_delete_api.as_view(),name='department_delete'),


    path('group_post/',DMS_Group_post_api.as_view(),name='group_post'),
    path('group_put/<int:grp_id>/',DMS_Group_put_api.as_view(),name='group_put'),
    path('group_delete/<int:grp_id>/',DMS_Group_delete_api.as_view(),name='group_delete'),

    path('employee_get/',DMS_User_get_api.as_view(), name='employee_get'),
    path('employee_post/',DMS_User_post_api.as_view(),name='employee_post'),
    path('employee_put/<int:emp_id>/',DMS_User_put_api.as_view(),name='employee_put'),
    path('employee_delete/<int:emp_id>/',DMS_User_delete_api.as_view(),name='employee_delete'),
    path('employee_get_id_wise/<int:emp_id>/',DMS_User_Idwise_get_api.as_view(), name='employee_get_id_wise'),
    

    path('employee_changepasswordput/<int:emp_id>/',DMS_ChangePassword_put_api.as_view(),name='employee_put'),

    path('emp_changepassword/',DMS_ChangePassword_api.as_view(),name='employee_password'),
    path('reset-password-request/', PasswordResetRequestView.as_view(), name='reset-password-request'),
    path('reset-password-confirm/<uid>/<token>/', PasswordResetConfirmView.as_view(), name='reset-password-confirm'),

    path('sop_get',DMS_Sop_get_api.as_view(),name='sop_get'),
    path('sop_post',DMS_Sop_post_api.as_view(),name='sop_post'),
    path('sop_put/<int:sop_id>/',DMS_Sop_put_api.as_view(),name='sop_put'),
    path('sop_delete/<int:sop_id>/',DMS_Sop_delete_api.as_view(),name='sop_delete'),

    path('responder_get/',GetResponderList_api.as_view(),name='responder_get'),

    path('disaster_responder_put/<int:pk_id>/',Disaster_Responder_put.as_view(),name='disaster_responder_put'),
    path('Disaster_Responder_delete/<int:pk_id>/',Disaster_responder_delete_api.as_view(),name='Disaster_Responder_delete'),
    path('Disaster_Responder_post/',disaster_responder_Post_api.as_view(),name='Disaster_Responder_post'),
    path('Disaster_Responder_get/',DMS_Disaster_Responder_GET_API.as_view(),name='Disaster_Responder_get'),



    path('closure_post_api/',closure_Post_api.as_view(),name='closure_post_api'),
    path('closurecomplete/',closure_Post_api_app.as_view(),name='closure_post_api'),
    path('closure_post_api2/',closure_Post_api2.as_view(),name='closure_post_api2'),



    path('comment_get_idwise/<int:incident_id>/',comment_idwise_get_api.as_view(),name='comment_get_idwise'),
    path('comment_get',DMS_comment_Get_API.as_view(),name='comment_get'),



    path('dispatch_get/',dispatch_sop_Get_API.as_view(),name='disapatch_get'),
    path('dispatch_get_idwise/<int:inc_id>/',dispatch_sop_Idwise_Get_API.as_view(),name='disapatch_get_idwise'),


    path('incident_get/<int:inc_id>/',incident_get_Api.as_view(),name='incident_get'),



    
    




    

    #===================================Kirti==================================================
    
    
    #===================================Mohin==================================================
    path('state_get/',DMS_state_get_api.as_view(), name='state_get'),
    path('state_get_idwise/<int:state_id>/',DMS_state_idwise_get_api.as_view(), name='state_get_idwise'),
    
    path('district_get/',DMS_district_get_api.as_view(), name='district_get'),
    path('district_get_idwise/<int:state_id>/',DMS_district_idwise_get_api.as_view(), name='district_get_idwise'),
    
    path('Tahsil_get/',DMS_Tahsil_get_api.as_view(), name='Tahsil_get'),
    path('Tahsil_get_idwise/<int:dis_id>/',DMS_Tahsil_idwise_get_api.as_view(), name='Tahsil_get_idwise'),
    
    path('City_get/',DMS_City_get_api.as_view(), name='City_get'),
    path('City_get_idwise/<int:tah_id>/',DMS_City_idwise_get_api.as_view(), name='City_get'),
    
    path('Group_get/',DMS_Group_get_api.as_view(), name='Group_get'),
    path('Group_get_idwise/<int:grp_id>/',DMS_Group_idwise_get_api.as_view(), name='Group_get_idwise'),
    
    path('Department_get/',DMS_Department_get_api.as_view(), name='Department_get'),
    path('Department_get_idwise/<int:dep_id>/',DMS_Department_idwise_get_api.as_view(), name='Department_get_idwise'),
    
    path('DMS_Disaster_Type_Get/',DMS_Disaster_Type_Get_API.as_view(), name='DMS_Disaster_Type_Get'),
    path('DMS_Disaster_Type_Get_Idwise/<int:disaster_id>/',DMS_Disaster_Type_Idwise_Get_API.as_view(), name='DMS_Disaster_Type_Get_Idwise'),
       
    path('DMS_Incident_Post/',DMS_Incident_Post_api.as_view(), name='DMS_Incident_Post'),
    path('DMS_Comments_Post/',DMS_Comments_Post_api.as_view(), name='DMS_Comments_Post'),
    
    path('alerts_get_api/<int:disaster_id>/',alerts_get_api.as_view(), name='alerts_get_api'),  
    
    
    path('manual_call_incident/', Manual_Call_Incident_api.as_view(), name='manual-call-create'),  
    path('Responder_Scope_Get/<int:disaster_id>/', Responder_Scope_Get_api.as_view(), name='Responder_Scope_Get'), 
    
    path('DMS_Summary_Get/<int:summary_type>/', DMS_Summary_Get_API.as_view(), name='DMS_Summary_Get'),
    
    
    path('comments_post/<int:incident_id>/', CommentPostView.as_view(), name='comments_post'),
    
    path('ward_get/<int:tah_id>/', Ward_get_API.as_view(), name='ward_get'),
    path('ward_officer_get/<int:ward_id>/', Ward_Officer_get_API.as_view(), name='ward_officer_get'),
    
    
    
    #===================================Mohin==================================================
    


    #=============================== Mayank =========================================================
    # path('combined/', CombinedAPIView.as_view(), name='combined-api'),
    path('cancel-trigger/', UpdateTriggerStatusAPIView.as_view()),
    
    path('combined/', CombinedAPIView.as_view(), name='combined-api'),#Added Authuntication & Authorization Token
    path('permissions/<source>/<role>/', GetPermissionAPIView.as_view(), name='get_permissions'),#Added Authuntication & Authorization Token
    path('permissions/', CreatePermissionAPIView.as_view(), name='create_permission'),#Added Authuntication & Authorization Token
    path('permissions/<int:id>/', UpdatePermissionAPIView.as_view(), name='update_permission'),#Added Authuntication & Authorization Token
    # path('sources/', AggSourceListAPIView.as_view(), name='agg-source-list'),
    path("call_dashboard/", IncidentDashboardCount.as_view(), name="incident-dashboard-count"),
    path("dispatch_closure/", DispatchClosureDashboardCount.as_view(), name="dispatch-closure-dashboard"),
    path("average_dispatch_time/", AverageCallTimeDashboard.as_view(), name="average-dispatch-time"),
    path("call_type_count/", CallTypeWiseCount.as_view(), name="call-type-count"),
    path("chief_complaints/<int:call_type_id>/", ChiefComplaintWiseCount.as_view(), name="chief-complaints-count"), 
    path("sub_chief_complaints/<int:pc_id>/", SubChiefComplaintWiseCount.as_view(), name="sub-chief-complaints-count"),
    path("gis_map/", GisAnaIncidentFilterAPIView.as_view(), name="chief-complaints-count"), 

    #=============================== Mayank =========================================================



    #=============================== Nikita =========================================================
    # path('login/', CustomTokenObtainPairView.as_view(), name='loin'),
    # path('api/token/', CaptchaTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/captcha/', CaptchaAPIView.as_view(), name='get_captcha'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='login_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('alert/', DMS_Alert_idwise_get_api.as_view(), name='DMS_Alert_idwise'),
    #=============================== Nikita =========================================================

    #=================================  Vinayak =====================================================
    path('get_responder_list/<int:inc_id>/',incident_wise_responder_list.as_view()),
    #=================================  Vinayak =====================================================
    
    #=================================  Varsha =====================================================
    path('post_twitter_api/',twitter_post_api.as_view(),name='twitter_post_api'),
    path('post_scrape_facebook_api/',FacebookPostScrapeAPIView.as_view(),name='post_scrape_facebook_api'),
    path("scrape-news/", NewsScraperAPIView.as_view(), name="scrape-news"),
    path('post_fetch-rss/', FetchRssAPIView.as_view(), name='fetch-rss'),
    path('post_fetch-reddit/', FetchRedditAPIView.as_view(), name='fetch-reddit'),
    #=================================  Varsha =====================================================

    path('call_type/', Call_TypeAPIView.as_view(), name='call_type'),
    # path('parent_complaint_get/', parentcomplaint.as_view(), name='parent_complaint'),
    path('parent_complaint_get_calltypewise/<int:call_type_id>/', ParentComplaintByCallType.as_view(), name='parent_complaint'),
    # path('disaster_type_disaster_parent/<int:disaster_parent>/',DMS_Disaster_Type_disaster_parent_Get_API.as_view(), name='DMS_Disaster_Type_Get')
    path('disaster_type_disaster_parent/<int:disaster_parent>/',DMS_Disaster_Type_disaster_parent_Get_API.as_view(), name='DMS_Disaster_Type_Get'),
]

