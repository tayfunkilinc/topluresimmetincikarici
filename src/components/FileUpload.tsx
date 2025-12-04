import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ImagePlus } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export default function FileUpload({ onFilesSelected }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? 'border-purple-400 bg-purple-500/10 scale-[1.02]'
          : 'border-slate-600 hover:border-purple-400/50 hover:bg-slate-700/30'
      }`}
    >
      <input {...getInputProps()} />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5 ${isDragActive ? 'animate-pulse' : ''}`} />
      </div>

      <div className="relative space-y-4">
        <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center transition-transform duration-300 ${isDragActive ? 'scale-110' : ''}`}>
          {isDragActive ? (
            <Upload className="w-10 h-10 text-purple-400 animate-bounce" />
          ) : (
            <ImagePlus className="w-10 h-10 text-purple-400" />
          )}
        </div>

        {isDragActive ? (
          <div>
            <p className="text-xl font-semibold text-purple-400">
              Resimleri buraya bırakın...
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xl font-semibold text-slate-200 mb-2">
              Resimleri sürükleyip bırakın
            </p>
            <p className="text-slate-400">
              veya <span className="text-purple-400 font-medium hover:text-purple-300">dosya seçmek için tıklayın</span>
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['PNG', 'JPG', 'GIF', 'BMP', 'TIFF', 'WEBP'].map((format) => (
                <span
                  key={format}
                  className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-md"
                >
                  {format}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-3">
              ✨ Birden fazla resim seçebilirsiniz
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
