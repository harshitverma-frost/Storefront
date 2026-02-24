'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import {
    getMyOrders, getAddresses, addAddress as apiAddAddress,
    updateAddress as apiUpdateAddress, deleteAddress as apiDeleteAddress,
    getCustomerProfile, updateCustomerProfile, deactivateAccount,
    uploadProfileImage, getProfileImage, removeProfileImage,
} from '@/lib/api';
import { Order, Address } from '@/types';
import {
    Package, MapPin, Heart, LogOut, User, Plus, Pencil, Trash2,
    Loader2, ShieldOff, Camera, X, Check, Star, Phone, Calendar, Mail,
    CheckCircle2, Smartphone, AlertCircle,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';

type Tab = 'orders' | 'wishlist' | 'addresses' | 'profile';

const VALID_TABS: Tab[] = ['orders', 'wishlist', 'addresses', 'profile'];

export default function AccountPage() {
    const router = useRouter();
    const params = useParams<{ tab?: string[] }>();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const { items: wishlistItems } = useWishlist();

    // Derive active tab from URL path segment, default to 'orders'
    const activeTab: Tab = useMemo(() => {
        const slug = params?.tab?.[0] as Tab | undefined;
        return slug && VALID_TABS.includes(slug) ? slug : 'orders';
    }, [params?.tab]);

    // Orders state
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Addresses state
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [addressForm, setAddressForm] = useState({
        address_line1: '', address_line2: '', city: '', state: '', pincode: '',
        country: 'India', phone: '', label: '', is_default: false,
    });

    // Profile state
    const [orderCount, setOrderCount] = useState(0);
    const [profileEditing, setProfileEditing] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        full_name: '', email: '', phone: '', date_of_birth: '',
        is_email_verified: false, is_mobile_verified: false,
    });

    // Profile image state
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Deactivation state
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivatePassword, setDeactivatePassword] = useState('');
    const [deactivating, setDeactivating] = useState(false);

    // Delete address confirmation
    const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // ── Fetch orders ─────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        if (!user?.id) return;
        setOrdersLoading(true);
        try {
            const res = await getMyOrders(user.id);
            if (res.success) {
                const ordersArray = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.orders) ? res.data.orders : [];
                setOrders(ordersArray);
                setOrderCount(ordersArray.length);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setOrdersLoading(false);
        }
    }, [user?.id]);

    // ── Fetch addresses ──────────────────────────────────────────────
    const fetchAddresses = useCallback(async () => {
        if (!user?.id) return;
        setAddressesLoading(true);
        try {
            const res = await getAddresses(user.id);
            if (res.success && Array.isArray(res.data)) {
                setAddresses(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
        } finally {
            setAddressesLoading(false);
        }
    }, [user?.id]);

    // ── Fetch profile ────────────────────────────────────────────────
    const fetchProfile = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await getCustomerProfile(user.id);
            if (res.success && res.data) {
                setProfileData({
                    full_name: res.data.full_name || '',
                    email: res.data.email || '',
                    phone: res.data.phone || '',
                    date_of_birth: res.data.date_of_birth ? res.data.date_of_birth.split('T')[0] : '',
                    is_email_verified: !!res.data.is_email_verified,
                    is_mobile_verified: !!res.data.is_mobile_verified,
                });
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    }, [user?.id]);

    // ── Fetch profile image ──────────────────────────────────────────
    const fetchProfileImage = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await getProfileImage(user.id);
            if (res.success && res.data?.profile_image) {
                const mime = res.data.mime_type || 'image/jpeg';
                setProfileImageUrl(`data:${mime};base64,${res.data.profile_image}`);
            }
        } catch {
            // No image or error, stay with fallback
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return;
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'addresses') fetchAddresses();
        if (activeTab === 'profile') {
            fetchOrders(); // for order count
            fetchProfile();
            fetchProfileImage();
        }
    }, [activeTab, user?.id, fetchOrders, fetchAddresses, fetchProfile, fetchProfileImage]);

    // ── Profile save handler ─────────────────────────────────────────
    const handleProfileSave = async () => {
        if (!user?.id) return;
        setProfileSaving(true);
        try {
            const res = await updateCustomerProfile(user.id, profileData);
            if (res.success) {
                toast.success('Profile updated successfully');
                setProfileEditing(false);
            } else {
                toast.error(res.message || 'Failed to update profile');
            }
        } catch {
            toast.error('Server error. Please try again.');
        } finally {
            setProfileSaving(false);
        }
    };

    // ── Image upload handler ─────────────────────────────────────────
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }

        setImageUploading(true);
        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result as string;
                setProfileImageUrl(base64); // immediate preview
                try {
                    const res = await uploadProfileImage(user.id, base64);
                    if (res.success) {
                        toast.success('Profile photo updated!');
                    } else {
                        toast.error(res.message || 'Failed to upload image');
                        setProfileImageUrl(null);
                    }
                } catch {
                    toast.error('Upload failed. Please try again.');
                    setProfileImageUrl(null);
                } finally {
                    setImageUploading(false);
                }
            };
            reader.readAsDataURL(file);
        } catch {
            setImageUploading(false);
            toast.error('Could not read file');
        }
        // Reset input so same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Remove image ─────────────────────────────────────────────────
    const handleRemoveImage = async () => {
        if (!user?.id) return;
        try {
            const res = await removeProfileImage(user.id);
            if (res.success) {
                setProfileImageUrl(null);
                toast.success('Profile photo removed');
            } else {
                toast.error(res.message || 'Failed to remove image');
            }
        } catch {
            toast.error('Server error');
        }
    };

    // ── Address handlers ─────────────────────────────────────────────
    const handleAddressSubmit = async () => {
        if (!user?.id) return;
        if (!addressForm.address_line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingAddress) {
                const res = await apiUpdateAddress(user.id, editingAddress.address_id, addressForm as unknown as Record<string, string>);
                if (res.success) {
                    toast.success('Address updated');
                } else {
                    toast.error(res.message || 'Failed to update address');
                }
            } else {
                const res = await apiAddAddress(user.id, addressForm as unknown as Record<string, string>);
                if (res.success) {
                    toast.success('Address added');
                } else {
                    toast.error(res.message || 'Failed to add address');
                }
            }
            resetAddressForm();
            fetchAddresses();
        } catch {
            toast.error('Something went wrong');
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!user?.id) return;
        try {
            const res = await apiDeleteAddress(user.id, addressId);
            if (res.success) {
                toast.success('Address deleted');
                setDeletingAddressId(null);
                fetchAddresses();
            } else {
                toast.error(res.message || 'Failed to delete address');
            }
        } catch {
            toast.error('Something went wrong');
        }
    };

    const handleSetDefault = async (addr: Address) => {
        if (!user?.id) return;
        try {
            const res = await apiUpdateAddress(user.id, addr.address_id, { is_default: 'true' } as Record<string, string>);
            if (res.success) {
                toast.success('Default address updated');
                fetchAddresses();
            } else {
                toast.error(res.message || 'Failed to set default');
            }
        } catch {
            toast.error('Something went wrong');
        }
    };

    const startEditAddress = (addr: Address) => {
        setEditingAddress(addr);
        setAddressForm({
            address_line1: addr.address_line1 || '',
            address_line2: addr.address_line2 || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
            country: addr.country || 'India',
            phone: addr.phone || '',
            label: addr.label || '',
            is_default: addr.is_default || false,
        });
        setShowAddressForm(true);
    };

    const resetAddressForm = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressForm({
            address_line1: '', address_line2: '', city: '', state: '', pincode: '',
            country: 'India', phone: '', label: '', is_default: false,
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'confirmed' || s === 'completed') return 'bg-green-100 text-green-700';
        if (s === 'shipped' || s === 'processing') return 'bg-blue-100 text-blue-700';
        if (s === 'delivered') return 'bg-purple-100 text-purple-700';
        if (s === 'cancelled') return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
        { id: 'orders', label: 'Orders', icon: Package, count: orderCount },
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
                            onClick={() => router.push(`/account/${tab.id}`)}
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

                {/* ═══════════════════ ORDERS TAB ═══════════════════ */}
                {activeTab === 'orders' && (
                    <div>
                        {ordersLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="rounded-2xl border border-light-border bg-white py-16 text-center">
                                <Package className="mx-auto h-12 w-12 text-warm-gray/40 mb-3" />
                                <p className="font-serif text-lg text-charcoal">No orders yet</p>
                                <p className="mt-1 text-sm text-warm-gray">Your orders will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.order_id} className="rounded-xl border border-light-border bg-white p-6">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                            <div>
                                                <p className="font-mono text-sm font-semibold text-charcoal">{order.order_id}</p>
                                                <p className="text-xs text-warm-gray">{new Date(order.created_at).toLocaleDateString('en-US')}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.order_status)}`}>
                                                    {order.order_status}
                                                </span>
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.payment_status?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {order.payment_status || 'Unpaid'}
                                                </span>
                                            </div>
                                        </div>
                                        {order.items && order.items.length > 0 && (
                                            <div className="space-y-2 border-t border-light-border pt-3">
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between text-sm">
                                                        <span className="text-charcoal">{item.product_name || 'Product'} × {item.quantity}</span>
                                                        <span className="text-warm-gray">${(item.unit_price * item.quantity).toLocaleString('en-US')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-3 border-t border-light-border pt-3 flex justify-between">
                                            <span className="font-serif text-sm font-semibold text-burgundy">Total</span>
                                            <span className="font-serif text-sm font-bold text-burgundy">${order.total_amount?.toLocaleString('en-US')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════ WISHLIST TAB ═══════════════════ */}
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

                {/* ═══════════════════ ADDRESSES TAB ═══════════════════ */}
                {activeTab === 'addresses' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="font-serif text-lg font-bold text-charcoal">Address Book</h2>
                                <p className="text-sm text-warm-gray mt-0.5">Manage your delivery addresses</p>
                            </div>
                            {!showAddressForm && (
                                <button
                                    onClick={() => {
                                        resetAddressForm();
                                        setShowAddressForm(true);
                                    }}
                                    className="flex items-center gap-2 rounded-lg bg-burgundy px-4 py-2.5 text-sm font-semibold text-white hover:bg-burgundy-dark transition-all hover:shadow-md"
                                >
                                    <Plus className="h-4 w-4" /> Add Address
                                </button>
                            )}
                        </div>

                        {/* Address Form (animated) */}
                        {showAddressForm && (
                            <div
                                className="mb-6 rounded-2xl border border-light-border bg-white overflow-hidden shadow-sm"
                                style={{ animation: 'slideDown 0.3s ease-out' }}
                            >
                                {/* Form header accent */}
                                <div className="h-1" style={{ background: 'linear-gradient(90deg, #6B2737, #D4A847)' }} />
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="font-serif text-base font-bold text-charcoal">
                                            {editingAddress ? 'Edit Address' : 'New Address'}
                                        </h3>
                                        <button onClick={resetAddressForm} className="p-1.5 rounded-lg hover:bg-cream transition-colors text-warm-gray hover:text-charcoal">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-charcoal mb-1">Address Line 1 *</label>
                                            <input type="text" value={addressForm.address_line1}
                                                onChange={e => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                                                className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none transition-colors"
                                                placeholder="Street address" />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-charcoal mb-1">Address Line 2</label>
                                            <input type="text" value={addressForm.address_line2}
                                                onChange={e => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                                                className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none transition-colors"
                                                placeholder="Apartment, suite, etc." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-charcoal mb-1">City *</label>
                                            <input type="text" value={addressForm.city}
                                                onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none transition-colors"
                                                placeholder="City" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-charcoal mb-1">State *</label>
                                            <input type="text" value={addressForm.state}
                                                onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                                                className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none transition-colors"
                                                placeholder="State" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-charcoal mb-1">Pincode *</label>
                                            <input type="text" value={addressForm.pincode}
                                                onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                                className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none transition-colors"
                                                placeholder="Pincode" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-charcoal mb-1">Country</label>
                                            <input type="text" value={addressForm.country}
                                                onChange={e => setAddressForm({ ...addressForm, country: e.target.value })}
                                                className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none transition-colors"
                                                placeholder="Country" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
                                            <input type="tel" value={addressForm.phone}
                                                onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none transition-colors"
                                                placeholder="Phone number" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-charcoal mb-1">Label</label>
                                            <div className="flex gap-2">
                                                {['Home', 'Office', 'Other'].map(l => (
                                                    <button key={l} type="button"
                                                        onClick={() => setAddressForm({ ...addressForm, label: l })}
                                                        className={`rounded-lg px-4 py-2.5 text-sm font-medium border transition-all ${addressForm.label === l
                                                            ? 'border-burgundy bg-burgundy/5 text-burgundy'
                                                            : 'border-light-border text-warm-gray hover:border-burgundy/30'}`
                                                        }>
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={addressForm.is_default}
                                                    onChange={e => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                                                    className="rounded border-light-border text-burgundy focus:ring-burgundy w-4 h-4" />
                                                <span className="text-sm text-charcoal">Set as default address</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mt-5 flex gap-3">
                                        <button onClick={handleAddressSubmit}
                                            className="rounded-lg bg-burgundy px-6 py-2.5 text-sm font-semibold text-white hover:bg-burgundy-dark transition-all hover:shadow-md">
                                            {editingAddress ? 'Update Address' : 'Save Address'}
                                        </button>
                                        <button onClick={resetAddressForm}
                                            className="rounded-lg border border-light-border px-6 py-2.5 text-sm font-medium text-charcoal hover:bg-cream transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {addressesLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
                            </div>
                        ) : addresses.length === 0 && !showAddressForm ? (
                            <div className="rounded-2xl border border-light-border bg-white py-16 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream">
                                    <MapPin className="h-8 w-8 text-warm-gray/50" />
                                </div>
                                <p className="font-serif text-lg text-charcoal">No saved addresses</p>
                                <p className="mt-1 text-sm text-warm-gray mb-5">Add your first delivery address</p>
                                <button
                                    onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
                                    className="rounded-lg bg-burgundy px-5 py-2.5 text-sm font-semibold text-white hover:bg-burgundy-dark transition-colors"
                                >
                                    <Plus className="inline h-4 w-4 mr-1 -mt-0.5" /> Add Address
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {addresses.map(addr => (
                                    <div key={addr.address_id}
                                        className={`group relative rounded-xl border bg-white p-5 transition-all hover:shadow-md ${addr.is_default ? 'border-burgundy/30 ring-1 ring-burgundy/10' : 'border-light-border'}`}
                                    >
                                        {/* Default badge */}
                                        {addr.is_default && (
                                            <div className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                                                style={{ background: 'linear-gradient(135deg, #D4A847, #B8902D)' }}>
                                                <Star className="h-2.5 w-2.5" fill="white" /> DEFAULT
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start">
                                            <div className="pt-1">
                                                {addr.label && (
                                                    <span className="inline-block rounded-full bg-burgundy/10 px-2.5 py-0.5 text-[10px] font-bold text-burgundy uppercase mb-2">
                                                        {addr.label}
                                                    </span>
                                                )}
                                                <p className="text-sm font-medium text-charcoal">{addr.address_line1}</p>
                                                {addr.address_line2 && <p className="text-sm text-warm-gray">{addr.address_line2}</p>}
                                                <p className="text-sm text-warm-gray">{addr.city}, {addr.state} {addr.pincode}</p>
                                                {addr.country && addr.country !== 'India' && (
                                                    <p className="text-sm text-warm-gray">{addr.country}</p>
                                                )}
                                                {addr.phone && (
                                                    <p className="mt-2 text-sm text-charcoal flex items-center gap-1.5">
                                                        <Phone className="h-3 w-3 text-warm-gray" /> {addr.phone}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!addr.is_default && (
                                                    <button onClick={() => handleSetDefault(addr)}
                                                        title="Set as default"
                                                        className="p-2 text-warm-gray hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50">
                                                        <Star className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => startEditAddress(addr)}
                                                    className="p-2 text-warm-gray hover:text-burgundy transition-colors rounded-lg hover:bg-burgundy/5">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setDeletingAddressId(addr.address_id)}
                                                    className="p-2 text-warm-gray hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════ PROFILE TAB ═══════════════════ */}
                {activeTab === 'profile' && (
                    <div className="max-w-2xl space-y-6">

                        {/* ── Profile Card with Avatar ── */}
                        <div className="rounded-2xl border border-light-border bg-white overflow-hidden shadow-sm">
                            {/* Header gradient */}
                            <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, #6B2737 0%, #8B3A4A 40%, #D4A847 100%)' }}>
                                <div className="absolute -bottom-12 left-6">
                                    <div className="relative group">
                                        {/* Avatar */}
                                        <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-cream-dark flex items-center justify-center">
                                            {profileImageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="font-serif text-3xl font-bold text-burgundy">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </span>
                                            )}

                                            {/* Upload overlay */}
                                            {imageUploading && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Camera button */}
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={imageUploading}
                                            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-burgundy text-white flex items-center justify-center shadow-md hover:bg-burgundy-dark transition-all hover:scale-110 disabled:opacity-50"
                                        >
                                            <Camera className="h-3.5 w-3.5" />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                {/* Edit / save button */}
                                <div className="absolute top-4 right-4">
                                    {profileEditing ? (
                                        <div className="flex gap-2">
                                            <button onClick={handleProfileSave} disabled={profileSaving}
                                                className="flex items-center gap-1.5 rounded-lg bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-colors disabled:opacity-50">
                                                {profileSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                Save
                                            </button>
                                            <button onClick={() => { setProfileEditing(false); fetchProfile(); }}
                                                className="flex items-center gap-1.5 rounded-lg bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-colors">
                                                <X className="h-3 w-3" /> Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setProfileEditing(true)}
                                            className="flex items-center gap-1.5 rounded-lg bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-colors">
                                            <Pencil className="h-3 w-3" /> Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="pt-16 px-6 pb-6">
                                {/* Photo actions */}
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={() => fileInputRef.current?.click()}
                                        className="text-xs font-medium text-burgundy hover:text-burgundy-dark transition-colors">
                                        Change Photo
                                    </button>
                                    {profileImageUrl && (
                                        <>
                                            <span className="text-warm-gray/30">|</span>
                                            <button onClick={handleRemoveImage}
                                                className="text-xs font-medium text-warm-gray hover:text-red-500 transition-colors">
                                                Remove Photo
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Profile fields */}
                                <div className="space-y-4">
                                    {/* Full Name */}
                                    <div className="flex items-center gap-3 py-3 border-b border-light-border">
                                        <User className="h-4 w-4 text-warm-gray flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium text-warm-gray uppercase tracking-wider">Full Name</p>
                                            {profileEditing ? (
                                                <input type="text" value={profileData.full_name}
                                                    onChange={e => setProfileData({ ...profileData, full_name: e.target.value })}
                                                    className="w-full mt-0.5 text-sm text-charcoal font-medium bg-transparent border-b border-burgundy/30 focus:border-burgundy focus:outline-none py-0.5 transition-colors" />
                                            ) : (
                                                <p className="text-sm text-charcoal font-medium mt-0.5">{profileData.full_name || '—'}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center gap-3 py-3 border-b border-light-border">
                                        <Mail className="h-4 w-4 text-warm-gray flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium text-warm-gray uppercase tracking-wider">Email Address</p>
                                            {profileEditing ? (
                                                <input type="email" value={profileData.email}
                                                    onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                                    className="w-full mt-0.5 text-sm text-charcoal font-medium bg-transparent border-b border-burgundy/30 focus:border-burgundy focus:outline-none py-0.5 transition-colors" />
                                            ) : (
                                                <p className="text-sm text-charcoal font-medium mt-0.5">{profileData.email || '—'}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-center gap-3 py-3 border-b border-light-border">
                                        <Phone className="h-4 w-4 text-warm-gray flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium text-warm-gray uppercase tracking-wider">Phone Number</p>
                                            {profileEditing ? (
                                                <input type="tel" value={profileData.phone}
                                                    onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                                    className="w-full mt-0.5 text-sm text-charcoal font-medium bg-transparent border-b border-burgundy/30 focus:border-burgundy focus:outline-none py-0.5 transition-colors"
                                                    placeholder="Add phone number" />
                                            ) : (
                                                <p className="text-sm text-charcoal font-medium mt-0.5">{profileData.phone || 'Not provided'}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="flex items-center gap-3 py-3">
                                        <Calendar className="h-4 w-4 text-warm-gray flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium text-warm-gray uppercase tracking-wider">Date of Birth</p>
                                            {profileEditing ? (
                                                <input type="date" value={profileData.date_of_birth}
                                                    onChange={e => setProfileData({ ...profileData, date_of_birth: e.target.value })}
                                                    className="w-full mt-0.5 text-sm text-charcoal font-medium bg-transparent border-b border-burgundy/30 focus:border-burgundy focus:outline-none py-0.5 transition-colors" />
                                            ) : (
                                                <p className="text-sm text-charcoal font-medium mt-0.5">
                                                    {profileData.date_of_birth
                                                        ? new Date(profileData.date_of_birth + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                                        : 'Not provided'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Verification Status ── */}
                        <div className="rounded-2xl border border-light-border bg-white overflow-hidden shadow-sm">
                            <div className="h-1" style={{ background: 'linear-gradient(90deg, #6B2737, #D4A847)' }} />
                            <div className="p-6">
                                <h3 className="font-serif text-base font-bold text-charcoal mb-4">Verification Status</h3>
                                <div className="space-y-3">
                                    {/* Email Verification */}
                                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-cream/50 border border-light-border">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${profileData.is_email_verified ? 'bg-green-100' : 'bg-amber-100'}`}>
                                                <Mail className={`h-4 w-4 ${profileData.is_email_verified ? 'text-green-600' : 'text-amber-600'}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-charcoal">Email Address</p>
                                                <p className="text-xs text-warm-gray">{profileData.email}</p>
                                            </div>
                                        </div>
                                        {profileData.is_email_verified ? (
                                            <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => router.push('/verify-email')}
                                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:shadow-md"
                                                style={{ backgroundColor: '#D4A847' }}
                                            >
                                                <AlertCircle className="h-3.5 w-3.5" /> Verify Now
                                            </button>
                                        )}
                                    </div>

                                    {/* Mobile Verification */}
                                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-cream/50 border border-light-border">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${profileData.is_mobile_verified ? 'bg-green-100' : 'bg-amber-100'}`}>
                                                <Smartphone className={`h-4 w-4 ${profileData.is_mobile_verified ? 'text-green-600' : 'text-amber-600'}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-charcoal">Mobile Number</p>
                                                <p className="text-xs text-warm-gray">{profileData.phone || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        {profileData.is_mobile_verified ? (
                                            <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => router.push('/verify-otp')}
                                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:shadow-md"
                                                style={{ backgroundColor: '#D4A847' }}
                                            >
                                                <AlertCircle className="h-3.5 w-3.5" /> Verify Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Quick Stats ── */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="rounded-xl border border-light-border bg-white p-4 text-center">
                                <p className="font-serif text-2xl font-bold text-burgundy">{orderCount}</p>
                                <p className="text-xs text-warm-gray mt-1">Orders</p>
                            </div>
                            <div className="rounded-xl border border-light-border bg-white p-4 text-center">
                                <p className="font-serif text-2xl font-bold text-burgundy">{wishlistItems.length}</p>
                                <p className="text-xs text-warm-gray mt-1">Wishlist</p>
                            </div>
                            <div className="rounded-xl border border-light-border bg-white p-4 text-center">
                                <p className="font-serif text-2xl font-bold text-burgundy">{addresses.length}</p>
                                <p className="text-xs text-warm-gray mt-1">Addresses</p>
                            </div>
                        </div>

                        {/* ── Account Control ── */}
                        <div className="rounded-xl border p-6" style={{ borderColor: 'rgba(107, 39, 55, 0.2)', backgroundColor: 'rgba(107, 39, 55, 0.03)' }}>
                            <div className="flex items-start gap-3 mb-4">
                                <ShieldOff className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#6B2737' }} />
                                <div>
                                    <h3 className="font-serif text-base font-bold" style={{ color: '#6B2737' }}>Account Control</h3>
                                    <p className="mt-1 text-sm text-warm-gray leading-relaxed">
                                        Deactivating your account will log you out and hide your profile.
                                        Your data — orders, wishlist, and addresses — will be safely preserved.
                                        You can reactivate anytime by signing in again.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setDeactivatePassword(''); setShowDeactivateModal(true); }}
                                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md"
                                style={{ backgroundColor: '#6B2737' }}
                            >
                                Deactivate My Account
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══ Deactivation Confirmation Modal ═══ */}
                {showDeactivateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeactivateModal(false)} />
                        <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-light-border" style={{ animation: 'slideUp 0.35s ease-out' }}>
                            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #6B2737, #D4A847)' }} />
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(107, 39, 55, 0.1)' }}>
                                <ShieldOff className="h-7 w-7" style={{ color: '#6B2737' }} />
                            </div>
                            <h2 className="text-center font-serif text-xl font-bold text-charcoal mb-2">Confirm Deactivation</h2>
                            <p className="text-center text-sm text-warm-gray mb-6">
                                Please enter your password to confirm account deactivation.
                            </p>
                            <input
                                type="password"
                                value={deactivatePassword}
                                onChange={e => setDeactivatePassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full rounded-lg border border-light-border px-4 py-3 text-sm focus:border-burgundy focus:outline-none mb-6"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeactivateModal(false)}
                                    disabled={deactivating}
                                    className="flex-1 rounded-xl border border-light-border py-3 text-sm font-medium text-charcoal hover:bg-cream transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!deactivatePassword) { toast.error('Password is required'); return; }
                                        setDeactivating(true);
                                        try {
                                            const res = await deactivateAccount(deactivatePassword);
                                            if (res.success) {
                                                setShowDeactivateModal(false);
                                                logout();
                                                toast.success('Account deactivated. You can reactivate anytime.');
                                                router.push('/');
                                            } else {
                                                toast.error(res.message || 'Failed to deactivate account');
                                            }
                                        } catch {
                                            toast.error('Server error. Please try again.');
                                        } finally {
                                            setDeactivating(false);
                                        }
                                    }}
                                    disabled={deactivating || !deactivatePassword}
                                    className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:shadow-md disabled:opacity-50"
                                    style={{ backgroundColor: '#6B2737' }}
                                >
                                    {deactivating ? 'Deactivating...' : 'Deactivate'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ Delete Address Confirmation Modal ═══ */}
                {deletingAddressId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeletingAddressId(null)} />
                        <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-light-border" style={{ animation: 'slideUp 0.25s ease-out' }}>
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                                <Trash2 className="h-5 w-5 text-red-500" />
                            </div>
                            <h3 className="text-center font-serif text-lg font-bold text-charcoal mb-1">Delete Address?</h3>
                            <p className="text-center text-sm text-warm-gray mb-5">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeletingAddressId(null)}
                                    className="flex-1 rounded-xl border border-light-border py-2.5 text-sm font-medium text-charcoal hover:bg-cream transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => deletingAddressId && handleDeleteAddress(deletingAddressId)}
                                    className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Keyframe animations */}
                <style jsx>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(20px) scale(0.97); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    @keyframes slideDown {
                        from { opacity: 0; max-height: 0; transform: translateY(-10px); }
                        to { opacity: 1; max-height: 800px; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </div>
    );
}
