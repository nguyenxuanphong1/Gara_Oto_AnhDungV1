import {
  Loader2,
  Save,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import type {
  InventoryItem,
  InventoryItemFormData,
  InventoryItemType,
  InventoryItemValidationErrors,
} from "../inventory-items.types";
import { validateInventoryItem } from "../inventory-items.validation";

interface InventoryItemFormProps {
  item: InventoryItem | null;
  submitting: boolean;
  onSubmit: (data: InventoryItemFormData) => void;
  onCancel: () => void;
}

const EMPTY_FORM: InventoryItemFormData = {
  name: "",
  item_type: "PART",
  unit: "Cái",
  sell_price: 0,
};

function InventoryItemForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: InventoryItemFormProps) {
  const [form, setForm] =
    useState<InventoryItemFormData>(EMPTY_FORM);

  const [errors, setErrors] =
    useState<InventoryItemValidationErrors>({});

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        item_type: item.item_type,
        unit: item.unit,
        sell_price: item.sell_price,
      });
    } else {
      setForm(EMPTY_FORM);
    }

    setErrors({});
  }, [item]);

function clearFieldError(
  field: keyof InventoryItemValidationErrors,
) {
  setErrors((current) => {
    if (!current[field]) {
      return current;
    }

    const next = { ...current };
    delete next[field];

    return next;
  });
}

  function updateName(
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      name: value,
    }));

    clearFieldError("name");
  }

  function updateItemType(
    value: InventoryItemType,
  ) {
    setForm((current) => ({
      ...current,
      item_type: value,
    }));

    clearFieldError("item_type");
  }

  function updateUnit(
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      unit: value,
    }));

    clearFieldError("unit");
  }

  function updateSellPrice(
    value: string,
  ) {
    if (value === "") {
      setForm((current) => ({
        ...current,
        sell_price: 0,
      }));

      clearFieldError("sell_price");
      return;
    }

    const numericValue = Number(value);

    setForm((current) => ({
      ...current,
      sell_price: Number.isFinite(numericValue)
        ? numericValue
        : 0,
    }));

    clearFieldError("sell_price");
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const result =
      validateInventoryItem(form);

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    onSubmit({
      name: form.name.trim(),
      item_type: form.item_type,
      unit: form.unit.trim(),
      sell_price: form.sell_price,
    });
  }

  const isEditing = Boolean(item);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col"
    >
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing
                ? "Chỉnh sửa mặt hàng"
                : "Thêm mặt hàng"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Cập nhật thông tin mặt hàng."
                : "Nhập thông tin mặt hàng mới."}
            </p>
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
      </div>

      {/* Form fields */}
      <div className="space-y-5 px-6 py-6">
        {/* Code */}
        {isEditing && item && (
          <div>
            <label
              htmlFor="inventory-item-code"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Mã mặt hàng
            </label>

            <input
              id="inventory-item-code"
              type="text"
              value={item.code}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500 outline-none"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Mã mặt hàng được hệ thống tự động tạo.
            </p>
          </div>
        )}

        {/* Name */}
        <div>
          <label
            htmlFor="inventory-item-name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Tên mặt hàng{" "}
            <span className="text-red-500">*</span>
          </label>

          <input
            id="inventory-item-name"
            type="text"
            value={form.name}
            onChange={(event) =>
              updateName(event.target.value)
            }
            placeholder="Ví dụ: Dầu động cơ 5W-30"
            disabled={submitting}
            autoFocus={!isEditing}
            className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
              errors.name
                ? "border-red-400 bg-red-50/30 focus:border-red-500"
                : "border-slate-300 bg-white focus:border-slate-900"
            } disabled:cursor-not-allowed disabled:bg-slate-100`}
          />

          {errors.name && (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        {/* Item type */}
        <div>
          <label
            htmlFor="inventory-item-type"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Loại mặt hàng{" "}
            <span className="text-red-500">*</span>
          </label>

          <select
            id="inventory-item-type"
            value={form.item_type}
            onChange={(event) =>
              updateItemType(
                event.target.value as InventoryItemType,
              )
            }
            disabled={submitting}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${
              errors.item_type
                ? "border-red-400 focus:border-red-500"
                : "border-slate-300 focus:border-slate-900"
            } disabled:cursor-not-allowed disabled:bg-slate-100`}
          >
            <option value="PART">
              Phụ tùng
            </option>

            <option value="SERVICE">
              Dịch vụ
            </option>
          </select>

          {errors.item_type && (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.item_type}
            </p>
          )}
        </div>

        {/* Unit */}
        <div>
          <label
            htmlFor="inventory-item-unit"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Đơn vị tính{" "}
            <span className="text-red-500">*</span>
          </label>

          <input
            id="inventory-item-unit"
            type="text"
            value={form.unit}
            onChange={(event) =>
              updateUnit(event.target.value)
            }
            placeholder="Ví dụ: Cái, Bộ, Lít"
            disabled={submitting}
            className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
              errors.unit
                ? "border-red-400 bg-red-50/30 focus:border-red-500"
                : "border-slate-300 bg-white focus:border-slate-900"
            } disabled:cursor-not-allowed disabled:bg-slate-100`}
          />

          {errors.unit && (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.unit}
            </p>
          )}
        </div>

        {/* Sell price */}
        <div>
          <label
            htmlFor="inventory-item-sell-price"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Giá bán{" "}
            <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <input
              id="inventory-item-sell-price"
              type="number"
              min="0"
              step="1"
              value={form.sell_price}
              onChange={(event) =>
                updateSellPrice(
                  event.target.value,
                )
              }
              disabled={submitting}
              className={`w-full rounded-xl border px-4 py-3 pr-16 text-sm text-slate-900 outline-none transition ${
                errors.sell_price
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-slate-300 bg-white focus:border-slate-900"
              } disabled:cursor-not-allowed disabled:bg-slate-100`}
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              VNĐ
            </span>
          </div>

          {errors.sell_price && (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.sell_price}
            </p>
          )}
        </div>

        {/* Stock information */}
        {isEditing && item && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Tồn kho hiện tại
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {item.stock_quantity.toLocaleString(
                "vi-VN",
              )}{" "}
              {item.unit}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Tồn kho được quản lý qua nghiệp vụ kho,
              không chỉnh trực tiếp tại đây.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
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
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Save size={17} />
          )}

          {submitting
            ? "Đang lưu..."
            : isEditing
              ? "Lưu thay đổi"
              : "Thêm mặt hàng"}
        </button>
      </div>
    </form>
  );
}

export default InventoryItemForm;