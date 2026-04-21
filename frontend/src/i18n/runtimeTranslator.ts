import type { Language } from './translations';

const EXACT_TRANSLATIONS: Record<string, string> = {
  'trang chu': 'Home',
  'tong quan': 'Overview',
  'tong quan trong ngay va thao tac nhanh.': 'Daily overview and quick actions.',
  'kham pha': 'Discover',
  'theo doi': 'Tracking',
  'ke hoach': 'Planning',
  'ke hoach an uong theo ngay va bua.': 'Plan meals by day and meal type.',
  'tro chuyen voi ai de xin goi y bua an.': 'Chat with AI for meal suggestions.',
  'thu vien mon an va thong tin dinh duong.': 'Food library and nutrition details.',
  'cong thuc, cach nau va chi tiet mon.': 'Recipes and cooking instructions.',
  'goi y mon an dua tren lich su va muc tieu cua ban.': 'Recommendations based on your goals.',
  'mon yeu thich va cong thuc da luu.': 'Saved favorites and recipes.',
  'tai anh va nhan dien mon bang ai.': 'Upload image and scan by AI.',
  'theo doi cac bua an da an.': 'Track your meals.',
  'tien do calo, protein, carbs, fat.': 'Calories and macro progress.',
  'tong hop du lieu theo tuan va luu bao cao.': 'Weekly summaries and reports.',
  'nhat ky': 'Diary',
  'thong ke': 'Statistics',
  'bao cao tuan': 'Weekly reports',
  'ho so ca nhan': 'Profile',
  'dang nhap voi': 'Logged in as',
  'thong bao': 'Notifications',
  'danh dau tat ca': 'Mark all as read',
  'khong co thong bao nao': 'No notifications',
  'dang xuat': 'Log out',
  'thu vien mon an': 'Food library',
  'kham pha mon an va xem cong thuc ngay tren foodai': 'Explore foods and recipes on FoodAI',
  'tim nhanh mon an theo danh muc, xem chi tiet dinh duong, doc cong thuc nau va them truc tiep vao nhat ky an uong.':
    'Quickly search foods by category, view nutrition details, read recipes, and add foods directly to your diary.',
  'mon noi bat': 'Popular foods',
  'mon ca nhan': 'Custom foods',
  'ten mon': 'Food name',
  'tao mon ca nhan': 'Create custom food',
  'dang tao...': 'Creating...',
  'chua co mon ca nhan.': 'No custom foods yet.',
  'khoi tao 200+ mon pho bien de nang cap du lieu ban dau.': 'Bootstrap 200+ popular foods to enrich initial data.',
  'bootstrap mon pho bien': 'Bootstrap popular foods',
  'dang bootstrap...': 'Bootstrapping...',
  'co cong thuc': 'Has recipe',
  'xem chi tiet': 'View details',
  'trang': 'Page',
  'truoc': 'Previous',
  'sau': 'Next',
  'hom nay': 'Today',
  'them mon an': 'Add meal',
  'tim kiem mon an... (vd: pho cuon, salad)': 'Search foods... (e.g., spring roll, salad)',
  'khong tim thay ket qua': 'No results found',
  'khau phan:': 'Portion:',
  'them vao nhat ky': 'Add to diary',
  'dang them...': 'Adding...',
  'thong ke dinh duong': 'Nutrition statistics',
  'ti le macro': 'Macro ratio',
  'bang chi tiet': 'Detail table',
  'khong co du lieu cho bo loc hien tai.': 'No data for the current filter.',
  'dang nhap': 'Login',
  'dang ky': 'Register',
  'quen mat khau': 'Forgot password',
  'dat lai mat khau': 'Reset password',
  'ho va ten': 'Full name',
  email: 'Email',
  'mat khau': 'Password',
  'xac nhan mat khau': 'Confirm password',
  'dang xu ly...': 'Processing...',
  'tao tai khoan': 'Create account',
  'da co tai khoan?': 'Already have an account?',
  'nguoi dung': 'Users',
  'mon an': 'Foods',
  'cong thuc': 'Recipes',
  'danh gia': 'Reviews',
  'cau hinh': 'Configs',
  'nhat ky he thong': 'System logs',
  'thiet lap db': 'DB settings',
  'quan ly': 'Manage',
  'chi tiet': 'Detail',
  'sua': 'Edit',
  'xoa': 'Delete',
  'them': 'Add',
  'luu': 'Save',
  'huy': 'Cancel',
  'dong': 'Close',
  'tim kiem...': 'Search...',
  'khong co du lieu': 'No data',
  'khong tim thay du lieu': 'No data found',
  'uog nuoc': 'Hydration',
  'uong nuoc': 'Hydration',
  'muc tieu': 'Goal',
  'de xuat danh rieng cho ban': 'Recommendations for you',
  'ke hoach hom nay': 'Today plan',
  'tro ly ai': 'AI Assistant',
  'san sang phan tich dinh duong': 'Ready to analyze your nutrition',
  'kiem tra calo': 'Check calories',
  'goi y bua phu': 'Suggest snacks',
  'hoi foodai...': 'Ask FoodAI...',
  'chat voi cskh': 'Contact support',
  'cskh inbox': 'Support inbox',
  'thiết lập db': 'DB settings',
  'đăng xuất': 'Log out',
  'hồ sơ cá nhân': 'Profile',
  'thống kê': 'Statistics',
  'trang chủ': 'Home',
  'khám phá': 'Discover',
  'kế hoạch': 'Planning',
  'theo dõi': 'Tracking',
  'đánh dấu tất cả': 'Mark all as read',
  'không có thông báo': 'No notifications',
  'món ăn': 'Foods',
  'công thức': 'Recipes',
  'đánh giá': 'Reviews',
  'người dùng': 'Users',
};

