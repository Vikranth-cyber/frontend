// api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const registerUser = async (username, password, isManufacturer) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
      is_manufacturer: isManufacturer
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }
  
  return await response.json();
};

export const loginUser = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  return await response.json();
};

export const scanProduct = async (productData) => {
  const response = await fetch(`${API_URL}/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productData.product_id,
      name: productData.name,
      phone: productData.phone,
      pincode: productData.pincode
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Scan failed');
  }
  
  return await response.json();
};

export const fetchProducts = async (token) => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch products');
  }
  
  return await response.json();
};

export const fetchScans = async (token) => {
  const response = await fetch(`${API_URL}/scans`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch scans');
  }
  
  return await response.json();
};

export const fetchNotifications = async (token) => {
  const response = await fetch(`${API_URL}/notifications`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch notifications');
  }
  
  return await response.json();
};