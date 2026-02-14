'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Order, ShippingAddress } from '@/types';

interface AuthContextType {
    user: UserInfo | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    verifyUserAge: (dateOfBirth: string) => Promise<{ success: boolean; error?: string }>;
    orders: Order[];
    addOrder: (order: Order) => void;
    addresses: ShippingAddress[];
    addAddress: (address: ShippingAddress) => void;
}

interface UserInfo {
    id: string;
    name: string;
    email: string;
    is_age_verified?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const USER_KEY = 'ksp_wines_user';
const ORDERS_KEY = 'ksp_wines_orders';
const ADDRESSES_KEY = 'ksp_wines_addresses';

/** Map backend customer shape → frontend UserInfo */
function toUserInfo(customer: Record<string, unknown>): UserInfo {
    return {
        id: (customer.customer_id ?? customer.id ?? '') as string,
        name: (customer.full_name ?? customer.name ?? '') as string,
        email: (customer.email ?? '') as string,
        is_age_verified: !!(customer.is_age_verified),
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [addresses, setAddresses] = useState<ShippingAddress[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(USER_KEY);
            if (stored) setUser(JSON.parse(stored));
            const storedOrders = localStorage.getItem(ORDERS_KEY);
            if (storedOrders) setOrders(JSON.parse(storedOrders));
            const storedAddresses = localStorage.getItem(ADDRESSES_KEY);
            if (storedAddresses) setAddresses(JSON.parse(storedAddresses));
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });
            const json = await res.json();
            if (res.ok && json.success && json.data?.customer) {
                const u = toUserInfo(json.data.customer);
                setUser(u);
                localStorage.setItem(USER_KEY, JSON.stringify(u));
                return { success: true };
            }
            // Return backend error message if available
            if (json.message) return { success: false, error: json.message };
        } catch {
            /* Backend not available, fall through to mock */
        }

        // Mock login fallback
        if (password.length >= 3) {
            const mockUser: UserInfo = { id: `user-${Date.now()}`, name: email.split('@')[0], email, is_age_verified: true };
            setUser(mockUser);
            localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
            return { success: true };
        }
        return { success: false, error: 'Invalid credentials' };
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ full_name: name, email, password }),
            });
            const json = await res.json();
            if (res.ok && json.success && json.data?.customer) {
                const u = toUserInfo(json.data.customer);
                setUser(u);
                localStorage.setItem(USER_KEY, JSON.stringify(u));
                return { success: true };
            }
            if (json.message) return { success: false, error: json.message };
        } catch { /* fallback to mock */ }

        if (name && email && password.length >= 3) {
            const mockUser: UserInfo = { id: `user-${Date.now()}`, name, email, is_age_verified: true };
            setUser(mockUser);
            localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
            return { success: true };
        }
        return { success: false, error: 'Please fill all fields correctly' };
    }, []);

    const logout = useCallback(() => {
        // Call backend logout to clear HttpOnly cookies
        fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => { });
        setUser(null);
        localStorage.removeItem(USER_KEY);
    }, []);

    const verifyUserAge = useCallback(async (dateOfBirth: string) => {
        if (!user?.id) return { success: false, error: "User not logged in" };
        try {
            const res = await fetch(`${API_URL}/api/customers/${user.id}/verify-age`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date_of_birth: dateOfBirth }),
            });
            const json = await res.json();
            if (res.ok && json.success) {
                const updatedUser = { ...user, is_age_verified: true };
                setUser(updatedUser);
                localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
                return { success: true };
            }
            return { success: false, error: json.message || "Verification failed" };
        } catch (err) {
            return { success: false, error: "Network error during verification" };
        }
    }, [user]);

    const addOrder = useCallback((order: Order) => {
        setOrders(prev => {
            const updated = [order, ...prev];
            localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const addAddress = useCallback((address: ShippingAddress) => {
        setAddresses(prev => {
            const updated = [...prev, address];
            localStorage.setItem(ADDRESSES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    return (
        <AuthContext.Provider value={{
            user, isAuthenticated: !!user, isLoading, login, register, logout, verifyUserAge,
            orders, addOrder, addresses, addAddress,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
