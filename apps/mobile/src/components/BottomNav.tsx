import React from 'react';
import { Home, Grid, ShoppingBag, User } from 'lucide-react';
import { ScreenName } from '../types';

interface BottomNavProps {
  currentScreen: ScreenName;
  cartCount: number;
  onSelectTab: (tab: 'home' | 'catalogue' | 'cart' | 'account') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  cartCount,
  onSelectTab
}) => {
  const tabs = [
    { id: 'home', label: 'Home', urdu: 'ہوم', icon: Home },
    { id: 'catalogue', label: 'Catalogue', urdu: 'کیٹلاگ', icon: Grid },
    { id: 'cart', label: 'Cart', urdu: 'کارٹ', icon: ShoppingBag, badge: cartCount },
    { id: 'account', label: 'Account', urdu: 'اکاؤنٹ', icon: User }
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-[360px]">
      <nav className="bg-[#051f20]/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full p-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id as any)}
              className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-[#a3c5a8] text-[#051f20] font-semibold shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="relative">
                <Icon size={18} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-[#051f20]">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
