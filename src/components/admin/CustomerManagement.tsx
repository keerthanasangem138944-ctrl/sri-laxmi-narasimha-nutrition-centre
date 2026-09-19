import React, { useState, useMemo } from 'react';
import { usePlatformState, CustomerRecord, MeasurementRecord, HealthNoteRecord, CampRecord } from '../../lib/platform-state';
import { calculateBMI } from '../../lib/calculations/bmi';
import { computeMeasurementComparison } from '../../../lib/actions/measurements';
import {
  Users,
  Search,
  UserPlus,
  ArrowUpDown,
  Phone,
  Mail,
  Calendar,
  Activity,
  PlusCircle,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  Camera,
  MapPin,
  Clock,
  Shield,
  Trash2,
  ExternalLink,
  Sparkles,
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

export const CustomerManagement: React.FC<{
  onSelectCustomerForMeasure?: (customer: CustomerRecord) => void;
}> = ({ onSelectCustomerForMeasure }) => {
  const {
    customers,
    measurements,
    camps,
    healthNotes,
    addCustomer,
    updateCustomer,
    deactivateCustomer,
    addMeasurement,
    deleteMeasurement,
    addHealthNote,
    getCustomerMeasurements,
    getCustomerNotes,
  } = usePlatformState();

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selection & Modal States
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'measurements' | 'progress' | 'notes' | 'camps' | 'reports'>('overview');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddMeasurementModal, setShowAddMeasurementModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [chartDateRange, setChartDateRange] = useState<'30' | '90' | '180' | '365' | 'ALL'>('ALL');

  // New Customer Form State
  const [newCustForm, setNewCustForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    age: '',
    gender: 'FEMALE' as 'MALE' | 'FEMALE' | 'OTHER',
    dateOfBirth: '',
    addressLine: '',
    city: 'Warangal',
    state: 'Telangana',
    postalCode: '506001',
    profilePhotoUrl: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Measurement Form State
  const [measForm, setMeasForm] = useState({
    heightCm: '',
    weightKg: '',
    age: '',
    bodyFatPercent: '',
    visceralFat: '',
    musclePercent: '',
    subcutaneousFatPercent: '',
    calories: '',
    notes: '',
  });
  const [measError, setMeasError] = useState<string | null>(null);

  // New Health Note Form State
  const [noteForm, setNoteForm] = useState({
    note: '',
    visibility: 'ADMIN_ONLY' as 'ADMIN_ONLY' | 'CUSTOMER_VISIBLE',
    isCustomerReported: false,
  });

  // Selected Customer lookup
  const selectedCustomer = useMemo(() => {
    return customers.find((c: CustomerRecord) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Selected Customer measurements & latest calculation
  const customerMeasurements = useMemo(() => {
    if (!selectedCustomerId) return [];
    return getCustomerMeasurements(selectedCustomerId);
  }, [selectedCustomerId, measurements]);

  const latestMeasurement = customerMeasurements[0] || null;
  const previousMeasurement = customerMeasurements[1] || null;

  const comparison = useMemo(() => {
    if (!latestMeasurement) return [];
    return computeMeasurementComparison(
      {
        weight_kg: latestMeasurement.weightKg,
        bmi: latestMeasurement.bmi,
        body_fat_percent: latestMeasurement.bodyFatPercent,
        muscle_percent: latestMeasurement.musclePercent,
        visceral_fat: latestMeasurement.visceralFat,
        subcutaneous_fat_percent: latestMeasurement.subcutaneousFatPercent,
        calories: latestMeasurement.calories,
      },
      previousMeasurement
        ? {
            weight_kg: previousMeasurement.weightKg,
            bmi: previousMeasurement.bmi,
            body_fat_percent: previousMeasurement.bodyFatPercent,
            muscle_percent: previousMeasurement.musclePercent,
            visceral_fat: previousMeasurement.visceralFat,
            subcutaneous_fat_percent: previousMeasurement.subcutaneousFatPercent,
            calories: previousMeasurement.calories,
          }
        : null
    );
  }, [latestMeasurement, previousMeasurement]);

  // Filtered & Paginated Customers (Section 3 & 4: Search by name, mobile, email)
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return customers.filter((c: CustomerRecord) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q))
      );
    });
  }, [customers, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  // Handle Add Customer Submission (Section 5: Zod validation & normalization)
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!newCustForm.fullName.trim() || newCustForm.fullName.trim().length < 2) {
      setFormError('Full name must be at least 2 characters.');
      return;
    }

    const cleanMobile = newCustForm.mobile.trim();
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setFormError('Please enter a valid 10-digit Indian mobile number (starting with 6-9).');
      return;
    }

    // Duplicate check
    const existing = customers.find((c: CustomerRecord) => c.mobile === cleanMobile);
    if (existing) {
      setFormError(`Customer already exists with this mobile number (${existing.fullName}).`);
      return;
    }

    const ageNum = parseInt(newCustForm.age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setFormError('Please enter a valid age between 1 and 120.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = addCustomer({
        fullName: newCustForm.fullName.trim(),
        mobile: cleanMobile,
        email: newCustForm.email.trim() ? newCustForm.email.trim().toLowerCase() : null,
        age: ageNum,
        gender: newCustForm.gender,
        dateOfBirth: newCustForm.dateOfBirth || undefined,
        addressLine: newCustForm.addressLine || undefined,
        city: newCustForm.city || 'Warangal',
        state: newCustForm.state || 'Telangana',
        postalCode: newCustForm.postalCode || '506001',
        profilePhotoUrl: newCustForm.profilePhotoUrl || undefined,
        authUserId: null, // Camp/admin creation without login (Section 8)
      });

      setFormSuccess(`Customer ${created.fullName} created successfully.`);
      setTimeout(() => {
        setShowAddCustomerModal(false);
        setSelectedCustomerId(created.id);
        setIsSubmitting(false);
        setNewCustForm({
          fullName: '',
          mobile: '',
          email: '',
          age: '',
          gender: 'FEMALE',
          dateOfBirth: '',
          addressLine: '',
          city: 'Warangal',
          state: 'Telangana',
          postalCode: '506001',
          profilePhotoUrl: '',
        });
      }, 700);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create customer');
      setIsSubmitting(false);
    }
  };

  // Handle Add Measurement Submission (Section 10, 11, 12)
  const handleCreateMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setMeasError(null);

    const h = parseFloat(measForm.heightCm);
    const w = parseFloat(measForm.weightKg);
    const a = parseInt(measForm.age || selectedCustomer.age.toString(), 10);

    if (isNaN(h) || h < 50 || h > 250) {
      setMeasError('Height must be between 50 cm and 250 cm.');
      return;
    }
    if (isNaN(w) || w < 15 || w > 350) {
      setMeasError('Weight must be between 15 kg and 350 kg.');
      return;
    }

    const bf = measForm.bodyFatPercent ? parseFloat(measForm.bodyFatPercent) : null;
    const vf = measForm.visceralFat ? parseFloat(measForm.visceralFat) : null;
    const mf = measForm.musclePercent ? parseFloat(measForm.musclePercent) : null;
    const sf = measForm.subcutaneousFatPercent ? parseFloat(measForm.subcutaneousFatPercent) : null;
    const cal = measForm.calories ? parseFloat(measForm.calories) : null;

    addMeasurement({
      customerId: selectedCustomer.id,
      campId: null,
      measuredAt: new Date().toISOString(),
      heightCm: h,
      weightKg: w,
      age: a,
      bodyFatPercent: bf,
      visceralFat: vf,
      musclePercent: mf,
      subcutaneousFatPercent: sf,
      calories: cal,
      notes: measForm.notes.trim() || null,
      createdBy: '00000000-0000-0000-0000-000000000001',
    });

    setShowAddMeasurementModal(false);
    setMeasForm({
      heightCm: '',
      weightKg: '',
      age: '',
      bodyFatPercent: '',
      visceralFat: '',
      musclePercent: '',
      subcutaneousFatPercent: '',
      calories: '',
      notes: '',
    });
  };

  // Handle Health Note Submission (Section 17 & 18)
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !noteForm.note.trim()) return;

    addHealthNote({
      customerId: selectedCustomer.id,
      authorId: '00000000-0000-0000-0000-000000000001',
      authorName: 'Sangem Srivijayalaxmi',
      note: noteForm.note.trim(),
      visibility: noteForm.visibility,
      isCustomerReported: noteForm.isCustomerReported,
    });

    setShowAddNoteModal(false);
    setNoteForm({
      note: '',
      visibility: 'ADMIN_ONLY',
      isCustomerReported: false,
    });
  };

  // Filter progress chart records
  const chartData = useMemo(() => {
    if (!customerMeasurements.length) return [];
    const sorted = [...customerMeasurements].reverse(); // chronological

    let cutoffDate = new Date(0);
    const now = new Date();
    if (chartDateRange === '30') cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (chartDateRange === '90') cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    if (chartDateRange === '180') cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    if (chartDateRange === '365') cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    return sorted
      .filter((m) => new Date(m.measuredAt) >= cutoffDate)
      .map((m) => ({
        date: new Date(m.measuredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        fullDate: new Date(m.measuredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        weight: m.weightKg,
        bmi: m.bmi,
        bodyFat: m.bodyFatPercent,
        muscle: m.musclePercent,
        visceralFat: m.visceralFat,
      }));
  }, [customerMeasurements, chartDateRange]);

  // Customer notes
  const customerNotes = useMemo(() => {
    if (!selectedCustomerId) return [];
    return getCustomerNotes(selectedCustomerId, true); // Admin sees both admin-only and customer-visible
  }, [selectedCustomerId, healthNotes]);

  // Camps attended
  const customerCamps = useMemo(() => {
    if (!selectedCustomerId) return [];
    return camps.filter((camp: CampRecord) => camp.participantIds.includes(selectedCustomerId));
  }, [selectedCustomerId, camps]);

  return (
    <div id="customer-management-root" className="space-y-6">
      {/* Top Controls Header */}
      {!selectedCustomer ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-600" />
                Customer Management
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Manage registered customer profiles, biometric histories, and community health camp records.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="btn-add-customer-trigger"
                onClick={() => setShowAddCustomerModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Customer
              </button>
            </div>
          </div>

          {/* Search, Filter & Summary Bar (Section 3 & 4) */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-customer-search"
                type="text"
                placeholder="Search by name, mobile, email, or city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Status:</span>
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === st
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {st}
                </button>
              ))}
              <span className="text-xs text-stone-400 ml-2">
                Showing {filteredCustomers.length} records
              </span>
            </div>
          </div>

          {/* Customer Table (Desktop) & Cards (Mobile) - Section 61 */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-600">
                <thead className="bg-stone-50/80 border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Age / Gender</th>
                    <th className="py-3.5 px-4">Latest Scan</th>
                    <th className="py-3.5 px-4">Weight & BMI</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400">
                        <Users className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                        <p className="font-medium text-stone-600">No customer records found</p>
                        <p className="text-xs text-stone-400 mt-0.5">Try searching with a different keyword or create a new customer record.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((cust: CustomerRecord) => {
                      const custMeas = getCustomerMeasurements(cust.id);
                      const latest = custMeas[0];

                      return (
                        <tr
                          key={cust.id}
                          className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                          onClick={() => {
                            setSelectedCustomerId(cust.id);
                            setActiveTab('overview');
                          }}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {cust.profilePhotoUrl ? (
                                <img
                                  src={cust.profilePhotoUrl}
                                  alt={cust.fullName}
                                  className="w-10 h-10 rounded-full object-cover border border-stone-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-sm flex items-center justify-center border border-emerald-200">
                                  {cust.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-stone-900 group-hover:text-emerald-700 transition-colors">
                                  {cust.fullName}
                                </div>
                                <div className="text-xs text-stone-400">
                                  ID: {cust.id.slice(0, 8)}... {cust.authUserId ? '• Online Account' : '• Camp Member'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-stone-900 font-mono text-xs flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-stone-400" />
                              +91 {cust.mobile}
                            </div>
                            {cust.email && (
                              <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                                <Mail className="w-3 h-3 text-stone-400" />
                                {cust.email}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-medium text-stone-800">{cust.age} yrs</span>
                            <span className="text-xs text-stone-400 ml-1.5">({cust.gender})</span>
                          </td>

                          <td className="py-3.5 px-4">
                            {latest ? (
                              <div className="text-xs">
                                <div className="font-medium text-stone-800">
                                  {new Date(latest.measuredAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </div>
                                <div className="text-stone-400">{custMeas.length} total scans</div>
                              </div>
                            ) : (
                              <span className="text-xs text-stone-400 italic">No scans recorded</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {latest ? (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-stone-900">{latest.weightKg} kg</span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    latest.bmi < 18.5
                                      ? 'bg-amber-100 text-amber-800'
                                      : latest.bmi < 25
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : latest.bmi < 30
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  BMI {latest.bmi.toFixed(1)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-stone-400">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                cust.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-stone-100 text-stone-600 border border-stone-200'
                              }`}
                            >
                              {cust.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedCustomerId(cust.id);
                                  setActiveTab('overview');
                                }}
                                className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCustomerId(cust.id);
                                  setShowAddMeasurementModal(true);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Activity className="w-3 h-3" />
                                Measure
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Section 61: Responsive Cards) */}
            <div className="block lg:hidden divide-y divide-stone-100">
              {paginatedCustomers.length === 0 ? (
                <div className="p-8 text-center text-stone-400">
                  <p className="font-medium text-stone-600">No customer records found</p>
                </div>
              ) : (
                paginatedCustomers.map((cust: CustomerRecord) => {
                  const custMeas = getCustomerMeasurements(cust.id);
                  const latest = custMeas[0];

                  return (
                    <div
                      key={cust.id}
                      onClick={() => {
                        setSelectedCustomerId(cust.id);
                        setActiveTab('overview');
                      }}
                      className="p-4 hover:bg-stone-50 active:bg-stone-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center border border-emerald-200 shrink-0">
                            {cust.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900">{cust.fullName}</div>
                            <div className="text-xs text-stone-500 font-mono">+91 {cust.mobile}</div>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            cust.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {cust.status}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                        <div>
                          <span className="text-stone-400 block">Latest Weight:</span>
                          <span className="font-semibold text-stone-800">
                            {latest ? `${latest.weightKg} kg` : 'No scans'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block">BMI Status:</span>
                          <span className="font-semibold text-stone-800">
                            {latest ? `BMI ${latest.bmi.toFixed(1)} (${latest.bmiCategory})` : '—'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedCustomerId(cust.id);
                            setActiveTab('overview');
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomerId(cust.id);
                            setShowAddMeasurementModal(true);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1"
                        >
                          <Activity className="w-3 h-3" />
                          Record Measurement
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-stone-50/50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* CUSTOMER PROFILE DETAIL VIEW (Section 6, 64 & 65) */
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Customer Directory
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddMeasurementModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add Measurement
                </button>
                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Add Note
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Generate Report
                </button>
              </div>
            </div>

            {/* Profile Info Header */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xl flex items-center justify-center border-2 border-emerald-200 shadow-inner">
                  {selectedCustomer.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-serif font-bold text-stone-900">
                      {selectedCustomer.fullName}
                    </h2>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        selectedCustomer.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {selectedCustomer.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mt-1">
                    <span className="font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-400" /> +91 {selectedCustomer.mobile}
                    </span>
                    {selectedCustomer.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-stone-400" /> {selectedCustomer.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" /> {selectedCustomer.city}, {selectedCustomer.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Biometric Strip */}
              <div className="grid grid-cols-3 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 text-center">
                <div>
                  <span className="text-xs text-stone-400 block">Latest Weight</span>
                  <span className="text-base font-bold text-stone-900">
                    {latestMeasurement ? `${latestMeasurement.weightKg} kg` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block">BMI</span>
                  <span className="text-base font-bold text-emerald-700">
                    {latestMeasurement ? latestMeasurement.bmi.toFixed(1) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block">Total Scans</span>
                  <span className="text-base font-bold text-stone-900">{customerMeasurements.length}</span>
                </div>
              </div>
            </div>

            {/* Profile Navigation Tabs (Section 64 & 65) */}
            <div className="mt-6 flex items-center gap-2 border-b border-stone-200 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'measurements', label: `Measurements (${customerMeasurements.length})` },
                { id: 'progress', label: 'Progress Charts' },
                { id: 'notes', label: `Health Notes (${customerNotes.length})` },
                { id: 'camps', label: `Camps Attended (${customerCamps.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2.5 px-4 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {latestMeasurement ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                      <span className="text-xs text-stone-400 font-medium">Body Weight</span>
                      <div className="text-2xl font-bold text-stone-900 mt-1">
                        {latestMeasurement.weightKg} <span className="text-sm font-normal text-stone-500">kg</span>
                      </div>
                      <span className="text-xs text-emerald-700 mt-1 block">
                        Height: {latestMeasurement.heightCm} cm
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                      <span className="text-xs text-stone-400 font-medium">BMI Status</span>
                      <div className="text-2xl font-bold text-emerald-700 mt-1">
                        {latestMeasurement.bmi.toFixed(2)}
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-1 inline-block">
                        {latestMeasurement.bmiCategory}
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                      <span className="text-xs text-stone-400 font-medium">Body Fat %</span>
                      <div className="text-2xl font-bold text-stone-900 mt-1">
                        {latestMeasurement.bodyFatPercent ? `${latestMeasurement.bodyFatPercent}%` : '—'}
                      </div>
                      <span className="text-xs text-stone-500 mt-1 block">
                        Visceral Fat: {latestMeasurement.visceralFat ?? '—'}
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                      <span className="text-xs text-stone-400 font-medium">Muscle Mass</span>
                      <div className="text-2xl font-bold text-stone-900 mt-1">
                        {latestMeasurement.musclePercent ? `${latestMeasurement.musclePercent}%` : '—'}
                      </div>
                      <span className="text-xs text-stone-500 mt-1 block">
                        Estimated BMR: {latestMeasurement.calories ? `${latestMeasurement.calories} kcal` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Measurement Comparison Panel (Section 16: Neutral Wording Difference) */}
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                    <h3 className="text-base font-serif font-bold text-stone-900 mb-1 flex items-center justify-between">
                      <span>Biometric Comparison (Latest vs Previous)</span>
                      {previousMeasurement && (
                        <span className="text-xs font-normal text-stone-400">
                          Previous scan: {new Date(previousMeasurement.measuredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-stone-500 mb-4">
                      Objective delta indicators between recorded consultations.
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-stone-50 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          <tr>
                            <th className="py-2.5 px-4">Metric</th>
                            <th className="py-2.5 px-4">Previous</th>
                            <th className="py-2.5 px-4">Current</th>
                            <th className="py-2.5 px-4">Difference</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {comparison.map((row) => (
                            <tr key={row.name} className="hover:bg-stone-50/50">
                              <td className="py-2.5 px-4 font-medium text-stone-800">{row.name}</td>
                              <td className="py-2.5 px-4 text-stone-500">
                                {row.previous !== null ? `${row.previous} ${row.unit}` : '—'}
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-stone-900">
                                {row.current !== null ? `${row.current} ${row.unit}` : '—'}
                              </td>
                              <td className="py-2.5 px-4">
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                                    row.difference === null
                                      ? 'text-stone-400'
                                      : row.difference === 0
                                      ? 'bg-stone-100 text-stone-700'
                                      : 'bg-emerald-50 text-emerald-800'
                                  }`}
                                >
                                  {row.diffLabel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty state for measurements (Section 47) */
                <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
                  <Activity className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-stone-800">No measurements recorded yet</h3>
                  <p className="text-sm text-stone-500 max-w-md mx-auto mt-1 mb-5">
                    Add the customer's first measurement to begin tracking weight, BMI, body fat, and metabolic progress.
                  </p>
                  <button
                    onClick={() => setShowAddMeasurementModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Record First Measurement
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MEASUREMENT HISTORY & TIMELINE (Section 13 & 14) */}
          {activeTab === 'measurements' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold text-stone-900">
                    Chronological Measurement Records ({customerMeasurements.length})
                  </h3>
                  <button
                    onClick={() => setShowAddMeasurementModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    New Measurement
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-stone-600">
                    <thead className="bg-stone-50/50 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Height & Weight</th>
                        <th className="py-3 px-4">BMI & Category</th>
                        <th className="py-3 px-4">Body Fat %</th>
                        <th className="py-3 px-4">Muscle %</th>
                        <th className="py-3 px-4">Visceral Fat</th>
                        <th className="py-3 px-4">Calories/BMR</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {customerMeasurements.map((m: MeasurementRecord) => (
                        <tr key={m.id} className="hover:bg-stone-50/70">
                          <td className="py-3 px-4 font-medium text-stone-900">
                            {new Date(m.measuredAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-stone-800">{m.weightKg} kg</span>
                            <span className="text-xs text-stone-400 block">{m.heightCm} cm</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-700">{m.bmi.toFixed(1)}</span>
                            <span className="text-xs text-stone-500 block">{m.bmiCategory}</span>
                          </td>
                          <td className="py-3 px-4">{m.bodyFatPercent ? `${m.bodyFatPercent}%` : '—'}</td>
                          <td className="py-3 px-4">{m.musclePercent ? `${m.musclePercent}%` : '—'}</td>
                          <td className="py-3 px-4">{m.visceralFat ?? '—'}</td>
                          <td className="py-3 px-4">{m.calories ? `${m.calories} kcal` : '—'}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              title="Soft delete record (Audited)"
                              onClick={() => {
                                if (confirm('Are you sure you want to remove this measurement record? This action is logged for audit purposes.')) {
                                  deleteMeasurement(m.id, 'Administrative deletion request');
                                }
                              }}
                              className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROGRESS CHARTS (Recharts - Section 15 & 32) */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-serif font-bold text-stone-900">Biometric Trajectory</h3>
                    <p className="text-xs text-stone-500">Weight, BMI, and body composition changes over time.</p>
                  </div>

                  {/* Date Filter Buttons (Section 15: 30d, 90d, 6m, 1y, All) */}
                  <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                    {[
                      { id: '30', label: '30 Days' },
                      { id: '90', label: '90 Days' },
                      { id: '180', label: '6 Months' },
                      { id: '365', label: '1 Year' },
                      { id: 'ALL', label: 'All Time' },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setChartDateRange(filter.id as any)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                          chartDateRange === filter.id
                            ? 'bg-white text-emerald-800 shadow-sm'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {chartData.length < 2 ? (
                  <div className="py-16 text-center text-stone-400">
                    <Activity className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                    <p className="font-semibold text-stone-700">Need at least 2 measurements for trend visualization</p>
                    <p className="text-xs text-stone-400 mt-1">Add another measurement to unlock interactive charts.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Weight & BMI Chart */}
                    <div className="h-72 w-full">
                      <div className="text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wider">
                        Weight (kg) & BMI Progress
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              borderRadius: '12px',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="weight"
                            name="Weight (kg)"
                            stroke="#059669"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#059669' }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="bmi"
                            name="BMI"
                            stroke="#0284c7"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            dot={{ r: 3, fill: '#0284c7' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Body Fat & Muscle Chart */}
                    <div className="h-72 w-full pt-4 border-t border-stone-100">
                      <div className="text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wider">
                        Body Fat % vs Muscle Mass %
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              borderRadius: '12px',
                              border: '1px solid #e2e8f0',
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="bodyFat"
                            name="Body Fat %"
                            stroke="#f59e0b"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: '#f59e0b' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="muscle"
                            name="Muscle Mass %"
                            stroke="#8b5cf6"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: '#8b5cf6' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: HEALTH NOTES (Section 17 & 18: Admin-only vs Customer-visible) */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-serif font-bold text-stone-900">Health & Dietary Notes</h3>
                    <p className="text-xs text-stone-500">
                      Includes customer-reported concerns and internal professional consultation remarks.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Record Note
                  </button>
                </div>

                <div className="space-y-3">
                  {customerNotes.length === 0 ? (
                    <div className="py-8 text-center text-stone-400">
                      <FileText className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                      <p className="font-medium text-stone-700">No notes recorded yet</p>
                      <p className="text-xs text-stone-400">Add an observation or log a customer concern.</p>
                    </div>
                  ) : (
                    customerNotes.map((note: HealthNoteRecord) => (
                      <div
                        key={note.id}
                        className={`p-4 rounded-xl border transition-all ${
                          note.visibility === 'ADMIN_ONLY'
                            ? 'bg-amber-50/40 border-amber-200/80'
                            : 'bg-emerald-50/30 border-emerald-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                                note.visibility === 'ADMIN_ONLY'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              {note.visibility === 'ADMIN_ONLY' ? (
                                <>
                                  <Lock className="w-3 h-3" /> Admin Internal Only
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3" /> Customer Visible
                                </>
                              )}
                            </span>

                            {note.isCustomerReported && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-800 font-medium">
                                Customer-reported concern
                              </span>
                            )}
                          </div>

                          <span className="text-xs text-stone-400">
                            {new Date(note.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <p className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">
                          {note.note}
                        </p>
                        <div className="text-xs text-stone-400 mt-2">
                          Recorded by {note.authorName}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CAMPS ATTENDED (Section 26 & 27) */}
          {activeTab === 'camps' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="text-base font-serif font-bold text-stone-900 mb-1">Camps Attended</h3>
                <p className="text-xs text-stone-500 mb-4">
                  Health camps and community screening sessions attended by this customer.
                </p>

                {customerCamps.length === 0 ? (
                  <div className="py-8 text-center text-stone-400">
                    <MapPin className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                    <p className="font-medium text-stone-700">No camp participations recorded</p>
                    <p className="text-xs text-stone-400">
                      When checking in customers at health camps, their session records will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customerCamps.map((c: CampRecord) => (
                      <div key={c.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-900 text-sm">{c.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                            {c.status}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 mt-2 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {c.date} ({c.startTime} - {c.endTime})
                        </div>
                        <div className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          {c.locationName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD CUSTOMER (Section 5: Zod validation & normalization) */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Add New Customer
              </h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {formSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={newCustForm.fullName}
                    onChange={(e) => setNewCustForm({ ...newCustForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    placeholder="e.g. 9848012345"
                    value={newCustForm.mobile}
                    onChange={(e) => setNewCustForm({ ...newCustForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="ananya@example.com"
                    value={newCustForm.email}
                    onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    min="1"
                    max="120"
                    placeholder="28"
                    value={newCustForm.age}
                    onChange={(e) => setNewCustForm({ ...newCustForm, age: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={newCustForm.gender}
                    onChange={(e) => setNewCustForm({ ...newCustForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newCustForm.city}
                    onChange={(e) => setNewCustForm({ ...newCustForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="House/Flat No, Landmark, Locality"
                  value={newCustForm.addressLine}
                  onChange={(e) => setNewCustForm({ ...newCustForm, addressLine: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Customer...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD MEASUREMENT (Section 10, 11, 12: Server-side calculated BMI) */}
      {showAddMeasurementModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Record Body Measurement
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Customer: <span className="font-semibold text-stone-800">{selectedCustomer.fullName}</span> (Age {selectedCustomer.age})
                </p>
              </div>
              <button
                onClick={() => setShowAddMeasurementModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeasurement} className="mt-4 space-y-4">
              {measError && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {measError}
                </div>
              )}

              {/* Core Height & Weight */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Height (cm) *
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    required
                    placeholder="e.g. 165"
                    value={measForm.heightCm}
                    onChange={(e) => setMeasForm({ ...measForm, heightCm: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    required
                    placeholder="e.g. 68.5"
                    value={measForm.weightKg}
                    onChange={(e) => setMeasForm({ ...measForm, weightKg: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Preview of Server-Side Calculated BMI Formula */}
              {parseFloat(measForm.heightCm) > 0 && parseFloat(measForm.weightKg) > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="text-emerald-800 font-medium">Server-calculated BMI: </span>
                    <span className="font-bold text-emerald-900 text-sm">
                      {calculateBMI(parseFloat(measForm.weightKg), parseFloat(measForm.heightCm)).bmi.toFixed(2)}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-semibold rounded-full text-xs">
                    {calculateBMI(parseFloat(measForm.weightKg), parseFloat(measForm.heightCm)).category}
                  </span>
                </div>
              )}

              {/* Advanced Composition Parameters */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Body Fat %
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="e.g. 24.5"
                    value={measForm.bodyFatPercent}
                    onChange={(e) => setMeasForm({ ...measForm, bodyFatPercent: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Visceral Fat (1-50)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 5"
                    value={measForm.visceralFat}
                    onChange={(e) => setMeasForm({ ...measForm, visceralFat: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Muscle %
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="e.g. 32.0"
                    value={measForm.musclePercent}
                    onChange={(e) => setMeasForm({ ...measForm, musclePercent: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Subcutaneous Fat %
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="e.g. 19.5"
                    value={measForm.subcutaneousFatPercent}
                    onChange={(e) => setMeasForm({ ...measForm, subcutaneousFatPercent: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Estimated BMR / Calories (kcal/day)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 1450"
                  value={measForm.calories}
                  onChange={(e) => setMeasForm({ ...measForm, calories: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Consultation Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes on hydration, diet, exercise adherence..."
                  value={measForm.notes}
                  onChange={(e) => setMeasForm({ ...measForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddMeasurementModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD HEALTH NOTE (Section 17 & 18: Visibility & Reported Concerns) */}
      {showAddNoteModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Record Health Note
              </h3>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Note Content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record dietary observations, symptoms mentioned, or internal notes..."
                  value={noteForm.note}
                  onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Visibility Mode (Default: Admin Only)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNoteForm({ ...noteForm, visibility: 'ADMIN_ONLY' })}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 ${
                        noteForm.visibility === 'ADMIN_ONLY'
                          ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm'
                          : 'bg-white border-stone-200 text-stone-600'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      ADMIN_ONLY
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteForm({ ...noteForm, visibility: 'CUSTOMER_VISIBLE' })}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 ${
                        noteForm.visibility === 'CUSTOMER_VISIBLE'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-sm'
                          : 'bg-white border-stone-200 text-stone-600'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      CUSTOMER_VISIBLE
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={noteForm.isCustomerReported}
                    onChange={(e) => setNoteForm({ ...noteForm, isCustomerReported: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-stone-700 font-medium">
                    Mark as "Customer-reported concern" (Non-diagnostic)
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINT-FRIENDLY REPORT PREVIEW (Sections 34, 35, 36 & 53) */}
      {showReportModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-8 border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 print:hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Customer Progress Report
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Report
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-stone-400 hover:text-stone-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="pt-6 space-y-6 text-stone-800">
              {/* Report Header */}
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
                  <span className="font-semibold text-stone-800 block">Confidential Biometric Summary</span>
                  <span>Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Customer Demographics Strip */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block">Customer Name</span>
                  <span className="font-bold text-stone-900 text-sm">{selectedCustomer.fullName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Contact</span>
                  <span className="font-semibold text-stone-800">+91 {selectedCustomer.mobile}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Age / Gender</span>
                  <span className="font-semibold text-stone-800">{selectedCustomer.age} yrs / {selectedCustomer.gender}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Total Consultations</span>
                  <span className="font-semibold text-stone-800">{customerMeasurements.length} Scans</span>
                </div>
              </div>

              {/* Latest Biometric Scan */}
              {latestMeasurement && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Latest Recorded Scan ({new Date(latestMeasurement.measuredAt).toLocaleDateString('en-IN')})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 border border-stone-200 rounded-lg text-center">
                      <span className="text-xs text-stone-400">Weight</span>
                      <div className="text-lg font-bold text-stone-900">{latestMeasurement.weightKg} kg</div>
                    </div>
                    <div className="p-3 border border-stone-200 rounded-lg text-center bg-emerald-50/40">
                      <span className="text-xs text-emerald-800">BMI</span>
                      <div className="text-lg font-bold text-emerald-800">{latestMeasurement.bmi.toFixed(2)}</div>
                      <span className="text-[10px] text-emerald-700 block">({latestMeasurement.bmiCategory})</span>
                    </div>
                    <div className="p-3 border border-stone-200 rounded-lg text-center">
                      <span className="text-xs text-stone-400">Body Fat %</span>
                      <div className="text-lg font-bold text-stone-900">{latestMeasurement.bodyFatPercent ?? '—'}%</div>
                    </div>
                    <div className="p-3 border border-stone-200 rounded-lg text-center">
                      <span className="text-xs text-stone-400">Muscle Mass</span>
                      <div className="text-lg font-bold text-stone-900">{latestMeasurement.musclePercent ?? '—'}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Historical Trajectory Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Measurement History & Progression
                </h3>
                <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
                  <thead className="bg-stone-100 text-stone-600 font-semibold uppercase">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Weight</th>
                      <th className="p-2">BMI</th>
                      <th className="p-2">Body Fat %</th>
                      <th className="p-2">Muscle %</th>
                      <th className="p-2">Visceral Fat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {customerMeasurements.slice(0, 5).map((m: MeasurementRecord) => (
                      <tr key={m.id}>
                        <td className="p-2 font-medium">{new Date(m.measuredAt).toLocaleDateString('en-IN')}</td>
                        <td className="p-2 font-semibold">{m.weightKg} kg</td>
                        <td className="p-2 font-semibold">{m.bmi.toFixed(1)}</td>
                        <td className="p-2">{m.bodyFatPercent ? `${m.bodyFatPercent}%` : '—'}</td>
                        <td className="p-2">{m.musclePercent ? `${m.musclePercent}%` : '—'}</td>
                        <td className="p-2">{m.visceralFat ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Non-Diagnostic Disclaimer (Section 52 & 53) */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-600 leading-relaxed">
                <span className="font-bold text-stone-800 block mb-1">General Informational Disclaimer</span>
                This document contains recorded nutritional and biometric progress metrics. It is provided for general health awareness and lifestyle coaching purposes. It does not constitute a medical diagnosis, clinical evaluation, or pharmaceutical prescription. Please consult a licensed medical physician for disease diagnosis or medical treatment.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
