import api from './api';

export const vehicleService = {
  // Fetch active vehicle categories
  async getCategories() {
    const response = await api.get('/vehicles/categories/');
    return response.data?.data || response.data?.results || response.data;
  },

  // Fetch paginated, filtered vehicle variants
  async getVariants(params = {}) {
    const response = await api.get('/vehicles/variants/', { params });
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

  // Fetch complete details for a single variant (specs, images)
  async getVariantById(id) {
    const response = await api.get(`/vehicles/variants/${id}/`);
    return response.data?.data || response.data;
  },

  // Fetch rating statistics for a variant
  async getVariantStats(id) {
    try {
      const response = await api.get(`/reviews/variant/${id}/stats/`);
      return response.data;
    } catch {
      return {
        total_reviews: 0,
        average_rating: 0.0,
        verified_riders_count: 0,
        rating_distribution: { "5_star": 0, "4_star": 0, "3_star": 0, "2_star": 0, "1_star": 0 },
        percentage_distribution: { "5_star": 0, "4_star": 0, "3_star": 0, "2_star": 0, "1_star": 0 },
      };
    }
  },

  // Fetch approved customer reviews for a variant
  async getVariantReviews(id) {
    try {
      const response = await api.get('/reviews/', { params: { variant: id } });
      return response.data?.data || response.data?.results || [];
    } catch {
      return [];
    }
  },

  // Submit a customer review
  async submitReview(reviewData) {
    const response = await api.post('/reviews/', reviewData);
    return response.data?.data || response.data;
  },
};

export default vehicleService;
