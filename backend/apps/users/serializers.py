from rest_framework import serializers
from .models import MiningUser

class MiningUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MiningUser
        fields = ['id', 'username', 'email', 'user_type', 'bio', 'total_points', 'level']
        read_only_fields = ['id', 'total_points', 'level']