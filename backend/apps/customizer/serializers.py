from rest_framework import serializers
from .models import Colour, ColourCombination, VehicleColourConfig

class ColourSerializer(serializers.ModelSerializer):
    class Meta:
        model = Colour
        fields = [
            'id',
            'name',
            'hex_code',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ColourCombinationSerializer(serializers.ModelSerializer):
    primary_colour_details = ColourSerializer(source='primary_colour', read_only=True)
    secondary_colour_details = ColourSerializer(source='secondary_colour', read_only=True)

    class Meta:
        model = ColourCombination
        fields = [
            'id',
            'name',
            'is_dual_tone',
            'primary_colour',
            'primary_colour_details',
            'secondary_colour',
            'secondary_colour_details',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class VehicleColourOptionSerializer(serializers.ModelSerializer):
    """
    Serializer specifically formatted for the React Vehicle Customizer component.
    Provides color chips, dual-tone badges, image renders, and dynamic price adjustments.
    """
    combination_id = serializers.IntegerField(source='combination.id', read_only=True)
    combination_name = serializers.CharField(source='combination.name', read_only=True)
    is_dual_tone = serializers.BooleanField(source='combination.is_dual_tone', read_only=True)
    primary_colour = ColourSerializer(source='combination.primary_colour', read_only=True)
    secondary_colour = ColourSerializer(source='combination.secondary_colour', read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = VehicleColourConfig
        fields = [
            'id',
            'combination_id',
            'combination_name',
            'is_dual_tone',
            'primary_colour',
            'secondary_colour',
            'image',
            'price_adjustment',
            'total_price',
            'is_available',
        ]
        read_only_fields = ['id', 'total_price']


class PriceCalculationRequestSerializer(serializers.Serializer):
    """
    Validates client request parameters when calculating dynamic configuration price.
    """
    variant_id = serializers.IntegerField(required=True)
    combination_id = serializers.IntegerField(required=True)


class VehicleColourConfigAdminSerializer(serializers.ModelSerializer):
    """
    Admin serializer for configuring vehicle colours, images, and price adjustments.
    """
    combination_details = ColourCombinationSerializer(source='combination', read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = VehicleColourConfig
        fields = [
            'id',
            'variant',
            'combination',
            'combination_details',
            'image',
            'price_adjustment',
            'total_price',
            'is_available',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'total_price', 'created_at', 'updated_at']
