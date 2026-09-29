import {
  CalendarDays,
  Car,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Package,
  UserRound,
  Warehouse,
  Wrench,
  XCircle,
} from "lucide-react";

import type {
  RepairOrderStatus,
  RepairOrderWithRelations,
} from "../repair-orders.types";

interface RepairOrderDetailProps {
  order: RepairOrderWithRelations;
  onClose?: () => void;
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "vi-VN",
  ).format(Math.round(value));
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function getStatusLabel(
  status: RepairOrderStatus,
): string {
  switch (status) {
    case "DRAFT":
      return "Nháp";

    case "COMPLETED":
      return "Hoàn thành";

    case "CANCELLED":
      return "Đã hủy";

    default:
      return status;
  }
}

function getStatusClass(
  status: RepairOrderStatus,
): string {
  switch (status) {
    case "DRAFT":
      return "bg-amber-50 text-amber-700 ring-amber-200";

    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";

    case "CANCELLED":
      return "bg-slate-100 text-slate-600 ring-slate-200";

    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function getItemTypeLabel(
  type: "PART" | "SERVICE",
): string {
  return type === "PART"
    ? "Phụ tùng"
    : "Dịch vụ";
}

function getItemTypeClass(
  type: "PART" | "SERVICE",
): string {
  return type === "PART"
    ? "bg-orange-50 text-orange-700"
    : "bg-blue-50 text-blue-700";
}

function RepairOrderDetail({
  order,
  onClose,
}: RepairOrderDetailProps) {
  const customer =
    order.vehicle?.customer;

  const detailTotal =
    order.details.reduce(
      (sum, detail) =>
        sum +
        Number(detail.amount ?? 0),
      0,
    );

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <ClipboardList className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Phiếu sửa chữa
                </p>

                <h2 className="text-xl font-bold text-slate-900">
                  {order.order_code}
                </h2>
              </div>
            </div>
          </div>

          <div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${getStatusClass(
                order.status,
              )}`}
            >
              {order.status ===
                "COMPLETED" && (
                <CheckCircle2 className="h-4 w-4" />
              )}

              {order.status ===
                "CANCELLED" && (
                <XCircle className="h-4 w-4" />
              )}

              {order.status ===
                "DRAFT" && (
                <ClipboardList className="h-4 w-4" />
              )}

              {getStatusLabel(
                order.status,
              )}
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* XE */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Car className="h-4 w-4" />
              Xe
            </div>

            <p className="mt-2 font-bold text-slate-900">
              {order.vehicle
                ?.license_plate ??
                "-"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {order.vehicle
                ?.car_model ??
                "-"}
            </p>
          </div>

          {/* KHÁCH HÀNG */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <UserRound className="h-4 w-4" />
              Khách hàng
            </div>

            <p className="mt-2 font-semibold text-slate-900">
              {customer?.name ??
                "-"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {customer?.phone ??
                "-"}
            </p>
          </div>

          {/* KM */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Gauge className="h-4 w-4" />
              Số km
            </div>

            <p className="mt-2 font-bold text-slate-900">
              {new Intl.NumberFormat(
                "vi-VN",
              ).format(
                order.odometer_km,
              )}{" "}
              km
            </p>
          </div>

          {/* KHO */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Warehouse className="h-4 w-4" />
              Kho
            </div>

            {order.warehouse ? (
              <>
                <p className="mt-2 font-semibold text-slate-900">
                  {
                    order
                      .warehouse
                      .code
                  }
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    order
                      .warehouse
                      .name
                  }
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                Không chọn kho
              </p>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          DETAILS
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package className="h-5 w-5" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Chi tiết sửa chữa
              </h3>

              <p className="text-sm text-slate-500">
                {order.details.length}{" "}
                dòng vật tư / dịch vụ
              </p>
            </div>
          </div>
        </div>

        {order.details.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <Package className="h-8 w-8 text-slate-300" />

            <p className="mt-3 text-sm text-slate-500">
              Phiếu chưa có chi tiết.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    STT
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Vật tư / dịch vụ
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Loại
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    SL
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Đơn giá
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Thành tiền
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {order.details.map(
                  (
                    detail,
                    index,
                  ) => (
                    <tr
                      key={
                        detail.id
                      }
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4">
                        {detail.item ? (
                          <div>
                            <p className="font-medium text-slate-900">
                              {
                                detail
                                  .item
                                  .name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {
                                detail
                                  .item
                                  .code
                              }
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Không xác định
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {detail.item ? (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getItemTypeClass(
                              detail
                                .item
                                .item_type,
                            )}`}
                          >
                            {getItemTypeLabel(
                              detail
                                .item
                                .item_type,
                            )}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-4 py-4 text-right text-sm text-slate-700">
                        {new Intl.NumberFormat(
                          "vi-VN",
                        ).format(
                          detail.quantity,
                        )}{" "}
                        {detail.item
                          ?.unit ??
                          ""}
                      </td>

                      <td className="px-4 py-4 text-right text-sm text-slate-700">
                        {formatCurrency(
                          detail.price,
                        )}{" "}
                        đ
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                        {formatCurrency(
                          detail.amount,
                        )}{" "}
                        đ
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =====================================================
          TOTAL
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Wrench className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Thông tin thanh toán
                </h3>

                <p className="text-sm text-slate-500">
                  Tổng tiền do Database tính toán
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Tiền vật tư / dịch vụ
                </span>

                <span className="font-medium text-slate-800">
                  {formatCurrency(
                    detailTotal,
                  )}{" "}
                  đ
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Tiền công
                </span>

                <span className="font-medium text-slate-800">
                  {formatCurrency(
                    order.labor_cost,
                  )}{" "}
                  đ
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Giảm giá
                </span>

                <span className="font-medium text-red-600">
                  -{" "}
                  {formatCurrency(
                    order.discount,
                  )}{" "}
                  đ
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-between rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-slate-700">
                Tổng cộng
              </span>

              <span className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  order.total_amount,
                )}{" "}
                đ
              </span>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4" />

                <span>
                  Tạo lúc:
                </span>

                <strong className="text-slate-700">
                  {formatDate(
                    order.created_at,
                  )}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CLOSE
      ====================================================== */}

      {onClose && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}

export default RepairOrderDetail;