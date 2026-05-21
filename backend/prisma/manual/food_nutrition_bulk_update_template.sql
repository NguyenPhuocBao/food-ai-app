-- Bulk update nutrition data for food_items.
-- Usage:
-- 1. Replace rows inside nutrition_updates with reviewed values.
-- 2. Run this file with psql against the same database as DATABASE_URL.
-- 3. Check the preview result before COMMIT. Use ROLLBACK if anything looks wrong.

BEGIN;

CREATE TEMP TABLE nutrition_updates (
  name TEXT PRIMARY KEY,
  category TEXT,
  calories INTEGER NOT NULL,
  protein DOUBLE PRECISION NOT NULL,
  fat DOUBLE PRECISION NOT NULL,
  carbs DOUBLE PRECISION NOT NULL,
  fiber DOUBLE PRECISION,
  sugar DOUBLE PRECISION,
  is_vegetarian BOOLEAN,
  is_vegan BOOLEAN,
  is_gluten_free BOOLEAN,
  meal_time_tags TEXT[],
  meal_roles TEXT[],
  goal_tags TEXT[],
  cooking_method TEXT,
  portion_type TEXT,
  note TEXT
) ON COMMIT DROP;

INSERT INTO nutrition_updates (
  name,
  category,
  calories,
  protein,
  fat,
  carbs,
  fiber,
  sugar,
  is_vegetarian,
  is_vegan,
  is_gluten_free,
  meal_time_tags,
  meal_roles,
  goal_tags,
  cooking_method,
  portion_type,
  note
) VALUES
  -- Example values for one average adult serving.
  -- Replace/add rows below after review.
  (
    'Com ga luoc',
    'Com',
    580,
    36,
    12,
    78,
    4,
    2,
    FALSE,
    FALSE,
    TRUE,
    ARRAY['LUNCH', 'DINNER'],
    ARRAY['MAIN', 'STAPLE'],
    ARRAY['WEIGHT_LOSS', 'MAINTENANCE', 'MUSCLE_GAIN'],
    'BOILED',
    'FULL_MEAL',
    '150g com chin + 120g ga luoc bo da + rau; 1 khau phan nguoi lon.'
  ),
  (
    'Com ga nuong',
    'Com',
    700,
    35,
    24,
    82,
    4,
    5,
    FALSE,
    FALSE,
    TRUE,
    ARRAY['LUNCH', 'DINNER'],
    ARRAY['MAIN', 'STAPLE'],
    ARRAY['MAINTENANCE', 'WEIGHT_GAIN', 'MUSCLE_GAIN'],
    'GRILLED',
    'FULL_MEAL',
    '150g com chin + 120g ga nuong co uop/sot + rau; cao hon ga luoc do dau/sot/da.'
  );

-- Preview rows that will be updated.
SELECT
  f.id,
  f.name,
  f.category AS old_category,
  u.category AS new_category,
  f.calories AS old_calories,
  u.calories AS new_calories,
  f.protein AS old_protein,
  u.protein AS new_protein,
  f.fat AS old_fat,
  u.fat AS new_fat,
  f.carbs AS old_carbs,
  u.carbs AS new_carbs,
  u.note
FROM "food_items" f
JOIN nutrition_updates u ON lower(f.name) = lower(u.name)
ORDER BY f.id;

-- Preview update rows that do not match any food_items.name.
SELECT u.name AS unmatched_update_name
FROM nutrition_updates u
LEFT JOIN "food_items" f ON lower(f.name) = lower(u.name)
WHERE f.id IS NULL
ORDER BY u.name;

UPDATE "food_items" f
SET
  category = COALESCE(u.category, f.category),
  calories = u.calories,
  protein = u.protein,
  fat = u.fat,
  carbs = u.carbs,
  fiber = u.fiber,
  sugar = u.sugar,
  "isVegetarian" = COALESCE(u.is_vegetarian, f."isVegetarian"),
  "isVegan" = COALESCE(u.is_vegan, f."isVegan"),
  "isGlutenFree" = COALESCE(u.is_gluten_free, f."isGlutenFree"),
  "mealTimeTags" = COALESCE(u.meal_time_tags, f."mealTimeTags"),
  "mealRoles" = COALESCE(u.meal_roles, f."mealRoles"),
  "goalTags" = COALESCE(u.goal_tags, f."goalTags"),
  "cookingMethod" = COALESCE(u.cooking_method, f."cookingMethod"),
  "portionType" = COALESCE(u.portion_type, f."portionType"),
  "updatedAt" = NOW()
FROM nutrition_updates u
WHERE lower(f.name) = lower(u.name);

-- Verify changed rows.
SELECT
  f.id,
  f.name,
  f.category,
  f.calories,
  f.protein,
  f.fat,
  f.carbs,
  f.fiber,
  f.sugar,
  f."mealTimeTags",
  f."mealRoles",
  f."goalTags",
  f."cookingMethod",
  f."portionType",
  f."updatedAt"
FROM "food_items" f
JOIN nutrition_updates u ON lower(f.name) = lower(u.name)
ORDER BY f.id;

-- Change to ROLLBACK after preview if data is not correct.
COMMIT;
