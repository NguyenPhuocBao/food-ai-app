"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAutoMealPlan = exports.applyActiveMealPlanToday = exports.getMealPlanInsights = exports.resetShoppingListChecks = exports.toggleShoppingListItem = exports.getMealPlanShoppingList = exports.deleteMealPlan = exports.setActiveMealPlan = exports.addDetailToMealPlan = exports.createMealPlan = exports.getActiveMealPlan = exports.getMealPlans = void 0;
const client_1 = require("@prisma/client");
const timezone_util_1 = require("../utils/timezone.util");
const nutrition_service_1 = require("../services/nutrition.service");
const prisma = new client_1.PrismaClient();
const SHOPPING_LIST_KEY_PREFIX = 'shopping_list';
const getShoppingListKey = (userId, mealPlanId) => `${SHOPPING_LIST_KEY_PREFIX}:user:${userId}:plan:${mealPlanId}`;
const normalizeToken = (value) => value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '');
const toShoppingItemKey = (name, unit) => `${normalizeToken(name)}__${normalizeToken(unit || 'item')}`;
const AUTO_MEAL_TYPES = [client_1.MealType.BREAKFAST, client_1.MealType.LUNCH, client_1.MealType.DINNER, client_1.MealType.SNACK];
const MEAL_CALORIE_RATIO = {
    [client_1.MealType.BREAKFAST]: 0.25,
    [client_1.MealType.LUNCH]: 0.35,
    [client_1.MealType.DINNER]: 0.3,
    [client_1.MealType.SNACK]: 0.1,
};
const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 };
const WEIGHT_LOSS_OBESE_BMI_THRESHOLD = 27.5;
const MIN_WEIGHT_LOSS_CALORIES = 1200;
const normalizeGoalTemplate = (value, fallback) => {
    if (!value || value === 'AUTO')
        return fallback;
    if (value === client_1.GoalType.WEIGHT_LOSS)
        return client_1.GoalType.WEIGHT_LOSS;
    if (value === client_1.GoalType.WEIGHT_GAIN)
        return client_1.GoalType.WEIGHT_GAIN;
    if (value === client_1.GoalType.MAINTENANCE)
        return client_1.GoalType.MAINTENANCE;
    if (value === client_1.GoalType.MUSCLE_GAIN)
        return client_1.GoalType.MUSCLE_GAIN;
    return fallback;
};
const normalizeMacroStrategy = (value) => {
    if (value === 'BALANCED')
        return 'BALANCED';
    if (value === 'HIGH_PROTEIN')
        return 'HIGH_PROTEIN';
    if (value === 'LOW_CARB')
        return 'LOW_CARB';
    return 'AUTO';
};
const toPositiveNumber = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0)
        return undefined;
    return parsed;
};
const toValidWeight = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 30 || parsed > 300)
        return undefined;
    return parsed;
};
const roundToHalf = (value) => Math.round(value * 2) / 2;
const clampDays = (value) => {
    if (!Number.isFinite(value))
        return 7;
    if (value < 1)
        return 1;
    if (value > 14)
        return 14;
    return Math.floor(value);
};
const toStartOfDay = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate());
const addDays = (value, days) => {
    const result = new Date(value);
    result.setDate(result.getDate() + days);
    return result;
};
const MEAL_DEFAULT_HOUR = {
    [client_1.MealType.BREAKFAST]: 8,
    [client_1.MealType.LUNCH]: 12,
    [client_1.MealType.DINNER]: 19,
    [client_1.MealType.SNACK]: 16,
};
const applyMacroRatio = (calories, ratio) => ({
    calories,
    protein: Number(((calories * ratio.protein) / CALORIES_PER_GRAM.protein).toFixed(1)),
    carbs: Number(((calories * ratio.carbs) / CALORIES_PER_GRAM.carbs).toFixed(1)),
    fat: Number(((calories * ratio.fat) / CALORIES_PER_GRAM.fat).toFixed(1)),
});
const getBaseRatioByGoalType = (goalType) => {
    switch (goalType) {
        case client_1.GoalType.WEIGHT_LOSS:
            return { protein: 0.45, carbs: 0.25, fat: 0.3 };
        case client_1.GoalType.WEIGHT_GAIN:
            return { protein: 0.25, carbs: 0.5, fat: 0.25 };
        case client_1.GoalType.MUSCLE_GAIN:
            return { protein: 0.35, carbs: 0.45, fat: 0.2 };
        case client_1.GoalType.MAINTENANCE:
        default:
            return { protein: 0.3, carbs: 0.4, fat: 0.3 };
    }
};
const applyMacroStrategy = (base, strategy) => {
    if (strategy === 'HIGH_PROTEIN')
        return { protein: 0.4, carbs: 0.3, fat: 0.3 };
    if (strategy === 'LOW_CARB')
        return { protein: 0.35, carbs: 0.25, fat: 0.4 };
    if (strategy === 'BALANCED')
        return { protein: 0.3, carbs: 0.4, fat: 0.3 };
    return base;
};
const buildWeightBasedMacroTargets = (params) => {
    if (!params.currentWeight)
        return null;
    const weight = toValidWeight(params.currentWeight);
    if (!weight)
        return null;
    let proteinPerKg = 1.6;
    let fatPerKg = 0.8;
    switch (params.goalType) {
        case client_1.GoalType.WEIGHT_LOSS:
            proteinPerKg = 1.9;
            fatPerKg = 0.65;
            break;
        case client_1.GoalType.WEIGHT_GAIN:
            proteinPerKg = 1.7;
            fatPerKg = 1;
            break;
        case client_1.GoalType.MUSCLE_GAIN:
            proteinPerKg = 2;
            fatPerKg = 0.8;
            break;
        case client_1.GoalType.MAINTENANCE:
        default:
            proteinPerKg = 1.6;
            fatPerKg = 0.85;
            break;
    }
    let protein = weight * proteinPerKg;
    let fat = weight * fatPerKg;
    let carbs = (params.calories - protein * CALORIES_PER_GRAM.protein - fat * CALORIES_PER_GRAM.fat) / CALORIES_PER_GRAM.carbs;
    if (params.goalType === client_1.GoalType.WEIGHT_LOSS)
        carbs = Math.max(70, carbs);
    if (params.goalType === client_1.GoalType.WEIGHT_GAIN)
        carbs = Math.max(220, carbs);
    if (params.goalType === client_1.GoalType.MUSCLE_GAIN)
        carbs = Math.max(180, carbs);
    if (params.goalType === client_1.GoalType.MAINTENANCE || !params.goalType)
        carbs = Math.max(130, carbs);
    // Keep macro targets within practical bounds.
    protein = Math.max(70, Math.min(260, protein));
    fat = Math.max(35, Math.min(120, fat));
    carbs = Math.max(70, Math.min(560, carbs));
    return {
        protein: Number(protein.toFixed(1)),
        fat: Number(fat.toFixed(1)),
        carbs: Number(carbs.toFixed(1)),
    };
};
const buildDailyMacroTargets = (params) => {
    const ratio = applyMacroStrategy(getBaseRatioByGoalType(params.goalType), params.macroStrategy);
    const auto = applyMacroRatio(params.calories, ratio);
    const weightBased = buildWeightBasedMacroTargets({
        calories: params.calories,
        goalType: params.goalType,
        currentWeight: params.currentWeight,
    });
    return {
        calories: params.calories,
        protein: Number((params.targetProtein ??
            weightBased?.protein ??
            params.fallbackProtein ??
            auto.protein).toFixed(1)),
        fat: Number((params.targetFat ??
            weightBased?.fat ??
            params.fallbackFat ??
            auto.fat).toFixed(1)),
        carbs: Number((params.targetCarbs ??
            weightBased?.carbs ??
            params.fallbackCarbs ??
            auto.carbs).toFixed(1)),
    };
};
const toMealMacroTargets = (daily, mealType) => {
    const ratio = MEAL_CALORIE_RATIO[mealType] || 0.25;
    return {
        calories: Number((daily.calories * ratio).toFixed(1)),
        protein: Number((daily.protein * ratio).toFixed(1)),
        fat: Number((daily.fat * ratio).toFixed(1)),
        carbs: Number((daily.carbs * ratio).toFixed(1)),
    };
};
const calculateBmi = (weightKg, heightCm) => {
    if (!weightKg || !heightCm)
        return null;
    const heightM = heightCm / 100;
    if (!Number.isFinite(heightM) || heightM <= 0)
        return null;
    return Number((weightKg / (heightM * heightM)).toFixed(1));
};
const resolveWeightLossCalories = (baseCalories, goalType, bmi, hasOverride = false) => {
    if (goalType !== client_1.GoalType.WEIGHT_LOSS)
        return baseCalories;
    if (hasOverride)
        return baseCalories;
    if (bmi && bmi >= WEIGHT_LOSS_OBESE_BMI_THRESHOLD) {
        return Math.max(MIN_WEIGHT_LOSS_CALORIES, Math.round(baseCalories * 0.82));
    }
    return Math.max(MIN_WEIGHT_LOSS_CALORIES, Math.round(baseCalories * 0.9));
};
const shouldDisableSnackForWeightLoss = (goalType, bmi) => goalType === client_1.GoalType.WEIGHT_LOSS && !!bmi && bmi >= WEIGHT_LOSS_OBESE_BMI_THRESHOLD;
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
const attachFoodPlanningMeta = async (foods) => {
    const meta = await loadFoodPlanningMeta(foods.map((food) => food.id));
    return foods.map((food) => ({ ...food, ...(meta.get(food.id) || {}) }));
};
const normalizeSearchText = (value) => (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
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
    'sua',
];
const WHITE_RICE_KEYWORDS = ['com trang', 'white rice'];
const STAPLE_DISH_KEYWORDS = [
    'com',
    'rice',
    'gao',
    'bun',
    'pho',
    'mien',
    'mi ',
    'my ',
    'noodle',
    'xoi',
    'banh mi',
    'bread',
    'pasta',
    'spaghetti',
    'khoai',
    'potato',
    'oat',
    'yen mach',
];
const GOAL_CATEGORY_KEYWORDS = {
    weightLoss: ['giam can', 'weight loss', 'low calorie', 'healthy', 'eat clean', 'it calo'],
    weightGain: ['tang can', 'weight gain', 'high calorie', 'bulk'],
    muscleGain: ['tang co', 'muscle', 'gym', 'protein'],
    vegetarian: ['chay', 'vegetarian', 'vegan'],
};
const SOUP_DISH_KEYWORDS = ['canh', 'soup', 'broth', 'nuoc dung', 'nuoc leo'];
const HOTPOT_KEYWORDS = ['lau', 'hotpot'];
const HEALTHY_COOKING_KEYWORDS = ['luoc', 'hap', 'nuong', 'boiled', 'steamed', 'grilled'];
const OILY_COOKING_KEYWORDS = ['chien', 'xao', 'fried', 'deep fry', 'ran'];
const FRUIT_DESSERT_KEYWORDS = [
    'trai cay',
    'hoa qua',
    'fruit',
    'chuoi',
    'tao',
    'cam',
    'xoai',
    'dua hau',
    'nho',
    'kiwi',
    'le',
    'oi',
    'dao',
    'man',
];
const DRINK_KEYWORDS = ['nuoc', 'drink', 'juice', 'smoothie', 'tea', 'coffee', 'cafe', 'sinh to', 'tra', 'sua'];
const toFoodSearchText = (food) => normalizeSearchText(`${food.name} ${food.category || ''} ${food.description || ''}`);
const hasFoodRole = (food, role) => (food.mealRoles || []).includes(role);
const hasFoodMealTime = (food, mealType) => (food.mealTimeTags || []).includes(mealType);
const hasFoodGoalTag = (food, goalType) => !goalType || !(food.goalTags || []).length || (food.goalTags || []).includes(goalType);
const isFruitOrDrinkFood = (food) => {
    if (hasFoodRole(food, 'DESSERT') || hasFoodRole(food, 'DRINK'))
        return true;
    const text = toFoodSearchText(food);
    return FRUIT_DRINK_KEYWORDS.some((keyword) => text.includes(keyword));
};
const isWhiteRiceFood = (food) => {
    if (hasFoodRole(food, 'STAPLE') && normalizeSearchText(food.name).includes('com'))
        return true;
    const text = toFoodSearchText(food);
    return WHITE_RICE_KEYWORDS.some((keyword) => text.includes(keyword));
};
const isStapleDishFood = (food) => {
    if (hasFoodRole(food, 'STAPLE') || food.portionType === 'FULL_MEAL')
        return true;
    const text = toFoodSearchText(food);
    return STAPLE_DISH_KEYWORDS.some((keyword) => text.includes(keyword));
};
const isGoalCategoryCompatible = (food, goalType) => {
    if (!goalType)
        return true;
    if (!hasFoodGoalTag(food, goalType))
        return false;
    const text = toFoodSearchText(food);
    const isWeightGainTagged = GOAL_CATEGORY_KEYWORDS.weightGain.some((keyword) => text.includes(keyword));
    const isWeightLossTagged = GOAL_CATEGORY_KEYWORDS.weightLoss.some((keyword) => text.includes(keyword));
    const isMuscleTagged = GOAL_CATEGORY_KEYWORDS.muscleGain.some((keyword) => text.includes(keyword));
    if (goalType === client_1.GoalType.WEIGHT_LOSS) {
        return !isWeightGainTagged && !isMuscleTagged;
    }
    if (goalType === client_1.GoalType.WEIGHT_GAIN) {
        return !isWeightLossTagged;
    }
    if (goalType === client_1.GoalType.MUSCLE_GAIN) {
        return !isWeightLossTagged || isMuscleTagged;
    }
    return true;
};
const isFruitDessertFood = (food) => {
    if (hasFoodRole(food, 'DESSERT'))
        return true;
    const text = toFoodSearchText(food);
    const isFruit = FRUIT_DESSERT_KEYWORDS.some((keyword) => text.includes(keyword));
    const isDrink = DRINK_KEYWORDS.some((keyword) => text.includes(keyword));
    return isFruit && !isDrink;
};
const isSoupDishFood = (food) => {
    if (hasFoodRole(food, 'SOUP'))
        return true;
    const text = toFoodSearchText(food);
    return SOUP_DISH_KEYWORDS.some((keyword) => text.includes(keyword));
};
const isHotpotFood = (food) => {
    const text = toFoodSearchText(food);
    return HOTPOT_KEYWORDS.some((keyword) => text.includes(keyword));
};
const isHealthyCookingFood = (food) => {
    if (['BOILED', 'STEAMED', 'GRILLED', 'RAW', 'SOUP'].includes(food.cookingMethod || ''))
        return true;
    const text = toFoodSearchText(food);
    return HEALTHY_COOKING_KEYWORDS.some((keyword) => text.includes(keyword));
};
const isOilyCookingFood = (food) => {
    if (['FRIED', 'STIR_FRIED'].includes(food.cookingMethod || ''))
        return true;
    const text = toFoodSearchText(food);
    return OILY_COOKING_KEYWORDS.some((keyword) => text.includes(keyword));
};
const resolveRiceSidePortion = (goalType) => {
    if (goalType === client_1.GoalType.WEIGHT_GAIN || goalType === client_1.GoalType.MUSCLE_GAIN)
        return 1;
    return 0.5;
};
const resolveFruitDessertPortion = (goalType) => {
    if (goalType === client_1.GoalType.WEIGHT_GAIN || goalType === client_1.GoalType.MUSCLE_GAIN)
        return 1;
    return 0.5;
};
const resolveDryDishPortion = (goalType) => {
    if (goalType === client_1.GoalType.WEIGHT_LOSS)
        return 0.75;
    if (goalType === client_1.GoalType.WEIGHT_GAIN || goalType === client_1.GoalType.MUSCLE_GAIN)
        return 1;
    return 1;
};
const resolveSoupDishPortion = (goalType) => {
    if (goalType === client_1.GoalType.WEIGHT_GAIN || goalType === client_1.GoalType.MUSCLE_GAIN)
        return 1;
    return 1;
};
const resolveExtraMainPortion = (goalType) => {
    if (goalType === client_1.GoalType.WEIGHT_GAIN)
        return 0.75;
    return 0.5;
};
const scaleMacroTargets = (target, ratio) => ({
    calories: Number((target.calories * ratio).toFixed(1)),
    protein: Number((target.protein * ratio).toFixed(1)),
    fat: Number((target.fat * ratio).toFixed(1)),
    carbs: Number((target.carbs * ratio).toFixed(1)),
});
const pickLeastUsedFood = (candidates, usedCounter, excludedIds = new Set()) => {
    const pool = candidates.filter((item) => !excludedIds.has(item.id));
    if (!pool.length)
        return null;
    const ranked = pool
        .map((item) => ({ item, used: usedCounter.get(item.id) || 0 }))
        .sort((a, b) => a.used - b.used);
    const top = ranked.slice(0, Math.min(3, ranked.length));
    return top[Math.floor(Math.random() * top.length)]?.item || null;
};
const resolveMealQuantityByGoal = (food, goalType, rawQuantity) => {
    if (isFruitOrDrinkFood(food))
        return 1;
    if (goalType === client_1.GoalType.WEIGHT_LOSS && isStapleDishFood(food))
        return 0.5;
    if (goalType === client_1.GoalType.WEIGHT_LOSS)
        return 0.5;
    if (goalType === client_1.GoalType.MAINTENANCE)
        return 1;
    if (goalType === client_1.GoalType.WEIGHT_GAIN || goalType === client_1.GoalType.MUSCLE_GAIN) {
        const candidate = roundToHalf(rawQuantity);
        return Math.max(1.5, Math.min(3, candidate));
    }
    return Math.max(0.5, Math.min(3, roundToHalf(rawQuantity)));
};
const GOAL_KEYWORDS = {
    weightLossPositive: ['salad', 'rau', 'luoc', 'hap', 'nuong', 'boiled', 'steamed', 'grilled', 'canh'],
    weightLossNegative: ['chien', 'xao', 'fried', 'xoi', 'mi goi', 'kem', 'tra sua', 'sua dac', 'lau', 'hotpot'],
    weightGainPositive: ['com', 'gao', 'khoai', 'pasta', 'yogurt', 'bo', 'trung', 'hat', 'banh mi', 'oat'],
};
const matchKeyword = (text, keywords) => keywords.some((keyword) => text.includes(keyword));
const filterFoodsByGoal = (foods, goalType, mealType) => {
    if (!goalType)
        return foods;
    const filtered = foods.filter((food) => {
        const calories = Number(food.calories || 0);
        const fat = Number(food.fat || 0);
        const carbs = Number(food.carbs || 0);
        const protein = Number(food.protein || 0);
        if (goalType === client_1.GoalType.WEIGHT_LOSS) {
            if (!isGoalCategoryCompatible(food, goalType))
                return false;
            if (calories <= 0)
                return false;
            if (mealType === client_1.MealType.SNACK && calories > 320)
                return false;
            if (mealType !== client_1.MealType.SNACK && calories > 650)
                return false;
            if (fat > 28)
                return false;
            if ((mealType === client_1.MealType.LUNCH || mealType === client_1.MealType.DINNER) && carbs > 75)
                return false;
            if (protein < 8)
                return false;
            if (isOilyCookingFood(food))
                return false;
            if (isHotpotFood(food))
                return false;
        }
        if (goalType === client_1.GoalType.WEIGHT_GAIN) {
            if (!isGoalCategoryCompatible(food, goalType))
                return false;
            if (calories < 180)
                return false;
            if (protein < 6)
                return false;
        }
        if (goalType === client_1.GoalType.MUSCLE_GAIN) {
            if (!isGoalCategoryCompatible(food, goalType))
                return false;
            if (protein < 12)
                return false;
            if (calories < 150)
                return false;
        }
        return true;
    });
    if (filtered.length === 0)
        return foods;
    if (goalType === client_1.GoalType.WEIGHT_LOSS)
        return filtered;
    return filtered.length >= 8 ? filtered : foods;
};
const goalFitPenalty = (food, goalType, mealType) => {
    if (!goalType)
        return 0;
    const calories = Number(food.calories || 0);
    const protein = Number(food.protein || 0);
    const fat = Number(food.fat || 0);
    const carbs = Number(food.carbs || 0);
    const totalCalories = Math.max(1, calories);
    const proteinDensity = protein / totalCalories;
    const fatRatioByCalories = (fat * CALORIES_PER_GRAM.fat) / totalCalories;
    const carbRatioByCalories = (carbs * CALORIES_PER_GRAM.carbs) / totalCalories;
    const text = normalizeSearchText(`${food.name} ${food.category || ''} ${food.description || ''}`);
    let penalty = 0;
    if (goalType === client_1.GoalType.WEIGHT_LOSS) {
        if (!isGoalCategoryCompatible(food, goalType))
            penalty += 260;
        if (proteinDensity < 0.08)
            penalty += 100;
        if (fatRatioByCalories > 0.38)
            penalty += 90;
        if (carbRatioByCalories > 0.55)
            penalty += 70;
        if (mealType === client_1.MealType.DINNER && isStapleDishFood(food))
            penalty += 130;
        if (mealType === client_1.MealType.SNACK && calories > 260)
            penalty += 110;
        if (matchKeyword(text, GOAL_KEYWORDS.weightLossPositive))
            penalty -= 65;
        if (matchKeyword(text, GOAL_KEYWORDS.weightLossNegative))
            penalty += 120;
        if (isHealthyCookingFood(food))
            penalty -= 90;
        if (isOilyCookingFood(food))
            penalty += 140;
        if (isHotpotFood(food))
            penalty += 220;
    }
    if (goalType === client_1.GoalType.WEIGHT_GAIN) {
        if (!isGoalCategoryCompatible(food, goalType))
            penalty += 180;
        if (calories < 260)
            penalty += 80;
        if (protein < 12)
            penalty += 70;
        if (carbs < 24)
            penalty += 60;
        if (matchKeyword(text, GOAL_KEYWORDS.weightGainPositive))
            penalty -= 55;
    }
    if (goalType === client_1.GoalType.MUSCLE_GAIN) {
        if (!isGoalCategoryCompatible(food, goalType))
            penalty += 180;
        if (proteinDensity < 0.095)
            penalty += 120;
        if (protein < 18)
            penalty += 80;
        if (carbs < 20)
            penalty += 45;
        if (fatRatioByCalories > 0.45)
            penalty += 55;
    }
    return penalty;
};
const pickFoodFromPool = (pool, mealType, target, usedCounter, goalType, mealTypeUsedCounter) => {
    if (!pool.length)
        return null;
    const scored = pool
        .map((food) => {
        const used = usedCounter.get(food.id) || 0;
        const suggestedQuantity = Math.max(0.5, Math.min(3, roundToHalf(target.calories / Number(food.calories || 1))));
        const predictedCalories = Number(food.calories || 0) * suggestedQuantity;
        const predictedProtein = Number(food.protein || 0) * suggestedQuantity;
        const predictedFat = Number(food.fat || 0) * suggestedQuantity;
        const predictedCarbs = Number(food.carbs || 0) * suggestedQuantity;
        const calorieGap = Math.abs(predictedCalories - target.calories);
        const proteinGap = Math.abs(predictedProtein - target.protein) * 5;
        const fatGap = Math.abs(predictedFat - target.fat) * 4;
        const carbsGap = Math.abs(predictedCarbs - target.carbs) * 3;
        const sameMealUsed = mealTypeUsedCounter?.get(food.id) || 0;
        const varietyPenalty = used * 180 + sameMealUsed * 260;
        const snackPenalty = mealType === client_1.MealType.SNACK && Number(food.calories || 0) > 450 ? 180 : 0;
        const fitPenalty = goalFitPenalty(food, goalType, mealType);
        const score = calorieGap + proteinGap + fatGap + carbsGap + varietyPenalty + snackPenalty + fitPenalty;
        return { food, score };
    })
        .sort((a, b) => a.score - b.score);
    const topCandidates = scored.slice(0, Math.min(5, scored.length));
    if (!topCandidates.length)
        return null;
    return topCandidates[Math.floor(Math.random() * topCandidates.length)].food;
};
const pickFoodForMeal = (foods, mealType, target, usedCounter, goalType, mealTypeUsedCounter) => {
    const keywordsByMeal = {
        [client_1.MealType.BREAKFAST]: ['sang', 'breakfast'],
        [client_1.MealType.LUNCH]: ['trua', 'lunch'],
        [client_1.MealType.DINNER]: ['toi', 'dinner'],
        [client_1.MealType.SNACK]: ['snack', 'fruit', 'dessert'],
    };
    const keywords = keywordsByMeal[mealType];
    const taggedForMeal = foods.filter((food) => hasFoodMealTime(food, mealType));
    const byCategory = foods.filter((food) => {
        const category = (food.category || '').toLowerCase();
        return keywords.some((keyword) => category.includes(keyword));
    });
    const basePool = taggedForMeal.length >= 3 ? taggedForMeal : byCategory.length >= 5 ? byCategory : foods;
    const pool = filterFoodsByGoal(basePool, goalType, mealType);
    return pickFoodFromPool(pool, mealType, target, usedCounter, goalType, mealTypeUsedCounter);
};
const getAppDayOfWeek = (value) => {
    const [year, month, day] = (0, timezone_util_1.toAppDateKey)(value).split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};
