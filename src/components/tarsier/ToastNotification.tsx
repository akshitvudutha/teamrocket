import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  title: string;
  desc: string;
  type: 'success' | 'alert' | 'info';
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isAlert = toast.type === 'alert';

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
      <div
        className={`rounded-2xl p-4 shadow-2xl border backdrop-blur-xl flex items-start space-x-3 ${
          isAlert
            ? 'bg-red-950/80 border-red-500/40 text-white'
            : isSuccess
            ? 'bg-emerald-950/80 border-emerald-500/40 text-white'
            : 'bg-[#15151A]/90 border-white/15 text-white'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isAlert ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Info className="w-5 h-5 text-[#007AFF]" />
          )}
        </div>

        <div className="flex-1">
          <div className="text-xs font-bold tracking-tight">{toast.title}</div>
          <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">{toast.desc}</p>
        </div>

        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
