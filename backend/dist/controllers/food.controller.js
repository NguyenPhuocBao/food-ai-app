"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFoodImage = exports.createRecipe = exports.updateRecipe = exports.bootstrapPopularFoods = exports.createCustomFood = exports.getMyCustomFoods = exports.getPopularFoods = exports.getCategories = exports.searchFoods = exports.getFoodById = exports.getAllFoods = void 0;
const client_1 = require("@prisma/client");
const popular_foods_service_1 = require("../services/popular-foods.service");
const cloudinary_upload_service_1 = require("../services/cloudinary-upload.service");
const prisma = new client_1.PrismaClient();
const CUSTOM_CATEGORY_PREFIX = 'CUSTOM_USER_';
const getCustomCategory = (userId) => `${CUSTOM_CATEGORY_PREFIX}${userId}`;
const isCustomCategory = (category) => Boolean(category && category.startsWith(CUSTOM_CATEGORY_PREFIX));
const isOwnedCustomCategory = (category, userId) => category === getCustomCategory(userId);
const buildFoodVisibilityFilter = (req) => {
    if (req.user.role === 'ADMIN')
        return {};
    return {
        OR: [
            { NOT: { category: { startsWith: CUSTOM_CATEGORY_PREFIX } } },
            { category: getCustomCategory(req.user.id) },
        ],
    };
};
const normalizeSlug = (value) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
const normalizeSearchText = (value) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const toSearchSlugToken = (value) => normalizeSearchText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
const CATEGORY_LABEL_PERSONAL = 'Mon ca nhan';
const RECIPE_BASE_INGREDIENTS = [
    { name: 'Hanh tim', unit: 'cu' },
    { name: 'Toi', unit: 'tep' },
    { name: 'Dau oliu', unit: 'muong canh' },
    { name: 'Muoi', unit: 'muong cafe' },
    { name: 'Tieu', unit: 'muong cafe' },
    { name: 'Nuoc mam', unit: 'muong canh' },
    { name: 'Rau xanh tong hop', unit: 'g' },
    { name: 'Ca rot', unit: 'g' },
    { name: 'Hanh la', unit: 'g' },
];
const RECIPE_TOOLS = [
    'Noi nau',
    'Chao',
    'Dao',
    'Thot',
    'Muoi xuc',
    'Bat to',
    'Vung noi',
    'Bep',
];
const pickBySeed = (items, seed, count) => {
    const output = [];
    for (let i = 0; i < count; i += 1) {
        output.push(items[(seed + i) % items.length]);
    }
    return output;
};
const buildRecipeSeedData = (foodName, seed) => {
    const prepTime = 8 + (seed % 5) * 4;
    const cookTime = 12 + (seed % 6) * 5;
    const totalTime = prepTime + cookTime;
    const servings = 1 + (seed % 3);
    const difficulty = seed % 3 === 0 ? 'EASY' : seed % 3 === 1 ? 'MEDIUM' : 'HARD';
    const baseIngredients = pickBySeed(RECIPE_BASE_INGREDIENTS, seed, 4);
    const ingredients = [
        { name: foodName, amount: 180, unit: 'g', order: 1, isOptional: false },
        ...baseIngredients.map((ingredient, index) => ({
            name: ingredient.name,
            amount: Math.max(5, 20 + ((seed + index) % 4) * 15),
            unit: ingredient.unit,
            order: index + 2,
            isOptional: false,
        })),
    ];
    const tools = pickBySeed(RECIPE_TOOLS, seed, 3).map((tool, index) => ({
        name: tool,
        isRequired: index < 2,
    }));
    const steps = [
        {
            stepNumber: 1,
            order: 1,
            description: `So che nguyen lieu cho mon ${foodName}, rua sach va cat theo kich thuoc vua an.`,
            tips: 'Co the uop nhanh voi chut muoi tieu de mon dam vi hon.',
        },
        {
            stepNumber: 2,
            order: 2,
            description: `Nau/chao mon ${foodName} o lua vua trong ${cookTime} phut den khi chin deu.`,
            tips: 'Dieu chinh lua nho dan de giu do am va han che chay day.',
        },
        {
            stepNumber: 3,
            order: 3,
            description: 'Niem nem lai lan cuoi, bay ra dia va dung nong.',
            tips: 'Tang rau xanh an kem de can bang dinh duong.',
        },
    ];
    return {
        title: `Cong thuc ${foodName}`,
        summary: `Huong dan nau ${foodName} don gian, de ap dung hang ngay.`,
        prepTime,
        cookTime,
        totalTime,
        servings,
        difficulty,
        tips: 'Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.',
        nutritionNotes: 'Uu tien nguyen lieu tuoi, han che chien ngap dau.',
        ingredients,
        steps,
        tools,
    };
};
const toPublicCategoryLabel = (category, userId) => {
    if (isOwnedCustomCategory(category, userId))
        return CATEGORY_LABEL_PERSONAL;
    return category;
};
const FOOD_TAG_KEYWORDS = {
    grilled: ['nuong', 'grilled', 'bbq'],
    vegetarian: ['chay', 'vegetarian', 'vegan', 'dau hu', 'tofu'],
    weightLoss: ['giam can', 'weight loss', 'low calorie', 'healthy', 'eat clean', 'salad', 'luoc', 'hap'],
    weightGain: ['tang can', 'weight gain', 'high calorie', 'bulk'],
    staple: ['com', 'rice', 'bun', 'pho', 'mien', 'mi ', 'my ', 'noodle', 'xoi', 'banh mi', 'khoai', 'oat'],
    dessert: ['trang mieng', 'trai cay', 'hoa qua', 'fruit', 'chuoi', 'tao', 'cam', 'xoai', 'yogurt', 'sua chua'],
    drinkSoup: ['do nuoc', 'nuoc', 'canh', 'soup', 'broth', 'juice', 'smoothie', 'tra', 'tea', 'coffee', 'cafe'],
    oily: ['chien', 'ran', 'xao', 'fried', 'deep fry'],
};
const hasTagKeyword = (text, keywords) => keywords.some((keyword) => text.includes(keyword));
const buildFoodClassification = (food) => {
    const text = normalizeSearchText(`${food.name || ''} ${food.category || ''} ${food.description || ''}`);
    const calories = Number(food.calories || 0);
    const protein = Number(food.protein || 0);
    const smartTags = new Set();
    const mealRoles = new Set();
    if (hasTagKeyword(text, FOOD_TAG_KEYWORDS.grilled))
        smartTags.add('mon nuong');
    if (food.isVegetarian || food.isVegan || hasTagKeyword(text, FOOD_TAG_KEYWORDS.vegetarian))
        smartTags.add('do chay');
    if (hasTagKeyword(text, FOOD_TAG_KEYWORDS.weightLoss) || (calories > 0 && calories <= 350))
        smartTags.add('giam can');
    if (hasTagKeyword(text, FOOD_TAG_KEYWORDS.weightGain) || calories >= 550)
        smartTags.add('tang can');
    if (hasTagKeyword(text, FOOD_TAG_KEYWORDS.staple)) {
        smartTags.add('tinh bot');
        mealRoles.add('staple');
    }
    if (hasTagKeyword(text, FOOD_TAG_KEYWORDS.dessert)) {
        smartTags.add('trang mieng');
        mealRoles.add('dessert');
    }
    if (hasTagKeyword(text, FOOD_TAG_KEYWORDS.drinkSoup)) {
        smartTags.add('do nuoc/canh');
        mealRoles.add('soup_or_drink');
    }
    if (hasTagKeyword(text, FOOD_TAG_KEYWORDS.oily))
        smartTags.add('nhieu dau mo');
    if (protein >= 12)
        mealRoles.add('main_protein');
    if (hasTagKeyword(text, ['rau', 'salad', 'vegetable', 'cu qua']))
        mealRoles.add('vegetable_side');
    if (!mealRoles.size)
        mealRoles.add('main_or_side');
    return {
        mealTimeTags: food.mealTimeTags || [],
        mealRoles: food.mealRoles || [],
        goalTags: food.goalTags || [],
        smartTags: Array.from(smartTags),
        inferredMealRoles: Array.from(mealRoles),
    };
};
const getAllFoods = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, search, sort = 'popularity', order = 'desc', } = req.query;
        const pageNumber = Math.max(1, Number(page) || 1);
        const limitNumber = Math.max(1, Number(limit) || 20);
        const visibilityFilter = buildFoodVisibilityFilter(req);
        const filters = [visibilityFilter];
        const categoryText = String(category || '').trim();
        const isPersonalCategory = categoryText === CATEGORY_LABEL_PERSONAL;
        if (search && String(search).trim()) {
            const rawSearch = String(search).trim();
            const slugToken = toSearchSlugToken(rawSearch);
            const searchOr = [
                { name: { contains: rawSearch, mode: 'insensitive' } },
                { description: { contains: rawSearch, mode: 'insensitive' } },
            ];
            if (slugToken) {
                searchOr.push({ slug: { contains: slugToken, mode: 'insensitive' } });
            }
            filters.push({ OR: searchOr });
        }
        const baseWhere = filters.length === 1 ? filters[0] : { AND: filters };
        const sortField = ['popularity', 'createdAt', 'calories', 'name'].includes(String(sort))
            ? String(sort)
            : 'popularity';
        const sortOrder = String(order).toLowerCase() === 'asc' ? 'asc' : 'desc';
        const includeRecipe = {
            recipe: {
                select: {
                    id: true,
                    title: true,
                },
            },
        };
        let foods = [];
        let total = 0;
        if (categoryText && !isPersonalCategory) {
            const normalizedCategoryQuery = normalizeSearchText(categoryText);
            const pool = await prisma.foodItem.findMany({
                where: baseWhere,
                include: includeRecipe,
                orderBy: { [sortField]: sortOrder },
            });
            const matched = pool.filter((food) => normalizeSearchText(toPublicCategoryLabel(food.category, req.user.id)).includes(normalizedCategoryQuery));
            total = matched.length;
            const startIndex = (pageNumber - 1) * limitNumber;
            foods = matched.slice(startIndex, startIndex + limitNumber);
        }
        else {
            const where = isPersonalCategory
                ? {
                    AND: [baseWhere, { category: getCustomCategory(req.user.id) }],
                }
                : baseWhere;
            [foods, total] = await Promise.all([
                prisma.foodItem.findMany({
                    where,
                    skip: (pageNumber - 1) * limitNumber,
                    take: limitNumber,
                    include: includeRecipe,
                    orderBy: { [sortField]: sortOrder },
                }),
                prisma.foodItem.count({ where }),
            ]);
        }
        const data = foods.map((food) => ({
            ...food,
            category: toPublicCategoryLabel(food.category, req.user.id),
            isCustom: isOwnedCustomCategory(food.category, req.user.id),
            ...buildFoodClassification(food),
        }));
        res.json({
            success: true,
            data,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages: Math.max(1, Math.ceil(total / limitNumber)),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllFoods = getAllFoods;
const getFoodById = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await prisma.foodItem.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                recipe: { include: { ingredients: true, steps: true, tools: true } },
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                                profile: { select: { avatar: true } },
                            },
                        },
                        replies: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        role: true,
                                        profile: { select: { avatar: true } },
                                    },
                                },
                            },
                            orderBy: { createdAt: 'asc' },
                        },
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                favorites: true,
            },
        });
        if (!food)
            return res.status(404).json({ error: 'Food not found' });
        if (req.user.role !== 'ADMIN' &&
            isCustomCategory(food.category) &&
            !isOwnedCustomCategory(food.category, req.user.id)) {
            return res.status(404).json({ error: 'Food not found' });
        }
        if (food.recipe) {
            await prisma.recipe.update({
                where: { id: food.recipe.id },
                data: { viewCount: { increment: 1 } },
            });
        }
        res.json({
            success: true,
            data: {
                ...food,
                category: toPublicCategoryLabel(food.category, req.user.id),
                isCustom: isOwnedCustomCategory(food.category, req.user.id),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getFoodById = getFoodById;
const searchFoods = async (req, res) => {
    try {
        const { q, category, minCalories, maxCalories, isVegetarian, isVegan } = req.query;
        if (!q)
            return res.status(400).json({ error: 'Search query required' });
        const rawQuery = String(q).trim();
        const normalizedQuery = normalizeSearchText(rawQuery);
        const slugToken = toSearchSlugToken(rawQuery);
        const textOrFilters = [
            { name: { contains: rawQuery, mode: 'insensitive' } },
            { description: { contains: rawQuery, mode: 'insensitive' } },
            { category: { contains: rawQuery, mode: 'insensitive' } },
        ];
        if (slugToken) {
            textOrFilters.push({ slug: { contains: slugToken, mode: 'insensitive' } });
        }
        const where = {
            AND: [
                buildFoodVisibilityFilter(req),
                {
                    OR: textOrFilters,
                },
            ],
        };
        if (category) {
            if (category === CATEGORY_LABEL_PERSONAL) {
                where.AND.push({ category: getCustomCategory(req.user.id) });
            }
            else {
                where.AND.push({ category });
            }
        }
        if (minCalories)
            where.AND.push({ calories: { gte: parseInt(minCalories, 10) } });
        if (maxCalories) {
            where.AND.push({ calories: { lte: parseInt(maxCalories, 10) } });
        }
        if (isVegetarian === 'true')
            where.AND.push({ isVegetarian: true });
        if (isVegan === 'true')
            where.AND.push({ isVegan: true });
        const baseFilters = where.AND.filter((item) => !item.OR);
        let foods = await prisma.foodItem.findMany({
            where,
            take: 50,
            orderBy: [{ popularity: 'desc' }, { name: 'asc' }],
        });
        if (foods.length === 0 && normalizedQuery) {
            const fallbackPool = await prisma.foodItem.findMany({
                where: { AND: baseFilters },
                take: 1500,
                orderBy: [{ popularity: 'desc' }, { name: 'asc' }],
            });
            foods = fallbackPool
                .filter((food) => {
                const name = normalizeSearchText(food.name || '');
                const description = normalizeSearchText(food.description || '');
                const categoryText = normalizeSearchText(food.category || '');
                const slug = normalizeSearchText(food.slug || '');
                return (name.includes(normalizedQuery) ||
                    description.includes(normalizedQuery) ||
                    categoryText.includes(normalizedQuery) ||
                    slug.includes(normalizedQuery));
            })
                .slice(0, 50);
        }
        res.json({
            success: true,
            data: foods.map((food) => ({
                ...food,
                category: toPublicCategoryLabel(food.category, req.user.id),
                isCustom: isOwnedCustomCategory(food.category, req.user.id),
                ...buildFoodClassification(food),
            })),
            count: foods.length,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.searchFoods = searchFoods;
const getCategories = async (req, res) => {
    try {
        const where = buildFoodVisibilityFilter(req);
        const categories = await prisma.foodItem.groupBy({
            by: ['category'],
            where,
            _count: true,
            _avg: { calories: true },
        });
        const normalized = categories.map((item) => ({
            ...item,
            category: toPublicCategoryLabel(item.category, req.user.id),
        }));
        res.json({ success: true, data: normalized });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCategories = getCategories;
const getPopularFoods = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const where = {
            ...buildFoodVisibilityFilter(req),
            NOT: {
                category: { startsWith: CUSTOM_CATEGORY_PREFIX },
            },
        };
        const foods = await prisma.foodItem.findMany({
            where,
            orderBy: { popularity: 'desc' },
            take: Number(limit),
        });
        res.json({ success: true, data: foods });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPopularFoods = getPopularFoods;
const getMyCustomFoods = async (req, res) => {
    try {
        const userId = req.user.id;
        const foods = await prisma.foodItem.findMany({
            where: { category: getCustomCategory(userId) },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            data: foods.map((food) => ({
                ...food,
                category: CATEGORY_LABEL_PERSONAL,
                isCustom: true,
            })),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMyCustomFoods = getMyCustomFoods;
const createCustomFood = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, calories, protein, fat, carbs, fiber, sugar, isVegetarian, isVegan, isGlutenFree, } = req.body || {};
        if (!name || calories === undefined || protein === undefined || fat === undefined || carbs === undefined) {
            return res.status(400).json({ error: 'Missing required nutrition fields' });
        }
        let normalizedName = String(name).trim();
        if (!normalizedName)
            return res.status(400).json({ error: 'Invalid food name' });
        const existingByName = await prisma.foodItem.findUnique({ where: { name: normalizedName } });
        if (existingByName) {
            normalizedName = `${normalizedName} (ca nhan ${userId})`;
        }
        const slugBase = normalizeSlug(normalizedName);
        const slug = `${slugBase}-${userId}-${Date.now()}`;
        const item = await prisma.foodItem.create({
            data: {
                name: normalizedName,
                slug,
                category: getCustomCategory(userId),
                description: description || 'Mon ca nhan do nguoi dung tu tao.',
                calories: Math.max(0, Math.round(Number(calories))),
                protein: Math.max(0, Number(protein)),
                fat: Math.max(0, Number(fat)),
                carbs: Math.max(0, Number(carbs)),
                fiber: fiber !== undefined ? Math.max(0, Number(fiber)) : null,
                sugar: sugar !== undefined ? Math.max(0, Number(sugar)) : null,
                popularity: 0,
                isVegetarian: Boolean(isVegetarian),
                isVegan: Boolean(isVegan),
                isGlutenFree: Boolean(isGlutenFree),
            },
        });
        res.status(201).json({
            success: true,
            data: {
                ...item,
                category: CATEGORY_LABEL_PERSONAL,
                isCustom: true,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createCustomFood = createCustomFood;
const bootstrapPopularFoods = async (req, res) => {
    try {
        const limit = Math.max(50, Math.min(500, Number(req.body?.limit || req.query?.limit || 100)));
        const offset = Math.max(0, Number(req.body?.offset || req.query?.offset || 0));
        const includeRecipeDetails = String(req.body?.includeRecipeDetails ?? req.query?.includeRecipeDetails ?? 'true').toLowerCase() !== 'false';
        const seedItems = (0, popular_foods_service_1.buildPopularFoodSeedData)(limit, offset);
        if (seedItems.length === 0) {
            return res.status(400).json({ error: 'No seed items in requested range' });
        }
        const existing = await prisma.foodItem.findMany({
            where: { name: { in: seedItems.map((item) => item.name) } },
            select: { name: true },
        });
        const existingNames = new Set(existing.map((item) => item.name));
        const toInsert = seedItems.filter((item) => !existingNames.has(item.name));
        const result = toInsert.length
            ? await prisma.foodItem.createMany({ data: toInsert, skipDuplicates: true })
            : { count: 0 };
        let recipesCreated = 0;
        if (includeRecipeDetails && toInsert.length > 0) {
            const insertedFoods = await prisma.foodItem.findMany({
                where: { name: { in: toInsert.map((item) => item.name) } },
                select: {
                    id: true,
                    name: true,
                    recipe: { select: { id: true } },
                },
            });
            const foodsMissingRecipe = insertedFoods.filter((food) => !food.recipe);
            for (const [index, food] of foodsMissingRecipe.entries()) {
                const recipeSeed = buildRecipeSeedData(food.name, offset + index);
                await prisma.recipe.create({
                    data: {
                        foodId: food.id,
                        title: recipeSeed.title,
                        summary: recipeSeed.summary,
                        prepTime: recipeSeed.prepTime,
                        cookTime: recipeSeed.cookTime,
                        totalTime: recipeSeed.totalTime,
                        servings: recipeSeed.servings,
                        difficulty: recipeSeed.difficulty,
                        tips: recipeSeed.tips,
                        nutritionNotes: recipeSeed.nutritionNotes,
                        ingredients: { create: recipeSeed.ingredients },
                        steps: { create: recipeSeed.steps },
                        tools: { create: recipeSeed.tools },
                    },
                });
                recipesCreated += 1;
            }
        }
        const totalFoods = await prisma.foodItem.count({
            where: {
                NOT: { category: { startsWith: CUSTOM_CATEGORY_PREFIX } },
            },
        });
        res.json({
            success: true,
            data: {
                requested: seedItems.length,
                limit,
                offset,
                includeRecipeDetails,
                inserted: result.count,
                recipesCreated,
                skipped: seedItems.length - result.count,
                totalFoods,
            },
            message: 'Popular food catalog bootstrap completed',
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.bootstrapPopularFoods = bootstrapPopularFoods;
const updateRecipe = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const recipe = await prisma.recipe.update({ where: { id: parseInt(id, 10) }, data });
    res.json({ success: true, data: recipe });
};
exports.updateRecipe = updateRecipe;
const createRecipe = async (req, res) => {
    const { foodId, ...data } = req.body;
    const recipe = await prisma.recipe.create({ data: { ...data, foodId } });
    res.json({ success: true, data: recipe });
};
exports.createRecipe = createRecipe;
const uploadFoodImage = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'No file uploaded' });
        const foodId = parseInt(req.params.id, 10);
        const food = await prisma.foodItem.findUnique({ where: { id: foodId }, select: { category: true } });
        if (!food)
            return res.status(404).json({ error: 'Food not found' });
        if (req.user.role !== 'ADMIN' &&
            isCustomCategory(food.category) &&
            !isOwnedCustomCategory(food.category, req.user.id)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const localImageUrl = `/uploads/${req.file.filename}`;
        const cloudinaryUrl = await (0, cloudinary_upload_service_1.uploadImageToCloudinary)(req.file.path, 'foods').catch(() => null);
        const imageUrl = cloudinaryUrl || localImageUrl;
        await prisma.foodItem.update({
            where: { id: foodId },
            data: { imageUrl },
        });
        if (cloudinaryUrl) {
            await (0, cloudinary_upload_service_1.deleteLocalUploadIfExists)(req.file.path);
        }
        res.json({ success: true, data: { imageUrl } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.uploadFoodImage = uploadFoodImage;
