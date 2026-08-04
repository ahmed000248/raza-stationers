import React from 'react';
import { MapPin, Phone, MessageSquare, Clock, ShieldCheck } from 'lucide-react';

export const InfoScreen: React.FC = () => {
  return (
    <div className="pb-28 px-4 pt-4 space-y-4">
      <div>
        <h1 className="font-display font-bold text-lg text-[#051f20]">
          About Raza Stationers
        </h1>
        <div dir="rtl" className="font-urdu text-sm text-[#163832]">
          راضا اسٹیشنرز
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-3 shadow-xs text-xs text-stone-600 leading-relaxed">
        <p>
          Raza Stationers is a leading stationery distributor serving Wah Cantt, Hassanabdal, Taxila, Rawalpindi, and Islamabad.
        </p>
        <p>
          We supply high-quality notebooks, pens, copier paper, drawing sheets, and office supplies at both individual retail prices and discounted bulk wholesale rates for registered shops.
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-3 shadow-xs text-xs">
        <h2 className="font-display font-semibold text-sm text-[#051f20] mb-1">
          Store Contact & Location
        </h2>

        <div className="flex items-start gap-3 p-2.5 bg-stone-50 rounded-2xl">
          <MapPin size={18} className="text-[#163832] mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold text-[#051f20]">Main Shop Address</div>
            <div className="text-stone-600">Shop 12, College Road, Wah Cantt</div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 bg-stone-50 rounded-2xl">
          <MessageSquare size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold text-[#051f20]">WhatsApp Support & Orders</div>
            <div className="text-stone-600">0300 1234567</div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 bg-stone-50 rounded-2xl">
          <Clock size={18} className="text-[#163832] mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold text-[#051f20]">Store Hours</div>
            <div className="text-stone-600">Monday – Saturday: 9:00 AM – 8:00 PM</div>
            <div className="text-stone-400 text-[10px]">Sunday Closed</div>
          </div>
        </div>
      </div>

      <div className="bg-[#f2f7f5] border border-[#a3c5a8] rounded-2xl p-3.5 text-center text-xs text-[#163832]">
        <ShieldCheck size={20} className="mx-auto mb-1" />
        <div className="font-bold">Authentic Guaranteed Products</div>
        <div className="text-[11px] text-stone-600 mt-0.5">
          Direct factory sourcing & reliable delivery across Northern Punjab & ICT.
        </div>
      </div>
    </div>
  );
};
