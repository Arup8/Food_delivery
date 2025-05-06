export interface User {
  id: string;
  username: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem {
  id: string;
  foodItem: FoodItem;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  foodItemId: string;
  content: string;
  rating: number;
  userName: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method: 'credit_card' | 'paypal' | 'cash';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}