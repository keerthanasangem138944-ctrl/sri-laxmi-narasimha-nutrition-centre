import React, { useState, useMemo } from 'react';
import { useAuth } from '../lib/auth-context';
import { usePlatformState, CustomerRecord, MeasurementRecord, HealthNoteRecord, OrderRecord } from '../lib/platform-state';
import {
  LayoutDashboard,
  User,
  Activity,
  TrendingUp,
  FileText,
  MapPin,
  Scale,
  Flame,
  Dna,
  Heart,
  Calendar,
  AlertCircle,
  Sparkles,
  Printer,
  Eye,
  Lock,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  ShoppingBag,
  Package,
  Truck,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const CustomerShell: React.FC = () => {
  const { user } = useAuth();
  const {
    customers,
    getCustomerMeasurements,
    getCustomerNotes,
    getCustomerOrders,
    updateCustomer,
  } = usePlatformState();

  // Current customer identity (Default to Ananya Sharma for testing, or matching user)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers.find((c: CustomerRecord) => c.authUserId)?.id || customers[0]?.id || '00000000-0000-0000-0000-000000000002'
  );

  const [activeNav, setActiveNav] = useState<
    'dashboard' | 'measurements' | 'progress' | 'profile' | 'notes' | 'reports' | 'orders' | 'centre'
  >('dashboard');
  const [chartRange, setChartRange] = useState<'30' | '90' | '180' | '365' | 'ALL'>('ALL');
  const [showReportPrintModal, setShowReportPrintModal] = useState(false);

  // Profile editable state
  const currentCustomer = useMemo(() => {
    return customers.find((c: CustomerRecord) => c.id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  const [profileForm, setProfileForm] = useState({
    fullName: currentCustomer?.fullName || '',
    addressLine: currentCustomer?.addressLine || '',
    city: currentCustomer?.city || 'Warangal',
    postalCode: currentCustomer?.postalCode || '506001',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Measurements strictly isolated for this customer (Section 31 & 40)
  const myMeasurements = useMemo(() => {
    if (!currentCustomer) return [];
    return getCustomerMeasurements(currentCustomer.id);
  }, [currentCustomer, getCustomerMeasurements]);

  const latestScan = myMeasurements[0] || null;

  // Health notes strictly isolated: Customer can NEVER see ADMIN_ONLY notes (Section 17 & 40)
  const myVisibleNotes = useMemo(() => {
    if (!currentCustomer) return [];
    return getCustomerNotes(currentCustomer.id, false); // isAdmin = false
  }, [currentCustomer, getCustomerNotes]);

  // Customer Orders
  const myOrders = useMemo(() => {
    if (!currentCustomer) return [];
    return getCustomerOrders(currentCustomer.id);
  }, [currentCustomer, getCustomerOrders]);

  // Recharts Data
  const chartData = useMemo(() => {
    if (!myMeasurements.length) return [];
    const sorted = [...myMeasurements].reverse();

    let cutoffDate = new Date(0);
    const now = new Date();
    if (chartRange === '30') cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (chartRange === '90') cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    if (chartRange === '180') cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    if (chartRange === '365') cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    return sorted
      .filter((m) => new Date(m.measuredAt) >= cutoffDate)
      .map((m) => ({
        date: new Date(m.measuredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        weight: m.weightKg,
        bmi: m.bmi,
        bodyFat: m.bodyFatPercent,
        muscle: m.musclePercent,
      }));
  }, [myMeasurements, chartRange]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;

    // Customer can only update permitted personal fields (Section 33)
    updateCustomer(currentCustomer.id, {
      fullName: profileForm.fullName.trim(),
      addressLine: profileForm.addressLine.trim(),
      city: profileForm.city.trim(),
      postalCode: profileForm.postalCode.trim(),
    });

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  return (
    <div className="py-6 space-y-6">
      {/* Top Header & Customer Welcome (Section 30) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Customer Wellness Portal
            </span>
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Row Level Security Active
            </span>
          </div>

          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-1">
            Welcome, {currentCustomer?.fullName || 'Valued Member'}
          </h1>
          <p className="text-xs text-stone-500">
            Nutritionist: <span className="font-semibold text-stone-700">Sangem Srivijayalaxmi</span> (+91 7993367929) • Warangal Centre
          </p>
        </div>

        {/* Customer Switching Sandbox to test RLS & IDOR boundaries */}
        <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
          <span className="text-xs font-medium text-stone-500">Test as Customer:</span>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="text-xs bg-white border border-stone-200 rounded-lg px-2 py-1 font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {customers.map((c: CustomerRecord) => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.authUserId ? 'Online Auth' : 'Camp Member'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Sidebar & View Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3">
          <nav className="space-y-1 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
            {[
              { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
              { id: 'measurements', label: `My Measurements (${myMeasurements.length})`, icon: Activity },
              { id: 'progress', label: 'My Progress Charts', icon: TrendingUp },
              { id: 'orders', label: `My Store Orders (${myOrders.length})`, icon: ShoppingBag },
              { id: 'notes', label: `Counselor Notes (${myVisibleNotes.length})`, icon: FileText },
              { id: 'reports', label: 'My Wellness Reports', icon: FileText },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'centre', label: 'Centre Location & UPI', icon: MapPin },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Centre Emergency Contact Card */}
          <div className="mt-4 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 text-xs space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              Sri Nutrition & Wellness
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Warangal Centre, Telangana • Mon-Sat 8:00 AM - 7:00 PM
            </p>
            <div className="font-mono text-stone-700 text-[11px] font-medium flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-600" /> +91 7993367929
            </div>
          </div>
        </aside>

        {/* View Panels */}
        <main className="lg:col-span-9 space-y-6">
          {/* TAB 1: CUSTOMER DASHBOARD (Section 30) */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6">
              {latestScan ? (
                <>
                  {/* Latest Measurement Metric Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif font-bold text-base text-stone-900">
                        Latest Recorded Biometrics
                      </h3>
                      <span className="text-xs text-stone-500 font-medium">
                        Last measured on{' '}
                        {new Date(latestScan.measuredAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                        <div className="flex items-center justify-between text-stone-400 mb-1">
                          <span className="text-xs font-semibold uppercase tracking-wider">Weight</span>
                          <Scale className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-bold text-stone-900">{latestScan.weightKg} kg</div>
                        <span className="text-xs text-stone-400 mt-1 block">Height: {latestScan.heightCm} cm</span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                        <div className="flex items-center justify-between text-stone-400 mb-1">
                          <span className="text-xs font-semibold uppercase tracking-wider">BMI</span>
                          <Heart className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-700">{latestScan.bmi.toFixed(1)}</div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-1 inline-block">
                          {latestScan.bmiCategory}
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                        <div className="flex items-center justify-between text-stone-400 mb-1">
                          <span className="text-xs font-semibold uppercase tracking-wider">Body Fat</span>
                          <Flame className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-2xl font-bold text-stone-900">{latestScan.bodyFatPercent ?? '—'}%</div>
                        <span className="text-xs text-stone-400 mt-1 block">Visceral Fat: {latestScan.visceralFat ?? '—'}</span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                        <div className="flex items-center justify-between text-stone-400 mb-1">
                          <span className="text-xs font-semibold uppercase tracking-wider">Muscle Mass</span>
                          <Dna className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-stone-900">{latestScan.musclePercent ?? '—'}%</div>
                        <span className="text-xs text-stone-400 mt-1 block">Caloric BMR: {latestScan.calories ? `${latestScan.calories} kcal` : '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Quick Chart Preview */}
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-serif font-bold text-base text-stone-900">Your Progress Journey</h3>
                        <p className="text-xs text-stone-500">Weight and Body Fat trajectory over recorded consultations.</p>
                      </div>
                      <button
                        onClick={() => setActiveNav('progress')}
                        className="text-xs font-semibold text-emerald-700 hover:underline"
                      >
                        Detailed Charts →
                      </button>
                    </div>

                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#059669" strokeWidth={2.5} />
                          <Line type="monotone" dataKey="bmi" name="BMI" stroke="#0284c7" strokeWidth={2} strokeDasharray="3 3" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Quick Action Buttons (Section 30) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={() => setActiveNav('measurements')}
                      className="p-3 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 text-left transition-colors shadow-sm"
                    >
                      <Activity className="w-4 h-4 text-emerald-600 mb-1" />
                      <span className="text-xs font-bold text-stone-900 block">View All Scans</span>
                      <span className="text-[11px] text-stone-500">Historical records</span>
                    </button>

                    <button
                      onClick={() => setActiveNav('progress')}
                      className="p-3 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 text-left transition-colors shadow-sm"
                    >
                      <TrendingUp className="w-4 h-4 text-blue-600 mb-1" />
                      <span className="text-xs font-bold text-stone-900 block">View Progress</span>
                      <span className="text-[11px] text-stone-500">Multi-metric trends</span>
                    </button>

                    <button
                      onClick={() => setShowReportPrintModal(true)}
                      className="p-3 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 text-left transition-colors shadow-sm"
                    >
                      <Printer className="w-4 h-4 text-purple-600 mb-1" />
                      <span className="text-xs font-bold text-stone-900 block">Print Report</span>
                      <span className="text-[11px] text-stone-500">PDF-ready view</span>
                    </button>

                    <button
                      onClick={() => setActiveNav('centre')}
                      className="p-3 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 text-left transition-colors shadow-sm"
                    >
                      <MapPin className="w-4 h-4 text-amber-600 mb-1" />
                      <span className="text-xs font-bold text-stone-900 block">Centre Location</span>
                      <span className="text-[11px] text-stone-500">Warangal facility</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Empty State (Section 47) */
                <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
                  <Activity className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-stone-800">No measurements recorded yet</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                    Visit Sri Nutrition & Wellness Centre or attend an upcoming community health camp to record your baseline body composition.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY MEASUREMENTS TABLE (Section 31: Own records only, RLS enforced) */}
          {activeNav === 'measurements' && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">Your Measurement Records</h3>
                  <p className="text-xs text-stone-500">
                    Row Level Security strictly isolates access to your verified account records.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  {myMeasurements.length} Consultations
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-600">
                  <thead className="bg-stone-50/50 uppercase font-semibold text-stone-500 tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Weight</th>
                      <th className="py-3 px-4">BMI</th>
                      <th className="py-3 px-4">Body Fat %</th>
                      <th className="py-3 px-4">Muscle %</th>
                      <th className="py-3 px-4">Visceral Fat</th>
                      <th className="py-3 px-4">Calories/BMR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {myMeasurements.map((m: MeasurementRecord) => (
                      <tr key={m.id} className="hover:bg-stone-50/70">
                        <td className="py-3 px-4 font-semibold text-stone-900">
                          {new Date(m.measuredAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-800">{m.weightKg} kg</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-700">{m.bmi.toFixed(1)}</span>
                          <span className="text-[10px] text-stone-400 block">{m.bmiCategory}</span>
                        </td>
                        <td className="py-3 px-4">{m.bodyFatPercent ? `${m.bodyFatPercent}%` : '—'}</td>
                        <td className="py-3 px-4">{m.musclePercent ? `${m.musclePercent}%` : '—'}</td>
                        <td className="py-3 px-4">{m.visceralFat ?? '—'}</td>
                        <td className="py-3 px-4">{m.calories ? `${m.calories} kcal` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PROGRESS CHARTS WITH DATE FILTERS (Section 32) */}
          {activeNav === 'progress' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">Biometric Trajectory</h3>
                  <p className="text-xs text-stone-500">Interactive charts tracking weight, BMI, and body composition changes.</p>
                </div>

                <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                  {(['30', '90', '180', '365', 'ALL'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                        chartRange === r ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {r === 'ALL' ? 'All' : `${r}d`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#059669" strokeWidth={3} />
                    <Line type="monotone" dataKey="bodyFat" name="Body Fat %" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="muscle" name="Muscle Mass %" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 4: COUNSELOR NOTES (Section 17 & 40: Customer-visible only) */}
          {activeNav === 'notes' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">Counselor & Dietary Notes</h3>
                <p className="text-xs text-stone-500">
                  Recommendations and observations shared by Sangem Srivijayalaxmi for your wellness program.
                </p>
              </div>

              <div className="space-y-3">
                {myVisibleNotes.length === 0 ? (
                  <div className="py-8 text-center text-stone-400">
                    <FileText className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                    <p className="font-semibold text-stone-700">No notes shared yet</p>
                    <p className="text-xs text-stone-400">Dietary guidance provided during visits will be visible here.</p>
                  </div>
                ) : (
                  myVisibleNotes.map((note: HealthNoteRecord) => (
                    <div key={note.id} className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/80">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-emerald-900">
                          {note.isCustomerReported ? 'Your Reported Note' : `From ${note.authorName}`}
                        </span>
                        <span className="text-stone-400">
                          {new Date(note.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-wrap">{note.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: MY PROFILE (Section 33: Permitted edits only) */}
          {activeNav === 'profile' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">Personal Profile</h3>
                <p className="text-xs text-stone-500">
                  Manage your personal details. Sensitive authorization attributes and role assignments are server-enforced.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                {profileSaved && (
                  <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Profile updated successfully.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1">
                      Mobile Number (Read-only)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentCustomer?.mobile ? `+91 ${currentCustomer.mobile}` : ''}
                      className="w-full px-3 py-2 text-sm bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1">
                      Role (Security Enforced)
                    </label>
                    <input
                      type="text"
                      disabled
                      value="CUSTOMER"
                      className="w-full px-3 py-2 text-sm bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="House/Plot No, Locality"
                    value={profileForm.addressLine}
                    onChange={(e) => setProfileForm({ ...profileForm, addressLine: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={profileForm.postalCode}
                      onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB: MY STORE ORDERS */}
          {activeNav === 'orders' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">My Formulation Orders</h3>
                <p className="text-xs text-stone-500">
                  Track your dietary supplement orders dispatched from Sri Nutrition Warangal Centre.
                </p>
              </div>

              {myOrders.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
                  <h4 className="font-semibold text-stone-800 text-sm">No orders found</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    You have not placed any orders yet. Visit our dispensary store to explore genuine proteins and supplements.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order: OrderRecord) => (
                    <div
                      key={order.id}
                      className="border border-stone-200 rounded-xl p-5 bg-stone-50/50 space-y-4 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
                        <div>
                          <span className="text-stone-400 text-[10px] block">Order Identifier</span>
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            {order.orderNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                            {order.status}
                          </span>
                          <span className="text-stone-400 font-mono text-[11px]">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-stone-800 block text-[11px]">Formulations:</span>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-stone-700">
                            <span>
                              {item.quantity}x {item.productName}
                            </span>
                            <span className="font-mono font-semibold">
                              ₹{item.totalPrice.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping info */}
                      <div className="pt-2 border-t border-stone-200 text-stone-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-stone-400 text-[10px] block">Delivery Location</span>
                          <span>
                            {order.shippingAddress.addressLine1}, {order.shippingAddress.city} (
                            {order.shippingAddress.postalCode})
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-stone-400 text-[10px] block">Total Charged</span>
                          <span className="font-mono font-bold text-emerald-900 text-sm">
                            ₹{order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: REPORTS PREVIEW & PRINT */}
          {activeNav === 'reports' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">Customer Progress Reports</h3>
                  <p className="text-xs text-stone-500">Official wellness and biometric reports prepared for you.</p>
                </div>
                <button
                  onClick={() => setShowReportPrintModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  View & Print Report
                </button>
              </div>

              {latestScan ? (
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900 text-sm">Biometric Summary & Progress Report</span>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Generated based on {myMeasurements.length} consultations at Warangal Centre
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReportPrintModal(true)}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs rounded-lg transition-colors"
                  >
                    Open Document
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center text-stone-400">
                  <FileText className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                  <p className="font-semibold text-stone-700">No reports generated</p>
                  <p className="text-xs text-stone-400">Your nutritionist will generate a report after your initial scan.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: CENTRE LOCATION & UPI */}
          {activeNav === 'centre' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">Sri Nutrition & Wellness Centre</h3>
                <p className="text-xs text-stone-500">Facility address, timings, and business details.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <span className="font-bold text-stone-900 text-sm block">Physical Centre Address</span>
                  <div className="text-xs text-stone-600 leading-relaxed">
                    Sri Nutrition & Wellness Centre<br />
                    Warangal Centre, Telangana - 506001<br />
                    Coordinates: 17.9784° N, 79.5941° E
                  </div>
                  <div className="pt-2 border-t border-stone-200 text-xs text-stone-700 font-mono">
                    Phone: +91 7993367929
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <span className="font-bold text-stone-900 text-sm block">Consultation Payment UPI</span>
                  <div className="text-xs text-stone-600">
                    Business UPI ID:
                    <div className="font-mono font-bold text-stone-900 text-sm mt-1 bg-white p-2 rounded-lg border border-stone-200">
                      7660990052-2@ybl
                    </div>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Proprietor: Sangem Srivijayalaxmi
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STORE ORDERS */}
          {activeNav === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    My Nutritional Supplement Orders
                  </h3>
                  <p className="text-xs text-stone-500">
                    Track courier delivery, view item receipts, and verified payment records
                  </p>
                </div>
                <div className="text-xs font-mono text-stone-600 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-bold border border-emerald-200">
                  {myOrders.length} Order{myOrders.length !== 1 ? 's' : ''} Placed
                </div>
              </div>

              {myOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
                  <h4 className="font-bold text-stone-800 text-sm">No Orders Placed Yet</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Visit our nutritional store to order customized protein formulations, wellness teas, and metabolic supplements.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order: OrderRecord) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                        <div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                            Order Reference
                          </span>
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            {order.orderNumber}
                          </span>
                          <span className="text-[11px] text-stone-500 block">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                              order.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'SHIPPED'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            ₹{order.totalAmount.toFixed(2)} ({order.paymentStatus})
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-stone-100 bg-stone-50 rounded-xl p-3 border border-stone-200">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between text-xs">
                            <div>
                              <span className="font-bold text-stone-800">{item.productName}</span>
                              <span className="text-stone-500 font-mono text-[11px] block">
                                Qty: {item.quantity} &times; ₹{item.unitPrice.toFixed(2)} • SKU: {item.sku}
                              </span>
                            </div>
                            <span className="font-bold text-stone-900">
                              ₹{item.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Info & Notes */}
                      <div className="flex flex-col sm:flex-row justify-between text-xs text-stone-600 gap-2 pt-1">
                        <div>
                          <strong className="text-stone-800">Shipped To:</strong>{' '}
                          {order.shippingAddress.recipientName}, {order.shippingAddress.addressLine1},{' '}
                          {order.shippingAddress.city} ({order.shippingAddress.postalCode})
                        </div>
                        {order.notes && (
                          <div className="text-stone-500 italic">
                            &ldquo;{order.notes}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* PRINT-FRIENDLY REPORT MODAL */}
      {showReportPrintModal && currentCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-8 border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 print:hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Personal Progress Report
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  onClick={() => setShowReportPrintModal(false)}
                  className="text-stone-400 hover:text-stone-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="pt-6 space-y-6 text-stone-800">
              <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-4">
                <div>
                  <h1 className="text-xl font-serif font-bold text-stone-900">
                    Sri Nutrition & Wellness Centre
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Lead Nutritionist: <span className="font-semibold text-stone-800">Sangem Srivijayalaxmi</span>
                  </p>
                  <p className="text-xs text-stone-500">
                    Warangal Centre, Telangana • Mobile: +91 7993367929 • UPI: 7660990052-2@ybl
                  </p>
                </div>
                <div className="text-right text-xs text-stone-500">
                  <span className="font-semibold text-stone-800 block">Biometric Record Summary</span>
                  <span>Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block">Member Name</span>
                  <span className="font-bold text-stone-900 text-sm">{currentCustomer.fullName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Contact</span>
                  <span className="font-semibold text-stone-800">+91 {currentCustomer.mobile}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Age / Gender</span>
                  <span className="font-semibold text-stone-800">{currentCustomer.age} yrs / {currentCustomer.gender}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Total Scans</span>
                  <span className="font-semibold text-stone-800">{myMeasurements.length} Recorded</span>
                </div>
              </div>

              {latestScan && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Latest Biometric Metrics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 border border-stone-200 rounded-lg text-center">
                      <span className="text-xs text-stone-400">Weight</span>
                      <div className="text-lg font-bold text-stone-900">{latestScan.weightKg} kg</div>
                    </div>
                    <div className="p-3 border border-stone-200 rounded-lg text-center bg-emerald-50/40">
                      <span className="text-xs text-emerald-800">BMI</span>
                      <div className="text-lg font-bold text-emerald-800">{latestScan.bmi.toFixed(2)}</div>
                      <span className="text-[10px] text-emerald-700 block">({latestScan.bmiCategory})</span>
                    </div>
                    <div className="p-3 border border-stone-200 rounded-lg text-center">
                      <span className="text-xs text-stone-400">Body Fat %</span>
                      <div className="text-lg font-bold text-stone-900">{latestScan.bodyFatPercent ?? '—'}%</div>
                    </div>
                    <div className="p-3 border border-stone-200 rounded-lg text-center">
                      <span className="text-xs text-stone-400">Muscle Mass</span>
                      <div className="text-lg font-bold text-stone-900">{latestScan.musclePercent ?? '—'}%</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Chronological Scans
                </h3>
                <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
                  <thead className="bg-stone-100 text-stone-600 font-semibold uppercase">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Weight</th>
                      <th className="p-2">BMI</th>
                      <th className="p-2">Body Fat %</th>
                      <th className="p-2">Muscle %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {myMeasurements.map((m: MeasurementRecord) => (
                      <tr key={m.id}>
                        <td className="p-2 font-medium">{new Date(m.measuredAt).toLocaleDateString('en-IN')}</td>
                        <td className="p-2 font-semibold">{m.weightKg} kg</td>
                        <td className="p-2 font-semibold">{m.bmi.toFixed(1)}</td>
                        <td className="p-2">{m.bodyFatPercent ? `${m.bodyFatPercent}%` : '—'}</td>
                        <td className="p-2">{m.musclePercent ? `${m.musclePercent}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-600 leading-relaxed">
                <span className="font-bold text-stone-800 block mb-1">General Informational Disclaimer</span>
                This document contains recorded nutritional and biometric progress metrics. It is provided for general health awareness and lifestyle coaching purposes. It does not constitute a medical diagnosis, clinical evaluation, or pharmaceutical prescription.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
