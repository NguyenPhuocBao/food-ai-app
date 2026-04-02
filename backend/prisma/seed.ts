import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const foodData = [
  { 
    name: "Phở bò", 
    slug: "pho-bo", 
    category: "Món nước", 
    description: "Phở bò Hà Nội với nước dùng đậm đà", 
    calories: 450, 
    protein: 25, 
    fat: 10, 
    carbs: 60,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  { 
    name: "Bún chả", 
    slug: "bun-cha", 
    category: "Món khô", 
    description: "Bún chả Hà Nội với thịt nướng thơm lừng", 
    calories: 550, 
    protein: 30, 
    fat: 20, 
    carbs: 65,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  { 
    name: "Cơm tấm", 
    slug: "com-tam", 
    category: "Món khô", 
    description: "Cơm tấm Sài Gòn với sườn nướng", 
    calories: 650, 
    protein: 35, 
    fat: 25, 
    carbs: 70,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  { 
    name: "Bánh mì", 
    slug: "banh-mi", 
    category: "Món khô", 
    description: "Bánh mì Sài Gòn", 
    calories: 350, 
    protein: 15, 
    fat: 12, 
    carbs: 45,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  { 
    name: "Gỏi cuốn", 
    slug: "goi-cuon", 
    category: "Món khô", 
    description: "Gỏi cuốn tôm thịt", 
    calories: 120, 
    protein: 8, 
    fat: 3, 
    carbs: 18,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  { 
    name: "Bún bò Huế", 
    slug: "bun-bo-hue", 
    category: "Món nước", 
    description: "Bún bò Huế cay nồng", 
    calories: 500, 
    protein: 28, 
    fat: 15, 
    carbs: 55,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  { 
    name: "Cháo lòng", 
    slug: "chao-long", 
    category: "Món nước", 
    description: "Cháo lòng heo", 
    calories: 380, 
    protein: 20, 
    fat: 12, 
    carbs: 45,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  { 
    name: "Xôi xéo", 
    slug: "xoi-xeo", 
    category: "Món khô", 
    description: "Xôi xéo với đậu xanh", 
    calories: 420, 
    protein: 12, 
    fat: 8, 
    carbs: 75,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false
  },
  { 
    name: "Bánh xèo", 
    slug: "banh-xeo", 
    category: "Món khô", 
    description: "Bánh xèo miền Tây", 
    calories: 280, 
    protein: 10, 
    fat: 15, 
    carbs: 30,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  { 
    name: "Hủ tiếu", 
    slug: "hu-tieu", 
    category: "Món nước", 
    description: "Hủ tiếu Nam Vang", 
    calories: 380, 
    protein: 18, 
    fat: 10, 
    carbs: 50,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  }
];

async function main() {
  console.log('🌱 Seeding database...');
  
  for (const food of foodData) {
    await prisma.foodItem.upsert({
      where: { name: food.name },
      update: {},
      create: food
    });
    console.log(`✅ Created: ${food.name}`);
  }
  
  console.log('✅ Seeding completed!');
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });