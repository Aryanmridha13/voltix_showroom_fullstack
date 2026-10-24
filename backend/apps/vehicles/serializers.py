from rest_framework import serializers
from django.db import transaction
from .models import (
    VehicleCategory,
    VehicleModel,
    VehicleVariant,
    VehicleSpecification,
    VehicleImage,
)

class VehicleCategorySerializer(serializers.ModelSerializer):
    models_count = serializers.IntegerField(source='models.count', read_only=True)

    class Meta:
        model = VehicleCategory
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'icon',
            'is_active',
            'models_count',
            'created_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at']


class VehicleModelSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = VehicleModel
        fields = [
            'id',
            'category',
            'category_name',
            'category_slug',
            'name',
            'slug',
            'fuel_type',
            'tagline',
            'description',
            'is_featured',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at']


class VehicleSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleSpecification
        fields = [
            'id',
            'battery_type',
            'battery_capacity',
            'driving_range_km',
            'top_speed_kmh',
            'charging_time_hours',
            'motor_power_watt',
            'engine_displacement_cc',
            'max_power_bhp',
            'max_torque_nm',
            'transmission',
            'fuel_tank_capacity_l',
            'mileage_kmpl',
            'warranty_years',
            'brakes_type',
            'tyres_type',
            'carrying_capacity_kg',
        ]
        read_only_fields = ['id']


class VehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = [
            'id',
            'image',
            'caption',
            'display_order',
        ]
        read_only_fields = ['id']


class VehicleVariantListSerializer(serializers.ModelSerializer):
    """
    Optimized serializer for catalogue card grids.
    Mirrors the exact card fields seen in real showrooms:
    Name, Price, Discount/Strikethrough, Fuel Type, Battery / Engine, Range / Mileage, Top Speed.
    """
    model_name = serializers.CharField(source='model.name', read_only=True)
    category_name = serializers.CharField(source='model.category.name', read_only=True)
    category_slug = serializers.CharField(source='model.category.slug', read_only=True)
    fuel_type = serializers.CharField(source='model.fuel_type', read_only=True)
    battery_type = serializers.CharField(source='specification.battery_type', read_only=True)
    engine_displacement_cc = serializers.IntegerField(source='specification.engine_displacement_cc', read_only=True)
    mileage_kmpl = serializers.DecimalField(source='specification.mileage_kmpl', max_digits=5, decimal_places=1, read_only=True)
    max_power_bhp = serializers.CharField(source='specification.max_power_bhp', read_only=True)
    driving_range_km = serializers.IntegerField(source='specification.driving_range_km', read_only=True)
    top_speed_kmh = serializers.IntegerField(source='specification.top_speed_kmh', read_only=True)

    class Meta:
        model = VehicleVariant
        fields = [
            'id',
            'model',
            'model_name',
            'category_name',
            'category_slug',
            'fuel_type',
            'name',
            'slug',
            'sku',
            'base_price',
            'original_price',
            'default_image',
            'battery_type',
            'engine_displacement_cc',
            'mileage_kmpl',
            'max_power_bhp',
            'driving_range_km',
            'top_speed_kmh',
            'is_active',
        ]
        read_only_fields = ['id', 'slug']


class VehicleVariantDetailSerializer(serializers.ModelSerializer):
    """
    Complete detail representation for single vehicle page.
    Includes specs and gallery images.
    """
    model_details = VehicleModelSerializer(source='model', read_only=True)
    specification = VehicleSpecificationSerializer(read_only=True)
    gallery_images = VehicleImageSerializer(many=True, read_only=True)

    class Meta:
        model = VehicleVariant
        fields = [
            'id',
            'model',
            'model_details',
            'name',
            'slug',
            'sku',
            'base_price',
            'original_price',
            'default_image',
            'is_active',
            'specification',
            'gallery_images',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class VehicleVariantCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Admin serializer that atomically provisions or updates a VehicleVariant
    and its nested VehicleSpecification in a single database transaction.
    """
    specification = VehicleSpecificationSerializer()

    class Meta:
        model = VehicleVariant
        fields = [
            'id',
            'model',
            'name',
            'sku',
            'base_price',
            'original_price',
            'default_image',
            'is_active',
            'specification',
        ]
        read_only_fields = ['id']

    @transaction.atomic
    def create(self, validated_data):
        specs_data = validated_data.pop('specification')
        variant = VehicleVariant.objects.create(**validated_data)
        VehicleSpecification.objects.create(variant=variant, **specs_data)
        return variant

    @transaction.atomic
    def update(self, instance, validated_data):
        specs_data = validated_data.pop('specification', None)

        # Update Variant fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Specification fields
        if specs_data and hasattr(instance, 'specification'):
            spec = instance.specification
            for attr, value in specs_data.items():
                setattr(spec, attr, value)
            spec.save()

        return instance
