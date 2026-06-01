"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondToRecommendation = exports.rollbackMealPlanApply = exports.applyRecommendationToMealPlanDays = exports.generateRecommendationsByMealPlan = exports.markRecommendationViewed = exports.getRecommendations = exports.generateRecommendations = void 0;
const client_1 = require("@prisma/client");
const nutrition_service_1 = require("../services/nutrition.service");
const personalization_service_1 = require("../services/personalization.service");
const timezone_util_1 = require("../utils/timezone.util");
const prisma = new client_1.PrismaClient();
const loadFoodPlanningMeta = async (foodIds) => {
    if (!foodIds.length)
        return new Map();
    const rows = await prisma.$queryRaw `
    SELECT id, "mealTimeTags", "mealRoles", "goalTags", "cookingMethod", "portionType"
    FROM "food_items"
    WHERE id = ANY(${foodIds})
  `;
    return new Map(rows.map((row) => [row.id, row]));
};
const normalize = (value) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
const includesAny = (text, keywords) => keywords.some((keyword) => text.includes(keyword));
const toFoodText = (food) => normalize(`${food.name} ${food.category || ''} ${food.description || ''}`);
const HEALTHY_KEYWORDS = ['luoc', 'hap', 'nuong', 'salad', 'rau', 'canh', 'boiled', 'steamed', 'grilled'];
const VEGETABLE_KEYWORDS = ['rau', 'salad', 'cu', 'qua', 'vegetable', 'xanh'];
const UNHEALTHY_KEYWORDS = [
    'chien',
    'ran',
    'xao',
    'deep fry',
    'fried',
    'tra sua',
    'nuoc ngot',
    'ga ran',
    'xuc xich',
    'khoai tay chien',
    'kem',
    'do an nhanh',
    'fast food',
];
const WEIGHT_GAIN_SUPPORT_KEYWORDS = [
    'com',
    'com trang',
    'gao',
    'banh mi',
    'khoai',
    'oat',
    'yen mach',
    'bo',
    'trung',
    'sinh to',
    'fruit',
    'trai cay',
    'hoa qua',
];
const RICE_FRUIT_KEYWORDS = ['com trang', 'trai cay dia', 'dia trai cay', 'fruit plate', 'fruit platter'];
const STAPLE_KEYWORDS = [
    'com',
    'gao',
    'bun',
    'pho',
    'mien',
    'mi ',
    'my ',
    'banh mi',
    'bread',
    'khoai',
    'oat',
    'yen mach',
    'noodle',
    'rice',
];
const SIDE_STAPLE_KEYWORDS = ['com trang', 'white rice', 'gao lut', 'brown rice', 'khoai', 'potato', 'sweet potato', 'yen mach', 'oat'];
const SNACK_MEAL_KEYWORDS = ['an nhe', 'bua phu', 'snack', 'banh mi', 'sandwich', 'bread'];
const PROTEIN_KEYWORDS = [
    'ga',
    'uc ga',
    'bo',
    'thit',
    'ca',
    'tom',
    'muc',
    'trung',
    'dau hu',
    'tofu',
    'chicken',
    'beef',
    'pork',
    'fish',
    'shrimp',
    'egg',
];
const DESSERT_KEYWORDS = [
    'trang mieng',
    'trai cay',
    'hoa qua',
    'fruit',
    'chuoi',
    'tao',
    'cam',
    'xoai',
    'dua hau',
    'nho',
    'che',
    'yogurt',
    'sua chua',
    'dessert',
];
const DRINK_SOUP_KEYWORDS = [
    'do nuoc',
    'nuoc',
    'canh',
    'soup',
    'broth',
    'juice',
    'smoothie',
    'tra',
    'tea',
    'coffee',
    'cafe',
    'sinh to',
];
const GRILLED_KEYWORDS = ['nuong', 'grilled', 'bbq'];
const VEGETARIAN_KEYWORDS = ['chay', 'vegetarian', 'vegan', 'dau hu', 'tofu'];
const DRY_FOOD_KEYWORDS = ['do kho', 'mon kho', 'kho', 'rang', 'ap chao', 'dry'];
const FRUIT_DRINK_KEYWORDS = [
    'trai cay',
    'hoa qua',
    'fruit',
    'nuoc',
    'beverage',
    'drink',
    'juice',
    'smoothie',
    'tra',
    'tea',
    'coffee',
    'cafe',
    'sinh to',
];
const analyzeFood = (food) => {
    const text = toFoodText(food);
    const calories = Number(food.calories || 0);
    const protein = Number(food.protein || 0);
    const fat = Number(food.fat || 0);
    const carbs = Number(food.carbs || 0);
    const proteinDensity = calories > 0 ? protein / calories : 0;
    const fatRatioByCalories = calories > 0 ? (fat * 9) / calories : 0;
    const carbRatioByCalories = calories > 0 ? (carbs * 4) / calories : 0;
    const isHealthyStyle = includesAny(text, HEALTHY_KEYWORDS);
    const hasVegetable = includesAny(text, VEGETABLE_KEYWORDS);
    const isUnhealthyStyle = includesAny(text, UNHEALTHY_KEYWORDS);
    const supportsWeightGain = includesAny(text, WEIGHT_GAIN_SUPPORT_KEYWORDS);
    const isRiceOrFruit = includesAny(text, RICE_FRUIT_KEYWORDS);
    const isFruitOrDrink = includesAny(text, FRUIT_DRINK_KEYWORDS);
    return {
        calories,
        protein,
        fat,
        carbs,
        proteinDensity,
        fatRatioByCalories,
        carbRatioByCalories,
        isHealthyStyle,
        hasVegetable,
        isUnhealthyStyle,
        supportsWeightGain,
        isRiceOrFruit,
        isFruitOrDrink,
    };
};
const classifyFoodGroup = (food) => {
    if (food.mealRoles?.includes('STAPLE'))
        return 'STAPLE';
    if (food.mealRoles?.includes('DESSERT'))
        return 'DESSERT_FRUIT';
    if (food.mealRoles?.includes('DRINK') || food.mealRoles?.includes('SOUP'))
        return 'DRINK_SOUP';
    if (food.mealRoles?.includes('SIDE'))
        return 'VEGETABLE_HEALTHY';
    if (food.mealRoles?.includes('MAIN'))
        return food.isVegetarian || food.isVegan ? 'VEGETARIAN' : 'PROTEIN_MAIN';
    const text = toFoodText(food);
    const calories = Number(food.calories || 0);
    const protein = Number(food.protein || 0);
    if (includesAny(text, DRINK_SOUP_KEYWORDS))
        return 'DRINK_SOUP';
    if (includesAny(text, DESSERT_KEYWORDS) && protein < 10 && calories <= 280)
        return 'DESSERT_FRUIT';
    if (includesAny(text, STAPLE_KEYWORDS))
        return 'STAPLE';
    if (includesAny(text, VEGETABLE_KEYWORDS) || includesAny(text, HEALTHY_KEYWORDS))
        return 'VEGETABLE_HEALTHY';
    if (includesAny(text, GRILLED_KEYWORDS))
        return 'GRILLED';
    if (food.isVegetarian || food.isVegan || includesAny(text, VEGETARIAN_KEYWORDS))
        return 'VEGETARIAN';
    if (protein >= 12 || includesAny(text, PROTEIN_KEYWORDS))
        return 'PROTEIN_MAIN';
    if (includesAny(text, DRY_FOOD_KEYWORDS))
        return 'DRY_FOOD';
    return 'OTHER';
};
const foodGroupLabel = {
    STAPLE: 'tinh bot/it com',
    PROTEIN_MAIN: 'mon chinh giau dam',
    VEGETABLE_HEALTHY: 'rau cu/healthy',
    DESSERT_FRUIT: 'trang mieng trai cay',
    DRINK_SOUP: 'do nuoc/canh',
    GRILLED: 'mon nuong',
    VEGETARIAN: 'do chay',
    DRY_FOOD: 'do kho',
    OTHER: 'mon phu hop',
};
const matchesSlotGroup = (food, group, slot) => {
    const text = toFoodText(food);
    const mealTypeFromSlot = slot.key.includes('breakfast')
        ? 'BREAKFAST'
        : slot.key.includes('lunch')
            ? 'LUNCH'
            : slot.key.includes('dinner')
                ? 'DINNER'
                : slot.key.includes('snack')
                    ? 'SNACK'
                    : '';
    if (food.mealTimeTags?.length && mealTypeFromSlot && !food.mealTimeTags.includes(mealTypeFromSlot))
        return false;
    const isLunchDinnerStapleSlot = slot.key.includes('lunch-staple') || slot.key.includes('dinner-staple');
    const isSnackStyle = includesAny(text, SNACK_MEAL_KEYWORDS);
    const isSideStaple = includesAny(text, SIDE_STAPLE_KEYWORDS);
    if (isLunchDinnerStapleSlot && (!isSideStaple || isSnackStyle))
        return false;
    if ((slot.key.includes('lunch-main') || slot.key.includes('dinner-main')) && isSnackStyle)
        return false;
    if (slot.groups.includes(group))
        return true;
    if (slot.groups.includes('PROTEIN_MAIN') && group === 'GRILLED' && Number(food.protein || 0) >= 10)
        return true;
    if (slot.groups.includes('PROTEIN_MAIN') && group === 'VEGETARIAN' && Number(food.protein || 0) >= 8)
        return true;
    if (slot.groups.includes('VEGETABLE_HEALTHY') && group === 'VEGETARIAN')
        return true;
    return false;
};
const getMealSlots = (goalType, mealType) => {
    if (goalType === 'WEIGHT_LOSS') {
        switch (mealType) {
            case 'BREAKFAST':
                return [
                    {
                        key: 'breakfast-light-main',
                        label: 'bua sang vua du',
                        groups: ['PROTEIN_MAIN', 'VEGETABLE_HEALTHY', 'DRINK_SOUP', 'STAPLE'],
                        calorieRatio: 0.9,
                        maxPortion: 0.85,
                    },
                ];
            case 'LUNCH':
                return [
                    {
                        key: 'lunch-protein',
                        label: 'bua trua - mon chinh it dau mo',
                        groups: ['PROTEIN_MAIN', 'GRILLED', 'VEGETARIAN', 'DRY_FOOD'],
                        calorieRatio: 0.42,
                        maxPortion: 0.75,
                    },
                    {
                        key: 'lunch-vegetable',
                        label: 'bua trua - rau cu/healthy',
                        groups: ['VEGETABLE_HEALTHY', 'DRINK_SOUP', 'VEGETARIAN'],
                        calorieRatio: 0.28,
                        maxPortion: 0.75,
                    },
                    {
                        key: 'lunch-staple',
                        label: 'bua trua - it tinh bot',
                        groups: ['STAPLE'],
                        calorieRatio: 0.18,
                        optional: true,
                        maxPortion: 0.5,
                    },
                    {
                        key: 'lunch-dessert',
                        label: 'bua trua - trang mieng nhe',
                        groups: ['DESSERT_FRUIT'],
                        calorieRatio: 0.12,
                        optional: true,
                        maxPortion: 0.5,
                    },
                ];
            case 'DINNER':
                return [
                    {
                        key: 'dinner-light-main',
                        label: 'bua toi nhe',
                        groups: ['VEGETABLE_HEALTHY', 'PROTEIN_MAIN', 'DRINK_SOUP', 'VEGETARIAN'],
                        calorieRatio: 0.7,
                        maxPortion: 0.7,
                    },
                    {
                        key: 'dinner-soup-veg',
                        label: 'bua toi - canh/rau nhe',
                        groups: ['DRINK_SOUP', 'VEGETABLE_HEALTHY'],
                        calorieRatio: 0.3,
                        optional: true,
                        maxPortion: 0.6,
                    },
                ];
            case 'SNACK':
            default:
                return [
                    {
                        key: 'snack-fruit',
                        label: 'bua phu nhe',
                        groups: ['DESSERT_FRUIT', 'DRINK_SOUP'],
                        calorieRatio: 0.9,
                        optional: true,
                        maxPortion: 0.5,
                    },
                ];
        }
    }
    if (mealType === 'LUNCH' || mealType === 'DINNER') {
        return [
            {
                key: `${mealType.toLowerCase()}-main`,
                label: mealType === 'LUNCH' ? 'bua trua - mon chinh' : 'bua toi - mon chinh',
                groups: ['PROTEIN_MAIN', 'GRILLED', 'VEGETARIAN', 'DRY_FOOD'],
                calorieRatio: 0.95,
            },
            {
                key: `${mealType.toLowerCase()}-healthy`,
                label: mealType === 'LUNCH' ? 'bua trua - rau/canh' : 'bua toi - rau/canh',
                groups: ['VEGETABLE_HEALTHY', 'DRINK_SOUP', 'VEGETARIAN'],
                calorieRatio: 0.35,
                optional: true,
            },
            {
                key: `${mealType.toLowerCase()}-dessert`,
                label: mealType === 'LUNCH' ? 'bua trua - trang mieng' : 'bua toi - trang mieng',
                groups: ['DESSERT_FRUIT'],
                calorieRatio: 0.25,
                optional: true,
                maxPortion: goalType === 'WEIGHT_GAIN' || goalType === 'MUSCLE_GAIN' ? 1 : 0.5,
            },
            {
                key: `${mealType.toLowerCase()}-staple`,
                label: mealType === 'LUNCH' ? 'bua trua - tinh bot phu' : 'bua toi - tinh bot phu',
                groups: ['STAPLE'],
                calorieRatio: goalType === 'WEIGHT_GAIN' || goalType === 'MUSCLE_GAIN' ? 0.35 : 0.25,
                optional: true,
            },
        ];
    }
    return [
        {
            key: `${mealType.toLowerCase()}-balanced`,
            label: mealType === 'BREAKFAST' ? 'bua sang can bang' : 'bua phu',
            groups: mealType === 'SNACK'
                ? ['DESSERT_FRUIT', 'DRINK_SOUP', 'PROTEIN_MAIN']
                : ['PROTEIN_MAIN', 'STAPLE', 'VEGETABLE_HEALTHY', 'DRINK_SOUP'],
            calorieRatio: 0.9,
        },
    ];
};
const getPortionMultiplier = (goalType, food) => {
    const analysis = analyzeFood(food);
    if (goalType === 'WEIGHT_LOSS')
        return analysis.isFruitOrDrink ? 0.75 : 0.8;
    if (goalType === 'WEIGHT_GAIN')
        return analysis.isFruitOrDrink ? 1.2 : 1.4;
    if (goalType === 'MUSCLE_GAIN')
        return analysis.isFruitOrDrink ? 1.15 : 1.3;
    return 1;
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const roundPortion = (value) => Number((Math.round(value * 4) / 4).toFixed(2));
const getBmiCategory = (height, weight) => {
    const h = Number(height || 0);
    const w = Number(weight || 0);
    if (h < 120 || h > 230 || w < 35 || w > 220)
        return 'UNKNOWN';
    const bmi = w / ((h / 100) ** 2);
    if (bmi < 18.5)
        return 'UNDERWEIGHT';
    if (bmi < 23)
        return 'NORMAL';
    if (bmi < 27.5)
        return 'OVERWEIGHT';
    return 'OBESE';
};
const getEffectiveGoalType = (goalType, bmiCategory) => {
    if (goalType)
        return goalType;
    if (bmiCategory === 'UNDERWEIGHT')
        return 'WEIGHT_GAIN';
    if (bmiCategory === 'OVERWEIGHT' || bmiCategory === 'OBESE')
        return 'WEIGHT_LOSS';
    return 'MAINTENANCE';
};
const getMealCalorieBand = (goalType, mealType, bmiCategory) => {
    const effectiveGoal = getEffectiveGoalType(goalType, bmiCategory);
    const bands = {
        WEIGHT_LOSS: {
            BREAKFAST: { min: 220, max: 420, ideal: 330 },
            LUNCH: { min: 320, max: 560, ideal: 450 },
            DINNER: { min: 280, max: 500, ideal: 390 },
            SNACK: { min: 80, max: 180, ideal: 130 },
        },
        MAINTENANCE: {
            BREAKFAST: { min: 300, max: 550, ideal: 420 },
            LUNCH: { min: 450, max: 750, ideal: 600 },
            DINNER: { min: 380, max: 650, ideal: 520 },
            SNACK: { min: 100, max: 250, ideal: 170 },
        },
        WEIGHT_GAIN: {
            BREAKFAST: { min: 420, max: 700, ideal: 560 },
            LUNCH: { min: 600, max: 900, ideal: 740 },
            DINNER: { min: 550, max: 850, ideal: 700 },
            SNACK: { min: 180, max: 350, ideal: 260 },
        },
        MUSCLE_GAIN: {
            BREAKFAST: { min: 380, max: 650, ideal: 520 },
            LUNCH: { min: 550, max: 850, ideal: 700 },
            DINNER: { min: 500, max: 800, ideal: 650 },
            SNACK: { min: 160, max: 320, ideal: 240 },
        },
    };
    const base = bands[effectiveGoal][mealType];
    if (effectiveGoal !== 'MAINTENANCE')
        return base;
    if (bmiCategory === 'UNDERWEIGHT') {
        return { min: base.min + 80, max: base.max + 120, ideal: base.ideal + 100 };
    }
    if (bmiCategory === 'OVERWEIGHT' || bmiCategory === 'OBESE') {
        return { min: Math.max(80, base.min - 80), max: base.max - 100, ideal: base.ideal - 90 };
    }
    return base;
};
const getAge = (dateOfBirth) => {
    if (!dateOfBirth)
        return 30;
    const now = new Date();
    let age = now.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = now.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dateOfBirth.getDate()))
        age -= 1;
    return clamp(age, 13, 90);
};
const getActivityFactor = (activityLevel) => {
    switch (activityLevel) {
        case 'SEDENTARY':
            return 1.2;
        case 'LIGHT':
            return 1.375;
        case 'MODERATE':
            return 1.55;
        case 'ACTIVE':
            return 1.725;
        case 'VERY_ACTIVE':
            return 1.9;
        default:
            return 1.45;
    }
};
const estimateDailyCalories = (profile, activeGoal) => {
    const height = Number(profile?.height || 0);
    const weight = Number(profile?.weight || 0);
    const hasBodyData = height >= 120 && height <= 230 && weight >= 35 && weight <= 220;
    const gender = normalize(profile?.gender || '');
    const age = getAge(profile?.dateOfBirth);
    const bmr = hasBodyData
        ? (10 * weight) + (6.25 * height) - (5 * age) + (gender.includes('nu') || gender.includes('female') ? -161 : 5)
        : Number(profile?.targetCalories || activeGoal?.targetCalories || 2000);
    const tdee = hasBodyData ? bmr * getActivityFactor(profile?.activityLevel) : bmr;
    let target = Number(activeGoal?.targetCalories || profile?.targetCalories || 0);
    if (!Number.isFinite(target) || target <= 0) {
        if (activeGoal?.goalType === 'WEIGHT_LOSS')
            target = tdee - 450;
        else if (activeGoal?.goalType === 'WEIGHT_GAIN')
            target = tdee + 350;
        else if (activeGoal?.goalType === 'MUSCLE_GAIN')
            target = tdee + 180;
        else
            target = tdee;
    }
    if (activeGoal?.goalType === 'WEIGHT_LOSS') {
        target = clamp(target, 1200, Math.max(1250, tdee - 250));
    }
    else if (activeGoal?.goalType === 'WEIGHT_GAIN') {
        target = clamp(target, Math.max(1700, tdee + 150), tdee + 550);
    }
    else if (activeGoal?.goalType === 'MUSCLE_GAIN') {
        target = clamp(target, Math.max(1600, tdee), tdee + 350);
    }
    else {
        target = clamp(target, 1500, 2800);
    }
    return Math.round(target);
};
const startOfToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};
const inferMealTypeFromReason = (reason) => {
    const text = normalize(reason || '');
    if (text.includes('bua sang'))
        return 'BREAKFAST';
    if (text.includes('bua trua'))
        return 'LUNCH';
    if (text.includes('bua toi'))
        return 'DINNER';
    if (text.includes('bua phu') || text.includes('an nhe'))
        return 'SNACK';
    return 'SNACK';
};
const inferPortionFromReason = (reason) => {
    const match = String(reason || '').match(/khau phan\s+([0-9]+(?:\.[0-9]+)?)x/i);
    const value = match ? Number(match[1]) : 1;
    if (!Number.isFinite(value) || value <= 0)
        return 1;
    return clamp(value, 0.25, 3);
};
const getAppDayOfWeek = (value) => {
    const [year, month, day] = (0, timezone_util_1.toAppDateKey)(value).split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};
