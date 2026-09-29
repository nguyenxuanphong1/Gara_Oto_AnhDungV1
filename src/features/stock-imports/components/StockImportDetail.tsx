import {
  CalendarDays,
  Hash,
  Package,
  Warehouse,
  X,
} from "lucide-react";

import type { StockImportWithRelations } from "../stock-imports.types";

interface StockImportDetailProps {
  stockImport: StockImportWithRelations;
  onClose: () => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function StockImportDetail({
  stockImport,
  onClose,
}: StockImportDetailProps) {
  const item = stockImport.item;
  const warehouse = stockImport.warehouse;

  const totalValue =
    stockImport.quantity *
    stockImport.import_price;

  return (
    <div className="flex max-h-[90vh] flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Package size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Chi tiết phiếu nhập
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {stockImport.import_code}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-4 overflow-y-auto px-6 py-6">
        {/* Import code */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <Hash
              size={19}
              className="text-slate-500"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Mã phiếu nhập
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {stockImport.import_code}
              </p>
            </div>
          </div>
        </div>

        {/* Item */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start gap-3">
            <Package
              size={19}
              className="mt-0.5 text-slate-500"
            />

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Mặt hàng
              </p>

              {item ? (
                <>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Mã: {item.code}
                    {" · "}
                    Đơn vị: {item.unit}
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      item.item_type === "PART"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {item.item_type ===
                    "PART"
                      ? "Phụ tùng"
                      : "Dịch vụ"}
                  </span>
                </>
              ) : (
                <p className="mt-1 text-sm text-slate-400">
                  Không xác định
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Warehouse */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start gap-3">
            <Warehouse
              size={19}
              className="mt-0.5 text-slate-500"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Kho nhập
              </p>

              {warehouse ? (
                <>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {warehouse.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Mã kho:{" "}
                    {warehouse.code}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Chưa chọn kho
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Phiếu nhập này không gắn
                    với kho cụ thể.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quantity */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <Package
              size={19}
              className="text-slate-500"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Số lượng nhập
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatQuantity(
                  stockImport.quantity,
                )}{" "}
                {item?.unit ?? ""}
              </p>
            </div>
          </div>
        </div>

        {/* Import price */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-[19px] w-[19px] items-center justify-center text-sm font-bold text-slate-500">
              ₫
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Giá nhập
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatPrice(
                  stockImport.import_price,
                )}{" "}
                VNĐ
              </p>
            </div>
          </div>
        </div>

        {/* Total value */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Thành tiền
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Số lượng × Giá nhập
              </p>
            </div>

            <p className="text-lg font-bold text-slate-900">
              {formatPrice(totalValue)}{" "}
              VNĐ
            </p>
          </div>
        </div>

        {/* Created at */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start gap-3">
            <CalendarDays
              size={19}
              className="mt-0.5 text-slate-500"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Ngày tạo
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {formatDate(
                  stockImport.created_at,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

export default StockImportDetail;