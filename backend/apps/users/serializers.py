from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import MiningUser, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['years_experience', 'education_level', 'certifications', 
                 'linkedin_url', 'website_url', 'email_notifications', 'weekly_digest']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = MiningUser
        fields = ['username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name', 'user_type']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = MiningUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    profile_completion_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = MiningUser
        fields = ['first_name', 'last_name', 'bio', 'company', 'job_title', 
                 'location', 'interests', 'profile_public', 'show_location',
                 'profile_completion_percentage', 'profile']
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile fields
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        # Check if profile is now complete
        instance.mark_profile_completed()
        
        return instance

class UserPublicSerializer(serializers.ModelSerializer):
    """Serializer for public user information"""
    display_name = serializers.ReadOnlyField()
    
    class Meta:
        model = MiningUser
        fields = ['id', 'username', 'display_name', 'user_type', 'bio', 
                 'company', 'job_title', 'interests', 'date_joined']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Respect privacy settings
        if not instance.profile_public:
            return {
                'id': data['id'],
                'username': data['username'],
                'user_type': data['user_type']
            }
        
        if not instance.show_location:
            data.pop('location', None)
            
        return data
