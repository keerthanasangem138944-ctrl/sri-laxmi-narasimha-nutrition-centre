import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { usePlatformState, CampRecord, CustomerRecord, MeasurementRecord, AuditLogRecord } from '../lib/platform-state';
import { CustomerManagement } from './admin/CustomerManagement';
import { CampManagement } from './admin/CampManagement';
import { ProductManagement } from './admin/ProductManagement';
import { OrderManagement } from './admin/OrderManagement';
import { BusinessSettingsView } from './admin/BusinessSettingsView';
import { SecurityTests } from './SecurityTests';
import { SchemaInspector } from './SchemaInspector';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Activity,
  FileBarChart,
  Shield,
  PlusCircle,
  Clock,
  TrendingUp,
  Search,
  Sparkles,
  Phone,
  Calendar,
  CheckCircle2,
  Database,
  ArrowUpRight,
  Eye,
  ShoppingBag,
  Package,
  Settings,
} from 'lucide-react';

export const AdminShell: React.FC = () => {
  const { user } = useAuth();
  const { customers, measurements, camps, auditLogs, products, orders } = usePlatformState();

  const [activeNav, setActiveNav] = useState<
    'dashboard' | 'customers' | 'camps' | 'products' | 'orders' | 'settings' | 'security' | 'audit' | 'schema'
  >('dashboard');

  // Real Metric Calculations (Section 54: Real database data, no fake counts)
  const totalCustomers = customers.length;
  const activeCamps = camps.filter((c: CampRecord) => c.status === 'ACTIVE' || c.status === 'PLANNED').length;
  const totalScans = measurements.length;

  // Recent measurements (sorted by date descending)
  const recentMeasurements = [...measurements]
    .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())
    .slice(0, 5);

  // Recent customers
  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Administrative Console
            </div>
            <h1 className="text-xl font-serif font-bold text-white mt-1">Sri Nutrition</h1>
            <p className="text-xs text-stone-400">Warangal Centre Management</p>
          </div>

          <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/60 text-xs">
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Authorized Admin:</span>
            <span className="font-bold text-white block mt-0.5">Sangem Srivijayalaxmi</span>
            <span className="text-stone-400 font-mono text-[11px] block mt-0.5">+91 7993367929</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveNav('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard Overview
            </button>

            <button
              onClick={() => setActiveNav('customers')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'customers'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <span className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                Customers Directory
              </span>
              <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                {totalCustomers}
              </span>
            </button>

            <button
              onClick={() => setActiveNav('camps')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'camps'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <span className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                Health Camps & Check-In
              </span>
              <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                {camps.length}
              </span>
            </button>

            <button
              onClick={() => setActiveNav('products')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'products'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                Products & Inventory
              </span>
              <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveNav('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'orders'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <span className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                Order Fulfillment
              </span>
              <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveNav('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'settings'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              Centre & UPI Settings
            </button>

            <button
              onClick={() => setActiveNav('security')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'security'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              Security & IDOR Tests
            </button>

            <button
              onClick={() => setActiveNav('audit')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'audit'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              System Audit Logs
            </button>

            <button
              onClick={() => setActiveNav('schema')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'schema'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Database className="w-4 h-4" />
              Schema & Migrations
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-stone-800 text-[11px] text-stone-500">
          <div>UPI: <span className="font-mono text-stone-400">7660990052-2@ybl</span></div>
          <div className="mt-1">Vercel Serverless + Supabase RLS</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
        {/* VIEW 1: DASHBOARD OVERVIEW (Sections 28 & 29) */}
        {activeNav === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Stat Cards (Section 28 & 54) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Customers</span>
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-stone-900 mt-2">{totalCustomers}</div>
                <span className="text-xs text-stone-500 mt-1 block">Active biometric profiles</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Scans</span>
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-stone-900 mt-2">{totalScans}</div>
                <span className="text-xs text-stone-500 mt-1 block">8-point body scans recorded</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Camps</span>
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-stone-900 mt-2">{activeCamps}</div>
                <span className="text-xs text-stone-500 mt-1 block">Warangal & surrounding areas</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Audit Trail</span>
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-stone-900 mt-2">{auditLogs.length}</div>
                <span className="text-xs text-stone-500 mt-1 block">Recorded operations</span>
              </div>
            </div>

            {/* Quick Actions Strip (Section 29) */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Dashboard Quick Actions:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveNav('customers')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  Add / Search Customer
                </button>
                <button
                  onClick={() => setActiveNav('camps')}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Open Mobile Camp Mode
                </button>
                <button
                  onClick={() => setActiveNav('security')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-stone-500" />
                  Run Security Tests
                </button>
              </div>
            </div>

            {/* Two-Column Dashboard Layout: Recent Customers & Recent Measurements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Customers Table */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-stone-900">Recent Customer Registrations</h3>
                  <button
                    onClick={() => setActiveNav('customers')}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="divide-y divide-stone-100">
                  {recentCustomers.map((cust) => (
                    <div key={cust.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                          {cust.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-stone-900">{cust.fullName}</div>
                          <div className="text-xs text-stone-400 font-mono">+91 {cust.mobile}</div>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                        Age {cust.age}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Body Measurements */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-stone-900">Recent Body Composition Scans</h3>
                  <span className="text-xs text-stone-400">Server calculated</span>
                </div>

                <div className="divide-y divide-stone-100">
                  {recentMeasurements.map((m: MeasurementRecord) => {
                    const cust = customers.find((c: CustomerRecord) => c.id === m.customerId);
                    return (
                      <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-sm text-stone-900">
                            {cust ? cust.fullName : 'Customer'}
                          </div>
                          <div className="text-xs text-stone-500">
                            {m.weightKg} kg • Body Fat {m.bodyFatPercent ?? '—'}% • Muscle {m.musclePercent ?? '—'}%
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              m.bmi < 18.5
                                ? 'bg-amber-100 text-amber-800'
                                : m.bmi < 25
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            BMI {m.bmi.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-0.5">{m.bmiCategory}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CUSTOMERS DIRECTORY */}
        {activeNav === 'customers' && <CustomerManagement />}

        {/* VIEW 3: CAMPS & MOBILE CHECK-IN */}
        {activeNav === 'camps' && <CampManagement />}

        {/* VIEW 4: SECURITY & IDOR TESTS */}
        {activeNav === 'security' && <SecurityTests />}

        {/* VIEW 5: AUDIT LOGS (Section 38: Audit Logging) */}
        {activeNav === 'audit' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Administrative Audit Trail (Section 38)
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Chronological immutable records of all customer mutations, body measurements, camp updates, and reports.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 uppercase text-[10px] tracking-wider text-stone-500 font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Actor</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Entity</th>
                    <th className="py-2.5 px-3">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {auditLogs.map((log: AuditLogRecord) => (
                    <tr key={log.id} className="hover:bg-stone-50/60">
                      <td className="py-2.5 px-3 text-stone-400">
                        {new Date(log.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-stone-800">{log.actorName}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-500">{log.entityType}</td>
                      <td className="py-2.5 px-3 text-[10px] text-stone-600 truncate max-w-xs">
                        {JSON.stringify(log.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: PRODUCTS & INVENTORY */}
        {activeNav === 'products' && <ProductManagement />}

        {/* VIEW: ORDER FULFILLMENT */}
        {activeNav === 'orders' && <OrderManagement />}

        {/* VIEW: CENTRE & UPI SETTINGS */}
        {activeNav === 'settings' && <BusinessSettingsView />}

        {/* VIEW 6: SCHEMA & MIGRATIONS */}
        {activeNav === 'schema' && <SchemaInspector />}
      </main>
    </div>
  );
};
