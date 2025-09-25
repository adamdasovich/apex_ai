# backend/apps/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import MiningUser, UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    extra = 0
    fields = ('years_experience', 'education_level', 'certifications', 'linkedin_url', 'website_url')

@admin.register(MiningUser)
class MiningUserAdmin(UserAdmin):
    inlines = [UserProfileInline]
    
    # Simple list display without complex methods
    list_display = ['username', 'email', 'user_type', 'email_verified', 'is_active', 'date_joined']
    list_filter = ['user_type', 'email_verified', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'company']
    
    # Add custom fieldsets
    fieldsets = UserAdmin.fieldsets + (
        ('Mining Profile', {
            'fields': ('user_type', 'bio', 'company', 'job_title', 'location', 'interests')
        }),
        ('Profile Status', {
            'fields': ('profile_completed', 'email_verified', 'profile_public', 'show_location'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['last_active', 'created_at', 'updated_at']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'years_experience', 'education_level', 'email_notifications']
    list_filter = ['education_level', 'email_notifications', 'weekly_digest']
    search_fields = ['user__username', 'user__email', 'certifications']
    raw_id_fields = ['user']