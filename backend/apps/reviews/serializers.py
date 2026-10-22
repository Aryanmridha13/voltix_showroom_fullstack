"""
Serializers for Vehicle Reviews and Customer Feedback.
"""
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from django.contrib.auth import get_user_model
from apps.reviews.models import VehicleReview
from apps.reviews.services import ReviewService
from apps.vehicles.models import VehicleVariant

User = get_user_model()


class ReviewCustomerSummarySerializer(serializers.ModelSerializer):
    """
    Sanitized customer profile summary for public review displays.
    """
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'role']

    @extend_schema_field(serializers.CharField())
    def get_name(self, obj):
        full_name = obj.get_full_name()
        if full_name:
            return full_name
        # Mask email: e.g. a***b@example.com
        parts = obj.email.split('@')
        if len(parts) == 2 and len(parts[0]) > 2:
            return f"{parts[0][0]}***{parts[0][-1]}@{parts[1]}"
        return "Voltix Rider"


class ReviewVariantSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight vehicle variant summary for review display.
    """
    model_name = serializers.CharField(source='model.name', read_only=True)
    category_name = serializers.CharField(source='model.category.name', read_only=True)

    class Meta:
        model = VehicleVariant
        fields = ['id', 'name', 'sku', 'model_name', 'category_name']


class VehicleReviewSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for listing and detailing vehicle reviews.
    """
    customer = ReviewCustomerSummarySerializer(read_only=True)
    variant = ReviewVariantSummarySerializer(read_only=True)

    class Meta:
        model = VehicleReview
        fields = [
            'id',
            'customer',
            'variant',
            'rating',
            'title',
            'comment',
            'is_verified_rider',
            'moderation_status',
            'moderation_notes',
            'moderated_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'customer',
            'variant',
            'is_verified_rider',
            'moderation_status',
            'moderation_notes',
            'moderated_at',
            'created_at',
            'updated_at',
        ]


class ReviewCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for authenticated customer review submission.
    """
    variant_id = serializers.PrimaryKeyRelatedField(
        queryset=VehicleVariant.objects.filter(is_active=True),
        source='variant',
        write_only=True
    )

    class Meta:
        model = VehicleReview
        fields = ['variant_id', 'rating', 'title', 'comment']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be an integer between 1 and 5 stars.")
        return value

    def validate_title(self, value):
        cleaned = value.strip()
        if len(cleaned) < 3:
            raise serializers.ValidationError("Review title must be at least 3 characters.")
        return cleaned

    def validate_comment(self, value):
        cleaned = value.strip()
        if len(cleaned) < 10:
            raise serializers.ValidationError("Review comment must be at least 10 characters long.")
        return cleaned

    def validate(self, attrs):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required to submit reviews.")

        variant = attrs['variant']
        if VehicleReview.objects.filter(customer=request.user, variant=variant).exists():
            raise serializers.ValidationError({
                "variant_id": "You have already submitted a review for this vehicle variant."
            })

        return attrs

    def create(self, validated_data):
        customer = self.context['request'].user
        variant = validated_data['variant']
        rating = validated_data['rating']
        title = validated_data['title']
        comment = validated_data['comment']

        return ReviewService.create_review(
            customer=customer,
            variant=variant,
            rating=rating,
            title=title,
            comment=comment
        )


class ReviewUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer allowing author to edit their existing review.
    """
    class Meta:
        model = VehicleReview
        fields = ['rating', 'title', 'comment']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be an integer between 1 and 5 stars.")
        return value

    def validate_title(self, value):
        cleaned = value.strip()
        if len(cleaned) < 3:
            raise serializers.ValidationError("Review title must be at least 3 characters.")
        return cleaned

    def validate_comment(self, value):
        cleaned = value.strip()
        if len(cleaned) < 10:
            raise serializers.ValidationError("Review comment must be at least 10 characters long.")
        return cleaned


class ReviewModerationSerializer(serializers.Serializer):
    """
    Serializer for admin review moderation (approval/rejection).
    """
    status = serializers.ChoiceField(
        choices=VehicleReview.ModerationStatus.choices,
        help_text="Target moderation status (APPROVED, REJECTED, PENDING)."
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        default='',
        help_text="Optional internal explanation or moderator comment."
    )
