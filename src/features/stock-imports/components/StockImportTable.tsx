import {
  Eye,
  Package,
  Warehouse,
} from "lucide-react";

import type { StockImportWithRelations } from "../stock-imports.types";

interface StockImportTableProps {
  imports: StockImportWithRelations[];
  onView: (
    stockImport: StockImportWithRelations,
  ) => void;
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

function formatQuantity(
  value: number,
): string {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function StockImportTable({
  imports,
  onView,
}: StockImportTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mã phiếu
              </th>

              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mặt hàng
              </th>

              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Kho nhập
              </th>

              <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Số lượng
              </th>

              <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Giá nhập
              </th>

              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ngày nhập
              </th>

              <th className="w-20 px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Xem
              </th>
            </tr>
          </thead>

          <tbody>
            {imports.map(
              (stockImport) => {
                const item =
                  stockImport.item;

                const warehouse =
                  stockImport.warehouse;

                return (
                  <tr
                    key={stockImport.id}
                    className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                  >
                    {/* Import code */}
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-800">
                        {stockImport.import_code}
                      </span>
                    </td>

                    {/* Item */}
                    <td className="px-4 py-4">
                      {item ? (
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Package
                              size={17}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {item.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {item.code} ·{" "}
                              {item.unit}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Không xác định
                        </span>
                      )}
                    </td>

                    {/* Warehouse */}
                    <td className="px-4 py-4">
                      {warehouse ? (
                        <div className="flex items-center gap-2">
                          <Warehouse
                            size={17}
                            className="shrink-0 text-slate-400"
                          />

                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {warehouse.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {warehouse.code}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Chưa chọn kho
                        </span>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="px-4 py-4 text-right">
                      <div>
                        <span className="text-sm font-semibold text-slate-900">
                          {formatQuantity(
                            stockImport.quantity,
                          )}
                        </span>

                        {item?.unit && (
                          <span className="ml-1 text-xs text-slate-500">
                            {item.unit}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Import price */}
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-medium text-slate-900">
                        {formatPrice(
                          stockImport.import_price,
                        )}{" "}
                        VNĐ
                      </span>
                    </td>

                    {/* Created at */}
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">
                        {formatDate(
                          stockImport.created_at,
                        )}
                      </span>
                    </td>

                    {/* View */}
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          onView(
                            stockImport,
                          )
                        }
                        className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        aria-label={`Xem ${stockImport.import_code}`}
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockImportTable;