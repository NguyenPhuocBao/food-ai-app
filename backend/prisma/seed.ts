import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// Helper để tạo slug
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Định nghĩa kiểu dữ liệu cho công thức
interface RecipeInput {
  title: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: Difficulty;
  tips: string;
  ingredients: { name: string; amount: number; unit: string; notes?: string; order: number }[];
  steps: { stepNumber: number; description: string; timer?: number; order: number }[];
}

// Công thức chi tiết cho 10 món đặc trưng
const recipeOverrides: Record<string, RecipeInput> = {
  'Phở bò': {
    title: 'Phở bò Hà Nội – Nước dùng ngọt thanh',
    prepTime: 30,
    cookTime: 180,
    servings: 4,
    difficulty: Difficulty.MEDIUM,
    tips: 'Để nước dùng trong, hớt bọt thường xuyên và ninh lửa nhỏ.',
    ingredients: [
      { name: 'Xương ống bò', amount: 1.5, unit: 'kg', notes: 'chặt khúc, chần sơ', order: 1 },
      { name: 'Thịt bò bắp', amount: 500, unit: 'gram', notes: 'để nguyên miếng', order: 2 },
      { name: 'Gừng', amount: 1, unit: 'củ', notes: 'nướng thơm', order: 3 },
      { name: 'Hành tây', amount: 2, unit: 'củ', notes: 'nướng', order: 4 },
      { name: 'Quế', amount: 1, unit: 'thanh', order: 5 },
      { name: 'Hoa hồi', amount: 3, unit: 'cánh', order: 6 },
      { name: 'Thảo quả', amount: 2, unit: 'quả', order: 7 },
      { name: 'Bánh phở tươi', amount: 1, unit: 'kg', order: 8 },
      { name: 'Hành lá', amount: 1, unit: 'bó', notes: 'thái nhỏ', order: 9 },
      { name: 'Rau thơm', amount: 1, unit: 'bó', notes: 'húng quế, ngò gai', order: 10 }
    ],
    steps: [
      { stepNumber: 1, description: 'Xương bò chần nước sôi, rửa sạch. Cho vào nồi 3 lít nước, ninh 2-3 giờ.', timer: 10800, order: 1 },
      { stepNumber: 2, description: 'Gừng, hành tây nướng thơm, cho vào nồi nước dùng.', timer: 1800, order: 2 },
      { stepNumber: 3, description: 'Thịt bò ướp muối, tiêu. Cho vào nồi luộc chín, vớt ra thái lát.', timer: 1800, order: 3 },
      { stepNumber: 4, description: 'Cho quế, hồi, thảo quả vào nồi, nêm nước mắm, muối, đường phèn.', timer: 300, order: 4 },
      { stepNumber: 5, description: 'Trụng bánh phở, xếp ra tô, xếp thịt bò lên, chan nước dùng nóng, rắc hành lá, rau thơm.', timer: 60, order: 5 }
    ]
  },
  'Bún chả': {
    title: 'Bún chả Hà Nội – Thịt nướng thơm lừng',
    prepTime: 45,
    cookTime: 30,
    servings: 4,
    difficulty: Difficulty.MEDIUM,
    tips: 'Ướp thịt ít nhất 2 tiếng để ngấm gia vị. Nướng trên than hoa sẽ thơm hơn.',
    ingredients: [
      { name: 'Thịt ba chỉ', amount: 500, unit: 'gram', order: 1 },
      { name: 'Thịt nạc vai', amount: 300, unit: 'gram', order: 2 },
      { name: 'Bún tươi', amount: 1, unit: 'kg', order: 3 },
      { name: 'Nước mắm', amount: 5, unit: 'muỗng canh', order: 4 },
      { name: 'Đường', amount: 3, unit: 'muỗng canh', order: 5 },
      { name: 'Tỏi', amount: 3, unit: 'tép', notes: 'băm nhỏ', order: 6 },
      { name: 'Ớt', amount: 2, unit: 'trái', order: 7 },
      { name: 'Đu đủ xanh', amount: 1, unit: 'trái', order: 8 },
      { name: 'Cà rốt', amount: 1, unit: 'củ', order: 9 },
      { name: 'Giấm gạo', amount: 2, unit: 'muỗng canh', order: 10 }
    ],
    steps: [
      { stepNumber: 1, description: 'Thịt ba chỉ thái lát mỏng, thịt vai xay nhuyễn. Ướp với tỏi, đường, nước mắm, hạt nêm.', timer: 7200, order: 1 },
      { stepNumber: 2, description: 'Nướng thịt trên than hoa hoặc chảo chống dính đến khi vàng đều.', timer: 1800, order: 2 },
      { stepNumber: 3, description: 'Pha nước chấm: nước mắm + đường + giấm + tỏi + ớt, khuấy tan.', timer: 300, order: 3 },
      { stepNumber: 4, description: 'Đu đủ, cà rốt bào sợi, ngâm giấm đường.', timer: 1800, order: 4 },
      { stepNumber: 5, description: 'Xếp bún ra tô, thêm thịt nướng, đu đủ, chan nước chấm.', timer: 60, order: 5 }
    ]
  },
  'Cơm tấm': {
    title: 'Cơm tấm Sài Gòn – Sườn nướng thơm ngon',
    prepTime: 60,
    cookTime: 30,
    servings: 4,
    difficulty: Difficulty.MEDIUM,
    tips: 'Sườn nên ướp qua đêm để thấm gia vị. Nướng ở nhiệt độ vừa.',
    ingredients: [
      { name: 'Sườn non', amount: 800, unit: 'gram', order: 1 },
      { name: 'Cơm tấm', amount: 1, unit: 'kg', order: 2 },
      { name: 'Bì heo', amount: 200, unit: 'gram', order: 3 },
      { name: 'Trứng', amount: 4, unit: 'quả', order: 4 },
      { name: 'Nước mắm', amount: 4, unit: 'muỗng canh', order: 5 },
      { name: 'Đường', amount: 3, unit: 'muỗng canh', order: 6 },
      { name: 'Sả', amount: 2, unit: 'cây', notes: 'băm nhỏ', order: 7 },
      { name: 'Tỏi', amount: 4, unit: 'tép', order: 8 },
      { name: 'Dầu hào', amount: 2, unit: 'muỗng canh', order: 9 }
    ],
    steps: [
      { stepNumber: 1, description: 'Sườn non chặt miếng vừa ăn, ướp với sả, tỏi, đường, nước mắm, dầu hào.', timer: 7200, order: 1 },
      { stepNumber: 2, description: 'Nướng sườn trên than hoa hoặc lò nướng 200°C trong 20 phút.', timer: 1200, order: 2 },
      { stepNumber: 3, description: 'Chả trứng: đánh tan trứng với chút nước mắm, hấp hoặc chiên.', timer: 600, order: 3 },
      { stepNumber: 4, description: 'Bì heo trộn với thính gạo, thái sợi.', timer: 300, order: 4 },
      { stepNumber: 5, description: 'Xếp cơm ra đĩa, thêm sườn, bì, chả trứng, chan nước mắm chua ngọt.', timer: 60, order: 5 }
    ]
  },
  'Bánh mì': {
    title: 'Bánh mì Sài Gòn – Giòn rụm, nhân thơm',
    prepTime: 30,
    cookTime: 15,
    servings: 4,
    difficulty: Difficulty.EASY,
    tips: 'Bánh mì nên được hâm nóng lại trước khi ăn.',
    ingredients: [
      { name: 'Bánh mì', amount: 4, unit: 'cái', order: 1 },
      { name: 'Pate gan', amount: 4, unit: 'muỗng canh', order: 2 },
      { name: 'Thịt nguội', amount: 200, unit: 'gram', notes: 'chả lụa, giò', order: 3 },
      { name: 'Đồ chua', amount: 100, unit: 'gram', notes: 'cà rốt, đu đủ', order: 4 },
      { name: 'Rau răm, ngò', amount: 1, unit: 'bó', order: 5 },
      { name: 'Ớt', amount: 2, unit: 'trái', order: 6 },
      { name: 'Tương ớt', amount: 2, unit: 'muỗng canh', order: 7 }
    ],
    steps: [
      { stepNumber: 1, description: 'Hâm nóng bánh mì trong lò vi sóng hoặc lò nướng.', timer: 180, order: 1 },
      { stepNumber: 2, description: 'Xẻ bánh mì, phết pate, xếp thịt nguội, đồ chua, rau răm.', order: 2 },
      { stepNumber: 3, description: 'Thêm tương ớt, ớt tươi tuỳ thích.', order: 3 }
    ]
  },
  'Gỏi cuốn': {
    title: 'Gỏi cuốn tôm thịt – Chấm nước mắm chua ngọt',
    prepTime: 30,
    cookTime: 10,
    servings: 4,
    difficulty: Difficulty.EASY,
    tips: 'Không nên cuốn quá chặt để bánh tráng không bị rách.',
    ingredients: [
      { name: 'Bánh tráng', amount: 20, unit: 'cái', order: 1 },
      { name: 'Tôm', amount: 300, unit: 'gram', notes: 'luộc chín, bóc vỏ', order: 2 },
      { name: 'Thịt ba chỉ', amount: 200, unit: 'gram', notes: 'luộc, thái lát', order: 3 },
      { name: 'Bún tươi', amount: 200, unit: 'gram', order: 4 },
      { name: 'Xà lách', amount: 1, unit: 'bó', order: 5 },
      { name: 'Húng quế', amount: 1, unit: 'bó', order: 6 },
      { name: 'Giá đỗ', amount: 100, unit: 'gram', order: 7 }
    ],
    steps: [
      { stepNumber: 1, description: 'Nhúng bánh tráng qua nước ấm cho mềm.', order: 1 },
      { stepNumber: 2, description: 'Đặt bánh tráng lên thớt, xếp xà lách, bún, tôm, thịt, rau thơm, giá đỗ.', order: 2 },
      { stepNumber: 3, description: 'Cuốn chặt tay, gấp hai đầu rồi cuộn tròn.', order: 3 },
      { stepNumber: 4, description: 'Làm nước chấm: pha nước mắm, đường, nước cốt chanh, tỏi, ớt.', timer: 300, order: 4 }
    ]
  },
  'Bún bò Huế': {
    title: 'Bún bò Huế – Cay nồng đậm đà',
    prepTime: 60,
    cookTime: 180,
    servings: 6,
    difficulty: Difficulty.HARD,
    tips: 'Ninh xương lấy nước dùng ngọt, sả đập dập để thơm.',
    ingredients: [
      { name: 'Xương ống bò', amount: 2, unit: 'kg', order: 1 },
      { name: 'Thịt bò bắp', amount: 500, unit: 'gram', order: 2 },
      { name: 'Giò heo', amount: 500, unit: 'gram', order: 3 },
      { name: 'Chả Huế', amount: 300, unit: 'gram', order: 4 },
      { name: 'Bún tươi', amount: 1.5, unit: 'kg', order: 5 },
      { name: 'Sả', amount: 5, unit: 'cây', notes: 'đập dập', order: 6 },
      { name: 'Mắm ruốc', amount: 2, unit: 'muỗng canh', order: 7 },
      { name: 'Ớt bột', amount: 2, unit: 'muỗng canh', order: 8 },
      { name: 'Rau muống bào', amount: 200, unit: 'gram', order: 9 },
      { name: 'Hành tây', amount: 2, unit: 'củ', order: 10 }
    ],
    steps: [
      { stepNumber: 1, description: 'Xương bò chần sơ, rửa sạch. Ninh với 4 lít nước, sả, hành tây trong 2-3 giờ.', timer: 10800, order: 1 },
      { stepNumber: 2, description: 'Cho thịt bò, giò heo vào nồi luộc chín, vớt ra thái lát.', timer: 2700, order: 2 },
      { stepNumber: 3, description: 'Phi thơm mắm ruốc, ớt bột, cho vào nồi nước dùng, nêm nước mắm, muối.', order: 3 },
      { stepNumber: 4, description: 'Trụng bún, xếp ra tô, thêm thịt, giò, chả, chan nước dùng nóng.', order: 4 },
      { stepNumber: 5, description: 'Ăn kèm rau muống bào, hành lá, ớt.', order: 5 }
    ]
  },
  'Cháo lòng': {
    title: 'Cháo lòng heo – Thơm ngon béo ngậy',
    prepTime: 45,
    cookTime: 90,
    servings: 4,
    difficulty: Difficulty.MEDIUM,
    tips: 'Lòng heo cần làm sạch kỹ với muối và chanh.',
    ingredients: [
      { name: 'Gạo tẻ', amount: 200, unit: 'gram', order: 1 },
      { name: 'Lòng heo', amount: 500, unit: 'gram', order: 2 },
      { name: 'Gan heo', amount: 200, unit: 'gram', order: 3 },
      { name: 'Xương ống heo', amount: 500, unit: 'gram', order: 4 },
      { name: 'Hành tím', amount: 3, unit: 'củ', order: 5 },
      { name: 'Hành lá, ngò', amount: 1, unit: 'bó', order: 6 },
      { name: 'Tiêu', amount: 1, unit: 'muỗng cà phê', order: 7 }
    ],
    steps: [
      { stepNumber: 1, description: 'Xương ống hầm lấy nước ngọt. Gạo vo sạch, nấu cháo với nước hầm xương.', timer: 5400, order: 1 },
      { stepNumber: 2, description: 'Lòng, gan heo làm sạch, luộc chín, thái sợi.', timer: 1800, order: 2 },
      { stepNumber: 3, description: 'Phi hành tím, xào lòng và gan, nêm gia vị.', order: 3 },
      { stepNumber: 4, description: 'Cho lòng, gan vào cháo, nấu thêm 5 phút.', order: 4 },
      { stepNumber: 5, description: 'Múc ra tô, rắc hành lá, ngò, tiêu.', order: 5 }
    ]
  },
  'Xôi xéo': {
    title: 'Xôi xéo – Xôi đậu xanh thơm bùi',
    prepTime: 120,
    cookTime: 40,
    servings: 4,
    difficulty: Difficulty.EASY,
    tips: 'Ngâm gạo nếp và đậu xanh ít nhất 2 tiếng trước khi nấu.',
    ingredients: [
      { name: 'Gạo nếp', amount: 500, unit: 'gram', order: 1 },
      { name: 'Đậu xanh không vỏ', amount: 200, unit: 'gram', order: 2 },
      { name: 'Nước cốt dừa', amount: 200, unit: 'ml', order: 3 },
      { name: 'Hành phi', amount: 3, unit: 'muỗng canh', order: 4 },
      { name: 'Muối', amount: 1, unit: 'muỗng cà phê', order: 5 },
      { name: 'Đường', amount: 1, unit: 'muỗng canh', order: 6 }
    ],
    steps: [
      { stepNumber: 1, description: 'Ngâm nếp và đậu xanh riêng 2 giờ.', timer: 7200, order: 1 },
      { stepNumber: 2, description: 'Nếp trộn nước cốt dừa, muối, hấp chín.', timer: 1800, order: 2 },
      { stepNumber: 3, description: 'Đậu xanh hấp chín, tán nhuyễn, xào với đường và hành phi.', timer: 1200, order: 3 },
      { stepNumber: 4, description: 'Xếp xôi ra đĩa, rải đậu xanh và hành phi lên trên.', order: 4 }
    ]
  },
  'Bánh xèo': {
    title: 'Bánh xèo miền Tây – Giòn rụm nhân tôm thịt',
    prepTime: 30,
    cookTime: 40,
    servings: 4,
    difficulty: Difficulty.MEDIUM,
    tips: 'Bột bánh xèo pha loãng, để nghỉ 30 phút trước khi đổ.',
    ingredients: [
      { name: 'Bột bánh xèo', amount: 200, unit: 'gram', order: 1 },
      { name: 'Nước cốt dừa', amount: 400, unit: 'ml', order: 2 },
      { name: 'Tôm', amount: 200, unit: 'gram', order: 3 },
      { name: 'Thịt ba chỉ', amount: 150, unit: 'gram', order: 4 },
      { name: 'Giá đỗ', amount: 200, unit: 'gram', order: 5 },
      { name: 'Hành lá', amount: 1, unit: 'bó', order: 6 },
      { name: 'Rau sống', amount: 1, unit: 'bó', order: 7 }
    ],
    steps: [
      { stepNumber: 1, description: 'Pha bột với nước cốt dừa, hành lá, để nghỉ 30 phút.', timer: 1800, order: 1 },
      { stepNumber: 2, description: 'Phi hành, xào tôm, thịt sơ qua.', timer: 300, order: 2 },
      { stepNumber: 3, description: 'Đổ bột vào chảo dầu nóng, tráng đều, thêm nhân tôm thịt và giá đỗ.', timer: 300, order: 3 },
      { stepNumber: 4, description: 'Đậy nắp, chiên đến khi bánh vàng giòn, gập đôi.', order: 4 },
      { stepNumber: 5, description: 'Ăn kèm rau sống, nước mắm chua ngọt.', order: 5 }
    ]
  }
};

