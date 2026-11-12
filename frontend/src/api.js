const API_BASE = '/api';

export const api = {
  // Products
  async getProducts() {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
    return data;
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Failed to fetch product ${id}`);
    return data;
  },

  async createProduct(role, productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
      },
      body: JSON.stringify({ ...productData, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register product');
    return data;
  },

  async transferProduct(role, id, transferData) {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
      },
      body: JSON.stringify({ ...transferData, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to transfer product');
    return data;
  },

  async updateLocation(role, id, location) {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}/location`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
      },
      body: JSON.stringify({ location, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update location');
    return data;
  },

  async getProductHistory(id) {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}/history`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch product history');
    return data;
  },

  // Blockchain
  async getTransactions() {
    const res = await fetch(`${API_BASE}/blockchain/transactions`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch transactions');
    return data;
  },

  async getNetworkStatus() {
    const res = await fetch(`${API_BASE}/blockchain/status`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to check network status');
    return data;
  },
};
