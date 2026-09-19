export * from './database';

export interface UserSession {
  id: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  fullName: string;
  mobile?: string;
  profilePhotoUrl?: string;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  ownerMobile: string;
  upiId: string;
  email: string;
  address: string;
  operatingHours: string;
}

export interface BMICalculationResult {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity Class I' | 'Obesity Class II' | 'Obesity Class III';
  healthyWeightRange: {
    minKg: number;
    maxKg: number;
  };
}

export interface DashboardMetric {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
}
