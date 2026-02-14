'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { totalItems } = useCart();
    const { totalItems: wishlistCount } = useWishlist();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <header className="sticky top-0 z-50 glass border-b border-light-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">🍷</span>
                        <span className="font-serif text-xl font-bold text-burgundy tracking-wide">
                            KSP <span className="text-warm-gray">— WINES</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-charcoal hover:text-burgundy transition-colors duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Icons */}
                    <div className="flex items-center gap-3">
                        {/* Search Toggle */}
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="p-2 text-charcoal hover:text-burgundy transition-colors"
                            aria-label="Search"
                        >
                            <Search className="h-5 w-5" />
                        </button>

                        {/* Wishlist */}
                        <Link href="/account" className="relative p-2 text-charcoal hover:text-burgundy transition-colors">
                            <Heart className="h-5 w-5" />
                            {wishlistCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-burgundy text-[10px] font-bold text-white">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link href="/cart" className="relative p-2 text-charcoal hover:text-burgundy transition-colors">
                            <ShoppingCart className="h-5 w-5" />
                            {totalItems > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-burgundy text-[10px] font-bold text-white">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {/* Account */}
                        <Link href="/login" className="p-2 text-charcoal hover:text-burgundy transition-colors">
                            <User className="h-5 w-5" />
                        </Link>

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 text-charcoal md:hidden"
                            aria-label="Menu"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                {searchOpen && (
                    <div className="animate-slide-down border-t border-light-border py-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search wines..."
                                className="flex-1 rounded-lg border border-light-border bg-white px-4 py-2 text-sm focus:border-burgundy focus:outline-none"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="rounded-lg bg-burgundy px-6 py-2 text-sm font-medium text-white hover:bg-burgundy-dark transition-colors"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Mobile Nav */}
            {mobileOpen && (
                <div className="animate-slide-down border-t border-light-border md:hidden">
                    <nav className="space-y-1 px-4 py-4">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-charcoal hover:bg-cream-dark hover:text-burgundy transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
