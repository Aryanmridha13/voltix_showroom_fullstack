import api from './api';

export const adminService = {
  // Aggregate KPI summary for the admin command center
  async getDashboardMetrics() {
    try {
      const [partsRes, lowStockRes, bookingsRes, reviewsRes, variantsRes] = await Promise.all([
        api.get('/parts/items/'),
        api.get('/parts/items/low-stock/'),
        api.get('/bookings/'),
        api.get('/reviews/', { params: { moderation_status: 'PENDING' } }),
        api.get('/vehicles/variants/'),
      ]);

      const allBookings = bookingsRes.data?.data || bookingsRes.data?.results || [];
      const pendingBookings = allBookings.filter((b) => b.status === 'PENDING');
      const lowStockItems = lowStockRes.data?.data || lowStockRes.data?.results || lowStockRes.data || [];
      const pendingReviews = reviewsRes.data?.data || reviewsRes.data?.results || [];
      const totalVehicles = variantsRes.data?.meta?.total_records || variantsRes.data?.data?.length || 0;

      return {
        totalVehicles,
        lowStockCount: lowStockItems.length,
        pendingBookingsCount: pendingBookings.length,
        totalBookingsCount: allBookings.length,
        pendingReviewsCount: pendingReviews.length,
        lowStockItems,
      };
    } catch (err) {
      console.error('Error fetching admin dashboard metrics:', err);
      throw err;
    }
  },

  // Inventory Management
  async getInventory(params = {}) {
    const response = await api.get('/parts/items/', { params });
    const payload = response.data;
    return {
      items: payload?.data || payload?.results || [],
      meta: payload?.meta || { total_records: payload?.count || 0 },
    };
  },

  async adjustStock(partId, { action, quantity, reason }) {
    const response = await api.post(`/parts/items/${partId}/adjust-stock/`, {
      action,
      quantity: Number(quantity),
      reason: reason || 'Showroom stock adjustment',
    });
    return response.data?.data || response.data;
  },

  // Test Ride Bookings Management
  async getAllBookings(params = {}) {
    const response = await api.get('/bookings/', { params });
    const payload = response.data;
    return {
      items: payload?.data || payload?.results || [],
      meta: payload?.meta || { total_records: payload?.count || 0 },
    };
  },

  async updateBookingStatus(bookingId, { status, admin_notes }) {
    const response = await api.patch(`/bookings/${bookingId}/update-status/`, {
      status,
      admin_notes: admin_notes || '',
    });
    return response.data?.data || response.data;
  },

  // Customer Reviews Moderation
  async getReviews(params = {}) {
    const response = await api.get('/reviews/', { params });
    const payload = response.data;
    return {
      items: payload?.data || payload?.results || [],
      meta: payload?.meta || { total_records: payload?.count || 0 },
    };
  },

  async moderateReview(reviewId, { status, notes }) {
    const response = await api.patch(`/reviews/${reviewId}/moderate/`, {
      status,
      notes: notes || '',
    });
    return response.data?.data || response.data;
  },
};
