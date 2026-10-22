from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PartCategoryViewSet, SparePartViewSet

app_name = 'parts'

router = DefaultRouter()
router.register(r'categories', PartCategoryViewSet, basename='category')
router.register(r'items', SparePartViewSet, basename='item')

urlpatterns = [
    path('', include(router.urls)),
]
