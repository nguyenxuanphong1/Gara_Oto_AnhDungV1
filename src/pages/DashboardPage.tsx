import {
  Activity,
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  RefreshCw,
  TrendingUp,
  Users,
  Warehouse,
  Wrench,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import LoadingScreen from "../components/common/LoadingScreen";

import {
  getDashboardStats,
  type DashboardStats,
} from "./dashboard.api";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboardStats();

      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu Dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   *
   * Dùng LoadingScreen dùng chung cho toàn bộ ứng dụng.
   */
  if (loading && !stats) {
    return (
      <LoadingScreen message="Đang kết nối trung tâm điều hành..." />
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */
  if (error && !stats) {
    return (
      <div className="min-h-[500px] bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-lg rounded-3xl border border-red-200 bg-red-50/80 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-red-200 bg-red-100 text-red-600">
            <AlertTriangle className="size-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            Không thể kết nối hệ thống
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              void loadDashboard();
            }}
            disabled={loading}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  /*
   * ============================================================
   * TỶ LỆ HOÀN THÀNH
   * ============================================================
   */
  const completionRate =
    stats.repairOrders > 0
      ? Math.round(
          (stats.completedOrders / stats.repairOrders) * 100,
        )
      : 0;

  return (
    <div className="min-h-screen space-y-8 bg-slate-50/60 p-4 font-sans text-slate-800 sm:p-8">
      {/* ========================================================
          HEADER
      ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 size-80 rounded-full bg-red-500/5 blur-[90px]" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-600">
              <Activity className="size-3.5 animate-pulse text-red-600" />

              GARAGE EXECUTIVE DASHBOARD
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              GARA Ô TÔ ANH DŨNG
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Báo cáo hiệu suất vận hành & thống kê trực quan hệ thống
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadDashboard();
            }}
            disabled={loading}
            className="group inline-flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:border-red-500 hover:text-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 text-red-600 transition-transform ${
                loading
                  ? "animate-spin"
                  : "duration-500 group-hover:rotate-180"
              }`}
            />

            Cập nhật dữ liệu
          </button>
        </div>
      </section>

      {/* ========================================================
          DOANH THU + CHỈ SỐ CHÍNH
      ======================================================== */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Tổng giá trị phiếu */}
        <div className="relative overflow-hidden rounded-3xl border border-red-100 bg-gradient-to-br from-red-600 via-red-600 to-red-700 p-6 text-white shadow-xl shadow-red-600/15">
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-100">
              Tổng Giá Trị Phiếu
            </span>

            <div className="flex size-10 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md">
              <DollarSign className="size-5" />
            </div>
          </div>

          <div className="relative mt-6">
            <div className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              {formatCurrency(stats.totalRepairAmount)}{" "}
              <span className="text-base font-bold text-red-200">
                VNĐ
              </span>
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-100/90">
              <TrendingUp className="size-3.5" />

              Tổng doanh số tính trên các phiếu dịch vụ
            </p>
          </div>
        </div>

        {/* 4 chỉ số */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <StatCard
            title="Khách hàng"
            value={stats.customers}
            icon={<Users className="size-5" />}
            description="Số lượng khách hàng lưu trữ"
            accentColor="emerald"
          />

          <StatCard
            title="Đội xe đăng ký"
            value={stats.vehicles}
            icon={<Car className="size-5" />}
            description="Tổng số xe đã bảo dưỡng / sửa"
            accentColor="cyan"
          />

          <StatCard
            title="Phiếu sửa chữa"
            value={stats.repairOrders}
            icon={<Wrench className="size-5" />}
            description="Tổng hồ sơ phiếu đã tạo"
            accentColor="amber"
          />

          <StatCard
            title="Danh mục vật tư"
            value={stats.inventoryItems}
            icon={<Package className="size-5" />}
            description="Sản phẩm & phụ tùng khả dụng"
            accentColor="purple"
          />
        </div>
      </section>

      {/* ========================================================
          QUẢN LÝ KHO
      ======================================================== */}
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Kho hàng quản lý"
          value={stats.warehouses}
          icon={<Warehouse className="size-5" />}
          description="Địa điểm kho hoạt động"
          accentColor="blue"
        />

        <StatCard
          title="Phiếu nhập kho"
          value={stats.stockImports}
          icon={<Package className="size-5" />}
          description="Tổng các đợt nhập phụ tùng"
          accentColor="indigo"
        />

        <StatCard
          title="Tỷ lệ hoàn thành"
          value={`${completionRate}%`}
          icon={<CheckCircle2 className="size-5" />}
          description="Hiệu suất xử lý phiếu dịch vụ"
          accentColor="emerald"
        />
      </section>

      {/* ========================================================
          TRẠNG THÁI PHIẾU SỬA CHỮA
      ======================================================== */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Trạng thái phiếu dịch vụ
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Theo dõi tiến độ gia công & sửa chữa xe trong xưởng
            </p>
          </div>

          <span className="font-mono text-xs font-semibold text-slate-400">
            TOTAL: {stats.repairOrders} ORDERS
          </span>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <StatusProgressCard
            title="Phiếu nháp / Chờ xử lý"
            value={stats.draftOrders}
            total={stats.repairOrders}
            icon={<Clock className="size-5 text-amber-600" />}
            color="amber"
          />

          <StatusProgressCard
            title="Đã hoàn thành"
            value={stats.completedOrders}
            total={stats.repairOrders}
            icon={
              <CheckCircle2 className="size-5 text-emerald-600" />
            }
            color="emerald"
          />

          <StatusProgressCard
            title="Đã hủy"
            value={stats.cancelledOrders}
            total={stats.repairOrders}
            icon={<XCircle className="size-5 text-red-600" />}
            color="red"
          />
        </div>
      </section>

      {/* ========================================================
          THÔNG TIN GARA
      ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
            <Wrench className="size-6" />
          </div>

          <div>
            <h3 className="text-base font-extrabold tracking-wide text-slate-900">
              HỆ THỐNG QUẢN LÝ GARA Ô TÔ ANH DŨNG
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Cung cấp giải pháp quản trị toàn diện cho dịch vụ ô tô:
              quản lý hồ sơ xe, theo dõi lịch trình sửa chữa, kiểm soát
              tồn kho phụ tùng và doanh thu garage.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          ĐANG CẬP NHẬT DỮ LIỆU
      ========================================================

          Khi bấm "Cập nhật dữ liệu", không làm mất Dashboard.
          Chỉ hiển thị trạng thái loading trên nút.
      ======================================================== */}
      {error && stats && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />

            <div>
              <p className="font-bold">
                Không thể cập nhật dữ liệu mới nhất
              </p>

              <p className="mt-1 text-xs text-amber-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   STAT CARD
================================================================ */

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  accentColor:
    | "emerald"
    | "cyan"
    | "amber"
    | "purple"
    | "blue"
    | "indigo";
}

function StatCard({
  title,
  value,
  description,
  icon,
  accentColor,
}: StatCardProps) {
  const colorClasses = {
    emerald:
      "text-emerald-600 bg-emerald-50 border-emerald-100",
    cyan: "text-cyan-600 bg-cyan-50 border-cyan-100",
    amber:
      "text-amber-600 bg-amber-50 border-amber-100",
    purple:
      "text-purple-600 bg-purple-50 border-purple-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    indigo:
      "text-indigo-600 bg-indigo-50 border-indigo-100",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {typeof value === "number"
              ? formatCurrency(value)
              : value}
          </p>
        </div>

        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border ${colorClasses[accentColor]}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-[11px] font-medium text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* ================================================================
   STATUS PROGRESS CARD
================================================================ */

interface StatusProgressCardProps {
  title: string;
  value: number;
  total: number;
  icon: React.ReactNode;
  color: "amber" | "emerald" | "red";
}

function StatusProgressCard({
  title,
  value,
  total,
  icon,
  color,
}: StatusProgressCardProps) {
  const percentage =
    total > 0
      ? Math.min(100, Math.round((value / total) * 100))
      : 0;

  const barColors = {
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    red: "bg-red-500",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon}

          <span className="truncate text-xs font-bold text-slate-700">
            {title}
          </span>
        </div>

        <span className="shrink-0 font-mono text-xs font-bold text-slate-500">
          {percentage}%
        </span>
      </div>

      <div className="mt-3 text-2xl font-black text-slate-900">
        {formatCurrency(value)}{" "}
        <span className="text-xs font-medium text-slate-400">
          phiếu
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          style={{
            width: `${percentage}%`,
          }}
          className={`h-full rounded-full transition-all duration-500 ${barColors[color]}`}
        />
      </div>
    </div>
  );
}

export default DashboardPage;