import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from apps.common.models import TimestampedModel
from apps.vehicles.models import VehicleVariant
from django.conf import settings

class TestRideBooking(TimestampedModel):
    """
    Test Ride Booking model capturing customer, vehicle variant, date, time slot,
    driving license, and status.
    Enforces double-booking prevention at the database constraint level.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending Confirmation')
        CONFIRMED = 'CONFIRMED', _('Confirmed')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    class TimeSlot(models.TextChoices):
        SLOT_10_11 = '10:00-11:00', _('10:00 AM - 11:00 AM')
        SLOT_11_12 = '11:00-12:00', _('11:00 AM - 12:00 PM')
        SLOT_12_13 = '12:00-13:00', _('12:00 PM - 01:00 PM')
        SLOT_14_15 = '14:00-15:00', _('02:00 PM - 03:00 PM')
        SLOT_15_16 = '15:00-16:00', _('03:00 PM - 04:00 PM')
        SLOT_16_17 = '16:00-17:00', _('04:00 PM - 05:00 PM')
        SLOT_17_18 = '17:00-18:00', _('05:00 PM - 06:00 PM')

    booking_reference = models.CharField(
        _('booking reference code'),
        max_length=32,
        unique=True,
        db_index=True,
        editable=False
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='test_ride_bookings',
        verbose_name=_('customer')
    )
    variant = models.ForeignKey(
        VehicleVariant,
        on_delete=models.RESTRICT,
        related_name='test_ride_bookings',
        verbose_name=_('vehicle variant')
    )
    booking_date = models.DateField(_('booking date'), db_index=True)
    time_slot = models.CharField(
        _('time slot'),
        max_length=20,
        choices=TimeSlot.choices,
        db_index=True
    )
    contact_phone = models.CharField(_('contact phone number'), max_length=15)
    driving_license_number = models.CharField(_('driving license number'), max_length=50)
    status = models.CharField(
        _('booking status'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    cancellation_reason = models.TextField(_('cancellation reason'), blank=True, default='')
    admin_notes = models.TextField(_('internal admin notes'), blank=True, default='')

    class Meta:
        verbose_name = _('Test Ride Booking')
        verbose_name_plural = _('Test Ride Bookings')
        ordering = ['-booking_date', '-created_at']
        constraints = [
            # Concurrency & double-booking prevention constraint:
            # Prevents two active (PENDING or CONFIRMED) bookings for the exact same vehicle variant on the same date and slot!
            models.UniqueConstraint(
                fields=['variant', 'booking_date', 'time_slot'],
                condition=models.Q(status__in=['PENDING', 'CONFIRMED']),
                name='unique_active_slot_per_vehicle_variant'
            )
        ]

    def clean(self):
        super().clean()
        if self.booking_date:
            if isinstance(self.booking_date, str):
                import datetime
                self.booking_date = datetime.date.fromisoformat(self.booking_date)
            if self.status in [self.Status.PENDING, self.Status.CONFIRMED] and self.booking_date < timezone.now().date():
                raise ValidationError({
                    'booking_date': _("Booking date cannot be in the past.")
                })

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            # Format: BK-YYYYMMDD-<8 hex chars>
            date_prefix = timezone.now().strftime('%Y%m%d')
            unique_hex = uuid.uuid4().hex[:8].upper()
            self.booking_reference = f"BK-{date_prefix}-{unique_hex}"
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.booking_reference} - {self.variant.name} ({self.booking_date} {self.time_slot})"
