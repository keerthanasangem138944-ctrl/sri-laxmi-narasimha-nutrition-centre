import React, { useState } from 'react';
import { usePlatformState } from '../../lib/platform-state';
import { 
  Building2, 
  Phone, 
  QrCode, 
  MapPin, 
  Truck, 
  Save, 
  CheckCircle2, 
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const BusinessSettingsManagement: React.FC = () => {
  const { businessSettings, updateBusinessSettings } = usePlatformState();

  const [ownerName, setOwnerName] = useState(businessSettings.ownerName);
  const [phone, setPhone] = useState(businessSettings.phone);
  const [email, setEmail] = useState(businessSettings.email);
  const [upiId, setUpiId] = useState(businessSettings.upiId);
  const [address, setAddress] = useState(businessSettings.address);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(businessSettings.freeShippingThreshold.toString());
  const [standardShippingFee, setStandardShippingFee] = useState(businessSettings.standardShippingFee.toString());
  const [razorpayKeyId, setRazorpayKeyId] = useState(businessSettings.razorpayKeyId || 'rzp_test_srinutrition');
  const [latitude, setLatitude] = useState(businessSettings.latitude.toString());
  const [longitude, setLongitude] = useState(businessSettings.longitude.toString());

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessSettings({
      ownerName,
      phone,
      email,
      upiId,
      address,
      freeShippingThreshold: parseFloat(freeShippingThreshold) || 1500,
      standardShippingFee: parseFloat(standardShippingFee) || 100,
      razorpayKeyId,
      latitude: parseFloat(latitude) || 17.9784,
      longitude: parseFloat(longitude) || 79.5941,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-stone-900">
            Centre Operations & Payment Configuration
          </h2>
          <p className="text-xs text-stone-500">
            Configure contact parameters, official UPI VPA, shipping thresholds, and Google Maps coordinates.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business & Contact Details */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>Identity & Communication</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Input
              label="Practitioner / Owner Name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
            <Input
              label="Contact & WhatsApp Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Official Administrative Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
            <Input
              label="Official Centre UPI ID (VPA)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Physical Centre Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              required
            />
          </div>
        </div>

        {/* Shipping & Commerce Parameters */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-700" />
            <span>Store Logistics & Shipping Calculation</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Input
              label="Free Shipping Cart Threshold (₹)"
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              required
            />
            <Input
              label="Standard Shipping Fee (₹)"
              type="number"
              value={standardShippingFee}
              onChange={(e) => setStandardShippingFee(e.target.value)}
              required
            />
            <Input
              label="Razorpay Public Key ID"
              value={razorpayKeyId}
              onChange={(e) => setRazorpayKeyId(e.target.value)}
              placeholder="rzp_live_... or rzp_test_..."
            />
          </div>
        </div>

        {/* Geolocation Coordinates */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Google Maps Coordinates (Warangal Flagship)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Input
              label="Centre Latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
            />
            <Input
              label="Centre Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" size="md" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Centre Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
