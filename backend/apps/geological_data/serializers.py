from rest_framework import serializers
from .models import Property, DrillHole, DrillSample

class PropertyListSerializer(serializers.ModelSerializer):
    drill_hole_count = serializers.IntegerField(source='drill_holes.count', read_only=True)

    class Meta:
        model = Property
        fields = ['id', 'name', 'description', 'latitude', 'longitude', 'area_hectares', 
                 'commodity_focus', 'exploration_stage', 'access_road', 'power_available',
                 'drill_hole_count', 'last_updated']


class DrillSampleSerializer(serializers.ModelSerializer):
    interval_length = serializers.ReadOnlyField()
    midpoint_depth = serializers.ReadOnlyField() 

    class Meta:
        model = DrillSample
        fields = ['id', 'from_depth', 'to_depth', 'interval_length', 'midpoint_depth',
                 'gold_grade', 'silver_grade', 'copper_grade', 'rock_type', 
                 'alteration', 'mineralization']
        

class DrillHoleSerializer(serializers.ModelSerializer):
    samples = DrillSampleSerializer(many=True, read_only=True)
    sample_count = serializers.ReadOnlyField()
    average_gold_grade = serializers.ReadOnlyField()
    property_name = serializers.CharField(source='geo_property.name', read_only=True)

    class Meta:
        model = DrillHole
        fields = ['id', 'hole_id', 'geo_property', 'property_name', 'latitude', 'longitude', 
                 'elevation', 'total_depth', 'azimuth', 'dip', 'drilling_date', 
                 'sample_count', 'average_gold_grade', 'samples']

class PropertyDetailSerializer(serializers.ModelSerializer):
    drill_holes = DrillHoleSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = ['id', 'name', 'description', 'latitude', 'longitude', 'area_hectares',
                 'commodity_focus', 'geological_setting', 'access_road', 'power_available',
                 'exploration_stage', 'last_updated', 'drill_holes']

        
