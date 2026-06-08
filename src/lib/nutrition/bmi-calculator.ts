export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type NutritionGoal = "lose" | "maintain" | "gain";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const PROTEIN_PER_KG: Record<NutritionGoal, number> = {
  lose: 2,
  maintain: 1.6,
  gain: 2.2,
};

const GOAL_CALORIE_ADJUSTMENT: Record<NutritionGoal, number> = {
  lose: -500,
  maintain: 0,
  gain: 500,
};

export type BmiResult = {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  maintenanceCalories: number;
  dailyCalories: number;
  dailyProtein: number;
};

export function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function calculateBmr(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export function calculateNutritionTargets(input: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
}): BmiResult {
  const bmi = calculateBmi(input.weightKg, input.heightCm);
  const bmr = calculateBmr(
    input.weightKg,
    input.heightCm,
    input.age,
    input.gender
  );
  const maintenanceCalories = Math.round(
    bmr * ACTIVITY_MULTIPLIERS[input.activityLevel]
  );
  const dailyCalories = Math.max(
    1200,
    maintenanceCalories + GOAL_CALORIE_ADJUSTMENT[input.goal]
  );
  const dailyProtein = Math.round(
    input.weightKg * PROTEIN_PER_KG[input.goal]
  );

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory: getBmiCategory(bmi),
    bmr: Math.round(bmr),
    maintenanceCalories,
    dailyCalories,
    dailyProtein,
  };
}

export const ACTIVITY_LEVEL_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary (desk job, no exercise)" },
  { value: "light", label: "Light (1-2 days/week)" },
  { value: "moderate", label: "Moderate (3-5 days/week)" },
  { value: "active", label: "Active (6-7 days/week)" },
  { value: "very_active", label: "Very Active (athlete / physical job)" },
];

export const GOAL_OPTIONS: { value: NutritionGoal; label: string }[] = [
  { value: "lose", label: "Weight Loss" },
  { value: "maintain", label: "Maintain Weight" },
  { value: "gain", label: "Muscle Gain" },
];
