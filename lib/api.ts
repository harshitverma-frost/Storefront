/**
 * Storefront API Client
 * Consumes existing backend at localhost:5000
 * Backend response format: { success: boolean, message: string, data: T }
 */

import { Product, ProductWithDetails, ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ─── Products ─── */

export async function getProducts(params?: {
    limit?: number;
    offset?: number;
    category?: string;
}): Promise<Product[]> {
    try {
        const searchParams = new URLSearchParams();
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.offset) searchParams.set('offset', String(params.offset));
        if (params?.category) searchParams.set('category', params.category);

        const url = `${API_URL}/api/products${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        const res = await fetch(url);
        const json: ApiResponse<Product[]> = await res.json();
        return json.success && json.data ? json.data : [];
    } catch (error) {
        console.error('[API] Failed to fetch products:', error);
        return [];
    }
}

export async function getProduct(id: string): Promise<Product | null> {
    try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        const json: ApiResponse<Product> = await res.json();
        return json.success && json.data ? json.data : null;
    } catch (error) {
        console.error('[API] Failed to fetch product:', error);
        return null;
    }
}

export async function getProductDetails(id: string): Promise<ProductWithDetails | null> {
    try {
        const res = await fetch(`${API_URL}/api/products/${id}/details`);
        const json: ApiResponse<ProductWithDetails> = await res.json();
        return json.success && json.data ? json.data : null;
    } catch (error) {
        console.error('[API] Failed to fetch product details:', error);
        return null;
    }
}

export async function searchProducts(query: string): Promise<Product[]> {
    try {
        const res = await fetch(`${API_URL}/api/products/search?q=${encodeURIComponent(query)}`);
        const json: ApiResponse<Product[]> = await res.json();
        return json.success && json.data ? json.data : [];
    } catch (error) {
        console.error('[API] Failed to search products:', error);
        return [];
    }
}

export async function checkApiHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/api/products?limit=1`);
        return res.ok;
    } catch {
        return false;
    }
}

/* ─── Auth ─── */

export async function loginUser(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });
    return res.json();
}

export async function registerUser(full_name: string, email: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ full_name, email, password }),
    });
    return res.json();
}

export async function logoutUser() {
    try {
        await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    } catch { /* silent */ }
}

export async function refreshAuthToken() {
    const res = await fetch(`${API_URL}/api/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
    });
    return res.json();
}

export async function getMe() {
    const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
    });
    return res.json();
}

export async function changePassword(currentPassword: string, newPassword: string) {
    const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    return res.json();
}

/* ─── Cart ─── */

export async function createCart(customerId?: string) {
    const res = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customer_id: customerId }),
    });
    return res.json();
}

export async function getCart(params: { cart_id?: string; customer_id?: string }) {
    const searchParams = new URLSearchParams();
    if (params.cart_id) searchParams.set('cart_id', params.cart_id);
    if (params.customer_id) searchParams.set('customer_id', params.customer_id);
    const res = await fetch(`${API_URL}/api/cart?${searchParams.toString()}`, {
        credentials: 'include',
    });
    return res.json();
}

export async function addCartItem(cartId: string, variantId: string, quantity: number) {
    const res = await fetch(`${API_URL}/api/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cart_id: cartId, variant_id: variantId, quantity }),
    });
    return res.json();
}

export async function updateCartItem(itemId: string, quantity: number) {
    const res = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity }),
    });
    return res.json();
}

export async function removeCartItem(itemId: string) {
    const res = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    return res.json();
}

/* ─── Orders ─── */

/**
 * Direct checkout — creates an order from localStorage cart items.
 * Uses POST /api/orders/direct (does NOT require a backend cart).
 */
