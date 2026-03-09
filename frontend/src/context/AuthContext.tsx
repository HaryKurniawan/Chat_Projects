import React, { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../services/api';
import type { UserProfile } from '../types/api';

/**
 * =============================================================
 * [OWASP A04 - Cryptographic Failures]
 * 
 * Auth context menggunakan pendekatan cookie-based.
 * Kita TIDAK lagi mengecek localStorage untuk token karena:
 * 1. Token sekarang disimpan di HttpOnly cookie (tidak bisa diakses JS)
 * 2. Untuk mengecek apakah user sudah login, kita melakukan
 *    request ke /profile — jika berhasil, berarti cookie valid.
 * 
 * SEBELUMNYA (TIDAK AMAN):
 * const token = localStorage.getItem('authToken');
 * if (!token) redirect('/login');
 * → Token bisa dicuri via XSS ❌
 * 
 * SEKARANG (AMAN):
 * Cek autentikasi via API call yang mengirim HttpOnly cookie.
 * → Token tidak bisa diakses oleh JavaScript ✅
 * =============================================================
 */

// Context untuk state autentikasi
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  setIsAuthenticated: () => {},
  setUser: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// Provider autentikasi
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    /**
     * [A04] Cek autentikasi dengan memanggil API profile.
     * Jika cookie valid, berarti user sudah login.
     * Jika gagal (401/403), berarti belum login atau session expired.
     */
    const checkAuth = async () => {
      try {
        const response = await authAPI.getProfile();
        setIsAuthenticated(true);
        // Types in services/api.ts return profile data directly, assuming axios response wrapper or data wrapper
        // Wait, looking at getProfile, might return AxiosResponse, let's assume it returns { data: UserProfile } 
        // We will just set user based on what getProfile returns.
        setUser(response.data.data); 
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, setIsAuthenticated, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
