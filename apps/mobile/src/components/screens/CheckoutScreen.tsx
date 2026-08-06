import React, { useState } from 'react';
import { ArrowRight, Check, CreditCard, Landmark, Truck, Upload, ShieldCheck, MapPin } from 'lucide-react';
import { AccountTier, CartItem, PaymentMethod, Product } from '../../types';
import { CITIES, FREE_DELIVERY_CITIES } from '../../data/mockData';
import { formatPKR, getResolvedPrice } from '../../lib/api';

interface CheckoutScreenProps {
  cartItems: CartItem[];
  products: Product[];
  accountTier: AccountTier;
  initialName: string;
  initialPhone: string;
  initialAddress: string;
  initialCity: string;
  creditLimit: number;
  creditOutstanding: number;
  creditAvailable: number;
  onPlaceOrder: (orderData: {
    recipientName: string;
    phone: string;
    address: string;
    city: string;
    paymentMethod: PaymentMethod;
    transferRef?: string;
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    items: any[];
  }) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  cartItems,
  products,
  accountTier,
  initialName,
  initialPhone,
  initialAddress,
  initialCity,
  creditLimit,
  creditOutstanding,
  creditAvailable,
  onPlaceOrder
}) => {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [name, setName] = useState(initialName || 'Ahmed Raza');
  const [phone, setPhone] = useState(initialPhone || '0300 1234567');
  const [address, setAddress] = useState(initialAddress || 'Shop 12, College Road');
  const [city, setCity] = useState(initialCity || 'Wah Cantt');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [transferRef, setTransferRef] = useState('');
  const [receiptUploaded, setReceiptUploaded] = useState(false);

  // Line calculations
  const lineItems = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      const unit = product.units[item.unitIndex] || product.units[0];
      const unitPrice = getResolvedPrice(product, item.unitIndex, accountTier);
      const totalPrice = unitPrice * item.qty;
      return {
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

  const handleNextStep = () => {
    if (step < 3) setStep((step + 1) as any);
  };

  const handlePrevStep = () => {
    if (step > 0) setStep((step - 1) as any);
  };

  const handleFinalSubmit = () => {
    const formattedItems = lineItems.map((item) => ({
      productId: item!.product.id,
      unitIndex: 0,
      qty: item!.qty,
      unitPrice: item!.unitPrice,
      totalPrice: item!.totalPrice,
      unitLabel: item!.unit.label,
      productName: item!.product.name
    }));

    onPlaceOrder({
      recipientName: name,
      phone,
      address,
      city,
      paymentMethod,
      transferRef: paymentMethod === 'transfer' ? transferRef : undefined,
      subtotal,
      deliveryFee,
      totalAmount: grandTotal,
      items: formattedItems
    });
  };

  const stepsList = ['Address', 'Delivery', 'Payment', 'Review'];

  return (
    <div className="pb-28 px-4 pt-3 space-y-4">
      {/* Checkout Progress Stepper */}
      <div className="flex items-center gap-1">
        {stepsList.map((label, idx) => {
          const isActive = idx === step;
          const isDone = idx < step;
          return (
            <div
              key={label}
              className={`flex-1 text-center py-1.5 rounded-full text-[10px] font-semibold transition-all ${
                isActive
                  ? 'bg-[#163832] text-white shadow-xs'
                  : isDone
                  ? 'bg-[#a3c5a8]/30 text-[#163832]'
                  : 'bg-stone-100 text-stone-400'
              }`}
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* STEP 0: Address Form */}
      {step === 0 && (
        <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-3.5 shadow-xs">
          <h2 className="font-display font-semibold text-sm text-[#051f20] flex items-center gap-2">
            <MapPin size={16} className="text-[#163832]" />
            <span>Delivery Recipient & Location</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-stone-600 font-medium mb-1">
                Full Name / Business Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-medium mb-1">
                Contact Mobile Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-medium mb-1">
                Shop / Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-medium mb-1">
                City / Location
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c} {FREE_DELIVERY_CITIES.includes(c) ? '(Free Delivery)' : '(Rs 150)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="w-full mt-2 py-3 bg-[#163832] text-white rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-[#0b2924]"
          >
            <span>Continue to Delivery Zone</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* STEP 1: Delivery Zone Notice */}
      {step === 1 && (
        <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-4 shadow-xs">
          <h2 className="font-display font-semibold text-sm text-[#051f20] flex items-center gap-2">
            <Truck size={16} className="text-[#163832]" />
            <span>Delivery Fee Calculation</span>
          </h2>

          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              isFreeDelivery
                ? 'bg-[#f2f7f5] border-[#a3c5a8] text-[#163832]'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="font-bold text-sm mb-1">
              {isFreeDelivery ? 'Free Delivery Zone Active ✓' : 'Standard Delivery Zone (Rs 150)'}
            </div>
            <p>
              Delivery is <strong>free</strong> within Wah Cantt, Hassanabdal, and Taxila. A flat Rs 150 delivery fee applies for Rawalpindi and Islamabad.
            </p>
          </div>

          <div className="bg-stone-50 p-3.5 rounded-2xl space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Destination City</span>
              <span className="font-semibold text-[#051f20]">{city}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Delivery Fee</span>
              <span className="font-bold text-[#163832]">
                {isFreeDelivery ? 'Free' : formatPKR(150)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex-1 py-2.5 border border-stone-300 rounded-full text-xs font-semibold text-stone-700 hover:bg-stone-100"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="flex-1 py-2.5 bg-[#163832] text-white rounded-full text-xs font-semibold hover:bg-[#0b2924]"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Payment Method */}
      {step === 2 && (
        <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-4 shadow-xs">
          <h2 className="font-display font-semibold text-sm text-[#051f20] flex items-center gap-2">
            <CreditCard size={16} className="text-[#163832]" />
            <span>Select Payment Method</span>
          </h2>

          <div className="space-y-2.5 text-xs">
            {/* COD Option */}
            <label
              className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'cod'
                  ? 'border-[#163832] bg-[#f2f7f5]'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="accent-[#163832]"
              />
              <div>
                <div className="font-bold text-[#051f20]">Cash on Delivery (COD)</div>
                <div className="text-[11px] text-stone-500">
                  Pay cash directly upon parcel delivery
                </div>
              </div>
            </label>

            {/* Bank Transfer Option */}
            <label
              className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'transfer'
                  ? 'border-[#163832] bg-[#f2f7f5]'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'transfer'}
                onChange={() => setPaymentMethod('transfer')}
                className="accent-[#163832]"
              />
              <div>
                <div className="font-bold text-[#051f20]">Bank / Wallet Transfer</div>
                <div className="text-[11px] text-stone-500">
                  Transfer to Meezan Bank / EasyPaisa / JazzCash & enter reference
                </div>
              </div>
            </label>

            {/* Transfer Details Card */}
            {paymentMethod === 'transfer' && (
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-3">
                <div className="text-[11px] text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200">
                  <div className="font-bold text-[#051f20]">Meezan Bank Account:</div>
                  <div>Account Title: Raza Stationers</div>
                  <div>IBAN: PK12MEZN0001100234567890</div>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Transaction Reference Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TRX-99812401"
                    value={transferRef}
                    onChange={(e) => setTransferRef(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setReceiptUploaded(!receiptUploaded)}
                  className={`w-full py-2.5 rounded-xl border-1.5 border-dashed text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    receiptUploaded
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                      : 'bg-white text-[#163832] border-[#a3c5a8] hover:bg-[#f2f7f5]'
                  }`}
                >
                  <Upload size={14} />
                  <span>
                    {receiptUploaded ? 'Payment Receipt Uploaded ✓' : '+ Upload Payment Receipt Image'}
                  </span>
                </button>
              </div>
            )}

            {/* Wholesale Pay-Later Credit Option */}
            {accountTier === 'wholesale' && (
              <label
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'credit'
                    ? 'border-[#163832] bg-[#f2f7f5]'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'credit'}
                  onChange={() => setPaymentMethod('credit')}
                  className="accent-[#163832] mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-bold text-[#051f20] flex items-center gap-1.5">
                    <span>Pay-Later Wholesale Credit</span>
                    <span className="px-2 py-0.2 rounded-full bg-[#163832] text-white text-[9px] font-semibold">
                      Wholesale Only
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Charge order to your approved business credit line.
                  </div>

                  {paymentMethod === 'credit' && (
                    <div className="mt-2.5 bg-white p-2.5 rounded-xl border border-[#a3c5a8] grid grid-cols-3 text-center text-[10px]">
                      <div>
                        <div className="text-stone-400">Limit</div>
                        <div className="font-bold text-[#051f20]">{formatPKR(creditLimit)}</div>
                      </div>
                      <div>
                        <div className="text-stone-400">Outstanding</div>
                        <div className="font-bold text-amber-800">{formatPKR(creditOutstanding)}</div>
                      </div>
                      <div>
                        <div className="text-stone-400">Available</div>
                        <div className="font-bold text-[#163832]">{formatPKR(creditAvailable)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </label>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex-1 py-2.5 border border-stone-300 rounded-full text-xs font-semibold text-stone-700 hover:bg-stone-100"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="flex-1 py-2.5 bg-[#163832] text-white rounded-full text-xs font-semibold hover:bg-[#0b2924]"
            >
              Continue to Review
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Order Review */}
      {step === 3 && (
        <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-4 shadow-xs">
          <h2 className="font-display font-semibold text-sm text-[#051f20] flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#163832]" />
            <span>Order Summary & Review</span>
          </h2>

          <div className="space-y-2 text-xs">
            <div className="bg-stone-50 p-3 rounded-2xl space-y-1">
              <div className="font-bold text-[#051f20]">Delivery Details</div>
              <div className="text-stone-600">
                {name} ({phone})
              </div>
              <div className="text-stone-600">
                {address}, {city}
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-2xl space-y-1">
              <div className="font-bold text-[#051f20]">Payment Method</div>
              <div className="text-stone-600 capitalize">
                {paymentMethod === 'cod'
                  ? 'Cash on Delivery (COD)'
                  : paymentMethod === 'transfer'
                  ? `Bank Transfer ${transferRef ? `(Ref: ${transferRef})` : ''}`
                  : 'Pay-Later Wholesale Credit'}
              </div>
            </div>

            {/* Line items summary */}
            <div className="bg-stone-50 p-3 rounded-2xl space-y-1.5">
              <div className="font-bold text-[#051f20] mb-1">Items ({lineItems.length})</div>
              {lineItems.map((item) => (
                <div
                  key={item?.product.id}
                  className="flex justify-between text-stone-600 text-[11px]"
                >
                  <span className="line-clamp-1">
                    {item?.product.name} × {item?.qty} ({item?.unit.label})
                  </span>
                  <span className="font-semibold text-[#051f20]">
                    {formatPKR(item?.totalPrice || 0)}
                  </span>
                </div>
              ))}

              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-xs text-[#051f20]">
                <span>Total Amount</span>
                <span className="text-[#163832]">{formatPKR(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex-1 py-3 border border-stone-300 rounded-full text-xs font-semibold text-stone-700 hover:bg-stone-100"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="flex-1 py-3 bg-[#163832] text-white rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-[#0b2924] active:scale-98"
            >
              <Check size={16} />
              <span>Place Order ({formatPKR(grandTotal)})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
