from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from apps.vehicles.models import VehicleVariant
from .models import VehicleColourConfig, ColourCombination

class CustomizerService:
    """
    Business logic layer for Vehicle Customization and Dynamic Pricing.
    Enforces server-side price validation to ensure client calculations match the database.
    """

    @staticmethod
    def get_available_options_for_variant(variant_id):
        """
        Retrieves all active colour configurations available for a given vehicle variant.
        """
        variant = get_object_or_404(
            VehicleVariant.objects.select_related('model', 'specification'),
            id=variant_id,
            is_active=True
        )

        configs = VehicleColourConfig.objects.filter(
            variant=variant,
            is_available=True,
            combination__is_active=True
        ).select_related(
            'combination__primary_colour',
            'combination__secondary_colour'
        ).order_by('combination__is_dual_tone', 'price_adjustment')

        return variant, configs

    @staticmethod
    def calculate_configuration_price(variant_id, combination_id):
        """
        Calculates the authoritative final price for a chosen vehicle variant
        and colour combination.
        """
        variant = get_object_or_404(
            VehicleVariant.objects.select_related('model', 'specification'),
            id=variant_id,
            is_active=True
        )

        config = VehicleColourConfig.objects.filter(
            variant=variant,
            combination_id=combination_id
        ).select_related(
            'combination',
            'combination__primary_colour',
            'combination__secondary_colour'
        ).first()

        if not config:
            raise ValidationError({
                "combination_id": (
                    f"Selected colour combination is not compatible or available for {variant.model.name} {variant.name}."
                )
            })

        if not config.is_available:
            raise ValidationError({
                "combination_id": (
                    f"The colour finish '{config.combination.name}' is temporarily unavailable for this vehicle model."
                )
            })

        total_price = variant.base_price + config.price_adjustment

        image_url = None
        if config.image:
            image_url = config.image.url
        elif variant.default_image:
            image_url = variant.default_image.url

        return {
            "variant_id": variant.id,
            "variant_name": variant.name,
            "model_name": variant.model.name,
            "sku": variant.sku,
            "combination_id": config.combination.id,
            "combination_name": config.combination.name,
            "is_dual_tone": config.combination.is_dual_tone,
            "primary_colour": {
                "name": config.combination.primary_colour.name,
                "hex_code": config.combination.primary_colour.hex_code,
            },
            "secondary_colour": {
                "name": config.combination.secondary_colour.name,
                "hex_code": config.combination.secondary_colour.hex_code,
            } if config.combination.secondary_colour else None,
            "base_price": str(variant.base_price),
            "price_adjustment": str(config.price_adjustment),
            "total_price": str(total_price),
            "image_url": image_url,
            "is_available": config.is_available
        }
