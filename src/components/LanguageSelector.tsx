import { SUPPORTED_LANGUAGES } from '../utils/ocr';
import { Languages, Check } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
}

export default function LanguageSelector({ selectedLanguages, onChange }: LanguageSelectorProps) {
  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      // En az bir dil seçili kalmalı
      if (selectedLanguages.length > 1) {
        onChange(selectedLanguages.filter((l) => l !== code));
      }
    } else {
      onChange([...selectedLanguages, code]);
    }
  };

  // Sık kullanılan diller
  const commonLanguages = ['tur', 'eng', 'deu', 'fra', 'ara', 'rus'];
  const otherLanguages = SUPPORTED_LANGUAGES.filter(l => !commonLanguages.includes(l.code));
  const commonLangData = SUPPORTED_LANGUAGES.filter(l => commonLanguages.includes(l.code));

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600/50">
      <div className="flex items-center gap-2 mb-4">
        <Languages className="w-5 h-5 text-cyan-400" />
        <h4 className="text-white font-semibold">Tanınacak Diller</h4>
        <span className="text-slate-500 text-sm ml-auto">
          {selectedLanguages.length} dil seçili
        </span>
      </div>

      {/* Sık Kullanılan Diller */}
      <div className="mb-3">
        <p className="text-slate-500 text-xs mb-2">Sık Kullanılanlar</p>
        <div className="flex flex-wrap gap-2">
          {commonLangData.map((lang) => {
            const isSelected = selectedLanguages.includes(lang.code);
            return (
              <button
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  isSelected
                    ? 'bg-cyan-600 text-white ring-2 ring-cyan-400/50'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Diğer Diller */}
      <details className="group">
        <summary className="text-slate-500 text-xs cursor-pointer hover:text-slate-400 transition-colors">
          Diğer Diller ({otherLanguages.length})
        </summary>
        <div className="flex flex-wrap gap-2 mt-2">
          {otherLanguages.map((lang) => {
            const isSelected = selectedLanguages.includes(lang.code);
            return (
              <button
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  isSelected
                    ? 'bg-cyan-600 text-white ring-2 ring-cyan-400/50'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </details>

      <p className="text-slate-600 text-xs mt-3">
        💡 İpucu: Daha az dil seçmek işlemi hızlandırır ve doğruluğu artırır
      </p>
    </div>
  );
}

