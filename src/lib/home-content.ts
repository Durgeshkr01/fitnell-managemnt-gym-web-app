export const APP_URL = "https://sg-fitness-evolutin-supaul-web-app.vercel.app/";

export const BG_IMAGES = {
  hero: "/images/hero-gym-bg.jpg",
  section1: "/images/section-gym-bg.jpg",
  section2: "/images/section-gym-bg-2.jpg",
} as const;

export const GYM_PHONE = "8809551534";
export const GYM_WHATSAPP = "918809551534";
export const GYM_ADDRESS =
  "Station Road, Near Central Bank of India, Prem Nagar, Supaul, Bihar 852131";
export const GYM_HOURS = "5–10 AM, 4–10 PM";
export const MAPS_LINK = "https://share.google/vSOLuqnbizuJN4sm3";
export const MAPS_EMBED =
  "https://www.google.com/maps?q=Station+Road+Supaul+Bihar&output=embed";

export const heroStats = [
  { value: "4.9+", label: "Google Rating" },
  { value: "500+", label: "Active Members" },
  { value: "5+", label: "Certified Trainers" },
];

export const facilities = [
  {
    icon: "❄️",
    title: "AC Gym",
    desc: "Fully air-conditioned training floor for year-round comfort.",
  },
  {
    icon: "🎯",
    title: "Personal Training",
    desc: "One-on-one coaching tailored to your fitness goals.",
  },
  {
    icon: "🥗",
    title: "Diet Guidance",
    desc: "Structured nutrition plans to accelerate your results.",
  },
  {
    icon: "🏋️",
    title: "Strength Training",
    desc: "Free weights, machines, and progressive overload programs.",
  },
  {
    icon: "🏃",
    title: "Cardio Zone",
    desc: "Treadmills, bikes, and HIIT stations for endurance.",
  },
  {
    icon: "🏆",
    title: "Certified Trainers",
    desc: "Experienced coaches guiding every rep and every meal.",
  },
];

export const branches = [
  {
    name: "SG Fitness Evolution — Supaul",
    address: GYM_ADDRESS,
    hours: GYM_HOURS,
    phone: GYM_PHONE,
    primary: true,
  },
];

export const journeyFeatures = [
  {
    title: "Fitness Tracking",
    desc: "Log workouts, attendance, and daily activity from your member portal.",
    icon: "📊",
  },
  {
    title: "Progress Reports",
    desc: "Track weight, strength gains, and consistency with trainer-reviewed reports.",
    icon: "📈",
  },
  {
    title: "Trainer Guidance",
    desc: "Get personalized coaching, form checks, and plan adjustments on demand.",
    icon: "💪",
  },
];

export const nutritionFeatures = [
  "Custom meal plans for weight loss & muscle gain",
  "Macro-balanced Indian diet options",
  "Pre & post workout nutrition guidance",
  "Weekly diet check-ins with trainers",
  "No crash diets — sustainable habits only",
];

export const workoutCategories = [
  { name: "Yoga", desc: "Flexibility, recovery & mindfulness", emoji: "🧘" },
  { name: "Boxing", desc: "Power, agility & cardio conditioning", emoji: "🥊" },
  { name: "Strength Training", desc: "Build muscle & increase power", emoji: "🏋️" },
  { name: "Cardio", desc: "Endurance, fat burn & heart health", emoji: "❤️‍🔥" },
  { name: "Weight Loss", desc: "Structured fat-loss programs", emoji: "⚖️" },
];

export const comparisonRows = [
  { feature: "AC Training Floor", sg: true, regular: false },
  { feature: "Personal Training", sg: true, regular: false },
  { feature: "Diet Guidance", sg: true, regular: false },
  { feature: "Member App Portal", sg: true, regular: false },
  { feature: "Progress Tracking", sg: true, regular: false },
  { feature: "Certified Trainers", sg: true, regular: true },
  { feature: "Flexible Timings", sg: true, regular: true },
];

export const howItWorks = [
  {
    step: "01",
    title: "Join",
    desc: "Pick your plan, complete registration, and get your member ID instantly.",
  },
  {
    step: "02",
    title: "Train",
    desc: "Work out with expert trainers, structured programs, and diet support.",
  },
  {
    step: "03",
    title: "Transform",
    desc: "Track progress, stay consistent, and achieve your fitness goals.",
  },
];

export const transformations = [
  {
    name: "Rahul K.",
    goal: "Weight Loss",
    result: "Lost 12 kg in 4 months",
    quote: "SG Fitness changed my routine completely. Trainers kept me accountable every week.",
  },
  {
    name: "Priya S.",
    goal: "Muscle Gain",
    result: "Gained 6 kg lean mass",
    quote: "The diet plan and strength program were perfectly tailored to my body type.",
  },
  {
    name: "Amit T.",
    goal: "General Fitness",
    result: "Improved stamina & energy",
    quote: "Best gym in Supaul. Clean AC facility and supportive community.",
  },
];

export const trainers = [
  {
    name: "Head Trainer",
    role: "Strength & Conditioning",
    cert: "Certified Fitness Coach",
    exp: "8+ years",
    image: "/images/gym-owner.jpg",
  },
  {
    name: "Diet Coach",
    role: "Nutrition Specialist",
    cert: "Sports Nutrition Certified",
    exp: "5+ years",
    image: "/images/durgesh.jpg",
  },
  {
    name: "Cardio Coach",
    role: "HIIT & Weight Loss",
    cert: "ACE Certified Trainer",
    exp: "6+ years",
    image: "/images/exercise-placeholder.svg",
  },
];

export const faqs = [
  {
    q: "What makes SG Fitness Evolution the best gym in Supaul?",
    a: "We offer a premium AC facility, certified trainers, personal training, diet guidance, and a member portal for tracking — all under one roof.",
  },
  {
    q: "What are the membership plans?",
    a: "Basic Monthly at ₹500 (gym access + locker) and Premium Monthly at ₹1000 (trainer guidance + trade meal). Contact us on WhatsApp for current offers.",
  },
  {
    q: "Do you offer personal training for weight loss?",
    a: "Yes. Our weight loss programs combine structured workouts, cardio, and personalized diet plans designed by certified trainers.",
  },
  {
    q: "Can I try the gym before joining?",
    a: "Absolutely. Fill the fitness assessment form or WhatsApp us to book a free trial session during opening hours.",
  },
  {
    q: "Is there a mobile app?",
    a: "Yes. Members can access their portal via our PWA — view membership, payments, attendance, and workout plans from any device.",
  },
  {
    q: "What are the gym timings?",
    a: `We are open ${GYM_HOURS} daily — morning and evening slots for your convenience.`,
  },
];

export const seoKeywords = [
  "Best Gym in Supaul",
  "Fitness Center in Supaul",
  "Personal Trainer in Supaul",
  "Weight Loss Gym in Supaul",
  "Muscle Gain Training in Supaul",
];
