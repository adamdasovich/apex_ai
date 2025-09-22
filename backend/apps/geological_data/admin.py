# backend/apps/geological_data/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Property, DrillHole, DrillSample

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['name', 'area_hectares', 'exploration_stage', 'drill_hole_count', 'last_updated']
    list_filter = ['exploration_stage', 'access_road', 'power_available']
    search_fields = ['name', 'description', 'geological_setting']
    readonly_fields = ['last_updated', 'created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'exploration_stage')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude', 'area_hectares')
        }),
        ('Property Details', {
            'fields': ('commodity_focus', 'geological_setting', 'access_road', 'power_available')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'last_updated'),
            'classes': ('collapse',)
        }),
    )
    
    def drill_hole_count(self, obj):
        count = obj.drill_holes.count()
        if count > 0:
            return format_html('<strong>{}</strong>', count)
        return count
    drill_hole_count.short_description = 'Drill Holes'

class DrillSampleInline(admin.TabularInline):
    model = DrillSample
    extra = 0
    fields = ['from_depth', 'to_depth', 'rock_type', 'gold_grade', 'silver_grade', 'copper_grade']
    readonly_fields = []
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('drill_hole')

@admin.register(DrillHole)
class DrillHoleAdmin(admin.ModelAdmin):
    list_display = ['hole_id', 'property_name', 'total_depth', 'sample_count_display', 'avg_gold_grade_display', 'drilling_date']
    list_filter = ['drilling_date']
    search_fields = ['hole_id', 'property__name']
    inlines = [DrillSampleInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('property', 'hole_id', 'drilling_date')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude', 'elevation')
        }),
        ('Drilling Parameters', {
            'fields': ('total_depth', 'azimuth', 'dip')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at']
    
    def property_name(self, obj):
        return obj.property.name
    property_name.short_description = 'Property'
    
    def sample_count_display(self, obj):
        count = obj.sample_count
        if count > 0:
            return format_html('<strong>{}</strong>', count)
        return count
    sample_count_display.short_description = 'Samples'
    
    def avg_gold_grade_display(self, obj):
        avg_grade = obj.average_gold_grade
        if avg_grade is not None:
            return f"{avg_grade:.2f} g/t"
        return "No gold assays"
    avg_gold_grade_display.short_description = 'Avg Au Grade'

@admin.register(DrillSample)
class DrillSampleAdmin(admin.ModelAdmin):
    list_display = ['drill_hole_display', 'depth_interval', 'rock_type', 'gold_grade_display', 'silver_grade_display', 'copper_grade_display']
    list_filter = ['rock_type', 'drill_hole__drilling_date']
    search_fields = ['drill_hole__hole_id', 'drill_hole__property__name', 'rock_type']
    
    fieldsets = (
        ('Sample Location', {
            'fields': ('drill_hole', 'from_depth', 'to_depth')
        }),
        ('Assay Results', {
            'fields': ('gold_grade', 'silver_grade', 'copper_grade')
        }),
        ('Geological Description', {
            'fields': ('rock_type', 'alteration', 'mineralization')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at']
    
    def drill_hole_display(self, obj):
        return f"{obj.drill_hole.property.name} - {obj.drill_hole.hole_id}"
    drill_hole_display.short_description = 'Drill Hole'
    
    def depth_interval(self, obj):
        return f"{obj.from_depth}-{obj.to_depth}m ({obj.interval_length:.1f}m)"
    depth_interval.short_description = 'Interval'
    
    def gold_grade_display(self, obj):
        if obj.gold_grade is not None:
            color = "green" if obj.gold_grade > 1.0 else "black"
            return format_html('<span style="color: {}">{:.2f} g/t</span>', color, obj.gold_grade)
        return "-"
    gold_grade_display.short_description = 'Au (g/t)'
    
    def silver_grade_display(self, obj):
        if obj.silver_grade is not None:
            return f"{obj.silver_grade:.1f} g/t"
        return "-"
    silver_grade_display.short_description = 'Ag (g/t)'
    
    def copper_grade_display(self, obj):
        if obj.copper_grade is not None:
            return f"{obj.copper_grade:.2f}%"
        return "-"
    copper_grade_display.short_description = 'Cu (%)'