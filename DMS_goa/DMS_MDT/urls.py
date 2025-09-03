from django.urls import path
from .views import *


urlpatterns = [
    path('Register_veh/', Register_veh.as_view()),
    path('vehicleotp',vehicleotp.as_view()),
    path('Checkpilotemtotp', VehicleLogin.as_view()),
    path('userlist', userlist.as_view()),
    path('VehicleLogout/', VehicleLogout.as_view()),
    path('employee_list/', employee_list.as_view()),
    path('device', add_device.as_view()),
    path('Vehical_department_wise/',Vehical_department_wise.as_view()),
    path('vehical_base_loc/',get_base_location_vehicle.as_view()),
    path('vehical/',get_vehicle.as_view()),
    path('listassignincidentcalls',get_assign_inc_calls.as_view()),
    path('compincidentinfo',get_assign_completed_inc_calls.as_view()),
    path('alldriverparameters',get_alldriverparameters.as_view()),
    path("parametersdetails", update_pcr_report, name="update_pcr_report"),
    path('closurecomplete',closure_Post_api_app.as_view(),name='closure_post_api'),
    path('Userlistambvise', Userlistambvise.as_view(),name='Userlistambvise'),
    path('clockinout',Clockinout.as_view(),name='clockinout'),
    path("vehical_dashboard/", VehicalDashboardCount.as_view(), name="vehical-dashboard-count"),    
]
 