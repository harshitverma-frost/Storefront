'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface CountryDropdownProps {
    options: string[];
    selected: string;
    onChange: (value: string) => void;
}

export default function CountryDropdown({ options, selected, onChange }: CountryDropdownProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="py-4 border-b border-light-border/60">
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className="flex w-full items-center justify-between group"
                aria-expanded={open}
            >
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/70 group-hover:text-burgundy transition-colors">
                    Country
                </span>
                {open
                    ? <ChevronUp className="h-4 w-4 text-warm-gray/60 group-hover:text-burgundy transition-colors" />
                    : <ChevronDown className="h-4 w-4 text-warm-gray/60 group-hover:text-burgundy transition-colors" />
                }
            </button>

            {open && (
                <div className="mt-3 animate-fade-in" style={{ animation: 'fadeInDown 0.18s ease' }}>
                    <div className="relative">
                        <select
                            value={selected}
                            onChange={e => onChange(e.target.value)}
                            className={`
                                w-full appearance-none rounded-lg border px-3.5 py-2.5 pr-9 text-sm
                                bg-white text-charcoal cursor-pointer
                                transition-all duration-200 ease-in-out
                                ${selected
                                    ? 'border-burgundy/50 ring-1 ring-burgundy/10 text-charcoal font-medium'
                                    : 'border-light-border text-warm-gray/70'
                                }
                                focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/10
                                hover:border-burgundy/30
                            `}
                        >
                            <option value="">All Countries</option>
                            {options.map(country => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                        {/* Custom chevron icon (covers native arrow) */}
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                            <ChevronDown className="h-4 w-4 text-warm-gray/60" />
                        </span>
                    </div>

                    {/* Active country badge */}
                    {selected && (
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-burgundy" />
                            <span className="text-xs font-medium text-burgundy">{selected}</span>
                            <button
                                type="button"
                                onClick={() => onChange('')}
                                className="ml-auto text-[11px] text-warm-gray/60 hover:text-burgundy transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
