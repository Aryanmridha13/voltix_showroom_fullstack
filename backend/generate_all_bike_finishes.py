import os
import numpy as np
from PIL import Image

output_dir_fe = '../frontend/public/vehicles/customizer'
output_dir_be = 'media/vehicles/customizer'
os.makedirs(output_dir_fe, exist_ok=True)
os.makedirs(output_dir_be, exist_ok=True)

def save_variant_image(im, filename):
    im.save(os.path.join(output_dir_fe, filename))
    im.save(os.path.join(output_dir_be, filename))
    print(f"Saved {filename}")

# -------------------------------------------------------------
# 1. DUCATI PANIGALE 899
# -------------------------------------------------------------
duc_src = Image.open('../frontend/public/vehicles/ducati_panigale_899.png').convert('RGBA')
save_variant_image(duc_src, 'ducati_corse_red.png')

d_arr = np.array(duc_src).astype(float)
dr, dg, db, da = d_arr[:,:,0], d_arr[:,:,1], d_arr[:,:,2], d_arr[:,:,3]
# Red fairings mask
d_red_mask = (da > 25) & (dr > 100) & (dr > dg * 1.4) & (dr > db * 1.4)
# Soft weight
d_weight = np.clip((dr - np.maximum(dg, db) * 1.4) / 50.0, 0, 1) * (da > 25)
d_weight = np.expand_dims(d_weight, -1)

# Ducati Arctic White
# Desaturate red and boost luminance to pearl/silk white
d_lum = (0.299 * dr + 0.587 * dg + 0.114 * db) / 255.0
white_val = np.clip(0.68 + d_lum * 0.28, 0, 0.98) * 255.0
white_rgb = np.stack([white_val, white_val * 0.99, white_val * 0.98], axis=-1)
duc_white_rgb = d_arr[:,:,:3] * (1 - d_weight) + white_rgb * d_weight
duc_white = np.dstack([np.clip(duc_white_rgb, 0, 255), da]).astype(np.uint8)
save_variant_image(Image.fromarray(duc_white), 'ducati_arctic_white.png')

# Ducati Dark Stealth
black_val = np.clip(d_lum * 0.32, 0.08, 0.35) * 255.0
black_rgb = np.stack([black_val, black_val, black_val * 1.05], axis=-1)
duc_black_rgb = d_arr[:,:,:3] * (1 - d_weight) + black_rgb * d_weight
duc_black = np.dstack([np.clip(duc_black_rgb, 0, 255), da]).astype(np.uint8)
save_variant_image(Image.fromarray(duc_black), 'ducati_dark_stealth.png')

# -------------------------------------------------------------
# 2. BMW S1000RR
# -------------------------------------------------------------
bmw_src = Image.open('../frontend/public/vehicles/bmw_s1000rr.png').convert('RGBA')
save_variant_image(bmw_src, 'bmw_msport_tricolour.png')

b_arr = np.array(bmw_src).astype(float)
br, bg, bb, ba = b_arr[:,:,0], b_arr[:,:,1], b_arr[:,:,2], b_arr[:,:,3]
# White and light fairings mask
b_light_fairing = (ba > 30) & (br > 150) & (bg > 150) & (bb > 150)
b_blue_red = (ba > 30) & ((bb > br * 1.3) | ((br > 140) & (bg < 80) & (bb < 80)))
b_fairing = b_light_fairing | b_blue_red
b_weight = b_fairing.astype(float)
b_weight = np.expand_dims(b_weight, -1)

# BMW Black Storm
b_lum = (0.299 * br + 0.587 * bg + 0.114 * bb) / 255.0
bmw_black_val = np.clip(b_lum * 0.28, 0.08, 0.35) * 255.0
bmw_black_rgb = np.stack([bmw_black_val, bmw_black_val, bmw_black_val * 1.05], axis=-1)
bmw_dark_rgb = b_arr[:,:,:3] * (1 - b_weight) + bmw_black_rgb * b_weight
bmw_dark = np.dstack([np.clip(bmw_dark_rgb, 0, 255), ba]).astype(np.uint8)
save_variant_image(Image.fromarray(bmw_dark), 'bmw_black_storm.png')

# BMW Passion Red
red_boost = np.stack([np.clip(b_lum * 1.4, 0, 1) * 230, b_lum * 0.15 * 255, b_lum * 0.15 * 255], axis=-1)
bmw_red_rgb = b_arr[:,:,:3] * (1 - b_weight) + red_boost * b_weight
bmw_red = np.dstack([np.clip(bmw_red_rgb, 0, 255), ba]).astype(np.uint8)
save_variant_image(Image.fromarray(bmw_red), 'bmw_passion_red.png')

# -------------------------------------------------------------
# 3. KTM RC 390
# -------------------------------------------------------------
ktm_src = Image.open('../frontend/public/vehicles/ktm_rc_390.png').convert('RGBA')
save_variant_image(ktm_src, 'ktm_factory_gp.png')

k_arr = np.array(ktm_src).astype(float)
kr, kg, kb, ka = k_arr[:,:,0], k_arr[:,:,1], k_arr[:,:,2], k_arr[:,:,3]
# White side cowl mask (where KTM logo is)
k_white_fairing = (ka > 30) & (kr > 170) & (kg > 170) & (kb > 170)
k_lum = (0.299 * kr + 0.587 * kg + 0.114 * kb) / 255.0

