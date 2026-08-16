'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase/client';
import { apiClient } from './api';

export interface UserProfile {
  id: string;
  supabaseUid: string;
  email: string;
  fullName: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'MANUFACTURING';
  phone?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password?: string) => Promise<void>;
  signUpWithEmail: (email: string, password?: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: 'CUSTOMER' | 'ADMIN' | 'MANUFACTURING') => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('cablecraft_token');
        if (savedToken) {
          setToken(savedToken);
          try {
            const profile = await apiClient<UserProfile>('/auth/me', { token: savedToken });
            setUser(profile);
          } catch {
            // Fallback default profile if server was restarted
            if (savedToken.startsWith('mock-token-')) {
              const role = savedToken.includes('admin')
                ? 'ADMIN'
                : savedToken.includes('manuf')
                ? 'MANUFACTURING'
                : 'CUSTOMER';
              setUser({
                id: `demo-${role.toLowerCase()}`,
                supabaseUid: `uid-${role.toLowerCase()}`,
                email: `${role.toLowerCase()}@cablecraft.io`,
                fullName: `${role} User`,
                role: role as any,
              });
            }
          }
        } else {
          // Default to Demo Customer for instant exploration
          const defaultToken = 'mock-token-customer-123';
          setToken(defaultToken);
          localStorage.setItem('cablecraft_token', defaultToken);
          try {
            const profile = await apiClient<UserProfile>('/auth/me', { token: defaultToken });
            setUser(profile);
          } catch {
            setUser({
              id: 'demo-customer',
              supabaseUid: 'uid-customer',
              email: 'customer@cablecraft.io',
              fullName: 'Demo Customer',
              role: 'CUSTOMER',
            });
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await apiClient<UserProfile>('/auth/me', { token });
      setUser(profile);
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  };

  const signInWithEmail = async (email: string, password = 'password123') => {
    setIsLoading(true);
    try {
      let role: 'CUSTOMER' | 'ADMIN' | 'MANUFACTURING' = 'CUSTOMER';
      if (email.includes('admin')) role = 'ADMIN';
      if (email.includes('manuf')) role = 'MANUFACTURING';

      const newToken = `mock-token-${role.toLowerCase()}-${Date.now()}`;
      setToken(newToken);
      localStorage.setItem('cablecraft_token', newToken);

      try {
        const profile = await apiClient<UserProfile>('/auth/me', { token: newToken });
        setUser(profile);
      } catch {
        setUser({
          id: `user-${Date.now()}`,
          supabaseUid: `uid-${Date.now()}`,
          email,
          fullName: email.split('@')[0],
          role,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password = 'password123', fullName = '') => {
    setIsLoading(true);
    try {
      const newToken = `mock-token-customer-${Date.now()}`;
      setToken(newToken);
      localStorage.setItem('cablecraft_token', newToken);
      try {
        const profile = await apiClient<UserProfile>('/auth/me', { token: newToken });
        setUser(profile);
      } catch {
        setUser({
          id: `user-${Date.now()}`,
          supabaseUid: `uid-${Date.now()}`,
          email,
          fullName: fullName || email.split('@')[0],
          role: 'CUSTOMER',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = async (role: 'CUSTOMER' | 'ADMIN' | 'MANUFACTURING') => {
    setIsLoading(true);
    const newToken = `mock-token-${role.toLowerCase()}-${Date.now()}`;
    setToken(newToken);
    localStorage.setItem('cablecraft_token', newToken);
    try {
      const profile = await apiClient<UserProfile>('/auth/me', { token: newToken });
      setUser(profile);
    } catch {
      setUser({
        id: `demo-${role.toLowerCase()}`,
        supabaseUid: `uid-${role.toLowerCase()}`,
        email: `${role.toLowerCase()}@cablecraft.io`,
        fullName: `${role} User`,
        role,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('cablecraft_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        switchDemoRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
