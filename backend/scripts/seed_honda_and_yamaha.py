import os
import sys
import django
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.vehicles.models import (
    VehicleCategory,
    VehicleModel,
    VehicleVariant,
    VehicleSpecification,
    VehicleImage,
)
from apps.customizer.models import (
    Colour,
    ColourCombination,
    VehicleColourConfig,
)

def seed_honda_and_yamaha():
    print("Seeding Honda CB300R and Yamaha MT-15 V2...")

    # 1. Fetch Categories
    cat_classic = VehicleCategory.objects.get(name='Modern Classic & Cafe Racer')
    cat_superbike = VehicleCategory.objects.get(name='Superbike & Supersport')

    # 2. Honda CB300R Neo Sports Cafe
    honda_model, _ = VehicleModel.objects.update_or_create(
        name='Honda CB300R',
        category=cat_classic,
        defaults={
            'fuel_type': 'petrol',
            'tagline': 'Neo Sports Cafe - Pure Lightweight Thrill',
            'description': (
                'The Honda CB300R is a quintessential Neo Sports Cafe roadster, blending minimalist retro '
                'aesthetics with razor-sharp modern street dynamics. Powered by a responsive 286cc DOHC '
                '4-valve liquid-cooled engine with an assist & slipper clutch, inverted Showa SFF-BP front forks, '
                'and an IMU-linked dual-channel ABS, it is built for agility and pure riding exhilaration.'
            ),
            'is_featured': True,
            'is_active': True,
        }
    )

    honda_variant, _ = VehicleVariant.objects.update_or_create(
        sku='VOLT-HONDA-CB300R-RED',
        defaults={
            'model': honda_model,
            'name': 'CB300R Neo Sports Cafe',
            'base_price': Decimal('240000.00'),
            'original_price': Decimal('277000.00'),
            'default_image': 'vehicles/variants/honda_cb300r_red.png',
            'is_active': True,
        }
    )

    VehicleSpecification.objects.update_or_create(
        variant=honda_variant,
        defaults={
            'engine_displacement_cc': 286,
            'max_power_bhp': '30.7 bhp @ 9,000 rpm',
            'max_torque_nm': '27.5 Nm @ 7,500 rpm',
            'transmission': '6-Speed Manual with Assist & Slipper Clutch',
            'fuel_tank_capacity_l': Decimal('9.7'),
            'mileage_kmpl': Decimal('32.0'),
            'driving_range_km': 310,
            'top_speed_kmh': 150,
            'brakes_type': '296mm Hubless Floating Front Disc with Radial Caliper, 220mm Rear Disc with IMU Dual-Channel ABS',
            'tyres_type': 'MRF Revz Tubeless Radial (110/70R-17 Front, 150/60R-17 Rear)',
            'carrying_capacity_kg': 170,
            'warranty_years': 3,
        }
    )

    VehicleImage.objects.update_or_create(
        variant=honda_variant,
        caption='Front Profile Studio Angle - Candy Chromosphere Red',
        defaults={
            'image': 'vehicles/honda_cb300r_red.png',
            'display_order': 1,
        }
    )

    # 3. Yamaha MT-15 V2 Cyan Storm
    yamaha_model, _ = VehicleModel.objects.update_or_create(
        name='Yamaha MT-15 V2',
        category=cat_superbike,
        defaults={
            'fuel_type': 'petrol',
            'tagline': 'The Dark Side of Japan - Street Naked Predator',
            'description': (
                'The Yamaha MT-15 V2 is a hyper-naked streetfighter born from the legendary MT family. '
                'Powered by the high-revving 155cc liquid-cooled 4-valve engine with Variable Valve Actuation (VVA) '
                'and Traction Control System (TCS), it features golden USD front forks, an aluminum swingarm, '
                'and aggressive predator bi-functional LED eyes with striking Cyan Storm alloy wheels.'
            ),
            'is_featured': True,
            'is_active': True,
        }
    )

    yamaha_variant, _ = VehicleVariant.objects.update_or_create(
        sku='VOLT-YAMAHA-MT15-CYAN',
        defaults={
            'model': yamaha_model,
            'name': 'MT-15 V2 Cyan Storm',
            'base_price': Decimal('168000.00'),
            'original_price': Decimal('175000.00'),
            'default_image': 'vehicles/variants/yamaha_mt15_cyan.png',
            'is_active': True,
        }
    )

    VehicleSpecification.objects.update_or_create(
        variant=yamaha_variant,
        defaults={
            'engine_displacement_cc': 155,
            'max_power_bhp': '18.4 bhp @ 10,000 rpm',
            'max_torque_nm': '14.1 Nm @ 7,500 rpm',
            'transmission': '6-Speed Manual with Assist & Slipper Clutch & Quickshifter',
            'fuel_tank_capacity_l': Decimal('10.0'),
            'mileage_kmpl': Decimal('48.0'),
            'driving_range_km': 480,
            'top_speed_kmh': 130,
            'brakes_type': '282mm Front Disc with ByBre 2-Piston Caliper, 220mm Rear Disc with Dual-Channel ABS & Traction Control',
            'tyres_type': 'Tubeless Radial (100/80-17 Front, 140/70R-17 Rear)',
            'carrying_capacity_kg': 160,
            'warranty_years': 2,
        }
    )

    VehicleImage.objects.update_or_create(
        variant=yamaha_variant,
        caption='Studio Street Naked Angle - Cyan Storm',
        defaults={
            'image': 'vehicles/yamaha_mt15_cyan.png',
            'display_order': 1,
        }
    )

    # 4. Customizer: ONLY default color for each bike
    honda_color, _ = Colour.objects.get_or_create(
        name='Candy Chromosphere Red',
        defaults={'hex_code': '#D0202A', 'is_active': True}
    )
    honda_combo, _ = ColourCombination.objects.get_or_create(
        name='Candy Chromosphere Red Monotone',
        defaults={
            'primary_colour': honda_color,
            'secondary_colour': None,
            'is_dual_tone': False,
            'is_active': True,
        }
    )
    # Ensure any non-default configs for honda variant are deleted
    VehicleColourConfig.objects.filter(variant=honda_variant).exclude(combination=honda_combo).delete()
    VehicleColourConfig.objects.update_or_create(
        variant=honda_variant,
        combination=honda_combo,
        defaults={
            'image': 'vehicles/customizer/honda_cb300r_red.png',
            'price_adjustment': Decimal('0.00'),
            'is_available': True,
        }
    )

    yamaha_color, _ = Colour.objects.get_or_create(
        name='Cyan Storm',
        defaults={'hex_code': '#00E5FF', 'is_active': True}
    )
    yamaha_combo, _ = ColourCombination.objects.get_or_create(
        name='Cyan Storm Edition',
        defaults={
            'primary_colour': yamaha_color,
            'secondary_colour': None,
            'is_dual_tone': False,
            'is_active': True,
        }
    )
    # Ensure any non-default configs for yamaha variant are deleted
    VehicleColourConfig.objects.filter(variant=yamaha_variant).exclude(combination=yamaha_combo).delete()
    VehicleColourConfig.objects.update_or_create(
        variant=yamaha_variant,
        combination=yamaha_combo,
        defaults={
            'image': 'vehicles/customizer/yamaha_mt15_cyan.png',
            'price_adjustment': Decimal('0.00'),
            'is_available': True,
        }
    )

    print("Successfully seeded Honda CB300R (ID: %d) and Yamaha MT-15 V2 (ID: %d)!" % (honda_variant.id, yamaha_variant.id))
    print("Honda default color:", honda_combo.name)
    print("Yamaha default color:", yamaha_combo.name)

if __name__ == '__main__':
    seed_honda_and_yamaha()
