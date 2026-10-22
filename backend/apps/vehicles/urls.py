from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VehicleCategoryViewSet,
    VehicleModelViewSet,
    VehicleVariantViewSet,
)

app_name = 'vehicles'

router = DefaultRouter()
router.register(r'categories', VehicleCategoryViewSet, basename='category')
router.register(r'models', VehicleModelViewSet, basename='model')
router.register(r'variants', VehicleVariantViewSet, basename='variant')

urlpatterns = [
    # Top-level vehicle catalogue routes
    path('', include(router.urls)),
]
