import { Loader2, CheckCircle2 } from 'lucide-react';

interface ProgressTrackerProps {
  progress: number;
  currentStep: string;
}

export default function ProgressTracker({ progress, currentStep }: ProgressTrackerProps) {
  const isComplete = progress >= 100;
  
  return (
    <div className="space-y-3 bg-slate-900/50 rounded-xl p-4 border border-slate-600/50">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-300 flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          )}
          <span className="truncate max-w-[200px] md:max-w-none">{currentStep}</span>
        </span>
        <span className={`font-mono font-semibold ${isComplete ? 'text-green-400' : 'text-purple-400'}`}>
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out relative ${
            isComplete 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
              : 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {!isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
      
      {/* Progress stages indicator */}
      <div className="flex justify-between text-xs text-slate-500">
        <span className={progress >= 10 ? 'text-purple-400' : ''}>Hazırlık</span>
        <span className={progress >= 50 ? 'text-purple-400' : ''}>OCR</span>
        <span className={progress >= 100 ? 'text-green-400' : ''}>Tamamlandı</span>
      </div>
    </div>
  );
}
