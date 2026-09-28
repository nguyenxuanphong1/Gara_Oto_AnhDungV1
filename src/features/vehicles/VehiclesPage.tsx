import {
  AlertCircle,
  CarFront,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import LoadingScreen from "../../components/common/LoadingScreen";

import type { Customer } from "../customers/customers.types";
import { getCustomers } from "../customers/customers.api";

import VehicleDetail from "./components/VehicleDetail";
import VehicleForm from "./components/VehicleForm";
import VehicleTable from "./components/VehicleTable";

import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
} from "./vehicles.api";

import type {
  VehicleFormData,
  VehicleWithCustomer,
} from "./vehicles.types";

interface ModalState {
  type:
    | "create"
    | "edit"
    | "detail"
    | null;
  vehicle: VehicleWithCustomer | null;
}

function normalizeVietnamese(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function getSupabaseErrorMessage(
  error: unknown,
): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error
  ) {
    const code = String(
      (error as { code?: unknown }).code ?? "",
    );

    if (code === "23505") {
      return "Biển số xe này đã tồn tại trong hệ thống.";
    }

    if (code === "23503") {
      return "Không thể thực hiện thao tác vì dữ liệu xe đang được tham chiếu bởi dữ liệu khác.";
    }
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    const message = String(
      (error as { message?: unknown }).message ?? "",
    );

    if (message) {
      return message;
    }
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

function VehiclesPage() {
  const [vehicles, setVehicles] = useState<
    VehicleWithCustomer[]
  >([]);

  const [customers, setCustomers] = useState<
    Customer[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");

  const [error, setError] = useState<string | null>(
    null,
  );

  const [modal, setModal] = useState<ModalState>({
    type: null,
    vehicle: null,
  });

  const [deleteTarget, setDeleteTarget] =
    useState<VehicleWithCustomer | null>(null);

  const loadData = useCallback(
    async (showLoading = true) => {
      try {
        setError(null);

        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const [vehicleData, customerData] =
          await Promise.all([
            getVehicles(),
            getCustomers(),
          ]);

        setVehicles(vehicleData);
        setCustomers(customerData);
      } catch (loadError) {
        console.error(
          "Không thể tải dữ liệu xe:",
          loadError,
        );

        setError(
          getSupabaseErrorMessage(loadError),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredVehicles = useMemo(() => {
    const normalizedSearch =
      normalizeVietnamese(search);

    if (!normalizedSearch) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => {
      const searchableText =
        normalizeVietnamese(
          [
            vehicle.license_plate,
            vehicle.car_model,
            vehicle.customer?.name ?? "",
            vehicle.customer?.phone ?? "",
          ].join(" "),
        );

      return searchableText.includes(
        normalizedSearch,
      );
    });
  }, [vehicles, search]);

  async function handleSubmit(
    formData: VehicleFormData,
  ) {
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (
        modal.type === "edit" &&
        modal.vehicle
      ) {
        const updated = await updateVehicle(
          modal.vehicle.id,
          formData,
        );

        const customer =
          customers.find(
            (item) =>
              item.id === updated.customer_id,
          ) ?? null;

        setVehicles((current) =>
          current.map((vehicle) =>
            vehicle.id === updated.id
              ? {
                  ...updated,
                  customer: customer
                    ? {
                        id: customer.id,
                        name: customer.name,
                        phone: customer.phone,
                      }
                    : null,
                }
              : vehicle,
          ),
        );
      } else {
        const created =
          await createVehicle(formData);

        const customer =
          customers.find(
            (item) =>
              item.id === created.customer_id,
          ) ?? null;

        setVehicles((current) => [
          {
            ...created,
            customer: customer
              ? {
                  id: customer.id,
                  name: customer.name,
                  phone: customer.phone,
                }
              : null,
          },
          ...current,
        ]);
      }

      setModal({
        type: null,
        vehicle: null,
      });
    } catch (submitError) {
      console.error(
        "Không thể lưu xe:",
        submitError,
      );

      setError(
        getSupabaseErrorMessage(submitError),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      await deleteVehicle(deleteTarget.id);

      setVehicles((current) =>
        current.filter(
          (vehicle) =>
            vehicle.id !== deleteTarget.id,
        ),
      );

      setDeleteTarget(null);
    } catch (deleteError) {
      console.error(
        "Không thể xóa xe:",
        deleteError,
      );

      setError(
        getSupabaseErrorMessage(deleteError),
      );
    } finally {
      setDeleting(false);
    }
  }

  function openCreate() {
    setError(null);

    setModal({
      type: "create",
      vehicle: null,
    });
  }

  function openEdit(
    vehicle: VehicleWithCustomer,
  ) {
    setError(null);

    setModal({
      type: "edit",
      vehicle,
    });
  }

  function openDetail(
    vehicle: VehicleWithCustomer,
  ) {
    setError(null);

    setModal({
      type: "detail",
      vehicle,
    });
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setModal({
      type: null,
      vehicle: null,
    });
  }

  if (loading) {
    return (
      <LoadingScreen message="Đang tải danh sách xe..." />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CarFront className="size-6 text-red-600" />

            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Xe
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Quản lý xe theo quan hệ vehicles →
            customers.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <Plus className="size-4" />
          Thêm xe
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="font-medium">
              Có lỗi xảy ra
            </p>

            <p className="mt-0.5 break-words text-red-600">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 rounded p-1 text-red-400 hover:bg-red-100 hover:text-red-700"
            aria-label="Đóng thông báo lỗi"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Tìm biển số, dòng xe, khách hàng..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Xóa tìm kiếm"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">
              {filteredVehicles.length}
            </span>{" "}
            / {vehicles.length} xe
          </p>

          <button
            type="button"
            onClick={() =>
              void loadData(false)
            }
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            <span className="hidden sm:inline">
              Làm mới
            </span>
          </button>
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <EmptyState
          title={
            vehicles.length === 0
              ? "Chưa có xe"
              : "Không tìm thấy xe"
          }
          description={
            vehicles.length === 0
              ? "Hãy thêm xe đầu tiên và gắn xe với một khách hàng."
              : "Thử thay đổi từ khóa tìm kiếm."
          }
          action={
            vehicles.length === 0
              ? {
                  label: "Thêm xe",
                  onClick: openCreate,
                }
              : undefined
          }
        />
      ) : (
        <VehicleTable
          vehicles={filteredVehicles}
          onView={openDetail}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      )}

      {modal.type && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {modal.type === "detail" &&
              modal.vehicle && (
                <VehicleDetail
                  vehicle={modal.vehicle}
                  onClose={closeModal}
                  onEdit={openEdit}
                />
              )}

            {(modal.type === "create" ||
              modal.type === "edit") && (
              <VehicleForm
                vehicle={
                  modal.type === "edit"
                    ? modal.vehicle
                    : null
                }
                customers={customers}
                submitting={submitting}
                onSubmit={handleSubmit}
                onCancel={closeModal}
              />
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Xóa xe?"
        description={
          deleteTarget
            ? `Bạn có chắc muốn xóa xe "${deleteTarget.license_plate}" (${deleteTarget.car_model})?`
            : ""
        }
        confirmText="Xóa xe"
        cancelText="Hủy"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}

export default VehiclesPage;