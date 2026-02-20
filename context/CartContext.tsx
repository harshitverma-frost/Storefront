'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { BackendCartItem, BackendCart } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
    createCart as apiCreateCart,
    getCart as apiGetCart,
    addCartItem as apiAddCartItem,
    updateCartItem as apiUpdateCartItem,
    removeCartItem as apiRemoveCartItem,
} from '@/lib/api';

interface CartContextType {
    items: BackendCartItem[];
    cartId: string | null;
    loading: boolean;
    error: string | null;
    addItem: (productId: string, variantId: string | null, quantity?: number) => Promise<void>;
    removeItem: (cartItemId: string) => Promise<void>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<BackendCartItem[]>([]);
    const [cartId, setCartId] = useState<string | null>(null);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { onAuthChange } = useAuth();

    /** Fetch full cart state from backend */
    const fetchCart = useCallback(async (cId: string) => {
        try {
            const res = await apiGetCart({ cart_id: cId });
            if (res.success && res.data) {
                const cart = res.data as BackendCart;
                setItems(cart.items || []);
                setTotalItems(cart.total_items || 0);
                setTotalPrice(cart.total_amount || 0);
            }
        } catch (err) {
            console.error('[CartContext] fetchCart error:', err);
        }
    }, []);

    /** Initialize cart for a logged-in customer */
    const initCart = useCallback(async (customerId: string) => {
        setLoading(true);
        setError(null);
        try {
            const getRes = await apiGetCart({ customer_id: customerId });
            if (getRes.success && getRes.data) {
                const cart = getRes.data as BackendCart;
                setCartId(cart.cart_id);
                setItems(cart.items || []);
                setTotalItems(cart.total_items || 0);
                setTotalPrice(cart.total_amount || 0);
            } else {
                const createRes = await apiCreateCart(customerId);
                if (createRes.success && createRes.data) {
                    setCartId(createRes.data.cart_id);
                    setItems([]);
                    setTotalItems(0);
                    setTotalPrice(0);
                }
            }
        } catch (err) {
            console.error('[CartContext] initCart error:', err);
            setError('Failed to load cart');
        } finally {
            setLoading(false);
        }
    }, []);

    const resetCart = useCallback(() => {
        setCartId(null);
        setItems([]);
        setTotalItems(0);
        setTotalPrice(0);
        setError(null);
    }, []);

    // Subscribe to auth changes
    useEffect(() => {
        const unsub = onAuthChange((event, user) => {
            if (event === 'login' && user) {
                initCart(user.id);
            } else if (event === 'logout') {
                resetCart();
            }
        });
        return unsub;
    }, [onAuthChange, initCart, resetCart]);

    const addItem = useCallback(async (productId: string, variantId: string | null, quantity = 1) => {
        if (!cartId) {
            setError('No cart available. Please log in.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            if (variantId) {
                await apiAddCartItem(cartId, variantId, quantity, true);
            } else {
                await apiAddCartItem(cartId, productId, quantity, false);
            }
            await fetchCart(cartId);
        } catch (err) {
            console.error('[CartContext] addItem error:', err);
            setError('Failed to add item to cart');
        } finally {
            setLoading(false);
        }
    }, [cartId, fetchCart]);

    const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
            await apiRemoveCartItem(cartItemId);
            if (cartId) await fetchCart(cartId);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await apiUpdateCartItem(cartItemId, quantity);
            if (cartId) await fetchCart(cartId);
        } catch (err) {
            console.error('[CartContext] updateQuantity error:', err);
            setError('Failed to update quantity');
        } finally {
            setLoading(false);
        }
    }, [cartId, fetchCart]);

    const removeItem = useCallback(async (cartItemId: string) => {
        setLoading(true);
        setError(null);
        try {
            await apiRemoveCartItem(cartItemId);
            if (cartId) await fetchCart(cartId);
        } catch (err) {
            console.error('[CartContext] removeItem error:', err);
            setError('Failed to remove item');
        } finally {
            setLoading(false);
        }
    }, [cartId, fetchCart]);

    const clearCart = useCallback(async () => {
        if (!cartId) return;
        setLoading(true);
        try {
            for (const item of items) {
                await apiRemoveCartItem(item.cart_item_id);
            }
            setItems([]);
            setTotalItems(0);
            setTotalPrice(0);
        } catch (err) {
            console.error('[CartContext] clearCart error:', err);
        } finally {
            setLoading(false);
        }
    }, [cartId, items]);

    return (
        <CartContext.Provider value={{
            items, cartId, loading, error,
            addItem, removeItem, updateQuantity, clearCart,
            totalItems, totalPrice,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}