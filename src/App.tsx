/**
 * Sri Nutrition & Wellness Platform
 * Serverless Vercel + Next.js + Supabase Architecture
 * Business Owner: Sangem Srivijayalaxmi | 7993367929 | UPI: 7660990052-2@ybl
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { PlatformStateProvider } from './lib/platform-state';
import { Navbar } from './components/Navbar';
import { PublicViews } from './components/PublicViews';
import { AdminShell } from './components/AdminShell';
import { CustomerShell } from './components/CustomerShell';
import { SchemaInspector } from './components/SchemaInspector';
import { StoreView } from './components/StoreView';
import { CentreMapLocation } from './components/CentreMapLocation';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { AiWellnessAssistant } from './components/AiWellnessAssistant';
import { HeartPulse, MapPin, Phone, QrCode } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-800 antialiased selection:bg-emerald-200">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {currentTab === 'admin-dashboard' && user?.role === 'ADMIN' ? (
          <AdminShell />
        ) : currentTab === 'customer-dashboard' ? (
          <CustomerShell />
        ) : currentTab === 'schema' ? (
          <SchemaInspector />
        ) : currentTab === 'store' ? (
          <StoreView onOpenCart={() => setIsCartOpen(true)} />
        ) : currentTab === 'centre' ? (
          <CentreMapLocation />
        ) : (
          <PublicViews currentTab={currentTab} setCurrentTab={setCurrentTab} />
        )}
      </main>

      {/* Global Shopping Cart & Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen || currentTab === 'cart'}
        onClose={() => {
          setIsCartOpen(false);
          if (currentTab === 'cart') setCurrentTab('store');
        }}
        onNavigateToOrders={() => {
          setIsCartOpen(false);
          setCurrentTab('customer-dashboard');
        }}
      />

      {/* Gemini AI Wellness Assistant Widget */}
      <AiWellnessAssistant />

      {/* Global Footer */}
      <footer className="bg-white border-t border-stone-200 mt-16 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold text-base">
                <HeartPulse className="w-5 h-5 text-emerald-600" />
                <span>Sri Nutrition & Wellness Centre</span>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed">
                Evidence-based personalized nutrition coaching, body composition analysis, and community health camps founded by <strong>Sangem Srivijayalaxmi</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif font-bold text-stone-900 text-xs uppercase tracking-wider">
                Direct Business Contact
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-600">
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+91 7993367929</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono font-bold text-emerald-800">7660990052-2@ybl</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Warangal Centre, Telangana - 506001</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif font-bold text-stone-900 text-xs uppercase tracking-wider">
                Platform Architecture
              </h4>
              <ul className="space-y-1 text-xs text-stone-600">
                <li>• Vercel Serverless Functions</li>
                <li>• Supabase PostgreSQL & Auth</li>
                <li>• Row Level Security (RLS) Isolation</li>
                <li>• Server-side BMI & Zod Validation</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif font-bold text-stone-900 text-xs uppercase tracking-wider">
                Standards & Transparency
              </h4>
              <p className="text-stone-500 text-[11px] leading-relaxed">
                We provide holistic nutritional guidance and metabolic counseling. No disease diagnosis or prescription drugs. All biometric data is strictly secured.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400">
            <div>
              &copy; {new Date().getFullYear()} Sri Nutrition & Wellness Centre. All rights reserved.
            </div>
            <div className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
              MASTER PROMPT 2 COMPLETE — CUSTOMER MANAGEMENT + CAMPS + MEASUREMENTS + SECURITY
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PlatformStateProvider>
        <AppContent />
      </PlatformStateProvider>
    </AuthProvider>
  );
}
