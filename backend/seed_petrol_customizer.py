import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.vehicles.models import VehicleVariant
from apps.customizer.models import Colour, ColourCombination, VehicleColourConfig

# 1. Ensure required Colours exist
colors_data = [
    ("KTM Racing Orange", "#FF5500"),
    ("Polar White", "#FFFFFF"),
    ("Stealth Carbon Black", "#18181B"),
    ("M-Sport Blue", "#0066B1"),
    ("M-Sport Red", "#E2001A"),
    ("Ducati Corse Red", "#D40000"),
    ("Arctic Silk White", "#F1F5F9"),
    ("Mr Clean Chrome", "#E2E8F0"),
    ("British Racing Green", "#004225"),
    ("Halcyon Forest Green", "#2D5A27"),
    ("Signals Desert Sand", "#C2B280"),
    ("Candy Chromosphere Red", "#D0202A"),
    ("Cyan Storm", "#00E5FF"),
    ("Solid Ice Green", "#7C9D96"),
    ("Giallo Tuscan Yellow", "#F3C13A"),
    ("Mat Marvel Blue Metallic", "#2E4A78"),
]

colors_dict = {}
for name, hex_code in colors_data:
    c, _ = Colour.objects.get_or_create(name=name, defaults={"hex_code": hex_code, "is_active": True})
    colors_dict[name] = c

# Also fetch existing standard colors
for c in Colour.objects.all():
    colors_dict[c.name] = c

# 2. Helper to get or create combinations
def get_or_create_combo(name, primary, secondary=None, is_dual_tone=False):
    combo, _ = ColourCombination.objects.get_or_create(
        name=name,
        defaults={
            "primary_colour": primary,
            "secondary_colour": secondary,
            "is_dual_tone": is_dual_tone,
            "is_active": True,
        }
    )
    return combo

# Combos for KTM RC 390
ktm_gp = get_or_create_combo("Factory GP Orange & White", colors_dict["KTM Racing Orange"], colors_dict["Polar White"], True)
ktm_stealth = get_or_create_combo("Stealth Carbon & Orange", colors_dict["KTM Racing Orange"], colors_dict["Stealth Carbon Black"], True)
ktm_whiteout = get_or_create_combo("Arctic Whiteout & GP Orange", colors_dict["Polar White"], colors_dict["KTM Racing Orange"], True)
ktm_orange_mono = get_or_create_combo("Pure Racing Orange Monotone", colors_dict["KTM Racing Orange"], None, False)

# Combos for BMW S1000RR
bmw_msport = get_or_create_combo("M-Sport Motorsport Tricolour", colors_dict["Polar White"], colors_dict["M-Sport Blue"], True)
bmw_black = get_or_create_combo("Black Storm Metallic", colors_dict["Stealth Carbon Black"], None, False)
bmw_red = get_or_create_combo("Passion Racing Red & Black", colors_dict["M-Sport Red"], colors_dict["Stealth Carbon Black"], True)

# Combos for Ducati Panigale 899
ducati_red = get_or_create_combo("Ducati Corse Red Monotone", colors_dict["Ducati Corse Red"], None, False)
ducati_white = get_or_create_combo("Arctic Silk White & Red Wheels", colors_dict["Arctic Silk White"], colors_dict["Ducati Corse Red"], True)
ducati_stealth = get_or_create_combo("Dark Stealth Edition", colors_dict["Stealth Carbon Black"], colors_dict["Ducati Corse Red"], True)

# Combos for Continental GT 650
re_chrome = get_or_create_combo("Mr Clean Mirror Chrome", colors_dict["Mr Clean Chrome"], colors_dict["Stealth Carbon Black"], True)
re_green = get_or_create_combo("British Racing Green", colors_dict["British Racing Green"], colors_dict["Polar White"], True)
re_black = get_or_create_combo("Dux Deluxe Jet Black", colors_dict["Stealth Carbon Black"], None, False)

