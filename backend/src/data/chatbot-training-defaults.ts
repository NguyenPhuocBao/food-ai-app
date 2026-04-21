export type TrainingExampleSeed = {
  question: string;
  answer: string;
  tags?: readonly string[];
};

const TARGET_DEFAULT_TRAINING_COUNT = 1000;

const goals = [
  {
    key: 'giam_can',
    label: 'giam can',
    strategy: 'giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh',
    carbHint: 'kiem soat tinh bot vao bua toi va tang van dong hang ngay',
  },
  {
    key: 'tang_co',
    label: 'tang co',
    strategy: 'du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua',
    carbHint: 'bo sung carb hop ly quanh buoi tap de phuc hoi glycogen',
  },
  {
    key: 'duy_tri',
    label: 'duy tri can nang',
    strategy: 'giu tong nang luong can bang va uu tien thuc pham it che bien',
    carbHint: 'giu khau phan on dinh, tranh an qua sat gio ngu',
  },
  {
    key: 'giam_mo',
    label: 'giam mo',
    strategy: 'duy tri tham hut nhe, tap suc manh va ngu du giac',
    carbHint: 'giu chat luong carb cao, tang chat xo va giam do ngot',
  },
  {
    key: 'on_dinh_duong_huyet',
    label: 'on dinh duong huyet',
    strategy: 'chia bua deu, uu tien nguon carb hap thu cham va dam nac',
    carbHint: 'han che do uong co duong va mon tinh bot tinh che',
  },
] as const;

const meals = [
  { key: 'sang', label: 'bua sang', timing: 'bat dau ngay moi', portion: 'khoi luong vua du de tinh tao' },
  { key: 'trua', label: 'bua trua', timing: 'duy tri nang luong buoi chieu', portion: 'day du dam, rau va tinh bot hop ly' },
  { key: 'toi', label: 'bua toi', timing: 'truoc gio ngu', portion: 'giam chat beo va tinh bot qua nhieu' },
  { key: 'phu_sang', label: 'bua phu sang', timing: 'giua sang', portion: 'nhe, de tieu va giau chat xo' },
  { key: 'phu_chieu', label: 'bua phu chieu', timing: 'giua chieu', portion: 'nho gon, tranh tang duong huyet dot ngot' },
] as const;

const proteins = [
  'uc ga',
  'ca hoi',
  'ca thu',
  'bo nac',
  'trung ga',
  'tom',
  'dau hu',
  'sua chua khong duong',
  'sua Hy Lap',
  'thit lon nac',
  'ca basa',
  'dau nanh',
] as const;

const carbs = [
  'com gao lut',
  'khoai lang',
  'banh mi nguyen cam',
  'yach mach',
  'bun gao lut',
  'mi nguyen cam',
  'ngo luoc',
  'dau do',
] as const;

const veggies = [
  'rau cai xanh',
  'bong cai xanh',
  'ca rot',
  'dua leo',
  'ca chua',
  'rau bina',
  'bi do',
  'rau muong',
  'nam',
  'rau tron',
] as const;

const healthyFats = [
  'bo',
  'hat oc cho',
  'hat hanh nhan',
  'hat chia',
  'hat lanh',
  'dau oliu',
  'hat dieu',
  'ca beo',
] as const;

