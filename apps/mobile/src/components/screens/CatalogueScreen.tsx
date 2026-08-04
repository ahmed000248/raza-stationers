import React from 'react';
import { Search, BookOpen, PenTool, FileText, Paperclip, Filter } from 'lucide-react';
import { AccountTier, Product } from '../../types';
import { formatPKR, getPriceCaption, getResolvedPrice } from '../../lib/api';
import { StatusBadge } from '../StatusBadge';

interface CatalogueScreenProps {
  products: Product[];
  categories: readonly string[];
  selectedCategory: string;
  searchQuery: string;
  purchaseType: 'individual' | 'bulk' | 'both';
  accountTier: AccountTier;
  onSelectCategory: (category: string) => void;
  onSearchChange: (query: string) => void;
  onSelectPurchaseType: (type: 'individual' | 'bulk' | 'both') => void;
  onOpenProduct: (productId: string) => void;
  onQuickAdd: (product: Product, unitIndex: number) => void;
  subscribedNotify: Record<string, boolean>;
  onToggleNotify: (productId: string) => void;
}

export const CatalogueScreen: React.FC<CatalogueScreenProps> = ({
  products,
  categories,
  selectedCategory,
  searchQuery,
  purchaseType,
  accountTier,
  onSelectCategory,
  onSearchChange,
  onSelectPurchaseType,
  onOpenProduct,
  onQuickAdd,
  subscribedNotify,
  onToggleNotify
}) => {
  const priceCaption = getPriceCaption(accountTier);

  return (
    <div className="pb-28 px-4 pt-3 space-y-4">
      {/* Title & Search */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display font-bold text-lg text-[#051f20]">
            Product Catalogue
          </h1>
          <span className="text-[11px] font-medium text-stone-500">
            {priceCaption}
          </span>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notebooks, pens, paper..."
            className="w-full bg-white border border-stone-200 rounded-full pl-9 pr-4 py-2 text-xs text-[#051f20] placeholder-stone-400 focus:outline-none focus:border-[#163832]"
          />
        </div>
      </div>

      {/* Horizontal Scrollable Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#163832] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Purchase Type Toggles */}
      <div className="flex items-center gap-1 bg-stone-200/60 p-1 rounded-full text-xs">
        {[
          { id: 'individual', label: 'Individual Units' },
          { id: 'bulk', label: 'Bulk Packs / Cartons' },
          { id: 'both', label: 'All Units' }
        ].map((type) => {
          const isActive = purchaseType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelectPurchaseType(type.id as any)}
              className={`flex-1 py-1 text-center rounded-full font-semibold transition-all ${
                isActive
                  ? 'bg-white text-[#051f20] shadow-xs'
                  : 'text-stone-600 hover:text-[#051f20]'
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Product List Grid */}
      {products.length === 0 ? (
        <div className="py-12 text-center text-stone-500 bg-white border border-stone-200 rounded-2xl p-6">
          <p className="text-xs">No products match your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => {
            // Determine unit based on purchaseType filter
            const defaultUnitIndex = purchaseType === 'bulk' ? p.units.length - 1 : 0;
            const unit = p.units[defaultUnitIndex] || p.units[0];
            const price = getResolvedPrice(p, defaultUnitIndex, accountTier);
            const canAdd = p.stockStatus !== 'out';
            const isSubscribed = !!subscribedNotify[p.id];

            let tone: 'success' | 'warning' | 'error' = 'success';
            if (p.stockStatus === 'low') tone = 'warning';
            if (p.stockStatus === 'out') tone = 'error';

            return (
              <div
                key={p.id}
                className="bg-white border border-stone-200 rounded-2xl p-3 flex flex-col justify-between shadow-xs hover:border-[#a3c5a8] transition-all"
              >
                <div onClick={() => onOpenProduct(p.id)} className="cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#163832] text-white flex items-center justify-center mb-2 shadow-xs">
                    <BookOpen size={18} />
                  </div>

                  <h3 className="text-xs font-semibold text-[#051f20] line-clamp-2 min-h-[32px] leading-tight">
                    {p.name}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-sm font-bold text-[#051f20]">
                      {formatPKR(price)}
                    </span>
                  </div>

                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {unit.label}
                  </div>

                  <div className="mt-2">
                    <StatusBadge label={p.stockNote} tone={tone} size="sm" />
                  </div>
                </div>

                {canAdd ? (
                  <button
                    type="button"
                    onClick={() => onQuickAdd(p, defaultUnitIndex)}
                    className="mt-3 w-full py-1.5 bg-[#163832] hover:bg-[#0b2924] text-white text-[11px] font-semibold rounded-full transition-colors active:scale-95"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onToggleNotify(p.id)}
                    className={`mt-3 w-full py-1.5 text-[10px] font-semibold rounded-full border transition-colors ${
                      isSubscribed
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed ✓' : 'Notify Me'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
