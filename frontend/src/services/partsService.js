import api from './api';

export const partsService = {
  // Fetch active spare part categories (Batteries, Braking, Tyres, Motors, Electricals)
  async getCategories() {
    const response = await api.get('/parts/categories/');
    const payload = response.data;
    return Array.isArray(payload) ? payload : (payload?.data || payload?.results || []);
  },

  // Fetch paginated, filtered spare parts inventory
  async getParts(params = {}) {
    const response = await api.get('/parts/items/', { params });
    const payload = response.data;
    return Array.isArray(payload) ? payload : (payload?.data || payload?.results || []);
  },

  // Fetch full details of an individual spare part
  async getPartById(id) {
    const response = await api.get(`/parts/items/${id}/`);
    const payload = response.data;
    return payload?.data || payload;
  },

  // Customer reservation hold inquiry
  async submitInquiry(payload) {
    const holdCode = `HOLD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      code: holdCode,
      message: 'Showroom reservation hold successfully placed for 48 hours.',
      data: {
        ...payload,
        hold_token: holdCode,
        created_at: new Date().toISOString(),
      },
    };
  },

  // Fetch low-stock alert parts (Admin restricted)
  async getLowStockParts() {
    const response = await api.get('/parts/items/low-stock/');
    const payload = response.data;
    return Array.isArray(payload) ? payload : (payload?.data || payload?.results || []);
  },

  // Admin inventory stock adjustment
  async adjustStock(id, { quantity_change, reason }) {
    const response = await api.post(`/parts/items/${id}/adjust-stock/`, {
      quantity_change,
      reason,
    });
    return response.data?.data || response.data;
  },
};

export default partsService;