const conditions = [
  {
    key: 'cao_huyet_ap',
    label: 'cao huyet ap',
    avoid: 'giam muoi duoi 5g/ngay va tranh thuc pham dong hop',
    focus: 'tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky',
  },
  {
    key: 'tieu_duong',
    label: 'tieu duong type 2',
    avoid: 'han che nuoc ngot va tinh bot tinh che',
    focus: 'chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet',
  },
  {
    key: 'mo_mau_cao',
    label: 'mo mau cao',
    avoid: 'giam mo dong vat, noi tang va do chien ngap dau',
    focus: 'uu tien ca, dau hat va chat xo hoa tan',
  },
  {
    key: 'gan_nhiem_mo',
    label: 'gan nhiem mo',
    avoid: 'giam duong don va ruou bia',
    focus: 'kiem soat can nang, uu tien dam nac va rau xanh',
  },
  {
    key: 'gout',
    label: 'gout',
    avoid: 'han che phu tang, hai san giau purin va bia ruou',
    focus: 'uong du nuoc, uu tien dam it purin va theo doi acid uric',
  },
  {
    key: 'dau_da_day',
    label: 'da day nhay cam',
    avoid: 'han che mon qua cay, qua chua va ca phe luc doi',
    focus: 'chia bua nho, an cham va dung gia vi nhe',
  },
  {
    key: 'hoi_chung_ruot_kich_thich',
    label: 'hoi chung ruot kich thich',
    avoid: 'theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can',
    focus: 'thu nhat ky An uong de xac dinh mon gay trieu chung',
  },
  {
    key: 'thieu_mau',
    label: 'nguy co thieu mau',
    avoid: 'khong bo bua va khong chi an tinh bot don thuan',
    focus: 'ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu',
  },
  {
    key: 'benh_than_som',
    label: 'benh than giai doan som',
    avoid: 'khong an qua man va khong tu y bo sung protein cao',
    focus: 'can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky',
  },
  {
    key: 'suy_giap',
    label: 'suy giap',
    avoid: 'duong nhieu va do an sieu che bien',
    focus: 'giu lich an deu, du dam va vi chat theo tu van y te',
  },
] as const;

const workouts = [
  { key: 'gym_suc_manh', label: 'tap ta suc manh', note: 'uu tien dam sau tap de phuc hoi co' },
  { key: 'chay_bo', label: 'chay bo', note: 'can bo sung nuoc va carb phu hop cuong do' },
  { key: 'dap_xe', label: 'dap xe', note: 'du nang luong truoc tap neu buoi tap dai' },
  { key: 'boi', label: 'boi', note: 'an nhe truoc tap va bo sung protein sau tap' },
  { key: 'yoga', label: 'yoga', note: 'giu bua nhe de tranh nang bung khi tap' },
  { key: 'hitt', label: 'HIIT', note: 'uu tien phuc hoi voi protein + carb sau tap' },
  { key: 'di_bo_nhanh', label: 'di bo nhanh', note: 'du nuoc va snack nhe neu tap lau' },
  { key: 'the_thao_doi_khang', label: 'the thao doi khang', note: 'chia nho bua an quanh lich tap thi dau' },
] as const;

const trainingPhases = [
  {
    key: 'truoc_tap',
    label: 'truoc tap',
    guide: 'an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao',
  },
  {
    key: 'sau_tap',
    label: 'sau tap',
    guide: 'bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop',
  },
  {
    key: 'ngay_khong_tap',
    label: 'ngay khong tap',
    guide: 'giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te',
  },
] as const;

