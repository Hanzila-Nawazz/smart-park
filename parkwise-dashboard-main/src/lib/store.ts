import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "admin" | "user" | "walkin" | null;

export interface AuthUser {
  id?: string;
  name: string;
  cnic?: string;
  contact?: string;
  vehicleType?: string;
  plateNumber?: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  walletBalance: number;
  setWalletBalance: (n: number) => void;
  setUser: (u: Partial<AuthUser>) => void;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  topUp: (amount: number) => void;
  deduct: (amount: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      walletBalance: 1500,
      setWalletBalance: (n: number) => set(() => ({ walletBalance: n })),
      setUser: (u: Partial<AuthUser>) => set((s) => ({ user: { ...(s.user || {}), ...u } as AuthUser })),
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      topUp: (amount) => set((s) => ({ walletBalance: s.walletBalance + amount })),
      deduct: (amount) => set((s) => ({ walletBalance: Math.max(0, s.walletBalance - amount) })),
    }),
    { name: "spms-auth" },
  ),
);

interface ThemeState {
  theme: "light" | "dark";
  toggle: () => void;
}
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      toggle: () =>
        set((s) => {
          const next = s.theme === "light" ? "dark" : "light";
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", next === "dark");
          }
          return { theme: next };
        }),
    }),
    { name: "spms-theme" },
  ),
);
