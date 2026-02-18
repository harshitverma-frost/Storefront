// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
// import { useCart } from '@/context/CartContext';
// import { useWishlist } from '@/context/WishlistContext';

// const navLinks = [
//     { href: '/', label: 'Home' },
//     { href: '/products', label: 'Shoop' },
//     { href: '/about', label: 'About Us' },
//     { href: '/contact', label: 'Contact Us' },
// ];

// export default function Navbar() {
//     const [mobileOpen, setMobileOpen] = useState(false);
//     const [searchOpen, setSearchOpen] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const { totalItems } = useCart();
//     const { totalItems: wishlistCount } = useWishlist();

//     const handleSearch = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (searchQuery.trim()) {
//             window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
//         }
//     };

//     return (
//         <header className="sticky top-0 z-50 glass border-light-border bg-white/90 backdrop-blur-md">
//             <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//                 <div className="flex h-16 items-center justify-between">
//                     {/* Logo */}
//                     <Link href="/" className="flex items-center gap-2">
//                         <img src="/KSP-Wines-logo.webp" alt="KSP Wines" className="h-8 w-auto" />
//                     </Link>

//                     {/* Desktop Nav */}
//                     <nav className="hidden md:flex items-center gap-8">
//                         {navLinks.map(link => (
//                             <Link
//                                 key={link.href}
//                                 href={link.href}
//                                 className="text-sm font-serif font-medium text-charcoal hover:text-burgundy transition-colors duration-200"
//                             >
//                                 {link.label}
//                             </Link>
//                         ))}
//                     </nav>

//                     {/* Right Icons */}
//                     <div className="flex items-center gap-3">
//                         {/* Search Toggle */}
//                         <button
//                             onClick={() => setSearchOpen(!searchOpen)}
//                             className="p-2 text-charcoal hover:text-burgundy transition-colors"
//                             aria-label="Search"
//                         >
//                             <Search className="h-5 w-5" />
//                         </button>

//                         {/* Wishlist */}
//                         <Link href="/account" className="relative p-2 text-charcoal hover:text-burgundy transition-colors">
//                             <Heart className="h-5 w-5" />
//                             {wishlistCount > 0 && (
//                                 <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-burgundy text-[10px] font-bold text-white">
//                                     {wishlistCount}
//                                 </span>
//                             )}
//                         </Link>

//                         {/* Cart */}
//                         <Link href="/cart" className="relative p-2 text-charcoal hover:text-burgundy transition-colors">
//                             <ShoppingCart className="h-5 w-5" />
//                             {totalItems > 0 && (
//                                 <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-burgundy text-[10px] font-bold text-white">
//                                     {totalItems}
//                                 </span>
//                             )}
//                         </Link>

//                         {/* Account */}
//                         <Link href="/login" className="p-2 text-charcoal hover:text-burgundy transition-colors">
//                             <User className="h-5 w-5" />
//                         </Link>

//                         {/* Mobile menu toggle */}
//                         <button
//                             onClick={() => setMobileOpen(!mobileOpen)}
//                             className="p-2 text-charcoal hover:text-burgundy transition-colors md:hidden"
//                             aria-label="Menu"
//                         >
//                             {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Search Bar */}
//                 {searchOpen && (
//                     <div className="animate-slide-down border-t border-light-border py-3">
//                         <form onSubmit={handleSearch} className="flex gap-2">
//                             <input
//                                 type="text"
//                                 value={searchQuery}
//                                 onChange={e => setSearchQuery(e.target.value)}
//                                 placeholder="Search wines..."
//                                 className="flex-1 rounded-lg border border-light-border bg-white px-4 py-2 text-sm focus:border-burgundy focus:outline-none"
//                                 autoFocus
//                             />
//                             <button
//                                 type="submit"
//                                 className="rounded-lg bg-burgundy px-6 py-2 text-sm font-medium text-white hover:bg-burgundy-dark transition-colors"
//                             >
//                                 Search
//                             </button>
//                         </form>
//                     </div>
//                 )}
//             </div>

//             {/* Mobile Nav */}
//             {mobileOpen && (
//                 <div className="animate-slide-down border-t border-light-border md:hidden">
//                     <nav className="space-y-1 px-4 py-4">
//                         {navLinks.map(link => (
//                             <Link
//                                 key={link.href}
//                                 href={link.href}
//                                 onClick={() => setMobileOpen(false)}
//                                 className="block rounded-lg px-3 py-2 text-sm font-medium text-charcoal hover:bg-cream-dark hover:text-burgundy transition-colors"
//                             >
//                                 {link.label}
//                             </Link>
//                         ))}
//                     </nav>
//                 </div>
//             )}
//         </header>
//     );
// }



// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { Search, ShoppingCart, User, Menu, X, Heart, Phone } from 'lucide-react';
// import { useCart } from '@/context/CartContext';
// import { useWishlist } from '@/context/WishlistContext';

// const navLinks = [
//     { href: '/', label: 'Home' },
//     { href: '/products', label: 'Shop' },
//     { href: '/about', label: 'About Us' },
//     { href: '/contact', label: 'Contact Us' },
// ];

// export default function Navbar() {
//     const [mobileOpen, setMobileOpen] = useState(false);
//     const [searchOpen, setSearchOpen] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const { totalItems } = useCart();
//     const { totalItems: wishlistCount } = useWishlist();

//     const handleSearch = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (searchQuery.trim()) {
//             window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
//         }
//     };

//     return (
//         <header className="sticky top-0 z-50 shadow-md">

