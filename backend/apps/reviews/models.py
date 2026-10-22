"""
Vehicle Reviews and Customer Feedback Models.
Supports star ratings (1-5), verified test-rider badges, and admin moderation.
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.common.models import TimestampedModel


class VehicleReview(TimestampedModel):
    """
    Customer review and rating for a specific vehicle variant.
    """
    class ModerationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Moderation'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vehicle_reviews',
        help_text="Customer who authored this review."
    )
    variant = models.ForeignKey(
        'vehicles.VehicleVariant',
        on_delete=models.CASCADE,
        related_name='reviews',
        help_text="Vehicle variant being reviewed."
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Star rating from 1 to 5."
    )
    title = models.CharField(
        max_length=150,
        help_text="Summary headline for the review."
    )
    comment = models.TextField(
        help_text="Detailed feedback, riding experience, pros and cons."
    )
    is_verified_rider = models.BooleanField(
        default=False,
        help_text="True if the reviewer has a completed test ride booking for this vehicle/variant."
    )
    moderation_status = models.CharField(
        max_length=20,
        choices=ModerationStatus.choices,
        default=ModerationStatus.APPROVED,
        db_index=True,
        help_text="Content moderation status."
    )
    moderated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_reviews',
        help_text="Administrator who reviewed/moderated this entry."
    )
    moderation_notes = models.TextField(
        blank=True,
        default='',
        help_text="Internal notes regarding approval/rejection reason."
    )
    moderated_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when review was moderated."
    )

    class Meta:
        db_table = 'vehicle_reviews'
        verbose_name = 'Vehicle Review'
        verbose_name_plural = 'Vehicle Reviews'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['customer', 'variant'],
                name='unique_customer_variant_review'
            )
        ]
        indexes = [
            models.Index(fields=['variant', 'moderation_status'], name='idx_rev_variant_status'),
            models.Index(fields=['customer', 'created_at'], name='idx_rev_customer_created'),
            models.Index(fields=['rating'], name='idx_rev_rating'),
        ]

    def __str__(self):
        customer_label = self.customer.get_full_name() or self.customer.email
        return f"{customer_label} - {self.variant.name} ({self.rating}★)"
