import { useState, useRef } from 'react';
import { useLanguage, languages } from '../context/LanguageContext';
import { ChevronDown, Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  return (
    <div className="fixed top-4 right-4 z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all"
        data-testid="language-switcher"
      >
        <Globe className="w-4 h-4 text-stone-500" />
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium text-stone-700 hidden sm:inline">{currentLang.name}</span>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl border border-stone-200 shadow-xl overflow-hidden min-w-[160px]">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                setLang(language.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors ${
                lang === language.code ? 'bg-emerald-50 text-emerald-700' : 'text-stone-700'
              }`}
              data-testid={`lang-${language.code}`}
            >
              <span className="text-xl">{language.flag}</span>
              <span className="text-sm font-medium">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