//             {/* TOP INFO BAR */}
//             <div className="hidden md:flex items-center justify-between bg-[#7B1E3A] px-8 py-2 text-xs text-white tracking-wide">
//                 <div className="flex gap-6">
//                     <span>Fast Delivery Within 2 Hours</span>
//                     <span>Premium Imported Wines & Spirits</span>
//                 </div>
//                 <div className="flex items-center gap-2 font-semibold">
//                     <Phone className="h-4 w-4" />
//                     <span>Hotline: 090 202 5806</span>
//                 </div>
//             </div>

//             {/* MAIN NAV */}
//             <div className="bg-white">
//                 <div className="mx-auto max-w-7xl px-6">
//                     <div className="flex h-20 items-center justify-between">

//                         {/* Logo */}
//                         <Link href="/" className="flex items-center gap-3">
//                             <img
//                                 src="/KSP-Wines-logo.webp"
//                                 alt="KSP Wines"
//                                 className="h-10 w-auto"
//                             />

//                         </Link>

//                         {/* Desktop Nav */}
//                         <nav className="hidden md:flex items-center gap-10">
//                             {navLinks.map(link => (
//                                 <Link
//                                     key={link.href}
//                                     href={link.href}
//                                     className="relative text-sm font-serif font-medium uppercase tracking-wider text-gray-800 transition duration-300 hover:text-[#7B1E3A]"
//                                 >
//                                     {link.label}
//                                     <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#C6A75E] transition-all duration-300 group-hover:w-full"></span>
//                                 </Link>
//                             ))}
//                         </nav>

//                         {/* Right Icons */}
//                         <div className="flex items-center gap-4">

//                             {/* Search */}
//                             <button
//                                 onClick={() => setSearchOpen(!searchOpen)}
//                                 className="p-2 text-gray-700 hover:text-[#7B1E3A] transition"
//                             >
//                                 <Search className="h-5 w-5" />
//                             </button>

//                             {/* Wishlist */}
//                             <Link href="/wishlist" className="relative p-2 text-gray-700 hover:text-[#7B1E3A] transition">
//                                 <Heart className="h-5 w-5" />
//                                 {wishlistCount > 0 && (
//                                     <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C6A75E] text-[10px] font-bold text-white shadow">
//                                         {wishlistCount}
//                                     </span>
//                                 )}
//                             </Link>

//                             {/* Cart */}
//                             <Link href="/cart" className="relative p-2 text-gray-700 hover:text-[#7B1E3A] transition">
//                                 <ShoppingCart className="h-5 w-5" />
//                                 {totalItems > 0 && (
//                                     <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7B1E3A] text-[10px] font-bold text-white shadow">
//                                         {totalItems}
//                                     </span>
//                                 )}
//                             </Link>

//                             {/* Account */}
//                             <Link href="/login" className="p-2 text-gray-700 hover:text-[#7B1E3A] transition">
//                                 <User className="h-5 w-5" />
//                             </Link>

//                             {/* Mobile Toggle */}
//                             <button
//                                 onClick={() => setMobileOpen(!mobileOpen)}
//                                 className="p-2 text-gray-700 md:hidden"
//                             >
//                                 {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Search Bar */}
//                 {searchOpen && (
//                     <div className="border-t border-gray-200 bg-white py-4 shadow-inner">
//                         <div className="mx-auto max-w-5xl px-6">
//                             <form onSubmit={handleSearch} className="flex gap-3">
//                                 <input
//                                     type="text"
//                                     value={searchQuery}
//                                     onChange={e => setSearchQuery(e.target.value)}
//                                     placeholder="Search premium wines..."
//                                     className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-[#7B1E3A] focus:outline-none"
//                                 />
//                                 <button
//                                     type="submit"
//                                     className="rounded-md bg-[#7B1E3A] px-6 py-2 text-sm font-medium text-white hover:bg-[#65152F] transition"
//                                 >
//                                     Search
//                                 </button>
//                             </form>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Mobile Menu */}
//             {mobileOpen && (
//                 <div className="md:hidden border-t border-gray-200 bg-white shadow-md">
//                     <nav className="space-y-2 px-6 py-4">
//                         {navLinks.map(link => (
//                             <Link
//                                 key={link.href}
//                                 href={link.href}
//                                 onClick={() => setMobileOpen(false)}
//                                 className="block text-sm font-medium text-gray-700 hover:text-[#7B1E3A]"
//                             >
//                                 {link.label}
//                             </Link>
//                         ))}
//                     </nav>
//                 </div>
//             )}
//         </header>
//     );
// }




'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const categoryLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();

  return (
    <header className="w-full">

      {/* ================= TOP THIN BAR ================= */}
      <div className="text-white text-xs tracking-wide bg-gradient-to-r from-[#5A0012] via-[#8B0000] to-[#5A0012]">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-2">
          <div className="flex gap-6">
            <span>Store Locator</span>
            <span>Log in / Sign up</span>
            <span>Track Orders</span>
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

              <Link href="/login">
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
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex items-center justify-between h-12 text-white font-medium uppercase tracking-wider text-sm">

            {/* Links */}
            <div className="hidden md:flex items-center gap-1">
              {categoryLinks.map((link, index) => (
                <span key={link.href} className="flex items-center">
                  <Link
                    href={link.href}
                    className="relative group px-3 py-1 rounded hover:bg-white/10"
                  >
                    <span className="group-hover:text-[#FFD700] transition-colors duration-300">
                      {link.label}
                    </span>
                  </Link>
                  {index < categoryLinks.length - 1 && (
                    <span className="text-[#C6A75E]/40 text-xs">│</span>
                  )}
                </span>
              ))}
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
        <div className="md:hidden bg-white shadow-md border-t">
          <nav className="flex flex-col p-4 gap-3">
            {categoryLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-gray-700 hover:text-[#7B1E3A]"
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
