import {
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

import type {
  Customer,
  CustomerFormData,
} from "../customers.types";
import { validateCustomer } from "../customers.validation";

interface CustomerFormProps {
  customer: Customer | null;
  submitting: boolean;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
}

const EMPTY_FORM: CustomerFormData = {
  name: "",
  phone: "",
  address: "",
};

function CustomerForm({
  customer,
  submitting,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const [form, setForm] =
    useState<CustomerFormData>(EMPTY_FORM);

  const [errors, setErrors] = useState<
    ReturnType<typeof validateCustomer>["errors"]
  >({});

  useEffect(() => {
    if (!customer) {
      setForm(EMPTY_FORM);
      setErrors({});
      return;
    }

    setForm({
      name: customer.name,
      phone: customer.phone,
      address: customer.address ?? "",
    });

    setErrors({});
  }, [customer]);

  function updateField(
    field: keyof CustomerFormData,
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

    const validation = validateCustomer(form);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-h-[90vh] flex-col"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <UserRound className="size-5" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {customer
                  ? "Chỉnh sửa khách hàng"
                  : "Thêm khách hàng"}
              </h2>

              <p className="text-xs text-slate-500">
                Thông tin được lưu trực tiếp vào bảng customers.
              </p>
            </div>
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
            htmlFor="customer-name"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Tên khách hàng
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            id="customer-name"
            type="text"
            value={form.name}
            onChange={(event) =>
              updateField("name", event.target.value)
            }
            disabled={submitting}
            autoComplete="name"
            placeholder="Ví dụ: Nguyễn Văn An"
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
              errors.name
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-red-500 focus:ring-red-100"
            } disabled:cursor-not-allowed disabled:bg-slate-100`}
          />

          {errors.name && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="customer-phone"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Số điện thoại
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            id="customer-phone"
            type="tel"
            value={form.phone}
            onChange={(event) =>
              updateField("phone", event.target.value)
            }
            disabled={submitting}
            autoComplete="tel"
            placeholder="Ví dụ: 0987654321"
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
              errors.phone
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-red-500 focus:ring-red-100"
            } disabled:cursor-not-allowed disabled:bg-slate-100`}
          />

          {errors.phone && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="customer-address"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Địa chỉ
          </label>

          <textarea
            id="customer-address"
            value={form.address}
            onChange={(event) =>
              updateField("address", event.target.value)
            }
            disabled={submitting}
            rows={4}
            placeholder="Nhập địa chỉ khách hàng..."
            className={`w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
              errors.address
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-red-500 focus:ring-red-100"
            } disabled:cursor-not-allowed disabled:bg-slate-100`}
          />

          {errors.address && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.address}
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
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          {customer ? "Lưu thay đổi" : "Thêm khách hàng"}
        </button>
      </div>
    </form>
  );
}

export default CustomerForm;