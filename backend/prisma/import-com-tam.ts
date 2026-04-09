import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const foodName = 'Bánh bột lọc';

  const food = await prisma.foodItem.findUnique({
    where: { name: foodName },
  });

  if (!food) {
    console.error(`❌ Không tìm thấy món "${foodName}"`);
    return;
  }

  console.log(`✅ Tìm thấy: ${food.name} (ID: ${food.id})`);

  await prisma.recipe.upsert({
    where: { foodId: food.id },
    update: {
      title: 'Cách làm Bánh bột lọc nhân tôm thịt',
      summary: 'Bánh bột lọc trong dai, nhân tôm thịt đậm đà, chấm nước mắm chua ngọt.',
      prepTime: 30,
      cookTime: 20,
      totalTime: 50,
      servings: 4,
      difficulty: Difficulty.EASY,
      tips: 'Nhồi bột kỹ, gói bánh kín tránh hở nhân. Luộc bánh trong nước sôi đến khi nổi lên là chín.',
      nutritionNotes: 'Món ăn nhẹ, giàu đạm.',
      ingredients: {
        deleteMany: {},
        create: [
          { name: 'Bột năng', amount: 300, unit: 'gram', order: 1 },
          { name: 'Tôm tươi', amount: 200, unit: 'gram', notes: 'bóc vỏ, băm nhỏ', order: 2 },
          { name: 'Thịt ba chỉ', amount: 150, unit: 'gram', notes: 'băm nhỏ', order: 3 },
          { name: 'Hành tím băm', amount: 2, unit: 'củ', order: 4 },
          { name: 'Nước mắm, tiêu, muối', amount: 1, unit: 'bộ', order: 5 },
          { name: 'Lá chuối (hoặc nilon)', amount: 1, unit: 'gói', order: 6 },
        ],
      },
      steps: {
        deleteMany: {},
        create: [
          { stepNumber: 1, description: 'Pha bột: trộn bột năng với nước sôi, nhồi thành khối dẻo.', timer: 600, order: 1 },
          { stepNumber: 2, description: 'Xào nhân: phi hành tím, cho tôm, thịt vào xào chín, nêm nước mắm, tiêu.', timer: 300, order: 2 },
          { stepNumber: 3, description: 'Viên bột, cán mỏng, cho nhân vào giữa, gấp đôi, ép kín.', order: 3 },
          { stepNumber: 4, description: 'Luộc bánh trong nồi nước sôi, khi bánh nổi lên là chín.', timer: 600, order: 4 },
          { stepNumber: 5, description: 'Vớt bánh ra tô nước lạnh, sau đó xếp ra đĩa, chấm nước mắm chua ngọt.', order: 5 },
        ],
      },
      tools: {
        deleteMany: {},
        create: [
          { name: 'Nồi luộc', isRequired: true },
          { name: 'Chảo xào', isRequired: true },
          { name: 'Màng bọc thực phẩm hoặc lá chuối', isRequired: true },
        ],
      },
    },
    create: {
      foodId: food.id,
      title: 'Cách làm Bánh bột lọc nhân tôm thịt',
      summary: 'Bánh bột lọc trong dai, nhân tôm thịt đậm đà.',
      prepTime: 30,
      cookTime: 20,
      totalTime: 50,
      servings: 4,
      difficulty: Difficulty.EASY,
      tips: 'Nhồi bột kỹ, gói kín.',
      nutritionNotes: 'Món nhẹ, giàu đạm.',
      ingredients: { create: [] },
      steps: { create: [] },
      tools: { create: [] },
    },
  });

  console.log(`✅ Import công thức cho "${foodName}" thành công`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());