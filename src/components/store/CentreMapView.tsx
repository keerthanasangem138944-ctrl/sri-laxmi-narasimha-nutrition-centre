import React, { useState } from 'react';
import { usePlatformState } from '../../lib/platform-state';
import { Card, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  MapPin,
  Phone,
  Clock,
  QrCode,
  Navigation,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  HeartPulse,
} from 'lucide-react';

export const CentreMapView: React.FC = () => {
  const { businessSettings } = usePlatformState();
  const [copiedUpi, setCopiedUpi] = useState(false);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(businessSettings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${businessSettings.latitude},${businessSettings.longitude}`;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <Badge variant="neutral">Physical Consultation Centre</Badge>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Sri Nutrition & Wellness Centre • Warangal
        </h1>
        <p className="text-xs text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Visit our flagship biometric wellness centre for personalized body composition scans, dietary planning, and supplement pickup under the guidance of certified nutritionist <strong>Sangem Srivijayalaxmi</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Centre Information */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-5 bg-white border-stone-200 shadow-xs">
            <CardHeader
              title="Centre Location & Details"
              subtitle="Warangal Headquarters, Telangana"
            />

            <div className="space-y-4 text-xs text-stone-700">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-stone-900 font-bold">Physical Address:</strong>
                  <span className="leading-relaxed block">
                    {businessSettings.address}, {businessSettings.city}, {businessSettings.state} - {businessSettings.postalCode}
                  </span>
                  <span className="text-[11px] text-stone-500 font-mono mt-0.5 block">
                    GPS Coordinates: {businessSettings.latitude}&deg; N, {businessSettings.longitude}&deg; E
                  </span>
                </div>
              </div>

              {/* Founder & Direct Phone */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-stone-900 font-bold">Director & Nutritionist:</strong>
                  <span className="block">{businessSettings.ownerName}</span>
                  <a
                    href={`tel:${businessSettings.phone}`}
                    className="text-emerald-700 font-semibold text-xs hover:underline block mt-0.5"
                  >
                    +91 {businessSettings.phone}
                  </a>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-stone-900 font-bold">Operating Hours:</strong>
                  <div className="space-y-1 mt-0.5 text-stone-600">
                    <p><strong>Monday – Saturday:</strong></p>
                    <p className="pl-2">• Morning: 07:00 AM – 01:00 PM</p>
                    <p className="pl-2">• Evening: 04:00 PM – 08:00 PM</p>
                    <p className="text-amber-800 font-medium">
                      <strong>Sunday:</strong> Closed for Community Health Camps
                    </p>
                  </div>
                </div>
              </div>

              {/* Business UPI */}
              <div className="flex items-start gap-3 pt-3 border-t border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <strong className="block text-stone-900 font-bold">Verified Centre UPI ID:</strong>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {businessSettings.upiId}
                    </span>
                    <button
                      onClick={handleCopyUpi}
                      className="text-stone-400 hover:text-emerald-700 text-xs font-semibold"
                    >
                      {copiedUpi ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    Account Holder: <strong>{businessSettings.ownerName}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Get Driving Directions in Google Maps
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </Card>

          {/* Assessment Protocol Notice */}
          <Card className="p-5 bg-emerald-50/70 border-emerald-200 space-y-2 text-xs text-emerald-900">
            <h4 className="font-bold flex items-center gap-1.5 text-emerald-950">
              <HeartPulse className="w-4 h-4 text-emerald-700" />
              Walk-in Scan Protocol
            </h4>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              For high-precision bio-impedance accuracy on our 8-point analyzer, we advise fasting for 2 hours before body scans and maintaining normal hydration.
            </p>
          </Card>
        </div>

        {/* Right Column: Embedded Google Maps Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="overflow-hidden border-stone-200 bg-white p-2 shadow-xs">
            <div className="relative w-full h-[450px] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
              {/* Google Maps Embed using exact Warangal coordinates */}
              <iframe
                title="Sri Nutrition & Wellness Centre Warangal Map"
                className="w-full h-full border-0 absolute inset-0"
                src={`https://maps.google.com/maps?q=${businessSettings.latitude},${businessSettings.longitude}&z=16&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="p-3 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span>Google Maps Location: <strong>Sri Nutrition & Wellness Centre</strong></span>
              </div>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
              >
                Open full screen in Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </Card>

          {/* Quick FAQ summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Card className="p-4 bg-stone-50 border-stone-200 space-y-1">
              <h5 className="font-bold text-stone-900">Visiting from outside Warangal?</h5>
              <p className="text-stone-600 text-[11px]">
                Located near Warangal railway and bus stations along Main Commercial Road with customer parking available.
              </p>
            </Card>
            <Card className="p-4 bg-stone-50 border-stone-200 space-y-1">
              <h5 className="font-bold text-stone-900">Want to host a Camp?</h5>
              <p className="text-stone-600 text-[11px]">
                We bring portable scanners and wellness tokens to housing communities and colleges across Telangana.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