const getMealBudgets = (context) => {
    const target = context.dailyCalorieTarget;
    const remaining = Math.max(0, context.remainingCalories);
    const goalType = context.goalType;
    const effectiveGoal = getEffectiveGoalType(goalType, context.bmiCategory);
    const shares = {
        BREAKFAST: 0.24,
        LUNCH: 0.34,
        DINNER: 0.3,
        SNACK: 0.12,
    };
    const build = (mealType, minRatio, maxRatio, minProtein, maxFat) => {
        const band = getMealCalorieBand(goalType, mealType, context.bmiCategory);
        const baseMin = Math.round(target * minRatio);
        const baseMax = Math.round(target * maxRatio);
        const remainingCap = remaining > 0 ? Math.max(120, Math.round(remaining * shares[mealType])) : baseMax;
        const maxCalories = effectiveGoal === 'WEIGHT_LOSS'
            ? Math.min(baseMax, remainingCap, band.max)
            : Math.min(Math.max(baseMin + 80, remainingCap || baseMax), band.max);
        const minCalories = Math.min(Math.max(80, band.min, Math.min(baseMin, maxCalories - 80)), Math.max(80, maxCalories - 60));
        return {
            mealType,
            minCalories,
            maxCalories: Math.max(120, maxCalories),
            idealCalories: Math.min(band.ideal, Math.max(120, maxCalories)),
            minProtein,
            maxFat,
        };
    };
    if (effectiveGoal === 'WEIGHT_LOSS') {
        return [
            build('BREAKFAST', 0.16, 0.25, 10, 16),
            build('LUNCH', 0.22, 0.32, 16, 20),
            build('DINNER', 0.18, 0.28, 14, 18),
            build('SNACK', 0.05, 0.1, 4, 9),
        ];
    }
    if (effectiveGoal === 'MUSCLE_GAIN') {
        return [
            build('BREAKFAST', 0.2, 0.28, 20, 22),
            build('LUNCH', 0.26, 0.36, 28, 28),
            build('DINNER', 0.24, 0.34, 26, 26),
            build('SNACK', 0.08, 0.14, 14, 14),
        ];
    }
    if (effectiveGoal === 'WEIGHT_GAIN') {
        return [
            build('BREAKFAST', 0.2, 0.3, 14),
            build('LUNCH', 0.28, 0.38, 20),
            build('DINNER', 0.25, 0.36, 18),
            build('SNACK', 0.08, 0.16, 8),
        ];
    }
    return [
        build('BREAKFAST', 0.18, 0.27, 10, 20),
        build('LUNCH', 0.24, 0.35, 16, 24),
        build('DINNER', 0.22, 0.32, 14, 22),
        build('SNACK', 0.06, 0.12, 4, 12),
    ];
};
const MEAL_RATIO_BY_GOAL = {
    WEIGHT_LOSS: { BREAKFAST: 0.24, LUNCH: 0.34, DINNER: 0.3, SNACK: 0.12 },
    MAINTENANCE: { BREAKFAST: 0.25, LUNCH: 0.35, DINNER: 0.3, SNACK: 0.1 },
    WEIGHT_GAIN: { BREAKFAST: 0.24, LUNCH: 0.36, DINNER: 0.3, SNACK: 0.1 },
    MUSCLE_GAIN: { BREAKFAST: 0.24, LUNCH: 0.36, DINNER: 0.3, SNACK: 0.1 },
};
const dayOfWeekList = [0, 1, 2, 3, 4, 5, 6];
const getMealBudgetCap = (targetCalories, goalType, bmiCategory, mealType) => {
    const ratio = MEAL_RATIO_BY_GOAL[goalType][mealType];
    let max = Math.round(targetCalories * ratio);
    let min = Math.round(max * 0.72);
    if (goalType === 'WEIGHT_LOSS' || bmiCategory === 'OBESE') {
        max = Math.round(max * 0.92);
        min = Math.round(min * 0.9);
    }
    else if (goalType === 'WEIGHT_GAIN' || goalType === 'MUSCLE_GAIN') {
        max = Math.round(max * 1.08);
    }
    if (mealType === 'SNACK') {
        max = Math.min(max, goalType === 'WEIGHT_LOSS' ? 180 : 260);
        min = Math.max(60, Math.round(max * 0.45));
    }
    else {
        max = Math.max(260, max);
        min = Math.max(170, min);
    }
    return { min, max, ideal: Math.round((min + max) / 2) };
};
const getHardDailyCap = (targetCalories, goalType, bmiCategory) => {
    if (goalType === 'WEIGHT_LOSS' || bmiCategory === 'OBESE')
        return Math.round(targetCalories * 1.02);
    if (goalType === 'MAINTENANCE')
        return Math.round(targetCalories * 1.08);
    return Math.round(targetCalories * 1.15);
};
const matchesDietaryPref = (dietaryPref, food) => {
    if (!dietaryPref.length)
        return true;
    const text = toFoodText(food);
    const pref = dietaryPref.map((item) => normalize(item));
    if (pref.some((item) => item.includes('vegan') || item.includes('thuan chay'))) {
        if (!food.isVegan)
            return false;
    }
    if (pref.some((item) => item.includes('vegetarian') || item.includes('chay'))) {
        if (!food.isVegetarian && !food.isVegan && !text.includes('chay'))
            return false;
    }
    if (pref.some((item) => item.includes('gluten free') || item.includes('khong gluten'))) {
        if (!food.isGlutenFree)
            return false;
    }
    return true;
};
const isMainDish = (food) => {
    if (food.mealRoles?.includes('MAIN'))
        return true;
    if (food.portionType === 'FULL_MEAL')
        return true;
    const group = classifyFoodGroup(food);
    return group === 'PROTEIN_MAIN' || group === 'STAPLE' || group === 'GRILLED';
};
const canUseForMeal = (food, mealType) => {
    if (!food.mealTimeTags?.length)
        return true;
    return food.mealTimeTags.includes(mealType);
};
const caloriesByQuantity = (food, quantity) => Number(food.calories || 0) * quantity;
const toValidDayOfWeeks = (raw) => {
    if (!Array.isArray(raw))
        return [];
    return Array.from(new Set(raw.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item >= 0 && item <= 6)));
};
const resolvePortionForBudget = (goalType, food, budget, options) => {
    const calories = Math.max(1, Number(food.calories || 0));
    const preferred = getPortionMultiplier(goalType, food);
    const defaultMinPortion = goalType === 'WEIGHT_LOSS' ? 0.5 : goalType === 'WEIGHT_GAIN' ? 0.85 : 0.65;
    const defaultMaxPortion = goalType === 'WEIGHT_LOSS' ? 1 : goalType === 'WEIGHT_GAIN' ? 1.35 : goalType === 'MUSCLE_GAIN' ? 1.25 : 1.1;
    const minPortion = options?.minPortion ?? defaultMinPortion;
    const maxPortion = options?.maxPortion ?? defaultMaxPortion;
    const byBudget = budget.maxCalories / calories;
    const portion = roundPortion(clamp(Math.min(preferred, byBudget), minPortion, maxPortion));
    const portionCalories = Math.round(calories * portion);
    return {
        portion,
        calories: portionCalories,
        protein: Number((Number(food.protein || 0) * portion).toFixed(1)),
        fat: Number((Number(food.fat || 0) * portion).toFixed(1)),
        carbs: Number((Number(food.carbs || 0) * portion).toFixed(1)),
    };
};
const isMealBudgetCompatible = (goalType, food, budget) => {
    const a = analyzeFood(food);
    const portion = resolvePortionForBudget(goalType, food, budget);
    if (portion.calories > budget.maxCalories)
        return false;
    if (budget.mealType === 'SNACK' && portion.calories > 220)
        return false;
    if (goalType === 'WEIGHT_LOSS') {
        if (food.goalTags?.length && !food.goalTags.includes('WEIGHT_LOSS'))
            return false;
        if (a.isUnhealthyStyle)
            return false;
        if (portion.calories > budget.maxCalories)
            return false;
        if (portion.fat > (budget.maxFat || 18))
            return false;
        if (a.calories > 650)
            return false;
    }
    if (goalType === 'MUSCLE_GAIN' && portion.protein < budget.minProtein * 0.65)
        return false;
    return true;
};
const scoreByGoal = (goalType, food) => {
    const a = analyzeFood(food);
    switch (goalType) {
        case 'WEIGHT_LOSS': {
            const calorieScore = Math.max(0, 38 - a.calories / 12);
            const proteinScore = a.proteinDensity * 1050 + Math.min(28, a.protein) * 0.25;
            const veggieScore = a.hasVegetable ? 22 : 0;
            const healthyStyleScore = a.isHealthyStyle ? 20 : 0;
            const unhealthyPenalty = a.isUnhealthyStyle ? 78 : 0;
            const highCalPenalty = a.calories > 520 ? 44 : a.calories > 430 ? 20 : 0;
            const fatPenalty = a.fatRatioByCalories > 0.35 ? 26 : 0;
            const carbPenalty = a.carbs > 70 ? 24 : a.carbs > 55 ? 10 : 0;
            const lowProteinPenalty = a.protein < 8 ? 10 : 0;
            const gainStylePenalty = a.supportsWeightGain && !a.hasVegetable && !a.isHealthyStyle ? 18 : 0;
            return (calorieScore +
                proteinScore +
                veggieScore +
                healthyStyleScore -
                unhealthyPenalty -
                highCalPenalty -
                fatPenalty -
                carbPenalty -
                lowProteinPenalty -
                gainStylePenalty);
        }
        case 'WEIGHT_GAIN': {
            const calorieScore = a.calories / 9;
            const proteinScore = a.proteinDensity * 820 + a.protein * 0.9;
            const healthyStyleScore = a.isHealthyStyle ? 10 : 0;
            const gainSupportScore = a.supportsWeightGain ? 24 : 0;
            const carbSupportScore = a.carbs >= 35 ? 12 : 0;
            const riceFruitBonus = a.isRiceOrFruit ? 12 : 0;
            const lowCalPenalty = a.calories < 220 ? 36 : 0;
            const veryUnhealthyPenalty = a.isUnhealthyStyle ? 20 : 0;
            const lowProteinPenalty = a.protein < 8 ? 14 : 0;
            return (calorieScore +
                proteinScore +
                healthyStyleScore +
                gainSupportScore +
                carbSupportScore +
                riceFruitBonus -
                lowCalPenalty -
                veryUnhealthyPenalty -
                lowProteinPenalty);
        }
        case 'MUSCLE_GAIN': {
            const proteinScore = a.proteinDensity * 1450 + a.protein * 1.2;
            const carbSupportScore = a.carbs >= 25 && a.carbs <= 90 ? 14 : -6;
            const calorieSupportScore = a.calories >= 220 ? 12 : -18;
            const unhealthyPenalty = a.isUnhealthyStyle ? 24 : 0;
            const highFatPenalty = a.fatRatioByCalories > 0.45 ? 10 : 0;
            return proteinScore + carbSupportScore + calorieSupportScore - unhealthyPenalty - highFatPenalty;
        }
        case 'MAINTENANCE':
        default: {
            const calorieBalance = 14 - Math.abs(a.calories - 420) / 38;
            const proteinScore = a.proteinDensity * 650;
            const healthyStyleScore = a.isHealthyStyle ? 8 : 0;
            const unhealthyPenalty = a.isUnhealthyStyle ? 16 : 0;
            return calorieBalance + proteinScore + healthyStyleScore - unhealthyPenalty;
        }
    }
};
const scoreByDietaryPreference = (dietaryPref, food) => {
    if (!dietaryPref.length)
        return 0;
    let score = 0;
    const pref = dietaryPref.map((item) => normalize(item));
    if (pref.some((item) => item.includes('vegan') || item.includes('thuan chay'))) {
        score += food.isVegan ? 15 : -20;
    }
    if (pref.some((item) => item.includes('vegetarian') || item.includes('chay'))) {
        score += food.isVegetarian ? 10 : -8;
    }
    if (pref.some((item) => item.includes('gluten'))) {
        score += food.isGlutenFree ? 8 : -12;
    }
    return score;
};
const findMatchedAllergies = (allergies, food) => allergies
    .map((item) => normalize(item))
    .filter((item) => item && toFoodText(food).includes(item));
