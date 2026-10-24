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
            {'name': 'Body & Accessories', 'description': 'Anti-skid floor mats, carbon-fiber mirrors, body panels, and custom accessories.'},
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
                'image': 'parts/lifepo4_72v_battery.png',
                'stock_quantity': 14,
                'low_stock_threshold': 5,  # -> IN_STOCK
            },
            {
                'category': cat_map['Batteries & Chargers'],
                'part_number': 'VOLT-CHG-FAST-72V',
                'name': '72V 10A Aluminum Alloy Portable Fast Charger',
                'description': 'Intelligent dual-stage pulse charger with automatic cutoff and cooling fan.',
                'price': Decimal('4999.00'),
                'image': 'parts/fast_charger_72v.png',
                'stock_quantity': 22,
                'low_stock_threshold': 6,  # -> IN_STOCK
            },
            {
                'category': cat_map['Braking Systems'],
                'part_number': 'VOLT-BRK-CALIPER-F',
                'name': 'Front Hydraulic Dual-Piston Disc Brake Caliper',
                'description': 'Precision CNC machined dual piston caliper offering supreme stopping power for high-speed EVs.',
                'price': Decimal('2199.00'),
                'image': 'parts/hydraulic_brake_caliper.png',
                'stock_quantity': 3,
                'low_stock_threshold': 5,  # -> LOW_STOCK
            },
            {
                'category': cat_map['Braking Systems'],
                'part_number': 'VOLT-BRK-PAD-CERAMIC',
                'name': 'Premium Sintered Ceramic Front Brake Pads',
                'description': 'High friction coefficient sintered ceramic pads with zero rotor wear and fade resistance.',
                'price': Decimal('549.00'),
                'image': 'parts/sintered_front_brake_pads.png',
                'stock_quantity': 45,
                'low_stock_threshold': 10,  # -> IN_STOCK
            },
            {
                'category': cat_map['Tyres & Wheels'],
                'part_number': 'VOLT-TYR-TUBELESS-90',
                'name': '90/90-12 All-Weather Tubeless EV Tyre',
                'description': 'Low rolling resistance compound designed to maximize battery range and wet grip.',
                'price': Decimal('1650.00'),
                'image': 'parts/ev_tubeless_tyre.png',
                'stock_quantity': 18,
                'low_stock_threshold': 5,  # -> IN_STOCK
            },
            {
                'category': cat_map['Motors & Controllers'],
                'part_number': 'VOLT-CTR-SINE-3000',
                'name': '3000W Intelligent Sinusoidal Motor Controller',
                'description': 'Ultra-smooth regenerative braking controller with dynamic torque vectoring.',
                'price': Decimal('6800.00'),
                'image': 'parts/sinusoidal_motor_controller.png',
                'stock_quantity': 2,
                'low_stock_threshold': 4,  # -> LOW_STOCK
            },
            {
                'category': cat_map['Electricals & Lighting'],
                'part_number': 'VOLT-LGT-PROJ-HEADLAMP',
                'name': 'Dual-Beam LED Projector Headlamp Assembly',
                'description': 'Aerodynamic headlight unit with integrated DRL and 3500-lumen wide illumination.',
                'price': Decimal('3200.00'),
                'image': 'parts/led_projector_headlight_bulb.png',
                'stock_quantity': 0,
                'low_stock_threshold': 5,  # -> OUT_OF_STOCK
            },
            {
                'category': cat_map['Batteries & Chargers'],
                'part_number': 'VOLT-BAT-LEADACID-12V32AH',
                'name': '12V 32Ah Lead Acid High-Drain Battery',
                'description': 'Heavy-duty 12V 32Ah deep-cycle valve-regulated lead-acid (VRLA) battery engineered for electric 2-wheelers and commercial 3-wheelers.',
                'price': Decimal('3499.00'),
                'image': 'parts/12v_32ah_lead_acid_battery.png',
                'stock_quantity': 25,
                'low_stock_threshold': 5,
            },
            {
                'category': cat_map['Batteries & Chargers'],
                'part_number': 'VOLT-BAT-LITHIUM-60V30AH',
                'name': '60V 30Ah Lithium-Ion Heavy-Duty Battery Pack',
                'description': 'High energy density 60V 30Ah lithium battery pack featuring heavy-duty steel enclosure, integrated smart BMS, top carry handle, and high-current connector.',
                'price': Decimal('28999.00'),
                'image': 'parts/60v_30ah_lithium_battery.png',
                'stock_quantity': 12,
                'low_stock_threshold': 4,
            },
            {
                'category': cat_map['Braking Systems'],
                'part_number': 'VOLT-BRK-LEVER-CUTOFF',
                'name': 'Electric Cutoff Alloy Brake Levers (Pair)',
                'description': 'Precision-molded aluminum alloy brake lever set with built-in motor power cutoff micro-switches and waterproof quick-connect wiring for electric scooters.',
                'price': Decimal('849.00'),
                'image': 'parts/ebike_cutoff_brake_levers.png',
                'stock_quantity': 35,
                'low_stock_threshold': 8,
            },
            {
                'category': cat_map['Braking Systems'],
                'part_number': 'VOLT-BRK-DRUM-ASSY',
                'name': 'Heavy-Duty EV Drum Brake Hub Assembly with Shoes',
                'description': 'Complete cast alloy drum brake plate assembly with high-friction asbestos-free brake shoes, dual heavy tension springs, and zinc-plated actuation lever.',
                'price': Decimal('1299.00'),
                'image': 'parts/drum_brake_hub_assembly.png',
                'stock_quantity': 20,
                'low_stock_threshold': 5,
            },
            {
                'category': cat_map['Batteries & Chargers'],
                'part_number': 'VOLT-CHG-FAST-54V6A',
                'name': '54.6V 6A Fast Lithium Battery Charger (13S 48V NMC)',
                'description': 'High-efficiency intelligent fast charger with extruded aluminum cooling heatsink, active ball-bearing fan, dual-color LED charging indicator, and automatic full cutoff.',
                'price': Decimal('3899.00'),
                'image': 'parts/54v_6a_battery_charger.png',
                'stock_quantity': 18,
                'low_stock_threshold': 5,
            },
            {
                'category': cat_map['Body & Accessories'],
                'part_number': 'VOLT-ACC-FLOOR-MAT',
                'name': 'Anti-Skid Heavy-Duty Rubber Floor Mat',
                'description': 'Precision laser-cut anti-slip rubber floor footboard mat with deep groove water channeling and all-weather grip.',
                'price': Decimal('499.00'),
                'image': 'parts/scooter_rubber_floor_mat.png',
                'stock_quantity': 40,
                'low_stock_threshold': 8,
            },
            {
                'category': cat_map['Body & Accessories'],
                'part_number': 'VOLT-ACC-MIRROR-CARBON',
                'name': 'Stealth Carbon-Fiber Aerodynamic Rearview Mirrors (Pair)',
                'description': 'Ultra-clear wide-angle convex mirrors with aerodynamic carbon-fiber composite backing and vibration-damped alloy stalks.',
                'price': Decimal('1199.00'),
                'image': 'parts/carbon_rearview_mirrors.png',
                'stock_quantity': 28,
                'low_stock_threshold': 6,
            },
            {
                'category': cat_map['Motors & Controllers'],
                'part_number': 'VOLT-CTR-THROTTLE-GRIP',
                'name': 'Ergonomic Twist Throttle Grip Set with Eco/Sport Switch',
                'description': 'Full-grip linear twist throttle with integrated Eco/Sport toggle switch, aluminum bar ends, and weather-sealed multi-pin connector.',
                'price': Decimal('749.00'),
                'image': 'parts/twist_throttle_grip_set.png',
                'stock_quantity': 32,
                'low_stock_threshold': 6,
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
                    'image': p.get('image'),
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
