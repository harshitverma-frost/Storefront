'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, X, ShoppingCart, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
    const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

    const shippingCost = totalPrice > 50 ? 0 : 5;
    const grandTotal = totalPrice + shippingCost;

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="mx-auto h-16 w-16 text-warm-gray/40 mb-4" />
                    <h1 className="font-serif text-2xl font-bold text-charcoal">Your Cart is Empty</h1>
                    <p className="mt-2 text-warm-gray">Explore our wines and add something you like</p>
                    <Link
                        href="/products"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-burgundy px-8 py-3 text-sm font-semibold text-white hover:bg-burgundy-dark transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream">
            {/* Step Indicator */}
            <div className="border-b border-light-border bg-white py-6">
                <div className="mx-auto max-w-4xl flex items-center justify-center gap-8">
                    {['Cart', 'Address', 'Payment', 'Confirmation'].map((step, i) => (
                        <div key={step} className="flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${i === 0 ? 'bg-burgundy text-white' : 'bg-cream-dark text-warm-gray'
                                }`}>
                                {i + 1}
                            </div>
                            <span className={`text-sm font-medium ${i === 0 ? 'text-burgundy' : 'text-warm-gray'}`}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-10">
                <h1 className="font-serif text-3xl font-bold text-charcoal mb-8">Your Cart</h1>

                <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
                    {/* Cart Items */}
                    <div className="space-y-4">
                        {items.map(item => {
                            const price = item.product.price ?? 350000;
                            return (
                                <div
                                    key={item.product.product_id}
                                    className="flex items-center gap-4 rounded-xl border border-light-border bg-white p-4 sm:p-6 transition-all hover:shadow-sm"
                                >
                                    {/* Image */}
                                    <div className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-lg bg-cream-dark flex items-center justify-center">
                                        <span className="text-4xl">🍷</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-serif text-base font-semibold text-charcoal truncate">
                                            {item.product.product_name}
                                        </h3>
                                        {item.product.brand && (
                                            <p className="text-xs text-warm-gray mt-0.5">{item.product.brand}</p>
                                        )}
                                        <p className="mt-1 font-serif text-lg font-bold text-burgundy">
                                            ${price.toLocaleString('en-US')}
                                        </p>
                                    </div>

                                    {/* Quantity */}
                                    <div className="flex items-center rounded-lg border border-light-border">
                                        <button
                                            onClick={() => updateQuantity(item.product.product_id, item.quantity - 1)}
                                            className="px-2.5 py-1.5 text-warm-gray hover:text-charcoal"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium text-charcoal">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product.product_id, item.quantity + 1)}
                                            className="px-2.5 py-1.5 text-warm-gray hover:text-charcoal"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() => { removeItem(item.product.product_id); toast.success('Removed from cart'); }}
                                        className="p-2 text-warm-gray hover:text-red-500 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-8 lg:mt-0">
                        <div className="sticky top-24 rounded-xl border border-light-border bg-white p-6">
                            <h2 className="font-serif text-lg font-bold text-charcoal mb-4">Order Summary</h2>

                            <div className="space-y-3 text-sm border-b border-light-border pb-4 mb-4">
                                {items.map(item => {
                                    const price = item.product.price ?? 350000;
                                    return (
                                        <div key={item.product.product_id} className="flex items-start gap-3">
                                            <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-cream-dark flex items-center justify-center">
                                                <span className="text-lg">🍷</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-charcoal font-medium truncate">{item.product.product_name}</p>
                                                <p className="text-xs text-warm-gray">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-charcoal font-medium">${(price * item.quantity).toLocaleString('en-US')}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-warm-gray">Subtotal</span>
                                    <span className="text-charcoal">${totalPrice.toLocaleString('en-US')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-warm-gray">Shipping</span>
                                    <span className="text-charcoal">{shippingCost === 0 ? 'Free' : `$${shippingCost.toLocaleString('en-US')}`}</span>
                                </div>
                            </div>

                            <div className="mt-4 border-t border-light-border pt-4 flex justify-between">
                                <span className="font-serif text-lg font-bold text-burgundy">Total</span>
                                <span className="font-serif text-lg font-bold text-burgundy">${grandTotal.toLocaleString('en-US')}</span>
                            </div>

                            <Link
                                href="/checkout"
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-burgundy py-3 text-sm font-semibold text-white transition-all hover:bg-burgundy-dark"
                            >
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Continue Shopping */}
                <div className="mt-8">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 rounded-lg border border-light-border px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
