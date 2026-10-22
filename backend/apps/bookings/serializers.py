from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from apps.vehicles.serializers import VehicleVariantListSerializer
from .models import TestRideBooking

class BookingCreateSerializer(serializers.ModelSerializer):
    variant_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = TestRideBooking
        fields = [
            'variant_id',
            'booking_date',
            'time_slot',
            'contact_phone',
            'driving_license_number',
        ]

    def validate_contact_phone(self, value):
        cleaned = value.strip().replace(' ', '').replace('-', '')
        if len(cleaned) < 10:
            raise serializers.ValidationError("Please provide a valid contact phone number.")
        return cleaned

    def validate_driving_license_number(self, value):
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("A valid driving license number is required for test rides.")
        return value.strip().upper()


class BookingDetailSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    variant_name = serializers.CharField(source='variant.name', read_only=True)
    model_name = serializers.CharField(source='variant.model.name', read_only=True)
    category_name = serializers.CharField(source='variant.model.category.name', read_only=True)
    variant_image = serializers.ImageField(source='variant.default_image', read_only=True)

    class Meta:
        model = TestRideBooking
        fields = [
            'id',
            'booking_reference',
            'customer_email',
            'customer_name',
            'variant',
            'variant_name',
            'model_name',
            'category_name',
            'variant_image',
            'booking_date',
            'time_slot',
            'contact_phone',
            'driving_license_number',
            'status',
            'cancellation_reason',
            'admin_notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    @extend_schema_field(serializers.CharField())
    def get_customer_name(self, obj):
        full_name = f"{obj.customer.first_name} {obj.customer.last_name}".strip()
        return full_name if full_name else obj.customer.username


class BookingCancelSerializer(serializers.Serializer):
    cancellation_reason = serializers.CharField(
        required=False,
        allow_blank=True,
        default='Cancelled by customer'
    )


class AdminBookingStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=TestRideBooking.Status.choices, required=True)
    admin_notes = serializers.CharField(required=False, allow_blank=True, default='')
