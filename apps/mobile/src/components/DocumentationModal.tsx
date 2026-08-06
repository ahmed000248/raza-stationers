import React from 'react';
import { X, CheckCircle2, ShieldCheck, Database, Key, Server } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#051f20]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h2 className="font-display font-semibold text-lg text-[#051f20]">
              Mobile Platform & API Integration Architecture
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Raza Stationers — Cross-Platform Integration Documentation
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-xs text-stone-700 leading-relaxed">
          {/* Section 1 */}
          <div className="bg-[#f2f7f5] p-4 rounded-2xl border border-[#a3c5a8]/40">
            <div className="flex items-center gap-2 font-semibold text-[#163832] text-sm mb-2">
              <Server size={16} />
              1. Better Auth & Next.js API Integration
            </div>
            <p className="mb-2">
              The mobile client connects seamlessly to the existing Next.js backend API and Better Auth authentication engine.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-stone-600">
              <li>
                <strong>Session Token Re-use:</strong> Uses the same session tokens and HTTP-only cookies / Bearer tokens as the web application (`phase-9-betterauth`).
              </li>
              <li>
                <strong>Unified Auth Endpoint:</strong> `/api/auth/session` validates authentication status, role flags, and tier membership (`guest`, `pending`, `wholesale`).
              </li>
              <li>
                <strong>Phone & Password Auth:</strong> Mobile login supports phone numbers and passwords matching the database accounts.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2 font-semibold text-amber-900 text-sm mb-2">
              <Database size={16} />
              2. Supabase Database & Multi-Tier Pricing
            </div>
            <p className="mb-2">
              Queries the same Supabase database as the website without modifying the database schema:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-amber-900/80">
              <li>
                <strong>ProductUnit Mapping:</strong> Products support multiple units (Piece, Dozen, Carton, Ream, Pack) with dedicated retail and wholesale prices.
              </li>
              <li>
                <strong>Tier Resolution Rule (CD-04):</strong> Prices are strictly resolved server-side before rendering. Raw discount percentages are never shown.
              </li>
              <li>
                <strong>Pending Approval State:</strong> Pending wholesale registrants automatically see standard catalog prices and a pending notification banner until admin approval.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 font-semibold text-[#051f20] text-sm mb-2">
              <Key size={16} />
              3. Environment Configuration (.env.example)
            </div>
            <pre className="bg-[#051f20] text-emerald-400 p-3 rounded-xl overflow-x-auto text-[11px] font-mono leading-tight">
              {`# Backend API Base URL
EXPO_PUBLIC_API_URL="https://api.razastationers.com"

# Supabase Public Keys
EXPO_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Better Auth Secret
BETTER_AUTH_URL="https://api.razastationers.com"`}
            </pre>
          </div>

          {/* Section 4 */}
          <div>
            <div className="flex items-center gap-2 font-semibold text-[#051f20] text-sm mb-2">
              <CheckCircle2 size={16} className="text-[#163832]" />
              4. Features & Deliverables Included
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
              <li className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-200">
                <ShieldCheck size={14} className="text-[#163832]" /> Complete Native UI Flow
              </li>
              <li className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-200">
                <ShieldCheck size={14} className="text-[#163832]" /> Dynamic Unit Calculation
              </li>
              <li className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-200">
                <ShieldCheck size={14} className="text-[#163832]" /> Delivery Zone Calculation
              </li>
              <li className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-200">
                <ShieldCheck size={14} className="text-[#163832]" /> Pay-Later Business Credit
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#163832] text-white font-semibold text-xs rounded-full hover:bg-[#0b2924] transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
