import React from 'react';
import { useAuth } from '../lib/auth-context';
import { usePlatformState } from '../lib/platform-state';
import { Shield, User, HeartPulse, LogOut, MapPin, Calendar, Database, ShoppingBag, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenCart }) => {
  const { user, logout, switchRole } = useAuth();
  const { cartCount, cartSubtotal } = usePlatformState();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-stone-200">
      {/* Top Banner for Business & Architectural status */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              Sri Nutrition & Wellness Centre • Founder: <strong>Sangem Srivijayalaxmi</strong> (+91 7993367929)
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>
              UPI: <strong className="font-mono text-emerald-300">7660990052-2@ybl</strong>
            </span>
            <span className="hidden sm:inline text-emerald-300/60">|</span>
            <span className="hidden sm:inline">Vercel Serverless + Supabase RLS</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif font-bold text-stone-900 text-lg tracking-tight block leading-tight">
                Sri Nutrition
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold tracking-wide block">
                Wellness & Metabolism Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentTab === 'home' ? 'text-emerald-800 bg-emerald-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentTab('about')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentTab === 'about' ? 'text-emerald-800 bg-emerald-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setCurrentTab('services')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentTab === 'services' ? 'text-emerald-800 bg-emerald-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setCurrentTab('store')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'store' ? 'text-emerald-800 bg-emerald-50 font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              Store
            </button>
            <button
              onClick={() => setCurrentTab('faq')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'faq' ? 'text-emerald-800 bg-emerald-50 font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              FAQ & AI
            </button>
            <button
              onClick={() => setCurrentTab('centre')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentTab === 'centre' ? 'text-emerald-800 bg-emerald-50 font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Centre
            </button>

            {/* Direct Portal Tabs */}
            <button
              onClick={() => {
                if (user?.role !== 'ADMIN') switchRole('ADMIN');
                setCurrentTab('admin-dashboard');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
                currentTab === 'admin-dashboard' ? 'text-emerald-900 bg-emerald-100/70 font-bold' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              Admin Portal
            </button>

            <button
              onClick={() => {
                if (user?.role !== 'CUSTOMER') switchRole('CUSTOMER');
                setCurrentTab('customer-dashboard');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
                currentTab === 'customer-dashboard' ? 'text-emerald-900 bg-emerald-100/70 font-bold' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-700" />
              Customer Portal
            </button>

            <button
              onClick={() => setCurrentTab('schema')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
                currentTab === 'schema' ? 'text-indigo-800 bg-indigo-50 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              Architecture & DB
            </button>
          </nav>

          {/* User Session & Role Controls */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={() => (onOpenCart ? onOpenCart() : setCurrentTab('cart'))}
              className={`relative p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                currentTab === 'cart'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title="Shopping Cart & Checkout"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 font-black text-[10px] flex items-center justify-center -ml-0.5">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Role Switcher Pill for instant live testing */}
                <div className="hidden sm:flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs">
                  <button
                    onClick={() => {
                      switchRole('ADMIN');
                      setCurrentTab('admin-dashboard');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all ${
                      user.role === 'ADMIN'
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Admin Mode
                  </button>
                  <button
                    onClick={() => {
                      switchRole('CUSTOMER');
                      setCurrentTab('customer-dashboard');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all ${
                      user.role === 'CUSTOMER'
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Customer Mode
                  </button>
                </div>

                <button
                  onClick={() => setCurrentTab(user.role === 'ADMIN' ? 'admin-dashboard' : 'customer-dashboard')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  {user.role === 'ADMIN' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  <span className="hidden md:inline">{user.fullName.split(' ')[0]}</span>
                  <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-md uppercase font-mono">
                    {user.role}
                  </span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setCurrentTab('home');
                  }}
                  title="Logout"
                  className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('login')}
                  className="text-xs font-semibold text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded-xl hover:bg-stone-100"
                >
                  Login
                </button>
                <button
                  onClick={() => setCurrentTab('register')}
                  className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl shadow-xs"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
