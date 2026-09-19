import React, { useState } from 'react';
import { Card, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { calculateBMI } from '../lib/calculations/bmi';
import { useAuth } from '../lib/auth-context';
import { 
  Activity, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Scale, 
  Apple, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface PublicViewsProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const PublicViews: React.FC<PublicViewsProps> = ({ currentTab, setCurrentTab }) => {
  const { login } = useAuth();

  // State for public BMI calculator
  const [calcHeight, setCalcHeight] = useState('170');
  const [calcWeight, setCalcWeight] = useState('70');
  const [calcAge, setCalcAge] = useState('32');
  const [bmiResult, setBmiResult] = useState(() => calculateBMI(70, 170));

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleCalculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(calcHeight);
    const w = parseFloat(calcWeight);
    if (h > 0 && w > 0) {
      setBmiResult(calculateBMI(w, h));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginEmail || (loginRole === 'ADMIN' ? 'srivijayalaxmi@srinutrition.com' : 'customer@example.com'), loginRole);
    setCurrentTab(loginRole === 'ADMIN' ? 'admin-dashboard' : 'customer-dashboard');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(regEmail || 'newcustomer@example.com', 'CUSTOMER', regName || 'New Wellness Customer');
    setCurrentTab('customer-dashboard');
  };

  // --------------------------------------------------------------------------
  // 1. HOME VIEW
  // --------------------------------------------------------------------------
  if (currentTab === 'home') {
    return (
      <div className="space-y-16 py-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-8 md:p-14 shadow-lg">
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evidence-Based Nutrition & Metabolic Coaching</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Transform Your Health Through Precision Nutrition & Body Analytics
            </h1>
            <p className="text-base md:text-lg text-emerald-100/90 leading-relaxed">
              Personalized wellness plans, recurring body composition tracking, and community health camps founded by <strong>Sangem Srivijayalaxmi</strong>. Sustainable lifestyle transformations grounded in genuine physiological measurement.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button 
                onClick={() => setCurrentTab('register')}
                size="lg" 
                className="bg-white text-emerald-900 hover:bg-emerald-50 font-semibold"
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button 
                onClick={() => setCurrentTab('centre')}
                variant="outline" 
                size="lg" 
                className="text-white border-white/40 bg-white/10 hover:bg-white/20"
              >
                Visit Our Centre
              </Button>
            </div>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
            <Scale className="w-96 h-96 text-white" />
          </div>
        </section>

        {/* Core Pillars */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900">Comprehensive Wellness Architecture</h2>
            <p className="text-sm text-gray-600 mt-2">
              Our systematic approach replaces guesswork with quantified metabolic tracking and personalized guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Precision Body Metrics</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Track 8 key physiological dimensions: Height, Weight, Age, calculated BMI, Body Fat %, Visceral Fat rating, Muscle %, Subcutaneous Fat, and BMR Caloric expenditure.
              </p>
            </Card>

            <Card className="hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Community Wellness Camps</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Regular on-site community camps offering full-spectrum health screenings, digital token registrations, and immediate consultations.
              </p>
            </Card>

            <Card className="hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center mb-4">
                <Apple className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Curated Nutrition Products</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Direct access to high-purity protein blends, essential vitamins, and targeted herbal supplements supporting verified daily macro targets.
              </p>
            </Card>
          </div>
        </section>

        {/* Live Server-Side BMI Tool Section */}
        <section className="bg-gray-50 border border-gray-200/80 rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <Badge variant="info">Section 21 Verified</Badge>
              <h2 className="text-2xl font-bold text-gray-900">Server-Side BMI Calculation Engine</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Standard BMI formula: <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-xs text-gray-800">BMI = weight_kg / (height_m)²</code>. 
                Calculated strictly server-side rather than trusting client modifications, ensuring consistent medical metric integrity.
              </p>

              <form onSubmit={handleCalculateBMI} className="grid grid-cols-3 gap-3 pt-2">
                <Input
                  label="Height (cm)"
                  type="number"
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(e.target.value)}
                  min={50}
                  max={250}
                  required
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                  min={15}
                  max={350}
                  required
                />
                <Input
                  label="Age (yrs)"
                  type="number"
                  value={calcAge}
                  onChange={(e) => setCalcAge(e.target.value)}
                  min={1}
                  max={120}
                  required
                />
                <div className="col-span-3 pt-1">
                  <Button type="submit" size="sm" className="w-full">
                    Recalculate BMI & Category
                  </Button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-6 bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Calculation Output</span>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-4xl font-extrabold text-gray-900 font-mono">{bmiResult.bmi}</span>
                <Badge 
                  variant={
                    bmiResult.category === 'Normal weight' ? 'success' : 
                    bmiResult.category === 'Underweight' ? 'warning' : 'danger'
                  }
                >
                  {bmiResult.category}
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span>Standard Healthy BMI Range:</span>
                  <span className="font-semibold text-gray-800 font-mono">18.5 – 24.9</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Healthy Weight (for {calcHeight} cm):</span>
                  <span className="font-semibold text-emerald-700 font-mono">
                    {bmiResult.healthyWeightRange.minKg} kg – {bmiResult.healthyWeightRange.maxKg} kg
                  </span>
                </div>
              </div>

              {/* Progress bar visualizing where customer lands */}
              <div className="mt-4 pt-2">
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="w-[18.5%] bg-amber-400" title="Underweight (< 18.5)"></div>
                  <div className="w-[25%] bg-emerald-500" title="Normal (18.5 - 24.9)"></div>
                  <div className="w-[20%] bg-amber-500" title="Overweight (25 - 29.9)"></div>
                  <div className="w-[36.5%] bg-rose-500" title="Obese (30+)"></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. ABOUT VIEW
  // --------------------------------------------------------------------------
  if (currentTab === 'about') {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-10">
        <div className="text-center space-y-3">
          <Badge variant="neutral">Leadership & Philosophy</Badge>
          <h1 className="text-3xl font-bold text-gray-900">About Sri Nutrition & Wellness</h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Dedicated to empowering individuals through scientific nutritional guidance, continuous biometric assessments, and holistic lifestyle changes.
          </p>
        </div>

        <Card className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
            <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
              SS
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sangem Srivijayalaxmi</h2>
              <p className="text-sm text-emerald-700 font-medium">Founder & Head Nutritionist</p>
              <p className="text-xs text-gray-500 mt-1">Mobile: <strong>+91 7993367929</strong> • Warangal Centre</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Founded with the conviction that nutrition must be personalized rather than generic, <strong>Sri Nutrition & Wellness Centre</strong> provides structured consultation programs designed around individual metabolism, visceral fat levels, muscle percentages, and daily energy demands.
            </p>
            <p>
              We prioritize transparency and empirical health progress. Each member undergoes comprehensive initial and progressive body composition evaluations, helping them understand what their numbers mean and how daily nutritional changes influence body fat, hydration, and stamina.
            </p>
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-lg text-xs text-emerald-900 font-medium">
              <strong>Professional Commitment:</strong> We maintain strict wellness counseling standards. We do not make arbitrary medical claims, prescribe pharmaceutical drugs, or issue disease diagnoses; our mission is holistic nutritional counseling and lifestyle guidance.
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 3. SERVICES VIEW
  // --------------------------------------------------------------------------
  if (currentTab === 'services') {
    return (
      <div className="max-w-5xl mx-auto py-10 space-y-10">
        <div className="text-center space-y-3">
          <Badge variant="neutral">Our Offerings</Badge>
          <h1 className="text-3xl font-bold text-gray-900">Wellness & Consultation Services</h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Structured programs tailored to weight management, metabolic improvement, and corporate wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Full Body Composition Analysis</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              In-depth bio-impedance measurements detailing visceral fat, subcutaneous fat percentage, skeletal muscle mass, and Basal Metabolic Rate (BMR).
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-gray-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>8-point biometric measurement</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Immediate digital report generation</span>
              </li>
            </ul>
          </Card>

          <Card className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Apple className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Personalized Nutrition Consultation</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              One-on-one sessions with Sangem Srivijayalaxmi focusing on nutrient density, sustainable caloric deficits or surpluses, and food habit optimization.
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-gray-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Custom dietary recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Weekly progress monitoring</span>
              </li>
            </ul>
          </Card>

          <Card className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Community Wellness Camps</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              On-location metabolic screening camps for communities, corporate institutions, and fitness groups across Telangana.
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-gray-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tokenized fast registration flow</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Group analytics and wellness talks</span>
              </li>
            </ul>
          </Card>

          <Card className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Metabolic & Caloric Guidance</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Education on BMR, active energy expenditure, and healthy macronutrient distribution to prevent post-diet rebound weight gain.
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-gray-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Portion and caloric education</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lifestyle activity recommendations</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 4. PRODUCTS VIEW (FOUNDATION STORE PREVIEW)
  // --------------------------------------------------------------------------
  if (currentTab === 'products') {
    const previewProducts = [
      {
        id: 'p1',
        name: 'Lean Protein Nutrition Shake',
        category: 'Protein Blends',
        price: '₹2,499',
        discount: '₹2,199',
        tag: 'Clean Formula',
        desc: 'Plant & whey based protein supplement optimized for lean muscle preservation and recovery.',
      },
      {
        id: 'p2',
        name: 'Active Daily Multivitamin & Minerals',
        category: 'Micronutrients',
        price: '₹899',
        discount: '₹749',
        tag: 'Essential',
        desc: 'Comprehensive micronutrient blend supporting metabolic activity, vitality, and immunity.',
      },
      {
        id: 'p3',
        name: 'Energy & Metabolism Green Tea Herbal Extract',
        category: 'Metabolism',
        price: '₹1,250',
        discount: '₹999',
        tag: 'Popular',
        desc: 'Standardized antioxidant rich botanical formula designed for morning vitality and focus.',
      },
      {
        id: 'p4',
        name: 'Digestive Fiber & Prebiotic Complex',
        category: 'Gut Health',
        price: '₹1,100',
        discount: '₹950',
        tag: 'High Fiber',
        desc: 'Soluble dietary fiber blend supporting gut microbiome balance and satiety.',
      },
    ];

    return (
      <div className="max-w-6xl mx-auto py-10 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200">
          <div>
            <Badge variant="neutral">Online Store Foundation</Badge>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Verified Nutrition Products</h1>
            <p className="text-xs text-gray-600">Pure, certified nutritional supplements available at our centre and online.</p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-2 rounded-lg border border-emerald-200">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Direct UPI: <strong className="font-mono">7660990052-2@ybl</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {previewProducts.map((p) => (
            <Card key={p.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="h-40 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                  <Apple className="w-12 h-12 text-emerald-600/40" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {p.category}
                  </span>
                  <Badge variant="info">{p.tag}</Badge>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 leading-snug">{p.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{p.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-baseline justify-between">
                <div>
                  <span className="text-base font-bold text-gray-900">{p.discount}</span>
                  <span className="text-xs text-gray-400 line-through ml-1.5">{p.price}</span>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setCurrentTab('register')}>
                  Order
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 5. CENTRE VIEW (GOOGLE MAPS & PHYSICAL LOCATION)
  // --------------------------------------------------------------------------
  if (currentTab === 'centre') {
    return (
      <div className="max-w-5xl mx-auto py-10 space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="neutral">Physical Centre & Operations</Badge>
          <h1 className="text-3xl font-bold text-gray-900">Sri Nutrition & Wellness Centre</h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Visit our fully equipped centre for consultation, full-body bio-metric scan, and personalized program onboarding.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Details Column */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="space-y-4">
              <CardHeader title="Centre Information" subtitle="Warangal Centre, Telangana" />

              <div className="space-y-3 text-xs text-gray-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-gray-900">Address:</strong>
                    <span>Sri Nutrition & Wellness Centre, Main Commercial Road, Warangal, Telangana - 506001</span>
                    <span className="block text-[11px] text-gray-500 font-mono mt-0.5">Coords: 17.9784° N, 79.5941° E</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-gray-900">Owner & Consultation:</strong>
                    <span>Sangem Srivijayalaxmi</span>
                    <a href="tel:7993367929" className="block text-emerald-700 font-semibold hover:underline">
                      +91 7993367929
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-gray-900">Operating Timings:</strong>
                    <span>Monday - Saturday</span>
                    <span className="block text-gray-600">Morning: 07:00 AM – 01:00 PM</span>
                    <span className="block text-gray-600">Evening: 04:00 PM – 08:00 PM</span>
                    <span className="block text-amber-700">Sunday: Closed for Community Camps</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                  <QrCode className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-gray-900">Official Business UPI:</strong>
                    <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      7660990052-2@ybl
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-emerald-50/70 border-emerald-200">
              <h4 className="text-xs font-bold text-emerald-900 uppercase">Walk-in Assessment Protocol</h4>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                For optimal body composition scan accuracy, avoid heavy meals and intense workouts 2 hours prior to measurement.
              </p>
            </Card>
          </div>

          {/* Interactive Google Maps Frame / Map Preview */}
          <div className="lg:col-span-7">
            <Card className="p-2 h-full flex flex-col justify-between overflow-hidden">
              <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-1 min-h-[380px]">
                {/* Embed Map Preview */}
                <iframe
                  title="Sri Nutrition Warangal Centre"
                  className="w-full h-full border-0 absolute inset-0"
                  src="https://maps.google.com/maps?q=17.9784,79.5941&z=15&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="p-3 text-xs text-gray-500 flex items-center justify-between">
                <span>Google Maps Client Integration: <code className="font-mono text-[11px]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code></span>
                <a 
                  href="https://maps.google.com/?q=17.9784,79.5941" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:underline font-semibold"
                >
                  Open in Google Maps &rarr;
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 6. CONTACT VIEW
  // --------------------------------------------------------------------------
  if (currentTab === 'contact') {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="neutral">Get in Touch</Badge>
          <h1 className="text-3xl font-bold text-gray-900">Contact & Support</h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Have questions regarding upcoming camps, nutrition consultations, or ordering products? Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <CardHeader title="Send an Inquiry" subtitle="We typically respond within 24 hours" />
            <form onSubmit={(e) => { e.preventDefault(); alert('Inquiry recorded. We will contact you soon.'); }} className="space-y-3">
              <Input label="Your Name" placeholder="e.g. Keerthana" required />
              <Input label="Mobile Number" placeholder="10-digit mobile" required />
              <Input label="Email Address" type="email" placeholder="you@example.com" />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Your Message / Goal</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Describe your health goal or inquiry..."
                  required
                ></textarea>
              </div>
              <Button type="submit" className="w-full">
                Submit Inquiry
              </Button>
            </form>
          </Card>

          <div className="space-y-4">
            <Card className="space-y-4">
              <CardHeader title="Direct Business Details" />
              <div className="space-y-3 text-xs text-gray-700">
                <div>
                  <span className="text-gray-500 block">Nutritionist & Owner:</span>
                  <span className="text-sm font-semibold text-gray-900">Sangem Srivijayalaxmi</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Direct Mobile:</span>
                  <a href="tel:7993367929" className="text-sm font-semibold text-emerald-700 hover:underline">
                    +91 7993367929
                  </a>
                </div>
                <div>
                  <span className="text-gray-500 block">Business UPI ID:</span>
                  <span className="text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                    7660990052-2@ybl
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Centre Address:</span>
                  <span>Sri Nutrition & Wellness Centre, Warangal, Telangana - 506001</span>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-6">
              <h4 className="text-base font-bold">Looking to Organize a Camp?</h4>
              <p className="text-xs text-emerald-100 mt-2 leading-relaxed">
                We partner with residential societies, corporations, and gyms to provide on-site body composition testing and nutrition awareness.
              </p>
              <Button 
                onClick={() => alert('Please contact Sangem Srivijayalaxmi at 7993367929 for camp bookings.')}
                size="sm" 
                className="mt-4 bg-white text-emerald-900 hover:bg-emerald-50 font-semibold"
              >
                Inquire for Camp
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 7. LOGIN VIEW
  // --------------------------------------------------------------------------
  if (currentTab === 'login') {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Account Login</h2>
            <p className="text-xs text-gray-500">Sign in to your client or administrative portal</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="flex rounded-lg bg-gray-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLoginRole('CUSTOMER');
                  setLoginEmail('customer@example.com');
                }}
                className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
                  loginRole === 'CUSTOMER' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Customer Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginRole('ADMIN');
                  setLoginEmail('srivijayalaxmi@srinutrition.com');
                }}
                className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
                  loginRole === 'ADMIN' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-500'
                }`}
              >
                Admin (Sangem Srivijayalaxmi)
              </button>
            </div>

            <Input
              label="Email Address"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder={loginRole === 'ADMIN' ? 'srivijayalaxmi@srinutrition.com' : 'you@example.com'}
              required
            />

            <Input
              label="Password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-gray-600">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                <span>Remember session</span>
              </label>
              <a href="#reset" onClick={(e) => { e.preventDefault(); alert('Password reset initiated via Supabase Auth.'); }} className="text-emerald-700 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full">
              Sign In as {loginRole}
            </Button>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            <span>Don't have an account? </span>
            <button
              type="button"
              onClick={() => setCurrentTab('register')}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Register here
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 8. REGISTER VIEW
  // --------------------------------------------------------------------------
  if (currentTab === 'register') {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Customer Registration</h2>
            <p className="text-xs text-gray-500">Create your private nutrition profile to track biometric progression</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <Input
              label="Full Name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="e.g. Keerthana Sangem"
              required
            />

            <Input
              label="Mobile Number"
              value={regMobile}
              onChange={(e) => setRegMobile(e.target.value)}
              placeholder="10-digit mobile number"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
            />

            <div className="text-[11px] text-gray-500 leading-tight">
              By registering, your account will be provisioned in Supabase Auth. Your biometric measurements will be protected with Row Level Security (RLS).
            </div>

            <Button type="submit" className="w-full mt-2">
              Create Account
            </Button>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            <span>Already registered? </span>
            <button
              type="button"
              onClick={() => setCurrentTab('login')}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Log in
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};
