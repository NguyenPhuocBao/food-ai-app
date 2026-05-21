const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const columns = [
  'id',
  'name',
  'category',
  'calories',
  'protein',
  'fat',
  'carbs',
  'fiber',
  'sugar',
  'isVegetarian',
  'isVegan',
  'isGlutenFree',
  'mealTimeTags',
  'mealRoles',
  'goalTags',
  'cookingMethod',
  'portionType',
  'recommendedCalories',
  'recommendedProtein',
  'recommendedFat',
  'recommendedCarbs',
  'servingNote',
  'reviewNote',
];

const escapeCsv = (value) => {
  if (value === null || value === undefined) return '';
  const text = Array.isArray(value) ? value.join('|') : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

async function main() {
  const outputPath = process.argv[2] || path.resolve(__dirname, '../exports/food-items-export.csv');
  const foods = await prisma.foodItem.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      name: true,
      category: true,
      calories: true,
      protein: true,
      fat: true,
      carbs: true,
      fiber: true,
      sugar: true,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      mealTimeTags: true,
      mealRoles: true,
      goalTags: true,
      cookingMethod: true,
      portionType: true,
    },
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const rows = [
    columns.join(','),
    ...foods.map((food) => columns.map((column) => escapeCsv(food[column])).join(',')),
  ];

  fs.writeFileSync(outputPath, `${rows.join('\n')}\n`, 'utf8');
  console.log(`Exported ${foods.length} foods to ${outputPath}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
