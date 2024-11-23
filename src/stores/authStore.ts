import { create } from 'zustand';
importI'll help you create the medical dispatch web application based on the provided designs and requirements. Let's start by setting up the core components and stores.

<boltArtifact id="medical-dispatch-setup" title="Medical Dispatch Application Setup">
<boltAction type="file" filePath="src/stores/authStore.ts">import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CryptoJS from 'crypto-js';

interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const encryptData = (data: string) => {
  return CryptoJS.AES.encrypt(data, import.meta.env.VITE_ENCRYPTION_KEY).toString();
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          // In production, replace with actual API call
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          
          if (!response.ok) throw new Error('Authentication failed');
          
          const data = await response.json();
          const encryptedToken = encryptData(data.token);
          
          set({
            user: data.user,
            token: encryptedToken,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);