const isGoalCompatible = (goalType, food) => {
    const a = analyzeFood(food);
    if (goalType === 'WEIGHT_LOSS') {
        if (a.isUnhealthyStyle)
            return false;
        if (a.calories > 560)
            return false;
        if (a.fat > 24)
            return false;
        if (a.carbs > 78)
            return false;
        if (!a.hasVegetable && !a.isHealthyStyle && a.calories > 380)
            return false;
        return true;
    }
    if (goalType === 'WEIGHT_GAIN') {
        if (food.goalTags?.length && !food.goalTags.includes('WEIGHT_GAIN'))
            return false;
        if (a.calories < 180)
            return false;
        if (a.protein < 8)
            return false;
        if (a.isUnhealthyStyle && a.calories > 700)
            return false;
        return true;
    }
    if (goalType === 'MUSCLE_GAIN') {
        if (food.goalTags?.length && !food.goalTags.includes('MUSCLE_GAIN'))
            return false;
        if (a.protein < 12)
            return false;
        if (a.calories < 170)
            return false;
        if (a.isUnhealthyStyle && a.fat > 30)
            return false;
        return true;
    }
    return true;
};
const buildGoalReason = (goalType, food) => {
    const a = analyzeFood(food);
    const reasons = [];
    if (goalType === 'WEIGHT_GAIN' || goalType === 'MUSCLE_GAIN') {
        if (a.supportsWeightGain)
            reasons.push('ho tro tang can lanh manh');
        if (a.isHealthyStyle)
            reasons.push('uu tien cach che bien healthy');
        if (a.isRiceOrFruit)
            reasons.push('phu hop ket hop com trang/trai cay dia');
        reasons.push('khau phan tang hon muc binh thuong');
    }
    else if (goalType === 'WEIGHT_LOSS') {
        reasons.push('khau phan nho hon muc binh thuong');
        if (a.hasVegetable)
            reasons.push('nhieu rau xanh');
        if (a.isHealthyStyle)
            reasons.push('uu tien luoc/hap/nuong');
        if (a.hasVegetable || a.isHealthyStyle)
            reasons.push('uu tien rau cu qua va mon it dau mo');
        if (a.calories <= 450)
            reasons.push('muc calo hop ly cho giam can');
    }
    else {
        reasons.push('can bang cho muc tieu duy tri');
    }
    if (!reasons.length)
        reasons.push('phu hop muc tieu hien tai');
    return reasons;
};
const generateRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const requestedLimit = Math.max(1, Math.min(20, Number(req.body?.limit || req.query?.limit || 8)));
        const today = startOfToday();
        const [profile, activeGoal, todayNutrition, todayMeals, recentMeals, favorites, foods] = await Promise.all([
            prisma.userProfile.findUnique({ where: { userId } }),
            prisma.userGoal.findFirst({
                where: { userId },
                orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
            }),
            prisma.dailyNutrition.findUnique({
                where: { userId_date: { userId, date: today } },
            }).catch(() => null),
            prisma.meal.findMany({
                where: {
                    userId,
                    eatenAt: {
                        gte: today,
                        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                    },
                },
                select: { foodId: true, mealType: true },
            }),
            prisma.meal.findMany({
                where: { userId },
                orderBy: { eatenAt: 'desc' },
                take: 80,
                select: { foodId: true, eatenAt: true },
            }),
            prisma.favorite.findMany({
                where: { userId },
                select: { foodId: true },
            }),
            prisma.foodItem.findMany({
                select: {
                    id: true,
                    name: true,
                    category: true,
                    description: true,
                    calories: true,
                    protein: true,
                    fat: true,
                    carbs: true,
                    imageUrl: true,
                    isVegetarian: true,
                    isVegan: true,
                    isGlutenFree: true,
                    popularity: true,
                },
            }),
        ]);
        const foodMeta = await loadFoodPlanningMeta(foods.map((food) => food.id));
        const enrichedFoods = foods.map((food) => ({ ...food, ...(foodMeta.get(food.id) || {}) }));
        const bmiCategory = getBmiCategory(profile?.height, profile?.weight);
        const goalType = getEffectiveGoalType(activeGoal?.goalType || null, bmiCategory);
        const dailyCalorieTarget = estimateDailyCalories(profile, activeGoal || { goalType });
        const currentCalories = Number(todayNutrition?.totalCalories || 0);
        const remainingCalories = Math.max(0, dailyCalorieTarget - currentCalories);
        const practicalLimit = goalType === 'WEIGHT_LOSS'
            ? Math.min(requestedLimit, 6)
            : goalType === 'MAINTENANCE'
                ? Math.min(requestedLimit, 4)
                : Math.min(requestedLimit, 7);
        const nutritionContext = {
            goalType,
            bmiCategory,
            dailyCalorieTarget,
            currentCalories,
            remainingCalories,
            height: profile?.height,
            weight: profile?.weight,
        };
        const dietaryPref = profile?.dietaryPref || [];
        const allergies = profile?.allergies || [];
        const favoriteIds = new Set(favorites.map((item) => item.foodId));
        const completedMealTypes = new Set(todayMeals.map((item) => item.mealType));
        const recentCutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const recentFoodIds = new Set(recentMeals
            .filter((item) => new Date(item.eatenAt) >= recentCutoff)
            .map((item) => item.foodId));
        const budgets = getMealBudgets(nutritionContext);
        const mealLabel = {
            BREAKFAST: 'bua sang',
            LUNCH: 'bua trua',
            DINNER: 'bua toi',
            SNACK: 'bua phu',
        };
        const selectedFoodIds = new Set();
        let plannedCalories = 0;
        const scoredFoods = [];
        for (const budget of budgets) {
            if (scoredFoods.length >= practicalLimit)
                break;
            if (goalType === 'WEIGHT_LOSS' && completedMealTypes.has(budget.mealType))
                continue;
            if (remainingCalories > 0 && plannedCalories >= remainingCalories)
                break;
            const slots = getMealSlots(goalType, budget.mealType);
            let mealPlannedCalories = 0;
            let hasRequiredMealSelection = false;
            for (const slot of slots) {
                if (scoredFoods.length >= practicalLimit)
                    break;
                if (remainingCalories > 0 && plannedCalories >= remainingCalories)
                    break;
                if (slot.optional && !hasRequiredMealSelection && (budget.mealType === 'LUNCH' || budget.mealType === 'DINNER')) {
                    continue;
                }
                const dayRemainingCap = remainingCalories > 0 ? Math.max(80, remainingCalories - plannedCalories) : budget.maxCalories;
                const mealRemainingCap = Math.max(60, budget.maxCalories - mealPlannedCalories);
                const slotMaxCalories = Math.min(Math.max(60, Math.round(budget.maxCalories * slot.calorieRatio)), dayRemainingCap, mealRemainingCap);
                if (slot.optional && slotMaxCalories < 80)
                    continue;
                const effectiveBudget = {
                    ...budget,
                    minCalories: Math.min(Math.max(50, Math.round(budget.minCalories * slot.calorieRatio)), Math.max(50, slotMaxCalories - 30)),
                    maxCalories: slotMaxCalories,
                    idealCalories: Math.min(Math.max(60, Math.round(budget.idealCalories * slot.calorieRatio)), slotMaxCalories),
                    minProtein: Math.max(0, Math.round(budget.minProtein * slot.calorieRatio)),
                    maxFat: budget.maxFat ? Math.max(4, Math.round(budget.maxFat * slot.calorieRatio)) : undefined,
                };
                const candidates = enrichedFoods
                    .filter((food) => !selectedFoodIds.has(food.id))
                    .map((food) => {
                    const group = classifyFoodGroup(food);
                    const matchedAllergies = findMatchedAllergies(allergies, food);
                    const hasAllergyConflict = matchedAllergies.length > 0;
                    const portion = resolvePortionForBudget(goalType, food, effectiveBudget, {
                        minPortion: slot.minPortion,
                        maxPortion: slot.maxPortion,
                    });
                    const goalScore = scoreByGoal(goalType, food);
                    const dietaryScore = scoreByDietaryPreference(dietaryPref, food);
                    const allergyScore = hasAllergyConflict ? -1000 : 0;
                    const favoriteScore = favoriteIds.has(food.id) ? 28 : 0;
                    const recentPenalty = recentFoodIds.has(food.id) ? -16 : 5;
                    const groupMatch = matchesSlotGroup(food, group, slot);
                    const groupScore = groupMatch ? 42 : -160;
                    const proteinFit = Math.min(24, portion.protein * 1.1);
                    const calorieFit = Math.max(0, 34 - Math.abs(portion.calories - effectiveBudget.idealCalories) / 8);
                    const overBudgetPenalty = portion.calories > effectiveBudget.maxCalories ? 180 : 0;
                    const underBudgetPenalty = !slot.optional && portion.calories < effectiveBudget.minCalories * 0.65
                        ? 28
                        : 0;
                    const lowProteinPenalty = slot.groups.includes('PROTEIN_MAIN') && portion.protein < Math.max(6, effectiveBudget.minProtein * 0.8)
                        ? 26
                        : 0;
                    const weightLossStaplePenalty = goalType === 'WEIGHT_LOSS' && group === 'STAPLE' && budget.mealType === 'DINNER'
                        ? 80
                        : 0;
                    const weightLossDessertPenalty = goalType === 'WEIGHT_LOSS' && group === 'DESSERT_FRUIT' && portion.calories > 120
                        ? 35
                        : 0;
                    const lunchDinnerSnackPenalty = (budget.mealType === 'LUNCH' || budget.mealType === 'DINNER') && includesAny(toFoodText(food), SNACK_MEAL_KEYWORDS)
                        ? 180
                        : 0;
                    const score = goalScore +
                        dietaryScore +
                        allergyScore +
                        favoriteScore +
                        recentPenalty +
                        groupScore +
                        proteinFit +
                        calorieFit -
                        overBudgetPenalty -
                        underBudgetPenalty -
                        lowProteinPenalty -
                        weightLossStaplePenalty -
                        weightLossDessertPenalty -
                        lunchDinnerSnackPenalty;
                    return {
                        food,
                        group,
                        score,
                        portion,
                        hasAllergyConflict,
                        compatible: groupMatch &&
                            isGoalCompatible(goalType, food) &&
                            isMealBudgetCompatible(goalType, food, effectiveBudget),
                    };
                })
                    .filter((item) => !item.hasAllergyConflict && item.compatible)
                    .sort((a, b) => b.score - a.score);
                const selected = candidates[0];
                if (!selected) {
                    if (slot.optional)
                        continue;
                    continue;
                }
                selectedFoodIds.add(selected.food.id);
                plannedCalories += selected.portion.calories;
                mealPlannedCalories += selected.portion.calories;
                if (!slot.optional)
                    hasRequiredMealSelection = true;
                const reasons = [
                    slot.label,
                    foodGroupLabel[selected.group],
                    `khau phan ${selected.portion.portion}x`,
                    `~${selected.portion.calories} kcal`,
                    `nguong ${mealLabel[budget.mealType]} ${budget.minCalories}-${budget.maxCalories} kcal`,
                    ...buildGoalReason(goalType, selected.food),
                ];
                if (nutritionContext.height && nutritionContext.weight) {
                    reasons.push(`BMI ${nutritionContext.bmiCategory.toLowerCase()} ${nutritionContext.height}cm/${nutritionContext.weight}kg`);
                }
                if (favoriteIds.has(selected.food.id))
                    reasons.push('uu tien tu mon yeu thich');
                if (!recentFoodIds.has(selected.food.id))
                    reasons.push('chua an gan day');
                scoredFoods.push({
                    food: selected.food,
                    score: Number(selected.score.toFixed(2)),
                    reason: Array.from(new Set(reasons)).slice(0, 6).join(', '),
                });
            }
        }
        if (!scoredFoods.length && remainingCalories <= 100) {
            return res.json({
                success: true,
                data: [],
                meta: {
                    dailyCalorieTarget,
                    currentCalories,
                    remainingCalories,
                    bmiCategory,
                    effectiveGoalType: goalType,
                    message: 'Calorie target is already reached for today.',
                },
            });
        }
        if (!scoredFoods.length) {
            return res.json({ success: true, data: [] });
        }
        await prisma.recommendation.deleteMany({
            where: {
                userId,
                isViewed: false,
                isAccepted: null,
            },
        });
        await prisma.recommendation.createMany({
            data: scoredFoods.map((item) => ({
                userId,
                foodId: item.food.id,
                reason: item.reason,
                score: Number(item.score.toFixed(2)),
            })),
        });
        const recommendations = await prisma.recommendation.findMany({
            where: { userId },
            include: { food: true },
            orderBy: [{ createdAt: 'desc' }, { score: 'desc' }],
            take: practicalLimit,
        });
        res.json({
            success: true,
            data: recommendations,
            meta: {
                dailyCalorieTarget,
                currentCalories,
                remainingCalories,
                bmiCategory,
                effectiveGoalType: goalType,
                plannedCalories,
                maxRecommendations: practicalLimit,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.generateRecommendations = generateRecommendations;
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = Math.max(1, Math.min(50, Number(req.query.limit || 20)));
        const status = String(req.query.status || 'all');
        const where = { userId };
        if (status === 'new') {
            where.isViewed = false;
            where.isAccepted = null;
        }
        else if (status === 'accepted') {
            where.isAccepted = true;
        }
        else if (status === 'rejected') {
            where.isAccepted = false;
        }
        const recommendations = await prisma.recommendation.findMany({
            where,
            include: { food: true },
            orderBy: [{ isViewed: 'asc' }, { score: 'desc' }, { createdAt: 'desc' }],
            take: limit,
        });
        res.json({ success: true, data: recommendations });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getRecommendations = getRecommendations;
const markRecommendationViewed = async (req, res) => {
    try {
        const userId = req.user.id;
        const recommendationId = parseInt(req.params.id);
        const recommendation = await prisma.recommendation.findFirst({
            where: { id: recommendationId, userId },
        });
        if (!recommendation)
            return res.status(404).json({ error: 'Recommendation not found' });
        const updated = await prisma.recommendation.update({
            where: { id: recommendationId },
            data: { isViewed: true },
            include: { food: true },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.markRecommendationViewed = markRecommendationViewed;
const generateRecommendationsByMealPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        const selectedMealPlanId = Number(req.body?.mealPlanId || req.query?.mealPlanId || 0);
        const requestedMealType = String(req.body?.mealType || req.query?.mealType || '').toUpperCase();
        const scopedMealType = Object.values(client_1.MealType).includes(requestedMealType) ? requestedMealType : null;
        const dayOfWeeks = toValidDayOfWeeks(req.body?.dayOfWeeks ?? req.query?.dayOfWeeks ?? []);
        const [targets, profile, activeGoal] = await Promise.all([
            (0, personalization_service_1.resolvePersonalTargets)(userId),
            prisma.userProfile.findUnique({ where: { userId }, select: { height: true, weight: true } }),
            prisma.userGoal.findFirst({ where: { userId }, orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }] }),
        ]);
        const mealPlan = selectedMealPlanId
            ? await prisma.mealPlan.findFirst({
                where: { id: selectedMealPlanId, userId },
                include: { details: { include: { food: true } } },
            })
            : await prisma.mealPlan.findFirst({
                where: { userId },
                orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
                include: { details: { include: { food: true } } },
            });
        if (!mealPlan)
            return res.status(404).json({ error: 'Meal plan not found' });
        const foods = await prisma.foodItem.findMany({
            where: { calories: { gt: 0 } },
            select: {
                id: true,
                name: true,
                category: true,
                description: true,
                calories: true,
                protein: true,
                fat: true,
                carbs: true,
                imageUrl: true,
                isVegetarian: true,
                isVegan: true,
                isGlutenFree: true,
            },
        });
        const foodMeta = await loadFoodPlanningMeta(foods.map((food) => food.id));
        const candidates = foods.map((food) => ({ ...food, ...(foodMeta.get(food.id) || {}) }));
        const bmiCategory = getBmiCategory(profile?.height, profile?.weight);
        const goalType = getEffectiveGoalType((activeGoal?.goalType || targets.goalType || null), bmiCategory);
        const targetCalories = targets.targetCalories;
        const hardDailyCap = getHardDailyCap(targetCalories, goalType, bmiCategory);
        const scopedDays = dayOfWeeks.length ? dayOfWeeks : dayOfWeekList;
        const mealTypes = scopedMealType ? [scopedMealType] : [client_1.MealType.BREAKFAST, client_1.MealType.LUNCH, client_1.MealType.DINNER, client_1.MealType.SNACK];
        const weeklyMainCount = new Map();
        mealPlan.details.forEach((detail) => {
            const food = candidates.find((item) => item.id === detail.foodId);
            if (food && isMainDish(food)) {
                weeklyMainCount.set(food.id, (weeklyMainCount.get(food.id) || 0) + 1);
            }
        });
        const generated = [];
        const skipped = [];
        for (const dayOfWeek of scopedDays) {
            const dayDetails = mealPlan.details.filter((item) => item.dayOfWeek === dayOfWeek);
            const dayPlannedCalories = dayDetails.reduce((sum, item) => {
                const food = candidates.find((f) => f.id === item.foodId);
                return sum + (food ? caloriesByQuantity(food, item.quantity) : 0);
            }, 0);
            let dayProjectedCalories = dayPlannedCalories;
            for (const mealType of mealTypes) {
                const mealBudget = getMealBudgetCap(targetCalories, goalType, bmiCategory, mealType);
                const currentMealDetails = dayDetails.filter((item) => item.mealType === mealType);
                const currentMealCalories = currentMealDetails.reduce((sum, item) => {
                    const food = candidates.find((f) => f.id === item.foodId);
                    return sum + (food ? caloriesByQuantity(food, item.quantity) : 0);
                }, 0);
                const action = currentMealDetails.length === 0 ? 'FILL_EMPTY' : 'ADD_VARIETY';
                const mealRemainingCap = Math.max(0, mealBudget.max - currentMealCalories);
                const dayRemainingCap = Math.max(0, hardDailyCap - dayProjectedCalories);
                if (mealRemainingCap < 80 || dayRemainingCap < 80) {
                    skipped.push({
                        dayOfWeek,
                        mealType,
                        reason: 'Khong con ngan sach calo hop ly cho bua nay.',
                        skipped: true,
                    });
                    continue;
                }
                const usedFoodIdsInDay = new Set(dayDetails.map((item) => item.foodId));
                const filtered = candidates
                    .filter((food) => canUseForMeal(food, mealType))
                    .filter((food) => matchesDietaryPref(targets.dietaryPref || [], food))
                    .filter((food) => findMatchedAllergies(targets.allergies || [], food).length === 0)
                    .filter((food) => !usedFoodIdsInDay.has(food.id))
                    .filter((food) => isGoalCompatible(goalType, food))
                    .filter((food) => {
                    if (action === 'FILL_EMPTY')
                        return isMainDish(food);
                    return !isMainDish(food) || currentMealDetails.length === 0;
                })
                    .map((food) => {
                    const quantity = action === 'FILL_EMPTY'
                        ? clamp(resolvePortionForBudget(goalType, food, {
                            mealType,
                            minCalories: mealBudget.min,
                            maxCalories: Math.min(mealBudget.max, currentMealCalories + mealRemainingCap),
                            idealCalories: mealBudget.ideal,
                            minProtein: 0,
                        }).portion, 0.5, 1.5)
                        : clamp(resolvePortionForBudget(goalType, food, {
                            mealType,
                            minCalories: Math.max(60, Math.round(mealBudget.min * 0.25)),
                            maxCalories: Math.max(120, Math.round(mealBudget.max * 0.45)),
                            idealCalories: Math.round(mealBudget.ideal * 0.3),
                            minProtein: 0,
                        }).portion, 0.5, 1);
                    const estimatedCalories = Math.round(caloriesByQuantity(food, quantity));
                    const projectedMeal = currentMealCalories + estimatedCalories;
                    const projectedDay = dayProjectedCalories + estimatedCalories;
                    const repeatMainCount = isMainDish(food) ? (weeklyMainCount.get(food.id) || 0) : 0;
                    const repeatPenalty = repeatMainCount >= 2 ? 90 : repeatMainCount * 30;
                    const calorieFit = Math.abs(projectedMeal - mealBudget.ideal);
                    const score = scoreByGoal(goalType, food) - calorieFit - repeatPenalty;
                    return { food, quantity, estimatedCalories, projectedMeal, projectedDay, score };
                })
                    .filter((item) => item.estimatedCalories <= mealRemainingCap)
                    .filter((item) => item.projectedMeal <= mealBudget.max)
                    .filter((item) => item.projectedDay <= hardDailyCap)
                    .sort((a, b) => b.score - a.score);
                const selected = filtered[0];
                if (!selected) {
                    skipped.push({
                        dayOfWeek,
                        mealType,
                        reason: 'Khong tim thay mon phu hop voi muc tieu calo/so thich.',
                        skipped: true,
                    });
                    continue;
                }
                generated.push({
                    dayOfWeek,
                    mealType,
                    action,
                    suggestedFoodId: selected.food.id,
                    suggestedFood: {
                        id: selected.food.id,
                        name: selected.food.name,
                        category: selected.food.category || null,
                        imageUrl: selected.food.imageUrl || null,
                        calories: Number(selected.food.calories || 0),
                        protein: Number(selected.food.protein || 0),
                        fat: Number(selected.food.fat || 0),
                        carbs: Number(selected.food.carbs || 0),
                    },
                    suggestedQuantity: Number(selected.quantity.toFixed(2)),
                    estimatedCalories: selected.estimatedCalories,
                    reason: action === 'FILL_EMPTY'
                        ? `Fill o trong theo ngan sach ${mealBudget.min}-${mealBudget.max} kcal`
                        : `Bo sung da dang, giu tong bua trong nguong ${mealBudget.max} kcal`,
                });
                dayProjectedCalories = selected.projectedDay;
                dayDetails.push({
                    id: -Date.now(),
                    mealPlanId: mealPlan.id,
                    foodId: selected.food.id,
                    mealType,
                    dayOfWeek,
                    quantity: selected.quantity,
                    food: selected.food,
                });
                if (isMainDish(selected.food)) {
                    weeklyMainCount.set(selected.food.id, (weeklyMainCount.get(selected.food.id) || 0) + 1);
                }
            }
        }
        return res.json({
            success: true,
            data: {
                mealPlanId: mealPlan.id,
                targetCalories,
                hardDailyCap,
                goalType,
                bmiCategory,
                recommendations: generated,
                skipped,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.generateRecommendationsByMealPlan = generateRecommendationsByMealPlan;
const applyRecommendationToMealPlanDays = async (req, res) => {
    try {
        const userId = req.user.id;
        const mealPlanId = Number(req.body?.mealPlanId || 0);
        const foodId = Number(req.body?.foodId || 0);
        const requestedMealType = String(req.body?.mealType || '').toUpperCase();
        const mealType = Object.values(client_1.MealType).includes(requestedMealType)
            ? requestedMealType
            : null;
        const applyMode = String(req.body?.applyMode || 'SELECTED_DAYS').toUpperCase();
        const dayOfWeeksRaw = toValidDayOfWeeks(req.body?.dayOfWeeks || []);
        const quantity = clamp(Number(req.body?.quantity || 1), 0.5, 2);
        if (!mealPlanId || !foodId || !mealType)
            return res.status(400).json({ error: 'mealPlanId, foodId, mealType are required' });
        const [mealPlan, targets, profile, activeGoal, food] = await Promise.all([
            prisma.mealPlan.findFirst({ where: { id: mealPlanId, userId }, include: { details: { include: { food: true } } } }),
            (0, personalization_service_1.resolvePersonalTargets)(userId),
            prisma.userProfile.findUnique({ where: { userId }, select: { height: true, weight: true } }),
            prisma.userGoal.findFirst({ where: { userId }, orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }] }),
            prisma.foodItem.findUnique({ where: { id: foodId } }),
        ]);
        if (!mealPlan)
            return res.status(404).json({ error: 'Meal plan not found' });
        if (!food)
            return res.status(404).json({ error: 'Food not found' });
        const foodMeta = await loadFoodPlanningMeta([food.id]);
        const candidate = { ...food, ...(foodMeta.get(food.id) || {}) };
        const bmiCategory = getBmiCategory(profile?.height, profile?.weight);
        const goalType = getEffectiveGoalType((activeGoal?.goalType || targets.goalType || null), bmiCategory);
        const targetCalories = targets.targetCalories;
        const hardDailyCap = getHardDailyCap(targetCalories, goalType, bmiCategory);
        const budget = getMealBudgetCap(targetCalories, goalType, bmiCategory, mealType);
        const addCalories = Math.round(Number(food.calories || 0) * quantity);
        const allDays = dayOfWeekList;
        const selectedDays = applyMode === 'ALL_DAYS'
            ? allDays
            : applyMode === 'FILL_EMPTY'
                ? allDays.filter((day) => !mealPlan.details.some((detail) => detail.dayOfWeek === day && detail.mealType === mealType))
                : (dayOfWeeksRaw.length ? dayOfWeeksRaw : []);
        if (!selectedDays.length)
            return res.status(400).json({ error: 'No day selected to apply' });
        const results = [];
        for (const dayOfWeek of selectedDays) {
            const dayDetails = mealPlan.details.filter((item) => item.dayOfWeek === dayOfWeek);
            const mealDetails = dayDetails.filter((item) => item.mealType === mealType);
            const dayCalories = dayDetails.reduce((sum, item) => sum + Number(item.food.calories || 0) * item.quantity, 0);
            const mealCalories = mealDetails.reduce((sum, item) => sum + Number(item.food.calories || 0) * item.quantity, 0);
            if (!canUseForMeal(candidate, mealType)) {
                results.push({ dayOfWeek, status: 'SKIPPED', reason: 'Mon khong phu hop khung bua nay.' });
                continue;
            }
            if (!matchesDietaryPref(targets.dietaryPref || [], candidate)) {
                results.push({ dayOfWeek, status: 'SKIPPED', reason: 'Mon khong phu hop dietary preference.' });
                continue;
            }
            if (findMatchedAllergies(targets.allergies || [], candidate).length) {
                results.push({ dayOfWeek, status: 'SKIPPED', reason: 'Mon xung dot voi di ung cua user.' });
                continue;
            }
            if (dayCalories + addCalories > hardDailyCap) {
                results.push({ dayOfWeek, status: 'SKIPPED', reason: 'Vuot hard cap calo cua ngay.' });
                continue;
            }
            if (mealCalories + addCalories > budget.max) {
                results.push({ dayOfWeek, status: 'SKIPPED', reason: `Vuot nguong calo bua ${budget.max} kcal.` });
                continue;
            }
            const existing = await prisma.mealPlanDetail.findFirst({
                where: { mealPlanId, dayOfWeek, mealType, foodId },
            });
            if (existing) {
                const nextQuantity = Number((existing.quantity + quantity).toFixed(2));
                const updated = await prisma.mealPlanDetail.update({
                    where: { id: existing.id },
                    data: { quantity: nextQuantity },
                });
                results.push({
                    dayOfWeek,
                    status: 'APPLIED',
                    detailId: updated.id,
                    mutation: 'UPDATED',
                    previousQuantity: existing.quantity,
                    appliedQuantity: quantity,
                    newQuantity: nextQuantity,
                });
            }
            else {
                const created = await prisma.mealPlanDetail.create({
                    data: { mealPlanId, dayOfWeek, mealType, foodId, quantity },
                });
                results.push({
                    dayOfWeek,
                    status: 'APPLIED',
                    detailId: created.id,
                    mutation: 'CREATED',
                    previousQuantity: 0,
                    appliedQuantity: quantity,
                    newQuantity: quantity,
                });
            }
        }
        return res.json({
            success: true,
            data: {
                mealPlanId,
                foodId,
                mealType,
                quantity,
                targetCalories,
                hardDailyCap,
                results,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.applyRecommendationToMealPlanDays = applyRecommendationToMealPlanDays;
const rollbackMealPlanApply = async (req, res) => {
    try {
        const userId = req.user.id;
        const mealPlanId = Number(req.body?.mealPlanId || 0);
        const operations = Array.isArray(req.body?.operations) ? req.body.operations : [];
        if (!mealPlanId || !operations.length) {
            return res.status(400).json({ error: 'mealPlanId and operations are required' });
        }
        const mealPlan = await prisma.mealPlan.findFirst({ where: { id: mealPlanId, userId } });
        if (!mealPlan)
            return res.status(404).json({ error: 'Meal plan not found' });
        const results = [];
        // Roll back in reverse order to correctly restore when the same detail is updated multiple times in one batch.
        for (const op of [...operations].reverse()) {
            const detailId = Number(op?.detailId || 0);
            const mutation = String(op?.mutation || '');
            const previousQuantity = Number(op?.previousQuantity || 0);
            const appliedQuantity = Number(op?.appliedQuantity || 0);
            if (!detailId || !['CREATED', 'UPDATED'].includes(mutation)) {
                continue;
            }
            const detail = await prisma.mealPlanDetail.findFirst({ where: { id: detailId, mealPlanId } });
            if (!detail) {
                results.push({ detailId, status: 'SKIPPED', reason: 'Detail not found' });
                continue;
            }
            if (mutation === 'CREATED') {
                await prisma.mealPlanDetail.delete({ where: { id: detailId } });
                results.push({ detailId, status: 'ROLLED_BACK' });
                continue;
            }
            const targetQuantity = Number.isFinite(previousQuantity)
                ? previousQuantity
                : Number((detail.quantity - appliedQuantity).toFixed(2));
            if (targetQuantity <= 0) {
                await prisma.mealPlanDetail.delete({ where: { id: detailId } });
            }
            else {
                await prisma.mealPlanDetail.update({
                    where: { id: detailId },
                    data: { quantity: Number(targetQuantity.toFixed(2)) },
                });
            }
            results.push({ detailId, status: 'ROLLED_BACK' });
        }
        return res.json({ success: true, data: { mealPlanId, results } });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.rollbackMealPlanApply = rollbackMealPlanApply;
const respondToRecommendation = async (req, res) => {
    try {
        const userId = req.user.id;
        const recommendationId = parseInt(req.params.id);
        const accepted = Boolean(req.body.accepted);
        const dryRun = Boolean(req.body.dryRun);
        const recommendation = await prisma.recommendation.findFirst({
            where: { id: recommendationId, userId },
            include: { food: true },
        });
        if (!recommendation)
            return res.status(404).json({ error: 'Recommendation not found' });
        let createdMeal = null;
        let syncedMealPlanDetail = null;
        let mealPlanApplyOperation = null;
        let calorieWarning = null;
        if (accepted) {
            const today = startOfToday();
            const [profile, activeGoal, todayNutrition] = await Promise.all([
                prisma.userProfile.findUnique({ where: { userId } }),
                prisma.userGoal.findFirst({
                    where: { userId },
                    orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
                }),
                prisma.dailyNutrition.findUnique({
                    where: { userId_date: { userId, date: today } },
                }).catch(() => null),
            ]);
            const requestedMealType = String(req.body.mealType || '').toUpperCase();
            const mealType = Object.values(client_1.MealType).includes(requestedMealType)
                ? requestedMealType
                : inferMealTypeFromReason(recommendation.reason);
            const requestedQuantity = Number(req.body.quantity);
            const quantity = Number.isFinite(requestedQuantity) && requestedQuantity > 0
                ? clamp(requestedQuantity, 0.25, 3)
                : inferPortionFromReason(recommendation.reason);
            const addedCalories = Math.round(Number(recommendation.food.calories || 0) * quantity);
            const currentCalories = Number(todayNutrition?.totalCalories || 0);
            const dailyCalorieTarget = estimateDailyCalories(profile, activeGoal);
            const projectedCalories = currentCalories + addedCalories;
            const overBy = projectedCalories - dailyCalorieTarget;
            if (overBy > 0) {
                calorieWarning = {
                    type: 'OVER_DAILY_TARGET',
                    message: `Bua an nay co the vuot muc tieu ngay khoang ${Math.round(overBy)} kcal.`,
                    dailyCalorieTarget,
                    currentCalories,
                    addedCalories,
                    projectedCalories,
                    overBy: Math.round(overBy),
                };
            }
            else if (projectedCalories >= dailyCalorieTarget * 0.9) {
                calorieWarning = {
                    type: 'NEAR_DAILY_TARGET',
                    message: 'Ban da gan cham muc calo muc tieu trong ngay, nen can nhac cac bua con lai nhe hon.',
                    dailyCalorieTarget,
                    currentCalories,
                    addedCalories,
                    projectedCalories,
                    overBy: 0,
                };
            }
            if (dryRun) {
                return res.json({
                    success: true,
                    data: {
                        recommendation,
                        meal: null,
                        warning: calorieWarning,
                        preview: {
                            mealType,
                            quantity,
                            addedCalories,
                            dailyCalorieTarget,
                            currentCalories,
                            projectedCalories,
                        },
                    },
                });
            }
            const planForSync = await prisma.mealPlan.findFirst({
                where: { userId },
                orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
                select: { id: true },
            });
            createdMeal = await prisma.meal.create({
                data: {
                    userId,
                    foodId: recommendation.foodId,
                    mealPlanId: planForSync?.id ?? null,
                    mealType,
                    eatenAt: new Date(),
                    quantity,
                    calories: addedCalories,
                    protein: Number(recommendation.food.protein || 0) * quantity,
                    fat: Number(recommendation.food.fat || 0) * quantity,
                    carbs: Number(recommendation.food.carbs || 0) * quantity,
                    notes: `Added from recommendation #${recommendation.id}`,
                    isFromAI: true,
                },
                include: { food: true },
            });
            if (planForSync) {
                const dayOfWeek = getAppDayOfWeek(createdMeal.eatenAt);
                const existingDetail = await prisma.mealPlanDetail.findFirst({
                    where: {
                        mealPlanId: planForSync.id,
                        foodId: recommendation.foodId,
                        mealType,
                        dayOfWeek,
                    },
                });
                if (existingDetail) {
                    const nextQuantity = Number((existingDetail.quantity + quantity).toFixed(2));
                    syncedMealPlanDetail = await prisma.mealPlanDetail.update({
                        where: { id: existingDetail.id },
                        data: { quantity: nextQuantity },
                        include: { food: true },
                    });
                    mealPlanApplyOperation = {
                        mealPlanId: planForSync.id,
                        detailId: existingDetail.id,
                        mutation: 'UPDATED',
                        previousQuantity: existingDetail.quantity,
                        appliedQuantity: quantity,
                    };
                }
                else {
                    syncedMealPlanDetail = await prisma.mealPlanDetail.create({
                        data: {
                            mealPlanId: planForSync.id,
                            foodId: recommendation.foodId,
                            mealType,
                            dayOfWeek,
                            quantity,
                        },
                        include: { food: true },
                    });
                    mealPlanApplyOperation = {
                        mealPlanId: planForSync.id,
                        detailId: syncedMealPlanDetail.id,
                        mutation: 'CREATED',
                        previousQuantity: 0,
                        appliedQuantity: quantity,
                    };
                }
            }
            await (0, nutrition_service_1.recalculateDailyNutrition)(userId, createdMeal.eatenAt);
        }
        const updated = await prisma.recommendation.update({
            where: { id: recommendationId },
            data: {
                isAccepted: accepted,
                isViewed: true,
            },
            include: { food: true },
        });
        res.json({
            success: true,
            data: {
                recommendation: updated,
                meal: createdMeal,
                mealPlanDetail: syncedMealPlanDetail,
                mealPlanApplyOperation,
                warning: calorieWarning,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.respondToRecommendation = respondToRecommendation;
