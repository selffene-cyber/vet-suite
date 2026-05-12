import { create } from "zustand";
import type { UserRole, Company, User } from "@/types/database";

interface AuthState {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  canPrescribe: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  company: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),
  setCompany: (company) => set({ company }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, company: null, isAuthenticated: false }),
  hasRole: (roles) => {
    const { user } = get();
    if (!user) return false;
    return roles.includes(user.rol as UserRole);
  },
  canPrescribe: () => {
    const { user } = get();
    if (!user) return false;
    return (
      (user.rol as UserRole) === "veterinarian" ||
      (user.rol as UserRole) === "admin" ||
      (user.rol as UserRole) === "super_admin"
    );
  },
}));