const habits = [
  {
    key: 'an_dem',
    question: 'Toi hay an dem, can sua sao?',
    advice: 'dat gio dong bep co dinh, uu tien bua toi du dam va chat xo de giam doi muon',
  },
  {
    key: 'bo_bua_sang',
    question: 'Toi thuong bo bua sang, co sao khong?',
    advice: 'thu bua sang nho gon nhung co dam de giam an bu vao cuoi ngay',
  },
  {
    key: 'uong_it_nuoc',
    question: 'Toi uong qua it nuoc, lam sao de duy tri?',
    advice: 'chia moc uong nuoc theo khung gio va dat binh nuoc trong tam mat',
  },
  {
    key: 'an_nhanh',
    question: 'Toi an qua nhanh, can dieu chinh the nao?',
    advice: 'an cham hon, dat thia xuong giua cac mieng va theo doi muc no',
  },
  {
    key: 'thich_do_ngot',
    question: 'Toi rat them do ngot vao buoi chieu, xu ly sao?',
    advice: 'doi qua snack co dam + chat xo va chuan bi khau phan nho truoc',
  },
  {
    key: 'ngu_thieu',
    question: 'Toi ngu it, co anh huong den can nang khong?',
    advice: 'ngu 7-8 gio giup on dinh hormon doi/no va ho tro kiem soat An uong',
  },
  {
    key: 'uong_ruou',
    question: 'Toi thuong uong bia ruou cuoi tuan, can luu y gi?',
    advice: 'gioi han luong uong, bo sung nuoc va tranh an kem mon nhieu muoi/mo',
  },
  {
    key: 'an_ngoai_nhieu',
    question: 'Toi an hang quan nhieu, lam sao giu che do?',
    advice: 'uu tien mon hap/luoc, them rau, yeu cau giam sot va kiem soat khau phan tinh bot',
  },
  {
    key: 'stress',
    question: 'Toi hay an theo cam xuc khi stress, co cach nao khong?',
    advice: 'dung 5 phut de tach cam xuc va con doi that, thu di bo ngan truoc khi quyet dinh an',
  },
  {
    key: 'khong_theo_doi',
    question: 'Toi khong duy tri duoc nhat ky An uong, lam sao de de hon?',
    advice: 'ghi nhanh ngay sau bua an, bat dau tu 1-2 bua moi ngay roi nang dan',
  },
  {
    key: 'an_man',
    question: 'Toi co thoi quen an man, cach giam tu tu?',
    advice: 'giam dan gia vi man, su dung rau thom va gia vi tu nhien de tao vi',
  },
  {
    key: 'an_it_rau',
    question: 'Toi an rat it rau, nen bat dau the nao?',
    advice: 'them rau vao moi bua voi muc tieu toi thieu 2 nam tay rau moi ngay',
  },
] as const;

const safetyAlerts = [
  {
    question: 'Khi nao thi toi can di kham thay vi tiep tuc hoi chatbot?',
    answer:
      'Neu co dau nguc, kho tho, ngat, choang nang, non lien tuc, sot cao keo dai, hoac duong huyet/huyet ap bat thuong, can di kham ngay. Chatbot khong thay the chan doan y khoa.',
    tags: ['an toan', 'canh bao y te'],
  },
  {
    question: 'Chatbot co the thay bac si de ke don khong?',
    answer:
      'Khong. Chatbot chi ho tro giao duc suc khoe va gui ? dinh duong tong quat. Moi thuoc hoac dieu tri benh can do bac si quyet dinh.',
    tags: ['an toan', 'gioi han'],
  },
  {
    question: 'Toi dang mang thai, co nen tu y an kieng theo chatbot?',
    answer:
      'Khong nen tu y an kieng muc qua chat trong thai ky. Can trao doi bac si/chan doan dinh duong de co phac do phu hop.',
    tags: ['thai ky', 'an toan'],
  },
  {
    question: 'Toi co benh nen, chatbot tu van den muc nao?',
    answer:
      'Chatbot co the gui ? nguyen tac An uong an toan, nhung van can bac si theo doi de ca nhan hoa theo xet nghiem va thuoc dang dung.',
    tags: ['benh nen', 'an toan'],
  },
] as const;

