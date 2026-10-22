import api from './api';

export const bookingService = {
  // Query available slots for vehicle variant and date
  async getAvailableSlots(variantId, date) {
    const response = await api.get('/bookings/available-slots/', {
      params: { variant_id: variantId, date },
    });
    return response.data?.data || response.data;
  },

  // Submit a new test ride booking
  async createBooking(bookingData) {
    const response = await api.post('/bookings/', bookingData);
    return response.data?.data || response.data;
  },

  // Retrieve customer's bookings list
  async getMyBookings(params = {}) {
    const response = await api.get('/bookings/', { params });
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

  // Retrieve a single booking details
  async getBookingById(id) {
    const response = await api.get(`/bookings/${id}/`);
    return response.data?.data || response.data;
  },

  // Cancel an active booking
  async cancelBooking(id, cancellation_reason = 'Cancelled by customer') {
    const response = await api.patch(`/bookings/${id}/cancel/`, {
      cancellation_reason,
    });
    return response.data?.data || response.data;
  },
};

export default bookingService;
