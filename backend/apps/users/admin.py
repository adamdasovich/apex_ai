# backend/apps/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import MiningUser, UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    extra = 0
    fieldsets = (
        ('Professional Background', {
            'fields': ('years_experience', 'education_level', 'certifications')
        }),
        ('Social Links', {
            'fields': ('linkedin_url', 'website_url'),
            'classes': ('collapse',)
        }),
        ('Preferences', {
            'fields': ('email_notifications', 'weekly_digest')
        }),
    )

@admin.register(MiningUser)
class MiningUserAdmin(UserAdmin):
    inlines = [UserProfileInline]
    
    # Customize list display
    list_display = ['username', 'email', 'user_type', 'profile_completion_display', 
                   'email_verified', 'is_active', 'date_joined']
    list_filter = ['user_type', 'email_verified', 'profile_completed', 'is_active', 'date_joined']
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
        ('Timestamps', {
            'fields': ('last_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_active']
    
    def profile_completion_display(self, obj):
        completion = obj.profile_completion_percentage
        color = 'green' if completion >= 70 else 'orange' if completion >= 40 else 'red'
        return format_html(
            '<span style="color: {};">{:.0f}%</span>',
            color, completion
        )
    profile_completion_display.short_description = 'Profile Complete'
    
    actions = ['mark_email_verified', 'send_welcome_email']
    
    def mark_email_verified(self, request, queryset):
        updated = queryset.update(email_verified=True)
        self.message_user(request, f'{updated} users marked as email verified.')
    mark_email_verified.short_description = 'Mark selected users as email verified'

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'years_experience', 'education_level', 'email_notifications']
    list_filter = ['education_level', 'email_notifications', 'weekly_digest']
    search_fields = ['user__username', 'user__email', 'certifications']
    raw_id_fields = ['user']