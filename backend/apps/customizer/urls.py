from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ColourViewSet,
    ColourCombinationViewSet,
    VehicleColourConfigViewSet,
    VariantCustomizationOptionsView,
    CalculatePriceView,
)

app_name = 'customizer'

router = DefaultRouter()
router.register(r'colours', ColourViewSet, basename='colour')
router.register(r'combinations', ColourCombinationViewSet, basename='combination')
router.register(r'configs', VehicleColourConfigViewSet, basename='config')

urlpatterns = [
    path('variants/<int:variant_id>/options/', VariantCustomizationOptionsView.as_view(), name='variant-options'),
    path('calculate-price/', CalculatePriceView.as_view(), name='calculate-price'),
    path('', include(router.urls)),
]
