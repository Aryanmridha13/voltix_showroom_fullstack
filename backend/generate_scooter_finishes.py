import os
import numpy as np
from PIL import Image

def rgb_to_hsv(rgb):
    """Vectorized RGB (0..1) to HSV (0..1)"""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    maxc = np.maximum(np.maximum(r, g), b)
    minc = np.minimum(np.minimum(r, g), b)
    v = maxc
    deltac = maxc - minc
    
    s = np.zeros_like(v)
    non_zero = maxc != 0
    s[non_zero] = deltac[non_zero] / maxc[non_zero]
    
    h = np.zeros_like(v)
    rc = (maxc - r) / (deltac + 1e-7)
    gc = (maxc - g) / (deltac + 1e-7)
    bc = (maxc - b) / (deltac + 1e-7)
    
    mask_r = (r == maxc) & (deltac != 0)
    mask_g = (g == maxc) & (r != maxc) & (deltac != 0)
    mask_b = (b == maxc) & (r != maxc) & (g != maxc) & (deltac != 0)
    
    h[mask_r] = bc[mask_r] - gc[mask_r]
    h[mask_g] = 2.0 + rc[mask_g] - bc[mask_g]
    h[mask_b] = 4.0 + gc[mask_b] - rc[mask_b]
    h = (h / 6.0) % 1.0
    
    return np.stack([h, s, v], axis=-1)

def hsv_to_rgb(hsv):
    """Vectorized HSV (0..1) to RGB (0..1)"""
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    i = (h * 6.0).astype(int)
    f = (h * 6.0) - i
    p = v * (1.0 - s)
    q = v * (1.0 - s * f)
    t = v * (1.0 - s * (1.0 - f))
    i = i % 6
    
    rgb = np.zeros_like(hsv)
    
    m0 = (i == 0)
    rgb[m0] = np.stack([v[m0], t[m0], p[m0]], axis=-1)
    m1 = (i == 1)
    rgb[m1] = np.stack([q[m1], v[m1], p[m1]], axis=-1)
    m2 = (i == 2)
    rgb[m2] = np.stack([p[m2], v[m2], t[m2]], axis=-1)
    m3 = (i == 3)
    rgb[m3] = np.stack([p[m3], q[m3], v[m3]], axis=-1)
    m4 = (i == 4)
    rgb[m4] = np.stack([t[m4], p[m4], v[m4]], axis=-1)
    m5 = (i == 5)
    rgb[m5] = np.stack([v[m5], p[m5], q[m5]], axis=-1)
    
    return rgb

# Load source scooter
src_path = '../frontend/public/vehicles/scooter_blue.png'
im = Image.open(src_path).convert('RGBA')
arr = np.array(im).astype(float)
rgb = arr[:, :, :3] / 255.0
alpha = arr[:, :, 3]

# Compute HSV
hsv = rgb_to_hsv(rgb)
h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]

# Identify the painted blue fairings
# Blue hue is approx 0.53 to 0.65 (190° - 235°)
# Saturation > 0.25, brightness > 0.15, alpha > 30
blue_mask = (alpha > 30) & (h >= 0.51) & (h <= 0.67) & (s > 0.22) & (v > 0.15)
# Soften mask edges by smooth weight
weight = np.clip((s - 0.2) / 0.3, 0, 1) * np.clip((1 - np.abs(h - 0.58) / 0.12), 0, 1) * (alpha > 30)
weight = np.expand_dims(weight, -1)

output_dir_fe = '../frontend/public/vehicles/customizer'
output_dir_be = 'media/vehicles/customizer'
os.makedirs(output_dir_fe, exist_ok=True)
os.makedirs(output_dir_be, exist_ok=True)

# 1. Crimson Red Monotone
hsv_red = hsv.copy()
# Red hue: ~0.99 / 0.01 (Crimson Red #E62E2D)
hsv_red[..., 0] = 0.99
hsv_red[..., 1] = np.clip(hsv_red[..., 1] * 1.15, 0, 1)
hsv_red[..., 2] = np.clip(hsv_red[..., 2] * 0.95, 0, 1)
rgb_red = hsv_to_rgb(hsv_red)
final_red = (rgb * (1 - weight) + rgb_red * weight)
res_red = np.dstack([np.clip(final_red * 255, 0, 255), alpha]).astype(np.uint8)
Image.fromarray(res_red).save(f"{output_dir_fe}/scooter_crimson_red.png")
Image.fromarray(res_red).save(f"{output_dir_be}/scooter_crimson_red.png")

# 2. Electric Blue Monotone (Original blue, saved to customizer path for consistency)
im.save(f"{output_dir_fe}/scooter_electric_blue.png")
im.save(f"{output_dir_be}/scooter_electric_blue.png")

