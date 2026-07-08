"use client";
import { useState } from "react";

export default function DemoBanner() {
  const [visible, setVisible] = useState(true);
  
  if (!visible) return null;
  
  return (
    <div className="bg-brand-gold px-4 py-2 flex items-center justify-between text-brand-forest text-xs font-semibold">
      <span>Preview — Demo Data Only</span>
      <button 
        onClick={() => setVisible(false)} 
        aria-label="Dismiss banner"
        className="text-brand-forest hover:text-brand-green transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
