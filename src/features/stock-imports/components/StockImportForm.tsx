import {
  ArrowDownToLine,
  Package,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import {
  getInventoryItemsForImport,
  getWarehousesForImport,
} from "../stock-imports.api";

import { validateStockImport } from "../stock-imports.validation";

import type {
  StockImportFormData,
  StockImportValidationErrors,
} from "../stock-imports.types";

interface StockImportFormProps {
  submitting: boolean;
  onSubmit: (
    data: StockImportFormData,
  ) => void;
  onCancel: () => void;
}

const DEFAULT_FORM: StockImportFormData = {
  item_id: "",
  warehouse_id: null,
  quantity: 1,
  import_price: 0,
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(value);
}

function StockImportForm({
  submitting,
  onSubmit,
  onCancel,
}: StockImportFormProps) {
  const [formData, setFormData] =
    useState<StockImportFormData>(
      DEFAULT_FORM,
    );

  const [errors, setErrors] =
    useState<StockImportValidationErrors>(
      {},
    );

  const [items, setItems] = useState<
    Awaited<
      ReturnType<
        typeof getInventoryItemsForImport
      >
    >
  >([]);

  const [warehouses, setWarehouses] =
    useState<
      Awaited<
        ReturnType<
          typeof getWarehousesForImport
        >
      >
    >([]);

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [optionsError, setOptionsError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadOptions() {
      try {
        setLoadingOptions(true);
        setOptionsError(null);

        const [
          inventoryItems,
          warehouseItems,
        ] = await Promise.all([
          getInventoryItemsForImport(),
          getWarehousesForImport(),
        ]);

        if (!mounted) {
          return;
        }

        setItems(inventoryItems);
        setWarehouses(warehouseItems);
      } catch {
        if (!mounted) {
          return;
        }

        setOptionsError(
          "Không thể tải danh sách mặt hàng hoặc kho.",
        );
      } finally {
        if (mounted) {
          setLoadingOptions(false);
        }
      }
    }

    void loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  function clearFieldError(
    field: keyof StockImportValidationErrors,
  ) {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next[field];

      return next;
    });
  }

  function handleChange(
    field: keyof StockImportFormData,
    value:
      | string
      | number
      | null,
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    clearFieldError(
      field as keyof StockImportValidationErrors,
    );
  }

  function handleItemChange(
    value: string,
  ) {
    setFormData((current) => ({
      ...current,
      item_id: value,
    }));

    clearFieldError("item_id");

    const selectedItem =
      items.find(
        (item) => item.id === value,
      );

    if (selectedItem) {
      setFormData((current) => ({
        ...current,
        item_id: value,
        import_price:
          current.import_price === 0
            ? selectedItem.sell_price
            : current.import_price,
      }));
    }
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const result =
      validateStockImport(formData);

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    onSubmit({
      item_id: formData.item_id.trim(),
      warehouse_id:
        formData.warehouse_id?.trim() || null,
      quantity: formData.quantity,
      import_price: formData.import_price,
    });
  }

  const selectedItem =
    items.find(
      (item) =>
        item.id === formData.item_id,
    ) ?? null;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-h-[90vh] flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ArrowDownToLine size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Nhập kho
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tạo phiếu nhập kho mới.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        {optionsError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {optionsError}
          </div>
        )}

        {/* Item */}
        <div>
          <label
            htmlFor="stock-import-item"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Mặt hàng
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <select
            id="stock-import-item"
            value={formData.item_id}
            onChange={(event) =>
              handleItemChange(
                event.target.value,
              )
            }
            disabled={
              submitting ||
              loadingOptions
            }
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition ${
              errors.item_id
                ? "border-red-400 focus:border-red-500"
                : "border-slate-300 focus:border-slate-900"
            } disabled:cursor-not-allowed disabled:bg-slate-100`}
          >
            <option value="">
              {loadingOptions
                ? "Đang tải mặt hàng..."
                : "Chọn mặt hàng"}
            </option>

            {items.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.code} - {item.name} (
                {item.unit})
              </option>
            ))}
          </select>

          {errors.item_id && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.item_id}
            </p>
          )}
        </div>

        {/* Warehouse */}
        <div>
          <label
            htmlFor="stock-import-warehouse"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Kho nhập
          </label>

          <select
            id="stock-import-warehouse"
            value={
              formData.warehouse_id ?? ""
            }
            onChange={(event) =>
              handleChange(
                "warehouse_id",
                event.target.value || null,
              )
            }
            disabled={
              submitting ||
              loadingOptions
            }
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition ${
              errors.warehouse_id
                ? "border-red-400 focus:border-red-500"
                : "border-slate-300 focus:border-slate-900"
            } disabled:cursor-not-allowed disabled:bg-slate-100`}
          >
            <option value="">
              Không chọn kho
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

          {errors.warehouse_id && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.warehouse_id}
            </p>
          )}

          <p className="mt-1.5 text-xs text-slate-500">
            Có thể để trống vì database cho
            phép kho nhập là NULL.
          </p>
        </div>

        {/* Quantity */}
        <div>
          <label
            htmlFor="stock-import-quantity"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Số lượng nhập
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <input
            id="stock-import-quantity"
            type="number"
            min="1"
            step="1"
            value={formData.quantity}
            onChange={(event) =>
              handleChange(
                "quantity",
                Number(event.target.value),
              )
            }
            disabled={submitting}
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition ${
              errors.quantity
                ? "border-red-400 focus:border-red-500"
                : "border-slate-300 focus:border-slate-900"
            } disabled:cursor-not-allowed disabled:bg-slate-100`}
          />

          {errors.quantity && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.quantity}
            </p>
          )}
        </div>

        {/* Import price */}
        <div>
          <label
            htmlFor="stock-import-price"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Giá nhập
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <div className="relative">
            <input
              id="stock-import-price"
              type="number"
              min="0"
              step="0.01"
              value={formData.import_price}
              onChange={(event) =>
                handleChange(
                  "import_price",
                  Number(event.target.value),
                )
              }
              disabled={submitting}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-16 text-sm text-slate-900 outline-none transition ${
                errors.import_price
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-300 focus:border-slate-900"
              } disabled:cursor-not-allowed disabled:bg-slate-100`}
            />

            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              VNĐ
            </span>
          </div>

          {errors.import_price && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.import_price}
            </p>
          )}

          {!errors.import_price &&
            formData.import_price >= 0 && (
              <p className="mt-1.5 text-xs text-slate-500">
                {formatPrice(
                  formData.import_price,
                )}{" "}
                VNĐ / đơn vị
              </p>
            )}
        </div>

        {/* Selected item information */}
        {selectedItem && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                <Package size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {selectedItem.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedItem.code} ·{" "}
                  Đơn vị:{" "}
                  {selectedItem.unit}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Tồn hiện tại:{" "}
                  <span className="font-medium text-slate-700">
                    {selectedItem.stock_quantity.toLocaleString(
                      "vi-VN",
                    )}{" "}
                    {selectedItem.unit}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={
            submitting ||
            loadingOptions
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowDownToLine size={17} />

          {submitting
            ? "Đang lưu..."
            : "Tạo phiếu nhập"}
        </button>
      </div>
    </form>
  );
}

export default StockImportForm;