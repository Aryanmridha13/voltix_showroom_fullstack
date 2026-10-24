import os
from PIL import Image
from rembg import remove, new_session

upload_dir = r"C:\Users\Lenovo\.gemini\antigravity-ide\brain\69433ec1-2f0d-4617-9120-cce88843b208\.user_uploaded"
backend_out_dir = r"c:\Users\Lenovo\Desktop\task\backend\media\vehicles\variants"
frontend_out_dir = r"c:\Users\Lenovo\Desktop\task\frontend\public\vehicles"

os.makedirs(backend_out_dir, exist_ok=True)
os.makedirs(frontend_out_dir, exist_ok=True)

images_map = {
    "media_1792746353550.jpg": "re_continental_gt650.png",
    "media_1792746353732.jpg": "ducati_panigale_899.png",
    "media_1792746353853.jpg": "bmw_s1000rr.png",
    "media_1792746353926.jpg": "ktm_rc_390.png",
    "media_1792746353942.jpg": "re_classic_350.png",
}

session = new_session("u2net")

for src_name, out_filename in images_map.items():
    src_path = os.path.join(upload_dir, src_name)
    print(f"Processing {src_name} -> {out_filename}...")
    
    with Image.open(src_path) as img:
        # Remove background with alpha matting
        out_img = remove(
            img,
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=5
        )
        
        # Crop tight bounding box around the vehicle with slight padding
        bbox = out_img.getbbox()
        if bbox:
            pad = 20
            w, h = out_img.size
            crop_box = (
                max(0, bbox[0] - pad),
                max(0, bbox[1] - pad),
                min(w, bbox[2] + pad),
                min(h, bbox[3] + pad)
            )
            cropped = out_img.crop(crop_box)
        else:
            cropped = out_img
            
        # Save high quality PNG
        back_dest = os.path.join(backend_out_dir, out_filename)
        front_dest = os.path.join(frontend_out_dir, out_filename)
        
        cropped.save(back_dest, "PNG", optimize=True)
        cropped.save(front_dest, "PNG", optimize=True)
        print(f"  Saved to {back_dest} ({cropped.size})")

print("All vehicle images processed successfully!")
