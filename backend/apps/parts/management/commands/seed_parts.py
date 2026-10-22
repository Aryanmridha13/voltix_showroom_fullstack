from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.parts.models import PartCategory, SparePart

class Command(BaseCommand):
    help = 'Seeds spare parts catalog with real EV components and varied inventory states'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Starting EV Spare Parts catalogue seeding...'))

        # 1. Categories
        categories_data = [
            {'name': 'Batteries & Chargers', 'description': 'Lithium-ion & LiFePO4 replacement battery packs and fast chargers.'},
            {'name': 'Braking Systems', 'description': 'Disc rotors, calipers, master cylinders, and regenerative brake components.'},
            {'name': 'Tyres & Wheels', 'description': 'Low rolling resistance tubeless tyres and alloy wheel assemblies.'},
            {'name': 'Motors & Controllers', 'description': 'High efficiency BLDC hub motors and sinusoidal programmable motor controllers.'},
            {'name': 'Electricals & Lighting', 'description': 'LED projector headlamps, digital instrument clusters, and wiring harnesses.'},
        ]

        cat_map = {}
        for c in categories_data:
            obj, _ = PartCategory.objects.get_or_create(
                name=c['name'],
                defaults={'description': c['description'], 'is_active': True}
            )
            cat_map[c['name']] = obj

        # 2. Spare Parts with various stock levels (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
        parts_data = [
            {
                'category': cat_map['Batteries & Chargers'],
                'part_number': 'VOLT-BAT-LIPO4-72V',
                'name': '72V 35Ah LiFePO4 Smart Battery Pack with BMS',
                'description': 'High thermal stability lithium iron phosphate pack with built-in Bluetooth smart BMS protection.',
                'price': Decimal('32500.00'),
                'stock_quantity': 14,
                'low_stock_threshold': 5,  # -> IN_STOCK
            },
            {
                'category': cat_map['Batteries & Chargers'],
                'part_number': 'VOLT-CHG-FAST-72V',
                'name': '72V 10A Aluminum Alloy Portable Fast Charger',
                'description': 'Intelligent dual-stage pulse charger with automatic cutoff and cooling fan.',
                'price': Decimal('4999.00'),
                'stock_quantity': 22,
                'low_stock_threshold': 6,  # -> IN_STOCK
            },
            {
                'category': cat_map['Braking Systems'],
                'part_number': 'VOLT-BRK-CALIPER-F',
                'name': 'Front Hydraulic Dual-Piston Disc Brake Caliper',
                'description': 'Precision CNC machined dual piston caliper offering supreme stopping power for high-speed EVs.',
                'price': Decimal('2199.00'),
                'stock_quantity': 3,
                'low_stock_threshold': 5,  # -> LOW_STOCK
            },
            {
                'category': cat_map['Braking Systems'],
                'part_number': 'VOLT-BRK-PAD-CERAMIC',
                'name': 'Premium Sintered Ceramic Front Brake Pads',
                'description': 'High friction coefficient sintered ceramic pads with zero rotor wear and fade resistance.',
                'price': Decimal('549.00'),
                'stock_quantity': 45,
                'low_stock_threshold': 10,  # -> IN_STOCK
            },
            {
                'category': cat_map['Tyres & Wheels'],
                'part_number': 'VOLT-TYR-TUBELESS-90',
                'name': '90/90-12 All-Weather Tubeless EV Tyre',
                'description': 'Low rolling resistance compound designed to maximize battery range and wet grip.',
                'price': Decimal('1650.00'),
                'stock_quantity': 18,
                'low_stock_threshold': 5,  # -> IN_STOCK
            },
            {
                'category': cat_map['Motors & Controllers'],
                'part_number': 'VOLT-CTR-SINE-3000',
                'name': '3000W Intelligent Sinusoidal Motor Controller',
                'description': 'Ultra-smooth regenerative braking controller with dynamic torque vectoring.',
                'price': Decimal('6800.00'),
                'stock_quantity': 2,
                'low_stock_threshold': 4,  # -> LOW_STOCK
            },
            {
                'category': cat_map['Electricals & Lighting'],
                'part_number': 'VOLT-LGT-PROJ-HEADLAMP',
                'name': 'Dual-Beam LED Projector Headlamp Assembly',
                'description': 'Aerodynamic headlight unit with integrated DRL and 3500-lumen wide illumination.',
                'price': Decimal('3200.00'),
                'stock_quantity': 0,
                'low_stock_threshold': 5,  # -> OUT_OF_STOCK
            },
        ]

        total_created = 0
        for p in parts_data:
            _, created = SparePart.objects.get_or_create(
                part_number=p['part_number'],
                defaults={
                    'category': p['category'],
                    'name': p['name'],
                    'description': p['description'],
                    'price': p['price'],
                    'stock_quantity': p['stock_quantity'],
                    'low_stock_threshold': p['low_stock_threshold'],
                    'is_active': True
                }
            )
            if created:
                total_created += 1

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded {PartCategory.objects.count()} categories and {total_created} spare parts with live inventory states!"
        ))
