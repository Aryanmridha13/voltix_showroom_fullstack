import api from './api';

export const partsService = {
  // Fetch active spare part categories (Batteries, Braking, Tyres, Motors, Electricals)
  async getCategories() {
    const response = await api.get('/parts/categories/');
    return response.data?.data || response.data?.results || response.data || [];
  },

  // Fetch paginated, filtered spare parts inventory
  async getParts(params = {}) {
    const response = await api.get('/parts/items/', { params });
    const payload = response.data;
    return {
      items: payload?.data || payload?.results || [],
      meta: payload?.meta || {
        total_records: payload?.count || 0,
        page: 1,
        total_pages: 1,
      },
    };
  },

  // Fetch full details of an individual spare part
  async getPartById(id) {
    const response = await api.get(`/parts/items/${id}/`);
    return response.data?.data || response.data;
  },

  // Fetch low-stock alert parts (Admin restricted)
  async getLowStockParts() {
    const response = await api.get('/parts/items/low-stock/');
    return response.data?.data || response.data?.results || [];
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
