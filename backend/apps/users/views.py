
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Q
from django.utils import timezone
from .models import MiningUser, UserProfile
from .serializers import (UserRegistrationSerializer, UserProfileUpdateSerializer,
                         UserPublicSerializer, UserDetailSerializer)

class RegisterView(generics.CreateAPIView):
    queryset = MiningUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create authentication token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
                'profile_completed': user.profile_completed
            },
            'token': token.key
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'error': 'Username and password required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Allow login with email or username
    user = authenticate(
        request,
        username=username,
        password=password
    ) or authenticate(
        request,
        email=username,
        password=password
    )
    
    if user:
        if not user.is_active:
            return Response({
                'error': 'Account is disabled'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        token, created = Token.objects.get_or_create(user=user)
        user.last_active = timezone.now()
        user.save(update_fields=['last_active'])
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
                'profile_completed': user.profile_completed
            },
            'token': token.key
        })
    
    return Response({
        'error': 'Invalid credentials'
    }, status=status.HTTP_401_UNAUTHORIZED)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserDetailSerializer
        return UserProfileUpdateSerializer

class PublicUserListView(generics.ListAPIView):
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = MiningUser.objects.filter(
            is_active=True,
            profile_public=True
        ).select_related('profile')
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(company__icontains=search)
            )
        
        # Filter by user type
        user_type = self.request.query_params.get('user_type')
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        
        # Filter by interests
        interest = self.request.query_params.get('interest')
        if interest:
            queryset = queryset.filter(interests__contains=[interest])
        
        return queryset.order_by('-date_joined')

class PublicUserDetailView(generics.RetrieveAPIView):
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MiningUser.objects.filter(
            is_active=True,
            profile_public=True
        ).select_related('profile')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password_view(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(old_password):
        return Response({
            'error': 'Current password is incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 8:
        return Response({
            'error': 'New password must be at least 8 characters'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    # Update token (logout other sessions)
    Token.objects.filter(user=user).delete()
    token = Token.objects.create(user=user)
    
    return Response({
        'message': 'Password changed successfully',
        'token': token.key
    })