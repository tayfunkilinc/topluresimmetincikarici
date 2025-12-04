import { useState, useMemo } from 'react';
import FileUpload from './components/FileUpload';
import ProgressTracker from './components/ProgressTracker';
import LanguageSelector from './components/LanguageSelector';
import FormatOptionsPanel from './components/FormatOptionsPanel';
import { processImages, OCRResult } from './utils/ocr';
import { generateAndDownloadFile, FormatOptions, DEFAULT_FORMAT_OPTIONS, ExportFormat } from './utils/fileGenerator';
import { FileText, FileType, Download, Trash2, Eye, EyeOff, ImageIcon, Copy, Check, Sparkles } from 'lucide-react';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['tur', 'eng']);
  const [formatOptions, setFormatOptions] = useState<FormatOptions>(DEFAULT_FORMAT_OPTIONS);
  const [copied, setCopied] = useState(false);
  const [showFormatOptions, setShowFormatOptions] = useState(false);

  const handleFilesSelected = (selectedFiles: File[]) => {
    // Mevcut dosyalara ekle
    setFiles((prev) => [...prev, ...selectedFiles]);
    setOcrResults([]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressStatus('Hazırlanıyor...');

    try {
      const results = await processImages(
        files,
        selectedLanguages,
        (prog, status) => {
          setProgress(prog);
          setProgressStatus(status);
        }
      );

      setOcrResults(results);
      setProgress(100);
      setProgressStatus('OCR tamamlandı! ✨');
      setIsProcessing(false);
    } catch (error) {
      console.error('İşlem hatası:', error);
      setProgressStatus('Hata oluştu!');
      setIsProcessing(false);
    }
  };

  const handleDownload = async (format: ExportFormat) => {
    if (ocrResults.length === 0) return;

    setProgressStatus(`${format.toUpperCase()} oluşturuluyor...`);
    
    try {
      await generateAndDownloadFile(ocrResults, format, formatOptions, 'ocr-sonuc');
      setProgressStatus(`${format.toUpperCase()} indirildi! ✅`);
    } catch (error) {
      console.error('İndirme hatası:', error);
      setProgressStatus('İndirme hatası!');
    }
  };

  const handleCopyAll = async () => {
    const allText = ocrResults.map((r) => r.text).join('\n\n');
    await navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFiles([]);
    setProgress(0);
    setProgressStatus('');
    setOcrResults([]);
  };

  // Toplam karakter ve kelime sayısı
  const stats = useMemo(() => {
    if (ocrResults.length === 0) return null;
    const allText = ocrResults.map((r) => r.text).join(' ');
    return {
      chars: allText.length,
      words: allText.split(/\s+/).filter(Boolean).length,
      images: ocrResults.length,
    };
  }, [ocrResults]);

  const formatButtons = [
    { format: 'txt' as ExportFormat, label: 'TXT', icon: FileText, color: 'from-emerald-500 to-teal-600', desc: 'Düz metin' },
    { format: 'docx' as ExportFormat, label: 'DOCX', icon: FileType, color: 'from-blue-500 to-indigo-600', desc: 'Word belgesi' },
    { format: 'pdf' as ExportFormat, label: 'PDF', icon: FileText, color: 'from-red-500 to-rose-600', desc: 'PDF belgesi' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-6 px-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm">Çoklu Dil Destekli OCR</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Resimden Metin Çıkarıcı
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Resimlerinizi yükleyin, metinleri otomatik tanıyın ve TXT, DOCX veya PDF olarak indirin
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-6 md:p-8 mb-6">
          <FileUpload onFilesSelected={handleFilesSelected} />
          
          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  Yüklenen Resimler ({files.length})
                </h3>
                {ocrResults.length === 0 && (
                  <button
                    onClick={() => setFiles([])}
                    className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Tümünü Temizle
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-52 overflow-y-auto pr-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="relative group bg-slate-700/50 rounded-lg p-2 border border-slate-600/50 hover:border-purple-500/50 transition-all"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-16 object-cover rounded"
                    />
                    <p className="text-xs text-slate-400 mt-1 truncate" title={file.name}>{file.name}</p>
                    {ocrResults.length === 0 && (
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    <div className="absolute bottom-8 right-1 bg-slate-900/80 text-xs text-slate-300 px-1.5 py-0.5 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Language Selector */}
              {ocrResults.length === 0 && (
                <LanguageSelector
                  selectedLanguages={selectedLanguages}
                  onChange={setSelectedLanguages}
                />
              )}

              {/* Process Button */}
              {ocrResults.length === 0 && (
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 text-white py-4 px-6 rounded-xl font-semibold hover:bg-pos-100 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-purple-500/25"
                >
                  {isProcessing ? '🔄 İşleniyor...' : '🚀 OCR İşlemini Başlat'}
                </button>
              )}

              {/* Progress */}
              {isProcessing && (
                <ProgressTracker progress={progress} currentStep={progressStatus} />
              )}
            </div>
          )}
        </div>

        {/* OCR Results */}
        {ocrResults.length > 0 && (
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-6 md:p-8">
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-4 text-center border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400">{stats.images}</div>
                  <div className="text-slate-400 text-sm">Resim</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl p-4 text-center border border-cyan-500/20">
                  <div className="text-2xl font-bold text-cyan-400">{stats.words.toLocaleString()}</div>
                  <div className="text-slate-400 text-sm">Kelime</div>
                </div>
                <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 rounded-xl p-4 text-center border border-pink-500/20">
                  <div className="text-2xl font-bold text-pink-400">{stats.chars.toLocaleString()}</div>
                  <div className="text-slate-400 text-sm">Karakter</div>
                </div>
              </div>
            )}

            {/* Format Options Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowFormatOptions(!showFormatOptions)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <Settings2Icon className={`w-4 h-4 transition-transform ${showFormatOptions ? 'rotate-90' : ''}`} />
                {showFormatOptions ? 'Ayarları Gizle' : 'Çıktı Ayarlarını Göster'}
              </button>
            </div>

            {/* Format Options */}
            {showFormatOptions && (
              <div className="mb-6">
                <FormatOptionsPanel
                  options={formatOptions}
                  onChange={setFormatOptions}
                />
              </div>
            )}

            {/* Download Section */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Download className="w-6 h-6 text-green-400" />
                İndirme Seçenekleri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {formatButtons.map(({ format, label, icon: Icon, color, desc }) => (
                  <button
                    key={format}
                    onClick={() => handleDownload(format)}
                    className={`flex flex-col items-center gap-2 bg-gradient-to-r ${color} text-white py-4 px-6 rounded-xl font-semibold hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{label} İndir</span>
                    <span className="text-xs opacity-75">{desc}</span>
                  </button>
                ))}
              </div>
              
              {/* Copy All Button */}
              <button
                onClick={handleCopyAll}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 py-3 px-4 rounded-xl transition-colors"
              >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Kopyalandı!' : 'Tüm Metni Kopyala'}
              </button>
            </div>

            {/* Preview Toggle */}
            <div className="flex items-center justify-between mb-4 border-t border-slate-700 pt-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-blue-400" />
                Çıkarılan Metinler
              </h3>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-700/50 px-3 py-2 rounded-lg"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Gizle' : 'Göster'}
              </button>
            </div>

            {/* Preview Content */}
            {showPreview && (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {ocrResults.map((result, index) => (
                  <div
                    key={index}
                    className="bg-slate-900/50 rounded-xl p-4 border border-slate-600/50 hover:border-slate-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full">
                        {result.imageIndex}
                      </span>
                      <span className="text-slate-300 font-medium flex-1 truncate">{result.fileName}</span>
                      <span className="text-slate-500 text-xs">
                        {result.text.split(/\s+/).filter(Boolean).length} kelime
                      </span>
                    </div>
                    <div 
                      className="bg-slate-800/80 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto"
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    >
                      {result.text || <span className="text-slate-500 italic">Metin bulunamadı</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Status */}
            {progressStatus && (
              <div className="mt-4 text-center text-slate-400 text-sm">
                {progressStatus}
              </div>
            )}

            {/* Reset Button */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <button
                onClick={handleReset}
                className="w-full bg-slate-700/50 hover:bg-slate-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Yeni İşlem Başlat
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-slate-600 text-sm space-y-1">
          <p>✨ {selectedLanguages.length > 0 ? `${selectedLanguages.length} dil destekli` : 'Çoklu dil destekli'} OCR teknolojisi</p>
          <p>PNG, JPG, GIF, BMP, TIFF, WEBP formatları kabul edilir</p>
        </div>
      </div>
    </div>
  );
}

// Settings icon component
function Settings2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default App;