export async function directCheckout(data: {
    customer_id?: string;
    customer_name?: string;
    customer_email?: string;
    items: Array<{ product_id: string; quantity: number; unit_price?: number }>;
    shipping_address?: Record<string, string>;
    payment_method?: string;
    order_notes?: string;
}) {
    const res = await fetch(`${API_URL}/api/orders/direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    return res.json();
}

/** Cart-based checkout (requires backend cart_id + customer_id). */
export async function checkoutOrder(data: { cart_id: string; customer_id: string; shipping_address_id?: string }) {
    const res = await fetch(`${API_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function getMyOrders(customerId: string) {
    const res = await fetch(`${API_URL}/api/orders?customer_id=${customerId}`, {
        credentials: 'include',
    });
    return res.json();
}

/* ─── Customers ─── */

export async function getCustomerProfile(id: string) {
    const res = await fetch(`${API_URL}/api/customers/${id}`, { credentials: 'include' });
    return res.json();
}

export async function updateCustomerProfile(id: string, data: Record<string, unknown>) {
    const res = await fetch(`${API_URL}/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function verifyAge(customerId: string) {
    const res = await fetch(`${API_URL}/api/customers/${customerId}/verify-age`, {
        method: 'POST',
        credentials: 'include',
    });
    return res.json();
}

export async function getAddresses(customerId: string) {
    const res = await fetch(`${API_URL}/api/customers/${customerId}/addresses`, { credentials: 'include' });
    return res.json();
}

export async function addAddress(customerId: string, address: Record<string, string>) {
    const res = await fetch(`${API_URL}/api/customers/${customerId}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(address),
    });
    return res.json();
}

export async function updateAddress(customerId: string, addressId: string, data: Record<string, string>) {
    const res = await fetch(`${API_URL}/api/customers/${customerId}/addresses/${addressId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function deleteAddress(customerId: string, addressId: string) {
    const res = await fetch(`${API_URL}/api/customers/${customerId}/addresses/${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    return res.json();
}

/* ─── Reviews ─── */

export async function getProductReviews(productId: string, params?: { limit?: number; offset?: number; sort?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.sort) searchParams.set('sort', params.sort);
    const qs = searchParams.toString();
    const res = await fetch(`${API_URL}/api/reviews/product/${productId}${qs ? '?' + qs : ''}`);
    return res.json();
}

export async function getRatingSummary(productId: string) {
    const res = await fetch(`${API_URL}/api/reviews/product/${productId}/summary`);
    return res.json();
}

export async function submitReview(data: { product_id: string; rating: number; title?: string; body?: string; order_id?: string }) {
    const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function getMyReviews() {
    const res = await fetch(`${API_URL}/api/reviews/my`, { credentials: 'include' });
    return res.json();
}

export async function deleteReview(reviewId: string) {
    const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    return res.json();
}

export async function markReviewHelpful(reviewId: string) {
    const res = await fetch(`${API_URL}/api/reviews/${reviewId}/helpful`, { method: 'POST' });
    return res.json();
}

/* ─── Wishlist ─── */

export async function getWishlist() {
    const res = await fetch(`${API_URL}/api/wishlist`, { credentials: 'include' });
    return res.json();
}

export async function addToWishlist(productId: string, variantId?: string) {
    const res = await fetch(`${API_URL}/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ product_id: productId, variant_id: variantId }),
    });
    return res.json();
}

export async function removeFromWishlist(productId: string) {
    const res = await fetch(`${API_URL}/api/wishlist/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    return res.json();
}

export async function checkInWishlist(productId: string) {
    const res = await fetch(`${API_URL}/api/wishlist/check/${productId}`, { credentials: 'include' });
    return res.json();
}

export async function clearWishlist() {
    const res = await fetch(`${API_URL}/api/wishlist`, {
        method: 'DELETE',
        credentials: 'include',
    });
    return res.json();
}

/* ─── Categories ─── */

export async function getCategories(tree?: boolean) {
    const qs = tree ? '?tree=true' : '';
    const res = await fetch(`${API_URL}/api/categories${qs}`);
    const json: ApiResponse = await res.json();
    return json.success && json.data ? json.data : [];
}

export async function getCategoryProducts(categoryId: string, params?: { limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    const qs = searchParams.toString();
    const res = await fetch(`${API_URL}/api/categories/${categoryId}/products${qs ? '?' + qs : ''}`);
    const json: ApiResponse<Product[]> = await res.json();
    return json.success && json.data ? json.data : [];
}

