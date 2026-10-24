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

def seed_petrol_scooters():
    print("Seeding Petrol Scooters: Suzuki Access 125, Vespa VXL 125, Honda Activa 125...")

    # 1. Category
    cat_scooter, _ = VehicleCategory.objects.get_or_create(
        name='Executive & Retro Scooters',
        defaults={
            'slug': 'executive-retro-scooters',
            'description': 'Top-selling, reliable, and iconic petrol scooters engineered for smooth city commuting and timeless style.',
            'is_active': True,
        }
    )

    scooters_data = [
        # 1. Suzuki Access 125
        {
            'model_name': 'Suzuki Access 125',
            'tagline': 'Kam Piyo, Zyada Jiyo - The King of 125cc Scooters',
            'description': (
                "The Suzuki Access 125 is India's most popular premium family scooter, driven by the ultra-refined "
                "124cc SEP (Suzuki Eco Performance) air-cooled, single-cylinder engine. Featuring retro chrome bezels, "
                "an external fuel lid, Bluetooth-enabled digital console, and luxurious seating, it blends vintage "
                "elegance with exceptional fuel economy."
            ),
            'variant': {
                'name': 'Access 125 Ride Connect Edition',
                'sku': 'VOLT-SUZUKI-ACCESS125-GREEN',
                'base_price': Decimal('89500.00'),
                'original_price': Decimal('97000.00'),
                'default_image': 'vehicles/variants/suzuki_access_125_green.png',
                'specs': {
                    'engine_displacement_cc': 124,
                    'max_power_bhp': '8.7 bhp @ 6,750 rpm',
                    'max_torque_nm': '10.0 Nm @ 5,500 rpm',
                    'transmission': 'CVT Automatic',
                    'fuel_tank_capacity_l': Decimal('5.0'),
                    'mileage_kmpl': Decimal('52.0'),
                    'driving_range_km': 260,
                    'top_speed_kmh': 92,
                    'brakes_type': 'Front Disc, Rear Drum with Combined Braking System (CBS)',
                    'tyres_type': 'Tubeless 90/90-12 Front, 90/100-10 Rear',
                    'carrying_capacity_kg': 160,
                    'warranty_years': 3,
                },
                'color_name': 'Solid Ice Green',
                'hex_code': '#7C9D96',
                'combo_name': 'Solid Ice Green Monotone',
                'customizer_image': 'vehicles/customizer/suzuki_access_125_green.png',
            }
        },

        # 2. Vespa VXL 125
        {
            'model_name': 'Vespa VXL 125',
            'tagline': 'La Dolce Vita - Iconic Italian Monocoque Heritage',
            'description': (
                "The Vespa VXL 125 represents the pinnacle of Italian retro craftsmanship with its iconic monocoque "
                "full-steel body. Powered by an advanced 124.45cc 3-valve FI engine with variable valve timing and "
                "single-sided aircraft-derived trailing link front suspension, it offers unmatched charisma, plush "
                "ride quality, and unmistakable street presence."
            ),
            'variant': {
                'name': 'Vespa VXL 125 Giallo Edition',
                'sku': 'VOLT-VESPA-VXL125-YELLOW',
                'base_price': Decimal('132000.00'),
                'original_price': Decimal('142000.00'),
                'default_image': 'vehicles/variants/vespa_vxl_125_yellow.png',
                'specs': {
                    'engine_displacement_cc': 124,
                    'max_power_bhp': '9.9 bhp @ 7,500 rpm',
                    'max_torque_nm': '9.6 Nm @ 5,500 rpm',
                    'transmission': 'Continuous Variable Transmission (CVT)',
                    'fuel_tank_capacity_l': Decimal('7.4'),
                    'mileage_kmpl': Decimal('45.0'),
                    'driving_range_km': 330,
                    'top_speed_kmh': 95,
                    'brakes_type': '200mm Front Disc with Hydraulic Single Channel ABS, 140mm Rear Drum',
                    'tyres_type': 'Maxxis Tubeless 110/70-11 Front, 120/70-10 Rear',
                    'carrying_capacity_kg': 150,
                    'warranty_years': 2,
                },
                'color_name': 'Giallo Tuscan Yellow',
                'hex_code': '#F3C13A',
                'combo_name': 'Giallo Tuscan Yellow Monotone',
                'customizer_image': 'vehicles/customizer/vespa_vxl_125_yellow.png',
            }
        },

        # 3. Honda Activa 125
        {
            'model_name': 'Honda Activa 125',
            'tagline': 'The Benchmark of Trust - Smart Key Technology',
            'description': (
                "The Honda Activa 125 H-Smart is India's benchmark commuter scooter, powered by the reliable 123.97cc "
                "eSP (enhanced Smart Power) engine with PGM-FI and Idling Stop System. Packed with smart keyless start, "
                "anti-theft immobilizer, LED signature headlamps, and a full-metal body, it delivers bulletproof "
                "reliability and whisper-quiet ACG silent starter operation."
            ),
            'variant': {
                'name': 'Activa 125 H-Smart Disc',
                'sku': 'VOLT-HONDA-ACTIVA125-BLUE',
                'base_price': Decimal('88900.00'),
                'original_price': Decimal('94500.00'),
                'default_image': 'vehicles/variants/honda_activa_125_blue.png',
                'specs': {
                    'engine_displacement_cc': 124,
                    'max_power_bhp': '8.3 bhp @ 6,500 rpm',
                    'max_torque_nm': '10.4 Nm @ 5,000 rpm',
                    'transmission': 'V-Matic Automatic',
                    'fuel_tank_capacity_l': Decimal('5.3'),
                    'mileage_kmpl': Decimal('50.0'),
                    'driving_range_km': 265,
                    'top_speed_kmh': 90,
                    'brakes_type': '190mm Front Disc, 130mm Rear Drum with Combi-Brake System (CBS)',
                    'tyres_type': 'Tubeless 90/90-12 Front, 90/100-10 Rear',
                    'carrying_capacity_kg': 160,
                    'warranty_years': 3,
                },
                'color_name': 'Mat Marvel Blue Metallic',
                'hex_code': '#2E4A78',
                'combo_name': 'Mat Marvel Blue Metallic Monotone',
                'customizer_image': 'vehicles/customizer/honda_activa_125_blue.png',
            }
        },
    ]

    for item in scooters_data:
        model_obj, _ = VehicleModel.objects.update_or_create(
            name=item['model_name'],
            defaults={
                'category': cat_scooter,
                'fuel_type': 'petrol',
                'tagline': item['tagline'],
                'description': item['description'],
                'is_featured': True,
                'is_active': True,
            }
        )

        v_data = item['variant']
        variant_obj, _ = VehicleVariant.objects.update_or_create(
            sku=v_data['sku'],
            defaults={
                'model': model_obj,
                'name': v_data['name'],
                'base_price': v_data['base_price'],
                'original_price': v_data['original_price'],
                'default_image': v_data['default_image'],
                'is_active': True,
            }
        )

        sp = v_data['specs']
        VehicleSpecification.objects.update_or_create(
            variant=variant_obj,
            defaults={
                'driving_range_km': sp['driving_range_km'],
                'top_speed_kmh': sp['top_speed_kmh'],
                'warranty_years': sp['warranty_years'],
                'brakes_type': sp['brakes_type'],
                'tyres_type': sp['tyres_type'],
                'carrying_capacity_kg': sp['carrying_capacity_kg'],
                'engine_displacement_cc': sp['engine_displacement_cc'],
                'max_power_bhp': sp['max_power_bhp'],
                'max_torque_nm': sp['max_torque_nm'],
                'transmission': sp['transmission'],
                'fuel_tank_capacity_l': sp['fuel_tank_capacity_l'],
                'mileage_kmpl': sp['mileage_kmpl'],
                'battery_type': '',
                'battery_capacity': '',
                'charging_time_hours': None,
                'motor_power_watt': None,
            }
        )

        VehicleImage.objects.update_or_create(
            variant=variant_obj,
            caption=f"Studio Profile - {v_data['name']}",
            defaults={
                'image': v_data['default_image'].replace('variants/', ''),
                'display_order': 1,
            }
        )

        # Customizer: ONLY default factory color
        color_obj, _ = Colour.objects.get_or_create(
            name=v_data['color_name'],
            defaults={'hex_code': v_data['hex_code'], 'is_active': True}
        )

        combo_obj, _ = ColourCombination.objects.get_or_create(
            name=v_data['combo_name'],
            defaults={
                'primary_colour': color_obj,
                'secondary_colour': None,
                'is_dual_tone': False,
                'is_active': True,
            }
        )

        # Delete any other color configurations for this variant
        VehicleColourConfig.objects.filter(variant=variant_obj).exclude(combination=combo_obj).delete()

        VehicleColourConfig.objects.update_or_create(
            variant=variant_obj,
            combination=combo_obj,
            defaults={
                'image': v_data['customizer_image'],
                'price_adjustment': Decimal('0.00'),
                'is_available': True,
            }
        )

        print(f"  + Added / Updated: {model_obj.name} (Variant ID: {variant_obj.id}) in {combo_obj.name}")

    print("\nSuccessfully seeded all 3 petrol scooters with exclusive default factory colors!")

if __name__ == '__main__':
    seed_petrol_scooters()
