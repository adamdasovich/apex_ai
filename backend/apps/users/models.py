from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator

class MiningUser(AbstractUser):
    USER_TYPES = [
        ('investor', 'Investor'),
        ('geologist', 'Geologist'),
        ('community', 'Community Member'),
        ('student', 'Student/Academic'),
    ]

    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='community')
    bio = models.TextField(
        blank=True, 
        max_length=500,
        help_text="Tell us about your background in mining/geology"
    )
    
    # Professional information
    company = models.CharField(max_length=200, blank=True)
    job_title = models.CharField(max_length=100, blank=True)
    
    # Location - keep simple for now
    location = models.CharField(
        max_length=200, 
        blank=True,
        help_text="City, State/Province, Country"
    )
    
    # Professional interests - simplified
    INTEREST_CHOICES = [
        ('gold', 'Gold'),
        ('copper', 'Copper'),
        ('silver', 'Silver'),
        ('lithium', 'Lithium'),
        ('rare_earths', 'Rare Earth Elements'),
        ('coal', 'Coal'),
        ('iron_ore', 'Iron Ore'),
        ('exploration', 'Exploration'),
        ('mining_engineering', 'Mining Engineering'),
        ('geology', 'Geology'),
        ('geophysics', 'Geophysics'),
        ('data_analysis', 'Data Analysis'),
    ]
    
    interests = models.JSONField(
        default=list,
        help_text="Select your areas of interest"
    )
    
    # Simple engagement tracking
    profile_completed = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    last_active = models.DateTimeField(auto_now=True)
    
    # Privacy settings
    profile_public = models.BooleanField(
        default=True,
        help_text="Make your profile visible to other users"
    )
    show_location = models.BooleanField(
        default=True,
        help_text="Show your location on your profile"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Mining User"
        verbose_name_plural = "Mining Users"

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

    @property
    def display_name(self):
        """Return the best available display name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username

    @property
    def profile_completion_percentage(self):
        """Calculate how complete the user's profile is"""
        fields_to_check = [
            self.first_name,
            self.last_name, 
            self.bio,
            self.company,
            self.job_title,
            self.location,
            bool(self.interests),
        ]
        completed = sum(1 for field in fields_to_check if field)
        return int((completed / len(fields_to_check)) * 100)

    def mark_profile_completed(self):
        """Check if profile is complete and update flag"""
        completion = self.profile_completion_percentage
        self.profile_completed = completion >= 70
        self.save(update_fields=['profile_completed'])

# Remove UserSubscription for now - focus on core functionality first
# This can be added back when you have paying users to manage

class UserProfile(models.Model):
    """Extended profile information"""
    user = models.OneToOneField(MiningUser, on_delete=models.CASCADE, related_name='profile')
    
    # Professional background
    years_experience = models.IntegerField(
        null=True, blank=True,
        help_text="Years of experience in mining/geology"
    )
    education_level = models.CharField(
        max_length=50,
        choices=[
            ('high_school', 'High School'),
            ('bachelor', 'Bachelor\'s Degree'),
            ('master', 'Master\'s Degree'),
            ('phd', 'PhD'),
            ('professional', 'Professional Certification'),
        ],
        blank=True
    )
    certifications = models.TextField(
        blank=True,
        help_text="Professional certifications or licenses"
    )
    
    # Social links - optional
    linkedin_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    
    # User preferences
    email_notifications = models.BooleanField(
        default=True,
        help_text="Receive email notifications about platform updates"
    )
    weekly_digest = models.BooleanField(
        default=False,
        help_text="Receive weekly digest of platform activity"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"