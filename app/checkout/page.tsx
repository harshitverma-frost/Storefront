'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { checkoutOrder, directCheckout, getAddresses } from '@/lib/api';
import { Address } from '@/types';
import { CheckCircle, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, clearCart, cartId } = useCart();
    const { user, isAuthenticated, verifyUserAge } = useAuth();
    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // Age Verification State
    const [showAgeModal, setShowAgeModal] = useState(false);
    const [dob, setDob] = useState('');
    const [verifyingAge, setVerifyingAge] = useState(false);

    // Saved addresses
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [addressesLoading, setAddressesLoading] = useState(false);

    // New address form fields (matching backend)
    const [newAddress, setNewAddress] = useState({
        address_line1: '', address_line2: '', city: '', state: '', pincode: '', phone: '',
    });

    const shippingCost = totalPrice > 50 ? 0 : 5;
    const grandTotal = totalPrice + shippingCost;

    // Load saved addresses for logged-in users
    useEffect(() => {
        if (user?.id) {
            setAddressesLoading(true);
            getAddresses(user.id)
                .then(res => {
                    if (res.success && Array.isArray(res.data)) {
                        setSavedAddresses(res.data);
                        // Auto-select default or first address
                        const defaultAddr = res.data.find((a: Address) => a.is_default) || res.data[0];
                        if (defaultAddr) {
                            setSelectedAddressId(defaultAddr.address_id);
                        } else {
                            setUseNewAddress(true);
                        }
                    } else {
                        setUseNewAddress(true);
                    }
                })
                .catch(() => setUseNewAddress(true))
                .finally(() => setAddressesLoading(false));
        } else {
            setUseNewAddress(true);
        }
    }, [user?.id]);

    useEffect(() => {
        if (items.length === 0 && !orderPlaced) {
            router.push('/cart');
        }
    }, [items.length, orderPlaced, router]);

    if (items.length === 0 && !orderPlaced) {
        return null;
    }

    const handlePlaceOrder = async () => {
        // Validate address
        if (useNewAddress) {
            if (!newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
                toast.error('Please fill in all required address fields');
                return;
            }
        } else if (!selectedAddressId) {
            toast.error('Please select a shipping address');
            return;
        }

        if (isAuthenticated && user && !user.is_age_verified) {
            setShowAgeModal(true);
            return;
        }

        setPlacing(true);

        try {
            let result;

            if (isAuthenticated && cartId && user?.id) {
                // Cart-based checkout for logged-in users
                result = await checkoutOrder({
                    cart_id: cartId,
                    customer_id: user.id,
                    shipping_address_id: useNewAddress ? undefined : selectedAddressId || undefined,
                });
            } else {
                // Direct checkout fallback (guest or no cart)
                const orderItems = items.map(item => ({
                    product_id: item.product_id || '',
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    unit_price: Number(item.price) || 0,
                }));

                result = await directCheckout({
                    customer_id: user?.id || undefined,
                    customer_name: user?.name || undefined,
                    customer_email: user?.email || undefined,
                    items: orderItems,
                    shipping_address: useNewAddress ? newAddress as unknown as Record<string, string> : undefined,
                    payment_method: 'cod',
                });
            }

            if (result.success) {
                setOrderId(result.data?.order_id || null);
                await clearCart(true);
                setOrderPlaced(true);
                setStep(3);
                toast.success('Order placed successfully!');
            } else {
                toast.error(result.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setPlacing(false);
        }
    };

    const handleVerifyAge = async () => {
        if (!dob) {
            toast.error('Please enter your date of birth');
            return;
        }
        setVerifyingAge(true);
        try {
            const res = await verifyUserAge(dob);
            if (res.success) {
                toast.success('Age verified successfully!');
                setShowAgeModal(false);
                // After success, recursively call handlePlaceOrder, but since user state updates asynchronously
                // we might need to rely on the updated user.is_age_verified. But the API already succeeded so 
                // we'll just bypass the check by calling handlePlaceOrder immediately. However, since the state needs time to update,
                // let's manually update the state or just bypass the check
            } else {
                toast.error(res.error || 'You must be 18 or older to purchase.');
            }
        } catch (error) {
            toast.error('Something went wrong verifying your age.');
        } finally {
            setVerifyingAge(false);
        }
    };

    // Auto-proceed checkout when is_age_verified becomes true
    useEffect(() => {
        if (isAuthenticated && user?.is_age_verified && showAgeModal) {
            toast.success('Age verified. Placing order...');
            setShowAgeModal(false);
            handlePlaceOrder();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.is_age_verified]);

    // Order Confirmation
    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                    <CheckCircle className="mx-auto h-20 w-20 text-green-600 mb-6" />
                    <h1 className="font-serif text-3xl font-bold text-charcoal">Order Confirmed!</h1>
                    {orderId && (
                        <p className="mt-2 text-sm font-mono text-warm-gray">Order ID: {orderId}</p>
                    )}
                    <p className="mt-3 text-warm-gray">
                        Thank you for your order. We&apos;ll send you an email confirmation shortly.
                    </p>
                    <div className="mt-8 flex flex-col gap-3">
                        <Link
                            href="/account"
                            className="rounded-lg bg-burgundy py-3 text-sm font-semibold text-white hover:bg-burgundy-dark transition-colors"
                        >
                            View Order History
                        </Link>
                        <Link
                            href="/products"
                            className="rounded-lg border border-light-border py-3 text-sm font-medium text-charcoal hover:bg-white transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream">
            {/* Step Indicator */}
            <div className="border-b border-light-border bg-white py-6">
                <div className="mx-auto max-w-4xl flex items-center justify-center gap-8">
                    {['Cart', 'Address', 'Payment', 'Confirmation'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${i <= step ? 'bg-burgundy text-white' : 'bg-cream-dark text-warm-gray'
                                }`}>
                                {i + 1}
                            </div>
                            <span className={`text-sm font-medium hidden sm:inline ${i <= step ? 'text-burgundy' : 'text-warm-gray'}`}>
                                {s}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-10">
                {step === 1 && (
                    <div>
                        <h1 className="font-serif text-2xl font-bold text-charcoal mb-6">Shipping Address</h1>

                        {/* Saved Addresses */}
                        {addressesLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-burgundy" />
                            </div>
                        ) : savedAddresses.length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-charcoal mb-3">Select a saved address:</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {savedAddresses.map(addr => (
                                        <label
                                            key={addr.address_id}
                                            className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${selectedAddressId === addr.address_id && !useNewAddress
                                                ? 'border-burgundy bg-burgundy/5'
                                                : 'border-light-border hover:border-burgundy/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="address"
                                                checked={selectedAddressId === addr.address_id && !useNewAddress}
                                                onChange={() => { setSelectedAddressId(addr.address_id); setUseNewAddress(false); }}
                                                className="mt-1 accent-burgundy"
                                            />
                                            <div>
                                                {addr.label && <span className="text-xs font-bold text-burgundy uppercase">{addr.label}</span>}
                                                <p className="text-sm text-charcoal">{addr.address_line1}</p>
                                                {addr.address_line2 && <p className="text-sm text-warm-gray">{addr.address_line2}</p>}
                                                <p className="text-sm text-warm-gray">{addr.city}, {addr.state} {addr.pincode}</p>
                                                {addr.phone && <p className="text-xs text-warm-gray mt-1">📞 {addr.phone}</p>}
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setUseNewAddress(true)}
                                    className={`mt-3 flex items-center gap-2 text-sm font-medium transition-colors ${useNewAddress ? 'text-burgundy' : 'text-warm-gray hover:text-charcoal'}`}
                                >
                                    <MapPin className="h-4 w-4" /> Use a new address
                                </button>
                            </div>
                        )}

                        {/* New Address Form */}
                        {useNewAddress && (
                            <div className="rounded-xl border border-light-border bg-white p-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-charcoal mb-1">Address Line 1 *</label>
                                        <input
                                            type="text"
                                            value={newAddress.address_line1}
                                            onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                                            className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                                            placeholder="Street address"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-charcoal mb-1">Address Line 2</label>
                                        <input
                                            type="text"
                                            value={newAddress.address_line2}
                                            onChange={e => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                                            className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                                            placeholder="Apartment, suite, etc."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-1">City *</label>
                                        <input
                                            type="text"
                                            value={newAddress.city}
                                            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                            className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-1">State *</label>
                                        <input
                                            type="text"
                                            value={newAddress.state}
                                            onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                                            className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                                            placeholder="State"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-1">Pincode *</label>
                                        <input
                                            type="text"
                                            value={newAddress.pincode}
                                            onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                            className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                                            placeholder="Pincode"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={newAddress.phone}
                                            onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                            className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                                            placeholder="Phone number"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setStep(2)}
                            className="mt-6 w-full rounded-lg bg-burgundy py-3 text-sm font-semibold text-white hover:bg-burgundy-dark transition-colors"
                        >
                            Continue to Payment
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h1 className="font-serif text-2xl font-bold text-charcoal mb-6">Payment</h1>
                        <div className="rounded-xl border border-light-border bg-white p-6">
                            <div className="space-y-4 mb-6">
                                <label className="flex items-center gap-3 rounded-lg border border-light-border p-4 cursor-pointer hover:border-burgundy transition-colors">
                                    <input type="radio" name="payment" defaultChecked className="accent-burgundy" />
                                    <span className="text-sm font-medium text-charcoal">Cash on Delivery (COD)</span>
                                </label>
                                <label className="flex items-center gap-3 rounded-lg border border-light-border p-4 cursor-pointer hover:border-burgundy transition-colors">
                                    <input type="radio" name="payment" className="accent-burgundy" />
                                    <span className="text-sm font-medium text-charcoal">Bank Transfer</span>
                                </label>
                            </div>

                            {/* Order Summary */}
                            <div className="border-t border-light-border pt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-warm-gray">Subtotal ({items.length} items)</span>
                                    <span>${totalPrice.toLocaleString('en-US')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-warm-gray">Shipping</span>
                                    <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toLocaleString('en-US')}`}</span>
                                </div>
                                <div className="flex justify-between font-serif text-lg font-bold text-burgundy pt-2 border-t border-light-border mt-2">
                                    <span>Total</span><span>${grandTotal.toLocaleString('en-US')}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="rounded-lg border border-light-border px-6 py-3 text-sm font-medium text-charcoal hover:bg-cream transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={placing}
                                    className="flex-1 rounded-lg bg-burgundy py-3 text-sm font-semibold text-white hover:bg-burgundy-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {placing ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</>
                                    ) : (
                                        `Place Order — $${grandTotal.toLocaleString('en-US')}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Age Verification Modal */}
            {showAgeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" style={{ animation: 'slideUp 0.3s ease-out' }}>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream-dark">
                            <span className="font-serif text-2xl font-bold text-burgundy">18+</span>
                        </div>
                        <h2 className="text-center font-serif text-2xl font-bold text-charcoal mb-2">Age Verification Required</h2>
                        <p className="text-center text-sm text-warm-gray mb-6">
                            You must be at least 18 years old to purchase alcohol. Please enter your date of birth to continue checkout.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    className="w-full rounded-lg border border-light-border px-4 py-3 text-sm focus:border-burgundy focus:outline-none"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowAgeModal(false)}
                                    className="flex-1 rounded-lg border border-light-border py-3 text-sm font-medium text-charcoal hover:bg-cream transition-colors"
                                    disabled={verifyingAge}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleVerifyAge}
                                    disabled={verifyingAge || !dob}
                                    className="flex-1 rounded-lg bg-burgundy py-3 text-sm font-semibold text-white hover:bg-burgundy-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {verifyingAge ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Place Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
