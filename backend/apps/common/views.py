import time
from django.db import connection
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiResponse

class HealthCheckView(APIView):
    """
    Health check endpoint to probe API readiness and MySQL database connectivity.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="System Health & Database Probe",
        description="Verifies backend API responsiveness and active MySQL database connection.",
        tags=['System Health'],
        responses={
            200: OpenApiResponse(description="System healthy and database connected"),
            503: OpenApiResponse(description="Database connectivity failure")
        }
    )
    def get(self, request):
        db_status = "disconnected"
        db_error = None
        db_latency_ms = None

        start_time = time.time()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                cursor.fetchone()
            db_latency_ms = round((time.time() - start_time) * 1000, 2)
            db_status = "connected"
        except Exception as e:
            db_error = str(e)

        is_healthy = db_status == "connected"

        payload = {
            "success": is_healthy,
            "message": "EV Showroom API is operational." if is_healthy else "Database connectivity issue detected.",
            "data": {
                "status": "healthy" if is_healthy else "degraded",
                "environment": "development" if settings.DEBUG else "production",
                "database": {
                    "engine": "MySQL 8.0",
                    "status": db_status,
                    "latency_ms": db_latency_ms,
                    "error": db_error
                },
                "version": "1.0.0"
            }
        }

        return Response(
            payload,
            status=status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
        )


def custom_404_view(request, exception=None):
    """Fallback 404 handler ensuring JSON response for all missing endpoints."""
    from django.http import JsonResponse
    return JsonResponse(
        {
            "success": False,
            "error": {
                "code": "RESOURCE_NOT_FOUND",
                "message": f"Endpoint '{request.path}' was not found on this server.",
                "details": None
            }
        },
        status=404
    )


def custom_500_view(request):
    """Fallback 500 handler ensuring JSON response for uncaught server errors."""
    from django.http import JsonResponse
    return JsonResponse(
        {
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred. Please contact system support.",
                "details": None
            }
        },
        status=500
    )

