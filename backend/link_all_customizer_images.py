import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.customizer.models import VehicleColourConfig

# Mapping by combination name substrings and/or variant
configs = VehicleColourConfig.objects.select_related('variant', 'combination')

updated_count = 0
for cfg in configs:
    v_id = cfg.variant_id
    c_name = cfg.combination.name.lower()
    
    if v_id == 19: # Suzuki Access 125
        img_path = 'vehicles/customizer/suzuki_access_125_green.png'
    elif v_id == 20: # Vespa VXL 125
        img_path = 'vehicles/customizer/vespa_vxl_125_yellow.png'
    elif v_id == 21: # Honda Activa 125
        img_path = 'vehicles/customizer/honda_activa_125_blue.png'
    elif v_id == 17: # Honda CB300R
        img_path = 'vehicles/customizer/honda_cb300r_red.png'
    elif v_id == 18: # Yamaha MT-15 V2
        img_path = 'vehicles/customizer/yamaha_mt15_cyan.png'
    elif v_id == 15: # KTM RC 390
        if 'gp' in c_name:
            img_path = 'vehicles/customizer/ktm_factory_gp.png'
        elif 'stealth' in c_name or 'carbon' in c_name:
            img_path = 'vehicles/customizer/ktm_stealth_carbon.png'
        elif 'whiteout' in c_name or 'arctic' in c_name:
            img_path = 'vehicles/customizer/ktm_arctic_white.png'
        elif 'pure' in c_name or 'monotone' in c_name:
            img_path = 'vehicles/customizer/ktm_racing_orange.png'
    elif v_id == 14: # BMW S1000RR
        if 'm-sport' in c_name or 'tricolour' in c_name:
            img_path = 'vehicles/customizer/bmw_msport_tricolour.png'
        elif 'black' in c_name:
            img_path = 'vehicles/customizer/bmw_black_storm.png'
        elif 'red' in c_name or 'passion' in c_name:
            img_path = 'vehicles/customizer/bmw_passion_red.png'
    elif v_id == 13: # Ducati Panigale 899
        if 'corse' in c_name or 'red' in c_name and 'monotone' in c_name:
            img_path = 'vehicles/customizer/ducati_corse_red.png'
        elif 'white' in c_name or 'silk' in c_name:
            img_path = 'vehicles/customizer/ducati_arctic_white.png'
        elif 'stealth' in c_name or 'dark' in c_name:
            img_path = 'vehicles/customizer/ducati_dark_stealth.png'
    elif v_id == 12: # RE Continental GT 650
        if 'clean' in c_name or 'chrome' in c_name:
            img_path = 'vehicles/customizer/re_gt650_chrome.png'
        elif 'green' in c_name:
            img_path = 'vehicles/customizer/re_gt650_green.png'
        elif 'black' in c_name or 'dux' in c_name:
            img_path = 'vehicles/customizer/re_gt650_black.png'
    elif v_id == 16: # RE Classic 350
        if 'red' in c_name or 'crimson' in c_name:
            img_path = 'vehicles/customizer/re_classic350_red.png'
        elif 'sand' in c_name or 'desert' in c_name:
            img_path = 'vehicles/customizer/re_classic350_desert.png'
        elif 'green' in c_name or 'forest' in c_name:
            img_path = 'vehicles/customizer/re_classic350_green.png'
    elif v_id == 10: # X3 High-Speed Scooter
        if 'blue' in c_name:
            img_path = 'vehicles/customizer/x3_electric_blue.png'
        elif 'black' in c_name:
            img_path = 'vehicles/customizer/x3_jet_black.png'
        elif 'red' in c_name:
            img_path = 'vehicles/customizer/x3_crimson_red.png'
        elif 'grey' in c_name or 'metallic' in c_name:
            img_path = 'vehicles/customizer/x3_metallic_grey.png'
    elif v_id in (4, 5, 6): # MG Pro Models (Variants 4, 5, 6)
        if 'red' in c_name:
            img_path = 'vehicles/customizer/mgpro_crimson_red.png'
        elif 'black' in c_name:
            img_path = 'vehicles/customizer/mgpro_jet_black.png'
        elif 'blue' in c_name:
            img_path = 'vehicles/customizer/mgpro_electric_blue.png'
        elif 'white' in c_name:
            img_path = 'vehicles/customizer/mgpro_pearl_white.png'
    elif v_id in (7, 8): # Ranger Cruiser Bikes (Variants 7, 8)
        if 'black' in c_name:
            img_path = 'vehicles/customizer/ranger_bike_black.png'
    elif v_id == 9: # MX16 Cruiser Bike (Variant 9)
        if 'black' in c_name:
            img_path = 'vehicles/customizer/mx16_bike_black.png'
    elif v_id == 11: # CAT 3.0 Cargo Vehicle (Variant 11)
        if 'black' in c_name:
            img_path = 'vehicles/customizer/cat_cargo_black.png'
    else: # Scooters (Variants 1-11)
        if 'crimson red monotone' in c_name:
            img_path = 'vehicles/customizer/scooter_crimson_red.png'
        elif 'pearl white monotone' in c_name:
            img_path = 'vehicles/customizer/scooter_pearl_white.png'
        elif 'jet black monotone' in c_name:
            img_path = 'vehicles/customizer/scooter_jet_black.png'
        elif 'electric blue monotone' in c_name:
            img_path = 'vehicles/customizer/scooter_electric_blue.png'
        elif 'pearl white & electric blue' in c_name:
            img_path = 'vehicles/customizer/scooter_pearl_white_electric_blue.png'
        elif 'crimson red & jet black' in c_name:
            img_path = 'vehicles/customizer/scooter_crimson_red_jet_black.png'
        elif 'jet black & metallic grey' in c_name:
            img_path = 'vehicles/customizer/scooter_jet_black_metallic_grey.png'
        elif 'metallic grey' in c_name or 'grey' in c_name:
            img_path = 'vehicles/customizer/scooter_metallic_grey.png'

    if img_path:
        cfg.image = img_path
        cfg.save(update_fields=['image'])
        updated_count += 1

print(f"Successfully linked {updated_count} VehicleColourConfig instances to exact vehicle finish images!")
