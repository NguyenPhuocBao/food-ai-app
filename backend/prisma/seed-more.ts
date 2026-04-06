import { PrismaClient, MealType } from '@prisma/client';
const prisma = new PrismaClient();

const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

async function main() {
  // Thêm 10 user ngẫu nhiên (nếu chưa có)
  for (let i = 1; i <= 10; i++) {
    await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrIy9Nq4G0yV5qQpL5wVqL5wVqL5wV', // 123456
        name: `User ${i}`,
        role: 'USER',
        isActive: true,
        profile: {
          create: {
            height: 160 + Math.random() * 20,
            weight: 50 + Math.random() * 30,
            targetCalories: 2000,
            targetProtein: 150,
            targetFat: 55,
            targetCarbs: 250,
          }
        }
      }
    });
  }
  console.log('✅ Added 10 users');
  
  // Lấy danh sách món ăn và user
  const foods = await prisma.foodItem.findMany();
  const users = await prisma.user.findMany();
  
  if (foods.length === 0) {
    console.warn('⚠️ No foods found. Run main seed first.');
    return;
  }

  // Thêm meals ngẫu nhiên cho mỗi user
  for (const user of users) {
    for (let i = 0; i < 5; i++) {
      const randomFood = foods[Math.floor(Math.random() * foods.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      await prisma.meal.create({
        data: {
          userId: user.id,
          foodId: randomFood.id,
          mealType: mealTypes[Math.floor(Math.random() * mealTypes.length)],
          eatenAt: date,
          quantity: 1,
          calories: randomFood.calories,
          protein: randomFood.protein,
          fat: randomFood.fat,
          carbs: randomFood.carbs,
        }
      });
    }
  }
  console.log('✅ Added meals');
  
  // Thêm reviews
  for (const user of users) {
    for (let i = 0; i < 3; i++) {
      const randomFood = foods[Math.floor(Math.random() * foods.length)];
      await prisma.review.create({
        data: {
          userId: user.id,
          foodId: randomFood.id,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: 'Món ngon!',
        }
      });
    }
  }
  console.log('✅ Added reviews');
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());