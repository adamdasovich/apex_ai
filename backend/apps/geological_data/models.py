from django.db import models
from apps.users.models import MiningUser

class Property(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=200, blank=True)
    area_hectares = models.FloatField()

    # Property details
    commodity_focus = models.JSONField(default=list)
    geological_setting = models.TextField()
    access_road = models.BooleanField(default=False)
    power_available = models.BooleanField(default=False)

    #Status
    exploration_stage = models.CharField(max_length=50)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
class DrillHole(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    hole_id = models.CharField(max_length=50)
    location = models.CharField(max_length=200, blank=True)

    # Drilling details
    total_depth = models.FloatField()
    azimuth = models.FloatField()
    dip = models.FloatField()
    drilling_date = models.DateField()

    # AI analysis status
    ai_processed = models.BooleanField(default=False)
    ai_confidence_score = models.FloatField(null=True, blank=True)
    ai_predicted_grade = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.property.name} - {self.hole_id}"

class DrillSample(models.Model):
    drill_hole = models.ForeignKey(DrillHole, on_delete=models.CASCADE)
    from_depth = models.FloatField()
    to_depth = models.FloatField()

    #Assay results
    gold_grade = models.FloatField(null=True, blank=True)
    silver_grade = models.FloatField(null=True, blank=True)
    copper_grade = models.FloatField(null=True, blank=True)

    #Rock description
    rock_type = models.CharField(max_length=100)
    alteration = models.CharField(max_length=200, blank=True)
    mineralization = models.TextField(blank=True)

    # AI generated insights
    ai_analysis = models.JSONField(default=dict)
    anomaly_detected = models.BooleanField(default=False)


class MagneticSurvey(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    survey_date = models.DateField()
    flight_height = models.FloatField() # meters
    line_spacing = models.FloatField() # meters

    #Data file
    data_file = models.FileField(upload_to='magnetic_surveys/')
    processed_data = models.JSONField(default=dict)

    #AI analysis results
    anomalies_detected = models.IntegerField(default=0)
    ai_interpretation = models.TextField(blank=True)
    confidence_score = models.FloatField(null=True, blank=True)

class GravitySurvey(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    survey_date = models.DateField()
    station_spacing = models.FloatField()

    # Data
    data_file = models.FileField(upload_to='gravity_surveys/', blank=True, null=True)
    processed_data = models.JSONField(default=dict)

    # AI insights
    density_anomalies = models.JSONField(default=list)
    ai_interpretation = models.TextField(blank=True)
    targets_identified = models.IntegerField(default=0)