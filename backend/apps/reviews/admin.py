"""
Django Admin configuration for Customer Reviews and Feedback.
"""
from django.contrib import admin
from django.utils import timezone
from apps.reviews.models import VehicleReview


@admin.register(VehicleReview)
class VehicleReviewAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'customer',
        'variant',
        'rating',
        'title',
        'is_verified_rider',
        'moderation_status',
        'created_at'
    ]
    list_filter = ['moderation_status', 'is_verified_rider', 'rating', 'created_at']
    search_fields = [
        'title',
        'comment',
        'customer__email',
        'customer__first_name',
        'customer__last_name',
        'variant__name'
    ]
    readonly_fields = ['created_at', 'updated_at', 'moderated_at', 'moderated_by']
    actions = ['approve_reviews', 'reject_reviews']

    @admin.action(description="Approve selected reviews")
    def approve_reviews(self, request, queryset):
        updated = queryset.update(
            moderation_status=VehicleReview.ModerationStatus.APPROVED,
            moderated_by=request.user,
            moderated_at=timezone.now()
        )
        self.message_user(request, f"{updated} review(s) successfully marked as APPROVED.")

    @admin.action(description="Reject selected reviews")
    def reject_reviews(self, request, queryset):
        updated = queryset.update(
            moderation_status=VehicleReview.ModerationStatus.REJECTED,
            moderated_by=request.user,
            moderated_at=timezone.now()
        )
        self.message_user(request, f"{updated} review(s) marked as REJECTED.")