# Combos for Classic 350
classic_red = get_or_create_combo("Halcyon Crimson Red", colors_dict.get("Crimson Red", colors_dict["Ducati Corse Red"]), None, False)
classic_desert = get_or_create_combo("Signals Desert Storm Sand", colors_dict["Signals Desert Sand"], colors_dict["Stealth Carbon Black"], True)
classic_green = get_or_create_combo("Halcyon Forest Green", colors_dict["Halcyon Forest Green"], colors_dict["Polar White"], True)

# Combos for Honda CB300R
honda_red = get_or_create_combo("Candy Chromosphere Red Monotone", colors_dict["Candy Chromosphere Red"], None, False)

# Combos for Yamaha MT-15 V2
yamaha_cyan = get_or_create_combo("Cyan Storm Edition", colors_dict["Cyan Storm"], None, False)

# Combos for Suzuki Access 125, Vespa VXL 125, Honda Activa 125
access_green = get_or_create_combo("Solid Ice Green Monotone", colors_dict["Solid Ice Green"], None, False)
vespa_yellow = get_or_create_combo("Giallo Tuscan Yellow Monotone", colors_dict["Giallo Tuscan Yellow"], None, False)
activa_blue = get_or_create_combo("Mat Marvel Blue Metallic Monotone", colors_dict["Mat Marvel Blue Metallic"], None, False)

# 3. Create VehicleColourConfig mappings
variant_configs = {
    19: [ # Suzuki Access 125
        (access_green, 0, "vehicles/customizer/suzuki_access_125_green.png"),
    ],
    20: [ # Vespa VXL 125
        (vespa_yellow, 0, "vehicles/customizer/vespa_vxl_125_yellow.png"),
    ],
    21: [ # Honda Activa 125
        (activa_blue, 0, "vehicles/customizer/honda_activa_125_blue.png"),
    ],
    17: [ # Honda CB300R (Only default Candy Chromosphere Red)
        (honda_red, 0, "vehicles/customizer/honda_cb300r_red.png"),
    ],
    18: [ # Yamaha MT-15 V2 (Only default Cyan Storm)
        (yamaha_cyan, 0, "vehicles/customizer/yamaha_mt15_cyan.png"),
    ],
    15: [ # KTM RC 390
        (ktm_gp, 0, "/vehicles/ktm_rc_390.png"),
        (ktm_stealth, 1500, "/vehicles/ktm_rc_390.png"),
        (ktm_whiteout, 2000, "/vehicles/ktm_rc_390.png"),
        (ktm_orange_mono, 0, "/vehicles/ktm_rc_390.png"),
    ],
    14: [ # BMW S1000RR
        (bmw_msport, 25000, "/vehicles/bmw_s1000rr.png"),
        (bmw_black, 0, "/vehicles/bmw_s1000rr.png"),
        (bmw_red, 15000, "/vehicles/bmw_s1000rr.png"),
    ],
    13: [ # Ducati Panigale 899
        (ducati_red, 0, "/vehicles/ducati_panigale.png"),
        (ducati_white, 12000, "/vehicles/ducati_panigale.png"),
        (ducati_stealth, 15000, "/vehicles/ducati_panigale.png"),
    ],
    12: [ # Continental GT 650
        (re_chrome, 8000, "/vehicles/re_continental_gt.png"),
        (re_green, 4000, "/vehicles/re_continental_gt.png"),
        (re_black, 0, "/vehicles/re_continental_gt.png"),
    ],
    16: [ # Classic 350
        (classic_red, 0, "/vehicles/re_classic_350.png"),
        (classic_desert, 3500, "/vehicles/re_classic_350.png"),
        (classic_green, 2500, "/vehicles/re_classic_350.png"),
    ]
}

total_seeded = 0
for v_id, configs in variant_configs.items():
    try:
        v = VehicleVariant.objects.get(id=v_id)
        for combo, adj, img in configs:
            VehicleColourConfig.objects.get_or_create(
                variant=v,
                combination=combo,
                defaults={
                    "price_adjustment": adj,
                    "is_available": True,
                }
            )
            total_seeded += 1
        print(f"Configured variant {v.name} (ID: {v.id}) with {len(configs)} custom finishes.")
    except VehicleVariant.DoesNotExist:
        print(f"Variant ID {v_id} does not exist.")

print(f"Seeding completed! Added {total_seeded} vehicle colour configs.")
