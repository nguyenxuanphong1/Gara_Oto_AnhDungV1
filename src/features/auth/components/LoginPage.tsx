import {
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../../lib/supabase";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage("Vui lòng nhập email.");
      return;
    }

    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    setLoading(false);

    if (error) {
      setErrorMessage(
        "Email hoặc mật khẩu không chính xác.",
      );
      return;
    }

    navigate("/", { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
        <div className="w-full overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="bg-red-600 px-6 py-8 text-white sm:px-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15">
              <ShieldCheck className="size-7" />
            </div>

            <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-red-100">
              Gara Ô Tô Anh Dũng
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              Đăng nhập quản lý
            </h1>

            <p className="mt-2 text-sm text-red-100">
              Hệ thống quản lý gara dành cho quản trị viên.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-6 sm:p-8"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="admin@example.com"
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Mật khẩu
              </label>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Nhập mật khẩu"
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Đang đăng nhập..."
              ) : (
                <>
                  <LogIn className="size-5" />
                  Đăng nhập
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;