from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/ai/', include('apps.ai_analysis.urls')),
    path('api-auth/', include('rest_framework.urls'))
]
