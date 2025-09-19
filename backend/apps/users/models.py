from django.db import models
from django.contrib.auth.models import AbstractUser

class MiningUser(AbstractUser):
    USER_TYPES = [
        ('investor', 'Investor'),
        ('geologist', 'Geologist'),
        ('community', 'Community Member'),
        ('premium', 'Premium Member')
    ]

    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='community')
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    interests = models.JSONField(default=list) #['gold', 'copper', 'ai_analysis']

    # Gamification fields
    total_points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    badges = models.JSONField(default=list)

    # Engagement tracking
    ai_interactions = models.IntegerField(default=0)
    prize_draw_entries = models.IntegerField(default=0)
    community_posts = models.IntegerField(default=0)

    # NFT wallet
    wallet_address = models.CharField(max_length=42, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username

class UserSubscription(models.Model):
    SUBSCRIPTION_TYPES = [
        ('free', 'Gold Seeker'),
        ('pro', 'Prospector Pro'),
        ('mogul', 'Mining Mogul')
    ]

    user = models.OneToOneField(MiningUser, on_delete=models.CASCADE)
    subscription_type = models.CharField(max_length=10, choices=SUBSCRIPTION_TYPES, default='free')
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
