import {
  CarFront,
  LoaderCircle,
  Save,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type { Customer } from "../../customers/customers.types";
import type {
  Vehicle,
  VehicleFormData,
} from "../vehicles.types";
import { validateVehicle } from "../vehicles.validation";

interface VehicleFormProps {
  vehicle: Vehicle | null;
  customers: Customer[];
  submitting: boolean;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  onCancel: () => void;
}

const EMPTY_FORM: VehicleFormData = {
  license_plate: "",
  car_model: "",
  customer_id: "",
};

function VehicleForm({
  vehicle,
  customers,
  submitting,
  onSubmit,
  onCancel,
}: VehicleFormProps) {
  const [form, setForm] =
    useState<VehicleFormData>(EMPTY_FORM);

  const [errors, setErrors] = useState<
    ReturnType<typeof validateVehicle>["errors"]
  >({});

  useEffect(() => {
    if (!vehicle) {
      setForm(EMPTY_FORM);
      setErrors({});
      return;
    }

    setForm({
      license_plate: vehicle.license_plate,
      car_model: vehicle.car_model,
      customer_id: vehicle.customer_id,
    });

    setErrors({});
  }, [vehicle]);

  function updateField(
    field: keyof VehicleFormData,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const validation = validateVehicle(form);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    await onSubmit({
      license_plate:
        form.license_plate.trim().toUpperCase(),
      car_model: form.car_model.trim(),
      customer_id: form.customer_id,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-h-[90vh] flex-col"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <CarFront className="size-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {vehicle
                ? "Chỉnh sửa xe"
                : "Thêm xe"}
            </h2>

            <p className="text-xs text-slate-500">
              Xe thuộc một khách hàng trong bảng
              customers.
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
          <X className="size-5" />
        </button>
      </div>

      <div className="space-y-5 overflow-y-auto px-5 py-5">
        <div>
          <label
            htmlFor="vehicle-license-plate"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Biển số xe
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            id="vehicle-license-plate"
            type="text"
            value={form.license_plate}
            onChange={(event) =>
              updateField(
                "license_plate",
                event.target.value.toUpperCase(),
              )
            }
            disabled={submitting}
            placeholder="Ví dụ: 30A-123.45"
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm font-medium uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:ring-2 ${
              errors.license_plate
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-red-500 focus:ring-red-100"
            } disabled:cursor-not-allowed disabled:bg-slate-100`}
          />

          {errors.license_plate && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.license_plate}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="vehicle-car-model"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Dòng xe
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            id="vehicle-car-model"
            type="text"
            value={form.car_model}
            onChange={(event) =>
              updateField(
                "car_model",
                event.target.value,
              )
            }
            disabled={submitting}
            placeholder="Ví dụ: Toyota Camry 2.5Q"
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
              errors.car_model
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-red-500 focus:ring-red-100"
            } disabled:cursor-not-allowed disabled:bg-slate-100`}
          />

          {errors.car_model && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.car_model}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="vehicle-customer"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Khách hàng
            <span className="ml-1 text-red-500">*</span>
          </label>

          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

            <select
              id="vehicle-customer"
              value={form.customer_id}
              onChange={(event) =>
                updateField(
                  "customer_id",
                  event.target.value,
                )
              }
              disabled={submitting}
              className={`w-full appearance-none rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                errors.customer_id
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-red-500 focus:ring-red-100"
              } disabled:cursor-not-allowed disabled:bg-slate-100`}
            >
              <option value="">
                -- Chọn khách hàng --
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name} — {customer.phone}
                </option>
              ))}
            </select>
          </div>

          {errors.customer_id && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.customer_id}
            </p>
          )}

          {customers.length === 0 && (
            <p className="mt-2 text-xs text-amber-600">
              Chưa có khách hàng. Hãy tạo khách hàng
              trước khi thêm xe.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          {vehicle ? "Lưu thay đổi" : "Thêm xe"}
        </button>
      </div>
    </form>
  );
}

export default VehicleForm;