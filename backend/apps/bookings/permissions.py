from rest_framework import permissions

class IsBookingOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission allowing only the customer who created the booking
    or an administrator to view or cancel it.
    """
    message = "You do not have permission to view or manage this booking."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        return obj.customer == request.user
