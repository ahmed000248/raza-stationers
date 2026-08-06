import React, { useState } from 'react';
import { Phone, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { AccountTier } from '../../types';

interface SignInScreenProps {
  onSignInSuccess: (phone: string, role: AccountTier) => void;
  onOpenRegister: () => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSignInSuccess,
  onOpenRegister
}) => {
  const [phone, setPhone] = useState('0300 1234567');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignInSuccess(phone, 'wholesale');
  };

  const handleDemoSelect = (role: AccountTier, demoPhone: string) => {
    setPhone(demoPhone);
    onSignInSuccess(demoPhone, role);
  };

  return (
    <div className="pb-28 px-4 pt-6 space-y-5">
      <div className="text-center space-y-1">
        <h1 className="font-display font-bold text-xl text-[#051f20]">
          Sign In
        </h1>
        <div dir="rtl" className="font-urdu text-base text-[#163832]">
          سائن ان کریں
        </div>
        <p className="text-xs text-stone-500">
          Enter your mobile phone number & password to access your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-3xl p-4 space-y-3.5 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-[#051f20] mb-1">
            Mobile Phone Number
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0300 1234567"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#051f20] mb-1">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#163832] text-white rounded-full font-semibold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#0b2924] active:scale-98"
        >
          <span>Sign In</span>
          <ArrowRight size={14} />
        </button>
      </form>

      {/* Demo Quick-Role Switcher */}
      <div className="bg-[#f2f7f5] border border-[#a3c5a8]/50 rounded-2xl p-3.5 space-y-2">
        <div className="font-semibold text-xs text-[#051f20] flex items-center gap-1.5">
          <UserCheck size={14} className="text-[#163832]" />
          <span>Demo Role Fast-Login</span>
        </div>
        <p className="text-[11px] text-stone-600">
          Quickly switch between account roles to test tier pricing & permissions:
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleDemoSelect('wholesale', '0300 1234567')}
            className="p-2 bg-white border border-[#a3c5a8] rounded-xl text-left hover:bg-[#163832] hover:text-white transition-colors"
          >
            <div className="font-bold">Approved Wholesale</div>
            <div className="text-[10px] text-stone-500">Al-Raza Traders</div>
          </button>

          <button
            type="button"
            onClick={() => handleDemoSelect('pending', '0300 9876543')}
            className="p-2 bg-white border border-amber-300 rounded-xl text-left hover:bg-amber-600 hover:text-white transition-colors"
          >
            <div className="font-bold">Pending Shop</div>
            <div className="text-[10px] text-stone-500">Bismillah Shop</div>
          </button>
        </div>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onOpenRegister}
          className="text-xs text-[#163832] font-semibold underline hover:text-[#0b2924]"
        >
          New Business? Register for Wholesale Account
        </button>
      </div>
    </div>
  );
};
