# from rest_framework import status
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from django.shortcuts import get_object_or_404
# from apps.geological_data.models import DrillHole, Property
# from .models import *
# from .services import ai_analyzer
# import numpy as np
# import logging


# logger = logging.getLogger(__name__)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def analyze_drill_hole(request, drill_hole_id):
#     """Analyze a specific drill hole with AI"""
#     try:
#         drill_hole = get_object_or_404(DrillHole, id=drill_hole_id)

#         # Get drill samples (simulated for now)
#         drill_samples = [
#             {
#                 'from_depth': 0,
#                 'to_depth':10,
#                 'rock_type': 'granite',
#                 'gold_grade': 0.5,
#                 'alteration': 'sericite',
#                 'mineralization': 'disseminated pyrite'
#             },
#             {
#                 'from_depth': 10,
#                 'to_depth':20,
#                 'rock_type': 'granite',
#                 'gold_grade': 2.1,
#                 'alteration': 'chlorite-sericite',
#                 'mineralization': 'quartz veining with pyrite'
#             }
#         ]

#         # Run AI analysis
#         results = ai_analyzer.analyze_drill_data(drill_hole_id, drill_samples)

#         if results.get('error'):
#             return Response({'error': results['error_message']}, status=500)
        
#         # Save results to db
#         ai_model, _ = AIModel.objects.get_or_create(
#             name='Demo Drilling Analyzer',
#             model_type='drilling',
#             version='1.0'
#         )

#         analysis_result = AIAnalysisResult.objects.create(
#             drill_hole=drill_hole,
#             analysis_type='drill_hole',
#             ai_model=ai_model,
#             confidence_score=results['confidence_score'],
#             predicted_grade=results.get('predicted_grade'),
#             anomalies_detected=results['anomalies_detected'],
#             detailed_results=results.get('detaled_results', {}),
#             ai_interpretation=results['ai_interpretation'],
#             recommendations=results['recommendations'],
#             processing_time=results.get('processing_time', 0)
#         )

#         # Update drill hole
#         drill_hole.ai_processed = True
#         drill_hole.ai_confidence_score = results['confidence_score']
#         drill_hole.save()

#         # Update user engagement
#         request.user.ai_interactions =+ 1
#         request.user.save()

#         return Response({
#             'success': True,
#             'analysis_id': analysis_result.id,
#             'results': {
#                 'confidence_score': results['confidence_score'],
#                 'predicted_grade': results.get('predicted_grade'),
#                 'anlmalies_detected': results['anomalies_detected'],
#                 'ai_interpretations': results['ai_interpretation'],
#                 'recommendations': results['recommendations'],
#                 'processing_time': results('processing_time')
#             }
#         })
#     except Exception as e:
#         logger.error(f"error in drill hole analysis: {e}")
#         return Response({'error': str(e)}, status=500)
    
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def analyze_magnetic_survey(request, property_id):
#     """Analyze magnetic survey data"""
#     try:
#         property_obj = get_object_or_404(Property, id=property_id)
        
#         # Simulate magnetic survey data
#         survey_data = np.random.normal(50000, 1000, (50, 50))  # nT values
        
#         results = ai_analyzer.analyze_magnetic_survey(survey_data, property_id)
        
#         # Save results
#         ai_model, _ = AIModel.objects.get_or_create(
#             name="Demo Magnetic Analyzer",
#             model_type="magnetic",
#             version="1.0"
#         )
        
#         analysis_result = AIAnalysisResult.objects.create(
#             property=property_obj,
#             analysis_type='magnetic_survey',
#             ai_model=ai_model,
#             confidence_score=results['confidence_score'],
#             anomalies_detected=results['anomalies_detected'],
#             detailed_results=results.get('detailed_results', {}),
#             ai_interpretation=results['ai_interpretation'],
#             recommendations=results['recommendations'],
#             processing_time=results.get('processing_time', 0)
#         )
        
#         request.user.ai_interactions += 1
#         request.user.save()
        
#         return Response({
#             'success': True,
#             'analysis_id': analysis_result.id,
#             'results': results
#         })
        
#     except Exception as e:
#         logger.error(f"Error in magnetic survey analysis: {e}")
#         return Response({'error': str(e)}, status=500)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_analysis_history(request):
#     """Get user's AI analysis history"""
#     # Get recent analyses
#     recent_analyses = AIAnalysisResult.objects.filter(
#         drill_hole__isnull=False
#     ).select_related('drill_hole', 'ai_model').order_by('-created_at')[:10]
    
#     history = []
#     for analysis in recent_analyses:
#         history.append({
#             'id': analysis.id,
#             'type': analysis.analysis_type,
#             'target': str(analysis.drill_hole or analysis.property),
#             'confidence_score': analysis.confidence_score,
#             'anomalies_detected': analysis.anomalies_detected,
#             'created_at': analysis.created_at,
#             'ai_model': analysis.ai_model.name
#         })
    
#     return Response({
#         'analyses': history,
#         'total_analyses': AIAnalysisResult.objects.count(),
#         'user_ai_interactions': request.user.ai_interactions
#     })