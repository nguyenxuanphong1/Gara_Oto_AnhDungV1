import {
  CalendarDays,
  Hash,
  Warehouse as WarehouseIcon,
  X,
} from "lucide-react";

import type { Warehouse } from "../warehouses.types";

interface WarehouseDetailProps {
  warehouse: Warehouse;
  onClose: () => void;
  onEdit: (warehouse: Warehouse) => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function WarehouseDetail({
  warehouse,
  onClose,
  onEdit,
}: WarehouseDetailProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <WarehouseIcon size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Chi tiết kho hàng
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Thông tin kho {warehouse.code}
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

      <div className="space-y-4 px-6 py-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <Hash
              size={19}
              className="text-slate-500"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Mã kho
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {warehouse.code}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <WarehouseIcon
              size={19}
              className="text-slate-500"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Tên kho
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {warehouse.name}
              </p>
            </div>
          </div>
        </div>

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
                {formatDate(warehouse.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

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
          onClick={() => onEdit(warehouse)}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
}

export default WarehouseDetail;