// Công thức mặc định cho các món còn lại
const defaultRecipe: RecipeInput = {
  title: 'Cách chế biến món ăn',
  prepTime: 20,
  cookTime: 30,
  servings: 4,
  difficulty: Difficulty.MEDIUM,
  tips: 'Nêm nếm gia vị vừa ăn, có thể thay đổi nguyên liệu theo sở thích.',
  ingredients: [
    { name: 'Nguyên liệu chính', amount: 500, unit: 'gram', notes: 'tuỳ chọn', order: 1 },
    { name: 'Gia vị', amount: 1, unit: 'bộ', notes: 'muối, đường, bột ngọt, tiêu', order: 2 },
    { name: 'Rau thơm', amount: 1, unit: 'bó', order: 3 }
  ],
  steps: [
    { stepNumber: 1, description: 'Sơ chế nguyên liệu sạch sẽ.', order: 1 },
    { stepNumber: 2, description: 'Chế biến theo công thức cơ bản, nêm nếm vừa ăn.', order: 2 },
    { stepNumber: 3, description: 'Trình bày ra đĩa và thưởng thức.', order: 3 }
  ]
};

// Danh sách 30 món ăn Việt (đầy đủ)
const dishes = [
  { name: 'Phở bò', category: 'Món nước', calories: 450, protein: 25, fat: 10, carbs: 60, description: 'Phở bò Hà Nội với nước dùng đậm đà, thịt bò mềm.', isVegetarian: false, isVegan: false },
  { name: 'Bún chả', category: 'Món khô', calories: 550, protein: 30, fat: 20, carbs: 65, description: 'Bún chả Hà Nội với thịt nướng thơm lừng.', isVegetarian: false, isVegan: false },
  { name: 'Cơm tấm', category: 'Món khô', calories: 650, protein: 35, fat: 25, carbs: 70, description: 'Cơm tấm Sài Gòn với sườn nướng, bì, chả trứng.', isVegetarian: false, isVegan: false },
  { name: 'Bánh mì', category: 'Món khô', calories: 350, protein: 15, fat: 12, carbs: 45, description: 'Bánh mì Sài Gòn với pate, thịt nguội, rau.', isVegetarian: false, isVegan: false },
  { name: 'Gỏi cuốn', category: 'Món khô', calories: 120, protein: 8, fat: 3, carbs: 18, description: 'Gỏi cuốn tôm thịt chấm nước mắm chua ngọt.', isVegetarian: false, isVegan: false },
  { name: 'Bún bò Huế', category: 'Món nước', calories: 500, protein: 28, fat: 15, carbs: 55, description: 'Bún bò Huế cay nồng với giò heo, chả.', isVegetarian: false, isVegan: false },
  { name: 'Cháo lòng', category: 'Món nước', calories: 380, protein: 20, fat: 12, carbs: 45, description: 'Cháo lòng heo thơm ngon, béo ngậy.', isVegetarian: false, isVegan: false },
  { name: 'Xôi xéo', category: 'Món khô', calories: 420, protein: 12, fat: 8, carbs: 75, description: 'Xôi xéo với đậu xanh, hành phi.', isVegetarian: true, isVegan: true },
  { name: 'Bánh xèo', category: 'Món khô', calories: 280, protein: 10, fat: 15, carbs: 30, description: 'Bánh xèo miền Tây với tôm, thịt, giá.', isVegetarian: false, isVegan: false },
  { name: 'Hủ tiếu', category: 'Món nước', calories: 380, protein: 18, fat: 10, carbs: 50, description: 'Hủ tiếu Nam Vang với tôm, thịt, gan heo.', isVegetarian: false, isVegan: false },
  { name: 'Bánh cuốn', category: 'Món khô', calories: 200, protein: 8, fat: 5, carbs: 35, description: 'Bánh cuốn nóng nhân thịt, chả lụa.', isVegetarian: false, isVegan: false },
  { name: 'Bún riêu', category: 'Món nước', calories: 420, protein: 22, fat: 12, carbs: 50, description: 'Bún riêu cua với đậu phụ, cà chua.', isVegetarian: false, isVegan: false },
  { name: 'Mì Quảng', category: 'Món nước', calories: 480, protein: 20, fat: 14, carbs: 65, description: 'Mì Quảng gà, tôm, thịt.', isVegetarian: false, isVegan: false },
  { name: 'Cao lầu', category: 'Món khô', calories: 450, protein: 18, fat: 12, carbs: 60, description: 'Cao lầu Hội An với thịt xá xíu.', isVegetarian: false, isVegan: false },
  { name: 'Bánh canh', category: 'Món nước', calories: 400, protein: 15, fat: 10, carbs: 55, description: 'Bánh canh cua hoặc giò heo.', isVegetarian: false, isVegan: false },
  { name: 'Chả giò', category: 'Món khô', calories: 150, protein: 6, fat: 10, carbs: 12, description: 'Chả giò chiên giòn rụm.', isVegetarian: false, isVegan: false },
  { name: 'Bò kho', category: 'Món nước', calories: 520, protein: 35, fat: 20, carbs: 40, description: 'Bò kho với bánh mì.', isVegetarian: false, isVegan: false },
  { name: 'Cà ri gà', category: 'Món nước', calories: 480, protein: 28, fat: 18, carbs: 45, description: 'Cà ri gà ăn kèm bánh mì.', isVegetarian: false, isVegan: false },
  { name: 'Lẩu Thái', category: 'Món nước', calories: 600, protein: 35, fat: 25, carbs: 50, description: 'Lẩu Thái hải sản chua cay.', isVegetarian: false, isVegan: false },
  { name: 'Bánh bột lọc', category: 'Món khô', calories: 180, protein: 5, fat: 3, carbs: 35, description: 'Bánh bột lọc nhân tôm thịt.', isVegetarian: false, isVegan: false },
  { name: 'Bánh bèo', category: 'Món khô', calories: 150, protein: 4, fat: 2, carbs: 30, description: 'Bánh bèo Huế với tôm chấy.', isVegetarian: false, isVegan: false },
  { name: 'Bánh ướt', category: 'Món khô', calories: 200, protein: 6, fat: 4, carbs: 38, description: 'Bánh ướt chả lụa, chả chiên.', isVegetarian: false, isVegan: false },
  { name: 'Bánh hỏi', category: 'Món khô', calories: 220, protein: 8, fat: 5, carbs: 40, description: 'Bánh hỏi lòng heo hoặc thịt nướng.', isVegetarian: false, isVegan: false },
  { name: 'Bún mắm', category: 'Món nước', calories: 480, protein: 25, fat: 12, carbs: 55, description: 'Bún mắm miền Tây với cá linh, mắm.', isVegetarian: false, isVegan: false },
  { name: 'Bún đậu mắm tôm', category: 'Món khô', calories: 500, protein: 28, fat: 18, carbs: 60, description: 'Bún đậu mắm tôm Hà Nội.', isVegetarian: false, isVegan: false },
  { name: 'Nem chua', category: 'Món khô', calories: 80, protein: 8, fat: 4, carbs: 5, description: 'Nem chua Thanh Hóa.', isVegetarian: false, isVegan: false },
  { name: 'Chè', category: 'Tráng miệng', calories: 250, protein: 4, fat: 2, carbs: 55, description: 'Chè ba màu, chè thập cẩm.', isVegetarian: true, isVegan: true },
  { name: 'Sữa chua', category: 'Tráng miệng', calories: 100, protein: 5, fat: 3, carbs: 15, description: 'Sữa chua trái cây.', isVegetarian: true, isVegan: false },
  { name: 'Trái cây dĩa', category: 'Tráng miệng', calories: 80, protein: 1, fat: 0, carbs: 20, description: 'Đĩa trái cây tươi.', isVegetarian: true, isVegan: true },
  { name: 'Cà phê sữa đá', category: 'Đồ uống', calories: 120, protein: 2, fat: 3, carbs: 20, description: 'Cà phê sữa đá đậm đà.', isVegetarian: true, isVegan: false }
];