const customDirectQAs: TrainingExampleSeed[] = [
  {
    question: 'Toi tien tieu duong, bua sang nao de on dinh duong huyet?',
    answer:
      'Ban co the an sua chua khong duong + yach mach + hat chia + 1 it trai cay it ngot. Uu tien dam + chat xo, han che nuoc ngot va banh ngot buoi sang.',
    tags: ['custom', 'tien tieu duong', 'bua sang'],
  },
  {
    question: 'Toi dang uong thuoc huyet ap, co can kieng muoi tuyet doi khong?',
    answer:
      'Khong can cat muoi ve 0, nhung can giam man ro rang: han che mon dong hop, nuoc cham man, mon kho. Muc tieu tong muoi duoi 5g/ngay theo huong dan chung.',
    tags: ['custom', 'cao huyet ap', 'muoi'],
  },
  {
    question: 'Toi co mo mau cao, bua toi nen uu tien nhom mon nao?',
    answer:
      'Uu tien ca, dau hu, rau xanh, tinh bot nguyen hat va dau hat. Han che mon chien ngap dau, noi tang, thit mo va do an nhanh.',
    tags: ['custom', 'mo mau cao', 'bua toi'],
  },
  {
    question: 'Toi gout, co an duoc hai san khong?',
    answer:
      'Voi gout, nen han che nhom hai san giau purin va phu tang. Uu tien dam nac vua du, uong du nuoc va theo doi acid uric theo lich bac si.',
    tags: ['custom', 'gout', 'purin'],
  },
  {
    question: 'Toi hay an theo cam xuc luc stress, can lam gi truoc khi mo do an?',
    answer:
      'Dung lai 5 phut, uong 1 ly nuoc, di bo ngan, sau do moi quyet dinh an. Neu van doi, chon bua phu nho co dam + chat xo de tranh an qua da.',
    tags: ['custom', 'hanh vi', 'stress'],
  },
  {
    question: 'Toi lam ca dem, sap xep bua an the nao de khong tang can?',
    answer:
      'Chia 2 bua nho va 1 bua chinh theo khung gio lam viec. Uu tien dam nac + rau + tinh bot vua du, tranh an qua nhieu do ngot gan cuoi ca.',
    tags: ['custom', 'ca dem', 'giam can'],
  },
  {
    question: 'Toi can giam can nhung van muon an com, co duoc khong?',
    answer:
      'Duoc. Ban khong can bo com hoan toan, chi can giam khau phan, uu tien gao lut/nep cam, tang rau va dam nac de no lau.',
    tags: ['custom', 'giam can', 'carb'],
  },
  {
    question: 'Sau tap gym toi khong doi, co can an them khong?',
    answer:
      'Neu muc tieu tang co, nen bo sung nhe sau tap: 25-35g protein va it carb de phuc hoi. Co the dung sua chua Hy Lap + trai cay it ngot.',
    tags: ['custom', 'sau tap', 'tang co'],
  },
  {
    question: 'Toi co da day nhay cam, bua toi nen tranh gi?',
    answer:
      'Han che mon qua cay, qua chua, do chien nhieu mo va ca phe muon. Uu tien mon mem, de tieu, chia khau phan vua phai.',
    tags: ['custom', 'da day', 'bua toi'],
  },
  {
    question: 'Neu toi co benh than giai doan som thi co nen an protein cao de giam can?',
    answer:
      'Khong nen tu y an protein qua cao. Can can doi dam theo huong dan bac si, dong thoi giam duong va chat beo xau de kiem soat can nang an toan.',
    tags: ['custom', 'benh than', 'an toan'],
  },
  {
    question: 'Toi muon menu 1 ngay de kiem soat huyet ap va duong huyet cung luc',
    answer:
      'Mau 1 ngay: sang yach mach + sua chua khong duong; trua uc ga + rau + com gao lut; toi ca hap + rau luoc + khoai. Giam muoi, tranh nuoc ngot.',
    tags: ['custom', 'cao huyet ap', 'tieu duong'],
  },
  {
    question: 'Toi hay them tra sua, thay bang gi de de theo lau dai?',
    answer:
      'Thu tra khong duong + sua it beo, hoac ca phe sua khong duong voi luong nho. Dat so lan co dinh/tu an thay vi kieng tuyet doi.',
    tags: ['custom', 'do uong', 'hanh vi'],
  },
] as const;

