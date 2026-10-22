"""
URL configuration for EV Showroom Management System (core project).
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView
)

urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),

    # OpenAPI 3.0 Documentation & Swagger UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Core Domain API Routers
    path('api/v1/', include('apps.common.urls', namespace='common')),
    path('api/v1/auth/', include('apps.accounts.urls', namespace='accounts')),
    path('api/v1/vehicles/', include('apps.vehicles.urls', namespace='vehicles')),
]

# Serve media files in local development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

handler404 = 'apps.common.views.custom_404_view'
handler500 = 'apps.common.views.custom_500_view'

