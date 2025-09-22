# from django.db import models
# from apps.geological_data.models import DrillHole, Property
# import json

# class AIModel(models.Model):
#     """Track different AI models and their versions"""
#     MODEL_TYPES = [
#         ('drilling', 'Drilling Data Analyzer'),
#         ('magnetic', 'Magnetic Survey Analyzer'),
#         ('gravity', 'Gravity Survey Analyzer')
#     ]

#     name = models.CharField(max_length=100)
#     model_type = models.CharField(max_length=20, choices=MODEL_TYPES)
#     version = models.CharField(max_length=20)
#     huggingface_model_id = models.CharField(max_length=200, blank=True)
#     is_active = models.BooleanField(default=True)

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.name} v{self.version}"
    
# class AIAnalysisResult(models.Model):
#     """Store AI analysis results"""
#     ANALYSIS_TYPES = [
#         ('drill_hole', 'Drill Hole Analysis'),
#         ('magnetic_survey', 'Magnetic Survey Analysis'),
#         ('gravity_survey', 'Gravity Survey Analysis'),
#         ('property_assessment', 'Property Assessment')
#     ]

#     #Link to the object being analyzed
#     drill_hole = models.ForeignKey(DrillHole, null=True, blank=True, on_delete=models.CASCADE)
#     property = models.ForeignKey(Property, null=True, blank=True, on_delete=models.CASCADE)

#     analysis_type = models.CharField(max_length=20, choices=ANALYSIS_TYPES)
#     ai_model = models.ForeignKey(AIModel, on_delete=models.CASCADE)

#     # Analysis results
#     confidence_score = models.FloatField()
#     predicted_grade = models.FloatField(null=True, blank=True)
#     anomalies_detected = models.BooleanField(default=False)

#     # Detailed results as JSON
#     detailed_results = models.JSONField(default=dict)
#     ai_interpretation = models.TextField()
#     recommendations = models.JSONField(default=list)

#     # Processing info
#     processing_time = models.FloatField(help_text='Processing time in seconds')
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         target = self.drill_hole or self.property or 'Unknown'
#         return f"AI Analysis of {target} - {self.confidence_score:.2f} confidence"
    

# class AITrainingData(models.Model):
#     """Stor training data for improving models"""
#     analysis_result = models.ForeignKey(AIAnalysisResult, on_delete=models.CASCADE)
#     user_feedback = models.CharField(max_length=20, choices=[
#         ('correct', 'Correct Prediction'),
#         ('incorrect', 'Incorrect Prediction'),
#         ('partially_correct', 'Partially Correct')
#     ])
#     user_comments = models.TextField(blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

