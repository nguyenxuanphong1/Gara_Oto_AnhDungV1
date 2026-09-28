import { LoaderCircle } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

function LoadingScreen({
  message = "Đang tải...",
}: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle className="size-8 animate-spin text-red-600" />

        <p className="text-sm font-medium text-slate-600">
          {message}
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;