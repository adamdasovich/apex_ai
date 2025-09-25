# backend/apps/geological_data/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from apps.users.models import MiningUser

class Property(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField()
    
    # Replace text location with proper coordinates
    latitude = models.DecimalField(
        max_digits=10, decimal_places=7, 
        null=True, blank=True,
        help_text="Latitude in decimal degrees"
    )
    longitude = models.DecimalField(
        max_digits=10, decimal_places=7, 
        null=True, blank=True,
        help_text="Longitude in decimal degrees"
    )
    area_hectares = models.FloatField(validators=[MinValueValidator(0.1)])

    # Property details
    commodity_focus = models.JSONField(
        default=list,
        help_text="List of commodities being explored (e.g., ['gold', 'copper'])"
    )
    geological_setting = models.TextField(blank=True)
    access_road = models.BooleanField(default=False)
    power_available = models.BooleanField(default=False)

    # Status
    EXPLORATION_STAGES = [
        ('grassroots', 'Grassroots'),
        ('early', 'Early Stage'),
        ('advanced', 'Advanced'),
        ('resource', 'Resource Definition'),
        ('feasibility', 'Feasibility'),
        ('development', 'Development'),
        ('production', 'Production'),
    ]
    exploration_stage = models.CharField(
        max_length=20, 
        choices=EXPLORATION_STAGES,
        default='grassroots'
    )
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Properties"
        ordering = ['name']

    def __str__(self):
        return self.name

class DrillHole(models.Model):
    geo_property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='drill_holes')
    hole_id = models.CharField(max_length=50)
    
    # Proper coordinate system
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    elevation = models.FloatField(help_text="Elevation in meters above sea level")

    # Drilling details with proper validation
    total_depth = models.FloatField(
        validators=[MinValueValidator(0.1)],
        help_text="Total depth in meters"
    )
    azimuth = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(360)],
        help_text="Azimuth in degrees (0-360)"
    )
    dip = models.FloatField(
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
        help_text="Dip in degrees (-90 to +90, negative = upward)"
    )
    drilling_date = models.DateField()
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['geo_property', 'hole_id']
        ordering = ['geo_property', 'hole_id']

    def __str__(self):
        return f"{self.geo_property.name} - {self.hole_id}"

    @property
    def sample_count(self):
        return self.samples.count()

    @property
    def average_gold_grade(self):
        """Calculate average gold grade for this hole"""
        samples_with_gold = self.samples.filter(gold_grade__isnull=False)
        if not samples_with_gold.exists():
            return None
        return samples_with_gold.aggregate(
            avg_grade=models.Avg('gold_grade')
        )['avg_grade']

class DrillSample(models.Model):
    drill_hole = models.ForeignKey(DrillHole, on_delete=models.CASCADE, related_name='samples')
    from_depth = models.FloatField(validators=[MinValueValidator(0)])
    to_depth = models.FloatField(validators=[MinValueValidator(0)])

    # Assay results with proper validation
    gold_grade = models.FloatField(
        null=True, blank=True, 
        validators=[MinValueValidator(0)],
        help_text="Gold grade in g/t"
    )
    silver_grade = models.FloatField(
        null=True, blank=True, 
        validators=[MinValueValidator(0)],
        help_text="Silver grade in g/t"
    )
    copper_grade = models.FloatField(
        null=True, blank=True, 
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Copper grade in %"
    )

    # Rock description
    ROCK_TYPES = [
        ('igneous', 'Igneous'),
        ('sedimentary', 'Sedimentary'),
        ('metamorphic', 'Metamorphic'),
        ('volcanic', 'Volcanic'),
        ('intrusive', 'Intrusive'),
        ('other', 'Other'),
    ]
    rock_type = models.CharField(max_length=20, choices=ROCK_TYPES, default='other')
    alteration = models.CharField(max_length=200, blank=True)
    mineralization = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['drill_hole', 'from_depth', 'to_depth']
        ordering = ['drill_hole', 'from_depth']

    # def clean(self):
    #     """Validate depth relationships"""
    #     if self.to_depth <= self.from_depth:
    #         raise ValidationError("To depth must be greater than from depth")
    #     if self.from_depth < 0:
    #         raise ValidationError("From depth cannot be negative")
        
    #     # Use drill_hole_id instead of drill_hole for validation during creation
    #     if not self.drill_hole_id:
    #         raise ValidationError("Drill hole is required")
        
    #     # Check for overlapping intervals in the same hole
    #     overlapping = DrillSample.objects.filter(
    #         drill_hole_id=self.drill_hole_id  # Use drill_hole_id instead of drill_hole
    #     ).exclude(pk=self.pk).filter(
    #         from_depth__lt=self.to_depth,
    #         to_depth__gt=self.from_depth
    #     )
    #     if overlapping.exists():
    #         raise ValidationError("Sample intervals cannot overlap")

    """Temperory clean function"""
    def clean(self):
        """Validate depth relationships"""
        # Debug logging
        print(f"DEBUG: drill_hole_id = {self.drill_hole_id}")
        print(f"DEBUG: from_depth = {self.from_depth}")
        print(f"DEBUG: to_depth = {self.to_depth}")
        
        if self.to_depth <= self.from_depth:
            raise ValidationError("To depth must be greater than from depth")
        if self.from_depth < 0:
            raise ValidationError("From depth cannot be negative")
        
        # Use drill_hole_id instead of drill_hole for validation during creation
        if not self.drill_hole_id:
            raise ValidationError("Drill hole is required")
        
        # Check for overlapping intervals in the same hole
        overlapping = DrillSample.objects.filter(
            drill_hole_id=self.drill_hole_id
        ).exclude(pk=self.pk).filter(
            from_depth__lt=self.to_depth,
            to_depth__gt=self.from_depth
        )
        if overlapping.exists():
            raise ValidationError("Sample intervals cannot overlap")


    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def interval_length(self):
        """Return the length of this sample interval"""
        return self.to_depth - self.from_depth

    @property
    def midpoint_depth(self):
        """Return the midpoint depth of this sample"""
        return (self.from_depth + self.to_depth) / 2

    def __str__(self):
        return f"{self.drill_hole.hole_id}: {self.from_depth}-{self.to_depth}m"

# Remove MagneticSurvey and GravitySurvey for now - focus on drill data first
# These can be added back later once the core system is working