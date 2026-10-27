
import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";

type RevenueOrder = {
  total_amount: number | string | null;
  created_at: string;
};

type RevenueMode = "day" | "month" | "year";

type RevenuePoint = {
  label: string;
  amount: number;
};

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(value));

function RevenueReport() {
  const today = new Date();

  const [mode, setMode] = useState<RevenueMode>("day");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [orders, setOrders] = useState<RevenueOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRevenue() {
      setLoading(true);
      setError("");

      try {
        const allOrders: RevenueOrder[] = [];
        const pageSize = 1000;
        let from = 0;

        while (true) {
          const { data, error: queryError } = await supabase
            .from("repair_orders")
            .select("total_amount, created_at")
            .eq("status", "COMPLETED")
            .not("created_at", "is", null)
            .order("created_at", { ascending: true })
            .range(from, from + pageSize - 1);

          if (queryError) throw queryError;

          const page = (data ?? []) as RevenueOrder[];
          allOrders.push(...page);

          if (page.length < pageSize) break;
          from += pageSize;
        }

        if (!cancelled) setOrders(allOrders);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu doanh thu.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadRevenue();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set<number>([today.getFullYear()]);

    for (const order of orders) {
      const date = new Date(order.created_at);
      if (!Number.isNaN(date.getTime())) {
        years.add(date.getFullYear());
      }
    }

    return [...years].sort((a, b) => b - a);
  }, [orders, today]);

  const points = useMemo<RevenuePoint[]>(() => {
    const validOrders = orders.filter((order) => {
      const date = new Date(order.created_at);
      return !Number.isNaN(date.getTime());
    });

    if (mode === "day") {
      const daysInMonth = new Date(year, month, 0).getDate();

      return Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;

        const amount = validOrders.reduce((sum, order) => {
          const date = new Date(order.created_at);

          return date.getFullYear() === year &&
            date.getMonth() + 1 === month &&
            date.getDate() === day
            ? sum + Number(order.total_amount ?? 0)
            : sum;
        }, 0);

        return { label: `${day}`, amount };
      });
    }

    if (mode === "month") {
      return Array.from({ length: 12 }, (_, index) => {
        const monthNumber = index + 1;

        const amount = validOrders.reduce((sum, order) => {
          const date = new Date(order.created_at);

          return date.getFullYear() === year &&
            date.getMonth() + 1 === monthNumber
            ? sum + Number(order.total_amount ?? 0)
            : sum;
        }, 0);

        return { label: `T${monthNumber}`, amount };
      });
    }

    const years = [...new Set([
      ...availableYears,
      ...validOrders.map(
        (order) => new Date(order.created_at).getFullYear(),
      ),
    ])].sort((a, b) => a - b);

    return years.map((itemYear) => {
      const amount = validOrders.reduce((sum, order) => {
        return new Date(order.created_at).getFullYear() === itemYear
          ? sum + Number(order.total_amount ?? 0)
          : sum;
      }, 0);

      return { label: `${itemYear}`, amount };
    });
  }, [orders, mode, year, month, availableYears]);

  const total = points.reduce((sum, point) => sum + point.amount, 0);
  const maxAmount = Math.max(...points.map((point) => point.amount), 0);

  const title =
    mode === "day"
      ? `Doanh thu từng ngày · Tháng ${month}/${year}`
      : mode === "month"
        ? `Doanh thu từng tháng · Năm ${year}`
        : "Doanh thu từng năm";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <BarChart3 className="size-5" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">
                Báo cáo doanh thu
              </h2>
              <p className="mt-1 text-sm text-slate-500">{title}</p>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Tổng doanh thu kỳ đang xem
          </p>

          <p className="mt-1 text-3xl font-black text-red-600">
            {money(total)}{" "}
            <span className="text-sm font-bold text-slate-400">VNĐ</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as RevenueMode)
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-red-500"
          >
            <option value="day">Theo ngày</option>
            <option value="month">Theo tháng</option>
            <option value="year">Theo năm</option>
          </select>

          {mode !== "year" && (
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-red-500"
            >
              {availableYears.map((itemYear) => (
                <option key={itemYear} value={itemYear}>
                  Năm {itemYear}
                </option>
              ))}
            </select>
          )}

          {mode === "day" && (
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-red-500"
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map(
                (itemMonth) => (
                  <option key={itemMonth} value={itemMonth}>
                    Tháng {itemMonth}
                  </option>
                ),
              )}
            </select>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Không tải được doanh thu: {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-slate-500">
          <RefreshCw className="size-4 animate-spin" />
          Đang tải dữ liệu doanh thu...
        </div>
      ) : !error ? (
        <>
          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[520px]">
              <div className="flex h-64 items-end gap-1 border-b border-slate-200 px-1 sm:gap-2">
                {points.map((point) => {
                  const height =
                    maxAmount > 0
                      ? (point.amount / maxAmount) * 100
                      : 0;

                  return (
                    <div
                      key={point.label}
                      className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                      title={`${point.label}: ${money(point.amount)} VNĐ`}
                    >
                      <div className="mb-2 hidden text-center text-[10px] font-semibold text-slate-500 group-hover:block">
                        {point.amount > 0 ? money(point.amount) : ""}
                      </div>

                      <div
                        className="w-full max-w-10 rounded-t-md bg-red-500 transition-all duration-200 group-hover:bg-red-700"
                        style={{
                          height: `${height}%`,
                          minHeight: point.amount > 0 ? "3px" : "0",
                        }}
                      />

                      <span className="mt-2 h-6 text-[10px] font-medium text-slate-500 sm:text-xs">
                        {point.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {maxAmount === 0 && (
            <p className="mt-4 text-center text-sm text-slate-500">
              Chưa có doanh thu hoàn thành trong kỳ này.
            </p>
          )}

          <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <CalendarDays className="size-4" />
            Doanh thu được nhóm theo ngày tạo phiếu sửa chữa.
          </p>
        </>
      ) : null}
    </section>
  );
}

export default RevenueReport;
