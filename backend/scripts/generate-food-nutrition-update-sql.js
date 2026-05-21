const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] || path.resolve(__dirname, '../exports/food-nutrition-admin-manual-review.csv');
const outputPath = process.argv[3] || path.resolve(__dirname, '../prisma/manual/update-food-nutrition-from-review.sql');

const parseCsv = (content) => {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(value);
      if (row.some((cell) => cell !== '')) rows.push(row);
      row = [];
      value = '';
      continue;
    }

    value += char;
  }

  if (value || row.length) {
    row.push(value);
    if (row.some((cell) => cell !== '')) rows.push(row);
  }

  return rows;
};

const sqlText = (value) => {
  if (value === null || value === undefined || value === '') return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
};

const sqlNumber = (value) => {
  if (value === null || value === undefined || value === '') return 'NULL';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 'NULL';
  return String(parsed);
};

const sqlArray = (value) => {
  if (!value) return 'ARRAY[]::TEXT[]';
  const items = String(value)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) return 'ARRAY[]::TEXT[]';
  return `ARRAY[${items.map(sqlText).join(', ')}]::TEXT[]`;
};

const content = fs.readFileSync(inputPath, 'utf8');
const rows = parseCsv(content);
const [headers, ...records] = rows;
const index = Object.fromEntries(headers.map((header, position) => [header, position]));

const requiredColumns = [
  'id',
  'recommendedCategory',
  'recommendedCalories',
  'recommendedProtein',
  'recommendedFat',
  'recommendedCarbs',
  'recommendedMealTimeTags',
  'recommendedMealRoles',
  'recommendedGoalTags',
  'recommendedCookingMethod',
  'recommendedPortionType',
];

const missingColumns = requiredColumns.filter((column) => !(column in index));
if (missingColumns.length > 0) {
  throw new Error(`Missing required CSV columns: ${missingColumns.join(', ')}`);
}

const updates = records
  .map((record) => ({
    id: Number(record[index.id]),
    category: record[index.recommendedCategory],
    calories: record[index.recommendedCalories],
    protein: record[index.recommendedProtein],
    fat: record[index.recommendedFat],
    carbs: record[index.recommendedCarbs],
    mealTimeTags: record[index.recommendedMealTimeTags],
    mealRoles: record[index.recommendedMealRoles],
    goalTags: record[index.recommendedGoalTags],
    cookingMethod: record[index.recommendedCookingMethod],
    portionType: record[index.recommendedPortionType],
    servingNote: record[index.servingNote],
  }))
  .filter((record) => Number.isInteger(record.id) && record.calories !== '');

const valuesSql = updates
  .map((record) => `  (
    ${record.id},
    ${sqlText(record.category)},
    ${sqlNumber(record.calories)},
    ${sqlNumber(record.protein)},
    ${sqlNumber(record.fat)},
    ${sqlNumber(record.carbs)},
    ${sqlArray(record.mealTimeTags)},
    ${sqlArray(record.mealRoles)},
    ${sqlArray(record.goalTags)},
    ${sqlText(record.cookingMethod)},
    ${sqlText(record.portionType)},
    ${sqlText(record.servingNote)}
  )`)
  .join(',\n');

const sql = `-- Generated from ${path.basename(inputPath)}.
-- Review this file before running against the database.
-- Run:
--   psql "$DATABASE_URL" -f prisma/manual/update-food-nutrition-from-review.sql

BEGIN;

CREATE TEMP TABLE food_nutrition_updates (
  id INTEGER PRIMARY KEY,
  category TEXT,
  calories INTEGER NOT NULL,
  protein DOUBLE PRECISION NOT NULL,
  fat DOUBLE PRECISION NOT NULL,
  carbs DOUBLE PRECISION NOT NULL,
  meal_time_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  meal_roles TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  goal_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  cooking_method TEXT,
  portion_type TEXT,
  serving_note TEXT
) ON COMMIT DROP;

INSERT INTO food_nutrition_updates (
  id,
  category,
  calories,
  protein,
  fat,
  carbs,
  meal_time_tags,
  meal_roles,
  goal_tags,
  cooking_method,
  portion_type,
  serving_note
) VALUES
${valuesSql};

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
  f."mealTimeTags" AS old_meal_time_tags,
  u.meal_time_tags AS new_meal_time_tags,
  u.serving_note
FROM "food_items" f
JOIN food_nutrition_updates u ON u.id = f.id
ORDER BY f.id;

-- Rows in CSV that do not exist in DB.
SELECT u.id AS unmatched_update_id
FROM food_nutrition_updates u
LEFT JOIN "food_items" f ON f.id = u.id
WHERE f.id IS NULL
ORDER BY u.id;

UPDATE "food_items" f
SET
  category = COALESCE(u.category, f.category),
  calories = u.calories,
  protein = u.protein,
  fat = u.fat,
  carbs = u.carbs,
  "mealTimeTags" = u.meal_time_tags,
  "mealRoles" = u.meal_roles,
  "goalTags" = u.goal_tags,
  "cookingMethod" = u.cooking_method,
  "portionType" = u.portion_type,
  "updatedAt" = NOW()
FROM food_nutrition_updates u
WHERE f.id = u.id;

-- Verify changed rows after update.
SELECT
  f.id,
  f.name,
  f.category,
  f.calories,
  f.protein,
  f.fat,
  f.carbs,
  f."mealTimeTags",
  f."mealRoles",
  f."goalTags",
  f."cookingMethod",
  f."portionType",
  f."updatedAt"
FROM "food_items" f
JOIN food_nutrition_updates u ON u.id = f.id
ORDER BY f.id;

COMMIT;
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, sql, 'utf8');

console.log(`Generated ${updates.length} update rows at ${outputPath}`);
