/**
 * Utility to resolve accurate vehicle variant images.
 * Maps API media paths, relative URLs, or variant/model names to appropriate static vehicle images.
 */

const VEHICLE_FALLBACK_MAP = [
  // X-One Series
  { match: (v, m) => /graphene/i.test(v), src: '/vehicles/customizer/scooter_jet_black.png' },
  { match: (v, m) => /70\+/i.test(v) || /70\s*plus/i.test(v), src: '/vehicles/customizer/scooter_crimson_red.png' },
  { match: (v, m) => /85\+/i.test(v) || /85\s*plus/i.test(v), src: '/vehicles/customizer/scooter_electric_blue.png' },
  { match: (v, m) => /x-?one/i.test(v) || /x-?one/i.test(m), src: '/vehicles/customizer/scooter_jet_black.png' },

  // MG Pro Series
  { match: (v, m) => /mg\s*pro\s*li/i.test(v), src: '/vehicles/customizer/mgpro_jet_black.png' },
  { match: (v, m) => /mg\s*pro\s*\+/i.test(v) || /mg\s*pro\s*plus/i.test(v), src: '/vehicles/customizer/mgpro_electric_blue.png' },
  { match: (v, m) => /mg\s*pro/i.test(v) || /mg\s*pro/i.test(m), src: '/vehicles/customizer/mgpro_crimson_red.png' },

  // X3 Series
  { match: (v, m) => /x3/i.test(v) || /x3/i.test(m), src: '/vehicles/customizer/x3_electric_blue.png' },

  // Cargo & Utility
  { match: (v, m) => /cat/i.test(v) || /cargo/i.test(v) || /cat/i.test(m), src: '/vehicles/cat_cargo_black.png' },

  // Electric Bikes
  { match: (v, m) => /ranger/i.test(v) || /ranger/i.test(m), src: '/vehicles/ranger_bike_black.png' },
  { match: (v, m) => /mx16/i.test(v) || /mx16/i.test(m), src: '/vehicles/mx16_bike_black.png' },

  // Petrol Bikes & Scooters
  { match: (v, m) => /cb300r/i.test(v) || /cb300r/i.test(m), src: '/vehicles/honda_cb300r_red.png' },
  { match: (v, m) => /mt-?15/i.test(v) || /mt-?15/i.test(m), src: '/vehicles/yamaha_mt15_cyan.png' },
  { match: (v, m) => /access/i.test(v) || /access/i.test(m), src: '/vehicles/suzuki_access_125_green.png' },
  { match: (v, m) => /vespa/i.test(v) || /vespa/i.test(m), src: '/vehicles/vespa_vxl_125_yellow.png' },
  { match: (v, m) => /activa/i.test(v) || /activa/i.test(m), src: '/vehicles/honda_activa_125_blue.png' },
  { match: (v, m) => /gt\s*650/i.test(v) || /continental/i.test(v) || /gt\s*650/i.test(m), src: '/vehicles/re_continental_gt650.png' },
  { match: (v, m) => /classic\s*350/i.test(v) || /classic\s*350/i.test(m), src: '/vehicles/re_classic_350.png' },
  { match: (v, m) => /panigale/i.test(v) || /ducati/i.test(v) || /ducati/i.test(m), src: '/vehicles/ducati_panigale_899.png' },
  { match: (v, m) => /s1000rr/i.test(v) || /bmw/i.test(v) || /bmw/i.test(m), src: '/vehicles/bmw_s1000rr.png' },
  { match: (v, m) => /rc\s*390/i.test(v) || /ktm/i.test(v) || /ktm/i.test(m), src: '/vehicles/ktm_rc_390.png' },
];

/**
 * Resolves the vehicle image path.
 *
 * @param {string|null|undefined} imageUrl - The image URL from backend API.
 * @param {string|null|undefined} variantName - Name of the vehicle variant (e.g. "X-One Graphene", "X-One Lipo4 70+").
 * @param {string|null|undefined} modelName - Name of the vehicle model (e.g. "X-One", "MG Pro").
 * @returns {string} - Clean usable URL for <img> src.
 */
export function resolveVehicleImage(imageUrl, variantName = '', modelName = '') {
  // 1. If imageUrl is present, clean and normalize it
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
    let clean = imageUrl.trim();

    // If it's a full backend URL pointing to media
    if (clean.includes('/media/vehicles/')) {
      const subPath = clean.substring(clean.indexOf('/media/vehicles/') + '/media/'.length);
      return `/${subPath}`;
    }

    // If it's a relative media URL like "/media/vehicles/..."
    if (clean.startsWith('/media/vehicles/')) {
      return clean.replace('/media/vehicles/', '/vehicles/');
    }

    // If it already points to public assets
    if (clean.startsWith('/vehicles/')) {
      return clean;
    }

    // If it is another full URL, return it
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean;
    }

    // Relative path like "vehicles/..."
    if (clean.startsWith('vehicles/')) {
      return `/${clean}`;
    }
  }

  // 2. Fall back to name-based mapping
  const v = variantName || '';
  const m = modelName || '';

  for (const item of VEHICLE_FALLBACK_MAP) {
    if (item.match(v, m)) {
      return item.src;
    }
  }

  // Generic final fallback
  return '/vehicles/customizer/scooter_jet_black.png';
}

export default resolveVehicleImage;
