import React, { useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full min-h-[750px] bg-[#051f20] flex flex-col items-center justify-center p-6 text-center text-white relative">
      <div className="w-20 h-20 rounded-2xl bg-[#163832] border border-[#a3c5a8]/30 flex items-center justify-center mb-6 shadow-xl">
        <span className="font-display text-3xl font-bold text-[#a3c5a8]">RS</span>
      </div>

      <h1 className="font-display font-bold text-2xl tracking-tight text-white mb-2">
        Raza Stationers
      </h1>

      <div dir="rtl" className="font-urdu text-xl text-[#a3c5a8] mb-8">
        راضا اسٹیشنرز
      </div>

      <p className="text-xs text-stone-300 max-w-xs mb-8">
        Wholesale & Retail Office, School & Business Stationery
      </p>

      {/* Progress Bar */}
      <div className="w-36 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="w-2/3 h-full bg-[#a3c5a8] rounded-full animate-pulse" />
      </div>

      <div className="absolute bottom-8 text-[11px] text-stone-400">
        Wah Cantt · Hassanabdal · Taxila
      </div>
    </div>
  );
};
