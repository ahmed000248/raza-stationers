import React, { useState } from 'react';
import { History, ArrowRight, FileText, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';
import { STAGE_LABELS } from '../../data/mockData';
import { formatPKR } from '../../lib/api';
import { StatusBadge } from '../StatusBadge';

interface OrdersScreenProps {
  orders: Order[];
  onReorder: (order: Order) => void;
  onViewInvoice: (orderId: string) => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  orders,
  onReorder,
  onViewInvoice
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="pb-28 px-4 pt-3 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-lg text-[#051f20]">
          {selectedOrder ? 'Order Detail & Tracking' : 'Order History'}
        </h1>
        {selectedOrder && (
          <button
            type="button"
            onClick={() => setSelectedOrderId(null)}
            className="text-xs text-[#163832] font-semibold hover:underline"
          >
            Back to List
          </button>
        )}
      </div>

      {selectedOrder ? (
        /* Order Detail View */
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-display font-bold text-base text-[#051f20]">
                  {selectedOrder.id}
                </h2>
                <div className="text-xs text-stone-500">{selectedOrder.date}</div>
              </div>
              <StatusBadge
                label={STAGE_LABELS[selectedOrder.stageIndex]}
                tone={
                  selectedOrder.stageIndex === 4
                    ? 'success'
                    : selectedOrder.stageIndex === 0
                    ? 'neutral'
                    : 'info'
                }
              />
            </div>

            {/* Stepper tracking */}
            <div className="pt-2 border-t border-stone-100">
              <div className="font-semibold text-xs text-[#051f20] mb-2">
                Order Tracking Status
              </div>
              <div className="space-y-2.5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {STAGE_LABELS.map((label, idx) => {
                  const isDone = idx <= selectedOrder.stageIndex;
                  return (
                    <div key={label} className="relative flex items-center gap-3 pl-1 text-xs">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                          isDone ? 'bg-[#163832] text-white' : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className={isDone ? 'font-bold text-[#051f20]' : 'text-stone-400'}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items summary */}
            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
              <div className="font-bold text-[#051f20]">Purchased Items</div>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-stone-600">
                  <span>
                    {item.productName} × {item.qty} ({item.unitLabel})
                  </span>
                  <span className="font-semibold text-[#051f20]">
                    {formatPKR(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-[#051f20]">
              <span>Total Paid</span>
              <span className="text-[#163832]">{formatPKR(selectedOrder.totalAmount)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onReorder(selectedOrder)}
              className="flex-1 py-3 bg-[#163832] text-white rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-[#0b2924]"
            >
              <RefreshCw size={14} />
              <span>Reorder Items</span>
            </button>

            <button
              type="button"
              onClick={() => onViewInvoice(selectedOrder.id)}
              className="flex-1 py-3 bg-white border border-stone-300 text-[#051f20] rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-stone-100"
            >
              <FileText size={14} />
              <span>View Invoice</span>
            </button>
          </div>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-3">
          {orders.map((o) => {
            const itemCount = o.items.reduce((acc, curr) => acc + curr.qty, 0);
            return (
              <div
                key={o.id}
                onClick={() => setSelectedOrderId(o.id)}
                className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs hover:border-[#a3c5a8] transition-all cursor-pointer space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-bold text-xs text-[#051f20]">
                      {o.id}
                    </h3>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {o.date} · {itemCount} items
                    </div>
                  </div>

                  <StatusBadge
                    label={STAGE_LABELS[o.stageIndex]}
                    tone={
                      o.stageIndex === 4
                        ? 'success'
                        : o.stageIndex === 0
                        ? 'neutral'
                        : 'info'
                    }
                  />
                </div>

                <div className="flex justify-between items-baseline pt-1 border-t border-stone-100 text-xs">
                  <span className="text-stone-500">Total:</span>
                  <span className="font-bold text-[#163832]">
                    {formatPKR(o.totalAmount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
