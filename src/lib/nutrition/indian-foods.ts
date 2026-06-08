export type IndianFood = {
  id: string;
  name: string;
  aliases: string[];
  servingLabel: string;
  caloriesPerServing: number;
  proteinPerServing: number;
};

export const INDIAN_FOODS: IndianFood[] = [
  { id: "chawal-boiled", name: "Chawal (Boiled Rice)", aliases: ["chawal", "rice", "boiled rice", "white rice", "steamed rice"], servingLabel: "1 katori", caloriesPerServing: 170, proteinPerServing: 3.5 },
  { id: "chawal-fried", name: "Chawal Fry / Fried Rice", aliases: ["fried rice", "chawal fry", "veg fried rice"], servingLabel: "1 plate", caloriesPerServing: 280, proteinPerServing: 6 },
  { id: "roti", name: "Roti / Chapati", aliases: ["roti", "chapati", "phulka", "tawa roti"], servingLabel: "1 piece", caloriesPerServing: 80, proteinPerServing: 3 },
  { id: "paratha-plain", name: "Plain Paratha", aliases: ["paratha", "plain paratha"], servingLabel: "1 piece", caloriesPerServing: 180, proteinPerServing: 4 },
  { id: "paratha-aloo", name: "Aloo Paratha", aliases: ["aloo paratha", "potato paratha"], servingLabel: "1 piece", caloriesPerServing: 260, proteinPerServing: 6 },
  { id: "naan", name: "Naan", aliases: ["naan", "butter naan"], servingLabel: "1 piece", caloriesPerServing: 260, proteinPerServing: 8 },
  { id: "puri", name: "Puri", aliases: ["puri", "poori"], servingLabel: "2 pieces", caloriesPerServing: 200, proteinPerServing: 4 },
  { id: "idli", name: "Idli", aliases: ["idli", "idly"], servingLabel: "2 pieces", caloriesPerServing: 100, proteinPerServing: 4 },
  { id: "dosa-plain", name: "Plain Dosa", aliases: ["dosa", "plain dosa", "sada dosa"], servingLabel: "1 medium", caloriesPerServing: 120, proteinPerServing: 3 },
  { id: "dosa-masala", name: "Masala Dosa", aliases: ["masala dosa"], servingLabel: "1 piece", caloriesPerServing: 250, proteinPerServing: 6 },
  { id: "upma", name: "Upma", aliases: ["upma", "uppma"], servingLabel: "1 plate", caloriesPerServing: 220, proteinPerServing: 5 },
  { id: "poha", name: "Poha", aliases: ["poha", "pohe", "chivda poha"], servingLabel: "1 plate", caloriesPerServing: 200, proteinPerServing: 4 },
  { id: "dal-yellow", name: "Dal (Yellow / Arhar)", aliases: ["dal", "daal", "arhar dal", "toor dal", "yellow dal"], servingLabel: "1 katori", caloriesPerServing: 120, proteinPerServing: 7 },
  { id: "dal-moong", name: "Moong Dal", aliases: ["moong dal", "moong daal", "green dal"], servingLabel: "1 katori", caloriesPerServing: 105, proteinPerServing: 8 },
  { id: "dal-masoor", name: "Masoor Dal", aliases: ["masoor dal", "red dal"], servingLabel: "1 katori", caloriesPerServing: 115, proteinPerServing: 8 },
  { id: "rajma", name: "Rajma", aliases: ["rajma", "kidney beans", "rajma curry"], servingLabel: "1 katori", caloriesPerServing: 140, proteinPerServing: 9 },
  { id: "chole", name: "Chole / Chana Masala", aliases: ["chole", "chana", "chana masala", "chickpea"], servingLabel: "1 katori", caloriesPerServing: 180, proteinPerServing: 8 },
  { id: "paneer-curry", name: "Paneer Curry", aliases: ["paneer", "paneer sabzi", "paneer curry", "paneer masala"], servingLabel: "1 katori", caloriesPerServing: 260, proteinPerServing: 14 },
  { id: "paneer-raw", name: "Paneer (Raw)", aliases: ["raw paneer", "paneer cube"], servingLabel: "100g", caloriesPerServing: 265, proteinPerServing: 18 },
  { id: "palak-paneer", name: "Palak Paneer", aliases: ["palak paneer", "saag paneer"], servingLabel: "1 katori", caloriesPerServing: 220, proteinPerServing: 12 },
  { id: "matar-paneer", name: "Matar Paneer", aliases: ["matar paneer", "mutter paneer"], servingLabel: "1 katori", caloriesPerServing: 240, proteinPerServing: 13 },
  { id: "aloo-gobi", name: "Aloo Gobi", aliases: ["aloo gobi", "potato cauliflower"], servingLabel: "1 katori", caloriesPerServing: 150, proteinPerServing: 4 },
  { id: "aloo-matar", name: "Aloo Matar", aliases: ["aloo matar", "aloo mutter"], servingLabel: "1 katori", caloriesPerServing: 160, proteinPerServing: 5 },
  { id: "baigan-bharta", name: "Baigan Bharta", aliases: ["baigan bharta", "baingan bharta", "eggplant"], servingLabel: "1 katori", caloriesPerServing: 120, proteinPerServing: 3 },
  { id: "bhindi", name: "Bhindi Sabzi", aliases: ["bhindi", "okra", "lady finger"], servingLabel: "1 katori", caloriesPerServing: 90, proteinPerServing: 3 },
  { id: "mix-veg", name: "Mix Veg", aliases: ["mix veg", "mixed vegetable", "sabzi"], servingLabel: "1 katori", caloriesPerServing: 130, proteinPerServing: 4 },
  { id: "sambar", name: "Sambar", aliases: ["sambar", "sambhar"], servingLabel: "1 katori", caloriesPerServing: 100, proteinPerServing: 5 },
  { id: "rasam", name: "Rasam", aliases: ["rasam"], servingLabel: "1 bowl", caloriesPerServing: 50, proteinPerServing: 2 },
  { id: "biryani-veg", name: "Veg Biryani", aliases: ["veg biryani", "vegetable biryani", "biryani"], servingLabel: "1 plate", caloriesPerServing: 350, proteinPerServing: 8 },
  { id: "biryani-chicken", name: "Chicken Biryani", aliases: ["chicken biryani", "murgh biryani"], servingLabel: "1 plate", caloriesPerServing: 450, proteinPerServing: 22 },
  { id: "khichdi", name: "Khichdi", aliases: ["khichdi", "khichri", "dal khichdi"], servingLabel: "1 plate", caloriesPerServing: 220, proteinPerServing: 8 },
  { id: "egg-boiled", name: "Anda (Boiled Egg)", aliases: ["anda", "egg", "boiled egg", "egg boiled"], servingLabel: "1 piece", caloriesPerServing: 78, proteinPerServing: 6 },
  { id: "egg-omelette", name: "Egg Omelette", aliases: ["omelette", "omelet", "egg omelette", "anda omelette"], servingLabel: "2 eggs", caloriesPerServing: 180, proteinPerServing: 12 },
  { id: "egg-bhurji", name: "Egg Bhurji", aliases: ["egg bhurji", "anda bhurji", "scrambled egg"], servingLabel: "2 eggs", caloriesPerServing: 200, proteinPerServing: 13 },
  { id: "chicken-curry", name: "Chicken Curry", aliases: ["chicken curry", "chicken", "murgh curry", "chicken sabzi"], servingLabel: "1 katori", caloriesPerServing: 220, proteinPerServing: 24 },
  { id: "chicken-grilled", name: "Grilled Chicken", aliases: ["grilled chicken", "chicken breast", "tandoori chicken"], servingLabel: "100g", caloriesPerServing: 165, proteinPerServing: 31 },
  { id: "fish-curry", name: "Fish Curry", aliases: ["fish curry", "machli", "machhi"], servingLabel: "1 katori", caloriesPerServing: 180, proteinPerServing: 20 },
  { id: "mutton-curry", name: "Mutton Curry", aliases: ["mutton", "mutton curry", "gosht"], servingLabel: "1 katori", caloriesPerServing: 280, proteinPerServing: 22 },
  { id: "soya-chunks", name: "Soya Chunks", aliases: ["soya", "soya chunks", "nutrela"], servingLabel: "1 katori", caloriesPerServing: 120, proteinPerServing: 15 },
  { id: "tofu", name: "Tofu", aliases: ["tofu"], servingLabel: "100g", caloriesPerServing: 76, proteinPerServing: 8 },
  { id: "dahi", name: "Dahi / Curd", aliases: ["dahi", "curd", "yogurt", "plain curd"], servingLabel: "1 katori", caloriesPerServing: 100, proteinPerServing: 6 },
  { id: "lassi", name: "Lassi", aliases: ["lassi", "sweet lassi", "namkeen lassi"], servingLabel: "1 glass", caloriesPerServing: 180, proteinPerServing: 6 },
  { id: "milk-full", name: "Doodh (Full Cream)", aliases: ["doodh", "milk", "full cream milk"], servingLabel: "1 glass", caloriesPerServing: 150, proteinPerServing: 8 },
  { id: "milk-toned", name: "Doodh (Toned)", aliases: ["toned milk", "low fat milk"], servingLabel: "1 glass", caloriesPerServing: 90, proteinPerServing: 6 },
  { id: "buttermilk", name: "Chaas / Buttermilk", aliases: ["chaas", "buttermilk", "mattha"], servingLabel: "1 glass", caloriesPerServing: 40, proteinPerServing: 3 },
  { id: "peanut", name: "Moongfali / Peanut", aliases: ["peanut", "peanuts", "moongfali", "mungfali", "groundnut"], servingLabel: "30g (handful)", caloriesPerServing: 170, proteinPerServing: 8 },
  { id: "kaju", name: "Kaju / Cashew", aliases: ["kaju", "cashew", "cashews"], servingLabel: "30g (handful)", caloriesPerServing: 175, proteinPerServing: 5 },
  { id: "badam", name: "Badam / Almond", aliases: ["badam", "almond", "almonds"], servingLabel: "30g (10 pcs)", caloriesPerServing: 170, proteinPerServing: 6 },
  { id: "pista", name: "Pista / Pistachio", aliases: ["pista", "pistachio"], servingLabel: "30g", caloriesPerServing: 160, proteinPerServing: 6 },
  { id: "walnut", name: "Akhrot / Walnut", aliases: ["akhrot", "walnut"], servingLabel: "30g", caloriesPerServing: 195, proteinPerServing: 5 },
  { id: "dates", name: "Khajoor / Dates", aliases: ["khajoor", "dates", "date"], servingLabel: "4 pieces", caloriesPerServing: 90, proteinPerServing: 1 },
  { id: "banana", name: "Kela / Banana", aliases: ["kela", "banana"], servingLabel: "1 medium", caloriesPerServing: 105, proteinPerServing: 1 },
  { id: "apple", name: "Seb / Apple", aliases: ["seb", "apple"], servingLabel: "1 medium", caloriesPerServing: 95, proteinPerServing: 0.5 },
  { id: "mango", name: "Aam / Mango", aliases: ["aam", "mango"], servingLabel: "1 cup", caloriesPerServing: 100, proteinPerServing: 1 },
  { id: "papaya", name: "Papita / Papaya", aliases: ["papita", "papaya"], servingLabel: "1 cup", caloriesPerServing: 55, proteinPerServing: 1 },
  { id: "orange", name: "Santra / Orange", aliases: ["santra", "orange"], servingLabel: "1 medium", caloriesPerServing: 62, proteinPerServing: 1 },
  { id: "grapes", name: "Angoor / Grapes", aliases: ["angoor", "grapes"], servingLabel: "1 cup", caloriesPerServing: 104, proteinPerServing: 1 },
  { id: "watermelon", name: "Tarbooz / Watermelon", aliases: ["tarbooz", "watermelon"], servingLabel: "1 cup", caloriesPerServing: 46, proteinPerServing: 1 },
  { id: "potato-boiled", name: "Aloo (Boiled)", aliases: ["aloo", "potato", "boiled potato"], servingLabel: "1 medium", caloriesPerServing: 110, proteinPerServing: 2 },
  { id: "sweet-potato", name: "Shakarkandi", aliases: ["shakarkandi", "sweet potato"], servingLabel: "1 medium", caloriesPerServing: 112, proteinPerServing: 2 },
  { id: "oats", name: "Oats", aliases: ["oats", "oatmeal", "dalia oats"], servingLabel: "1 bowl cooked", caloriesPerServing: 150, proteinPerServing: 5 },
  { id: "cornflakes", name: "Cornflakes", aliases: ["cornflakes", "cereal"], servingLabel: "1 bowl with milk", caloriesPerServing: 200, proteinPerServing: 6 },
  { id: "bread-white", name: "Bread (White)", aliases: ["bread", "white bread", "double roti"], servingLabel: "2 slices", caloriesPerServing: 140, proteinPerServing: 5 },
  { id: "bread-brown", name: "Brown Bread", aliases: ["brown bread", "whole wheat bread"], servingLabel: "2 slices", caloriesPerServing: 130, proteinPerServing: 6 },
  { id: "sandwich-veg", name: "Veg Sandwich", aliases: ["veg sandwich", "sandwich"], servingLabel: "1 piece", caloriesPerServing: 250, proteinPerServing: 8 },
  { id: "pav-bhaji", name: "Pav Bhaji", aliases: ["pav bhaji"], servingLabel: "1 plate", caloriesPerServing: 400, proteinPerServing: 10 },
  { id: "samosa", name: "Samosa", aliases: ["samosa"], servingLabel: "1 piece", caloriesPerServing: 260, proteinPerServing: 4 },
  { id: "pakora", name: "Pakora", aliases: ["pakora", "pakoda", "bhajiya"], servingLabel: "4 pieces", caloriesPerServing: 200, proteinPerServing: 5 },
  { id: "vada-pav", name: "Vada Pav", aliases: ["vada pav"], servingLabel: "1 piece", caloriesPerServing: 290, proteinPerServing: 6 },
  { id: "chole-bhature", name: "Chole Bhature", aliases: ["chole bhature", "bhatura"], servingLabel: "1 plate", caloriesPerServing: 450, proteinPerServing: 12 },
  { id: "maggi", name: "Maggi / Instant Noodles", aliases: ["maggi", "noodles", "instant noodles"], servingLabel: "1 pack", caloriesPerServing: 380, proteinPerServing: 8 },
  { id: "pasta", name: "Pasta", aliases: ["pasta", "macaroni"], servingLabel: "1 plate", caloriesPerServing: 300, proteinPerServing: 10 },
  { id: "pizza-slice", name: "Pizza Slice", aliases: ["pizza", "pizza slice"], servingLabel: "1 slice", caloriesPerServing: 285, proteinPerServing: 12 },
  { id: "burger", name: "Burger", aliases: ["burger", "veg burger", "chicken burger"], servingLabel: "1 piece", caloriesPerServing: 350, proteinPerServing: 15 },
  { id: "fried-chicken", name: "Fried Chicken", aliases: ["fried chicken", "chicken fry"], servingLabel: "1 piece", caloriesPerServing: 250, proteinPerServing: 18 },
  { id: "tea-milk", name: "Chai (With Milk)", aliases: ["chai", "tea", "doodh wali chai"], servingLabel: "1 cup", caloriesPerServing: 50, proteinPerServing: 2 },
  { id: "coffee-milk", name: "Coffee (With Milk)", aliases: ["coffee", "cappuccino", "latte"], servingLabel: "1 cup", caloriesPerServing: 80, proteinPerServing: 3 },
  { id: "protein-shake", name: "Protein Shake", aliases: ["protein shake", "whey", "protein powder"], servingLabel: "1 scoop", caloriesPerServing: 120, proteinPerServing: 24 },
  { id: "ghee", name: "Ghee", aliases: ["ghee", "desi ghee"], servingLabel: "1 tbsp", caloriesPerServing: 112, proteinPerServing: 0 },
  { id: "butter", name: "Butter", aliases: ["butter", "makhan"], servingLabel: "1 tbsp", caloriesPerServing: 102, proteinPerServing: 0 },
  { id: "oil", name: "Cooking Oil", aliases: ["oil", "cooking oil", "mustard oil"], servingLabel: "1 tbsp", caloriesPerServing: 120, proteinPerServing: 0 },
  { id: "honey", name: "Shahad / Honey", aliases: ["honey", "shahad", "shahad"], servingLabel: "1 tbsp", caloriesPerServing: 64, proteinPerServing: 0 },
  { id: "jaggery", name: "Gur / Jaggery", aliases: ["gur", "jaggery"], servingLabel: "20g", caloriesPerServing: 60, proteinPerServing: 0 },
  { id: "sprouts", name: "Sprouts", aliases: ["sprouts", "moong sprouts", "ankurit"], servingLabel: "1 katori", caloriesPerServing: 80, proteinPerServing: 7 },
  { id: "salad-green", name: "Green Salad", aliases: ["salad", "green salad", "cucumber salad"], servingLabel: "1 bowl", caloriesPerServing: 35, proteinPerServing: 2 },
  { id: "raita", name: "Raita", aliases: ["raita", "cucumber raita", "boondi raita"], servingLabel: "1 katori", caloriesPerServing: 60, proteinPerServing: 3 },
  { id: "papad", name: "Papad", aliases: ["papad", "papadum"], servingLabel: "1 piece", caloriesPerServing: 60, proteinPerServing: 2 },
  { id: "pickle", name: "Achar / Pickle", aliases: ["achar", "pickle"], servingLabel: "1 tbsp", caloriesPerServing: 15, proteinPerServing: 0 },
  { id: "chutney", name: "Chutney", aliases: ["chutney", "mint chutney", "coriander chutney"], servingLabel: "2 tbsp", caloriesPerServing: 30, proteinPerServing: 0 },
  { id: "sweets-gulab-jamun", name: "Gulab Jamun", aliases: ["gulab jamun", "sweet", "mithai"], servingLabel: "2 pieces", caloriesPerServing: 300, proteinPerServing: 4 },
  { id: "sweets-rasgulla", name: "Rasgulla", aliases: ["rasgulla", "rasgulla sweet"], servingLabel: "2 pieces", caloriesPerServing: 186, proteinPerServing: 4 },
  { id: "ice-cream", name: "Ice Cream", aliases: ["ice cream", "kulfi"], servingLabel: "1 scoop", caloriesPerServing: 140, proteinPerServing: 2 },
  { id: "biscuit", name: "Biscuit", aliases: ["biscuit", "cookie", "parle g"], servingLabel: "4 pieces", caloriesPerServing: 160, proteinPerServing: 2 },
  { id: "namkeen", name: "Namkeen / Mixture", aliases: ["namkeen", "mixture", "bhujia", "sev"], servingLabel: "50g", caloriesPerServing: 260, proteinPerServing: 6 },
  { id: "chips", name: "Chips", aliases: ["chips", "potato chips", "lays"], servingLabel: "1 small pack", caloriesPerServing: 150, proteinPerServing: 2 },
  { id: "coconut-water", name: "Nariyal Pani", aliases: ["nariyal pani", "coconut water"], servingLabel: "1 glass", caloriesPerServing: 46, proteinPerServing: 2 },
  { id: "juice-pack", name: "Packed Juice", aliases: ["juice", "fruit juice", "real juice"], servingLabel: "1 glass", caloriesPerServing: 110, proteinPerServing: 1 },
  { id: "soft-drink", name: "Cold Drink", aliases: ["cold drink", "coke", "pepsi", "soft drink"], servingLabel: "300ml", caloriesPerServing: 140, proteinPerServing: 0 },
  { id: "sattu", name: "Sattu Drink", aliases: ["sattu", "sattu drink"], servingLabel: "1 glass", caloriesPerServing: 120, proteinPerServing: 7 },
  { id: "chana-roasted", name: "Roasted Chana", aliases: ["roasted chana", "bhuna chana", "chana"], servingLabel: "50g", caloriesPerServing: 180, proteinPerServing: 10 },
  { id: "makhana", name: "Makhana / Fox Nuts", aliases: ["makhana", "fox nuts", "lotus seeds"], servingLabel: "30g", caloriesPerServing: 105, proteinPerServing: 4 },
  { id: "soya-milk", name: "Soya Milk", aliases: ["soya milk", "soy milk"], servingLabel: "1 glass", caloriesPerServing: 80, proteinPerServing: 7 },
  { id: "cheese", name: "Cheese", aliases: ["cheese", "processed cheese"], servingLabel: "2 slices", caloriesPerServing: 140, proteinPerServing: 8 },
  { id: "paneer-tikka", name: "Paneer Tikka", aliases: ["paneer tikka"], servingLabel: "6 pieces", caloriesPerServing: 270, proteinPerServing: 18 },
  { id: "tandoori-roti", name: "Tandoori Roti", aliases: ["tandoori roti"], servingLabel: "1 piece", caloriesPerServing: 100, proteinPerServing: 3 },
  { id: "missi-roti", name: "Missi Roti", aliases: ["missi roti"], servingLabel: "1 piece", caloriesPerServing: 120, proteinPerServing: 5 },
  { id: "thepla", name: "Thepla", aliases: ["thepla", "methi thepla"], servingLabel: "2 pieces", caloriesPerServing: 180, proteinPerServing: 5 },
  { id: "dhokla", name: "Dhokla", aliases: ["dhokla"], servingLabel: "4 pieces", caloriesPerServing: 160, proteinPerServing: 6 },
  { id: "khandvi", name: "Khandvi", aliases: ["khandvi"], servingLabel: "6 rolls", caloriesPerServing: 130, proteinPerServing: 5 },
  { id: "uttapam", name: "Uttapam", aliases: ["uttapam"], servingLabel: "1 piece", caloriesPerServing: 200, proteinPerServing: 6 },
  { id: "appam", name: "Appam", aliases: ["appam"], servingLabel: "2 pieces", caloriesPerServing: 160, proteinPerServing: 4 },
  { id: "puttu", name: "Puttu", aliases: ["puttu"], servingLabel: "1 serving", caloriesPerServing: 180, proteinPerServing: 4 },
  { id: "fish-fry", name: "Fish Fry", aliases: ["fish fry"], servingLabel: "1 piece", caloriesPerServing: 220, proteinPerServing: 18 },
  { id: "prawn-curry", name: "Prawn Curry", aliases: ["prawn", "prawn curry", "jhinga"], servingLabel: "1 katori", caloriesPerServing: 160, proteinPerServing: 18 },
  { id: "keema", name: "Keema", aliases: ["keema", "minced meat"], servingLabel: "1 katori", caloriesPerServing: 260, proteinPerServing: 20 },
  { id: "kabab-chicken", name: "Chicken Kabab", aliases: ["chicken kabab", "seekh kabab", "kabab"], servingLabel: "2 pieces", caloriesPerServing: 200, proteinPerServing: 16 },
  { id: "soya-chap", name: "Soya Chap", aliases: ["soya chap", "soya chaap"], servingLabel: "2 pieces", caloriesPerServing: 180, proteinPerServing: 14 },
];

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function searchFoods(query: string, limit = 8): IndianFood[] {
  const normalized = normalizeSearch(query);
  if (!normalized) {
    return [];
  }

  const scored = INDIAN_FOODS.map((food) => {
    const name = normalizeSearch(food.name);
    const aliases = food.aliases.map(normalizeSearch);

    if (name === normalized || aliases.includes(normalized)) {
      return { food, score: 100 };
    }
    if (name.startsWith(normalized) || aliases.some((alias) => alias.startsWith(normalized))) {
      return { food, score: 80 };
    }
    if (name.includes(normalized) || aliases.some((alias) => alias.includes(normalized))) {
      return { food, score: 60 };
    }
    return null;
  }).filter((entry): entry is { food: IndianFood; score: number } => entry !== null);

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.food);
}

export function getFoodById(id: string): IndianFood | undefined {
  return INDIAN_FOODS.find((food) => food.id === id);
}

export function getFoodNutrition(food: IndianFood, servings: number) {
  return {
    calories: Math.round(food.caloriesPerServing * servings),
    protein: Math.round(food.proteinPerServing * servings * 10) / 10,
  };
}