# KTM Stealth Carbon & Orange (white cowl turns carbon dark, orange stays bright)
k_dark_val = np.clip(k_lum * 0.25, 0.05, 0.3) * 255.0
k_dark_rgb = np.stack([k_dark_val, k_dark_val, k_dark_val * 1.05], axis=-1)
k_weight_white = np.expand_dims(k_white_fairing.astype(float), -1)
ktm_stealth_rgb = k_arr[:,:,:3] * (1 - k_weight_white) + k_dark_rgb * k_weight_white
ktm_stealth = np.dstack([np.clip(ktm_stealth_rgb, 0, 255), ka]).astype(np.uint8)
save_variant_image(Image.fromarray(ktm_stealth), 'ktm_stealth_carbon.png')

# KTM Arctic Whiteout & GP Orange (orange upper cowl turns white)
k_orange_mask = (ka > 30) & (kr > 160) & (kg > 60) & (kg < kr * 0.75) & (kb < 80)
# Top half only (keep lower orange and rims)
h, w, _ = k_arr.shape
y_idx, _ = np.mgrid[0:h, 0:w]
k_upper_orange = k_orange_mask & (y_idx < h * 0.45)
k_upper_weight = np.expand_dims(k_upper_orange.astype(float), -1)
k_whiteout_val = np.clip(0.72 + k_lum * 0.25, 0, 0.98) * 255.0
k_whiteout_rgb = np.stack([k_whiteout_val, k_whiteout_val, k_whiteout_val], axis=-1)
ktm_whiteout_rgb = k_arr[:,:,:3] * (1 - k_upper_weight) + k_whiteout_rgb * k_upper_weight
ktm_whiteout = np.dstack([np.clip(ktm_whiteout_rgb, 0, 255), ka]).astype(np.uint8)
save_variant_image(Image.fromarray(ktm_whiteout), 'ktm_arctic_white.png')

# KTM Pure Racing Orange Monotone (white cowl turns orange)
k_orange_paint = np.stack([k_lum * 255, k_lum * 95, k_lum * 15], axis=-1)
ktm_pure_rgb = k_arr[:,:,:3] * (1 - k_weight_white) + k_orange_paint * k_weight_white
ktm_pure = np.dstack([np.clip(ktm_pure_rgb, 0, 255), ka]).astype(np.uint8)
save_variant_image(Image.fromarray(ktm_pure), 'ktm_racing_orange.png')

# -------------------------------------------------------------
# 4. RE CONTINENTAL GT 650
# -------------------------------------------------------------
re_src = Image.open('../frontend/public/vehicles/re_continental_gt650.png').convert('RGBA')
save_variant_image(re_src, 're_gt650_chrome.png')

r_arr = np.array(re_src).astype(float)
rr, rg, rb, ra = r_arr[:,:,0], r_arr[:,:,1], r_arr[:,:,2], r_arr[:,:,3]
# Fuel tank and rear seat cowl mask
h, w, _ = r_arr.shape
y_idx, x_idx = np.mgrid[0:h, 0:w]
r_tank_area = (ra > 30) & (y_idx > h * 0.22) & (y_idx < h * 0.48) & (x_idx > w * 0.28) & (x_idx < w * 0.72) & (rr > 120) & (rg > 120) & (rb > 120)
r_weight = np.expand_dims(r_tank_area.astype(float), -1)
r_lum = (0.299 * rr + 0.587 * rg + 0.114 * rb) / 255.0

# British Racing Green
re_green_val = np.stack([r_lum * 15, r_lum * 120, r_lum * 40], axis=-1)
re_green_rgb = r_arr[:,:,:3] * (1 - r_weight) + re_green_val * r_weight
re_green = np.dstack([np.clip(re_green_rgb, 0, 255), ra]).astype(np.uint8)
save_variant_image(Image.fromarray(re_green), 're_gt650_green.png')

# Dux Deluxe Jet Black
re_black_val = np.stack([r_lum * 50, r_lum * 50, r_lum * 55], axis=-1)
re_black_rgb = r_arr[:,:,:3] * (1 - r_weight) + re_black_val * r_weight
re_black = np.dstack([np.clip(re_black_rgb, 0, 255), ra]).astype(np.uint8)
save_variant_image(Image.fromarray(re_black), 're_gt650_black.png')

# -------------------------------------------------------------
# 5. RE CLASSIC 350
# -------------------------------------------------------------
cl_src = Image.open('../frontend/public/vehicles/re_classic_350.png').convert('RGBA')
save_variant_image(cl_src, 're_classic350_red.png')

c_arr = np.array(cl_src).astype(float)
cr, cg, cb, ca = c_arr[:,:,0], c_arr[:,:,1], c_arr[:,:,2], c_arr[:,:,3]
# Red tank and side panel mask
c_red_mask = (ca > 30) & (cr > 100) & (cr > cg * 1.3) & (cr > cb * 1.3)
c_weight = np.expand_dims(c_red_mask.astype(float), -1)
c_lum = (0.299 * cr + 0.587 * cg + 0.114 * cb) / 255.0

# Desert Sand
sand_val = np.stack([c_lum * 210, c_lum * 190, c_lum * 140], axis=-1)
cl_sand_rgb = c_arr[:,:,:3] * (1 - c_weight) + sand_val * c_weight
cl_sand = np.dstack([np.clip(cl_sand_rgb, 0, 255), ca]).astype(np.uint8)
save_variant_image(Image.fromarray(cl_sand), 're_classic350_desert.png')

# Forest Green
forest_val = np.stack([c_lum * 45, c_lum * 110, c_lum * 40], axis=-1)
cl_forest_rgb = c_arr[:,:,:3] * (1 - c_weight) + forest_val * c_weight
cl_forest = np.dstack([np.clip(cl_forest_rgb, 0, 255), ca]).astype(np.uint8)
save_variant_image(Image.fromarray(cl_forest), 're_classic350_green.png')

print("All motorcycle finishes generated successfully!")