const customPlaybooks = [
  {
    key: 'pcos',
    label: 'PCOS',
    core: 'uu tien dam nac + chat xo, giu duong huyet on dinh va theo doi chu ky',
    avoid: 'han che do ngot, nuoc ngot va snack tinh che',
  },
  {
    key: 'tien_tieu_duong',
    label: 'tien tieu duong',
    core: 'chia bua deu, uu tien carb hap thu cham va van dong deu',
    avoid: 'tranh bua qua nhieu tinh bot tinh che trong 1 lan an',
  },
  {
    key: 'khang_insulin',
    label: 'khang insulin',
    core: 'uu tien bua an can bang dam-rau-carb hop ly',
    avoid: 'giam thoi quen an do ngot vao cuoi ngay',
  },
  {
    key: 'sau_sinh',
    label: 'sau sinh',
    core: 'giu bua an deu, du dam va vi chat de phuc hoi',
    avoid: 'khong cat calo qua manh trong giai doan dau',
  },
  {
    key: 'tien_man_kinh',
    label: 'tien man kinh',
    core: 'du canxi, dam va rau xanh; theo doi giac ngu',
    avoid: 'han che ruou bia va do an qua man vao buoi toi',
  },
  {
    key: 'van_phong',
    label: 'dan van phong it van dong',
    core: 'kiem soat khau phan va tang van dong ngat quang',
    avoid: 'tranh snack ngot lien tuc trong gio lam',
  },
  {
    key: 'ca_dem',
    label: 'nguoi lam ca dem',
    core: 'chia bua nho deu, uu tien thuc an de tieu',
    avoid: 'han che caffein sat gio ngu sau ca lam',
  },
  {
    key: 'hoc_sinh_sinh_vien',
    label: 'hoc sinh sinh vien',
    core: 'toi uu bua an ngan sach thap nhung du dam va rau',
    avoid: 'giam do an nhanh va nuoc ngot co duong',
  },
  {
    key: 'nguoi_lon_tuoi',
    label: 'nguoi lon tuoi',
    core: 'uu tien mon mem de tieu, du protein va nuoc',
    avoid: 'tranh bo bua, tranh an man va an qua sat gio ngu',
  },
  {
    key: 'cho_con_bu',
    label: 'dang cho con bu',
    core: 'du nang luong chat luong, du nuoc va vi chat',
    avoid: 'khong kieng muc qua chat neu khong c? chi dinh y te',
  },
] as const;

const customConstraints = [
  'ngan sach thap',
  'chi nau duoc duoi 20 phut',
  'hay an ngoai',
  'khong c? tu lanh lon',
  'khong an ca',
  'khong dung sua bo',
  'hay bo bua sang',
  'nguon thuc pham gioi han',
] as const;

