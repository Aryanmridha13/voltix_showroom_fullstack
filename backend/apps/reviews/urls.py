"""
URL patterns for Reviews app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.reviews.views import VehicleReviewViewSet

app_name = 'reviews'

router = DefaultRouter()
router.register(r'', VehicleReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]
