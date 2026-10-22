from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.vehicles.models import VehicleVariant
from apps.customizer.models import Colour, ColourCombination, VehicleColourConfig

class Command(BaseCommand):
    help = 'Seeds vehicle colours, monotone and dual-tone combinations, and price adjustments'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Starting EV Colour Customizer seeding...'))

        # 1. Base Colours
        colours_data = [
            {'name': 'Crimson Red', 'hex_code': '#E62E2D'},
            {'name': 'Pearl White', 'hex_code': '#F8F9FA'},
            {'name': 'Jet Black', 'hex_code': '#1A1A1A'},
            {'name': 'Electric Blue', 'hex_code': '#1E88E5'},
            {'name': 'Metallic Grey', 'hex_code': '#757575'},
            {'name': 'Olive Green', 'hex_code': '#4B5320'},
        ]

        colours_map = {}
        for c in colours_data:
            obj, _ = Colour.objects.get_or_create(
                name=c['name'],
                defaults={'hex_code': c['hex_code'], 'is_active': True}
            )
            colours_map[c['name']] = obj

        # 2. Combinations (Single-tone and Dual-tone)
        combinations_data = [
            # Single-tone (Monotone)
            {
                'name': 'Crimson Red Monotone',
                'is_dual_tone': False,
                'primary': colours_map['Crimson Red'],
                'secondary': None,
            },
            {
                'name': 'Pearl White Monotone',
                'is_dual_tone': False,
                'primary': colours_map['Pearl White'],
                'secondary': None,
            },
            {
                'name': 'Jet Black Monotone',
                'is_dual_tone': False,
                'primary': colours_map['Jet Black'],
                'secondary': None,
            },
            {
                'name': 'Electric Blue Monotone',
                'is_dual_tone': False,
                'primary': colours_map['Electric Blue'],
                'secondary': None,
            },
            # Dual-tone Finishes (Premium adjustments)
            {
                'name': 'Pearl White & Electric Blue Dual-Tone',
                'is_dual_tone': True,
                'primary': colours_map['Pearl White'],
                'secondary': colours_map['Electric Blue'],
            },
            {
                'name': 'Crimson Red & Jet Black Dual-Tone',
                'is_dual_tone': True,
                'primary': colours_map['Crimson Red'],
                'secondary': colours_map['Jet Black'],
            },
            {
                'name': 'Jet Black & Metallic Grey Dual-Tone',
                'is_dual_tone': True,
                'primary': colours_map['Jet Black'],
                'secondary': colours_map['Metallic Grey'],
            },
        ]

        comb_objects = []
        for comb in combinations_data:
            obj, _ = ColourCombination.objects.get_or_create(
                primary_colour=comb['primary'],
                secondary_colour=comb['secondary'],
                defaults={
                    'name': comb['name'],
                    'is_dual_tone': comb['is_dual_tone'],
                    'is_active': True
                }
            )
            comb_objects.append(obj)

        # 3. Associate with Seeded Vehicles
        variants = VehicleVariant.objects.filter(is_active=True)
        configs_count = 0

        for variant in variants:
            for comb in comb_objects:
                # Standard monotone finishes have no price adjustment (+₹0)
                # Dual-tone finishes have a premium adjustment (+₹1,500 or +₹2,000)
                price_adj = Decimal('0.00')
                if comb.is_dual_tone:
                    price_adj = Decimal('2000.00') if 'Grey' in comb.name else Decimal('1500.00')

                _, created = VehicleColourConfig.objects.get_or_create(
                    variant=variant,
                    combination=comb,
                    defaults={
                        'price_adjustment': price_adj,
                        'is_available': True
                    }
                )
                if created:
                    configs_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded {Colour.objects.count()} colours, {len(comb_objects)} combinations, and {configs_count} vehicle colour configurations!"
        ))
