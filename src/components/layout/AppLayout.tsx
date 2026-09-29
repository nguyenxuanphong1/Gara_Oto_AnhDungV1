import {
  Car,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings2,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../app/providers/AuthProvider";

const navigation = [
  {
    label: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Khách hàng",
    to: "/customers",
    icon: Users,
  },
  {
    label: "Xe",
    to: "/vehicles",
    icon: Car,
  },
  {
    label: "Kho phụ tùng",
    to: "/inventory-items",
    icon: Package,
  },
  {
    label: "Kho hàng",
    to: "/warehouses",
    icon: Warehouse,
  },
  {
    label: "Nhập kho",
    to: "/stock-imports",
    icon: Package,
  },
  {
    label: "Phiếu sửa chữa",
    to: "/repair-orders",
    icon: ClipboardList,
  },
];

function AppLayout() {
  const { user, signOut } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error("Không thể đăng xuất:", error);
    }
  }

  const avatarLetter = (
    user?.email?.charAt(0) ?? "A"
  ).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white transition-transform duration-200",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div>
            <p className="text-sm font-bold">
              GARA Ô TÔ ANH DŨNG
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              Quản lý gara
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon className="size-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold">
              {avatarLetter}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Admin
              </p>

              <p className="truncate text-xs text-slate-400">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="size-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Mở menu"
          >
            <Menu className="size-6" />
          </button>

          <div className="hidden items-center gap-2 text-sm font-medium text-slate-600 sm:flex">
            <Settings2 className="size-4" />
            <span>Khu vực quản trị</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block">
              {user?.email}
            </span>

            <div className="flex size-9 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
              {avatarLetter}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-2 py-2 lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium",
                    isActive
                      ? "bg-red-50 text-red-600"
                      : "text-slate-500",
                  ].join(" ")
                }
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default AppLayout;