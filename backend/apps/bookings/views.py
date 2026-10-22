from datetime import datetime
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse, OpenApiParameter

from apps.accounts.permissions import IsAdminUserRole
from .models import TestRideBooking
from .services import BookingService
from .permissions import IsBookingOwnerOrAdmin
from .serializers import (
    BookingCreateSerializer,
    BookingDetailSerializer,
    BookingCancelSerializer,
    AdminBookingStatusUpdateSerializer,
)

@extend_schema_view(
    list=extend_schema(summary="List Test Ride Bookings (Customer sees own, Admin sees all)"),
    retrieve=extend_schema(summary="Get Single Booking Details (Owner or Admin)"),
    create=extend_schema(summary="Book a Test Ride (Authenticated Customer)"),
)
class TestRideBookingViewSet(viewsets.GenericViewSet):
    """
    Test Ride Booking ViewSet managing scheduling, slot validation,
    customer booking history, cancellation, and admin status updates.
    """
    queryset = TestRideBooking.objects.select_related(
        'customer',
        'variant',
        'variant__model',
        'variant__model__category'
    ).all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'booking_date', 'variant']
    ordering_fields = ['booking_date', 'created_at']
    ordering = ['-booking_date', '-created_at']

    def get_permissions(self):
        if self.action == 'available_slots':
            return [AllowAny()]
        elif self.action in ['update_status']:
            return [IsAdminUserRole()]
        return [IsAuthenticated(), IsBookingOwnerOrAdmin()]

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        elif self.action == 'cancel':
            return BookingCancelSerializer
        elif self.action == 'update_status':
            return AdminBookingStatusUpdateSerializer
        return BookingDetailSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return TestRideBooking.objects.none()
        # Admins can view all bookings across the showroom
        if user.is_admin:
            return self.queryset
        # Customers can only view their own personal bookings
        return self.queryset.filter(customer=user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = BookingDetailSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = BookingDetailSerializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "Test ride bookings retrieved successfully.",
            "data": serializer.data
        })

    def retrieve(self, request, *args, **kwargs):
        booking = self.get_object()
        serializer = BookingDetailSerializer(booking)
        return Response({
            "success": True,
            "message": "Booking details retrieved successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = BookingService.create_booking(
            customer=request.user,
            variant_id=serializer.validated_data['variant_id'],
            booking_date=serializer.validated_data['booking_date'],
            time_slot=serializer.validated_data['time_slot'],
            contact_phone=serializer.validated_data['contact_phone'],
            driving_license_number=serializer.validated_data['driving_license_number']
        )

        read_serializer = BookingDetailSerializer(booking)
        return Response({
            "success": True,
            "message": f"Test ride booked successfully! Reference: {booking.booking_reference}",
            "data": read_serializer.data
        }, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Cancel an Active Booking",
        description="Allows the customer or an admin to cancel an eligible test ride booking.",
        request=BookingCancelSerializer,
        responses={200: OpenApiResponse(description="Booking cancelled successfully")}
    )
    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel(self, request, pk=None):
        booking = self.get_object()
        serializer = BookingCancelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data.get('cancellation_reason', '')
        cancelled_booking = BookingService.cancel_booking(booking, request.user, reason)

        return Response({
            "success": True,
            "message": f"Booking {cancelled_booking.booking_reference} has been cancelled.",
            "data": BookingDetailSerializer(cancelled_booking).data
        }, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update Booking Status (Admin Only)",
        description="Allows administrators to confirm or mark test rides as completed.",
        request=AdminBookingStatusUpdateSerializer,
        responses={200: OpenApiResponse(description="Booking status updated")}
    )
    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        booking = self.get_object()
        serializer = AdminBookingStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking.status = serializer.validated_data['status']
        if 'admin_notes' in serializer.validated_data:
            booking.admin_notes = serializer.validated_data['admin_notes']
        booking.save()

        return Response({
            "success": True,
            "message": f"Booking {booking.booking_reference} status changed to {booking.status}.",
            "data": BookingDetailSerializer(booking).data
        }, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Check Slot Availability for Vehicle & Date",
        description="Returns list of time slots for a vehicle on a specific date, marking available vs booked.",
        parameters=[
            OpenApiParameter(name='variant_id', type=int, required=True, description='Vehicle Variant ID'),
            OpenApiParameter(name='date', type=str, required=True, description='Date in YYYY-MM-DD format'),
        ],
        responses={200: OpenApiResponse(description="Slot availability retrieved")}
    )
    @action(detail=False, methods=['get'], url_path='available-slots')
    def available_slots(self, request):
        variant_id = request.query_params.get('variant_id')
        date_str = request.query_params.get('date')

        if not variant_id or not date_str:
            return Response({
                "success": False,
                "error": {
                    "code": "MISSING_PARAMETERS",
                    "message": "Both 'variant_id' and 'date' (YYYY-MM-DD) query parameters are required.",
                    "details": None
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            query_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                "success": False,
                "error": {
                    "code": "INVALID_DATE_FORMAT",
                    "message": "Date must be in 'YYYY-MM-DD' format.",
                    "details": None
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        availability = BookingService.get_slot_availability(int(variant_id), query_date)
        return Response({
            "success": True,
            "message": "Slot availability retrieved successfully.",
            "data": availability
        }, status=status.HTTP_200_OK)
