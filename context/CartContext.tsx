'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product, CartItem } from '@/types';

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'ksp_wines_cart';

function loadCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(CART_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveCart(items: CartItem[]) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setItems(loadCart());
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) saveCart(items);
    }, [items, mounted]);

    const addItem = useCallback((product: Product, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.product.product_id === product.product_id);
            if (existing) {
                return prev.map(item =>
                    item.product.product_id === product.product_id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });
    }, []);

    const removeItem = useCallback((productId: string) => {
        setItems(prev => prev.filter(item => item.product.product_id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            setItems(prev => prev.filter(item => item.product.product_id !== productId));
            return;
        }
        setItems(prev =>
            prev.map(item =>
                item.product.product_id === productId ? { ...item, quantity } : item
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