const loadCheckedItemKeys = async (userId, mealPlanId) => {
    const row = await prisma.systemSetting.findUnique({
        where: { key: getShoppingListKey(userId, mealPlanId) },
        select: { value: true },
    });
    if (!row?.value)
        return new Set();
    try {
        const parsed = JSON.parse(row.value);
        if (!Array.isArray(parsed))
            return new Set();
        return new Set(parsed.filter((value) => typeof value === 'string'));
    }
    catch {
        return new Set();
    }
};
const saveCheckedItemKeys = async (userId, mealPlanId, checkedKeys) => {
    const key = getShoppingListKey(userId, mealPlanId);
    await prisma.systemSetting.upsert({
        where: { key },
        update: {
            value: JSON.stringify(Array.from(checkedKeys)),
            group: 'shopping_list',
        },
        create: {
            key,
            value: JSON.stringify(Array.from(checkedKeys)),
            group: 'shopping_list',
        },
    });
};
// Lấy tất cả meal plans của user
const getMealPlans = async (req, res) => {
    try {
        const userId = req.user.id;
        const plans = await prisma.mealPlan.findMany({
            where: { userId },
            include: {
                details: {
                    include: { food: true },
                    orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: plans });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMealPlans = getMealPlans;
// Lấy meal plan đang active
const getActiveMealPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        const plan = await prisma.mealPlan.findFirst({
            where: { userId, isActive: true },
            include: {
                details: {
                    include: { food: true },
                    orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
                },
            },
        });
        res.json({ success: true, data: plan });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getActiveMealPlan = getActiveMealPlan;
// Tạo meal plan mới
const createMealPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, startDate, endDate } = req.body;
        if (!name || !startDate || !endDate) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: name, startDate, endDate' });
        }
        const plan = await prisma.mealPlan.create({
            data: {
                userId,
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: false,
            },
            include: { details: { include: { food: true } } },
        });
        res.json({ success: true, data: plan });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createMealPlan = createMealPlan;
// Thêm món vào meal plan
const addDetailToMealPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { foodId, mealType, dayOfWeek, quantity } = req.body;
        const plan = await prisma.mealPlan.findFirst({ where: { id: parseInt(id), userId } });
        if (!plan)
            return res.status(404).json({ error: 'Meal plan not found' });
        const detail = await prisma.mealPlanDetail.create({
            data: {
                mealPlanId: parseInt(id),
                foodId,
                mealType,
                dayOfWeek,
                quantity: quantity || 1,
            },
            include: { food: true },
        });
        res.json({ success: true, data: detail });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addDetailToMealPlan = addDetailToMealPlan;
// Bật/tắt meal plan (set active)
const setActiveMealPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const plan = await prisma.mealPlan.findFirst({ where: { id: parseInt(id), userId } });
        if (!plan)
            return res.status(404).json({ error: 'Meal plan not found' });
        // Tắt tất cả plan khác của user
        await prisma.mealPlan.updateMany({ where: { userId }, data: { isActive: false } });
        // Bật plan được chọn
        const updated = await prisma.mealPlan.update({
            where: { id: parseInt(id) },
            data: { isActive: true },
            include: { details: { include: { food: true } } },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.setActiveMealPlan = setActiveMealPlan;
// Xoá meal plan
const deleteMealPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const plan = await prisma.mealPlan.findFirst({ where: { id: parseInt(id), userId } });
        if (!plan)
            return res.status(404).json({ error: 'Meal plan not found' });
        await prisma.mealPlan.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Meal plan deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteMealPlan = deleteMealPlan;
const getMealPlanShoppingList = async (req, res) => {
    try {
        const userId = req.user.id;
        const mealPlanId = parseInt(req.params.id, 10);
        const dayOfWeekRaw = req.query.dayOfWeek;
        if (!Number.isFinite(mealPlanId)) {
            return res.status(400).json({ error: 'Invalid meal plan id' });
        }
        const dayOfWeek = dayOfWeekRaw !== undefined && dayOfWeekRaw !== null && dayOfWeekRaw !== ''
            ? Number(dayOfWeekRaw)
            : null;
        if (dayOfWeek !== null && (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6)) {
            return res.status(400).json({ error: 'dayOfWeek must be between 0 and 6' });
        }
        const plan = await prisma.mealPlan.findFirst({
            where: { id: mealPlanId, userId },
            include: {
                details: {
                    include: {
                        food: {
                            include: {
                                recipe: {
                                    include: {
                                        ingredients: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
                },
            },
        });
        if (!plan) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }
        const details = dayOfWeek === null ? plan.details : plan.details.filter((detail) => detail.dayOfWeek === dayOfWeek);
        const itemMap = new Map();
        for (const detail of details) {
            const foodName = detail.food?.name || 'Unknown food';
            const quantityMultiplier = Number(detail.quantity || 1);
            const ingredients = detail.food?.recipe?.ingredients || [];
            if (ingredients.length > 0) {
                for (const ingredient of ingredients) {
                    const unit = ingredient.unit || 'item';
                    const itemKey = toShoppingItemKey(ingredient.name, unit);
                    const baseAmount = Number(ingredient.amount || 0);
                    const amount = Number((baseAmount * quantityMultiplier).toFixed(2));
                    if (!itemMap.has(itemKey)) {
                        itemMap.set(itemKey, {
                            itemKey,
                            name: ingredient.name,
                            unit,
                            amount: 0,
                            recipeCount: 0,
                        });
                    }
                    const current = itemMap.get(itemKey);
                    current.amount = Number((current.amount + amount).toFixed(2));
                    current.recipeCount += 1;
                }
            }
            else {
                const itemKey = toShoppingItemKey(foodName, 'khau phan');
                if (!itemMap.has(itemKey)) {
                    itemMap.set(itemKey, {
                        itemKey,
                        name: foodName,
                        unit: 'khau phan',
                        amount: 0,
                        recipeCount: 0,
                    });
                }
                const current = itemMap.get(itemKey);
                current.amount = Number((current.amount + quantityMultiplier).toFixed(2));
                current.recipeCount += 1;
            }
        }
        const checkedKeys = await loadCheckedItemKeys(userId, mealPlanId);
        const items = Array.from(itemMap.values())
            .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
            .map((item) => ({
            ...item,
            checked: checkedKeys.has(item.itemKey),
        }));
        const checkedCount = items.filter((item) => item.checked).length;
        res.json({
            success: true,
            data: {
                mealPlanId: plan.id,
                mealPlanName: plan.name,
                dayOfWeek,
                totalItems: items.length,
                checkedItems: checkedCount,
                completionRate: items.length ? Number(((checkedCount / items.length) * 100).toFixed(1)) : 0,
                items,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMealPlanShoppingList = getMealPlanShoppingList;
const toggleShoppingListItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const mealPlanId = parseInt(req.params.id, 10);
        const { itemKey, checked } = req.body;
        if (!Number.isFinite(mealPlanId)) {
            return res.status(400).json({ error: 'Invalid meal plan id' });
        }
        if (!itemKey || typeof itemKey !== 'string') {
            return res.status(400).json({ error: 'itemKey is required' });
        }
        const plan = await prisma.mealPlan.findFirst({
            where: { id: mealPlanId, userId },
            select: { id: true },
        });
        if (!plan)
            return res.status(404).json({ error: 'Meal plan not found' });
        const checkedKeys = await loadCheckedItemKeys(userId, mealPlanId);
        if (checked)
            checkedKeys.add(itemKey);
        else
            checkedKeys.delete(itemKey);
        await saveCheckedItemKeys(userId, mealPlanId, checkedKeys);
        res.json({ success: true, data: { itemKey, checked: !!checked } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.toggleShoppingListItem = toggleShoppingListItem;
const resetShoppingListChecks = async (req, res) => {
    try {
        const userId = req.user.id;
        const mealPlanId = parseInt(req.params.id, 10);
        if (!Number.isFinite(mealPlanId)) {
            return res.status(400).json({ error: 'Invalid meal plan id' });
        }
        const plan = await prisma.mealPlan.findFirst({
            where: { id: mealPlanId, userId },
            select: { id: true },
        });
        if (!plan)
            return res.status(404).json({ error: 'Meal plan not found' });
        await prisma.systemSetting.deleteMany({
            where: { key: getShoppingListKey(userId, mealPlanId) },
        });
        res.json({ success: true, message: 'Shopping list checks reset' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.resetShoppingListChecks = resetShoppingListChecks;
const getMealPlanInsights = async (req, res) => {
    try {
        const userId = req.user.id;
        const mealPlanId = parseInt(req.params.id, 10);
        if (!Number.isFinite(mealPlanId)) {
            return res.status(400).json({ error: 'Invalid meal plan id' });
        }
        const plan = await prisma.mealPlan.findFirst({
            where: { id: mealPlanId, userId },
            include: { details: true },
        });
        if (!plan)
            return res.status(404).json({ error: 'Meal plan not found' });
        const now = new Date();
        const appDayOfWeek = getAppDayOfWeek(now);
        const todayPlannedDetails = plan.details.filter((detail) => detail.dayOfWeek === appDayOfWeek);
        const { start, endExclusive } = (0, timezone_util_1.toAppDayRange)(now);
        const todayMeals = await prisma.meal.findMany({
            where: {
                userId,
                eatenAt: { gte: start, lt: endExclusive },
            },
            select: {
                foodId: true,
                mealType: true,
            },
        });
        const plannedSlotMap = new Map();
        todayPlannedDetails.forEach((detail) => {
            const key = `${detail.foodId}:${detail.mealType}`;
            plannedSlotMap.set(key, (plannedSlotMap.get(key) || 0) + 1);
        });
        let completed = 0;
        todayMeals.forEach((meal) => {
            const key = `${meal.foodId}:${meal.mealType}`;
            const remain = plannedSlotMap.get(key) || 0;
            if (remain > 0) {
                completed += 1;
                plannedSlotMap.set(key, remain - 1);
            }
        });
        const planned = todayPlannedDetails.length;
        res.json({
            success: true,
            data: {
                mealPlanId: plan.id,
                dateKey: (0, timezone_util_1.toAppDateKey)(now),
                plannedMealsToday: planned,
                completedMealsToday: completed,
                adherenceRateToday: planned > 0 ? Number(((completed / planned) * 100).toFixed(1)) : 0,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMealPlanInsights = getMealPlanInsights;
const applyActiveMealPlanToday = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const appDayOfWeek = getAppDayOfWeek(now);
        const { start, endExclusive } = (0, timezone_util_1.toAppDayRange)(now);
        const activePlan = await prisma.mealPlan.findFirst({
            where: { userId, isActive: true },
            include: {
                details: {
                    where: { dayOfWeek: appDayOfWeek },
                    include: { food: true },
                    orderBy: { mealType: 'asc' },
                },
            },
        });
        if (!activePlan) {
            return res.status(404).json({ error: 'No active meal plan found' });
        }
        if (!activePlan.details.length) {
            return res.status(400).json({
                error: 'Active meal plan has no meals for today',
                data: { mealPlanId: activePlan.id, dayOfWeek: appDayOfWeek },
            });
        }
        const existingMeals = await prisma.meal.findMany({
            where: {
                userId,
                eatenAt: { gte: start, lt: endExclusive },
            },
            select: {
                foodId: true,
                mealType: true,
            },
        });
        const existingCountMap = new Map();
        existingMeals.forEach((meal) => {
            const key = `${meal.foodId}:${meal.mealType}`;
            existingCountMap.set(key, (existingCountMap.get(key) || 0) + 1);
        });
        const consumedExistingMap = new Map();
        const createdMeals = [];
        const skippedMeals = [];
        const mealOrderMap = new Map();
        for (const detail of activePlan.details) {
            const key = `${detail.foodId}:${detail.mealType}`;
            const existing = existingCountMap.get(key) || 0;
            const consumed = consumedExistingMap.get(key) || 0;
            if (consumed < existing) {
                consumedExistingMap.set(key, consumed + 1);
                skippedMeals.push({
                    foodId: detail.foodId,
                    mealType: detail.mealType,
                    reason: 'already_exists_today',
                });
                continue;
            }
            const mealType = detail.mealType;
            const order = mealOrderMap.get(mealType) || 0;
            mealOrderMap.set(mealType, order + 1);
            const eatenAt = new Date(start.getTime() + (MEAL_DEFAULT_HOUR[mealType] * 60 + order * 15) * 60000);
            const quantity = Number(detail.quantity || 1);
            const meal = await prisma.meal.create({
                data: {
                    userId,
                    foodId: detail.foodId,
                    mealType,
                    eatenAt,
                    quantity,
                    calories: Math.round(Number(detail.food.calories || 0) * quantity),
                    protein: Number((Number(detail.food.protein || 0) * quantity).toFixed(2)),
                    fat: Number((Number(detail.food.fat || 0) * quantity).toFixed(2)),
                    carbs: Number((Number(detail.food.carbs || 0) * quantity).toFixed(2)),
                    notes: `Auto-applied from meal plan: ${activePlan.name}`,
                    isFromAI: true,
                },
            });
            createdMeals.push(meal);
        }
        await (0, nutrition_service_1.recalculateDailyNutrition)(userId, now);
        res.json({
            success: true,
            data: {
                mealPlanId: activePlan.id,
                mealPlanName: activePlan.name,
                appliedDate: (0, timezone_util_1.toAppDateKey)(now),
                createdCount: createdMeals.length,
                skippedCount: skippedMeals.length,
                skippedMeals,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.applyActiveMealPlanToday = applyActiveMealPlanToday;
const generateAutoMealPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, startDate, endDate, days, activate = true, includeSnack = true, goalTemplate = 'AUTO', macroStrategy = 'AUTO', targetCalories: targetCaloriesOverride, targetProtein: targetProteinOverride, targetFat: targetFatOverride, targetCarbs: targetCarbsOverride, } = req.body || {};
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                healthMetrics: {
                    where: { weight: { not: null } },
                    orderBy: { recordedAt: 'desc' },
                    take: 1,
                    select: { weight: true },
                },
                goals: {
                    where: { isActive: true },
                    orderBy: { startDate: 'desc' },
                    take: 1,
                },
            },
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const activeGoal = user.goals?.[0];
        const currentWeight = toValidWeight(user.healthMetrics?.[0]?.weight) || toValidWeight(user.profile?.weight);
        const selectedGoalType = normalizeGoalTemplate(goalTemplate, activeGoal?.goalType);
        const normalizedMacroStrategy = normalizeMacroStrategy(macroStrategy);
        const targetCaloriesValue = toPositiveNumber(targetCaloriesOverride);
        const baseTargetCalories = Number(targetCaloriesValue ||
            activeGoal?.targetCalories ||
            user.profile?.targetCalories ||
            2000);
        const heightCm = toPositiveNumber(user.profile?.height);
        const bmi = calculateBmi(currentWeight, heightCm);
        const targetCalories = resolveWeightLossCalories(baseTargetCalories, selectedGoalType, bmi, Boolean(targetCaloriesValue));
        const dailyMacroTargets = buildDailyMacroTargets({
            calories: targetCalories,
            goalType: selectedGoalType,
            macroStrategy: normalizedMacroStrategy,
            currentWeight,
            targetProtein: toPositiveNumber(targetProteinOverride),
            targetFat: toPositiveNumber(targetFatOverride),
            targetCarbs: toPositiveNumber(targetCarbsOverride),
            fallbackProtein: toPositiveNumber(activeGoal?.targetProtein) || toPositiveNumber(user.profile?.targetProtein),
            fallbackFat: toPositiveNumber(activeGoal?.targetFat) || toPositiveNumber(user.profile?.targetFat),
            fallbackCarbs: toPositiveNumber(activeGoal?.targetCarbs) || toPositiveNumber(user.profile?.targetCarbs),
        });
        const dietaryPrefs = (user.profile?.dietaryPref || []).map((item) => item.toLowerCase());
        const computedStart = startDate ? toStartOfDay(new Date(startDate)) : toStartOfDay(new Date());
        if (Number.isNaN(computedStart.getTime())) {
            return res.status(400).json({ error: 'Invalid startDate' });
        }
        let computedEnd;
        if (endDate) {
            computedEnd = toStartOfDay(new Date(endDate));
            if (Number.isNaN(computedEnd.getTime())) {
                return res.status(400).json({ error: 'Invalid endDate' });
            }
        }
        else {
            const totalDays = clampDays(Number(days || 7));
            computedEnd = addDays(computedStart, totalDays - 1);
        }
        if (computedEnd < computedStart) {
            return res.status(400).json({ error: 'endDate must be >= startDate' });
        }
        const totalDays = clampDays(Math.floor((computedEnd.getTime() - computedStart.getTime()) / (24 * 60 * 60 * 1000)) + 1);
        computedEnd = addDays(computedStart, totalDays - 1);
        const foodWhere = { calories: { gt: 0 } };
        if (dietaryPrefs.some((pref) => pref.includes('vegan'))) {
            foodWhere.isVegan = true;
        }
        else if (dietaryPrefs.some((pref) => pref.includes('vegetarian') || pref.includes('chay'))) {
            foodWhere.isVegetarian = true;
        }
        if (dietaryPrefs.some((pref) => pref.includes('gluten'))) {
            foodWhere.isGlutenFree = true;
        }
        let foods = await prisma.foodItem.findMany({
            where: foodWhere,
            select: {
                id: true,
                name: true,
                category: true,
                description: true,
                calories: true,
                protein: true,
                fat: true,
                carbs: true,
            },
        });
        if (foods.length < 10) {
            foods = await prisma.foodItem.findMany({
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
                },
            });
        }
        foods = await attachFoodPlanningMeta(foods);
        if (!foods.length) {
            return res.status(400).json({ error: 'No food data available to generate plan' });
        }
        const whiteRiceFood = foods.find((food) => isWhiteRiceFood(food)) || null;
        const fruitDessertFoods = foods.filter((food) => {
            if (!isFruitDessertFood(food))
                return false;
            const calories = Number(food.calories || 0);
            return calories > 0 && calories <= 220;
        });
        const fruitOrDrinkDessertFoods = foods.filter((food) => {
            if (!isFruitOrDrinkFood(food))
                return false;
            const calories = Number(food.calories || 0);
            return calories > 0 && calories <= 260;
        });
        const maxHotpotWeeks = selectedGoalType === client_1.GoalType.MAINTENANCE ? Math.max(1, Math.ceil(totalDays / 7)) : 0;
        const hotpotWeekUsed = new Set();
        const usedCounter = new Map();
        const usedByMealType = new Map();
        const includeSnackResolved = shouldDisableSnackForWeightLoss(selectedGoalType, bmi)
            ? false
            : Boolean(includeSnack);
        const mealTypes = includeSnackResolved
            ? AUTO_MEAL_TYPES
            : AUTO_MEAL_TYPES.filter((mealType) => mealType !== client_1.MealType.SNACK);
        const detailsData = [];
        const addDetail = (dayOfWeek, mealType, food, quantity, options) => {
            if (!food || quantity <= 0)
                return false;
            const addedCalories = Number(food.calories || 0) * quantity;
            if (options?.maxMealCalories &&
                Number.isFinite(addedCalories) &&
                (options.currentMealCalories || 0) + addedCalories > options.maxMealCalories) {
                return false;
            }
            detailsData.push({
                dayOfWeek,
                mealType,
                foodId: food.id,
                quantity: Number(quantity.toFixed(2)),
            });
            usedCounter.set(food.id, (usedCounter.get(food.id) || 0) + 1);
            const mealCounter = usedByMealType.get(mealType) || new Map();
            mealCounter.set(food.id, (mealCounter.get(food.id) || 0) + 1);
            usedByMealType.set(mealType, mealCounter);
            return true;
        };
        for (let dayOffset = 0; dayOffset < totalDays; dayOffset += 1) {
            const currentDate = addDays(computedStart, dayOffset);
            const dayOfWeek = currentDate.getDay();
            const weekIndex = Math.floor(dayOffset / 7);
            for (const mealType of mealTypes) {
                const targetMeal = toMealMacroTargets(dailyMacroTargets, mealType);
                const isLunchOrDinner = mealType === client_1.MealType.LUNCH || mealType === client_1.MealType.DINNER;
                const maxMealCalories = selectedGoalType === client_1.GoalType.WEIGHT_LOSS
                    ? targetMeal.calories * 0.95
                    : selectedGoalType === client_1.GoalType.MAINTENANCE
                        ? targetMeal.calories * 1.05
                        : targetMeal.calories * 1.12;
                let mealPlannedCalories = 0;
                let mealComponentCount = 0;
                const maxMealComponents = selectedGoalType === client_1.GoalType.WEIGHT_LOSS
                    ? (isLunchOrDinner ? 2 : 1)
                    : (isLunchOrDinner ? 4 : 1);
                const tryAddDetail = (food, quantity) => {
                    if (!food || mealComponentCount >= maxMealComponents)
                        return false;
                    const added = Number(food.calories || 0) * quantity;
                    const didAdd = addDetail(dayOfWeek, mealType, food, quantity, {
                        maxMealCalories,
                        currentMealCalories: mealPlannedCalories,
                    });
                    if (didAdd) {
                        mealPlannedCalories += Number.isFinite(added) ? added : 0;
                        mealComponentCount += 1;
                    }
                    return didAdd;
                };
                if (isLunchOrDinner) {
                    const selectedIds = new Set();
                    const goalPool = filterFoodsByGoal(foods, selectedGoalType, mealType);
                    const mealTypeUsedCounter = usedByMealType.get(mealType);
                    const rawDryPool = goalPool.filter((food) => ((!food.mealTimeTags?.length || hasFoodMealTime(food, mealType)) &&
                        (hasFoodRole(food, 'MAIN') || hasFoodRole(food, 'SIDE') || !food.mealRoles?.length) &&
                        !isWhiteRiceFood(food) &&
                        !isStapleDishFood(food) &&
                        !isFruitDessertFood(food) &&
                        !isFruitOrDrinkFood(food) &&
                        !isSoupDishFood(food) &&
                        !isHotpotFood(food)));
                    const dryFallbackPool = foods.filter((food) => ((!food.mealTimeTags?.length || hasFoodMealTime(food, mealType)) &&
                        (hasFoodRole(food, 'MAIN') || hasFoodRole(food, 'SIDE') || !food.mealRoles?.length) &&
                        !isWhiteRiceFood(food) &&
                        !isStapleDishFood(food) &&
                        !isFruitDessertFood(food) &&
                        !isFruitOrDrinkFood(food) &&
                        !isSoupDishFood(food) &&
                        !isHotpotFood(food)));
                    let dryPool = rawDryPool;
                    if (selectedGoalType === client_1.GoalType.WEIGHT_LOSS) {
                        const strictHealthyPool = rawDryPool.filter((food) => isHealthyCookingFood(food) && !isOilyCookingFood(food));
                        if (strictHealthyPool.length) {
                            dryPool = strictHealthyPool;
                        }
                        else {
                            const lessOilPool = rawDryPool.filter((food) => !isOilyCookingFood(food));
                            if (lessOilPool.length)
                                dryPool = lessOilPool;
                        }
                    }
                    const dryDish = pickFoodFromPool(dryPool.length ? dryPool : (dryFallbackPool.length ? dryFallbackPool : goalPool), mealType, scaleMacroTargets(targetMeal, 0.45), usedCounter, selectedGoalType, mealTypeUsedCounter);
                    if (dryDish) {
                        selectedIds.add(dryDish.id);
                        tryAddDetail(dryDish, resolveDryDishPortion(selectedGoalType));
                    }
                    const baseSoupPool = goalPool.filter((food) => (!selectedIds.has(food.id) &&
                        (!food.mealTimeTags?.length || hasFoodMealTime(food, mealType)) &&
                        !isWhiteRiceFood(food) &&
                        !isFruitDessertFood(food) &&
                        (isSoupDishFood(food) || isHotpotFood(food))));
                    const soupFallbackPool = foods.filter((food) => (!selectedIds.has(food.id) &&
                        (!food.mealTimeTags?.length || hasFoodMealTime(food, mealType)) &&
                        !isWhiteRiceFood(food) &&
                        !isFruitDessertFood(food) &&
                        (isSoupDishFood(food) || isHotpotFood(food))));
                    const nonHotpotSoupPool = baseSoupPool.filter((food) => !isHotpotFood(food));
                    const hotpotSoupPool = baseSoupPool.filter((food) => isHotpotFood(food));
                    let soupPool = nonHotpotSoupPool.length ? nonHotpotSoupPool : baseSoupPool;
                    const canUseHotpotForWeek = selectedGoalType === client_1.GoalType.MAINTENANCE &&
                        weekIndex < maxHotpotWeeks &&
                        !hotpotWeekUsed.has(weekIndex) &&
                        mealType === client_1.MealType.DINNER;
                    if (canUseHotpotForWeek && hotpotSoupPool.length) {
                        soupPool = hotpotSoupPool;
                    }
                    else if (selectedGoalType === client_1.GoalType.WEIGHT_LOSS && nonHotpotSoupPool.length) {
                        const healthySoupPool = nonHotpotSoupPool.filter((food) => !isOilyCookingFood(food));
                        if (healthySoupPool.length)
                            soupPool = healthySoupPool;
                    }
                    else if ((selectedGoalType === client_1.GoalType.WEIGHT_GAIN || selectedGoalType === client_1.GoalType.MUSCLE_GAIN) &&
                        nonHotpotSoupPool.length) {
                        soupPool = nonHotpotSoupPool;
                    }
                    const soupDish = pickFoodFromPool(soupPool.length
                        ? soupPool
                        : (soupFallbackPool.length ? soupFallbackPool : goalPool.filter((food) => !selectedIds.has(food.id))), mealType, scaleMacroTargets(targetMeal, 0.25), usedCounter, selectedGoalType, mealTypeUsedCounter);
                    if (soupDish) {
                        selectedIds.add(soupDish.id);
                        tryAddDetail(soupDish, resolveSoupDishPortion(selectedGoalType));
                        if (selectedGoalType === client_1.GoalType.MAINTENANCE && isHotpotFood(soupDish)) {
                            hotpotWeekUsed.add(weekIndex);
                        }
                    }
                    const mealAlreadyHasStaple = [dryDish, soupDish].some((food) => food && isStapleDishFood(food));
                    const shouldAddRiceSide = whiteRiceFood &&
                        !selectedIds.has(whiteRiceFood.id) &&
                        !mealAlreadyHasStaple &&
                        selectedGoalType !== client_1.GoalType.WEIGHT_LOSS;
                    if (shouldAddRiceSide) {
                        selectedIds.add(whiteRiceFood.id);
                        tryAddDetail(whiteRiceFood, resolveRiceSidePortion(selectedGoalType));
                    }
                    const dessertPoolBase = fruitDessertFoods.length ? fruitDessertFoods : fruitOrDrinkDessertFoods;
                    const dessert = selectedGoalType === client_1.GoalType.WEIGHT_LOSS
                        ? null
                        : pickLeastUsedFood(dessertPoolBase, usedCounter, selectedIds);
                    if (dessert) {
                        selectedIds.add(dessert.id);
                        tryAddDetail(dessert, resolveFruitDessertPortion(selectedGoalType));
                    }
                    if (selectedGoalType === client_1.GoalType.WEIGHT_GAIN) {
                        const extraMainPool = rawDryPool.filter((food) => !selectedIds.has(food.id));
                        const extraMainDish = pickFoodFromPool(extraMainPool, mealType, scaleMacroTargets(targetMeal, 0.35), usedCounter, selectedGoalType, mealTypeUsedCounter);
                        if (extraMainDish) {
                            selectedIds.add(extraMainDish.id);
                            tryAddDetail(extraMainDish, resolveExtraMainPortion(selectedGoalType));
                        }
                    }
                    continue;
                }
                const selectedFood = pickFoodForMeal(foods, mealType, targetMeal, usedCounter, selectedGoalType, usedByMealType.get(mealType));
                if (!selectedFood) {
                    continue;
                }
                const rawQuantity = targetMeal.calories / Number(selectedFood.calories || 1);
                const quantity = resolveMealQuantityByGoal(selectedFood, selectedGoalType, rawQuantity);
                tryAddDetail(selectedFood, quantity);
            }
        }
        const fallbackName = `Auto Plan ${(0, timezone_util_1.toAppDateKey)(computedStart)} - ${(0, timezone_util_1.toAppDateKey)(computedEnd)}`;
        const planName = (name || '').trim() || fallbackName;
        const createdPlan = await prisma.$transaction(async (tx) => {
            if (activate) {
                await tx.mealPlan.updateMany({
                    where: { userId },
                    data: { isActive: false },
                });
            }
            const plan = await tx.mealPlan.create({
                data: {
                    userId,
                    name: planName,
                    startDate: computedStart,
                    endDate: computedEnd,
                    isActive: !!activate,
                },
            });
            if (detailsData.length) {
                await tx.mealPlanDetail.createMany({
                    data: detailsData.map((detail) => ({
                        mealPlanId: plan.id,
                        foodId: detail.foodId,
                        mealType: detail.mealType,
                        dayOfWeek: detail.dayOfWeek,
                        quantity: detail.quantity,
                    })),
                });
            }
            return tx.mealPlan.findUnique({
                where: { id: plan.id },
                include: {
                    details: {
                        include: { food: true },
                        orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
                    },
                },
            });
        });
        res.json({
            success: true,
            data: createdPlan,
            meta: {
                targetCalories,
                requestedTargetCalories: baseTargetCalories,
                goalType: selectedGoalType || client_1.GoalType.MAINTENANCE,
                currentWeight: currentWeight || null,
                bmi,
                macroStrategy: normalizedMacroStrategy,
                targetProtein: dailyMacroTargets.protein,
                targetFat: dailyMacroTargets.fat,
                targetCarbs: dailyMacroTargets.carbs,
                totalDays,
                mealsPerDay: mealTypes.length,
                includeSnack: includeSnackResolved,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.generateAutoMealPlan = generateAutoMealPlan;
