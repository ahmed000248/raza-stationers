import React, { useState } from 'react';
import { BookOpen, Bell, Check, ShoppingBag, Info } from 'lucide-react';
import { AccountTier, Product } from '../../types';
import { formatPKR, getPriceCaption, getResolvedPrice } from '../../lib/api';
import { StatusBadge } from '../StatusBadge';
import { QuantityStepper } from '../QuantityStepper';

interface ProductDetailScreenProps {
  product: Product;
  accountTier: AccountTier;
  onAddToCart: (productId: string, unitIndex: number, qty: number) => void;
  isSubscribedNotify: boolean;
  onToggleNotify: (productId: string) => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  product,
  accountTier,
  onAddToCart,
  isSubscribedNotify,
  onToggleNotify
}) => {
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  const priceCaption = getPriceCaption(accountTier);
  const selectedUnit = product.units[selectedUnitIndex] || product.units[0];
  const unitPrice = getResolvedPrice(product, selectedUnitIndex, accountTier);
  const totalPrice = unitPrice * qty;
  const isOutOfStock = product.stockStatus === 'out';

  let tone: 'success' | 'warning' | 'error' = 'success';
  if (product.stockStatus === 'low') tone = 'warning';
  if (product.stockStatus === 'out') tone = 'error';

  const handleAdd = () => {
    onAddToCart(product.id, selectedUnitIndex, qty);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1600);
  };

  return (
    <div className="pb-28 px-4 pt-4 space-y-5">
      {/* Main Header / Image Avatar */}
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#163832] text-white flex items-center justify-center shadow-md mb-3">
          <BookOpen size={40} />
        </div>

        <span className="inline-block px-3 py-0.5 rounded-full bg-[#f2f7f5] text-[#163832] text-xs font-semibold mb-1">
          {product.category}
        </span>

        <h1 className="font-display font-bold text-lg text-[#051f20] leading-snug">
          {product.name}
        </h1>

        {product.urduName && (
          <div dir="rtl" className="font-urdu text-sm text-[#163832] mt-1">
            {product.urduName}
          </div>
        )}

        <div className="mt-2">
          <StatusBadge label={product.stockNote} tone={tone} />
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
        <p className="text-xs text-stone-600 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Unit Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-display font-semibold text-xs text-[#051f20]">
            Select Purchase Unit
          </label>
          <span className="text-[10px] text-stone-500">{priceCaption}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {product.units.map((unit, idx) => {
            const isSelected = idx === selectedUnitIndex;
            const price = getResolvedPrice(product, idx, accountTier);

            return (
              <button
                key={unit.label}
                type="button"
                onClick={() => {
                  setSelectedUnitIndex(idx);
                  setQty(1);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#163832] bg-[#f2f7f5] shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="text-xs font-bold text-[#051f20]">
                  {unit.label}
                </div>
                <div className="text-xs font-semibold text-[#163832] mt-1">
                  {formatPKR(price)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity & Total Price */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div>
          <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
            Total Price ({qty} {selectedUnit.label})
          </div>
          <div className="text-xl font-extrabold text-[#051f20] mt-0.5">
            {formatPKR(totalPrice)}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            {formatPKR(unitPrice)} per {selectedUnit.label}
          </div>
        </div>

        <QuantityStepper
          value={qty}
          onChange={(v) => setQty(v)}
          compact={false}
        />
      </div>

      {/* CTA Button */}
      {isOutOfStock ? (
        <button
          type="button"
          onClick={() => onToggleNotify(product.id)}
          className={`w-full py-3 rounded-full font-semibold text-xs flex items-center justify-center gap-2 border transition-all ${
            isSubscribedNotify
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-white text-[#163832] border-[#163832] hover:bg-[#f2f7f5]'
          }`}
        >
          <Bell size={16} />
          <span>
            {isSubscribedNotify
              ? 'Restock Notification Subscribed ✓'
              : 'Notify me when back in stock'}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-3.5 bg-[#163832] hover:bg-[#0b2924] text-white rounded-full font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
        >
          <ShoppingBag size={18} />
          <span>Add to Cart ({formatPKR(totalPrice)})</span>
        </button>
      )}

      {/* Added Toast Notification */}
      {addedToast && (
        <div className="bg-[#163832] text-white p-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg animate-bounce">
          <Check size={16} className="text-[#a3c5a8]" />
          <span>Added to Cart successfully!</span>
        </div>
      )}
    </div>
  );
};
