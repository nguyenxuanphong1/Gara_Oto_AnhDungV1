import {
  Car,
  ChevronDown,
  Loader2,
  Package,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { supabase } from "../../../lib/supabase";

import type {
  RepairOrderDetailFormData,
  RepairOrderDetailValidationErrors,
  RepairOrderFormData,
  RepairOrderStatus,
  RepairOrderValidationErrors,
} from "../repair-orders.types";
import {
  validateRepairOrder,
  validateRepairOrderDetail,
} from "../repair-orders.validation";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Vehicle {
  id: string;
  license_plate: string;
  car_model: string;
  customer_id: string;
  customer: Customer | null;
}

interface Warehouse {
  id: string;
  code: string;
  name: string;
}

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  item_type: "PART" | "SERVICE";
  unit: string;
  sell_price: number;
  readonly stock_quantity: number;
}

interface RepairOrderFormProps {
  initialData?: {
    vehicle_id: string;
    warehouse_id: string | null;
    odometer_km: number;
    labor_cost: number;
    discount: number;
    status: RepairOrderStatus;
    details: RepairOrderDetailFormData[];
  };
  loading?: boolean;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (
    data: RepairOrderFormData,
    details: RepairOrderDetailFormData[],
  ) => Promise<void> | void;
  onCancel?: () => void;
}

function normalizeRelation<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(
    Math.round(value),
  );
}

