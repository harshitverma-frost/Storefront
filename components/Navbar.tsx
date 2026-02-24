'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu, X, Heart, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { getCategories } from '@/lib/api';
import toast from 'react-hot-toast';

interface Category {
  category_id: string;
  parent_id: string | null;
  name: string;
}

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  const handleWishlistClick = () => {
    if (isAuthenticated) {
      router.push('/account/wishlist');
    } else {
      toast('Please sign in to view your wishlist');
      router.push('/login');
    }
  };
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(cats => {
      if (Array.isArray(cats)) {
        setCategories(cats);
      }
    });
  }, []);

  const parentCategories = categories.filter(c => !c.parent_id);

  return (
    <header className="w-full sticky top-0 z-[100]">

      {/* ═══════════════ MAIN NAVBAR (White) ═══════════════ */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <img
                src="/KSP-Wines-logo.png"
                alt="KSP Wines"
                className="h-55 w-auto"
              />
            </Link>

            {/* Center Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-[13px] font-semibold uppercase tracking-widest text-gray-700 hover:text-[#4b0f1a] transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-[13px] font-semibold uppercase tracking-widest text-gray-700 hover:text-[#4b0f1a] transition-colors duration-200"
              >
                Shop
              </Link>
              <Link
                href="/about"
                className="text-[13px] font-semibold uppercase tracking-widest text-gray-700 hover:text-[#4b0f1a] transition-colors duration-200"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-[13px] font-semibold uppercase tracking-widest text-gray-700 hover:text-[#4b0f1a] transition-colors duration-200"
              >
                Contact
              </Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              <button onClick={handleWishlistClick} className="relative p-2 group">
                <Heart className="h-[20px] w-[20px] text-gray-600 group-hover:text-[#4b0f1a] transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#4b0f1a] text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <Link href="/account" className="relative p-2 group">
                <User className="h-[20px] w-[20px] text-gray-600 group-hover:text-[#4b0f1a] transition-colors" />
              </Link>

              <Link href="/cart" className="relative p-2 group">
                <ShoppingCart className="h-[20px] w-[20px] text-gray-600 group-hover:text-[#4b0f1a] transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#4b0f1a] text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ THIN STRIP BAR ═══════════════ */}
      <div className="hidden md:block" style={{ backgroundColor: '#4b0f1a' }}>
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex items-center justify-between h-9 text-[12px] tracking-wide">

            {/* LEFT — Track Orders + Categories */}
            <div className="flex items-center gap-5">
              <Link
                href="/account"
                className="text-[#C6A75E] hover:text-[#FFD700] transition-colors duration-200 font-medium"
              >
                Track Orders
              </Link>

              <span className="text-[#C6A75E]/30">|</span>

              {/* Categories with Mega Dropdown */}
              <div className="relative group flex items-center h-9">
                <button className="flex items-center gap-1 text-[#C6A75E] hover:text-[#FFD700] transition-colors duration-200 font-medium cursor-pointer">
                  Categories
                  <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
                </button>

                {/* Dropdown */}
                <div className="absolute top-9 left-0 min-w-[280px] bg-white text-gray-800 shadow-2xl rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[200] border-t-[3px] border-[#C6A75E]">
                  <div className="py-2">
                    {parentCategories.map(parent => {
                      const subs = categories.filter(c => c.parent_id === parent.category_id);
                      return (
                        <div key={parent.category_id} className="relative group/cat">
                          <Link
                            href={`/products?category=${encodeURIComponent(parent.name)}`}
                            className="flex items-center justify-between px-5 py-2.5 text-sm font-medium hover:bg-[#fdf6ee] hover:text-[#4b0f1a] transition-colors duration-150"
                          >
                            {parent.name}
                            {subs.length > 0 && (
                              <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-gray-400" />
                            )}
                          </Link>

                          {/* Sub-category flyout */}
                          {subs.length > 0 && (
                            <div className="absolute left-full top-0 min-w-[220px] bg-white shadow-xl rounded-r-lg opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible transition-all duration-200 z-[210] border-l border-gray-100">
                              <div className="py-2">
                                {subs.map(sub => (
                                  <Link
                                    key={sub.category_id}
                                    href={`/products?category=${encodeURIComponent(sub.name)}`}
                                    className="block px-5 py-2 text-sm text-gray-600 hover:bg-[#4b0f1a] hover:text-white transition-colors duration-150"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* CENTER — Golden Message */}
            <span className="text-[#C6A75E] font-medium tracking-wider text-[11px]">
              ✦ Thank You for Choosing Us ✦
            </span>

            {/* RIGHT — Hotline */}
            <div className="flex items-center gap-1.5 font-medium text-[#C6A75E]">
              <span className="text-sm">✆</span>
              <span>
                Hotline:{' '}
                <span className="text-[#FFD700] font-semibold">090 202 5806</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ MOBILE MENU ═══════════════ */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-lg border-t absolute w-full z-[200] max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col p-5 gap-1">

            {/* Main links */}
            <Link href="/" onClick={() => setMobileOpen(false)} className="py-2.5 px-3 text-gray-700 hover:bg-[#fdf6ee] hover:text-[#4b0f1a] rounded-lg font-semibold text-sm uppercase tracking-wide">
              Home
            </Link>
            <Link href="/products" onClick={() => setMobileOpen(false)} className="py-2.5 px-3 text-gray-700 hover:bg-[#fdf6ee] hover:text-[#4b0f1a] rounded-lg font-semibold text-sm uppercase tracking-wide">
              Shop
            </Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="py-2.5 px-3 text-gray-700 hover:bg-[#fdf6ee] hover:text-[#4b0f1a] rounded-lg font-semibold text-sm uppercase tracking-wide">
              About Us
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="py-2.5 px-3 text-gray-700 hover:bg-[#fdf6ee] hover:text-[#4b0f1a] rounded-lg font-semibold text-sm uppercase tracking-wide">
              Contact
            </Link>
            <Link href="/account" onClick={() => setMobileOpen(false)} className="py-2.5 px-3 text-gray-700 hover:bg-[#fdf6ee] hover:text-[#4b0f1a] rounded-lg font-semibold text-sm uppercase tracking-wide">
              Track Orders
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-100 my-2" />

            {/* Categories */}
            <p className="px-3 text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Categories</p>
            {parentCategories.map(parent => (
              <div key={parent.category_id} className="flex flex-col">
                <Link
                  href={`/products?category=${encodeURIComponent(parent.name)}`}
                  onClick={() => setMobileOpen(false)}
                  className="py-2 px-3 text-gray-800 hover:text-[#4b0f1a] font-semibold text-sm"
                >
                  {parent.name}
                </Link>
                {categories.filter(c => c.parent_id === parent.category_id).map(sub => (
                  <Link
                    key={sub.category_id}
                    href={`/products?category=${encodeURIComponent(sub.name)}`}
                    onClick={() => setMobileOpen(false)}
                    className="py-1.5 pl-7 pr-3 text-gray-500 hover:text-[#4b0f1a] text-sm border-l-2 border-gray-100 ml-4"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            ))}

            {/* Hotline */}
            <div className="border-t border-gray-100 my-2" />
            <p className="px-3 text-xs text-gray-500">
              ✆ Hotline: <span className="font-semibold text-[#4b0f1a]">090 202 5806</span>
            </p>
          </nav>
        </div>
      )}
    </header>
  );
}
