import React, { useState, useMemo } from 'react';
import { usePlatformState, CampRecord, CustomerRecord, MeasurementRecord } from '../../lib/platform-state';
import { calculateBMI } from '../../lib/calculations/bmi';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  PlusCircle,
  Activity,
  CheckCircle2,
  Search,
  UserPlus,
  ArrowRight,
  Sparkles,
  Smartphone,
  ChevronLeft,
  AlertCircle,
  Phone,
} from 'lucide-react';

export const CampManagement: React.FC = () => {
  const {
    camps,
    customers,
    measurements,
    addCamp,
    updateCamp,
    addCustomerToCamp,
    addCustomer,
    addMeasurement,
    getCustomerMeasurements,
  } = usePlatformState();

  // Navigation & Modal States
  const [selectedCampId, setSelectedCampId] = useState<string | null>(null);
  const [isCampCheckInMode, setIsCampCheckInMode] = useState(false);
  const [showCreateCampModal, setShowCreateCampModal] = useState(false);

  // Camp Creation Form State
  const [campForm, setCampForm] = useState({
    name: '',
    date: '2026-10-05',
    startTime: '08:00',
    endTime: '13:00',
    locationName: '',
    address: '',
    description: '',
    maxRegistrations: 60,
  });
  const [campError, setCampError] = useState<string | null>(null);

  // Mobile Camp Check-In Flow State (Sections 22, 23, 24, 25)
  const [checkInStep, setCheckInStep] = useState<'SEARCH_OR_NEW' | 'MEASURE' | 'CONFIRMATION'>('SEARCH_OR_NEW');
  const [campSearchQuery, setCampSearchQuery] = useState('');
  const [activeCheckInCustomer, setActiveCheckInCustomer] = useState<CustomerRecord | null>(null);

  // New Customer Quick Entry inside Camp
  const [quickCustomerForm, setQuickCustomerForm] = useState({
    fullName: '',
    mobile: '',
    age: '',
    gender: 'FEMALE' as 'MALE' | 'FEMALE' | 'OTHER',
  });
  const [quickCustomerError, setQuickCustomerError] = useState<string | null>(null);

  // Rapid Biometric Measurement Form
  const [quickMeasForm, setQuickMeasForm] = useState({
    heightCm: '',
    weightKg: '',
    bodyFatPercent: '',
    visceralFat: '',
    musclePercent: '',
    subcutaneousFatPercent: '',
    calories: '',
    notes: '',
  });
  const [quickMeasError, setQuickMeasError] = useState<string | null>(null);

  // Selected Camp lookup
  const selectedCamp = useMemo(() => {
    return camps.find((c: CampRecord) => c.id === selectedCampId) || null;
  }, [camps, selectedCampId]);

  // Camp Participants lookup
  const campParticipants = useMemo(() => {
    if (!selectedCamp) return [];
    return customers.filter((c: CustomerRecord) => selectedCamp.participantIds.includes(c.id));
  }, [selectedCamp, customers]);

  // Search Results for Camp Quick Entry
  const campSearchResults = useMemo(() => {
    const q = campSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return customers.filter(
      (c: CustomerRecord) => c.fullName.toLowerCase().includes(q) || c.mobile.includes(q)
    );
  }, [customers, campSearchQuery]);

  // Handle Create Camp
  const handleCreateCamp = (e: React.FormEvent) => {
    e.preventDefault();
    setCampError(null);

    if (!campForm.name.trim() || !campForm.locationName.trim() || !campForm.address.trim()) {
      setCampError('Please enter camp name, location name, and full address.');
      return;
    }

    const created = addCamp({
      name: campForm.name.trim(),
      date: campForm.date,
      startTime: campForm.startTime,
      endTime: campForm.endTime,
      locationName: campForm.locationName.trim(),
      address: campForm.address.trim(),
      description: campForm.description.trim(),
      status: 'PLANNED',
      maxRegistrations: campForm.maxRegistrations,
    });

    setShowCreateCampModal(false);
    setSelectedCampId(created.id);
    setCampForm({
      name: '',
      date: '2026-10-05',
      startTime: '08:00',
      endTime: '13:00',
      locationName: '',
      address: '',
      description: '',
      maxRegistrations: 60,
    });
  };

  // Handle Quick Customer Registration at Camp (Section 25)
  const handleQuickCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCamp) return;
    setQuickCustomerError(null);

    if (!quickCustomerForm.fullName.trim()) {
      setQuickCustomerError('Customer name is required.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(quickCustomerForm.mobile.trim())) {
      setQuickCustomerError('Valid 10-digit Indian mobile number required.');
      return;
    }
    const ageNum = parseInt(quickCustomerForm.age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setQuickCustomerError('Valid age between 1 and 120 required.');
      return;
    }

    // Check if phone number already exists
    const existing = customers.find((c: CustomerRecord) => c.mobile === quickCustomerForm.mobile.trim());
    let customerToUse: CustomerRecord;

    if (existing) {
      customerToUse = existing;
    } else {
      customerToUse = addCustomer({
        fullName: quickCustomerForm.fullName.trim(),
        mobile: quickCustomerForm.mobile.trim(),
        email: null,
        age: ageNum,
        gender: quickCustomerForm.gender,
        authUserId: null,
      });
    }

    // Link customer to this camp
    addCustomerToCamp(selectedCamp.id, customerToUse.id);

    // Proceed straight to rapid measurement entry
    setActiveCheckInCustomer(customerToUse);
    setCheckInStep('MEASURE');
    setQuickCustomerForm({ fullName: '', mobile: '', age: '', gender: 'FEMALE' });
  };

  // Handle Quick Measurement Save at Camp (Section 22 & 23)
  const handleSaveCampMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCamp || !activeCheckInCustomer) return;
    setQuickMeasError(null);

    const h = parseFloat(quickMeasForm.heightCm);
    const w = parseFloat(quickMeasForm.weightKg);

    if (isNaN(h) || h < 50 || h > 250) {
      setQuickMeasError('Height must be between 50 and 250 cm.');
      return;
    }
    if (isNaN(w) || w < 15 || w > 350) {
      setQuickMeasError('Weight must be between 15 and 350 kg.');
      return;
    }

    addMeasurement({
      customerId: activeCheckInCustomer.id,
      campId: selectedCamp.id,
      measuredAt: new Date().toISOString(),
      heightCm: h,
      weightKg: w,
      age: activeCheckInCustomer.age,
      bodyFatPercent: quickMeasForm.bodyFatPercent ? parseFloat(quickMeasForm.bodyFatPercent) : null,
      visceralFat: quickMeasForm.visceralFat ? parseFloat(quickMeasForm.visceralFat) : null,
      musclePercent: quickMeasForm.musclePercent ? parseFloat(quickMeasForm.musclePercent) : null,
      subcutaneousFatPercent: quickMeasForm.subcutaneousFatPercent ? parseFloat(quickMeasForm.subcutaneousFatPercent) : null,
      calories: quickMeasForm.calories ? parseFloat(quickMeasForm.calories) : null,
      notes: quickMeasForm.notes.trim() ? `[Camp Check-In] ${quickMeasForm.notes.trim()}` : '[Camp Check-In]',
      createdBy: '00000000-0000-0000-0000-000000000001',
    });

    setCheckInStep('CONFIRMATION');
  };

  // Reset check-in state for next customer
  const handleNextCustomer = () => {
    setActiveCheckInCustomer(null);
    setCampSearchQuery('');
    setQuickMeasForm({
      heightCm: '',
      weightKg: '',
      bodyFatPercent: '',
      visceralFat: '',
      musclePercent: '',
      subcutaneousFatPercent: '',
      calories: '',
      notes: '',
    });
    setCheckInStep('SEARCH_OR_NEW');
  };

  return (
    <div id="camp-management-root" className="space-y-6">
      {/* CAMP CHECK-IN MODE: FULLSCREEN MOBILE-FIRST QUICK ENTRY (Section 22 & 23) */}
      {isCampCheckInMode && selectedCamp ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-xl overflow-hidden max-w-2xl mx-auto">
          {/* Mobile Camp Mode Header Bar */}
          <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-300" />
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-300 block">
                  Mobile Camp Mode
                </span>
                <h3 className="font-serif font-bold text-sm truncate max-w-xs">{selectedCamp.name}</h3>
              </div>
            </div>
            <button
              onClick={() => {
                setIsCampCheckInMode(false);
                handleNextCustomer();
              }}
              className="text-xs bg-emerald-900/80 hover:bg-emerald-900 text-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Exit Camp Mode
            </button>
          </div>

          <div className="p-6">
            {/* STEP 1: SEARCH EXISTING OR CREATE NEW (Section 24 & 25) */}
            {checkInStep === 'SEARCH_OR_NEW' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-stone-900">Step 1: Identify Customer</h4>
                  <p className="text-xs text-stone-500">
                    Search existing registered database or quick-register a new camp attendee.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name or 10-digit mobile..."
                    value={campSearchQuery}
                    onChange={(e) => setCampSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Search Results */}
                {campSearchResults.length > 0 && (
                  <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 max-h-48 overflow-y-auto">
                    {campSearchResults.map((cust: CustomerRecord) => {
                      const latest = getCustomerMeasurements(cust.id)[0];
                      return (
                        <div
                          key={cust.id}
                          onClick={() => {
                            addCustomerToCamp(selectedCamp.id, cust.id);
                            setActiveCheckInCustomer(cust);
                            setCheckInStep('MEASURE');
                          }}
                          className="p-3 hover:bg-emerald-50/70 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-stone-900 text-sm">{cust.fullName}</div>
                            <div className="text-xs text-stone-500 font-mono">+91 {cust.mobile} • Age {cust.age}</div>
                          </div>
                          <button className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                            Select <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-stone-200"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold text-stone-400 uppercase">
                    OR Register New Attendee
                  </span>
                  <div className="flex-grow border-t border-stone-200"></div>
                </div>

                {/* Quick New Customer Registration Form (Section 25) */}
                <form onSubmit={handleQuickCustomerSubmit} className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                  {quickCustomerError && (
                    <div className="p-2 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-lg">
                      {quickCustomerError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Babu"
                      value={quickCustomerForm.fullName}
                      onChange={(e) => setQuickCustomerForm({ ...quickCustomerForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile (10 digits) *</label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        required
                        placeholder="9876543210"
                        value={quickCustomerForm.mobile}
                        onChange={(e) => setQuickCustomerForm({ ...quickCustomerForm, mobile: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Age *</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        required
                        placeholder="35"
                        value={quickCustomerForm.age}
                        onChange={(e) => setQuickCustomerForm({ ...quickCustomerForm, age: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    Save & Proceed to Measurement
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: RAPID BODY MEASUREMENT ENTRY (Section 23: Large inputs, numeric keyboards) */}
            {checkInStep === 'MEASURE' && activeCheckInCustomer && (
              <form onSubmit={handleSaveCampMeasurement} className="space-y-4">
                <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <div>
                    <span className="text-xs text-emerald-800 font-semibold uppercase">Recording For:</span>
                    <div className="font-bold text-stone-900 text-sm">{activeCheckInCustomer.fullName}</div>
                    <div className="text-xs text-stone-500 font-mono">+91 {activeCheckInCustomer.mobile} • Age {activeCheckInCustomer.age}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckInStep('SEARCH_OR_NEW')}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    Change Customer
                  </button>
                </div>

                {quickMeasError && (
                  <div className="p-2 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-lg">
                    {quickMeasError}
                  </div>
                )}

                {/* Primary Height & Weight */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Height (cm) *
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      required
                      placeholder="170"
                      value={quickMeasForm.heightCm}
                      onChange={(e) => setQuickMeasForm({ ...quickMeasForm, heightCm: e.target.value })}
                      className="w-full px-3 py-3 text-lg font-bold border-2 border-stone-300 rounded-xl focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      required
                      placeholder="72.5"
                      value={quickMeasForm.weightKg}
                      onChange={(e) => setQuickMeasForm({ ...quickMeasForm, weightKg: e.target.value })}
                      className="w-full px-3 py-3 text-lg font-bold border-2 border-stone-300 rounded-xl focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dynamic Server-Side BMI Calculation Indicator */}
                {parseFloat(quickMeasForm.heightCm) > 0 && parseFloat(quickMeasForm.weightKg) > 0 && (
                  <div className="p-3 bg-stone-100 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700">Live Calculated BMI:</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      {calculateBMI(parseFloat(quickMeasForm.weightKg), parseFloat(quickMeasForm.heightCm)).bmi.toFixed(2)} (
                      {calculateBMI(parseFloat(quickMeasForm.weightKg), parseFloat(quickMeasForm.heightCm)).category})
                    </span>
                  </div>
                )}

                {/* Secondary Biometrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Body Fat %</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      placeholder="22.5"
                      value={quickMeasForm.bodyFatPercent}
                      onChange={(e) => setQuickMeasForm({ ...quickMeasForm, bodyFatPercent: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Visceral Fat</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="6"
                      value={quickMeasForm.visceralFat}
                      onChange={(e) => setQuickMeasForm({ ...quickMeasForm, visceralFat: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Muscle Mass %</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      placeholder="31.2"
                      value={quickMeasForm.musclePercent}
                      onChange={(e) => setQuickMeasForm({ ...quickMeasForm, musclePercent: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Calories/BMR</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="1450"
                      value={quickMeasForm.calories}
                      onChange={(e) => setQuickMeasForm({ ...quickMeasForm, calories: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Short Camp Remark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Advised low salt & morning hydration"
                    value={quickMeasForm.notes}
                    onChange={(e) => setQuickMeasForm({ ...quickMeasForm, notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Sticky Large Action Button (Section 23) */}
                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  SAVE MEASUREMENT & NEXT
                </button>
              </form>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION (Section 23: Ready for Next Customer) */}
            {checkInStep === 'CONFIRMATION' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-stone-900">Measurement Saved!</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Successfully associated with {selectedCamp.name} and customer profile.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    onClick={handleNextCustomer}
                    className="w-full py-3.5 bg-stone-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-sm transition-all"
                  >
                    READY FOR NEXT CUSTOMER →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* REGULAR CAMP DIRECTORY & STATS VIEW */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <MapPin className="w-6 h-6 text-emerald-600" />
                Community Health Camps
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Plan, organize, and execute mobile biometric screening camps across Warangal and surrounding areas.
              </p>
            </div>

            <button
              onClick={() => setShowCreateCampModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Create Camp
            </button>
          </div>

          {/* Camps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {camps.map((camp: CampRecord) => {
              const participants = customers.filter((c: CustomerRecord) => camp.participantIds.includes(c.id));
              const campMeasCount = measurements.filter((m: MeasurementRecord) => m.campId === camp.id).length;

              return (
                <div
                  key={camp.id}
                  className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-serif font-bold text-lg text-stone-900">{camp.name}</h3>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                          camp.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : camp.status === 'PLANNED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 mb-4 line-clamp-2">{camp.description}</p>

                    <div className="space-y-2 text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200/60 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-medium text-stone-800">{camp.date}</span>
                        <span>({camp.startTime} - {camp.endTime})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{camp.locationName}, {camp.address}</span>
                      </div>
                    </div>

                    {/* Participant Stats */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4">
                      <div className="bg-stone-50 p-2 rounded-lg border border-stone-200/50">
                        <span className="text-stone-400 block">Participants</span>
                        <span className="font-bold text-stone-900 text-sm">{participants.length}</span>
                      </div>
                      <div className="bg-stone-50 p-2 rounded-lg border border-stone-200/50">
                        <span className="text-stone-400 block">Scans Completed</span>
                        <span className="font-bold text-emerald-700 text-sm">{campMeasCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Camp Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => {
                        setSelectedCampId(camp.id);
                        setIsCampCheckInMode(true);
                        setCheckInStep('SEARCH_OR_NEW');
                      }}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Open Camp Mode (Check-in)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CREATE CAMP MODAL (Section 20) */}
      {showCreateCampModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                Schedule New Camp
              </h3>
              <button
                onClick={() => setShowCreateCampModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCamp} className="mt-4 space-y-4">
              {campError && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {campError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Camp Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kakatiya Colony Health Camp"
                  value={campForm.name}
                  onChange={(e) => setCampForm({ ...campForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={campForm.date}
                    onChange={(e) => setCampForm({ ...campForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={campForm.startTime}
                    onChange={(e) => setCampForm({ ...campForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={campForm.endTime}
                    onChange={(e) => setCampForm({ ...campForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Venue / Location Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kakatiya Community Hall"
                  value={campForm.locationName}
                  onChange={(e) => setCampForm({ ...campForm, locationName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Near Musical Garden, Warangal"
                  value={campForm.address}
                  onChange={(e) => setCampForm({ ...campForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description & Purpose</label>
                <textarea
                  rows={2}
                  placeholder="Details on target audience, screening equipment..."
                  value={campForm.description}
                  onChange={(e) => setCampForm({ ...campForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateCampModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Create Camp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