function parseNumber(value: string): number {
  if (value.trim() === "") {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function RepairOrderForm({
  initialData,
  loading = false,
  submitting = false,
  submitLabel = "Lưu phiếu sửa chữa",
  onSubmit,
  onCancel,
}: RepairOrderFormProps) {
  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);

  const [warehouses, setWarehouses] =
    useState<Warehouse[]>([]);

  const [inventoryItems, setInventoryItems] =
    useState<InventoryItem[]>([]);

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [vehicleId, setVehicleId] =
    useState(
      initialData?.vehicle_id ?? "",
    );

  const [warehouseId, setWarehouseId] =
    useState<string | null>(
      initialData?.warehouse_id ?? null,
    );

  const [odometerKm, setOdometerKm] =
    useState(
      String(
        initialData?.odometer_km ?? 0,
      ),
    );

  const [laborCost, setLaborCost] =
    useState(
      String(
        initialData?.labor_cost ?? 0,
      ),
    );

  const [discount, setDiscount] =
    useState(
      String(
        initialData?.discount ?? 0,
      ),
    );

  const [status, setStatus] =
    useState<RepairOrderStatus>(
      initialData?.status ?? "DRAFT",
    );

  const [details, setDetails] =
    useState<RepairOrderDetailFormData[]>(
      initialData?.details ?? [],
    );

  const [errors, setErrors] =
    useState<RepairOrderValidationErrors>({});

  const [detailErrors, setDetailErrors] =
    useState<Record<number, RepairOrderDetailValidationErrors>>({});

  const [submitError, setSubmitError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOptions() {
      setLoadingOptions(true);

      const [
        vehiclesResult,
        warehousesResult,
        inventoryResult,
      ] = await Promise.all([
        supabase
          .from("vehicles")
          .select(
            `
              id,
              license_plate,
              car_model,
              customer_id,
              customer:customers (
                id,
                name,
                phone
              )
            `,
          )
          .order("license_plate", {
            ascending: true,
          }),

        supabase
          .from("warehouses")
          .select(
            `
              id,
              code,
              name
            `,
          )
          .order("name", {
            ascending: true,
          }),

        supabase
          .from("inventory_items")
          .select(
            `
              id,
              code,
              name,
              item_type,
              unit,
              sell_price,
              stock_quantity
            `,
          )
          .order("name", {
            ascending: true,
          }),
      ]);

      if (!mounted) {
        return;
      }

      if (vehiclesResult.error) {
        setSubmitError(
          `Không thể tải danh sách xe: ${vehiclesResult.error.message}`,
        );
      } else {
        setVehicles(
          (vehiclesResult.data ?? []).map(
            (vehicle) => {
              const customer =
                normalizeRelation(
                  vehicle.customer,
                );

              return {
                id: vehicle.id,
                license_plate:
                  vehicle.license_plate,
                car_model: vehicle.car_model,
                customer_id:
                  vehicle.customer_id,
                customer: customer
                  ? {
                      id: customer.id,
                      name: customer.name,
                      phone: customer.phone,
                    }
                  : null,
              };
            },
          ),
        );
      }

      if (warehousesResult.error) {
        setSubmitError(
          `Không thể tải danh sách kho: ${warehousesResult.error.message}`,
        );
      } else {
        setWarehouses(
          (warehousesResult.data ?? []).map(
            (warehouse) => ({
              id: warehouse.id,
              code: warehouse.code,
              name: warehouse.name,
            }),
          ),
        );
      }

      if (inventoryResult.error) {
        setSubmitError(
          `Không thể tải danh sách vật tư: ${inventoryResult.error.message}`,
        );
      } else {
        setInventoryItems(
          (inventoryResult.data ?? []).map(
            (item) => ({
              id: item.id,
              code: item.code,
              name: item.name,
              item_type: item.item_type,
              unit: item.unit,
              sell_price: Number(
                item.sell_price,
              ),
              stock_quantity: Number(
                item.stock_quantity,
              ),
            }),
          ),
        );
      }

      setLoadingOptions(false);
    }

    void loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedVehicle = useMemo(
    () =>
      vehicles.find(
        (vehicle) =>
          vehicle.id === vehicleId,
      ) ?? null,
    [vehicles, vehicleId],
  );

  const detailTotal = useMemo(
    () =>
      details.reduce(
        (total, detail) =>
          total +
          detail.quantity *
            detail.price,
        0,
      ),
    [details],
  );

  const estimatedTotal = Math.max(
    0,
    detailTotal +
      parseNumber(laborCost) -
      parseNumber(discount),
  );

  function addDetail() {
    setDetails((current) => [
      ...current,
      {
        item_id: "",
        quantity: 1,
        price: 0,
      },
    ]);

    setErrors((current) => ({
      ...current,
      details: undefined,
    }));
  }

  function removeDetail(index: number) {
    setDetails((current) =>
      current.filter(
        (_, detailIndex) =>
          detailIndex !== index,
      ),
    );

    setErrors((current) => ({
      ...current,
      details: undefined,
    }));
  }

  function updateDetail(
    index: number,
    patch: Partial<RepairOrderDetailFormData>,
  ) {
    setDetails((current) =>
      current.map(
        (detail, detailIndex) =>
          detailIndex === index
            ? {
                ...detail,
                ...patch,
              }
            : detail,
      ),
    );
  }

  function clearDetailError(
    index: number,
    field: keyof RepairOrderDetailValidationErrors,
  ) {
    setDetailErrors((current) => {
      const currentRow = current[index];

      if (!currentRow?.[field]) {
        return current;
      }

      const nextRow = {
        ...currentRow,
      };
      delete nextRow[field];

      if (Object.keys(nextRow).length === 0) {
        const next = { ...current };
        delete next[index];
        return next;
      }

      return {
        ...current,
        [index]: nextRow,
      };
    });
  }

  function handleItemChange(
    index: number,
    itemId: string,
  ) {
    const item = inventoryItems.find(
      (inventoryItem) =>
        inventoryItem.id === itemId,
    );

    updateDetail(index, {
      item_id: itemId,
      price:
        item?.sell_price ?? 0,
    });

    clearDetailError(
      index,
      "item_id",
    );
    clearDetailError(
      index,
      "price",
    );
  }

  function getItemStock(
    itemId: string,
  ): number {
    const item = inventoryItems.find(
      (inventoryItem) =>
        inventoryItem.id === itemId,
    );

    return item?.stock_quantity ?? 0;
  }

  function getItemType(
    itemId: string,
  ): "PART" | "SERVICE" | null {
    const item = inventoryItems.find(
      (inventoryItem) =>
        inventoryItem.id === itemId,
    );

    return item?.item_type ?? null;
  }

  function getDetailAmount(
    detail: RepairOrderDetailFormData,
  ): number {
    return (
      detail.quantity *
      detail.price
    );
  }

  function validateForm(): boolean {
    const result =
      validateRepairOrder(
        {
          vehicle_id: vehicleId,
          warehouse_id: warehouseId,
          odometer_km:
            parseNumber(odometerKm),
          labor_cost:
            parseNumber(laborCost),
          discount:
            parseNumber(discount),
          status,
        },
        details,
      );

    const nextDetailErrors: Record<
      number,
      RepairOrderDetailValidationErrors
    > = {};

    details.forEach(
      (detail, index) => {
        const detailResult =
          validateRepairOrderDetail(
            detail,
          );

        if (!detailResult.valid) {
          nextDetailErrors[index] =
            detailResult.errors;
        }
      },
    );

    setErrors(result.errors);
    setDetailErrors(nextDetailErrors);

    return (
      result.valid &&
      Object.keys(nextDetailErrors)
        .length === 0
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(
        {
          vehicle_id: vehicleId,
          warehouse_id: warehouseId,
          odometer_km:
            parseNumber(odometerKm),
          labor_cost:
            parseNumber(laborCost),
          discount:
            parseNumber(discount),
          status,
        },
        details,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể lưu phiếu sửa chữa.",
      );
    }
  }

  if (loading || loadingOptions) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* =====================================================
          THÔNG TIN PHIẾU
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Wrench className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Thông tin phiếu sửa chữa
              </h2>

              <p className="text-sm text-slate-500">
                Chọn xe, kho và thông tin sửa chữa
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          {/* XE */}
          <div className="md:col-span-2">
            <label
              htmlFor="repair-order-vehicle"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Xe <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Car className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <select
                id="repair-order-vehicle"
                value={vehicleId}
                onChange={(event) =>
                  setVehicleId(
                    event.target.value,
                  )
                }
                disabled={submitting}
                className={`w-full appearance-none rounded-xl border bg-white py-3 pl-11 pr-10 text-sm outline-none transition focus:ring-2 ${
                  errors.vehicle_id
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-red-500 focus:ring-red-100"
                }`}
              >
                <option value="">
                  -- Chọn xe --
                </option>

                {vehicles.map(
                  (vehicle) => {
                    const customer =
                      normalizeRelation(
                        vehicle.customer,
                      );

                    return (
                      <option
                        key={vehicle.id}
                        value={vehicle.id}
                      >
                        {vehicle.license_plate}{" "}
                        -{" "}
                        {vehicle.car_model}
                        {customer
                          ? ` - ${customer.name}`
                          : ""}
                      </option>
                    );
                  },
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>

            {errors.vehicle_id && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.vehicle_id}
              </p>
            )}

            {selectedVehicle && (
              <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <span className="text-slate-500">
                    Biển số:
                    <strong className="ml-1 text-slate-800">
                      {
                        selectedVehicle.license_plate
                      }
                    </strong>
                  </span>

                  <span className="text-slate-500">
                    Xe:
                    <strong className="ml-1 text-slate-800">
                      {
                        selectedVehicle.car_model
                      }
                    </strong>
                  </span>

                  {normalizeRelation(
                    selectedVehicle.customer,
                  ) && (
                    <span className="text-slate-500">
                      Khách hàng:
                      <strong className="ml-1 text-slate-800">
                        {
                          normalizeRelation(
                            selectedVehicle.customer,
                          )?.name
                        }
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* KHO */}
          <div>
            <label
              htmlFor="repair-order-warehouse"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Kho xuất phụ tùng
            </label>

            <div className="relative">
              <select
                id="repair-order-warehouse"
                value={
                  warehouseId ?? ""
                }
                onChange={(event) =>
                  setWarehouseId(
                    event.target.value ||
                      null,
                  )
                }
                disabled={submitting}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                <option value="">
                  -- Không chọn kho --
                </option>

                {warehouses.map(
                  (warehouse) => (
                    <option
                      key={warehouse.id}
                      value={warehouse.id}
                    >
                      {warehouse.code} -{" "}
                      {warehouse.name}
                    </option>
                  ),
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* ODO */}
          <div>
            <label
              htmlFor="repair-order-odometer"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Số km
            </label>

            <input
              id="repair-order-odometer"
              type="number"
              min="0"
              step="1"
              value={odometerKm}
              onChange={(event) =>
                setOdometerKm(
                  event.target.value,
                )
              }
              disabled={submitting}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                errors.odometer_km
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-red-500 focus:ring-red-100"
              }`}
              placeholder="Ví dụ: 45000"
            />

            {errors.odometer_km && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.odometer_km}
              </p>
            )}
          </div>

          {/* CÔNG */}
          <div>
            <label
              htmlFor="repair-order-labor"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Tiền công
            </label>

            <input
              id="repair-order-labor"
              type="number"
              min="0"
              step="1000"
              value={laborCost}
              onChange={(event) =>
                setLaborCost(
                  event.target.value,
                )
              }
              disabled={submitting}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                errors.labor_cost
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-red-500 focus:ring-red-100"
              }`}
              placeholder="0"
            />

            {errors.labor_cost && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.labor_cost}
              </p>
            )}
          </div>

          {/* GIẢM GIÁ */}
          <div>
            <label
              htmlFor="repair-order-discount"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Giảm giá
            </label>

            <input
              id="repair-order-discount"
              type="number"
              min="0"
              step="1000"
              value={discount}
              onChange={(event) =>
                setDiscount(
                  event.target.value,
                )
              }
              disabled={submitting}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                errors.discount
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-red-500 focus:ring-red-100"
              }`}
              placeholder="0"
            />

            {errors.discount && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.discount}
              </p>
            )}
          </div>

          {/* TRẠNG THÁI */}
          <div>
            <label
              htmlFor="repair-order-status"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Trạng thái
            </label>

            <div className="relative">
              <select
                id="repair-order-status"
                value={status}
                onChange={(event) => {
                  const value = event.target.value;

                  if (
                    value === "DRAFT" ||
                    value === "COMPLETED" ||
                    value === "CANCELLED"
                  ) {
                    setStatus(value);
                    setErrors((current) => ({
                      ...current,
                      status: undefined,
                    }));
                  }
                }}
                disabled={submitting}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                <option value="DRAFT">
                  Nháp
                </option>

                <option value="COMPLETED">
                  Hoàn thành
                </option>

                <option value="CANCELLED">
                  Đã hủy
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>

            {errors.status && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.status}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CHI TIẾT PHIẾU
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Vật tư & dịch vụ
              </h2>

              <p className="text-sm text-slate-500">
                Thêm phụ tùng hoặc dịch vụ vào phiếu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addDetail}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Thêm dòng
          </button>
        </div>

        {errors.details && (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
            {errors.details}
          </div>
        )}

        {details.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Package className="h-6 w-6 text-slate-400" />
            </div>

            <p className="font-medium text-slate-700">
              Chưa có vật tư hoặc dịch vụ
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Bấm "Thêm dòng" để thêm chi tiết phiếu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">
                    Vật tư / dịch vụ
                  </th>

                  <th className="w-32 px-4 py-3">
                    ĐVT
                  </th>

                  <th className="w-32 px-4 py-3 text-right">
                    Số lượng
                  </th>

                  <th className="w-40 px-4 py-3 text-right">
                    Đơn giá
                  </th>

                  <th className="w-40 px-4 py-3 text-right">
                    Thành tiền
                  </th>

                  <th className="w-14 px-3 py-3" />
                </tr>
              </thead>

              <tbody>
                {details.map(
                  (
                    detail,
                    index,
                  ) => {
                    const item =
                      inventoryItems.find(
                        (
                          inventoryItem,
                        ) =>
                          inventoryItem.id ===
                          detail.item_id,
                      );

                    const amount =
                      getDetailAmount(
                        detail,
                      );

                    const rowErrors =
                      detailErrors[index] ?? {};

                    const detailItemError =
                      rowErrors.item_id;

                    const detailQuantityError =
                      rowErrors.quantity;

                    const detailPriceError =
                      rowErrors.price;

                    const itemType =
                      getItemType(
                        detail.item_id,
                      );

                    return (
                      <tr
                        key={`${index}-${detail.item_id}`}
                        className="border-b border-slate-100 last:border-0"
                      >
                        {/* ITEM */}
                        <td className="px-5 py-4 align-top">
                          <select
                            value={
                              detail.item_id
                            }
                            onChange={(
                              event,
                            ) =>
                              handleItemChange(
                                index,
                                event.target
                                  .value,
                              )
                            }
                            disabled={
                              submitting
                            }
                            className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                              detailItemError
                                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                : "border-slate-200 focus:border-red-500 focus:ring-red-100"
                            }`}
                          >
                            <option value="">
                              -- Chọn vật tư / dịch vụ --
                            </option>

                            {inventoryItems.map(
                              (
                                inventoryItem,
                              ) => (
                                <option
                                  key={
                                    inventoryItem.id
                                  }
                                  value={
                                    inventoryItem.id
                                  }
                                >
                                  {
                                    inventoryItem.code
                                  }{" "}
                                  -{" "}
                                  {
                                    inventoryItem.name
                                  }
                                  {" "}
                                  (
                                  {
                                    inventoryItem.item_type ===
                                    "PART"
                                      ? "Phụ tùng"
                                      : "Dịch vụ"}
                                  )
                                </option>
                              ),
                            )}
                          </select>

                          {item && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              <span
                                className={`rounded-full px-2 py-1 font-medium ${
                                  itemType ===
                                  "PART"
                                    ? "bg-orange-50 text-orange-700"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {itemType ===
                                "PART"
                                  ? "Phụ tùng"
                                  : "Dịch vụ"}
                              </span>

                              {itemType ===
                                "PART" && (
                                <span className="text-slate-500">
                                  Tồn kho:{" "}
                                  <strong className="text-slate-700">
                                    {formatCurrency(
                                      getItemStock(
                                        item.id,
                                      ),
                                    )}
                                  </strong>
                                  {" "}
                                  {item.unit}
                                </span>
                              )}
                            </div>
                          )}

                          {detailItemError && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {
                                detailItemError
                              }
                            </p>
                          )}
                        </td>

                        {/* UNIT */}
                        <td className="px-4 py-4 align-top">
                          <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                            {item?.unit ??
                              "-"}
                          </div>
                        </td>

                        {/* QUANTITY */}
                        <td className="px-4 py-4 align-top">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={
                              detail.quantity
                            }
                            onChange={(
                              event,
                            ) =>
                              updateDetail(
                                index,
                                {
                                  quantity:
                                    Math.max(
                                      1,
                                      Math.floor(
                                        parseNumber(
                                          event
                                            .target
                                            .value,
                                        ),
                                      ),
                                    ),
                                },
                              )
                            }
                            disabled={
                              submitting
                            }
                            className={`w-full rounded-xl border px-3 py-2.5 text-right text-sm outline-none focus:ring-2 ${
                              detailQuantityError
                                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                : "border-slate-200 focus:border-red-500 focus:ring-red-100"
                            }`}
                          />

                          {detailQuantityError && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {
                                detailQuantityError
                              }
                            </p>
                          )}
                        </td>

                        {/* PRICE */}
                        <td className="px-4 py-4 align-top">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={
                              detail.price
                            }
                            onChange={(
                              event,
                            ) =>
                              updateDetail(
                                index,
                                {
                                  price: Math.max(
                                    0,
                                    parseNumber(
                                      event
                                        .target
                                        .value,
                                    ),
                                  ),
                                },
                              )
                            }
                            disabled={
                              submitting
                            }
                            className={`w-full rounded-xl border px-3 py-2.5 text-right text-sm outline-none focus:ring-2 ${
                              detailPriceError
                                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                : "border-slate-200 focus:border-red-500 focus:ring-red-100"
                            }`}
                          />

                          {detailPriceError && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {
                                detailPriceError
                              }
                            </p>
                          )}
                        </td>

                        {/* AMOUNT */}
                        <td className="px-4 py-4 text-right align-top">
                          <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800">
                            {formatCurrency(
                              amount,
                            )}
                          </div>
                        </td>

                        {/* DELETE */}
                        <td className="px-3 py-4 text-center align-top">
                          <button
                            type="button"
                            onClick={() =>
                              removeDetail(
                                index,
                              )
                            }
                            disabled={
                              submitting
                            }
                            title="Xóa dòng"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TOTAL */}
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-5">
          <div className="ml-auto w-full max-w-md space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                Tiền vật tư / dịch vụ
              </span>

              <span className="font-medium text-slate-800">
                {formatCurrency(
                  detailTotal,
                )}{" "}
                đ
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                Tiền công
              </span>

              <span className="font-medium text-slate-800">
                {formatCurrency(
                  parseNumber(
                    laborCost,
                  ),
                )}{" "}
                đ
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                Giảm giá
              </span>

              <span className="font-medium text-red-600">
                -{" "}
                {formatCurrency(
                  parseNumber(
                    discount,
                  ),
                )}{" "}
                đ
              </span>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900">
                  Tổng cộng
                </span>

                <span className="text-xl font-bold text-red-600">
                  {formatCurrency(
                    estimatedTotal,
                  )}{" "}
                  đ
                </span>
              </div>

              <p className="mt-1 text-right text-xs text-slate-400">
                Tổng tiền chính thức sẽ do Database tính toán.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ACTIONS
      ====================================================== */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy
          </button>
        )}

        <button
          type="submit"
          disabled={
            submitting ||
            loadingOptions
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {submitting
            ? "Đang lưu..."
            : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default RepairOrderForm;