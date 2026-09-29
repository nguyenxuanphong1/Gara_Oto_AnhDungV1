import { Wrench } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

function LoadingScreen({
  message = "Đang tải dữ liệu...",
}: LoadingScreenProps) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center gap-3 bg-slate-50">
      <div className="relative flex items-center justify-center">
        {/* Vòng xoay */}
        <div className="size-12 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />

        {/* Icon ở giữa */}
        <Wrench className="absolute size-5 text-red-600" />
      </div>

      <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
        {message}
      </p>
    </div>
  );
}

export default LoadingScreen;