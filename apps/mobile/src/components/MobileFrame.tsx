import React from 'react';
import { AccountTier } from '../types';
import { Smartphone, Monitor } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  accountTier: AccountTier;
  onChangeTier: (tier: AccountTier) => void;
  isFullWidth: boolean;
  onToggleFullWidth: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  accountTier,
  onChangeTier,
  isFullWidth,
  onToggleFullWidth
}) => {
  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center py-6 px-3 sm:px-6">
      {/* Top Preview Controls Bar */}
      <div className="w-full max-w-xl mb-4 bg-white border border-stone-200 shadow-xs rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-1.5 bg-stone-100 rounded-full p-1 border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-500 px-2.5">
            Role State:
          </span>
          <button
            type="button"
            onClick={() => onChangeTier('guest')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              accountTier === 'guest'
                ? 'bg-[#163832] text-white shadow-xs'
                : 'text-stone-600 hover:text-[#051f20]'
            }`}
          >
            Guest
          </button>
          <button
            type="button"
            onClick={() => onChangeTier('pending')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              accountTier === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-[#051f20]'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => onChangeTier('wholesale')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              accountTier === 'wholesale'
                ? 'bg-[#163832] text-white shadow-xs'
                : 'text-stone-600 hover:text-[#051f20]'
            }`}
          >
            Wholesale
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleFullWidth}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full border border-stone-200 transition-colors"
          title="Toggle view frame mode"
        >
          {isFullWidth ? (
            <>
              <Smartphone size={14} /> Mobile Frame
            </>
          ) : (
            <>
              <Monitor size={14} /> Expanded View
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`transition-all duration-300 relative bg-[#f8faf9] overflow-hidden ${
          isFullWidth
            ? 'w-full max-w-2xl min-h-[844px] rounded-3xl border border-stone-300 shadow-2xl'
            : 'w-[390px] h-[844px] rounded-[42px] border-[10px] border-[#051f20] shadow-[0_24px_60px_rgba(5,31,32,0.22)]'
        }`}
      >
        {/* Smartphone Speaker / Notch cutout */}
        {!isFullWidth && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#051f20] rounded-b-2xl z-40 flex items-center justify-center">
            <div className="w-12 h-1 bg-stone-700 rounded-full" />
          </div>
        )}

        {/* Status Bar */}
        <div className="h-9 px-6 pt-1 flex items-center justify-between text-[11px] font-medium text-stone-700 select-none bg-[#f8faf9] z-30">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-4 h-2 border border-stone-700 rounded-xs flex items-center p-0.5">
              <div className="w-2.5 h-full bg-stone-800 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Screen Content Wrapper */}
        <div className="relative w-full h-[calc(100%-2.25rem)] overflow-y-auto bg-[#f8faf9]">
          {children}
        </div>
      </div>
    </div>
  );
};
