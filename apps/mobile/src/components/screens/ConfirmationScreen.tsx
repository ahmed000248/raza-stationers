import React from 'react';
import { CheckCircle2, ArrowRight, FileText, Home } from 'lucide-react';
import { Order } from '../../types';
import { STAGE_LABELS } from '../../data/mockData';
import { formatPKR } from '../../lib/local-catalogue';

interface ConfirmationScreenProps {
  order: Order;
  onTrackOrder: (orderId: string) => void;
  onViewInvoice: (orderId: string) => void;
  onGoHome: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  order,
  onTrackOrder,
  onViewInvoice,
  onGoHome
}) => {
  return (
    <div className="pb-28 px-4 pt-6 space-y-5 text-center">
      {/* Animated Check Icon */}
      <div className="w-16 h-16 rounded-full bg-[#f2f7f5] text-[#163832] border border-[#a3c5a8] flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 size={36} />
      </div>

      <div>
        <h1 className="font-display font-bold text-xl text-[#051f20]">
          Order Successfully Placed!
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Order ID: <strong className="text-[#051f20]">{order.id}</strong> · {formatPKR(order.totalAmount)}
        </p>
      </div>

      {/* Customer Tracking Vertical Stepper */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 text-left shadow-xs space-y-3">
        <div className="font-display font-semibold text-xs text-[#051f20] mb-2">
          Customer Order Status
        </div>

        <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
          {STAGE_LABELS.map((label, idx) => {
            const isCompleted = idx <= order.stageIndex;
            const isCurrent = idx === order.stageIndex;

            return (
              <div key={label} className="relative flex items-center gap-3 pl-1">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                    isCompleted
                      ? 'bg-[#163832] text-white shadow-2xs'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>

                <div
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-[#163832] font-bold'
                      : isCompleted
                      ? 'text-[#051f20]'
                      : 'text-stone-400'
                  }`}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Item Summary */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-left text-xs space-y-1.5">
        <div className="font-bold text-[#051f20]">Deliver to {order.city}</div>
        <div className="text-stone-600 truncate">{order.address}</div>
        <div className="text-stone-500 text-[11px] pt-1 border-t border-stone-200">
          Payment Method: <span className="uppercase font-semibold text-[#051f20]">{order.paymentMethod}</span>
        </div>
      </div>

      {/* Action CTAs */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={() => onTrackOrder(order.id)}
          className="w-full py-3 bg-[#163832] text-white rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-[#0b2924]"
        >
          <span>Track Order Status</span>
          <ArrowRight size={14} />
        </button>

        <button
          type="button"
          onClick={() => onViewInvoice(order.id)}
          className="w-full py-2.5 bg-white border border-stone-300 text-[#051f20] rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-stone-100"
        >
          <FileText size={14} />
          <span>View Mobile Invoice</span>
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="w-full py-2 text-stone-500 hover:text-[#051f20] text-xs font-semibold flex items-center justify-center gap-1"
        >
          <Home size={14} />
          <span>Return to Home</span>
        </button>
      </div>
    </div>
  );
};
