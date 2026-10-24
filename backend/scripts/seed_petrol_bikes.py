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
)

def seed_new_vehicles():
    print("Seeding new high-performance Petrol and Classic motorcycles...")

    # 1. Categories
    cat_superbike, _ = VehicleCategory.objects.get_or_create(
        name='Superbike & Supersport',
        defaults={
            'slug': 'superbike-supersport',
            'description': 'Aerodynamic track weapons, high-revving multis, and precision supersport motorcycles.'
        }
    )

    cat_classic, _ = VehicleCategory.objects.get_or_create(
        name='Modern Classic & Cafe Racer',
        defaults={
            'slug': 'modern-classic-caferacer',
            'description': 'Timeless retro roadsters, authentic cafe racers, and vintage twin-cylinder legends.'
        }
    )

    # 2. Vehicles definition
    vehicles = [
        # 1. Royal Enfield Continental GT 650
        {
            'category': cat_classic,
            'fuel_type': 'petrol',
            'model_name': 'Continental GT 650',
            'tagline': 'A Ton of Fun - Pure British Cafe Racer DNA',
            'description': 'The Royal Enfield Continental GT 650 Twin takes inspiration from the 1960s cafe racer culture. Powered by the acclaimed 648cc parallel-twin engine, it features clip-on handlebars, sculpted fuel tank, and twin megaphone exhausts for an authentic nostalgic rush.',
            'is_featured': True,
            'variant': {
                'name': 'GT 650 Mr Clean',
                'sku': 'RE-CGT650-MRCLEAN',
                'base_price': Decimal('345000.00'),
                'original_price': Decimal('365000.00'),
                'default_image': 'vehicles/variants/re_continental_gt650.png',
                'specs': {
                    'engine_displacement_cc': 648,
                    'max_power_bhp': '47 bhp @ 7,250 rpm',
                    'max_torque_nm': '52 Nm @ 5,250 rpm',
                    'transmission': '6-Speed Manual with Assist & Slipper Clutch',
                    'fuel_tank_capacity_l': Decimal('12.5'),
                    'mileage_kmpl': Decimal('25.0'),
                    'driving_range_km': 310,
                    'top_speed_kmh': 169,
                    'brakes_type': 'ByBre Twin Piston 320mm Front Disc, 240mm Rear Disc with Bosch Dual Channel ABS',
                    'tyres_type': 'Pirelli Phantom Sportscomp (100/90-18 Front, 130/70-18 Rear)',
                    'carrying_capacity_kg': 180,
                    'warranty_years': 3,
                }
            }
        },

        # 2. Ducati Panigale 899
        {
            'category': cat_superbike,
            'fuel_type': 'petrol',
            'model_name': 'Ducati Panigale 899',
            'tagline': 'The Way to Superbike Excellence - Pure Italian Passion',
            'description': 'The Ducati 899 Panigale is a revolutionary supersport engineered with a monocoque frame and the high-revving 898cc Superquadro L-twin engine. Featuring Ducati Quick Shift (DQS), triple-stage ABS, and Ride-by-Wire power modes, it delivers pure racing euphoria.',
            'is_featured': True,
            'variant': {
                'name': 'Panigale 899 Superquadro Red',
                'sku': 'DUC-899-PANIGALE-RED',
                'base_price': Decimal('1390000.00'),
                'original_price': Decimal('1520000.00'),
                'default_image': 'vehicles/variants/ducati_panigale_899.png',
                'specs': {
                    'engine_displacement_cc': 898,
                    'max_power_bhp': '148 bhp @ 10,750 rpm',
                    'max_torque_nm': '99 Nm @ 9,000 rpm',
                    'transmission': '6-Speed with Ducati Quick Shift (DQS)',
                    'fuel_tank_capacity_l': Decimal('17.0'),
                    'mileage_kmpl': Decimal('16.5'),
                    'driving_range_km': 280,
                    'top_speed_kmh': 260,
                    'brakes_type': 'Dual 320mm Semi-Floating Discs with Brembo Monobloc M4.32 Calipers & Bosch 9MP ABS',
                    'tyres_type': 'Pirelli Diablo Rosso Corsa (120/70-ZR17 Front, 180/60-ZR17 Rear)',
                    'carrying_capacity_kg': 160,
                    'warranty_years': 2,
                }
            }
        },

        # 3. BMW S1000RR M-Sport
        {
            'category': cat_superbike,
            'fuel_type': 'petrol',
            'model_name': 'BMW S1000RR',
            'tagline': 'Born on the Racetrack - Pure Apex Predator',
            'description': 'The BMW S1000RR is the undisputed benchmark of superbike engineering. Packed with a 999cc ShiftCam inline-4 churning out over 205 bhp, dynamic traction control (DTC), carbon aerodynamic winglets, and bi-directional quickshifting, it dominates track and street.',
            'is_featured': True,
            'variant': {
                'name': 'S1000RR M-Sport Edition',
                'sku': 'BMW-S1000RR-MSPORT',
                'base_price': Decimal('2075000.00'),
                'original_price': Decimal('2250000.00'),
                'default_image': 'vehicles/variants/bmw_s1000rr.png',
                'specs': {
                    'engine_displacement_cc': 999,
                    'max_power_bhp': '205 bhp @ 13,000 rpm',
                    'max_torque_nm': '113 Nm @ 11,000 rpm',
                    'transmission': '6-Speed with Shift Assist Pro Bi-directional Quickshifter',
                    'fuel_tank_capacity_l': Decimal('16.5'),
                    'mileage_kmpl': Decimal('15.6'),
                    'driving_range_km': 255,
                    'top_speed_kmh': 303,
                    'brakes_type': 'Twin 320mm Disc 4-Piston Radial Fixed Calipers with BMW Motorrad Race ABS Pro',
                    'tyres_type': 'M Carbon Rims with Front 120/70 ZR17, Rear 190/55 ZR17',
                    'carrying_capacity_kg': 170,
                    'warranty_years': 3,
                }
            }
        },

        # 4. KTM RC 390
        {
            'category': cat_superbike,
            'fuel_type': 'petrol',
            'model_name': 'KTM RC 390',
            'tagline': 'Ready to Race - Track-Bred Lightweight Supersport',
            'description': 'The KTM RC 390 is a thoroughbred sports machine with Moto3 DNA. Built around an ultra-rigid trellis frame with WP APEX adjustable upside-down forks, lean-angle sensitive cornering ABS, and Supermoto mode, it is the sharpest corner carver in its class.',
            'is_featured': True,
            'variant': {
                'name': 'RC 390 GP Racing Edition',
                'sku': 'KTM-RC390-GP-ORANGE',
                'base_price': Decimal('318000.00'),
                'original_price': Decimal('335000.00'),
                'default_image': 'vehicles/variants/ktm_rc_390.png',
                'specs': {
                    'engine_displacement_cc': 373,
                    'max_power_bhp': '43.5 PS @ 9,000 rpm',
                    'max_torque_nm': '37 Nm @ 7,000 rpm',
                    'transmission': '6-Speed with PASC Slipper Clutch & Quickshifter+',
                    'fuel_tank_capacity_l': Decimal('13.7'),
                    'mileage_kmpl': Decimal('31.0'),
                    'driving_range_km': 420,
                    'top_speed_kmh': 170,
                    'brakes_type': '320mm Radially Mounted ByBre 4-Piston Caliper, Bosch 9.1MP Dual Channel with Supermoto',
                    'tyres_type': 'Continental ContiSportAttack 2 (110/70 R17 Front, 150/60 R17 Rear)',
                    'carrying_capacity_kg': 160,
                    'warranty_years': 2,
                }
            }
        },

        # 5. Royal Enfield Classic 350
        {
            'category': cat_classic,
            'fuel_type': 'petrol',
            'model_name': 'Royal Enfield Classic 350',
            'tagline': 'Be Reborn - Timeless British Roadster Tradition',
            'description': 'The Royal Enfield Classic 350 embodies the pure motoring spirit of a bygone era, reimagined with the modern J-series counterbalanced engine. Smooth power delivery, unmistakable signature thump, teardrop tank, and supreme touring comfort.',
            'is_featured': True,
            'variant': {
                'name': 'Classic 350 Halycon Red',
                'sku': 'RE-CLASSIC350-RED',
                'base_price': Decimal('193000.00'),
                'original_price': Decimal('210000.00'),
                'default_image': 'vehicles/variants/re_classic_350.png',
                'specs': {
                    'engine_displacement_cc': 349,
                    'max_power_bhp': '20.2 bhp @ 6,100 rpm',
                    'max_torque_nm': '27 Nm @ 4,000 rpm',
                    'transmission': '5-Speed Constant Mesh Manual',
                    'fuel_tank_capacity_l': Decimal('13.0'),
                    'mileage_kmpl': Decimal('37.0'),
                    'driving_range_km': 480,
                    'top_speed_kmh': 115,
                    'brakes_type': '300mm Front Disc Twin Piston, 270mm Rear Disc Single Piston with Dual Channel ABS',
                    'tyres_type': 'Ceat Zoom Plus Tubeless (100/90-19 Front, 120/80-18 Rear)',
                    'carrying_capacity_kg': 175,
                    'warranty_years': 3,
                }
            }
        },

        # 6. Honda CB300R Neo Sports Cafe
        {
            'category': cat_classic,
            'fuel_type': 'petrol',
            'model_name': 'Honda CB300R',
            'tagline': 'Neo Sports Cafe - Pure Lightweight Thrill',
            'description': 'The Honda CB300R is a quintessential Neo Sports Cafe roadster, blending minimalist retro aesthetics with razor-sharp modern street dynamics. Powered by a responsive 286cc DOHC 4-valve liquid-cooled engine with assist & slipper clutch, inverted Showa SFF-BP front forks, and IMU-linked dual-channel ABS.',
            'is_featured': True,
            'variant': {
                'name': 'CB300R Neo Sports Cafe',
                'sku': 'VOLT-HONDA-CB300R-RED',
                'base_price': Decimal('240000.00'),
                'original_price': Decimal('277000.00'),
                'default_image': 'vehicles/variants/honda_cb300r_red.png',
                'specs': {
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
            }
        },

        # 7. Yamaha MT-15 V2
        {
            'category': cat_superbike,
            'fuel_type': 'petrol',
            'model_name': 'Yamaha MT-15 V2',
            'tagline': 'The Dark Side of Japan - Street Naked Predator',
            'description': 'The Yamaha MT-15 V2 is a hyper-naked streetfighter born from the legendary MT family. Powered by the high-revving 155cc liquid-cooled 4-valve engine with Variable Valve Actuation (VVA) and Traction Control System (TCS), golden USD front forks, and striking Cyan Storm alloy wheels.',
            'is_featured': True,
            'variant': {
                'name': 'MT-15 V2 Cyan Storm',
                'sku': 'VOLT-YAMAHA-MT15-CYAN',
                'base_price': Decimal('168000.00'),
                'original_price': Decimal('175000.00'),
                'default_image': 'vehicles/variants/yamaha_mt15_cyan.png',
                'specs': {
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
            }
        },
    ]

    for item in vehicles:
        model_obj, _ = VehicleModel.objects.update_or_create(
            category=item['category'],
            name=item['model_name'],
            defaults={
                'fuel_type': item['fuel_type'],
                'tagline': item['tagline'],
                'description': item['description'],
                'is_featured': item['is_featured'],
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
        print(f"  + Added / Updated: {model_obj.name} - {variant_obj.name} (Rs. {variant_obj.base_price})")

    print("\nAll 7 petrol vehicles seeded successfully!")

if __name__ == '__main__':
    seed_new_vehicles()
