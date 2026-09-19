import { BMICalculationResult } from '@/types';

/**
 * Server-side BMI Calculation
 * Formula: BMI = weight_kg / (height_m * height_m)
 * Standard WHO classification
 */
export function calculateBMI(weightKg: number, heightCm: number): BMICalculationResult {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) {
    throw new Error('Invalid input: Height and weight must be positive numbers');
  }

  const heightM = heightCm / 100;
  const rawBMI = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBMI * 100) / 100;

  // Standard WHO categories
  let category: BMICalculationResult['category'] = 'Normal weight';
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi >= 18.5 && bmi < 25.0) {
    category = 'Normal weight';
  } else if (bmi >= 25.0 && bmi < 30.0) {
    category = 'Overweight';
  } else if (bmi >= 30.0 && bmi < 35.0) {
    category = 'Obesity Class I';
  } else if (bmi >= 35.0 && bmi < 40.0) {
    category = 'Obesity Class II';
  } else {
    category = 'Obesity Class III';
  }

  // Healthy weight reference range (BMI 18.5 - 24.9)
  const minHealthyKg = Math.round(18.5 * (heightM * heightM) * 10) / 10;
  const maxHealthyKg = Math.round(24.9 * (heightM * heightM) * 10) / 10;

  return {
    bmi,
    category,
    healthyWeightRange: {
      minKg: minHealthyKg,
      maxKg: maxHealthyKg,
    },
  };
}
