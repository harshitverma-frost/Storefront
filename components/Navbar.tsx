'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu, X, Heart, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getCategories } from '@/lib/api';

interface Category {
  category_id: string;
  parent_id: string | null;
  name: string;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
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
    <header className="w-full">
      {/* ================= TOP THIN BAR ================= */}
      <div className="text-white text-xs tracking-wide bg-gradient-to-r from-[#5A0012] via-[#8B0000] to-[#5A0012]">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-2">
          <div className="flex gap-6">
            <span>Store Locator</span>
            <Link href="/login" className="hover:text-[#FFD700] transition-colors">Log in / Sign up</Link>
            <Link href="/account" className="hover:text-[#FFD700] transition-colors">Track Orders</Link>
          </div>
          <span className="hidden md:block text-sm text-[#FFD700]">
            ✦ Thank you for choosing us ✦
          </span>
        </div>
      </div>

      {/* ================= WHITE LOGO SECTION ================= */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-20 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/KSP-Wines-logo.webp"
                alt="KSP Wines"
                className="h-40 w-auto"
              />
            </Link>

            {/* Center Promo */}
            <div className="hidden md:flex items-center gap-10 text-sm">
              <div className="text-center">
                <p className="font-semibold text-gray-800">Fast delivery</p>
                <p className="text-xs text-gray-500">Within 2 hours</p>
              </div>

              <div className="text-center">
                <p className="font-semibold text-gray-800">Promotion</p>
                <p className="text-xs text-gray-500">10% discount</p>
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4">
              <Link href="/wishlist" className="relative p-2">
                <Heart className="h-5 w-5 text-gray-700 hover:text-[#7B1E3A]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C6A75E] text-white text-[10px] h-5 w-5 flex items-center justify-center rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="relative p-2">
                <ShoppingCart className="h-5 w-5 text-gray-700 hover:text-[#7B1E3A]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#7B1E3A] text-white text-[10px] h-5 w-5 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>

              <Link href="/account">
                <User className="h-5 w-5 text-gray-700 hover:text-[#7B1E3A]" />
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden"
              >
                {mobileOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CATEGORY BAR ================= */}
      <div className="bg-gradient-to-r from-[#5A0012] via-[#8B0000] to-[#5A0012]">
        <div className="mx-auto max-w-7xl px-6 relative">
          <nav className="flex items-center justify-between h-12 text-white font-medium uppercase tracking-wider text-sm">

            {/* Links */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/" className="hover:text-[#FFD700] transition-colors duration-300">Home</Link>
              <Link href="/products" className="hover:text-[#FFD700] transition-colors duration-300">Shop All</Link>

              {/* Dynamic Categories with Hover Subcategories */}
              {parentCategories.map(parent => {
                const subs = categories.filter(c => c.parent_id === parent.category_id);
                return (
                  <div key={parent.category_id} className="relative group flex items-center h-12">
                    <Link href={`/products?category=${encodeURIComponent(parent.name)}`} className="flex items-center gap-1 hover:text-[#FFD700] transition-colors duration-300 cursor-pointer">
                      {parent.name}
                      {subs.length > 0 && <ChevronDown className="h-4 w-4" />}
                    </Link>

                    {/* Dropdown Menu */}
                    {subs.length > 0 && (
                      <div className="absolute top-12 left-0 w-48 bg-white text-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border-t-2 border-[#8B0000]">
                        <div className="py-2 flex flex-col">
                          {subs.map(sub => (
                            <Link
                              key={sub.category_id}
                              href={`/products?category=${encodeURIComponent(sub.name)}`}
                              className="px-4 py-2 text-sm hover:bg-[#8B0000] hover:text-white transition-colors duration-200"
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

            {/* Hotline */}
            <div className="hidden md:flex items-center gap-2 font-semibold">
              <span className="text-[#C6A75E]">✆</span>
              <span>
                Hotline : <span className="text-[#FFD700]">090 202 5806</span>
              </span>
            </div>
          </nav>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-md border-t absolute w-full z-50">
          <nav className="flex flex-col p-4 gap-3">
            <Link href="/" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-[#7B1E3A] font-medium">Home</Link>
            <Link href="/products" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-[#7B1E3A] font-medium">Shop All</Link>

            {parentCategories.map(parent => (
              <div key={parent.category_id} className="flex flex-col gap-2">
                <Link href={`/products?category=${encodeURIComponent(parent.name)}`} onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-[#7B1E3A] font-bold">
                  {parent.name}
                </Link>
                <div className="flex flex-col pl-4 gap-2 border-l-2 border-gray-100 ml-2">
                  {categories.filter(c => c.parent_id === parent.category_id).map(sub => (
                    <Link
                      key={sub.category_id}
                      href={`/products?category=${encodeURIComponent(sub.name)}`}
                      onClick={() => setMobileOpen(false)}
                      className="text-gray-500 hover:text-[#7B1E3A] text-sm"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
