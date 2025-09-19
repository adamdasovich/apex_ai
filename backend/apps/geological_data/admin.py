from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Property)
admin.site.register(DrillHole)
admin.site.register(DrillSample)
admin.site.register(MagneticSurvey)
admin.site.register(GravitySurvey)