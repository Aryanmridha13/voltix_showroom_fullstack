import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.customizer.models import VehicleColourConfig

# Mapping combination_id -> relative image path in media/vehicles/customizer/
combo_images = {
    1: 'vehicles/customizer/scooter_crimson_red.png',
    2: 'vehicles/customizer/scooter_pearl_white.png',
    3: 'vehicles/customizer/scooter_jet_black.png',
    4: 'vehicles/customizer/scooter_electric_blue.png',
    5: 'vehicles/customizer/scooter_pearl_white_electric_blue.png',
    6: 'vehicles/customizer/scooter_crimson_red_jet_black.png',
    7: 'vehicles/customizer/scooter_jet_black_metallic_grey.png',
}

updated = 0
for config in VehicleColourConfig.objects.all():
    cid = config.combination_id
    if cid in combo_images:
        config.image = combo_images[cid]
        config.save(update_fields=['image'])
        updated += 1

print(f"Updated {updated} VehicleColourConfig instances with exact scooter finish images!")
