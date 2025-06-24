// API service for Billiard Cafe POS
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Billiard API methods
  async getReservations() {
    return this.request('/billiard/reservations');
  }

  async createReservation(reservationData) {
    return this.request('/billiard/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  }

  async updateReservationStatus(reservationId, status) {
    return this.request('/billiard/reservations/status', {
      method: 'PATCH',
      body: JSON.stringify({ reservation_id: reservationId, status }),
    });
  }

  async deleteReservation(reservationId) {
    return this.request(`/billiard/reservations/${reservationId}`, {
      method: 'DELETE',
    });
  }

  // Cafe API methods
  async getMenuItems() {
    return this.request('/cafe/menu');
  }

  async createMenuItems(menuData) {
    return this.request('/cafe/menu', {
      method: 'POST',
      body: JSON.stringify(menuData),
    });
  }

  async getOrders() {
    return this.request('/cafe/orders');
  }

  async createOrder(orderData) {
    return this.request('/cafe/order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/cafe/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // ESP32 API methods
  async getLights() {
    return this.request('/esp32/lights');
  }

  async controlLight(lightId, action) {
    return this.request(`/esp32/light/${lightId}`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async updateLightBrightness(lightId, brightness) {
    return this.request(`/esp32/lights/${lightId}/brightness`, {
      method: 'PATCH',
      body: JSON.stringify({ brightness }),
    });
  }

  async applyLightPreset(preset) {
    return this.request('/esp32/lights/preset', {
      method: 'POST',
      body: JSON.stringify({ preset }),
    });
  }

  async getESP32Status() {
    return this.request('/esp32/status');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();

