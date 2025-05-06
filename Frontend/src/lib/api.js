import axios from 'axios';

// Configure the API base URL to point to your backend server
// Change this to your backend URL
// For development, use the localhost URL; for production use relative path
const isDevelopment = import.meta.env.DEV;
const baseURL = isDevelopment 
  ? 'https://fooddeliverysystem-production.up.railway.app:8186/api'  // Updated to match Spring Boot default port
  : '/api';  // Production - change to your deployed backend URL if needed

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Includes cookies in requests
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  // services/auth.ts
// auth.ts
login: async (username, password) => { 
  try {
    const response = await api.post('/auth/login', { username, password });

    const { user, token } = response.data;
    return { user, token };
  } catch (error) {
    if (error instanceof Error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      }
      throw new Error('Login failed');
    }
    throw new Error('Unknown error occurred');
  }
}
,
  
  register: async (username,email, password,role) => {
    // Updated to match AuthController.register
    const response = await api.post('/auth/register', { 
      username, // Using email as username
      email,
      password,
      role
    });
    console.log(response.data);
    return response.data;
  },
  logout: async () => {
    localStorage.removeItem('token');
  },
  
    getAll: async () => {
      const response = await api.get('/auth/users');
      return response.data;
    
  }
  
};

export const users = {
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await api.put(`/users/update/${id}`, data);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/users/delete/${id}`);
    return response.data;
  },
};

export const food = {
  getAll: async () => {
    // Matches FoodItemController.getAll
    const response = await api.get('/food/all');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/food/${id}`);
    return response.data;
  },
  add: async (foodItem) => {
    // Matches FoodItemController.addFood
    const response = await api.post('/food/add', foodItem);
    return response.data;
  },
  update: async (id, foodItem) => {
    const response = await api.put(`/food/update/${id}`, foodItem);
    return response.data;
  },
  delete: async (id) => {
    // Matches FoodItemController.deleteFood
    const response = await api.delete(`/food/delete/${id}`);
    return response.data;
  },
};

export const cart = {
  get: async (userId) => {
    // Updated to match CartController.getCartItems
    const response = await api.get(`/cart/items/${userId}`);
    return response.data;
  },
  add: async (userId, foodItemId) => {
    // Updated to match CartController.addToCart which uses query params
    const response = await api.post(`/cart/add?userId=${userId}&foodItemId=${foodItemId}`);
    return response.data;
  },
  remove: async (userId, foodItemId) => {
    // Updated to match CartController.removeFromCart which uses query params
    const response = await api.post(`/cart/remove?userId=${userId}&foodItemId=${foodItemId}`);
    return response.data;
  },
  clear: async (userId) => {
    const response = await api.post(`/cart/clear/${userId}`);
    return response.data;
  },
  checkout: async (userId) => {
    // This should be implemented using OrderController.placeOrder
    const response = await api.post(`/orders/place/${userId}`);
    return response.data;
  },
};

export const orders = {
  getAll: async () => {
    // Matches OrderController.getAllOrders
    const response = await api.get('/orders/');
    return response.data;
  },
  getById: async (orderId) => {
    // Matches OrderController.getOrderById
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  getByUser: async (userId) => {
    // Matches OrderController.getOrdersByUserId
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },
  place: async (userId) => {
    // Matches OrderController.placeOrder
    const response = await api.post(`/orders/place/${userId}`);
    return response.data;
  },
  updateStatus: async (orderId, status) => {
    // Matches OrderController.updateOrderStatus
    const response = await api.put(`/orders/update-status/${orderId}`, null, {
      params: { status }
    });
    return response.data;
  },
  cancel: async (orderId) => {
    // Uses OrderController.deleteOrder
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },

};

// The remaining API sections might need to be updated once their corresponding
// backend controllers are implemented

export const admin = {
  getAllFoodItems: async () => {
    // Can use the standard food controller for now
    const response = await api.get('/food/all');
    return response.data;
  },
  addFoodItem: async (foodItem) => {
    const response = await api.post('/food/add', foodItem);
    return response.data;
  },
  updateFoodItem: async (id, foodItem) => {
    const response = await api.put(`/food/update/${id}`, foodItem);
    return response.data;
  },
  deleteFoodItem: async (id) => {
    const response = await api.delete(`/food/delete/${id}`);
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/admin/users/all');
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/user/delete/${id}`);
    return response.data;
  },
};

export const payment = {
  charge: async (orderId, paymentDetails) => {
    const response = await api.post('/payment/charge', { orderId, ...paymentDetails });
    return response.data;
  },
  getStatus: async (orderId) => {
    const response = await api.get(`/payment/status/${orderId}`);
    return response.data;
  },
};

export const reviews = {
  getByFoodItem: async (foodItemId) => {
    const response = await api.get(`/reviews/${foodItemId}`);
    return response.data;
  },
  add: async (userId, foodItemId, content, rating) => {
    const response = await api.post('/reviews/add', { userId, foodItemId, content, rating });
    return response.data;
  },
  delete: async (reviewId) => {
    const response = await api.delete(`/reviews/delete/${reviewId}`);
    return response.data;
  },
};

export const categories = {
  getAll: async () => {
    const response = await api.get('/categories/all');
    return response.data;
  },
  add: async (category) => {
    const response = await api.post('/categories/add', category);
    return response.data;
  },
  update: async (id, category) => {
    const response = await api.put(`/categories/update/${id}`, category);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/categories/delete/${id}`);
    return response.data;
  },
};

export const address = {
  getByUser: async (userId) => {
    const response = await api.get(`/customerdetails/user/${userId}`);
    console.log(response.data);
    return response.data;
  },
  add: async (addressData,userId) => {
    console.log(addressData,userId);
    const response = await api.post(`/customerdetails/user/${userId}`, addressData);
    return response.data;
  },
  update: async (addressData, addressId, user_id) => {
    const updatedData = {
      ...addressData,
      user: { id: user_id }  // Nest user_id inside user object
    };
    console.log(updatedData);
    const response = await api.put(`/customerdetails/update/${addressId}`, updatedData);
    return response.data;
  },
  
  
};

export const notifications = {
  send: async (userId, message) => {
    const response = await api.post('/notifications/send', { userId, message });
    return response.data;
  },
};

export default api; 