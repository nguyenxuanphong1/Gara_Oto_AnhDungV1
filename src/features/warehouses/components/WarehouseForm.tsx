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
  Warehouse,
  WarehouseFormData,
  WarehouseValidationErrors,
} from "../warehouses.types";
import { validateWarehouse } from "../warehouses.validation";

interface WarehouseFormProps {
  warehouse: Warehouse | null;
  submitting: boolean;
  onSubmit: (data: WarehouseFormData) => void;
  onCancel: () => void;
}

const EMPTY_FORM: WarehouseFormData = {
  name: "",
};

function WarehouseForm({
  warehouse,
  submitting,
  onSubmit,
  onCancel,
}: WarehouseFormProps) {
  const [form, setForm] =
    useState<WarehouseFormData>(EMPTY_FORM);

  const [errors, setErrors] = useState<WarehouseValidationErrors>(
    {},
  );

  useEffect(() => {
    if (warehouse) {
      setForm({
        name: warehouse.name,
      });
    } else {
      setForm(EMPTY_FORM);
    }

    setErrors({});
  }, [warehouse]);

  function updateField(
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      name: value,
    }));

    setErrors((current) => {
      if (!current.name) {
        return current;
      }

      const next = { ...current };
      delete next.name;

      return next;
    });
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const result = validateWarehouse(form);

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    onSubmit({
      name: form.name.trim(),
    });
  }

  const isEditing = Boolean(warehouse);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col"
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing
                ? "Chỉnh sửa kho hàng"
                : "Thêm kho hàng"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Cập nhật thông tin kho hàng."
                : "Nhập tên kho hàng mới."}
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

      <div className="space-y-5 px-6 py-6">
        {isEditing && warehouse && (
          <div>
            <label
              htmlFor="warehouse-code"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Mã kho
            </label>

            <input
              id="warehouse-code"
              type="text"
              value={warehouse.code}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500 outline-none"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Mã kho được hệ thống tự động tạo.
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="warehouse-name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Tên kho <span className="text-red-500">*</span>
          </label>

          <input
            id="warehouse-name"
            type="text"
            value={form.name}
            onChange={(event) =>
              updateField(event.target.value)
            }
            placeholder="Ví dụ: Kho phụ tùng chính"
            disabled={submitting}
            autoFocus
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
      </div>

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
              : "Thêm kho"}
        </button>
      </div>
    </form>
  );
}

export default WarehouseForm;