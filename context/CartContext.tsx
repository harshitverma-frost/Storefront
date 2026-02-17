'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product, CartItem } from '@/types';
import { createCart, addCartItem as apiAddCartItem, getCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem } from '@/lib/api';

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, quantity?: number, variantId?: string) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    cartId: string | null;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'ksp_wines_cart';
const CART_ID_KEY = 'ksp_wines_cart_id';

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

function loadCartId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(CART_ID_KEY);
}

function saveCartId(cartId: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(CART_ID_KEY, cartId);
    }
}

function clearStoredCartId() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(CART_ID_KEY);
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [cartId, setCartId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Fetch cart from backend using GET /api/cart?cart_id=xxx
     */
    const fetchCartFromBackend = useCallback(async (id: string) => {
        console.log('[Cart] 🔄 Fetching cart from backend:', id);
        try {
            const result = await getCart({ cart_id: id }) as any;
            if (result.success && result.data) {
                const cartData = result.data;
                // Handle both formats: data could be the cart itself or data.cart
                const cartObj = cartData.cart || cartData;
                const backendItems = cartObj.items || [];
                
                console.log('[Cart] 📦 Backend cart has', backendItems.length, 'items');
                
                const mappedItems: CartItem[] = backendItems.map((item: any) => ({
                    item_id: item.item_id || item.cart_item_id,
                    product: {
                        product_id: item.product_id,
                        product_name: item.product_name || item.name || 'Product',
                        price: item.unit_price ?? item.price,
                        sku: item.sku || '',
                        brand: item.brand,
                        category: item.category,
                    },
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                }));
                setItems(mappedItems);
                saveCart(mappedItems);
                console.log('[Cart] ✅ Cart synced from backend');
            } else {
                console.warn('[Cart] ⚠️ Backend getCart unsuccessful:', result.message);
            }
        } catch (error) {
            console.error('[Cart] ❌ Failed to fetch cart from backend:', error);
        }
    }, []);

    useEffect(() => {
        const storedCart = loadCart();
        const storedCartId = loadCartId();
        setItems(storedCart);
        setCartId(storedCartId);
        
        // Fetch cart from backend if we have a real cart ID
        if (storedCartId && !storedCartId.startsWith('temp-')) {
            fetchCartFromBackend(storedCartId);
        }
        
        setMounted(true);
    }, [fetchCartFromBackend]);

    useEffect(() => {
        if (mounted) saveCart(items);
    }, [items, mounted]);

    const ensureCartExists = useCallback(async (): Promise<string> => {
        // If we have a cached cart_id, verify it exists in backend first
        if (cartId && !cartId.startsWith('temp-')) {
            console.log('[Cart] Verifying existing cart_id:', cartId);
            try {
                const result = await getCart({ cart_id: cartId }) as any;
                if (result.success && result.data) {
                    console.log('[Cart] ✅ Cart verified on backend');
                    return cartId;
                } else {
                    console.warn('[Cart] ⚠️ Cached cart_id not found in backend, creating new cart');
                    // Clear invalid cart id
                    localStorage.removeItem('ksp_wines_cart_id');
                    setCartId(null);
                }
            } catch (error) {
                console.error('[Cart] ❌ Cart verification failed:', error);
                localStorage.removeItem('ksp_wines_cart_id');
                setCartId(null);
            }
        }
        
        // Create new cart if we don't have a valid one
        if (!cartId || cartId.startsWith('temp-')) {
            try {
                const userStr = localStorage.getItem('ksp_wines_user');
                const customerId = userStr ? JSON.parse(userStr).id : undefined;
                
                console.log('[Cart] Creating new backend cart for customer:', customerId || '(guest)');
                const result = await createCart(customerId) as any;
                
                if (result.success && result.data?.cart_id) {
                    const newCartId = result.data.cart_id;
                    console.log('[Cart] ✅ Backend cart created:', newCartId);
                    setCartId(newCartId);
                    saveCartId(newCartId);
                    return newCartId;
                } else {
                    console.warn('[Cart] ⚠️ createCart response:', result);
                }
            } catch (error) {
                console.error('[Cart] ❌ Failed to create cart:', error);
            }
            
            // Fallback: generate temporary cart ID
            const tempCartId = `temp-${Date.now()}`;
            console.warn('[Cart] ⚠️ Using temp cart_id (backend failed):', tempCartId);
            setCartId(tempCartId);
            saveCartId(tempCartId);
            return tempCartId;
        }
        
        return cartId;
    }, [cartId]);

    const addItem = useCallback(async (product: Product, quantity = 1, variantId?: string) => {
        const currentCartId = await ensureCartExists();
        
        // Resolve variant_id - MUST have one for old backend compatibility
        const productWithDetails = product as any;
        const resolvedVariantId = variantId 
            || (productWithDetails.variants?.[0]?.variant_id)
            || product.product_id; // Fallback: use product_id as variant_id
        
        console.log('[Cart] 🔍 Adding item:', { 
            product_id: product.product_id,
            product_name: product.product_name,
            variant_id: resolvedVariantId,
            quantity 
        });
        
        // Only call backend if we have a real (non-temp) cart
        if (!currentCartId.startsWith('temp-')) {
            try {
                // Send BOTH product_id AND variant_id for compatibility with old/new backend
                const params = {
                    product_id: product.product_id,
                    variant_id: resolvedVariantId // Always send variant_id (old backend requires it)
                };
                
                console.log('[Cart] 📤 Calling backend addCartItem:', { 
                    cartId: currentCartId, 
                    params,
                    quantity 
                });
                
                const result = await apiAddCartItem(currentCartId, params, quantity) as any;
                
                if (result.success) {
                    console.log('[Cart] ✅ Item added to backend');
                    await fetchCartFromBackend(currentCartId);
                    return;
                } else {
                    console.warn('[Cart] ⚠️ Backend addCartItem failed:', result.message);
                    throw new Error(result.message || 'Failed to add item to cart');
                }
            } catch (error) {
                console.error('[Cart] ❌ Backend addCartItem threw:', error);
                throw error;
            }
        }
        
        // Fallback: localStorage only (for temp carts)
        console.log('[Cart] 💾 Adding item to localStorage fallback');
        setItems(prev => {
            const existing = prev.find(item => item.product.product_id === product.product_id);
            if (existing) {
                return prev.map(item =>
                    item.product.product_id === product.product_id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity, variant_id: resolvedVariantId }];
        });
    }, [ensureCartExists, fetchCartFromBackend]);

    const removeItem = useCallback(async (productId: string) => {
        const item = items.find(i => i.product.product_id === productId);
        
        if (item?.item_id) {
            try {
                console.log('[Cart] 🗑️ Removing item from backend:', item.item_id);
                await apiRemoveCartItem(item.item_id);
                if (cartId && !cartId.startsWith('temp-')) {
                    await fetchCartFromBackend(cartId);
                    return;
                }
            } catch (error) {
                console.error('[Cart] ❌ Backend remove failed:', error);
            }
        }
        
        // Fallback
        setItems(prev => prev.filter(i => i.product.product_id !== productId));
    }, [cartId, items, fetchCartFromBackend]);

    const updateQuantity = useCallback(async (productId: string, quantity: number) => {
        if (quantity <= 0) {
            await removeItem(productId);
            return;
        }
        
        const item = items.find(i => i.product.product_id === productId);
        
        if (item?.item_id) {
            try {
                console.log('[Cart] 🔄 Updating quantity via backend:', item.item_id, '→', quantity);
                await apiUpdateCartItem(item.item_id, quantity);
                if (cartId && !cartId.startsWith('temp-')) {
                    await fetchCartFromBackend(cartId);
                    return;
                }
            } catch (error) {
                console.error('[Cart] ❌ Backend update failed:', error);
            }
        }
        
        // Fallback
        setItems(prev =>
            prev.map(i =>
                i.product.product_id === productId ? { ...i, quantity } : i
            )
        );
    }, [cartId, items, removeItem, fetchCartFromBackend]);

    const clearCart = useCallback(() => {
        console.log('[Cart] 🧹 Clearing cart');
        setItems([]);
        clearStoredCartId();
        setCartId(null);
    }, []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);

    return (
        <CartContext.Provider value={{ 
            items, 
            addItem, 
            removeItem, 
            updateQuantity, 
            clearCart, 
            totalItems, 
            totalPrice,
            cartId,
            isLoading
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
