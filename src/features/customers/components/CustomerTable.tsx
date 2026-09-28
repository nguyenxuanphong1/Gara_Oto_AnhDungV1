import {
  Edit3,
  Eye,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";

import type { Customer } from "../customers.types";

interface CustomerTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function CustomerTable({
  customers,
  onView,
  onEdit,
  onDelete,
}: CustomerTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Khách hàng
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Số điện thoại
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Địa chỉ
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ngày tạo
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => onView(customer)}
                    className="flex items-center gap-3 text-left"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                      <UserRound className="size-4" />
                    </div>

                    <span className="font-medium text-slate-900 hover:text-red-600">
                      {customer.name}
                    </span>
                  </button>
                </td>

                <td className="px-4 py-4">
                  <a
                    href={`tel:${customer.phone}`}
                    className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-red-600"
                  >
                    <Phone className="size-4 text-slate-400" />
                    {customer.phone}
                  </a>
                </td>

                <td className="max-w-[260px] px-4 py-4 text-sm text-slate-600">
                  <span className="block truncate">
                    {customer.address || "Chưa có địa chỉ"}
                  </span>
                </td>

                <td className="px-4 py-4 text-sm text-slate-500">
                  {formatDate(customer.created_at)}
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onView(customer)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      title="Xem chi tiết"
                    >
                      <Eye className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(customer)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                      title="Chỉnh sửa"
                    >
                      <Edit3 className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(customer)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Xóa"
                    >
                      <Trash2 className="size-4" />
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

export default CustomerTable;