# 3. Pearl White Monotone
hsv_white = hsv.copy()
# Desaturate and boost lightness with metallic gradient
hsv_white[..., 1] = np.clip(hsv_white[..., 1] * 0.06, 0, 1)
hsv_white[..., 2] = np.clip(0.65 + hsv_white[..., 2] * 0.32, 0, 0.98)
rgb_white = hsv_to_rgb(hsv_white)
final_white = (rgb * (1 - weight) + rgb_white * weight)
res_white = np.dstack([np.clip(final_white * 255, 0, 255), alpha]).astype(np.uint8)
Image.fromarray(res_white).save(f"{output_dir_fe}/scooter_pearl_white.png")
Image.fromarray(res_white).save(f"{output_dir_be}/scooter_pearl_white.png")

# 4. Jet Black Monotone
hsv_black = hsv.copy()
# Desaturate and deepen to metallic obsidian
hsv_black[..., 1] = np.clip(hsv_black[..., 1] * 0.08, 0, 1)
hsv_black[..., 2] = np.clip(hsv_black[..., 2] * 0.28, 0.06, 0.38)
rgb_black = hsv_to_rgb(hsv_black)
final_black = (rgb * (1 - weight) + rgb_black * weight)
res_black = np.dstack([np.clip(final_black * 255, 0, 255), alpha]).astype(np.uint8)
Image.fromarray(res_black).save(f"{output_dir_fe}/scooter_jet_black.png")
Image.fromarray(res_black).save(f"{output_dir_be}/scooter_jet_black.png")

# 5. Metallic Grey Monotone
hsv_grey = hsv.copy()
hsv_grey[..., 1] = np.clip(hsv_grey[..., 1] * 0.05, 0, 1)
hsv_grey[..., 2] = np.clip(0.35 + hsv_grey[..., 2] * 0.35, 0.2, 0.72)
rgb_grey = hsv_to_rgb(hsv_grey)
final_grey = (rgb * (1 - weight) + rgb_grey * weight)
res_grey = np.dstack([np.clip(final_grey * 255, 0, 255), alpha]).astype(np.uint8)
Image.fromarray(res_grey).save(f"{output_dir_fe}/scooter_metallic_grey.png")
Image.fromarray(res_grey).save(f"{output_dir_be}/scooter_metallic_grey.png")

# 6. Pearl White & Electric Blue Dual-Tone
# Upper fairing & rear flank in Pearl White, front fender & headlamp shield in Electric Blue
h, w, _ = arr.shape
y_coords, x_coords = np.mgrid[0:h, 0:w]
# Lower/front part stays electric blue, upper body turns pearl white
is_blue_accent = (y_coords > h * 0.52) & (x_coords < w * 0.45)
dual_wb_weight = weight.copy()
dual_wb_weight[is_blue_accent] = 0
final_wb = (rgb * (1 - dual_wb_weight) + rgb_white * dual_wb_weight)
res_wb = np.dstack([np.clip(final_wb * 255, 0, 255), alpha]).astype(np.uint8)
Image.fromarray(res_wb).save(f"{output_dir_fe}/scooter_pearl_white_electric_blue.png")
Image.fromarray(res_wb).save(f"{output_dir_be}/scooter_pearl_white_electric_blue.png")

# 7. Crimson Red & Jet Black Dual-Tone
# Main body Crimson Red, lower belly fairing and rear flank Jet Black
is_black_accent = (y_coords > h * 0.55) | (x_coords > w * 0.58)
final_rb = final_red.copy()
final_rb[is_black_accent & (weight[..., 0] > 0.3)] = rgb_black[is_black_accent & (weight[..., 0] > 0.3)]
res_rb = np.dstack([np.clip(final_rb * 255, 0, 255), alpha]).astype(np.uint8)
Image.fromarray(res_rb).save(f"{output_dir_fe}/scooter_crimson_red_jet_black.png")
Image.fromarray(res_rb).save(f"{output_dir_be}/scooter_crimson_red_jet_black.png")

# 8. Jet Black & Metallic Grey Dual-Tone
final_bg = final_black.copy()
is_grey_accent = (y_coords < h * 0.5) & (x_coords < w * 0.5)
final_bg[is_grey_accent & (weight[..., 0] > 0.3)] = rgb_grey[is_grey_accent & (weight[..., 0] > 0.3)]
res_bg = np.dstack([np.clip(final_bg * 255, 0, 255), alpha]).astype(np.uint8)
Image.fromarray(res_bg).save(f"{output_dir_fe}/scooter_jet_black_metallic_grey.png")
Image.fromarray(res_bg).save(f"{output_dir_be}/scooter_jet_black_metallic_grey.png")

print("Generated all 8 realistic scooter color finish PNGs successfully!")
