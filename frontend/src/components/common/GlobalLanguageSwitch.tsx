import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const GlobalLanguageSwitch = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      data-no-runtime-i18n="true"
      className="fixed bottom-4 left-4 z-[70] bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg p-1.5 flex items-center gap-1"
    >
      <div className="w-7 h-7 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
        <Globe size={14} />
      </div>
      <button
        onClick={() => setLanguage('vi')}
        className={`px-2.5 py-1.5 text-xs font-black rounded-xl transition ${
          language === 'vi' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        VI
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1.5 text-xs font-black rounded-xl transition ${
          language === 'en' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default GlobalLanguageSwitch;
