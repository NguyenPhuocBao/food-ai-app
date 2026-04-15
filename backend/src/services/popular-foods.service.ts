import { Prisma } from '@prisma/client';

const baseDishes = [
  'Pho bo',
  'Pho ga',
  'Bun bo Hue',
  'Bun cha',
  'Banh mi trung',
  'Banh mi ga nuong',
  'Com tam suon',
  'Com ga luoc',
  'Com ga nuong',
  'Com bo xao',
  'Canh chua ca',
  'Canh bi do',
  'Canh cai xanh',
  'Ga ap chao',
  'Ga hap gung',
  'Salad uc ga',
  'Salad ca ngu',
  'Yen mach sua chua',
  'Chao yach mach',
  'Khoai lang luoc',
  'Khoai tay nuong',
  'Com gao lut ca hoi',
  'Com gao lut uc ga',
  'Mien ga',
  'Hu tieu nam vang',
  'Bun rieu',
  'Bun ca',
  'Mi quang',
  'Mi tom rau bo',
  'Mi xao hai san',
  'Ca thu kho',
  'Ca salmon ap chao',
  'Tom hap',
  'Tom xao bong cai',
  'Thit heo luoc',
  'Thit bo nuong',
  'Dau hu sot ca chua',
  'Dau hu xao nam',
  'Rau muong xao toi',
  'Rau cai luoc',
  'Bong cai hap',
  'Trung op la',
  'Trung cuon rau',
  'Sua chua hat chia',
  'Sinh to bo',
  'Sinh to chuoi',
  'Chao ga rau cu',
  'Sup bi do ga',
  'Sup rau cu bo',
  'Banh cuon',
  'Banh xeo',
  'Goi cuon tom thit',
  'Goi ga bap cai',
  'Ca kho to',
  'Thit kho tieu',
  'Bo luc lac',
  'Com chien duong chau',
  'Com chien ca man',
  'Bun thit nuong',
  'Bun mam',
  'Bun moc',
  'Bun ga nam',
  'Bun chay',
  'Com chay kho quet',
  'Ca ngu kho dua',
  'Ga xao sa ot',
  'Bo xao can tay',
  'Thit bam sot dau',
  'Lau nam chay',
  'Lau ga la e',
  'Lau thai hai san',
  'Lau ca',
  'Muc hap gung',
  'Muc xao can',
  'Tom rim',
  'Sup cua',
  'Chao tom',
  'Chao ca hoi',
  'Com rong bien ca hoi',
  'Com suon nuong mat ong',
  'Mi trung ga',
  'Mi xao bo',
  'Pho xao bo',
  'Nui xao bo',
  'Banh da cua',
  'Banh canh cua',
  'Banh canh gio heo',
  'Banh canh ga',
  'Xoi ga',
  'Xoi dau xanh',
  'Chao long',
  'Bun dau mam tom',
  'Bun moc suon',
  'Bun suon non',
  'Com suon trung',
  'Com ca kho',
  'Com tom chien',
  'Com dau hu rau',
  'Com chay nam',
  'Com ga xoi mo',
  'Com ga hai nam',
  'Sup ga ngo',
  'Sup tom rau cu',
  'Goi ngo sen tom',
  'Goi bo bop thau',
  'Bo bit tet khoai',
  'Ga nuong ngu vi',
  'Dau hu chien xa ot',
  'Dau hu kho nam',
  'Canh mung toi',
  'Canh rong bien',
  'Canh kho qua nhoi thit',
  'Canh ga hat sen',
  'Canh cua rau day',
  'Canh chua tom',
  'Tom chien toi',
  'Tom nuong muoi ot',
  'Ca chien xu',
  'Ca hap xi dau',
  'Bo ham rau cu',
  'Ga ham nam',
  'Thit vien sot ca',
  'Nuoc ep tao can tay',
  'Nuoc ep dua leo',
  'Sua hat oc cho',
  'Sua dau nanh',
  'Sua tuoi khong duong',
  'Trung luoc',
  'Chuoi va bo lac',
  'Tao va sua chua',
  'Hat dieu rang',
  'Hanh nhan rang',
  'Rau tron ngu coc',
  'Com tron ga xong khoi',
  'Com tron bo rau',
  'Bun tron ga xoi',
  'Bun tron bo xao',
  'Pho ga tron',
  'Pho bo tron',
  'Salad tong hop',
  'Salad dau ngu',
  'Salad bo trung',
  'Salad ga quinoa',
  'Sandwich ga',
  'Sandwich trung',
  'Sandwich ca ngu',
  'Burger bo tu lam',
  'Burger ga nuong',
  'Pasta ga kem nam',
  'Pasta bo bam',
  'Pasta h?i san',
];

