from django.contrib import admin
from .models import *

from admin_web.models import DMS_User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField

 
# Register your models here.
# class UserCreationForm(forms.ModelForm):
#     """A form for creating new users. Includes all the required
#     fields, plus a repeated password."""
#     password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
#     password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)

#     class Meta:
#         model = DMS_Employee
#         fields = ('emp_username', 'grp_id', 'emp_name', 'emp_email', 'emp_contact_no', 'emp_dob', 'emp_doj', 'emp_is_login', 'state_id', 'dist_id', 'tahsil_id', 'city_id', 'emp_is_deleted', 'emp_added_by', 'emp_modified_by')

#     def clean_password2(self):
#         # Check that the two password entries match
#         password1 = self.cleaned_data.get("password1")
#         password2 = self.cleaned_data.get("password2")
#         if password1 and password2 and password1 != password2:
#             raise forms.ValidationError("Passwords don't match")
#         return password2

#     def save(self, commit=True):
#         # Save the provided password in hashed format
#         user = super(UserCreationForm, self).save(commit=False)
#         user.set_password(self.cleaned_data["password1"])
#         if commit:
#             user.save()
#         return user



# class UserChangeForm(forms.ModelForm):
#     """A form for updating users. Includes all the fields on
#     the user, but replaces the password field with admin's
#     password hash display field.
#     """
#     # password = ReadOnlyPasswordHashField()

#     class Meta:
#         model = DMS_Employee
#         fields = '__all__'
#         # fields = ('email', 'password','group', 'name','tc', 'is_active', 'is_admin')

#     def clean_password(self):
#         # Regardless of what the user provides, return the initial value.
#         # This is done here, rather than on the field, because the
#         # field does not have access to the initial value
#         return self.initial["password"]


# class UserModelAdmin(BaseUserAdmin):
#   # The fields to be used in displaying the User model.
#   # These override the definitions on the base UserModelAdmin
#   # that reference specific fields on auth.User.
#   list_display = ('emp_id', 'is_admin', 'emp_username', 'grp_id', 'emp_name', 'emp_email', 'emp_contact_no', 'emp_dob', 'emp_doj', 'emp_is_login', 'state_id', 'dist_id', 'tahsil_id', 'city_id', 'emp_is_deleted', 'emp_added_by', 'emp_modified_by')

#   list_filter = ('is_admin',)

#   fieldsets = (
#       ('User Credentials', {'fields': ('emp_username', 'password')}),
#       ('Personal info', {'fields': ('grp_id', 'emp_name', 'emp_email', 'emp_contact_no', 'emp_dob', 'emp_doj', 'emp_is_login', 'state_id', 'dist_id', 'tahsil_id', 'city_id', 'emp_is_deleted', 'emp_added_by', 'emp_modified_by')}),
#       ('Permissions', {'fields': ('is_admin',)}),
#   )
#   # add_fieldsets is not a standard ModelAdmin attribute. UserModelAdmin
#   # overrides get_fieldsets to use this attribute when creating a user.
#   add_fieldsets = (
#       (None, {
#           'classes': ('wide',),
#           'fields': ('emp_username', 'grp_id', 'emp_name', 'emp_email', 'emp_contact_no', 'emp_dob', 'emp_doj', 'emp_is_login', 'state_id', 'dist_id', 'tahsil_id', 'city_id', 'emp_is_deleted', 'emp_added_by', 'emp_modified_by', 'password1', 'password2'),
#       }),
#   )
#   search_fields = ('emp_username',)
#   ordering = ('emp_username', 'id')
#   filter_horizontal = ()




class UserCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)
 
    class Meta:
        model = DMS_User
        fields = ('user_username', 'grp_id', 'user_is_login', 'user_is_deleted', 'user_added_by', 'user_modified_by')
 
    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2
 
    def save(self, commit=True):
        user = super(UserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user
 
 
 
class UserChangeForm(forms.ModelForm):

    class Meta:
        model = DMS_User
        fields = '__all__'
    
 
    def clean_password(self):
        return self.initial["password"]
 
 
class UserModelAdmin(BaseUserAdmin):
   
    list_display = ('user_id', 'is_admin', 'user_username', 'grp_id', 'user_is_login', 'user_is_deleted', 'user_added_by', 'user_modified_by')
    
    list_filter = ('is_admin',)
    
  
    fieldsets = (
        ('User Credentials', {'fields': ('user_username', 'password')}),
        ('Personal info', {'fields': ('grp_id', 'user_is_login', 'user_is_deleted', 'user_added_by', 'user_modified_by')}),
        ('Permissions', {'fields': ('is_admin',)}),
    )
   
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('user_username', 'grp_id', 'user_is_login', 'user_is_deleted', 'user_added_by', 'user_modified_by', 'password1', 'password2'),
        }),
    )
    search_fields = ('user_username',)
    ordering = ('user_username', 'id')
    filter_horizontal = ()




# Register your models here.
admin.site.register(DMS_State)
admin.site.register(DMS_District)
admin.site.register(DMS_Tahsil)
admin.site.register(DMS_City)
admin.site.register(DMS_Department)
admin.site.register(DMS_Group)
admin.site.register(DMS_Module)
admin.site.register(DMS_SubModule)
admin.site.register(DMS_Action)
admin.site.register(DMS_Permission)
admin.site.register(DMS_User)
admin.site.register(DMS_WebLogin)
admin.site.register(DMS_Disaster_Type)
admin.site.register(DMS_Incident)
admin.site.register(Weather_alerts)
admin.site.register(DMS_Notify)
admin.site.register(DMS_Alert_Type)
admin.site.register(DMS_SOP)
admin.site.register(DMS_Caller)
admin.site.register(DMS_Disaster_Responder)
admin.site.register(DMS_Responder)
admin.site.register(DMS_Summary)
admin.site.register(DMS_Comments)
admin.site.register(DMS_Ward)
admin.site.register(DMS_open_weather_alerts)
admin.site.register(DMS_Employee)
admin.site.register(DMS_Ward_Officers)
admin.site.register(CallType)
admin.site.register(ParentComplaint)