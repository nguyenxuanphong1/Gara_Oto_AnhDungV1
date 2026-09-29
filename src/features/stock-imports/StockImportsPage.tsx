import {
  AlertCircle,
  ArrowDownToLine,
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

import EmptyState from "../../components/common/EmptyState";
import LoadingScreen from "../../components/common/LoadingScreen";

import {
  createStockImport,
  getStockImports,
} from "./stock-imports.api";

import StockImportDetail from "./components/StockImportDetail";
import StockImportForm from "./components/StockImportForm";
import StockImportTable from "./components/StockImportTable";

import type {
  StockImportFormData,
  StockImportWithRelations,
} from "./stock-imports.types";

type ModalState =
  | {
      type: "create";
      stockImport: null;
    }
  | {
      type: "detail";
      stockImport: StockImportWithRelations;
    }
  | {
      type: null;
      stockImport: null;
    };

function normalizeVietnamese(
  value: string,
): string {
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
    const errorObject =
      error as Record<string, unknown>;

    const code = String(
      errorObject.code ?? "",
    );

    if (code === "23503") {
      return "Không thể tạo phiếu nhập vì mặt hàng hoặc kho được chọn không tồn tại.";
    }

    if (code === "23522") {
      return "Dữ liệu nhập kho không hợp lệ.";
    }

    if (code === "42501") {
      return "Bạn không có quyền thực hiện thao tác này.";
    }

    const message = String(
      errorObject.message ?? "",
    );

    if (message) {
      return message;
    }
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

function StockImportsPage() {
  const [imports, setImports] =
    useState<StockImportWithRelations[]>(
      [],
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [modal, setModal] =
    useState<ModalState>({
      type: null,
      stockImport: null,
    });

  const loadImports = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError(null);

        const data =
          await getStockImports();

        setImports(data);
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
    void loadImports();
  }, [loadImports]);

  const filteredImports = useMemo(() => {
    const keyword =
      normalizeVietnamese(search);

    if (!keyword) {
      return imports;
    }

    return imports.filter(
      (stockImport) => {
        const importCode =
          normalizeVietnamese(
            stockImport.import_code,
          );

        const itemCode =
          normalizeVietnamese(
            stockImport.item?.code ?? "",
          );

        const itemName =
          normalizeVietnamese(
            stockImport.item?.name ?? "",
          );

        const itemUnit =
          normalizeVietnamese(
            stockImport.item?.unit ?? "",
          );

        const warehouseCode =
          normalizeVietnamese(
            stockImport.warehouse?.code ??
              "",
          );

        const warehouseName =
          normalizeVietnamese(
            stockImport.warehouse?.name ??
              "",
          );

        return (
          importCode.includes(keyword) ||
          itemCode.includes(keyword) ||
          itemName.includes(keyword) ||
          itemUnit.includes(keyword) ||
          warehouseCode.includes(keyword) ||
          warehouseName.includes(keyword)
        );
      },
    );
  }, [imports, search]);

  async function handleCreate(
    formData: StockImportFormData,
  ) {
    try {
      setSubmitting(true);
      setError(null);

    await createStockImport(formData);
    await loadImports(false);

    } catch (createError) {
      setError(
        getSupabaseErrorMessage(
          createError,
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function openCreate() {
    setError(null);

    setModal({
      type: "create",
      stockImport: null,
    });
  }

  function openDetail(
    stockImport: StockImportWithRelations,
  ) {
    setError(null);

    setModal({
      type: "detail",
      stockImport,
    });
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setModal({
      type: null,
      stockImport: null,
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
              <ArrowDownToLine size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Nhập kho
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Quản lý các phiếu nhập kho của
                gara.
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
          Tạo phiếu nhập
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
              placeholder="Tìm mã phiếu, mặt hàng hoặc kho..."
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
                {filteredImports.length}
              </span>{" "}
              / {imports.length} phiếu
            </div>

            <button
              type="button"
              onClick={() =>
                void loadImports(false)
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
      {filteredImports.length === 0 ? (
        <EmptyState
          title={
            search
              ? "Không tìm thấy phiếu nhập"
              : "Chưa có phiếu nhập"
          }
          description={
            search
              ? "Không có phiếu nhập nào phù hợp với từ khóa tìm kiếm."
              : "Hãy tạo phiếu nhập đầu tiên để bắt đầu quản lý nhập kho."
          }
          action={
            search
              ? {
                  label: "Xóa tìm kiếm",
                  onClick:
                    handleClearSearch,
                }
              : {
                  label: "Tạo phiếu nhập",
                  onClick: openCreate,
                }
          }
        />
      ) : (
        <StockImportTable
          imports={filteredImports}
          onView={openDetail}
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
            className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            {modal.type ===
              "create" && (
              <StockImportForm
                submitting={submitting}
                onSubmit={handleCreate}
                onCancel={closeModal}
              />
            )}

            {modal.type ===
              "detail" &&
              modal.stockImport && (
                <StockImportDetail
                  stockImport={
                    modal.stockImport
                  }
                  onClose={closeModal}
                />
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StockImportsPage;