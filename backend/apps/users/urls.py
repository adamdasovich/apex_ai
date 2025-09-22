from django.urls import path
from .views import (RegisterView, login_view, ProfileView, PublicUserListView, 
                   PublicUserDetailView, change_password_view)

urlpatterns = [
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', login_view, name='login'),
    path('api/auth/profile/', ProfileView.as_view(), name='profile'),
    path('api/auth/change-password/', change_password_view, name='change-password'),
    path('api/users/', PublicUserListView.as_view(), name='user-list'),
    path('api/users/<int:pk>/', PublicUserDetailView.as_view(), name='user-detail'),
]