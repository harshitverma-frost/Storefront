'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product } from '@/types';

interface WishlistContextType {
    items: Product[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    toggleItem: (product: Product) => void;
    totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_KEY = 'ksp_wines_wishlist';

function loadWishlist(): Product[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(WISHLIST_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveWishlist(items: Product[]) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
    }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<Product[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setItems(loadWishlist());
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) saveWishlist(items);
    }, [items, mounted]);

    const addItem = useCallback((product: Product) => {
        setItems(prev => {
            if (prev.find(p => p.product_id === product.product_id)) return prev;
            return [...prev, product];
        });
    }, []);

    const removeItem = useCallback((productId: string) => {
        setItems(prev => prev.filter(p => p.product_id !== productId));
    }, []);

    const isInWishlist = useCallback((productId: string) => {
        return items.some(p => p.product_id === productId);
    }, [items]);

    const toggleItem = useCallback((product: Product) => {
        setItems(prev => {
            if (prev.find(p => p.product_id === product.product_id)) {
                return prev.filter(p => p.product_id !== product.product_id);
            }
            return [...prev, product];
        });
    }, []);

    return (
        <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist, toggleItem, totalItems: items.length }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within WishlistProvider');
    return context;
}
