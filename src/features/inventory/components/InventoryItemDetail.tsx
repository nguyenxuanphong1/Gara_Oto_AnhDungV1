import {
  CalendarDays,
  CircleDollarSign,
  Hash,
  Package,
  Ruler,
  Warehouse as WarehouseIcon,
  X,
} from "lucide-react";

import type { InventoryItem } from "../inventory-items.types";

interface InventoryItemDetailProps {
  item: InventoryItem;
  onClose: () => void;
  onEdit: (item: InventoryItem) => void;
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

function getItemTypeLabel(
  itemType: InventoryItem["item_type"],
): string {
  return itemType === "PART"
    ? "Phụ tùng"
    : "Dịch vụ";
}

function InventoryItemDetail({
  item,
  onClose,
  onEdit,
}: InventoryItemDetailProps) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Package size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Chi tiết mặt hàng
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Thông tin mặt hàng {item.code}
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

      {/* Content */}
      <div className="space-y-4 px-6 py-6">
        {/* Code */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <Hash
              size={19}
              className="text-slate-500"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Mã mặt hàng
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {item.code}
              </p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <Package
              size={19}
              className="text-slate-500"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Tên mặt hàng
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {item.name}
              </p>
            </div>
          </div>
        </div>

        {/* Type */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <WarehouseIcon
              size={19}
              className="text-slate-500"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Loại mặt hàng
              </p>

              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  item.item_type === "PART"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-purple-50 text-purple-700"
                }`}
              >
                {getItemTypeLabel(
                  item.item_type,
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Unit */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <Ruler
              size={19}
              className="text-slate-500"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Đơn vị tính
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {item.unit}
              </p>
            </div>
          </div>
        </div>

        {/* Sell price */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <CircleDollarSign
              size={19}
              className="text-slate-500"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Giá bán
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatPrice(item.sell_price)} VNĐ
              </p>
            </div>
          </div>
        </div>

        {/* Stock */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <Package
              size={19}
              className="text-slate-500"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Tồn kho hiện tại
              </p>

              <p
                className={`mt-1 text-sm font-semibold ${
                  item.stock_quantity === 0
                    ? "text-red-600"
                    : "text-slate-900"
                }`}
              >
                {item.stock_quantity.toLocaleString(
                  "vi-VN",
                )}{" "}
                {item.unit}
              </p>

              {item.stock_quantity === 0 && (
                <p className="mt-1 text-xs text-red-500">
                  Hiện tại mặt hàng đã hết tồn kho.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Created at */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <CalendarDays
              size={19}
              className="text-slate-500"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Ngày tạo
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {formatDate(item.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Đóng
        </button>

        <button
          type="button"
          onClick={() => onEdit(item)}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
}

export default InventoryItemDetail;