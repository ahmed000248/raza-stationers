import React from 'react';
import { ShoppingBag, Trash2, ArrowRight, Truck } from 'lucide-react';
import { AccountTier, CartItem, Product } from '../../types';
import { formatPKR, getResolvedPrice } from '../../lib/local-catalogue';
import { FREE_DELIVERY_CITIES } from '../../data/mockData';
import { QuantityStepper } from '../QuantityStepper';

interface CartScreenProps {
  cartItems: CartItem[];
  products: Product[];
  accountTier: AccountTier;
  city: string;
  onUpdateQty: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onOpenCheckout: () => void;
  onOpenCatalogue: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  cartItems,
  products,
  accountTier,
  city,
  onUpdateQty,
  onRemoveItem,
  onOpenCheckout,
  onOpenCatalogue
}) => {
  // Build detailed line items
  const lineItems = cartItems
    .map((item, idx) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;

      const unit = product.units[item.unitIndex] || product.units[0];
      const unitPrice = getResolvedPrice(product, item.unitIndex, accountTier);
      const totalPrice = unitPrice * item.qty;

      return {
        idx,
        product,
        unit,
        qty: item.qty,
        unitPrice,
        totalPrice
      };
    })
    .filter(Boolean);

  const subtotal = lineItems.reduce((acc, curr) => acc + (curr?.totalPrice || 0), 0);
  const isFreeDelivery = FREE_DELIVERY_CITIES.includes(city);
  const deliveryFee = isFreeDelivery ? 0 : 150;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="pb-28 px-4 pt-3 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-lg text-[#051f20]">
          Shopping Cart ({lineItems.length})
        </h1>
      </div>

      {lineItems.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-white border border-stone-200 rounded-3xl p-6">
          <div className="w-16 h-16 rounded-2xl bg-[#f2f7f5] text-[#163832] flex items-center justify-center mx-auto">
            <ShoppingBag size={32} />
          </div>
          <div>
            <h2 className="font-display font-semibold text-base text-[#051f20]">
              Your Cart is Empty
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
              Browse our catalog of notebooks, paper, pens, and stationery supplies.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCatalogue}
            className="px-6 py-2.5 bg-[#163832] text-white rounded-full font-semibold text-xs hover:bg-[#0b2924] transition-colors"
          >
            Browse Catalogue
          </button>
        </div>
      ) : (
        <>
          {/* Cart Line Items */}
          <div className="space-y-3">
            {lineItems.map((item) => {
              if (!item) return null;
              return (
                <div
                  key={`${item.product.id}-${item.unit.label}-${item.idx}`}
                  className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-[#051f20] line-clamp-1">
                      {item.product.name}
                    </h3>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {item.unit.label} · {formatPKR(item.unitPrice)} each
                    </div>
                    <div className="text-xs font-bold text-[#163832] mt-1">
                      {formatPKR(item.totalPrice)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <QuantityStepper
                      value={item.qty}
                      onChange={(val) => onUpdateQty(item.idx, val)}
                      compact
                    />

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.idx)}
                      className="p-1.5 rounded-full text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Location Delivery Fee Preview */}
          <div className="bg-[#f2f7f5] border border-[#a3c5a8]/50 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#163832] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Truck size={18} />
            </div>
            <div className="text-xs">
              <div className="font-semibold text-[#051f20]">
                Delivery to {city}
              </div>
              <div className="text-stone-600 text-[11px]">
                {isFreeDelivery
                  ? 'Free delivery zone active'
                  : 'Rs 150 flat delivery charge applies'}
              </div>
            </div>
          </div>

          {/* Subtotal & Checkout Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#051f20]">
                  {formatPKR(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Fee ({city})</span>
                <span className="font-semibold text-[#051f20]">
                  {isFreeDelivery ? 'Free' : formatPKR(deliveryFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-[#051f20]">
                <span>Grand Total</span>
                <span className="text-[#163832]">{formatPKR(grandTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenCheckout}
              className="w-full py-3.5 bg-[#163832] hover:bg-[#0b2924] text-white rounded-full font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
