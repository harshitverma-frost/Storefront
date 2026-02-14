'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import { Package, MapPin, Heart, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type Tab = 'orders' | 'wishlist' | 'addresses' | 'profile';

export default function AccountPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout, orders, addresses } = useAuth();
    const { items: wishlistItems } = useWishlist();
    const [activeTab, setActiveTab] = useState<Tab>('orders');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="animate-shimmer h-8 w-40 rounded" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
        { id: 'orders', label: 'Orders', icon: Package, count: orders.length },
        { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlistItems.length },
        { id: 'addresses', label: 'Addresses', icon: MapPin, count: addresses.length },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-cream">
            {/* Header */}
            <div className="border-b border-light-border bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-charcoal">My Account</h1>
                            <p className="mt-1 text-sm text-warm-gray">Welcome back, {user?.name}!</p>
                        </div>
                        <button
                            onClick={() => { logout(); toast.success('Logged out'); router.push('/'); }}
                            className="flex items-center gap-2 rounded-lg border border-light-border px-4 py-2 text-sm font-medium text-warm-gray hover:text-red-500 hover:border-red-200 transition-colors"
                        >
                            <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Tabs */}
                <div className="flex gap-1 border-b border-light-border mb-8 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'border-burgundy text-burgundy'
                                : 'border-transparent text-warm-gray hover:text-charcoal'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="rounded-full bg-burgundy/10 px-2 py-0.5 text-[10px] font-bold text-burgundy">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Orders */}
                {activeTab === 'orders' && (
                    <div>
                        {orders.length === 0 ? (
                            <div className="rounded-2xl border border-light-border bg-white py-16 text-center">
                                <Package className="mx-auto h-12 w-12 text-warm-gray/40 mb-3" />
                                <p className="font-serif text-lg text-charcoal">No orders yet</p>
                                <p className="mt-1 text-sm text-warm-gray">Your orders will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className="rounded-xl border border-light-border bg-white p-6">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                            <div>
                                                <p className="font-mono text-sm font-semibold text-charcoal">{order.id}</p>
                                                <p className="text-xs text-warm-gray">{new Date(order.created_at).toLocaleDateString('en-US')}</p>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'delivered' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="space-y-2 border-t border-light-border pt-3">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between text-sm">
                                                    <span className="text-charcoal">{item.product.product_name} × {item.quantity}</span>
                                                    <span className="text-warm-gray">${((item.product.price || 35) * item.quantity).toLocaleString('en-US')}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 border-t border-light-border pt-3 flex justify-between">
                                            <span className="font-serif text-sm font-semibold text-burgundy">Total</span>
                                            <span className="font-serif text-sm font-bold text-burgundy">${order.total.toLocaleString('en-US')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Wishlist */}
                {activeTab === 'wishlist' && (
                    <div>
                        {wishlistItems.length === 0 ? (
                            <div className="rounded-2xl border border-light-border bg-white py-16 text-center">
                                <Heart className="mx-auto h-12 w-12 text-warm-gray/40 mb-3" />
                                <p className="font-serif text-lg text-charcoal">Wishlist is empty</p>
                                <p className="mt-1 text-sm text-warm-gray">Save your favorite wines here</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {wishlistItems.map(product => (
                                    <ProductCard key={product.product_id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Addresses */}
                {activeTab === 'addresses' && (
                    <div>
                        {addresses.length === 0 ? (
                            <div className="rounded-2xl border border-light-border bg-white py-16 text-center">
                                <MapPin className="mx-auto h-12 w-12 text-warm-gray/40 mb-3" />
                                <p className="font-serif text-lg text-charcoal">No saved addresses</p>
                                <p className="mt-1 text-sm text-warm-gray">Addresses are saved during checkout</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {addresses.map((addr, i) => (
                                    <div key={i} className="rounded-xl border border-light-border bg-white p-5">
                                        <p className="font-semibold text-charcoal">{addr.full_name}</p>
                                        <p className="mt-1 text-sm text-warm-gray">{addr.address_line}</p>
                                        <p className="text-sm text-warm-gray">{addr.city}, {addr.state} {addr.zip_code}</p>
                                        <p className="text-sm text-warm-gray">{addr.country}</p>
                                        <p className="mt-2 text-sm text-charcoal">📞 {addr.phone}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Profile */}
                {activeTab === 'profile' && (
                    <div className="max-w-lg">
                        <div className="rounded-xl border border-light-border bg-white p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-16 w-16 rounded-full bg-cream-dark flex items-center justify-center font-serif text-2xl font-bold text-burgundy">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-serif text-xl font-bold text-charcoal">{user?.name}</p>
                                    <p className="text-sm text-warm-gray">{user?.email}</p>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-light-border">
                                    <span className="text-warm-gray">Member since</span>
                                    <span className="text-charcoal">January 2026</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-light-border">
                                    <span className="text-warm-gray">Total orders</span>
                                    <span className="text-charcoal">{orders.length}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-warm-gray">Wishlist items</span>
                                    <span className="text-charcoal">{wishlistItems.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
