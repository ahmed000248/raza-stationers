import React from 'react';
import { ChevronLeft, FileCode2 } from 'lucide-react';
import { AccountTier, ScreenName } from '../types';

interface HeaderProps {
  screen: ScreenName;
  title: string;
  urduTitle?: string;
  accountTier: AccountTier;
  onBack?: () => void;
  showBack: boolean;
  onOpenDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  urduTitle,
  accountTier,
  onBack,
  showBack,
  onOpenDocs
}) => {
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 flex items-center justify-between gap-2 shadow-xs transition-all">
      <div className="flex items-center gap-2 min-w-0">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-[#051f20] transition-transform active:scale-90 flex-shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-semibold text-base text-[#051f20] truncate">
              {title}
            </h1>
            {urduTitle && (
              <span className="text-xs text-[#163832]/70 font-urdu hidden sm:inline truncate">
                {urduTitle}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onOpenDocs}
          className="p-1.5 rounded-full text-stone-500 hover:text-[#163832] hover:bg-stone-100 transition-colors"
          title="Architecture & API Docs"
        >
          <FileCode2 size={18} />
        </button>

        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
            accountTier === 'wholesale'
              ? 'bg-[#f2f7f5] text-[#163832] border-[#a3c5a8]'
              : accountTier === 'pending'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-stone-100 text-stone-600 border-stone-200'
          }`}
        >
          {accountTier === 'wholesale'
            ? 'Wholesale'
            : accountTier === 'pending'
            ? 'Pending'
            : 'Guest'}
        </span>
      </div>
    </div>
  );
};
