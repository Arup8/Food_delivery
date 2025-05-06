import { create } from 'zustand';
import { User } from '../types';
import { auth } from '../lib/api';

interface AuthState {
  user: User | null;
  allUsers: User[]; // all non-admin users
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string,email:string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUsers: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  allUsers: [],
  isLoading: false,
  error: null,

  // in your Zustand store
  login: async (username: string, password: string) => {
  try {
    set({ isLoading: true, error: null });

    const { user, token } = await auth.login(username, password);

    if (!user || !token) {
      return false; // failed
    }

    localStorage.setItem('token', token);
    set({ user, isLoading: false });
    return true; // success
  } catch (err: any) {
    set({ error: err.message || 'Login failed', isLoading: false });
    return false;
  }
},
  register: async (username,email, password, role) => {
    try {
      set({ isLoading: true, error: null });
      const { user, token } = await auth.register(username,email, password, role);
      localStorage.setItem('token', token);
      set({ user, isLoading: false });
    } catch (err) {
      console.error('Registration failed:', err);
      set({ error: 'Registration failed', isLoading: false });
    }
  },

  logout: async () => {
    try {
      await auth.logout();
      set({ user: null });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  fetchUsers: async () => {
    try {
      set({ isLoading: true, error: null });
      const users = await auth.getAll();
      const nonAdmins = users.filter((u: User) => u.role !== 'ADMIN');
      set({ allUsers: nonAdmins, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      set({ error: 'Failed to fetch users', isLoading: false });
    }
  },
}));
