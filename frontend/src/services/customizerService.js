import api from './api';

export const customizerService = {
  // Fetch available color options and images for a variant
  async getOptions(variantId) {
    const response = await api.get(`/customizer/variants/${variantId}/options/`);
    return response.data?.data || response.data;
  },

  // Authoritative dynamic price calculation
  async calculatePrice(variantId, combinationId) {
    const response = await api.post('/customizer/calculate-price/', {
      variant_id: variantId,
      combination_id: combinationId,
    });
    return response.data?.data || response.data;
  },
};

export default customizerService;
