from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, Max, Min
from .models import *
from .serializers import *

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PropertyDetailSerializer
        return PropertyListSerializer
    
    def get_queryset(self):
        queryset = Property.objects.annotate(
            drill_hole_count = Count('drill_holes')
        ).order_by('name')

        # filter by exploration stage
        stage = self.request.query_params.get('stage')
        if stage:
            queryset = queryset.filter(exploration_stage=stage)

        # filter by commodity
        commodity = self.request.query_params.get('commodity')
        if commodity:
            queryset = queryset.request.query_params.get(commodity_focus__contains=[commodity])

        return queryset
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get detailed statistics for a property"""
        property_obj = self.get_object()

        # get all samples for this property
        samples = DrillSample.objects.filter(drill_hole__property=property_obj)

        # Calculate statistics
        stats = {
            'property_name': property_obj.name,
            'total_drill_holes': property_obj.drill_holes.count(),
            'total_samples': samples.count(),
            'total_meters': samples.aggregate(
                total=models.Sum(models.F('to_depth') - models.F('from_depth'))
            )['total'] or 0,
        }
        
        # Gold grade statistics
        gold_samples = samples.filter(gold_grade__isnull=False)
        if gold_samples.exists():
            gold_stats = gold_samples.aggregate(
                avg_grade=Avg('gold_grade'),
                max_grade=Max('gold_grade'),
                min_grade=Min('gold_grade'),
                count=Count('id')
            )
            stats['gold_statistics'] = gold_stats
        
        # Silver grade statistics
        silver_samples = samples.filter(silver_grade__isnull=False)
        if silver_samples.exists():
            silver_stats = silver_samples.aggregate(
                avg_grade=Avg('silver_grade'),
                max_grade=Max('silver_grade'),
                min_grade=Min('silver_grade'),
                count=Count('id')
            )
            stats['silver_statistics'] = silver_stats
        
        # Copper grade statistics
        copper_samples = samples.filter(copper_grade__isnull=False)
        if copper_samples.exists():
            copper_stats = copper_samples.aggregate(
                avg_grade=Avg('copper_grade'),
                max_grade=Max('copper_grade'),
                min_grade=Min('copper_grade'),
                count=Count('id')
            )
            stats['copper_statistics'] = copper_stats
        
        return Response(stats)
    
class DrillHoleViewSet(viewsets.ModelViewSet):
    queryset = DrillHole.objects.select_related('property').prefetch_related('samples')
    serializer_class = DrillHoleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = self.queryset

        #Filter by property
        property_id = self.request.query_params.get('geo_property')
        if property_id:
            queryset = queryset.filter(property_id=property_id)
        return queryset.order_by('property__name', 'hole_id')
    

class DrillSampleViewSet(viewsets.ModelViewSet):
    queryset = DrillSample.objects.select_related('drill_hole__property')
    serializer_class = DrillSampleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filter by drill hole
        drill_hole_id = self.request.query_params.get('drill_hole')
        if drill_hole_id:
            queryset = queryset.filter(drill_hole_id=drill_hole_id)
            
        # Filter by property
        property_id = self.request.query_params.get('geo_property')
        if property_id:
            queryset = queryset.filter(drill_hole__property_id=property_id)
            
        # Filter by minimum gold grade
        min_gold_grade = self.request.query_params.get('min_gold_grade')
        if min_gold_grade:
            try:
                min_grade = float(min_gold_grade)
                queryset = queryset.filter(gold_grade__gte=min_grade)
            except ValueError:
                pass
                
        return queryset.order_by('drill_hole__geo_property__name', 'drill_hole__hole_id', 'from_depth')
