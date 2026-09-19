import React, { useState } from 'react';
import { usePlatformState } from '../../lib/platform-state';
import { Card, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Building2,
  Phone,
  QrCode,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const BusinessSettingsView: React.FC = () => {
  const { businessSettings, updateBusinessSettings } = usePlatformState();

  const [formData, setFormData] = useState({
    businessName: businessSettings.businessName,
    ownerName: businessSettings.ownerName,
    phone: businessSettings.phone,
    email: businessSettings.email,
    upiId: businessSettings.upiId,
    address: businessSettings.address,
    city: businessSettings.city,
    state: businessSettings.state,
    postalCode: businessSettings.postalCode,
    latitude: businessSettings.latitude.toString(),
    longitude: businessSettings.longitude.toString(),
    operatingHours: businessSettings.operatingHours,
    freeShippingThreshold: businessSettings.freeShippingThreshold.toString(),
    standardShippingFee: businessSettings.standardShippingFee.toString(),
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessSettings({
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      phone: formData.phone,
      email: formData.email,
      upiId: formData.upiId,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      latitude: parseFloat(formData.latitude) || 17.9784,
      longitude: parseFloat(formData.longitude) || 79.5941,
      operatingHours: formData.operatingHours,
      freeShippingThreshold: parseFloat(formData.freeShippingThreshold) || 1500,
      standardShippingFee: parseFloat(formData.standardShippingFee) || 99,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Centre & Business Configuration</h2>
          <p className="text-xs text-stone-500">
            Official operational parameters, UPI collection accounts, and Google Maps coordinates
          </p>
        </div>

        {saved && (
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Settings Persisted
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Profile */}
        <Card className="p-6 space-y-4 bg-white border-stone-200 shadow-xs">
          <CardHeader
            title="Business Entity & Ownership"
            subtitle="Verified details published on invoices and receipts"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Input
              label="Centre / Business Name *"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
            />
            <Input
              label="Founder & Director Name *"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              required
            />
            <Input
              label="Direct Business Phone *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Contact Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </Card>

        {/* UPI & Payment Settings */}
        <Card className="p-6 space-y-4 bg-white border-stone-200 shadow-xs">
          <CardHeader
            title="UPI Collections & E-Commerce Delivery"
            subtitle="Parameters for instant payment and courier calculations"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <Input
              label="Official Verified UPI ID *"
              value={formData.upiId}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              placeholder="7660990052-2@ybl"
              required
            />
            <Input
              label="Free Courier Threshold (₹) *"
              type="number"
              value={formData.freeShippingThreshold}
              onChange={(e) => setFormData({ ...formData, freeShippingThreshold: e.target.value })}
              required
            />
            <Input
              label="Standard Shipping Fee (₹) *"
              type="number"
              value={formData.standardShippingFee}
              onChange={(e) => setFormData({ ...formData, standardShippingFee: e.target.value })}
              required
            />
          </div>
        </Card>

        {/* Physical Centre & Google Maps */}
        <Card className="p-6 space-y-4 bg-white border-stone-200 shadow-xs">
          <CardHeader
            title="Warangal Centre Location & Maps Geolocation"
            subtitle="Coordinates used for embedded Google Maps navigation"
          />

          <div className="space-y-4 text-xs">
            <Input
              label="Street / Commercial Address *"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="City *"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <Input
                label="State *"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
              <Input
                label="Postal PIN Code *"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude (Google Maps) *"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="17.9784"
                required
              />
              <Input
                label="Longitude (Google Maps) *"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="79.5941"
                required
              />
            </div>

            <Input
              label="Operating Timings Description *"
              value={formData.operatingHours}
              onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
              required
            />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-6 py-2.5 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Configuration Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
