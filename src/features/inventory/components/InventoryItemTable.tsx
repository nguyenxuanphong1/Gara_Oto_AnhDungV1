import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import type { InventoryItem } from "../inventory-items.types";

interface InventoryItemTableProps {
  items: InventoryItem[];
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
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

function InventoryItemTable({
  items,
  onView,
  onEdit,
  onDelete,
}: InventoryItemTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mã
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tên mặt hàng
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Loại
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Đơn vị
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Giá bán
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tồn kho
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ngày tạo
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr
                key={item.id}
                className="transition hover:bg-slate-50"
              >
                {/* Code */}
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
                    {item.code}
                  </span>
                </td>

                {/* Name */}
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onView(item)}
                    className="text-left text-sm font-medium text-slate-900 transition hover:text-slate-600"
                  >
                    {item.name}
                  </button>
                </td>

                {/* Type */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      item.item_type === "PART"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {getItemTypeLabel(
                      item.item_type,
                    )}
                  </span>
                </td>

                {/* Unit */}
                <td className="px-5 py-4 text-sm text-slate-600">
                  {item.unit}
                </td>

                {/* Sell price */}
                <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-900">
                  {formatPrice(item.sell_price)}{" "}
                  <span className="font-normal text-slate-400">
                    VNĐ
                  </span>
                </td>

                {/* Stock */}
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <span
                    className={`text-sm font-semibold ${
                      item.stock_quantity === 0
                        ? "text-red-600"
                        : "text-slate-900"
                    }`}
                  >
                    {item.stock_quantity.toLocaleString(
                      "vi-VN",
                    )}
                  </span>

                  <span className="ml-1 text-xs text-slate-400">
                    {item.unit}
                  </span>
                </td>

                {/* Created at */}
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                  {formatDate(item.created_at)}
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      aria-label={`Xem ${item.name}`}
                      title="Xem chi tiết"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                      aria-label={`Sửa ${item.name}`}
                      title="Chỉnh sửa"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Xóa ${item.name}`}
                      title="Xóa"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryItemTable;