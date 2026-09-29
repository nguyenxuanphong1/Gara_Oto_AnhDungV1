import {
  Car,
  Eye,
  MoreHorizontal,
  Pencil,
  Printer,
  Trash2,
  UserRound,
} from "lucide-react";

import type {
  RepairOrderStatus,
  RepairOrderWithRelations,
} from "../repair-orders.types";

interface RepairOrderTableProps {
  orders: RepairOrderWithRelations[];
  loading?: boolean;

  onView?: (
    order: RepairOrderWithRelations,
  ) => void;

  onPrint?: (
    order: RepairOrderWithRelations,
  ) => void;

  onEdit?: (
    order: RepairOrderWithRelations,
  ) => void;

  onDelete?: (
    order: RepairOrderWithRelations,
  ) => void;
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

function RepairOrderTable({
  orders,
  loading = false,
  onView,
  onPrint,
  onEdit,
  onDelete,
}: RepairOrderTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 p-6">
          {[1, 2, 3, 4, 5].map(
            (item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-slate-100"
              />
            ),
          )}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Car className="h-6 w-6 text-slate-400" />
        </div>

        <h3 className="text-base font-semibold text-slate-800">
          Chưa có phiếu sửa chữa
        </h3>

        <p className="mt-1 max-w-md text-sm text-slate-500">
          Chưa có dữ liệu phiếu sửa chữa
          để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* =====================================================
          DESKTOP TABLE
      ====================================================== */}

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1050px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phiếu sửa chữa
              </th>

              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Xe
              </th>

              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Khách hàng
              </th>

              <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tổng tiền
              </th>

              <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Trạng thái
              </th>

              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ngày tạo
              </th>

              <th className="w-32 px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.map(
              (order) => {
                const customer =
                  order.vehicle
                    ?.customer;

                return (
                  <tr
                    key={order.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    {/* ORDER CODE */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          onView?.(
                            order,
                          )
                        }
                        className="text-left"
                      >
                        <div className="font-semibold text-red-600 hover:text-red-700">
                          {
                            order.order_code
                          }
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {order.details
                            .length}{" "}
                          dòng chi tiết
                        </div>
                      </button>
                    </td>

                    {/* VEHICLE */}
                    <td className="px-4 py-4">
                      {order.vehicle ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-slate-400" />

                            <span className="font-semibold text-slate-800">
                              {
                                order
                                  .vehicle
                                  .license_plate
                              }
                            </span>
                          </div>

                          <div className="mt-1 pl-6 text-sm text-slate-500">
                            {
                              order
                                .vehicle
                                .car_model
                            }
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Không xác định
                        </span>
                      )}
                    </td>

                    {/* CUSTOMER */}
                    <td className="px-4 py-4">
                      {customer ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <UserRound className="h-4 w-4 text-slate-400" />

                            <span className="font-medium text-slate-800">
                              {
                                customer.name
                              }
                            </span>
                          </div>

                          {customer.phone && (
                            <div className="mt-1 pl-6 text-sm text-slate-500">
                              {
                                customer.phone
                              }
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Không xác định
                        </span>
                      )}
                    </td>

                    {/* TOTAL */}
                    <td className="px-4 py-4 text-right">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(
                          order.total_amount,
                        )}{" "}
                        đ
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClass(
                          order.status,
                        )}`}
                      >
                        {getStatusLabel(
                          order.status,
                        )}
                      </span>
                    </td>

                    {/* CREATED */}
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {formatDate(
                        order.created_at,
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {onPrint && (
                            <button
                                type="button"
                                title="In hóa đơn A5"
                                onClick={() =>
                                onPrint(order)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                                <Printer className="h-4 w-4" />
                            </button>
                            )}

                        {onEdit &&
                          order.status !==
                            "COMPLETED" && (
                            <button
                              type="button"
                              title="Sửa phiếu"
                              onClick={() =>
                                onEdit(
                                  order,
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}

                        {onDelete &&
                          order.status !==
                            "COMPLETED" && (
                            <button
                              type="button"
                              title="Xóa phiếu"
                              onClick={() =>
                                onDelete(
                                  order,
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}

                        {!onView &&
                            !onPrint &&
                            !onEdit &&
                            !onDelete && (
                            <button
                              type="button"
                              disabled
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          MOBILE / TABLET CARDS
      ====================================================== */}

      <div className="divide-y divide-slate-100 lg:hidden">
        {orders.map(
          (order) => {
            const customer =
              order.vehicle
                ?.customer;

            return (
              <div
                key={order.id}
                className="p-4 sm:p-5"
              >
                {/* HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        onView?.(
                          order,
                        )
                      }
                      className="font-semibold text-red-600 hover:text-red-700"
                    >
                      {
                        order.order_code
                      }
                    </button>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(
                        order.created_at,
                      )}
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClass(
                      order.status,
                    )}`}
                  >
                    {getStatusLabel(
                      order.status,
                    )}
                  </span>
                </div>

                {/* VEHICLE */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-slate-400" />

                    <span className="font-semibold text-slate-800">
                      {order.vehicle
                        ?.license_plate ??
                        "Không xác định"}
                    </span>
                  </div>

                  {order.vehicle
                    ?.car_model && (
                    <p className="mt-1 pl-6 text-sm text-slate-500">
                      {
                        order
                          .vehicle
                          .car_model
                      }
                    </p>
                  )}
                </div>

                {/* CUSTOMER */}
                <div className="mt-3 flex items-start gap-2">
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {customer?.name ??
                        "Không xác định"}
                    </p>

                    {customer?.phone && (
                      <p className="mt-0.5 text-sm text-slate-500">
                        {
                          customer.phone
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* TOTAL */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-sm text-slate-500">
                    Tổng tiền
                  </span>

                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(
                      order.total_amount,
                    )}{" "}
                    đ
                  </span>
                </div>

                {/* ACTIONS */}
                {(onView ||
                    onPrint ||
                    onEdit ||
                    onDelete) && (
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                    {onView && (
                      <button
                        type="button"
                        onClick={() =>
                          onView(
                            order,
                          )
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" />
                        Xem
                      </button>
                    )}

                    {onPrint && (
                        <button
                            type="button"
                            onClick={() =>
                            onPrint(order)
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                            <Printer className="h-4 w-4" />
                            In
                        </button>
                        )}

                    {onEdit &&
                      order.status !==
                        "COMPLETED" && (
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(
                              order,
                            )
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Sửa
                        </button>
                      )}

                    {onDelete &&
                      order.status !==
                        "COMPLETED" && (
                        <button
                          type="button"
                          onClick={() =>
                            onDelete(
                              order,
                            )
                          }
                          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
        <p className="text-xs text-slate-500">
          Tổng số:{" "}
          <strong className="text-slate-700">
            {orders.length}
          </strong>{" "}
          phiếu sửa chữa
        </p>
      </div>
    </div>
  );
}

export default RepairOrderTable;