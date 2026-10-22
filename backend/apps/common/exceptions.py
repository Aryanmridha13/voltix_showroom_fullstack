import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Standardized DRF Exception Handler.
    Transforms DRF exceptions and unexpected 500 errors into a consistent JSON envelope:
    {
        "success": false,
        "error": {
            "code": "ERROR_CODE",
            "message": "Human readable summary",
            "details": {...}
        }
    }
    """
    # Call REST framework's default exception handler first to get the standard error response.
    response = exception_handler(exc, context)

    # If response is None, it means an unhandled exception (HTTP 500) occurred
    if response is None:
        logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
        return Response(
            {
                "success": false,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected server error occurred. Please try again later.",
                    "details": None
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Determine error code and message based on HTTP status code
    status_code = response.status_code
    error_code = "API_ERROR"
    message = "An error occurred while processing the request."

    if status_code == status.HTTP_400_BAD_REQUEST:
        error_code = "VALIDATION_ERROR"
        message = "Invalid input or validation failed."
    elif status_code == status.HTTP_401_UNAUTHORIZED:
        error_code = "AUTHENTICATION_REQUIRED"
        message = "Authentication credentials were not provided or are invalid."
    elif status_code == status.HTTP_403_FORBIDDEN:
        error_code = "PERMISSION_DENIED"
        message = "You do not have permission to perform this action."
    elif status_code == status.HTTP_404_NOT_FOUND:
        error_code = "RESOURCE_NOT_FOUND"
        message = "The requested resource could not be found."
    elif status_code == status.HTTP_405_METHOD_NOT_ALLOWED:
        error_code = "METHOD_NOT_ALLOWED"
        message = f"Method {context['request'].method} not allowed for this endpoint."

    # If the response.data is a dict containing a 'detail' string
    details = response.data
    if isinstance(details, dict) and 'detail' in details:
        message = str(details['detail'])
        details = None

    response.data = {
        "success": false,
        "error": {
            "code": error_code,
            "message": message,
            "details": details
        }
    }

    return response
