'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface AgeVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerified: () => void;
}

export default function AgeVerificationModal({ isOpen, onClose, onVerified }: AgeVerificationModalProps) {
    const { verifyUserAge } = useAuth();
    const [dob, setDob] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await verifyUserAge(dob);
        setLoading(false);

        if (res.success) {
            onVerified();
        } else {
            setError(res.error || 'Verification failed. You must differ from the minimum age requirement.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#1a1a1a] border border-[#d4af37]/30 p-8 rounded-xl shadow-2xl relative">
                <h2 className="text-2xl font-serif text-[#d4af37] mb-4 text-center">Age Verification Required</h2>
                <p className="text-gray-300 text-center mb-6">
                    Please confirm your date of birth to complete this purchase.
                    You must be of legal drinking age.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-[#d4af37] mb-1">Date of Birth</label>
                        <input
                            type="date"
                            required
                            max={new Date().toISOString().split('T')[0]}
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full bg-[#2a2a2a] border border-gray-600 text-white rounded p-3 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#d4af37] text-black font-semibold py-3 rounded hover:bg-[#b5952f] transition disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify Age & Continue'}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full text-gray-400 text-sm hover:text-white mt-2"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