const RULES: Array<{ test: RegExp; to: (...args: string[]) => string }> = [
  {
    test: /^(\d+)%\s*(muc tieu hang ngay|mục tiêu hằng ngày)$/i,
    to: (percent) => `${percent}% daily goal`,
  },
  {
    test: /^(muc tieu|mục tiêu)\s+([\d.,]+)\s*ml$/i,
    to: (_, value) => `Goal ${value} ml`,
  },
  {
    test: /^(khau phan|khẩu phần):\s*x?([\d.,]+)$/i,
    to: (_, value) => `Portion: x${value}`,
  },
  {
    test: /^trong\s+(\d+)\s+ngay\s+qua$/i,
    to: (value) => `In the last ${value} days`,
  },
  {
    test: /^(\d+)\s+moc\s+du\s+lieu$/i,
    to: (value) => `${value} data points`,
  },
  {
    test: /^trang\s+(\d+)\s*\/\s*(\d+)$/i,
    to: (current, total) => `Page ${current} / ${total}`,
  },
  {
    test: /^khong co thong bao$/i,
    to: () => 'No notifications',
  },
  {
    test: /^khong co du lieu$/i,
    to: () => 'No data',
  },
  {
    test: /^(muc tieu|mục tiêu):\s*([\d.,]+)\s*kcal$/i,
    to: (_, value) => `Goal: ${value} kcal`,
  },
];

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA']);
const ATTRS = ['placeholder', 'title', 'aria-label'];

const textOriginal = new WeakMap<Text, string>();
const attrOriginal = new WeakMap<Element, Map<string, string>>();
const trackedTextNodes = new Set<Text>();
const trackedAttrElements = new Set<Element>();

let observer: MutationObserver | null = null;
let currentLanguage: Language = 'vi';
let isApplying = false;

const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9%./+\-:\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const translateCore = (core: string) => {
  const normalized = normalizeKey(core);
  if (!normalized) return core;

  const exact = EXACT_TRANSLATIONS[normalized];
  if (exact) return exact;

  for (const rule of RULES) {
    const match = core.match(rule.test);
    if (match) return rule.to(...match.slice(1));
  }

  return core;
};

const translateText = (value: string) => {
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const core = value.trim();
  if (!core) return value;
  return `${leading}${translateCore(core)}${trailing}`;
};

