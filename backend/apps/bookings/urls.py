from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestRideBookingViewSet

app_name = 'bookings'

router = DefaultRouter()
router.register(r'', TestRideBookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
]
