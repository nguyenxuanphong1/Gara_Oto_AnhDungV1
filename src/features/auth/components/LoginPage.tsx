import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Power,
  Shield,
  Zap,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import carImg from "../../../assets/img-car.png";
import { supabase } from "../../../lib/supabase";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Trạng thái bật/tắt đèn pha ô tô
  const [headlightsOn, setHeadlightsOn] = useState(true);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage("Vui lòng nhập tài khoản email.");
      return;
    }

    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("Tài khoản hoặc mật khẩu không chính xác.");
      return;
    }

    navigate("/", { replace: true });
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0a0c10] font-sans text-slate-100 selection:bg-red-600 selection:text-white py-10 px-4">
      
      {/* 🛠️ BỐI CẢNH NỀN GARA TỐI MÀU (GARAGE AMBIENT) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_30%,rgba(180,30,30,0.25),rgba(5,7,12,0.95))]" />

      {/* Hiệu ứng đèn Neon Garage phía sau */}
      <div className="pointer-events-none absolute top-12 left-10 hidden md:block">
        <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 px-4 py-2 font-mono text-xs font-extrabold uppercase tracking-widest text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-sm">
          ANH DŨNG GARA
        </div>
      </div>

      {/* 💼 HỘP VALI CHẨN ĐOÁN THỦ CÔNG (DIAGNOSTIC BRIEFCASE) */}
      <div className="relative z-10 w-full max-w-4xl perspective-[1200px]">
        
        {/* Outer Heavy Duty Suitcase Frame */}
        <div className="relative rounded-[36px] border-4 border-slate-700/80 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_50px_rgba(220,38,38,0.2)]">
          
          {/* Móc khóa kim loại Vali (Top Lock Latch) */}
          <div className="absolute -top-3 left-1/4 h-3 w-16 -translate-x-1/2 rounded-t-md border-t border-slate-400 bg-gradient-to-b from-slate-300 to-slate-600 shadow-sm" />
          <div className="absolute -top-3 right-1/4 h-3 w-16 translate-x-1/2 rounded-t-md border-t border-slate-400 bg-gradient-to-b from-slate-300 to-slate-600 shadow-sm" />

          {/* Nắp Vali bên trong (Inner Casing) */}
          <div className="flex flex-col gap-4 rounded-[28px] border border-slate-700/50 bg-[#0c0f17] p-4 sm:p-6 shadow-inner">
            
            {/* 🖥️ MÀN HÌNH HIỂN THỊ XE (CAR DISPLAY HEADER) */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-4 sm:p-6 text-center shadow-lg">
              
              {/* Thẻ Header Tên Gara */}
              <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-lg border border-red-800/80 bg-red-950/60 px-4 py-1 text-xs font-black uppercase tracking-widest text-red-400 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                <Shield className="size-3.5 fill-red-500 text-red-500" />
                GARA Ô TÔ ANH DŨNG
              </div>

              {/* Chùm sáng đèn pha (Headlight Beams Effect) */}
              <div
                className={`pointer-events-none absolute left-1/2 top-10 h-44 w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-200/35 via-cyan-500/10 to-transparent blur-2xl transition-all duration-700 ${
                  headlightsOn ? "opacity-100 scale-100" : "opacity-0 scale-90"
                }`}
              />

              {/* Car Container */}
              <div className="relative flex flex-col items-center justify-center py-2">
                
                {/* Đèn gầm xe (Underglow Neon) */}
                <div
                  className={`absolute bottom-2 h-5 w-2/3 rounded-full bg-red-600 blur-xl transition-all duration-500 ${
                    headlightsOn ? "opacity-90 scale-100" : "opacity-0 scale-50"
                  }`}
                />

                {/* Car Image */}
                <img
                  src={carImg}
                  alt="Supercar Anh Dũng Gara"
                  className={`h-32 sm:h-44 w-auto object-contain transition-all duration-500 ${
                    headlightsOn
                      ? "brightness-110 drop-shadow-[0_12px_25px_rgba(239,68,68,0.4)]"
                      : "brightness-40 grayscale-[60%]"
                  }`}
                />

                {/* Công tắc BẬT/TẮT Đèn Pha */}
                <div className="absolute bottom-1 right-2 sm:right-6">
                  <button
                    type="button"
                    onClick={() => setHeadlightsOn(!headlightsOn)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1 text-[11px] font-extrabold text-slate-200 shadow-md transition-all hover:border-yellow-500 hover:text-white active:scale-95"
                  >
                    <Zap
                      className={`size-3.5 ${
                        headlightsOn ? "fill-yellow-400 text-yellow-400" : "text-slate-500"
                      }`}
                    />
                    <span>{headlightsOn ? "BẬT" : "TẮT"}</span>
                  </button>
                </div>
              </div>

              <h1 className="mt-1 text-xl sm:text-2xl font-black italic uppercase tracking-wider text-white">
                Đăng Nhập Quản Lý
              </h1>
            </div>

            {/* 🎛️ BẢNG ĐIỀU KHIỂN CƠ KHÍ & FORM DƯỚI (FORM LOGIN DASHBOARD) */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* BẢNG ĐIỀU KHIỂN CHÍNH (BÊN TRÁI - 7 COLS) */}
              <div className="md:col-span-7 flex flex-col justify-between rounded-2xl border-2 border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-5 shadow-inner">
                
                <div className="space-y-4">
                  {/* Email Slider Style Control */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Mail className="size-4 text-red-500" /> Tài khoản Email
                      </span>
                      {email.trim() && <CheckCircle2 className="size-4 text-emerald-400" />}
                    </div>

                    {/* Giả lập đường trượt kim loại */}
                    <div className="relative flex items-center">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@anhdunggara.com"
                        className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/90 px-4 text-sm font-medium text-slate-100 placeholder-slate-600 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Password Control */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Lock className="size-4 text-red-500" /> Mật khẩu
                      </span>
                      {password && <span className="text-[10px] font-mono text-emerald-400">VERIFIED</span>}
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/90 pl-4 pr-10 text-sm font-medium text-slate-100 placeholder-slate-600 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 🚀 NÚT CẦN GẠT TAY CẦM / SUBMIT BUTTON */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-red-500/80 bg-gradient-to-r from-red-700 via-red-600 to-red-800 font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(239,68,68,0.7)] active:scale-[0.98] disabled:opacity-60"
                  >
                    {/* Họa tiết kim loại nổi */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] transition-all duration-1000 group-hover:bg-right" />
                    
                    {loading ? (
                      <span className="flex items-center gap-2 text-sm">
                        <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Đang kết nối ECU...
                      </span>
                    ) : (
                      <>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-black/30 border border-white/20">
                          <Power className="size-5 text-white transition-transform group-hover:rotate-90" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                          <span className="text-sm font-black leading-tight">LOGIN</span>
                          <span className="text-[10px] font-normal text-red-200">Đăng nhập hệ thống</span>
                        </div>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* MÀN HÌNH MÁY CHẨN ĐOÁN & CẢNH BÁO (BÊN PHẢI - 5 COLS) */}
              <div className="md:col-span-5 flex flex-col justify-between gap-3">
                
                {/* Màn hình hiển thị hình ảnh Engine / ECU Diagnostic */}
                <div className="relative flex flex-col justify-between rounded-2xl border-2 border-slate-800 bg-slate-950 p-4 shadow-inner min-h-[140px]">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                    <span>DIAGNOSTIC ECU</span>
                    <span className="text-emerald-400 animate-pulse">● ONLINE</span>
                  </div>

                  {/* Sóng cơ khí giả lập */}
                  <div className="my-2 flex items-center justify-center gap-1 h-12">
                    {[40, 70, 25, 90, 60, 30, 80, 50, 100, 45, 65].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${loading ? Math.random() * 100 : h}%` }}
                        className="w-1.5 rounded-full bg-gradient-to-t from-red-600 to-cyan-400 transition-all duration-300"
                      />
                    ))}
                  </div>

                  <div className="text-center font-mono text-[10px] text-slate-500">
                    {loading ? "AUTHENTICATING ENGINE PARAMETERS..." : "READY TO CONNECT"}
                  </div>
                </div>

                {/* HỘP NỔI THÔNG BÁO LỖI (ERROR ALERT BOX) */}
                <div className="min-h-[75px]">
                  {errorMessage ? (
                    <div
                      role="alert"
                      className="rounded-xl border-2 border-red-600 bg-gradient-to-r from-red-950 via-red-900 to-black p-3 text-xs font-bold text-red-200 shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-shake"
                    >
                      <div className="flex items-center gap-2 mb-1 text-red-400">
                        <AlertCircle className="size-4 shrink-0" />
                        <span className="uppercase tracking-wider">Cảnh báo hệ thống</span>
                      </div>
                      <p className="font-medium text-[11px] text-red-100">{errorMessage}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 text-center text-[11px] font-mono text-slate-500">
                      Vui lòng nhập email & mật khẩu để truy cập vali quản lý.
                    </div>
                  )}
                </div>

              </div>

            </form>

            {/* FOOTER ĐÁY VALI (BOTTOM FOOTER INFO & HANDLE) */}
            <div className="relative flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-500">
              <div>Hệ thống Quản lý Gara Ô tô Anh Dũng &copy; 2026</div>
              <div className="font-mono text-slate-400">STATUS: READY FOR DIAGNOSTIC</div>
            </div>

          </div>

          {/* Tay cầm Vali phía dưới (Suitcase Bottom Handle) */}
          <div className="mx-auto mt-2 h-4 w-36 rounded-b-xl border-b-2 border-x-2 border-slate-600 bg-gradient-to-b from-slate-700 to-slate-900 shadow-md" />

        </div>
      </div>
    </main>
  );
}

export default LoginPage;