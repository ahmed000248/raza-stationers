import React, { useState } from 'react';
import { User, CreditCard, Users, Bell, History, Info, LogOut, LogIn, ChevronRight, Check } from 'lucide-react';
import { AccountTier, UserProfile } from '../../types';
import { formatPKR } from '../../lib/local-catalogue';

interface AccountScreenProps {
  user: UserProfile;
  accountTier: AccountTier;
  onOpenOrders: () => void;
  onOpenInfo: () => void;
  onOpenSignIn: () => void;
  onOpenRegister: () => void;
  onSignOut: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  user,
  accountTier,
  onOpenOrders,
  onOpenInfo,
  onOpenSignIn,
  onOpenRegister,
  onSignOut
}) => {
  const [subNotebooks, setSubNotebooks] = useState(true);
  const [subPens, setSubPens] = useState(false);

  const notificationsFeed = [
    { id: 1, title: 'Order RS-20458 Status Updated', body: 'Your order is now Preparing in shop.', time: '2h ago' },
    { id: 2, title: 'Payment Reminder', body: 'Rs 12,400 outstanding on your credit account.', time: '1d ago' },
    { id: 3, title: 'Wholesale Tier Verification', body: 'Your account is active for wholesale pricing.', time: '3d ago' }
  ];

  return (
    <div className="pb-28 px-4 pt-3 space-y-4">
      {/* User Header Profile */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 flex items-center gap-3 shadow-xs">
        <div className="w-13 h-13 rounded-2xl bg-[#163832] text-white flex items-center justify-center font-display font-bold text-lg shadow-2xs">
          {user.name ? user.name.slice(0, 2).toUpperCase() : 'AR'}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-sm text-[#051f20] truncate">
            {user.businessName || user.name}
          </h2>
          <p className="text-xs text-stone-500">{user.phone || 'Guest User'}</p>
          <div className="mt-1">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                accountTier === 'wholesale'
                  ? 'bg-[#f2f7f5] text-[#163832] border-[#a3c5a8]'
                  : accountTier === 'pending'
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              {accountTier === 'wholesale'
                ? 'Approved Wholesale Member'
                : accountTier === 'pending'
                ? 'Pending Verification'
                : 'Guest Customer'}
            </span>
          </div>
        </div>
      </div>

      {/* Guest Sign-In Hero CTA */}
      {accountTier === 'guest' && (
        <div className="bg-[#f2f7f5] border border-[#a3c5a8] rounded-2xl p-4 text-center space-y-3">
          <p className="text-xs text-stone-700">
            Sign in or register your business account to manage orders, credit limits, and staff access.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onOpenSignIn}
              className="flex-1 py-2.5 bg-[#163832] text-white rounded-full font-semibold text-xs hover:bg-[#0b2924]"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onOpenRegister}
              className="flex-1 py-2.5 bg-white border border-stone-300 text-[#051f20] rounded-full font-semibold text-xs hover:bg-stone-100"
            >
              Register Wholesale
            </button>
          </div>
        </div>
      )}

      {/* Credit Status Card (Wholesale Users) */}
      {accountTier === 'wholesale' && user.credit && (
        <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="font-display font-semibold text-xs text-[#051f20] flex items-center gap-1.5">
              <CreditCard size={16} className="text-[#163832]" />
              <span>Business Pay-Later Credit Line</span>
            </div>
            <span className="text-[10px] font-bold text-[#163832] bg-[#f2f7f5] px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-stone-50 p-3 rounded-2xl text-center text-xs">
            <div>
              <div className="text-[10px] text-stone-400">Total Limit</div>
              <div className="font-bold text-[#051f20]">{formatPKR(user.credit.limit)}</div>
            </div>
            <div>
              <div className="text-[10px] text-stone-400">Outstanding</div>
              <div className="font-bold text-amber-800">{formatPKR(user.credit.outstanding)}</div>
            </div>
            <div>
              <div className="text-[10px] text-stone-400">Available</div>
              <div className="font-bold text-[#163832]">{formatPKR(user.credit.available)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Authorized Staff List (Wholesale Users) */}
      {accountTier === 'wholesale' && user.staff && (
        <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-2 shadow-xs">
          <div className="font-display font-semibold text-xs text-[#051f20] flex items-center gap-1.5 mb-2">
            <Users size={16} className="text-[#163832]" />
            <span>Authorized Shop Staff</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {user.staff.map((st) => (
              <div
                key={st.id}
                className="flex justify-between items-center p-2.5 bg-stone-50 rounded-xl"
              >
                <span className="font-semibold text-[#051f20]">{st.name}</span>
                <span className="text-[11px] text-stone-500 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                  {st.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Preferences & Notifications Feed */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-3 shadow-xs">
        <div className="font-display font-semibold text-xs text-[#051f20] flex items-center gap-1.5">
          <Bell size={16} className="text-[#163832]" />
          <span>Restock Subscriptions & Activity</span>
        </div>

        {/* Restock Preference Toggles */}
        <div className="space-y-2 text-xs border-b border-stone-100 pb-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-stone-700">Restock alerts — Notebooks</span>
            <input
              type="checkbox"
              checked={subNotebooks}
              onChange={(e) => setSubNotebooks(e.target.checked)}
              className="accent-[#163832] w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-stone-700">Restock alerts — Pens & Markers</span>
            <input
              type="checkbox"
              checked={subPens}
              onChange={(e) => setSubPens(e.target.checked)}
              className="accent-[#163832] w-4 h-4"
            />
          </label>
        </div>

        {/* Feed Items */}
        <div className="space-y-2 text-xs">
          {notificationsFeed.map((note) => (
            <div key={note.id} className="p-2.5 bg-stone-50 rounded-xl">
              <div className="flex justify-between font-semibold text-[#051f20]">
                <span>{note.title}</span>
                <span className="text-[10px] text-stone-400">{note.time}</span>
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">{note.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation List */}
      <div className="bg-white border border-stone-200 rounded-3xl divide-y divide-stone-100 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={onOpenOrders}
          className="w-full p-3.5 flex items-center justify-between text-xs text-[#051f20] font-semibold hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History size={16} className="text-[#163832]" />
            <span>Order History & Tracking</span>
          </div>
          <ChevronRight size={16} className="text-stone-400" />
        </button>

        <button
          type="button"
          onClick={onOpenInfo}
          className="w-full p-3.5 flex items-center justify-between text-xs text-[#051f20] font-semibold hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info size={16} className="text-[#163832]" />
            <span>About Raza Stationers & Contact</span>
          </div>
          <ChevronRight size={16} className="text-stone-400" />
        </button>

        {accountTier !== 'guest' ? (
          <button
            type="button"
            onClick={onSignOut}
            className="w-full p-3.5 flex items-center justify-between text-xs text-red-600 font-semibold hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LogOut size={16} />
              <span>Sign Out</span>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenSignIn}
            className="w-full p-3.5 flex items-center justify-between text-xs text-[#163832] font-semibold hover:bg-[#f2f7f5] transition-colors"
          >
            <div className="flex items-center gap-2">
              <LogIn size={16} />
              <span>Sign In to Account</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
