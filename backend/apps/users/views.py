from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *

# Create your views here.
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = MiningUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
