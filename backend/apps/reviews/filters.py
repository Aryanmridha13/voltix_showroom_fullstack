"""
FilterSet for Vehicle Reviews.
"""
import django_filters
from apps.reviews.models import VehicleReview


class VehicleReviewFilter(django_filters.FilterSet):
    variant = django_filters.NumberFilter(field_name='variant_id')
    model = django_filters.NumberFilter(field_name='variant__model_id')
    rating = django_filters.NumberFilter(field_name='rating')
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    is_verified_rider = django_filters.BooleanFilter(field_name='is_verified_rider')
    moderation_status = django_filters.ChoiceFilter(
        choices=VehicleReview.ModerationStatus.choices,
        field_name='moderation_status'
    )

    class Meta:
        model = VehicleReview
        fields = ['variant', 'model', 'rating', 'min_rating', 'is_verified_rider', 'moderation_status']
