from datetime import date
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError, PermissionDenied
from apps.vehicles.models import VehicleVariant
from .models import TestRideBooking

class BookingService:
    """
    Core Domain Service managing test ride bookings, conflict prevention,
    and cancellation business logic.
    """

    @staticmethod
    @transaction.atomic
    def create_booking(customer, variant_id, booking_date, time_slot, contact_phone, driving_license_number):
        """
        Creates a test ride booking with strict race condition & double-booking prevention.
        Uses select_for_update inside an atomic transaction.
        """
        # 1. Validate vehicle variant
        variant = get_object_or_404(
            VehicleVariant.objects.select_related('model'),
            id=variant_id,
            is_active=True
        )

        # 2. Validate date
        today = timezone.now().date()
        if booking_date < today:
            raise ValidationError({
                "booking_date": "Test ride cannot be booked for a past date."
            })

        # 3. Validate time slot
        valid_slots = [choice[0] for choice in TestRideBooking.TimeSlot.choices]
        if time_slot not in valid_slots:
            raise ValidationError({
                "time_slot": f"Invalid time slot. Choose from: {', '.join(valid_slots)}"
            })

        # 4. Check for conflicting active booking (Race condition prevention via select_for_update)
        conflicting_booking = TestRideBooking.objects.select_for_update().filter(
            variant=variant,
            booking_date=booking_date,
            time_slot=time_slot,
            status__in=[TestRideBooking.Status.PENDING, TestRideBooking.Status.CONFIRMED]
        ).first()

        if conflicting_booking:
            raise ValidationError({
                "time_slot": (
                    f"The vehicle '{variant.model.name} {variant.name}' is already booked "
                    f"for {booking_date} during {time_slot}. Please choose an alternative slot."
                )
            })

        # 5. Create new booking
        booking = TestRideBooking.objects.create(
            customer=customer,
            variant=variant,
            booking_date=booking_date,
            time_slot=time_slot,
            contact_phone=contact_phone,
            driving_license_number=driving_license_number,
            status=TestRideBooking.Status.PENDING
        )

        return booking

    @staticmethod
    def cancel_booking(booking, user, cancellation_reason=''):
        """
        Validates cancellation eligibility and cancels an active booking.
        """
        # Ownership check
        if not (user.is_admin or booking.customer == user):
            raise PermissionDenied("You do not have permission to cancel this booking.")

        # Status eligibility check
        if booking.status in [TestRideBooking.Status.COMPLETED, TestRideBooking.Status.CANCELLED]:
            raise ValidationError({
                "status": f"Cannot cancel a booking that is already {booking.status.lower()}."
            })

        booking.status = TestRideBooking.Status.CANCELLED
        booking.cancellation_reason = cancellation_reason or "Cancelled by user"
        booking.save()
        return booking

    @staticmethod
    def get_slot_availability(variant_id, query_date):
        """
        Returns all showroom slots for a specific vehicle and date,
        marking each as available or booked.
        """
        variant = get_object_or_404(VehicleVariant, id=variant_id, is_active=True)

        # Active booked slots for this date
        booked_slots = set(
            TestRideBooking.objects.filter(
                variant=variant,
                booking_date=query_date,
                status__in=[TestRideBooking.Status.PENDING, TestRideBooking.Status.CONFIRMED]
            ).values_list('time_slot', flat=True)
        )

        all_slots = []
        for slot_val, slot_label in TestRideBooking.TimeSlot.choices:
            all_slots.append({
                "slot": slot_val,
                "label": slot_label,
                "is_available": slot_val not in booked_slots
            })

        return {
            "variant_id": variant.id,
            "variant_name": f"{variant.model.name} {variant.name}",
            "date": str(query_date),
            "slots": all_slots
        }