const proteins = [
  'ga nuong',
  'bo xao',
  'ca hoi ap chao',
  'ca ngu kho',
  'tom hap',
  'dau hu sot',
  'thit heo luoc',
  'trung op la',
  'uc ga luoc',
  'bo ham',
  'ca thu nuong',
  'tom chien toi',
];

const carbs = [
  'com gao lut',
  'com trang',
  'bun tuoi',
  'mi trung',
  'mien dong',
  'khoai lang',
  'khoai tay nuong',
  'yen mach',
  'nui',
  'banh mi nguyen cam',
];

const vegetables = [
  'rau muong',
  'bong cai xanh',
  'rau cai',
  'bi do',
  'dua leo',
  'ca chua',
  'xalach',
  'ca rot',
  'dau que',
  'nam huong',
];

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const buildNutrition = (seed: number) => {
  const calories = 180 + (seed % 19) * 28;
  const protein = 12 + (seed % 9) * 2.4;
  const fat = 4 + (seed % 8) * 1.8;
  const carbs = 14 + (seed % 11) * 5.2;
  const fiber = 2 + (seed % 5) * 1.1;

  return {
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fiber: Math.round(fiber * 10) / 10,
    sugar: Math.round((seed % 10) * 0.8 * 10) / 10,
  };
};

const generateCompositeDishes = () => {
  const output: string[] = [];

  for (let i = 0; i < proteins.length; i++) {
    for (let j = 0; j < carbs.length; j++) {
      for (let k = 0; k < vegetables.length; k++) {
        output.push(`${carbs[j]} ${proteins[i]} ${vegetables[k]}`);
        if (output.length >= 220) return output;
      }
    }
  }

  return output;
};

export const buildPopularFoodSeedData = (limit = 240): Prisma.FoodItemCreateManyInput[] => {
  const names = [...baseDishes, ...generateCompositeDishes()]
    .map((name) => name.trim())
    .filter(Boolean);

  const uniqueNames = Array.from(new Set(names)).slice(0, Math.max(200, Math.min(limit, 500)));

  return uniqueNames.map((name, index) => {
    const nutrition = buildNutrition(index + 1);
    const category = index % 5 === 0
      ? 'Mon Viet'
      : index % 5 === 1
        ? 'Com va Bun'
        : index % 5 === 2
          ? 'Mon Dam'
          : index % 5 === 3
            ? 'Mon Chay'
            : 'An Nhe';

    return {
      name,
      slug: `${normalizeSlug(name)}-${index + 1}`,
      category,
      description: `Mon pho bien #${index + 1} trong thu vien thuc don suc khoe.`,
      imageUrl: null,
      calories: nutrition.calories,
      protein: nutrition.protein,
      fat: nutrition.fat,
      carbs: nutrition.carbs,
      fiber: nutrition.fiber,
      sugar: nutrition.sugar,
      popularity: 50 + (index % 50),
      isVegetarian: /chay|dau hu|salad|rau|yen mach|nuoc ep/i.test(name),
      isVegan: /chay|dau hu|salad|rau|nuoc ep/i.test(name),
      isGlutenFree: !/mi|banh mi|nui|pasta|banh/i.test(name),
    };
  });
};
