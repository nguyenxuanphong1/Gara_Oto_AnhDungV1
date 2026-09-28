import {
  Edit3,
  MapPin,
  Phone,
  UserRound,
  X,
} from "lucide-react";

import type { Customer } from "../customers.types";

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function CustomerDetail({
  customer,
  onClose,
  onEdit,
}: CustomerDetailProps) {
  return (
    <div className="flex max-h-[90vh] flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-600">
            <UserRound className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Chi tiết khách hàng
            </h2>

            <p className="text-xs text-slate-500">
              Thông tin từ bảng customers
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Đóng"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="overflow-y-auto px-5 py-5">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Tên khách hàng
            </p>

            <p className="mt-1 text-base font-semibold text-slate-900">
              {customer.name}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Phone className="size-4" />

                <span className="text-xs font-medium uppercase tracking-wide">
                  Điện thoại
                </span>
              </div>

              <a
                href={`tel:${customer.phone}`}
                className="mt-2 block text-sm font-semibold text-slate-900 hover:text-red-600"
              >
                {customer.phone}
              </a>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="size-4" />

                <span className="text-xs font-medium uppercase tracking-wide">
                  Địa chỉ
                </span>
              </div>

              <p className="mt-2 text-sm font-medium text-slate-900">
                {customer.address || "Chưa có địa chỉ"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Ngày tạo
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {formatDate(customer.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Đóng
        </button>

        <button
          type="button"
          onClick={() => onEdit(customer)}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <Edit3 className="size-4" />
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
}

export default CustomerDetail;