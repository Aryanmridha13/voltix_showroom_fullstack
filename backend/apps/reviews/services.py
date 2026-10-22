"""
Service layer for Vehicle Reviews.
Encapsulates review creation, verified rider checks, moderation, and aggregation logic.
"""
from django.db import transaction
from django.db.models import Avg, Count, Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied
from apps.reviews.models import VehicleReview
from apps.bookings.models import TestRideBooking


class ReviewService:
    @staticmethod
    def check_is_verified_rider(customer, variant) -> bool:
        """
        Check whether the customer has completed a test ride booking
        for the given vehicle variant or model.
        """
        if not customer or not customer.is_authenticated:
            return False

        return TestRideBooking.objects.filter(
            customer=customer,
            variant=variant,
            status=TestRideBooking.Status.COMPLETED
        ).exists()

    @classmethod
    @transaction.atomic
    def create_review(cls, customer, variant, rating, title, comment) -> VehicleReview:
        """
        Create a new vehicle review for a customer with verification logic.
        """
        if VehicleReview.objects.filter(customer=customer, variant=variant).exists():
            raise ValidationError({
                "variant": "You have already submitted a review for this vehicle variant."
            })

        is_verified = cls.check_is_verified_rider(customer, variant)

        review = VehicleReview.objects.create(
            customer=customer,
            variant=variant,
            rating=rating,
            title=title.strip(),
            comment=comment.strip(),
            is_verified_rider=is_verified,
            moderation_status=VehicleReview.ModerationStatus.APPROVED
        )
        return review

    @classmethod
    @transaction.atomic
    def moderate_review(cls, review: VehicleReview, moderator, new_status: str, notes: str = '') -> VehicleReview:
        """
        Update the moderation status of a review (Admin action).
        """
        valid_statuses = [
            VehicleReview.ModerationStatus.APPROVED,
            VehicleReview.ModerationStatus.REJECTED,
            VehicleReview.ModerationStatus.PENDING,
        ]
        if new_status not in valid_statuses:
            raise ValidationError({
                "status": f"Invalid status '{new_status}'. Choices: {', '.join(valid_statuses)}."
            })

        review.moderation_status = new_status
        review.moderated_by = moderator
        review.moderation_notes = notes
        review.moderated_at = timezone.now()
        review.save(update_fields=['moderation_status', 'moderated_by', 'moderation_notes', 'moderated_at', 'updated_at'])
        return review

    @staticmethod
    def get_variant_rating_stats(variant_id: int) -> dict:
        """
        Compute rating statistics, average, and star distributions for a variant.
        Only counts APPROVED reviews.
        """
        qs = VehicleReview.objects.filter(
            variant_id=variant_id,
            moderation_status=VehicleReview.ModerationStatus.APPROVED
        )

        total_reviews = qs.count()
        if total_reviews == 0:
            return {
                "variant_id": variant_id,
                "total_reviews": 0,
                "average_rating": 0.0,
                "verified_riders_count": 0,
                "rating_distribution": {
                    "5_star": 0,
                    "4_star": 0,
                    "3_star": 0,
                    "2_star": 0,
                    "1_star": 0,
                },
                "percentage_distribution": {
                    "5_star": 0.0,
                    "4_star": 0.0,
                    "3_star": 0.0,
                    "2_star": 0.0,
                    "1_star": 0.0,
                }
            }

        avg_rating = qs.aggregate(avg=Avg('rating'))['avg'] or 0.0
        verified_count = qs.filter(is_verified_rider=True).count()

        counts = qs.aggregate(
            star_5=Count('id', filter=Q(rating=5)),
            star_4=Count('id', filter=Q(rating=4)),
            star_3=Count('id', filter=Q(rating=3)),
            star_2=Count('id', filter=Q(rating=2)),
            star_1=Count('id', filter=Q(rating=1)),
        )

        star_counts = {
            "5_star": counts['star_5'],
            "4_star": counts['star_4'],
            "3_star": counts['star_3'],
            "2_star": counts['star_2'],
            "1_star": counts['star_1'],
        }

        percentages = {
            k: round((v / total_reviews) * 100, 1) for k, v in star_counts.items()
        }

        return {
            "variant_id": variant_id,
            "total_reviews": total_reviews,
            "average_rating": round(float(avg_rating), 1),
            "verified_riders_count": verified_count,
            "rating_distribution": star_counts,
            "percentage_distribution": percentages
        }
