import {
  AlertCircle,
  Package,
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

import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItems,
  updateInventoryItem,
} from "./inventory-items.api";

import InventoryItemDetail from "./components/InventoryItemDetail";
import InventoryItemForm from "./components/InventoryItemForm";
import InventoryItemTable from "./components/InventoryItemTable";

import type {
  InventoryItem,
  InventoryItemFormData,
} from "./inventory-items.types";

type ModalState =
  | {
      type: "create";
      item: null;
    }
  | {
      type: "edit";
      item: InventoryItem;
    }
  | {
      type: "detail";
      item: InventoryItem;
    }
  | {
      type: null;
      item: null;
    };

function normalizeVietnamese(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

function getSupabaseErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null
  ) {
    const record = error as Record<
      string,
      unknown
    >;

    const code = String(
      record.code ?? "",
    );

    if (code === "23505") {
      return "Mã mặt hàng đã tồn tại trong hệ thống.";
    }

    if (code === "23503") {
      return "Không thể xóa mặt hàng vì đang có dữ liệu liên quan.";
    }

    if (code === "42501") {
      return "Bạn không có quyền thực hiện thao tác này.";
    }

    const message = String(
      record.message ?? "",
    );

    if (message) {
      return message;
    }
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

function InventoryItemsPage() {
  const [items, setItems] = useState<
    InventoryItem[]
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
      item: null,
    });

  const [deleteTarget, setDeleteTarget] =
    useState<InventoryItem | null>(null);

  const loadItems = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError(null);

        const data =
          await getInventoryItems();

        setItems(data);
      } catch (loadError) {
        setError(
          getSupabaseErrorMessage(
            loadError,
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const keyword =
      normalizeVietnamese(search);

    if (!keyword) {
      return items;
    }

    return items.filter((item) => {
      const code =
        normalizeVietnamese(item.code);

      const name =
        normalizeVietnamese(item.name);

      const unit =
        normalizeVietnamese(item.unit);

      const itemType =
        normalizeVietnamese(
          item.item_type === "PART"
            ? "Phụ tùng"
            : "Dịch vụ",
        );

      return (
        code.includes(keyword) ||
        name.includes(keyword) ||
        unit.includes(keyword) ||
        itemType.includes(keyword)
      );
    });
  }, [items, search]);

  async function handleSubmit(
    formData: InventoryItemFormData,
  ) {
    try {
      setSubmitting(true);
      setError(null);

      if (
        modal.type === "edit" &&
        modal.item
      ) {
        const updated =
          await updateInventoryItem(
            modal.item.id,
            formData,
          );

        setItems((current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item,
          ),
        );
      } else {
        const created =
          await createInventoryItem(
            formData,
          );

        setItems((current) => [
          created,
          ...current,
        ]);
      }

      setModal({
        type: null,
        item: null,
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

      await deleteInventoryItem(
        deleteTarget.id,
      );

      setItems((current) =>
        current.filter(
          (item) =>
            item.id !== deleteTarget.id,
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
      item: null,
    });
  }

  function openEdit(
    item: InventoryItem,
  ) {
    setError(null);

    setModal({
      type: "edit",
      item,
    });
  }

  function openDetail(
    item: InventoryItem,
  ) {
    setError(null);

    setModal({
      type: "detail",
      item,
    });
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setModal({
      type: null,
      item: null,
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
              <Package size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Danh mục hàng hóa
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Quản lý phụ tùng và dịch vụ của gara.
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
          Thêm mặt hàng
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

      {/* Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-lg">
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
              placeholder="Tìm mã, tên, loại hoặc đơn vị..."
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
                {filteredItems.length}
              </span>{" "}
              / {items.length} mặt hàng
            </div>

            <button
              type="button"
              onClick={() =>
                void loadItems(false)
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

      {/* Table / Empty */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title={
            search
              ? "Không tìm thấy mặt hàng"
              : "Chưa có mặt hàng"
          }
          description={
            search
              ? "Không có mặt hàng nào phù hợp với từ khóa tìm kiếm."
              : "Hãy thêm mặt hàng đầu tiên để bắt đầu quản lý."
          }
          action={
            search
              ? {
                  label: "Xóa tìm kiếm",
                  onClick:
                    handleClearSearch,
                }
              : {
                  label: "Thêm mặt hàng",
                  onClick: openCreate,
                }
          }
        />
      ) : (
        <InventoryItemTable
          items={filteredItems}
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
              event.target ===
                event.currentTarget &&
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
              modal.item && (
                <InventoryItemDetail
                  item={modal.item}
                  onClose={closeModal}
                  onEdit={openEdit}
                />
              )}

            {(modal.type === "create" ||
              modal.type === "edit") && (
              <InventoryItemForm
                item={
                  modal.type === "edit"
                    ? modal.item
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
        title="Xóa mặt hàng?"
        description={
          deleteTarget
            ? `Bạn có chắc muốn xóa "${deleteTarget.name}" (${deleteTarget.code})? Thao tác này không thể hoàn tác.`
            : ""
        }
        confirmText="Xóa mặt hàng"
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

export default InventoryItemsPage;