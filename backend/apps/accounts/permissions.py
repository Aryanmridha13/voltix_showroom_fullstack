from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to authenticated users with the ADMIN role
    or standard Django staff/superuser privileges.
    """
    message = "Administrator privileges are required to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )


class IsCustomerUserRole(permissions.BasePermission):
    """
    Allows access only to authenticated customers.
    """
    message = "Only registered customer accounts can access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'CUSTOMER'
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object (e.g. Profile, Booking)
    or administrators to view or edit it.
    """
    message = "You do not have permission to access or modify this record."

    def has_object_permission(self, request, view, obj):
        # Admins always have access
        if request.user.is_authenticated and (
            request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser
        ):
            return True

        # Check if the object is the user itself
        if obj == request.user:
            return True

        # Check if the object has a 'user' or 'customer' field
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        if hasattr(obj, 'customer') and obj.customer == request.user:
            return True

        return False
