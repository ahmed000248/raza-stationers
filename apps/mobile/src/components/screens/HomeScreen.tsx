import React from 'react';
import { Search, ShoppingBag, BookOpen, PenTool, FileText, Paperclip, ArrowRight, Check } from 'lucide-react';
import { AccountTier, Product } from '../../types';
import { formatPKR, getPriceCaption, getResolvedPrice } from '../../lib/local-catalogue';

interface HomeScreenProps {
  accountTier: AccountTier;
  featuredProducts: Product[];
  cartCount: number;
  onOpenCatalogue: (category?: string) => void;
  onOpenProduct: (productId: string) => void;
  onOpenCart: () => void;
  onOpenRegister: () => void;
  onQuickAdd: (product: Product) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  accountTier,
  featuredProducts,
  cartCount,
  onOpenCatalogue,
  onOpenProduct,
  onOpenCart,
  onOpenRegister,
  onQuickAdd
}) => {
  const categories = [
    { name: 'Notebooks', icon: BookOpen },
    { name: 'Pens & Markers', icon: PenTool },
    { name: 'Paper', icon: FileText },
    { name: 'Office Supplies', icon: Paperclip }
  ];

  const priceCaption = getPriceCaption(accountTier);

  return (
    <div className="pb-28 px-4 pt-3 space-y-5">
      {/* Search & Cart Floating Header Pill */}
      <div className="flex items-center justify-between gap-2 bg-white border border-stone-200 shadow-xs rounded-full p-2">
        <button
          type="button"
          onClick={() => onOpenCatalogue()}
          className="flex-1 flex items-center gap-2 text-stone-500 hover:text-[#051f20] px-3 text-xs"
        >
          <Search size={16} className="text-[#163832]" />
          <span>Search notebook, pens, paper...</span>
        </button>

        <button
          type="button"
          onClick={onOpenCart}
          className="relative w-9 h-9 rounded-full bg-[#163832] text-white flex items-center justify-center transition-transform active:scale-90"
          aria-label="View shopping cart"
        >
          <ShoppingBag size={16} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Account Status Hero Banner */}
      {accountTier === 'guest' && (
        <div className="bg-[#0b2924] rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#a3c5a8] text-[#051f20] font-semibold text-[10px] mb-2">
              Wholesale Business Account
            </span>
            <h2 className="font-display font-semibold text-base text-white">
              Unlock Bulk Wholesale Pricing
            </h2>
            <p className="text-xs text-stone-200 mt-1 max-w-[260px]">
              Register your stationery shop or business to unlock lower per-unit pricing.
            </p>
            <button
              type="button"
              onClick={onOpenRegister}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#a3c5a8] text-[#051f20] rounded-full font-semibold text-xs hover:bg-white transition-colors"
            >
              <span>Register Business Account</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {accountTier === 'pending' && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-amber-900 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-xs text-amber-950">
                Wholesale Registration Submitted
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Standard catalog prices apply until verification completes. You will be notified once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {accountTier === 'wholesale' && (
        <div className="bg-[#f2f7f5] border border-[#a3c5a8]/60 rounded-2xl p-3.5 text-[#163832] shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-[#051f20] flex items-center gap-1.5">
                <Check size={14} className="text-[#163832]" />
                Approved Wholesale Account
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Wholesale tier prices active for all products
              </p>
            </div>
            <span className="text-xs font-bold text-[#163832] bg-white px-2.5 py-1 rounded-full border border-[#a3c5a8]">
              Wholesale Active
            </span>
          </div>
        </div>
      )}

      {/* Shop by Category */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="font-display font-semibold text-sm text-[#051f20]">
            Shop by Category
          </h2>
          <button
            type="button"
            onClick={() => onOpenCatalogue()}
            className="text-xs text-[#163832] font-semibold hover:underline"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => onOpenCatalogue(cat.name)}
                className="flex flex-col items-center text-center p-2 rounded-xl bg-white border border-stone-200 hover:border-[#a3c5a8] transition-all hover:shadow-xs group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#f2f7f5] group-hover:bg-[#163832] group-hover:text-white text-[#163832] flex items-center justify-center transition-colors mb-1.5">
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-medium text-[#051f20] leading-tight">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* New & Restocked Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="font-display font-semibold text-sm text-[#051f20]">
            New & Restocked Items
          </h2>
          <span className="text-[11px] text-stone-500">{priceCaption}</span>
        </div>

        <div className="space-y-3">
          {featuredProducts.map((p) => {
            const price = getResolvedPrice(p, 0, accountTier);
            const unitLabel = p.units[0]?.label || 'Piece';

            return (
              <div
                key={p.id}
                className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs hover:border-[#a3c5a8] transition-all"
              >
                <div
                  onClick={() => onOpenProduct(p.id)}
                  className="flex gap-3 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#163832] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <BookOpen size={24} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#f2f7f5] text-[#163832] text-[10px] font-semibold mb-1">
                      {p.category}
                    </span>
                    <h3 className="text-xs font-semibold text-[#051f20] line-clamp-1 leading-snug">
                      {p.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-bold text-[#051f20]">
                        {formatPKR(price)}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        per {unitLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onQuickAdd(p)}
                  className="w-full mt-2.5 py-1.5 bg-[#163832] hover:bg-[#0b2924] text-white text-xs font-semibold rounded-full transition-colors active:scale-98"
                >
                  Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
