import { saveAs } from 'file-saver';
import { Document, Paragraph, TextRun, Packer, AlignmentType } from 'docx';
import { jsPDF } from 'jspdf';
import { OCRResult } from './ocr';

export type ExportFormat = 'txt' | 'docx' | 'pdf';

export interface FormatOptions {
  // Düzen seçenekleri
  layout: 'continuous' | 'separated' | 'numbered';
  // Başlık göster
  showHeaders: boolean;
  // Ayırıcı tipi
  separatorStyle: 'line' | 'space' | 'none';
  // Font boyutu
  fontSize: number;
  // Satır aralığı
  lineSpacing: 'single' | 'normal' | 'double';
}

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  layout: 'continuous',
  showHeaders: true,
  separatorStyle: 'line',
  fontSize: 12,
  lineSpacing: 'normal',
};

export async function generateAndDownloadFile(
  results: OCRResult[],
  format: ExportFormat,
  options: FormatOptions = DEFAULT_FORMAT_OPTIONS,
  fileName: string = 'ocr-sonuc'
): Promise<void> {
  switch (format) {
    case 'txt':
      generateTXT(results, options, fileName);
      break;
    case 'docx':
      await generateDOCX(results, options, fileName);
      break;
    case 'pdf':
      await generatePDF(results, options, fileName);
      break;
  }
}

function generateTXT(results: OCRResult[], options: FormatOptions, fileName: string): void {
  let content = '';

  results.forEach((result, index) => {
    // Ayırıcı (ilk resim hariç)
    if (index > 0) {
      if (options.separatorStyle === 'line') {
        content += '\n' + '─'.repeat(10) + '\n\n';
      } else if (options.separatorStyle === 'space') {
        content += '\n\n\n';
      } else {
        content += '\n';
      }
    }
    
    // Başlık
    if (options.showHeaders) {
      if (options.layout === 'numbered') {
        content += `[${result.imageIndex}] ${result.fileName}\n\n`;
      } else if (options.layout === 'separated') {
        content += `═══ ${result.fileName} ═══\n\n`;
      }
    }
    
    // Metin
    content += result.text.trim();
    content += '\n';
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${fileName}.txt`);
}

async function generateDOCX(results: OCRResult[], options: FormatOptions, fileName: string): Promise<void> {
  const children: Paragraph[] = [];
  
  // Font boyutu (half-points cinsinden)
  const fontSizeHalfPoints = options.fontSize * 2;
  
  // Satır aralığı
  const lineSpacingValue = options.lineSpacing === 'single' ? 240 : 
                           options.lineSpacing === 'double' ? 480 : 276;

  results.forEach((result, index) => {
    // Başlık
    if (options.showHeaders) {
      // Ayırıcı (ilk resim hariç)
      if (index > 0) {
        if (options.separatorStyle === 'line') {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '─'.repeat(10),
                  color: '999999',
                  size: fontSizeHalfPoints,
                }),
              ],
              spacing: { before: 300, after: 300 },
            })
          );
        } else if (options.separatorStyle === 'space') {
          children.push(
            new Paragraph({
              text: '',
              spacing: { before: 400, after: 400 },
            })
          );
        }
      }

      if (options.layout === 'numbered') {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[${result.imageIndex}] `,
                bold: true,
                size: fontSizeHalfPoints,
              }),
              new TextRun({
                text: result.fileName,
                italics: true,
                size: fontSizeHalfPoints,
              }),
            ],
            spacing: { after: 200 },
          })
        );
      } else if (options.layout === 'separated') {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: result.fileName,
                bold: true,
                size: fontSizeHalfPoints + 4,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: index > 0 ? 400 : 0, after: 200 },
          })
        );
      }
    }

    // Metin içeriği - her satır için ayrı paragraf
    const textLines = result.text.trim().split('\n');
    textLines.forEach((line) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line || ' ',
              size: fontSizeHalfPoints,
              font: 'Calibri',
            }),
          ],
          spacing: { 
            after: Math.round(fontSizeHalfPoints * 0.5), 
            line: lineSpacingValue 
          },
        })
      );
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // 2cm = 1134 twips
              right: 1134,
              bottom: 1134,
              left: 1134,
            },
          },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
}

async function generatePDF(
  results: OCRResult[],
  options: FormatOptions,
  fileName: string
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  
  // Font boyutuna göre satır yüksekliği
  const lineHeight = options.fontSize * 0.5;
  const lineSpacingMultiplier = options.lineSpacing === 'single' ? 1 : 
                                options.lineSpacing === 'double' ? 2 : 1.4;
  const effectiveLineHeight = lineHeight * lineSpacingMultiplier;

  let currentY = margin;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    // Başlık için yer kontrolü
    if (options.showHeaders && currentY > pageHeight - 40) {
      pdf.addPage();
      currentY = margin;
    }

    // Ayırıcı (ilk resim hariç)
    if (i > 0) {
      if (options.separatorStyle === 'line') {
        currentY += 5;
        pdf.setDrawColor(150, 150, 150);
        pdf.setLineWidth(0.3);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 8;
      } else if (options.separatorStyle === 'space') {
        currentY += 15;
      } else {
        currentY += 5;
      }
    }

    // Başlık
    if (options.showHeaders) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(options.fontSize);
      
      if (options.layout === 'numbered') {
        pdf.text(`[${result.imageIndex}] ${result.fileName}`, margin, currentY);
      } else if (options.layout === 'separated') {
        pdf.text(result.fileName, pageWidth / 2, currentY, { align: 'center' });
      } else {
        pdf.text(`• ${result.fileName}`, margin, currentY);
      }
      currentY += effectiveLineHeight + 3;
    }

    // Metin içeriği
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(options.fontSize);
    
    const text = result.text.trim();
    const lines = pdf.splitTextToSize(text, contentWidth);
    
    for (let j = 0; j < lines.length; j++) {
      // Sayfa sonu kontrolü
      if (currentY + effectiveLineHeight > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }
      
      pdf.text(lines[j], margin, currentY);
      currentY += effectiveLineHeight;
    }

    currentY += 5; // Sonraki resim için boşluk
  }

  pdf.save(`${fileName}.pdf`);
}

// Birleştirilmiş metin oluştur
export function getCombinedText(results: OCRResult[], options: FormatOptions): string {
  let content = '';

  results.forEach((result, index) => {
    if (index > 0) {
      if (options.separatorStyle === 'line') {
        content += '\n' + '─'.repeat(10) + '\n\n';
      } else {
        content += '\n\n';
      }
    }
    
    if (options.showHeaders && options.layout !== 'continuous') {
      content += `[${result.imageIndex}] ${result.fileName}\n`;
    }
    
    content += result.text.trim();
  });

  return content;
}
