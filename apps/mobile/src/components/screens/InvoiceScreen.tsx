import React from 'react';
import { FileText, Printer, CheckCircle } from 'lucide-react';
import { Order } from '../../types';
import { STAGE_LABELS } from '../../data/mockData';
import { formatPKR } from '../../lib/local-catalogue';

interface InvoiceScreenProps {
  order: Order;
  onDone: () => void;
}

export const InvoiceScreen: React.FC<InvoiceScreenProps> = ({ order, onDone }) => {
  return (
    <div className="pb-28 px-4 pt-3 space-y-4">
      {/* Read-Only Mobile Invoice Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-md space-y-4">
        {/* Header Shop Info */}
        <div className="text-center pb-3 border-b border-stone-200">
          <h2 className="font-display font-bold text-base text-[#051f20]">
            Raza Stationers
          </h2>
          <div dir="rtl" className="font-urdu text-sm text-[#163832]">
            راضا اسٹیشنرز
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Shop 12, College Road, Wah Cantt · 0300 1234567
          </p>
        </div>

        {/* Invoice Metadata */}
        <div className="flex justify-between items-center text-xs">
          <div>
            <div className="text-stone-400 text-[10px]">INVOICE NO.</div>
            <div className="font-bold text-[#051f20]">{order.id}</div>
          </div>
          <div className="text-right">
            <div className="text-stone-400 text-[10px]">DATE</div>
            <div className="font-semibold text-[#051f20]">{order.date}</div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-stone-50 p-3 rounded-2xl text-xs space-y-0.5">
          <div className="text-stone-400 text-[10px] uppercase font-bold">Bill To</div>
          <div className="font-bold text-[#051f20]">{order.recipientName}</div>
          <div className="text-stone-600">{order.address}, {order.city}</div>
          <div className="text-stone-500 text-[11px]">Contact: {order.phone}</div>
        </div>

        {/* Line items table */}
        <div className="space-y-2 text-xs">
          <div className="font-bold text-[#051f20] pb-1 border-b border-stone-200 flex justify-between">
            <span>Item Description</span>
            <span>Total</span>
          </div>

          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start py-1 border-b border-stone-100 text-[11px]">
              <div>
                <div className="font-semibold text-[#051f20]">{item.productName}</div>
                <div className="text-stone-500">
                  {item.qty} × {item.unitLabel} @ {formatPKR(item.unitPrice)}
                </div>
              </div>
              <div className="font-bold text-[#051f20]">{formatPKR(item.totalPrice)}</div>
            </div>
          ))}
        </div>

        {/* Totals Breakdown */}
        <div className="pt-2 space-y-1.5 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-[#051f20]">{formatPKR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee ({order.city})</span>
            <span className="font-semibold text-[#051f20]">
              {order.deliveryFee === 0 ? 'Free' : formatPKR(order.deliveryFee)}
            </span>
          </div>
          <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-[#051f20]">
            <span>Grand Total</span>
            <span className="text-[#163832]">{formatPKR(order.totalAmount)}</span>
          </div>
        </div>

        {/* Payment & Stage Status */}
        <div className="bg-[#f2f7f5] p-3 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] text-stone-500">PAYMENT METHOD</div>
            <div className="font-bold uppercase text-[#163832]">{order.paymentMethod}</div>
          </div>

          <div className="flex items-center gap-1.5 text-[#163832] font-semibold text-xs">
            <CheckCircle size={14} />
            <span>{STAGE_LABELS[order.stageIndex]}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="w-full py-3 bg-[#163832] text-white rounded-full font-semibold text-xs hover:bg-[#0b2924]"
      >
        Done / Return
      </button>
    </div>
  );
};