async function main() {
  console.log('🌱 Bắt đầu seed 30 món ăn Việt kèm công thức...');

  for (const dish of dishes) {
    const slug = slugify(dish.name);
    const recipe = recipeOverrides[dish.name] || defaultRecipe;

    // Upsert món ăn
    const food = await prisma.foodItem.upsert({
      where: { name: dish.name },
      update: {},
      create: {
        name: dish.name,
        slug,
        category: dish.category,
        description: dish.description,
        calories: dish.calories,
        protein: dish.protein,
        fat: dish.fat,
        carbs: dish.carbs,
        isVegetarian: dish.isVegetarian,
        isVegan: dish.isVegan,
        isGlutenFree: false,
        popularity: 0
      }
    });

    console.log(`✅ Đã xử lý món: ${dish.name}`);

    // Tạo hoặc cập nhật công thức (nếu chưa có)
    const existingRecipe = await prisma.recipe.findUnique({
      where: { foodId: food.id }
    });

    if (!existingRecipe) {
      await prisma.recipe.create({
        data: {
          foodId: food.id,
          title: recipe.title,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          totalTime: recipe.prepTime + recipe.cookTime,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          tips: recipe.tips,
          ingredients: {
            create: recipe.ingredients.map(ing => ({
              ...ing,
              order: ing.order ?? 0
            }))
          },
          steps: {
            create: recipe.steps.map(step => ({
              ...step,
              order: step.order ?? step.stepNumber
            }))
          }
        }
      });
      console.log(`  📖 Đã tạo công thức cho: ${dish.name}`);
    } else {
      console.log(`  ⚠️ Công thức đã tồn tại cho: ${dish.name}, bỏ qua.`);
    }
  }

  console.log('✅ Seed hoàn tất!');
}

main()
  .catch(e => {
    console.error('❌ Lỗi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });