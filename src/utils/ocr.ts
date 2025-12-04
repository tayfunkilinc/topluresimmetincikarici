import Tesseract from 'tesseract.js';

export interface OCRResult {
  image: string;
  text: string;
  imageIndex: number;
  fileName: string;
}

// Desteklenen diller
export const SUPPORTED_LANGUAGES = [
  { code: 'tur', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'eng', name: 'İngilizce', flag: '🇬🇧' },
  { code: 'deu', name: 'Almanca', flag: '🇩🇪' },
  { code: 'fra', name: 'Fransızca', flag: '🇫🇷' },
  { code: 'ita', name: 'İtalyanca', flag: '🇮🇹' },
  { code: 'spa', name: 'İspanyolca', flag: '🇪🇸' },
  { code: 'por', name: 'Portekizce', flag: '🇵🇹' },
  { code: 'rus', name: 'Rusça', flag: '🇷🇺' },
  { code: 'ara', name: 'Arapça', flag: '🇸🇦' },
  { code: 'jpn', name: 'Japonca', flag: '🇯🇵' },
  { code: 'kor', name: 'Korece', flag: '🇰🇷' },
  { code: 'chi_sim', name: 'Çince (Basit)', flag: '🇨🇳' },
  { code: 'nld', name: 'Hollandaca', flag: '🇳🇱' },
  { code: 'pol', name: 'Lehçe', flag: '🇵🇱' },
  { code: 'ukr', name: 'Ukraynaca', flag: '🇺🇦' },
  { code: 'ell', name: 'Yunanca', flag: '🇬🇷' },
];

export async function processImages(
  files: File[],
  languages: string[] = ['tur', 'eng'],
  onProgress?: (progress: number, status: string) => void
): Promise<OCRResult[]> {
  const results: OCRResult[] = [];
  const totalFiles = files.length;
  
  // Dil kodlarını birleştir
  const langString = languages.join('+');

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    
    onProgress?.((i / totalFiles) * 100, `${file.name} işleniyor... (${i + 1}/${totalFiles})`);
    
    // Dosyayı base64'e çevir
    const imageData = await fileToBase64(file);
    
    // OCR işlemi - tüm seçili dilleri kullan
    const { data: { text } } = await Tesseract.recognize(
      file,
      langString,
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const fileProgress = ((i + m.progress) / totalFiles) * 100;
            onProgress?.(fileProgress, `${file.name} okunuyor... (%${Math.round(m.progress * 100)})`);
          } else if (m.status === 'loading language traineddata') {
            onProgress?.((i / totalFiles) * 100, `Dil modeli yükleniyor...`);
          }
        }
      }
    );

    results.push({
      image: imageData,
      text: text.trim(),
      imageIndex: i + 1,
      fileName: file.name
    });
  }

  return results;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
