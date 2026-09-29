import {
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Warehouse as WarehouseIcon,
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

import {
  createWarehouse,
  deleteWarehouse,
  getWarehouses,
  updateWarehouse,
} from "./warehouses.api";

import WarehouseDetail from "./components/WarehouseDetail";
import WarehouseForm from "./components/WarehouseForm";
import WarehouseTable from "./components/WarehouseTable";

import type {
  Warehouse,
  WarehouseFormData,
} from "./warehouses.types";

type ModalState =
  | {
      type: "create";
      warehouse: null;
    }
  | {
      type: "edit";
      warehouse: Warehouse;
    }
  | {
      type: "detail";
      warehouse: Warehouse;
    }
  | {
      type: null;
      warehouse: null;
    };

function normalizeVietnamese(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

function getSupabaseErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    const code = String(
      (error as { code?: unknown }).code ?? "",
    );

    if (code === "23505") {
      return "Mã kho đã tồn tại trong hệ thống.";
    }

    if (code === "23503") {
      return "Không thể xóa kho vì đang có dữ liệu liên quan.";
    }

    if (code === "42501") {
      return "Bạn không có quyền thực hiện thao tác này.";
    }
  }

  if (
    typeof error === "object" &&
    error !== null &&
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

function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<
    Warehouse[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [modal, setModal] =
    useState<ModalState>({
      type: null,
      warehouse: null,
    });

  const [deleteTarget, setDeleteTarget] =
    useState<Warehouse | null>(null);

  const loadWarehouses = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError(null);

        const data = await getWarehouses();

        setWarehouses(data);
      } catch (loadError) {
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
    void loadWarehouses();
  }, [loadWarehouses]);

  const filteredWarehouses = useMemo(() => {
    const keyword =
      normalizeVietnamese(search);

    if (!keyword) {
      return warehouses;
    }

    return warehouses.filter((warehouse) => {
      const code =
        normalizeVietnamese(warehouse.code);

      const name =
        normalizeVietnamese(warehouse.name);

      return (
        code.includes(keyword) ||
        name.includes(keyword)
      );
    });
  }, [warehouses, search]);

  async function handleSubmit(
    formData: WarehouseFormData,
  ) {
    try {
      setSubmitting(true);
      setError(null);

      if (
        modal.type === "edit" &&
        modal.warehouse
      ) {
        const updated =
          await updateWarehouse(
            modal.warehouse.id,
            formData,
          );

        setWarehouses((current) =>
          current.map((warehouse) =>
            warehouse.id === updated.id
              ? updated
              : warehouse,
          ),
        );
      } else {
        const created =
          await createWarehouse(formData);

        setWarehouses((current) => [
          created,
          ...current,
        ]);
      }

      setModal({
        type: null,
        warehouse: null,
      });
    } catch (submitError) {
      setError(
        getSupabaseErrorMessage(
          submitError,
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      await deleteWarehouse(
        deleteTarget.id,
      );

      setWarehouses((current) =>
        current.filter(
          (warehouse) =>
            warehouse.id !== deleteTarget.id,
        ),
      );

      setDeleteTarget(null);
    } catch (deleteError) {
      setError(
        getSupabaseErrorMessage(
          deleteError,
        ),
      );
    } finally {
      setDeleting(false);
    }
  }

  function openCreate() {
    setError(null);

    setModal({
      type: "create",
      warehouse: null,
    });
  }

  function openEdit(
    warehouse: Warehouse,
  ) {
    setError(null);

    setModal({
      type: "edit",
      warehouse,
    });
  }

  function openDetail(
    warehouse: Warehouse,
  ) {
    setError(null);

    setModal({
      type: "detail",
      warehouse,
    });
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setModal({
      type: null,
      warehouse: null,
    });
  }

  function handleClearSearch() {
    setSearch("");
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <WarehouseIcon size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Kho hàng
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Quản lý danh sách kho hàng của gara.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Thêm kho
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError(null)}
            className="rounded-lg p-1 text-red-500 transition hover:bg-red-100 hover:text-red-700"
            aria-label="Đóng thông báo lỗi"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Search / toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Tìm theo mã hoặc tên kho..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
            />

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Xóa tìm kiếm"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <div className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">
                {filteredWarehouses.length}
              </span>{" "}
              / {warehouses.length} kho
            </div>

            <button
              type="button"
              onClick={() =>
                void loadWarehouses(false)
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredWarehouses.length === 0 ? (
        <EmptyState
          title={
            search
              ? "Không tìm thấy kho hàng"
              : "Chưa có kho hàng"
          }
          description={
            search
              ? "Không có kho hàng nào phù hợp với từ khóa tìm kiếm."
              : "Hãy thêm kho hàng đầu tiên để bắt đầu quản lý."
          }
          action={
            search
              ? {
                  label: "Xóa tìm kiếm",
                  onClick: handleClearSearch,
                }
              : {
                  label: "Thêm kho",
                  onClick: openCreate,
                }
          }
        />
      ) : (
        <WarehouseTable
          warehouses={filteredWarehouses}
          onView={openDetail}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      )}

      {/* Modal */}
      {modal.type !== null && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !submitting
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            {modal.type === "detail" &&
              modal.warehouse && (
                <WarehouseDetail
                  warehouse={modal.warehouse}
                  onClose={closeModal}
                  onEdit={openEdit}
                />
              )}

            {(modal.type === "create" ||
              modal.type === "edit") && (
              <WarehouseForm
                warehouse={
                  modal.type === "edit"
                    ? modal.warehouse
                    : null
                }
                submitting={submitting}
                onSubmit={handleSubmit}
                onCancel={closeModal}
              />
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Xóa kho hàng?"
        description={
          deleteTarget
            ? `Bạn có chắc muốn xóa kho "${deleteTarget.name}" (${deleteTarget.code})? Thao tác này không thể hoàn tác.`
            : ""
        }
        confirmText="Xóa kho"
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

export default WarehousesPage;