const processTextNode = (node: Text) => {
  const parent = node.parentElement;
  if (!parent || SKIP_TAGS.has(parent.tagName)) return;
  if (parent.closest('[data-no-runtime-i18n="true"]')) return;

  if (currentLanguage === 'en') {
    const hasOriginal = textOriginal.has(node);
    const currentValue = node.nodeValue || '';
    const original = hasOriginal ? (textOriginal.get(node) || '') : currentValue;
    const translated = translateText(original);

    // Do not track nodes that don't need runtime translation (usually EN text from React render).
    if (translated === original) {
      if (hasOriginal) {
        textOriginal.delete(node);
        trackedTextNodes.delete(node);
      }
      return;
    }

    if (!hasOriginal) textOriginal.set(node, original);
    trackedTextNodes.add(node);
    if (translated !== currentValue) node.nodeValue = translated;
    return;
  }

  const original = textOriginal.get(node);
  if (typeof original !== 'string') return;
  if (node.nodeValue !== original) node.nodeValue = original;
};

const processElementAttributes = (element: Element) => {
  if (element.closest('[data-no-runtime-i18n="true"]')) return;

  for (const attr of ATTRS) {
    const value = element.getAttribute(attr);
    if (!value) continue;

    if (currentLanguage === 'en') {
      let originMap = attrOriginal.get(element);
      const hasOriginal = !!originMap?.has(attr);
      const original = hasOriginal ? (originMap?.get(attr) || value) : value;
      const translated = translateText(original);

      // Do not track attributes that don't need runtime translation.
      if (translated === original) {
        if (originMap?.has(attr)) {
          originMap.delete(attr);
          if (originMap.size === 0) {
            attrOriginal.delete(element);
            trackedAttrElements.delete(element);
          }
        }
        continue;
      }

      if (!originMap) {
        originMap = new Map();
        attrOriginal.set(element, originMap);
      }
      if (!hasOriginal) originMap.set(attr, original);
      trackedAttrElements.add(element);
      if (translated !== value) element.setAttribute(attr, translated);
      continue;
    }

    const original = attrOriginal.get(element)?.get(attr);
    if (typeof original === 'string' && value !== original) {
      element.setAttribute(attr, original);
    }
  }
};

const processSubtree = (root: Node) => {
  if (root.nodeType === Node.TEXT_NODE) {
    processTextNode(root as Text);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

  const rootElement = root as Element;
  if (root.nodeType === Node.ELEMENT_NODE) processElementAttributes(rootElement);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode();
  while (textNode) {
    processTextNode(textNode as Text);
    textNode = walker.nextNode();
  }

  if ('querySelectorAll' in rootElement) {
    rootElement.querySelectorAll('*').forEach((element) => processElementAttributes(element));
  }
};

const disconnectObserver = () => {
  if (!observer) return;
  observer.disconnect();
  observer = null;
};

const restoreAll = () => {
  for (const node of trackedTextNodes) {
    if (!node.isConnected) continue;
    const original = textOriginal.get(node);
    if (typeof original === 'string' && node.nodeValue !== original) node.nodeValue = original;
    textOriginal.delete(node);
  }
  trackedTextNodes.clear();

  for (const element of trackedAttrElements) {
    if (!element.isConnected) continue;
    const map = attrOriginal.get(element);
    if (!map) continue;
    map.forEach((value, attr) => {
      if (element.getAttribute(attr) !== value) element.setAttribute(attr, value);
    });
    attrOriginal.delete(element);
  }
  trackedAttrElements.clear();
};

export const syncRuntimeTranslations = (language: Language) => {
  currentLanguage = language;
  document.documentElement.setAttribute('data-lang', language);

  disconnectObserver();
  if (typeof document === 'undefined' || !document.body) return () => {};

  if (language === 'vi') {
    restoreAll();
    return () => {};
  }

  isApplying = true;
  processSubtree(document.body);
  isApplying = false;

  observer = new MutationObserver((records) => {
    if (isApplying || currentLanguage !== 'en') return;
    isApplying = true;
    records.forEach((record) => {
      record.addedNodes.forEach((node) => processSubtree(node));
      if (record.type === 'attributes' && record.target instanceof Element) {
        processElementAttributes(record.target);
      }
    });
    isApplying = false;
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ATTRS,
  });

  return () => disconnectObserver();
};
