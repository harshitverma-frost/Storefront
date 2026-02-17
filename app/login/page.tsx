'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

// ⚠️ CHANGE the site key in .env.local → NEXT_PUBLIC_TURNSTILE_SITE_KEY
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

/** Extend Window to include the Turnstile API */
declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: {
                    sitekey: string;
                    callback: (token: string) => void;
                    'expired-callback'?: () => void;
                    'error-callback'?: () => void;
                    theme?: 'light' | 'dark' | 'auto';
                }
            ) => string;
            remove: (widgetId: string) => void;
            reset: (widgetId: string) => void;
        };
    }
}

export default function LoginPage() {
    const router = useRouter();
    const { login, register, isAuthenticated } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    // Turnstile CAPTCHA state
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const turnstileWidgetId = useRef<string | null>(null);
    const turnstileContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/account');
        }
    }, [isAuthenticated, router]);

    /** Render (or re-render) the Turnstile widget */
    const renderTurnstile = useCallback(() => {
        if (turnstileWidgetId.current && window.turnstile) {
            try { window.turnstile.remove(turnstileWidgetId.current); } catch { /* already removed */ }
            turnstileWidgetId.current = null;
        }
        setTurnstileToken(null);
        if (!turnstileContainerRef.current || !window.turnstile) return;
        turnstileContainerRef.current.innerHTML = '';

        const widgetId = window.turnstile.render(turnstileContainerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token: string) => setTurnstileToken(token),
            'expired-callback': () => setTurnstileToken(null),
            'error-callback': () => setTurnstileToken(null),
            theme: 'light',
        });
        turnstileWidgetId.current = widgetId;
    }, []);

    /** Initialize Turnstile once the script is loaded */
    useEffect(() => {
        const interval = setInterval(() => {
            if (window.turnstile && turnstileContainerRef.current) {
                clearInterval(interval);
                renderTurnstile();
            }
        }, 300);
        return () => {
            clearInterval(interval);
            if (turnstileWidgetId.current && window.turnstile) {
                try { window.turnstile.remove(turnstileWidgetId.current); } catch { /* ignore */ }
            }
        };
    }, [renderTurnstile]);

    /** Re-render widget when toggling Login ↔ Register */
    useEffect(() => {
        if (window.turnstile && turnstileContainerRef.current) renderTurnstile();
    }, [isRegister, renderTurnstile]);

    if (isAuthenticated) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Gate: prevent submission if CAPTCHA not completed
        if (!turnstileToken) {
            toast.error('Please complete the CAPTCHA verification');
            return;
        }

        setLoading(true);

        // TODO: Pass turnstileToken to backend when backend supports it
        let result;
        if (isRegister) {
            result = await register(form.name, form.email, form.password);
        } else {
            result = await login(form.email, form.password);
        }

        setLoading(false);

        if (result.success) {
            toast.success(isRegister ? 'Account created!' : 'Welcome back!');
            router.push('/account');
        } else {
            toast.error(result.error || 'Something went wrong');
            // Reset widget after failed attempt
            if (turnstileWidgetId.current && window.turnstile) {
                window.turnstile.reset(turnstileWidgetId.current);
                setTurnstileToken(null);
            }
        }
    };

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <span className="text-4xl block mb-3">🍷</span>
                    <h1 className="font-serif text-3xl font-bold text-charcoal">
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="mt-2 text-sm text-warm-gray">
                        {isRegister ? 'Join the KSP Wines family' : 'Sign in to your account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl border border-light-border bg-white p-8 shadow-sm">
                    {isRegister && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-charcoal mb-1">Full Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                                placeholder="Your name"
                                required
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-charcoal mb-1">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                            placeholder="••••••••"
                            required
                            minLength={3}
                        />
                    </div>

                    {/* Cloudflare Turnstile CAPTCHA Widget */}
                    <div className="mb-6 flex justify-center">
                        <div ref={turnstileContainerRef} id="turnstile-container" />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-burgundy py-3 text-sm font-semibold text-white transition-all hover:bg-burgundy-dark disabled:opacity-50"
                    >
                        {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                    </button>

                    <p className="mt-4 text-center text-sm text-warm-gray">
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => setIsRegister(!isRegister)}
                            className="font-semibold text-burgundy hover:text-burgundy-dark"
                        >
                            {isRegister ? 'Sign In' : 'Create Account'}
                        </button>
                    </p>
                </form>

                <p className="mt-6 text-center text-xs text-warm-gray">
                    By continuing, you agree to KSP Wines&apos; Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
