import {
  CarFront,
  Edit3,
  Phone,
  UserRound,
  X,
} from "lucide-react";

import type { VehicleWithCustomer } from "../vehicles.types";

interface VehicleDetailProps {
  vehicle: VehicleWithCustomer;
  onClose: () => void;
  onEdit: (vehicle: VehicleWithCustomer) => void;
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

function VehicleDetail({
  vehicle,
  onClose,
  onEdit,
}: VehicleDetailProps) {
  return (
    <div className="flex max-h-[90vh] flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <CarFront className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Chi tiết xe
            </h2>

            <p className="text-xs text-slate-500">
              Thông tin từ bảng vehicles
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
              Biển số xe
            </p>

            <p className="mt-1 text-xl font-bold tracking-wide text-slate-900">
              {vehicle.license_plate}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <CarFront className="size-4" />

                <span className="text-xs font-medium uppercase tracking-wide">
                  Dòng xe
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {vehicle.car_model}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <UserRound className="size-4" />

                <span className="text-xs font-medium uppercase tracking-wide">
                  Chủ xe
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {vehicle.customer?.name ??
                  "Không xác định"}
              </p>

              {vehicle.customer?.phone && (
                <a
                  href={`tel:${vehicle.customer.phone}`}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600"
                >
                  <Phone className="size-3.5" />
                  {vehicle.customer.phone}
                </a>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Ngày tạo
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {formatDate(vehicle.created_at)}
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
          onClick={() => onEdit(vehicle)}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <Edit3 className="size-4" />
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
}

export default VehicleDetail;