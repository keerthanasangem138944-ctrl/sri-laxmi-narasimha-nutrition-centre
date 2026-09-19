import React from 'react';
import { usePlatformState } from '../lib/platform-state';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  QrCode, 
  Compass, 
  Navigation, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare,
  ExternalLink,
  Share2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader } from './ui/card';

export const CentreMapLocation: React.FC = () => {
  const { businessSettings } = usePlatformState();

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${businessSettings.latitude || 17.9784},${businessSettings.longitude || 79.5941}`;
  const whatsappUrl = `https://wa.me/917993367929?text=${encodeURIComponent(
    'Hello Sangem Srivijayalaxmi, I would like to schedule an in-person body composition scan and nutrition consultation at the Warangal Centre.'
  )}`;

  return (
    <div className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Warangal Flagship Wellness & Biometric Centre</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-white">
            Visit Sri Nutrition & Wellness Centre
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Located in the heart of Warangal, Telangana. Visit us for certified 8-point body composition scanning, personalized metabolic counseling, genuine dietary supplements, and community health camps.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-semibold shadow-xs transition-colors"
            >
              <Navigation className="w-4 h-4 text-emerald-700" />
              <span>Get Live Directions on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp (+91 7993367929)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Centre Info Cards */}
        <div className="lg:col-span-5 space-y-5">
          {/* Contact Card */}
          <Card className="space-y-4">
            <CardHeader
              title="Centre Location & Contact"
              subtitle="Operated by Sangem Srivijayalaxmi"
            />

            <div className="space-y-3.5 text-xs text-stone-700">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-stone-900">Physical Address:</strong>
                  <span>{businessSettings.address || 'Main Commercial Road, Warangal, Telangana - 506001'}</span>
                  <span className="block text-[11px] text-stone-500 font-mono mt-0.5">
                    Coordinates: {businessSettings.latitude || 17.9784}° N, {businessSettings.longitude || 79.5941}° E
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-stone-900">Mobile & Consultations:</strong>
                  <span>{businessSettings.ownerName}</span>
                  <a
                    href={`tel:${businessSettings.phone}`}
                    className="block text-emerald-800 font-bold hover:underline"
                  >
                    +91 {businessSettings.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-stone-900">Operating Schedule:</strong>
                  <div className="space-y-0.5 mt-0.5">
                    <span className="block text-stone-800 font-medium">Monday to Saturday:</span>
                    <span className="block text-stone-600">Morning Session: 07:00 AM – 01:00 PM</span>
                    <span className="block text-stone-600">Evening Session: 04:00 PM – 08:00 PM</span>
                    <span className="block text-emerald-700 font-semibold pt-0.5">
                      Sunday: Field Community Camps & Pre-booked Screenings
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-stone-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-stone-900">Official Centre UPI:</strong>
                  <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded inline-block text-xs">
                    {businessSettings.upiId}
                  </span>
                  <span className="block text-[11px] text-stone-500 mt-0.5">
                    Registered to Sangem Srivijayalaxmi
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Assessment Preparation Guidelines */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-2.5 text-xs text-emerald-950">
            <h4 className="font-serif font-bold text-sm text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Assessment Preparation Protocol</span>
            </h4>
            <ul className="space-y-1.5 text-stone-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>Avoid heavy carbohydrate meals 2 hours prior to your 8-point scan.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>Maintain normal hydration; avoid diuretics or high caffeine directly before testing.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>Wear light sportswear for accurate bio-impedance electrode contact.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Interactive Embedded Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col">
            {/* Map Frame */}
            <div className="relative w-full aspect-16/10 sm:aspect-16/9 bg-stone-100 min-h-[420px]">
              <iframe
                title="Sri Nutrition Warangal Centre Google Map"
                className="w-full h-full border-0 absolute inset-0"
                src="https://maps.google.com/maps?q=17.9784,79.5941&z=15&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Map Action Bar */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-stone-900 block">
                  Sri Nutrition & Wellness Centre
                </span>
                <span className="text-stone-500 font-mono text-[11px]">
                  Warangal, Telangana • Coords: 17.9784° N, 79.5941° E
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate Now</span>
                </a>
              </div>
            </div>
          </div>

          {/* Transportation cues */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
              <strong className="block text-stone-900 font-serif">Rail & Transit Access</strong>
              <p className="text-stone-600">
                Conveniently accessible from Warangal Junction Railway Station and Kazipet Junction via local auto-rickshaws and RTC city buses.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
              <strong className="block text-stone-900 font-serif">Parking & Landmark</strong>
              <p className="text-stone-600">
                Ample two-wheeler and four-wheeler parking available along the commercial boulevard. Located close to Kakatiya educational corridor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
