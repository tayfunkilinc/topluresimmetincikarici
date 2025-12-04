import { FormatOptions } from '../utils/fileGenerator';
import { Settings, AlignLeft, List, Hash, Minus, Space, Circle } from 'lucide-react';

interface FormatOptionsPanelProps {
  options: FormatOptions;
  onChange: (options: FormatOptions) => void;
}

export default function FormatOptionsPanel({ options, onChange }: FormatOptionsPanelProps) {
  const updateOption = <K extends keyof FormatOptions>(key: K, value: FormatOptions[K]) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600/50">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-purple-400" />
        <h4 className="text-white font-semibold">Çıktı Formatı Ayarları</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Düzen Seçimi */}
        <div>
          <label className="text-slate-400 text-sm mb-2 block">Metin Düzeni</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'continuous', label: 'Sürekli', icon: AlignLeft, desc: 'Tüm metinler art arda' },
              { value: 'separated', label: 'Ayrık', icon: List, desc: 'Başlıklarla ayrılmış' },
              { value: 'numbered', label: 'Numaralı', icon: Hash, desc: 'Numaralı liste' },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => updateOption('layout', value as FormatOptions['layout'])}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  options.layout === value
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Ayırıcı Stili */}
        <div>
          <label className="text-slate-400 text-sm mb-2 block">Ayırıcı Stili</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'line', label: 'Çizgi', icon: Minus },
              { value: 'space', label: 'Boşluk', icon: Space },
              { value: 'none', label: 'Yok', icon: Circle },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => updateOption('separatorStyle', value as FormatOptions['separatorStyle'])}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  options.separatorStyle === value
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Başlık Göster */}
        <div>
          <label className="text-slate-400 text-sm mb-2 block">Dosya Başlıkları</label>
          <div className="flex gap-2">
            <button
              onClick={() => updateOption('showHeaders', true)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                options.showHeaders
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Göster
            </button>
            <button
              onClick={() => updateOption('showHeaders', false)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                !options.showHeaders
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Gizle
            </button>
          </div>
        </div>

        {/* Font Boyutu */}
        <div>
          <label className="text-slate-400 text-sm mb-2 block">
            Font Boyutu: <span className="text-purple-400 font-semibold">{options.fontSize}pt</span>
          </label>
          <input
            type="range"
            min="8"
            max="18"
            value={options.fontSize}
            onChange={(e) => updateOption('fontSize', Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>8pt</span>
            <span>12pt</span>
            <span>18pt</span>
          </div>
        </div>

        {/* Satır Aralığı */}
        <div className="md:col-span-2">
          <label className="text-slate-400 text-sm mb-2 block">Satır Aralığı</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'single', label: 'Tek (1.0)' },
              { value: 'normal', label: 'Normal (1.15)' },
              { value: 'double', label: 'Çift (2.0)' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateOption('lineSpacing', value as FormatOptions['lineSpacing'])}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  options.lineSpacing === value
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

