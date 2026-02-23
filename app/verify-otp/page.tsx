'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOtp, sendOtp } from '@/lib/api';
import toast from 'react-hot-toast';
import { Smartphone, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

function VerifyOTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const methodFromParams = searchParams.get('method') || 'sms';

    // Auth context to ensure user is logged in (as verify_otp is a protected route in backend)
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(30);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Focus first input on mount
    useEffect(() => {
        if (!authLoading && isAuthenticated && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [authLoading, isAuthenticated]);

    // Auth redirection
    if (!authLoading && !isAuthenticated) {
        if (typeof window !== 'undefined') {
            router.push('/login');
        }
        return null;
    }

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const pastedData = value.substring(0, 6).split('');
            const newOtp = [...otp];
            pastedData.forEach((char, i) => {
                if (index + i < 6) newOtp[index + i] = char.replace(/\D/g, '');
            });
            setOtp(newOtp);
            // Focus last filled input
            const nextIndex = Math.min(index + pastedData.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        // Clean non-digits
        const numValue = value.replace(/\D/g, '');
        const newOtp = [...otp];
        newOtp[index] = numValue;
        setOtp(newOtp);

        // Move focus up
        if (numValue && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        try {
            setResendCooldown(60); // 60s cooldown
            const res = await sendOtp();
            if (res.success) {
                toast.success('A new code has been sent.');
            } else {
                toast.error(res.error || 'Failed to resend code');
                setResendCooldown(0);
            }
        } catch {
            toast.error('Failed to resend code');
            setResendCooldown(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            toast.error('Please enter the 6-digit code');
            return;
        }

        setLoading(true);

        try {
            const result = await verifyOtp(code);
            if (result?.success) {
                toast.success('Phone verified successfully!');
                router.push('/account');
            } else {
                // Clear inputs on failure
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                toast.error(result?.error || result?.message || 'Invalid code');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            toast.error('Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-burgundy/10 flex items-center justify-center">
                        <Smartphone className="w-8 h-8 text-burgundy" />
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-charcoal">
                        Enter Verification Code
                    </h1>
                    <p className="mt-2 text-sm text-warm-gray">
                        We've sent a 6-digit code to your {methodFromParams === 'email' ? 'email address' : 'mobile phone'}.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-light-border bg-white p-8 shadow-sm flex flex-col items-center"
                >
                    <div className="flex gap-2 justify-center mb-8 w-full">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                pattern="\d*"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-2xl font-bold rounded-lg border border-light-border bg-gray-50 focus:bg-white focus:border-burgundy focus:outline-none focus:ring-1 focus:ring-burgundy transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.some(d => !d)}
                        className="w-full rounded-lg bg-burgundy py-3 text-sm font-semibold text-white transition-all hover:bg-burgundy-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify Code'}
                    </button>

                    <div className="mt-6 flex flex-col items-center gap-3">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-warm-gray hover:text-burgundy'
                                }`}
                        >
                            <RotateCcw className="w-4 h-4" />
                            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                        </button>

                        <Link href="/account" className="text-sm font-medium text-warm-gray hover:text-burgundy transition-colors mt-2">
                            Skip for now
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-cream flex items-center justify-center px-4">
                <div className="w-8 h-8 border-2 border-burgundy/30 border-t-burgundy rounded-full animate-spin" />
            </div>
        }>
            <VerifyOTPContent />
        </Suspense>
    );
}