const dedupeExamples = (items: TrainingExampleSeed[]) => {
  const seen = new Set<string>();
  const out: TrainingExampleSeed[] = [];

  for (const item of items) {
    const q = item.question.trim();
    const a = item.answer.trim();
    if (!q || !a) continue;

    const key = `${q.toLowerCase()}||${a.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      question: q,
      answer: a,
      tags: Array.from(new Set((item.tags || []).map((tag) => tag.trim()).filter(Boolean))).slice(0, 8),
    });
  }

  return out;
};

const buildGeneratedTrainingExamples = () => {
  const items: TrainingExampleSeed[] = [];

  for (const alert of safetyAlerts) {
    items.push(alert);
  }

  for (const qa of customDirectQAs) {
    items.push(qa);
  }

  for (const playbook of customPlaybooks) {
    for (const meal of meals) {
      const protein = proteins[(items.length + playbook.label.length + meal.key.length) % proteins.length];
      const carb = carbs[(items.length + playbook.key.length + meal.label.length) % carbs.length];
      const veggie = veggies[(items.length + playbook.core.length) % veggies.length];

      items.push({
        question: `Toi thuoc nhom ${playbook.label}, ${meal.label} nen an the nao cho de theo?`,
        answer:
          `Voi nhom ${playbook.label}, ${meal.label} ban co the an ${protein} + ${veggie} + ${carb} voi khau phan vua du. Uu tien ${playbook.core} va ${playbook.avoid}.`,
        tags: ['custom', playbook.label, meal.label],
      });
    }

    for (const constraint of customConstraints) {
      const meal = meals[(items.length + constraint.length) % meals.length];
      const protein = proteins[(items.length + constraint.length + meal.key.length) % proteins.length];
      const carb = carbs[(items.length + playbook.key.length + constraint.length) % carbs.length];

      items.push({
        question: `Toi la ${playbook.label}, dieu kien ${constraint}, hay gui ? bua an thuc te`,
        answer:
          `Trong dieu kien ${constraint}, ban nen uu tien ${meal.label} gon nhe voi ${protein} + rau + ${carb}. Tap trung ${playbook.core} va nho ${playbook.avoid}.`,
        tags: ['custom', playbook.key, 'boi canh'],
      });
    }
  }

  for (const goal of goals) {
    for (const meal of meals) {
      for (const protein of proteins) {
        const veggie = veggies[(items.length + protein.length + meal.label.length) % veggies.length];
        const carb = carbs[(items.length + goal.label.length) % carbs.length];

        items.push({
          question: `Toi dang ${goal.label}, ${meal.label} co ${protein} nen sap xep the nao?`,
          answer:
            `Voi muc tieu ${goal.label}, ${meal.label} (${meal.timing}) co the an ${protein} + ${veggie} + ${carb} voi khau phan ${meal.portion}. Ban can ${goal.strategy} va ${goal.carbHint}.`,
          tags: [goal.label, meal.label, 'protein'],
        });
      }
    }
  }

  for (const condition of conditions) {
    for (const meal of meals) {
      for (const carb of carbs) {
        const protein = proteins[(items.length + condition.label.length) % proteins.length];
        const fat = healthyFats[(items.length + meal.label.length) % healthyFats.length];

        items.push({
          question: `Toi co ${condition.label}, ${meal.label} nen an ${carb} ra sao de an toan hon?`,
          answer:
            `Neu ban co ${condition.label}, ${meal.label} voi ${carb} can theo huong ${condition.avoid}. Ban co the ket hop ${protein} + rau xanh + mot it ${fat}; dong thoi ${condition.focus}.`,
          tags: [condition.label, meal.label, 'benh nen'],
        });
      }
    }
  }

  for (const workout of workouts) {
    for (const phase of trainingPhases) {
      for (const snack of carbs) {
        const protein = proteins[(items.length + workout.label.length) % proteins.length];

        items.push({
          question: `Trong ngay ${workout.label}, ${phase.label} toi nen an gi neu co ${snack}?`,
          answer:
            `Voi lich ${workout.label}, giai doan ${phase.label} ban nen uu tien ${phase.guide}. Co the dung ${snack} ket hop ${protein}; dong thoi ${workout.note}.`,
          tags: [workout.label, phase.label, 'tap luyen'],
        });
      }
    }
  }

  for (const habit of habits) {
    for (const goal of goals) {
      const meal = meals[(items.length + goal.key.length) % meals.length];
      const protein = proteins[(items.length + habit.key.length) % proteins.length];
      const veggie = veggies[(items.length + habit.question.length) % veggies.length];

      items.push({
        question: `${habit.question} Neu muc tieu cua toi la ${goal.label} thi uu tien gi?`,
        answer:
          `${habit.advice}. De phu hop muc tieu ${goal.label}, hay uu tien ${meal.label} co ${protein} + ${veggie}, va theo doi 7-14 ngay de dieu chinh.`,
        tags: [habit.key, goal.label, 'hanh vi'],
      });
    }
  }

  const cleaned = dedupeExamples(items);
  const prioritized = dedupeExamples([...safetyAlerts, ...customDirectQAs, ...cleaned]);

  if (prioritized.length >= TARGET_DEFAULT_TRAINING_COUNT) {
    return prioritized.slice(0, TARGET_DEFAULT_TRAINING_COUNT);
  }

  const fallback: TrainingExampleSeed[] = [...prioritized];
  let cursor = 0;
  while (fallback.length < TARGET_DEFAULT_TRAINING_COUNT) {
    const src = prioritized[cursor % prioritized.length];
    fallback.push({
      question: `${src.question} (phien ban mo rong ${cursor + 1})`,
      answer: `${src.answer} Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.`,
      tags: src.tags,
    });
    cursor += 1;
  }

  return fallback.slice(0, TARGET_DEFAULT_TRAINING_COUNT);
};

export const DEFAULT_CHATBOT_TRAINING_EXAMPLES: TrainingExampleSeed[] = buildGeneratedTrainingExamples();
