from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'properties', PropertyViewSet)
router.register(r'drill-holes', DrillHoleViewSet)
router.register(r'drill-samples', DrillSampleViewSet)

urlpatterns = [
    path('api/geological/', include(router.urls))
]
