import {
  CarFront,
  Edit3,
  Eye,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";

import type { VehicleWithCustomer } from "../vehicles.types";

interface VehicleTableProps {
  vehicles: VehicleWithCustomer[];
  onView: (vehicle: VehicleWithCustomer) => void;
  onEdit: (vehicle: VehicleWithCustomer) => void;
  onDelete: (vehicle: VehicleWithCustomer) => void;
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

function VehicleTable({
  vehicles,
  onView,
  onEdit,
  onDelete,
}: VehicleTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[820px] w-full border-collapse">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Xe
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Khách hàng
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Điện thoại
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
            {vehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => onView(vehicle)}
                    className="flex items-center gap-3 text-left"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <CarFront className="size-4" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {vehicle.license_plate}
                      </p>

                      <p className="text-sm text-slate-500">
                        {vehicle.car_model}
                      </p>
                    </div>
                  </button>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <UserRound className="size-4 text-slate-400" />

                    <span className="text-sm font-medium text-slate-700">
                      {vehicle.customer?.name ??
                        "Không xác định"}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-4">
                  {vehicle.customer?.phone ? (
                    <a
                      href={`tel:${vehicle.customer.phone}`}
                      className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-red-600"
                    >
                      <Phone className="size-4 text-slate-400" />

                      {vehicle.customer.phone}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">
                      -
                    </span>
                  )}
                </td>

                <td className="px-4 py-4 text-sm text-slate-500">
                  {formatDate(vehicle.created_at)}
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onView(vehicle)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      title="Xem chi tiết"
                    >
                      <Eye className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(vehicle)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                      title="Chỉnh sửa"
                    >
                      <Edit3 className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(vehicle)}
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

export default VehicleTable;