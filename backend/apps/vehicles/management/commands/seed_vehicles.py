from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.vehicles.models import (
    VehicleCategory,
    VehicleModel,
    VehicleVariant,
    VehicleSpecification,
)

class Command(BaseCommand):
    help = 'Seeds database with real electric vehicles from the EV showroom catalog'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Starting EV Showroom vehicle catalogue seeding...'))

        # 1. Categories
        cat_low_speed, _ = VehicleCategory.objects.get_or_create(
            name='Low Speed Scooter',
            defaults={
                'slug': 'low-speed-scooter',
                'description': 'City commuting electric scooters requiring no registration or license, top speed 25 km/h.'
            }
        )
        cat_high_speed, _ = VehicleCategory.objects.get_or_create(
            name='High Speed Scooter',
            defaults={
                'slug': 'high-speed-scooter',
                'description': 'High performance electric scooters with ultra long range and speeds up to 80 km/h.'
            }
        )
        cat_cruiser, _ = VehicleCategory.objects.get_or_create(
            name='Cruiser Bikes',
            defaults={
                'slug': 'cruiser-bikes',
                'description': 'Heavy-duty electric cruiser motorcycles built for highways and long tours.'
            }
        )
        cat_commercial, _ = VehicleCategory.objects.get_or_create(
            name='Commercial 3-Wheelers',
            defaults={
                'slug': 'commercial-3-wheelers',
                'description': 'High cargo payload electric trikes and delivery carriers for businesses.'
            }
        )

        # 2. Models & Variants Data
        vehicles_data = [
            # X-One (Low Speed)
            {
                'category': cat_low_speed,
                'model_name': 'X-One',
                'tagline': 'Smart Urban Scooter',
                'is_featured': True,
                'variants': [
                    {
                        'name': 'X-One Graphene',
                        'sku': 'VOLT-XONE-GRAPHENE',
                        'base_price': Decimal('39999.00'),
                        'original_price': Decimal('44999.00'),
                        'specs': {
                            'battery_type': 'Graphene',
                            'battery_capacity': '60V 30Ah',
                            'driving_range_km': 65,
                            'top_speed_kmh': 25,
                            'charging_time_hours': Decimal('4.0'),
                            'motor_power_watt': 1000,
                        }
                    },
                    {
                        'name': 'X-One Lipo4 70+',
                        'sku': 'VOLT-XONE-LIPO4-70',
                        'base_price': Decimal('45999.00'),
                        'original_price': None,
                        'specs': {
                            'battery_type': 'LiFePO4',
                            'battery_capacity': '60V 32Ah',
                            'driving_range_km': 75,
                            'top_speed_kmh': 25,
                            'charging_time_hours': Decimal('3.5'),
                            'motor_power_watt': 1000,
                        }
                    },
                    {
                        'name': 'X-One Lipo4 85+',
                        'sku': 'VOLT-XONE-LIPO4-85',
                        'base_price': Decimal('53999.00'),
                        'original_price': Decimal('54999.00'),
                        'specs': {
                            'battery_type': 'LiFePO4',
                            'battery_capacity': '60V 40Ah',
                            'driving_range_km': 90,
                            'top_speed_kmh': 25,
                            'charging_time_hours': Decimal('4.0'),
                            'motor_power_watt': 1200,
                        }
                    },
                ]
            },
            # SE Series (High Speed)
            {
                'category': cat_high_speed,
                'model_name': 'SE',
                'tagline': 'Power Packed Performance',
                'is_featured': True,
                'variants': [
                    {
                        'name': 'SE Li',
                        'sku': 'VOLT-SE-LI',
                        'base_price': Decimal('75999.00'),
                        'original_price': Decimal('76999.00'),
                        'specs': {
                            'battery_type': 'LiFePO4',
                            'battery_capacity': '72V 35Ah',
                            'driving_range_km': 100,
                            'top_speed_kmh': 45,
                            'charging_time_hours': Decimal('4.0'),
                            'motor_power_watt': 1800,
                        }
                    },
                    {
                        'name': 'SE Pro',
                        'sku': 'VOLT-SE-PRO',
                        'base_price': Decimal('97999.00'),
                        'original_price': None,
                        'specs': {
                            'battery_type': 'LiFePO4',
                            'battery_capacity': '72V 60Ah',
                            'driving_range_km': 322,
                            'top_speed_kmh': 65,
                            'charging_time_hours': Decimal('5.0'),
                            'motor_power_watt': 2500,
                        }
                    },
                    {
                        'name': 'SE Ultra',
                        'sku': 'VOLT-SE-ULTRA',
                        'base_price': Decimal('121999.00'),
                        'original_price': None,
                        'specs': {
                            'battery_type': 'LiFePO4 Dual Pack',
                            'battery_capacity': '72V 80Ah',
                            'driving_range_km': 418,
                            'top_speed_kmh': 70,
                            'charging_time_hours': Decimal('5.5'),
                            'motor_power_watt': 3000,
                        }
                    },
                ]
            },
            # Ranger (Cruiser Bikes)
            {
                'category': cat_cruiser,
                'model_name': 'Ranger',
                'tagline': 'India First Electric Cruiser Bike',
                'is_featured': True,
                'variants': [
                    {
                        'name': 'Ranger Standard',
                        'sku': 'VOLT-RANGER-STD',
                        'base_price': Decimal('132499.00'),
                        'original_price': Decimal('184999.00'),
                        'specs': {
                            'battery_type': 'LiFePO4',
                            'battery_capacity': '4.0 kWh Advanced',
                            'driving_range_km': 180,
                            'top_speed_kmh': 80,
                            'charging_time_hours': Decimal('4.5'),
                            'motor_power_watt': 4000,
                        }
                    },
                    {
                        'name': 'Ranger Long Range',
                        'sku': 'VOLT-RANGER-LR',
                        'base_price': Decimal('137499.00'),
                        'original_price': Decimal('184999.00'),
                        'specs': {
                            'battery_type': 'LiFePO4',
                            'battery_capacity': '4.5 kWh Advanced',
                            'driving_range_km': 220,
                            'top_speed_kmh': 80,
                            'charging_time_hours': Decimal('5.0'),
                            'motor_power_watt': 4000,
                        }
                    },
                ]
            },
            # MX16 (Cruiser Bikes)
            {
                'category': cat_cruiser,
                'model_name': 'MX16',
                'tagline': 'Aggressive Street Cruiser',
                'is_featured': True,
                'variants': [
                    {
                        'name': 'MX16 Beast',
                        'sku': 'VOLT-MX16-BEAST',
                        'base_price': Decimal('174999.00'),
                        'original_price': Decimal('199999.00'),
                        'specs': {
                            'battery_type': 'LiFePO4',
                            'battery_capacity': '5.2 kWh High Output',
                            'driving_range_km': 200,
                            'top_speed_kmh': 85,
                            'charging_time_hours': Decimal('4.5'),
                            'motor_power_watt': 5000,
                        }
                    },
                ]
            },
            # XR7 (High Speed)
            {
                'category': cat_high_speed,
                'model_name': 'XR7',
                'tagline': '322KM Range - Flagship Scooter',
                'is_featured': True,
                'variants': [
                    {
                        'name': 'XR7 Flagship',
                        'sku': 'VOLT-XR7-FLAGSHIP',
                        'base_price': Decimal('95999.00'),
                        'original_price': None,
                        'specs': {
                            'battery_type': 'LiFePO4 Ultra',
                            'battery_capacity': '72V 65Ah',
                            'driving_range_km': 322,
                            'top_speed_kmh': 65,
                            'charging_time_hours': Decimal('4.5'),
                            'motor_power_watt': 3000,
                        }
                    },
                ]
            },
            # CAT 3.0 Commercial Trike
            {
                'category': cat_commercial,
                'model_name': 'CAT 3.0 NXT',
                'tagline': 'Heavy-Duty Electric Cargo Trike',
                'is_featured': False,
                'variants': [
                    {
                        'name': 'CAT 3.0 Cargo Edition',
                        'sku': 'VOLT-CAT-30-CARGO',
                        'base_price': Decimal('115000.00'),
                        'original_price': Decimal('125000.00'),
                        'specs': {
                            'battery_type': 'LiFePO4 Industrial',
                            'battery_capacity': '60V 50Ah',
                            'driving_range_km': 110,
                            'top_speed_kmh': 35,
                            'charging_time_hours': Decimal('5.0'),
                            'motor_power_watt': 2000,
                            'carrying_capacity_kg': 450,
                        }
                    },
                ]
            },
        ]

        total_created = 0
        for data in vehicles_data:
            model_obj, _ = VehicleModel.objects.get_or_create(
                category=data['category'],
                name=data['model_name'],
                defaults={
                    'tagline': data['tagline'],
                    'is_featured': data['is_featured'],
                    'description': f"High performance electric vehicle engineered for reliability and long battery life."
                }
            )

            for v in data['variants']:
                specs_dict = v['specs']
                variant_obj, created = VehicleVariant.objects.get_or_create(
                    sku=v['sku'],
                    defaults={
                        'model': model_obj,
                        'name': v['name'],
                        'base_price': v['base_price'],
                        'original_price': v.get('original_price'),
                        'is_active': True
                    }
                )

                if created:
                    total_created += 1
                    VehicleSpecification.objects.create(
                        variant=variant_obj,
                        battery_type=specs_dict['battery_type'],
                        battery_capacity=specs_dict['battery_capacity'],
                        driving_range_km=specs_dict['driving_range_km'],
                        top_speed_kmh=specs_dict['top_speed_kmh'],
                        charging_time_hours=specs_dict['charging_time_hours'],
                        motor_power_watt=specs_dict['motor_power_watt'],
                        carrying_capacity_kg=specs_dict.get('carrying_capacity_kg', 150)
                    )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded {total_created} vehicle variants with full specifications across {VehicleCategory.objects.count()} categories!"
        ))
