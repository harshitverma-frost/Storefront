/**
 * Storefront API Client
 * Consumes existing backend at https://ecommerce-backend-h23p.onrender.com
 * Backend response format: { success: boolean, message: string, data: T }
 */

import { Product, FilteredProduct, FilterMeta, ProductWithDetails, ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ─── Products ─── */

export async function getProducts(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    brand?: string;
    sort?: string;
    status?: string;
}): Promise<Product[]> {
    try {
        const searchParams = new URLSearchParams();
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.offset) searchParams.set('offset', String(params.offset));
        if (params?.category) searchParams.set('category', params.category);
        if (params?.brand) searchParams.set('brand', params.brand);
        if (params?.sort) searchParams.set('sort', params.sort);
        if (params?.status) searchParams.set('status', params.status);

        const url = `${API_URL}/api/products${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const json: ApiResponse<Product[]> = await res.json();
        return json.success && json.data ? json.data : [];
    } catch (error) {
        console.warn('[API] Failed to fetch products. Backend might be unreachable.');
        return [];
    }
}

/* ─── Filtered Products (backend-powered) ─── */

export interface FilterParams {
    page?: number;
    limit?: number;
    sort?: string;
    min_price?: number;
    max_price?: number;
    min_abv?: number;
    max_abv?: number;
    country?: string;      // comma-separated
    min_rating?: number;
    availability?: string;  // 'in_stock' | 'out_of_stock' | 'all'
    category?: string;
    brand?: string;
}

export async function getFilteredProducts(
    params: FilterParams = {}
): Promise<{ data: FilteredProduct[]; meta: FilterMeta }> {
    try {
        const sp = new URLSearchParams();
        if (params.page) sp.set('page', String(params.page));
        if (params.limit) sp.set('limit', String(params.limit));
        if (params.sort) sp.set('sort', params.sort);
        if (params.min_price != null) sp.set('min_price', String(params.min_price));
        if (params.max_price != null) sp.set('max_price', String(params.max_price));
        if (params.min_abv != null) sp.set('min_abv', String(params.min_abv));
        if (params.max_abv != null) sp.set('max_abv', String(params.max_abv));
        if (params.country) sp.set('country', params.country);
        if (params.min_rating != null) sp.set('min_rating', String(params.min_rating));
        if (params.availability) sp.set('availability', params.availability);
        if (params.category) sp.set('category', params.category);
        if (params.brand) sp.set('brand', params.brand);

        const qs = sp.toString();
        const url = `${API_URL}/api/products/filter${qs ? '?' + qs : ''}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.success) {
            return {
                data: json.data ?? [],
                meta: json.meta ?? { total_count: 0, page: 1, limit: 20, total_pages: 0, has_next_page: false, has_prev_page: false, filters_applied: {}, sort: 'newest', cache_hit: false },
            };
        }
        return { data: [], meta: { total_count: 0, page: 1, limit: 20, total_pages: 0, has_next_page: false, has_prev_page: false, filters_applied: {}, sort: 'newest', cache_hit: false } };
    } catch (error) {
        console.error('[API] Failed to fetch filtered products:', error);
        return { data: [], meta: { total_count: 0, page: 1, limit: 20, total_pages: 0, has_next_page: false, has_prev_page: false, filters_applied: {}, sort: 'newest', cache_hit: false } };
    }
}

/** Fetch all products once and extract unique brands & countries for filter options */
export async function getFilterOptions(): Promise<{ brands: string[]; countries: string[] }> {
    try {
        // Use the filter endpoint with a large limit to get all products with their country_of_origin
        const { data: products } = await getFilteredProducts({ limit: 500 });
        const brandSet = new Set<string>();
        const countrySet = new Set<string>();
        products.forEach((p: FilteredProduct) => {
            if (p.brand) brandSet.add(p.brand);
            if (p.country_of_origin) countrySet.add(p.country_of_origin);
        });
        return {
            brands: Array.from(brandSet).sort(),
            countries: Array.from(countrySet).sort(),
        };
    } catch {
        return { brands: [], countries: [] };
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

export async function deactivateAccount(password: string) {
    const res = await fetch(`${API_URL}/api/auth/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
    });
    return res.json();
}

export async function reactivateAccount(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/reactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });
    return res.json();
}

/* ─── Cart ─── */

export async function createCart(customerId?: string) {
    console.log("cart created");
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

export async function addCartItem(cartId: string, itemId: string, quantity: number, isVariant = true) {
    const body: Record<string, unknown> = { cart_id: cartId, quantity };
    // Backend accepts either variant_id or product_id
    if (isVariant) {
        body.variant_id = itemId;
    } else {
        body.product_id = itemId;
    }
    const res = await fetch(`${API_URL}/api/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
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

export async function uploadProfileImage(customerId: string, base64Image: string) {
    const res = await fetch(`${API_URL}/api/customers/${customerId}/profile-image`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ image: base64Image }),
    });
    return res.json();
}

export async function getProfileImage(customerId: string) {
    const res = await fetch(`${API_URL}/api/customers/${customerId}/profile-image`, {
        credentials: 'include',
    });
    return res.json();
}

export async function removeProfileImage(customerId: string) {
    const res = await fetch(`${API_URL}/api/customers/${customerId}/profile-image`, {
        method: 'DELETE',
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

export async function getCategories(tree?: boolean): Promise<any[]> {
    try {
        const qs = tree ? '?tree=true' : '';
        const res = await fetch(`${API_URL}/api/categories${qs}`);
        if (!res.ok) return [];
        const json: ApiResponse<any[]> = await res.json();
        return json.success && json.data ? json.data : [];
    } catch (error) {
        console.warn('[API] Failed to fetch categories. Backend might be unreachable.');
        return [];
    }
}

export async function getCategoryProducts(categoryId: string, params?: { limit?: number; offset?: number }) {
    try {
        const searchParams = new URLSearchParams();
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.offset) searchParams.set('offset', String(params.offset));
        const qs = searchParams.toString();
        const res = await fetch(`${API_URL}/api/categories/${categoryId}/products${qs ? '?' + qs : ''}`);
        if (!res.ok) return [];
        const json: ApiResponse<Product[]> = await res.json();
        return json.success && json.data ? json.data : [];
    } catch (error) {
        console.warn('[API] Failed to fetch category products. Backend might be unreachable.');
        return [];
    }
}

