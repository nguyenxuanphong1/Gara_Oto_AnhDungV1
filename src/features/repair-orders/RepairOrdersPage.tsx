import {
  AlertCircle,
  ClipboardList,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import RepairOrderDetail from "./components/RepairOrderDetail";
import RepairOrderInvoiceModal from "./components/RepairOrderInvoiceModal";
import RepairOrderForm from "./components/RepairOrderForm";
import RepairOrderTable from "./components/RepairOrderTable";

import {
  completeRepairOrder,
  createRepairOrder,
  createRepairOrderDetails,
  deleteRepairOrder,
  getRepairOrderById,
  getRepairOrders,
  replaceRepairOrderDetails,
  updateRepairOrder,
  updateRepairOrderStatus,
} from "./repair-orders.api";

import type {
  RepairOrderDetailFormData,
  RepairOrderFormData,
  RepairOrderFormState,
  RepairOrderWithRelations,
} from "./repair-orders.types";

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object"
  ) {
    const message = Reflect.get(
      error,
      "message",
    );

    if (typeof message === "string") {
      return message;
    }
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

function RepairOrdersPage() {
  const [orders, setOrders] =
    useState<RepairOrderWithRelations[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingOrderId, setEditingOrderId] =
    useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] =
    useState<RepairOrderWithRelations | null>(
      null,
    );

  const [invoiceOrder, setInvoiceOrder] =
    useState<RepairOrderWithRelations | null>(
      null,
    );

  const [loadingDetail, setLoadingDetail] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<RepairOrderWithRelations | null>(
      null,
    );

  const [successMessage, setSuccessMessage] =
    useState("");

  /*
   * ============================================================
   * LOAD DANH SÁCH PHIẾU
   * ============================================================
   */

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getRepairOrders();

      setOrders(data);
    } catch (err) {
      setError(
        getErrorMessage(err),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  /*
   * ============================================================
   * SUCCESS MESSAGE
   * ============================================================
   */

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [successMessage]);

  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  const filteredOrders =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return orders;
      }

      return orders.filter(
        (order) => {
          const orderCode =
            order.order_code.toLowerCase();

          const licensePlate =
            order.vehicle?.license_plate
              ?.toLowerCase() ?? "";

          const carModel =
            order.vehicle?.car_model
              ?.toLowerCase() ?? "";

          const customerName =
            order.vehicle?.customer?.name
              ?.toLowerCase() ?? "";

          const customerPhone =
            order.vehicle?.customer?.phone
              ?.toLowerCase() ?? "";

          return (
            orderCode.includes(keyword) ||
            licensePlate.includes(keyword) ||
            carModel.includes(keyword) ||
            customerName.includes(keyword) ||
            customerPhone.includes(keyword)
          );
        },
      );
    }, [orders, search]);

  /*
   * ============================================================
   * XEM CHI TIẾT
   * ============================================================
   */

  async function handleView(
    order: RepairOrderWithRelations,
  ) {
    try {
      setLoadingDetail(true);
      setError("");

      const detail =
        await getRepairOrderById(
          order.id,
        );

      if (!detail) {
        throw new Error(
          "Không tìm thấy phiếu sửa chữa.",
        );
      }

      setSelectedOrder(detail);
    } catch (err) {
      setError(
        getErrorMessage(err),
      );
    } finally {
      setLoadingDetail(false);
    }
  }

  /*
   * ============================================================
   * IN PHIẾU
   * ============================================================
   */

  async function handlePrintInvoice(
    order: RepairOrderWithRelations,
  ) {
    try {
      setLoadingDetail(true);
      setError("");

      const detail =
        await getRepairOrderById(
          order.id,
        );

      if (!detail) {
        throw new Error(
          "Không tìm thấy phiếu sửa chữa.",
        );
      }

      setInvoiceOrder(detail);
    } catch (err) {
      setError(
        getErrorMessage(err),
      );
    } finally {
      setLoadingDetail(false);
    }
  }

  /*
   * ============================================================
   * TẠO PHIẾU
   * ============================================================
   */

  function handleCreate() {
    setError("");
    setSelectedOrder(null);
    setInvoiceOrder(null);
    setEditingOrderId(null);
    setShowForm(true);
  }

  /*
   * ============================================================
   * SỬA PHIẾU
   * ============================================================
   */

  function handleEdit(
    order: RepairOrderWithRelations,
  ) {
    /*
     * Phiếu COMPLETED không được sửa.
     */

    if (
      order.status ===
      "COMPLETED"
    ) {
      return;
    }

    setError("");
    setSelectedOrder(null);
    setInvoiceOrder(null);
    setEditingOrderId(order.id);
    setShowForm(true);
  }

  /*
   * ============================================================
   * SUBMIT FORM
   * ============================================================
   *
   * RepairOrderForm:
   *
   * data    = RepairOrderFormData
   * details = RepairOrderDetailFormData[]
   *
   * Không sử dụng RepairOrderFormState ở đây vì
   * details đã được truyền thành tham số riêng.
   */

  async function handleSubmit(
    data: RepairOrderFormData,
    details: RepairOrderDetailFormData[],
  ) {
    try {
      setSaving(true);
      setError("");

      /*
       * ========================================================
       * TẠO PHIẾU MỚI
       * ========================================================
       *
       * Luôn tạo header ở DRAFT trước.
       *
       * Sau đó:
       *
       * 1. Tạo repair_order_details
       * 2. Nếu COMPLETED -> completeRepairOrder()
       * 3. Nếu CANCELLED -> updateRepairOrderStatus()
       *
       * total_amount:
       * -> KHÔNG gửi từ frontend.
       * -> Database tự tính.
       *
       * stock_quantity:
       * -> KHÔNG cập nhật từ frontend.
       * -> Database xử lý khi COMPLETED.
       */

      if (!editingOrderId) {
        const wantedStatus =
          data.status;

        /*
         * Chỉ gửi những column được phép
         * cho repair_orders.
         *
         * Không gửi:
         * - id
         * - order_code
         * - total_amount
         * - created_at
         */

        const createData:
          RepairOrderFormData = {
          vehicle_id:
            data.vehicle_id,

          warehouse_id:
            data.warehouse_id,

          odometer_km:
            data.odometer_km,

          labor_cost:
            data.labor_cost,

          discount:
            data.discount,

          status:
            "DRAFT",
        };

        const created =
          await createRepairOrder(
            createData,
          );

        try {
          /*
           * Tạo các dòng chi tiết.
           *
           * amount sẽ do Database
           * tự tính theo quantity * price.
           */

          await createRepairOrderDetails(
            created.id,
            details,
          );
        } catch (detailError) {
          /*
           * Cố gắng rollback header
           * nếu tạo detail thất bại.
           */

          try {
            await deleteRepairOrder(
              created.id,
            );
          } catch {
            /*
             * Không che mất lỗi gốc.
             */
          }

          throw detailError;
        }

        /*
         * Nếu người dùng chọn COMPLETED:
         *
         * Database sẽ:
         * - kiểm tra tồn kho PART
         * - trừ stock_quantity PART
         * - SERVICE không trừ kho
         * - cập nhật trạng thái COMPLETED
         */

        if (
          wantedStatus ===
          "COMPLETED"
        ) {
          await completeRepairOrder(
            created.id,
          );
        }

        /*
         * Nếu người dùng chọn CANCELLED:
         * chỉ chuyển trạng thái.
         */

        else if (
          wantedStatus ===
          "CANCELLED"
        ) {
          await updateRepairOrderStatus(
            created.id,
            "CANCELLED",
          );
        }

        /*
         * Đóng form.
         */

        setShowForm(false);
        setEditingOrderId(null);
        setSelectedOrder(null);

        /*
         * Thông báo.
         */

        setSuccessMessage(
          wantedStatus ===
            "COMPLETED"
            ? "Đã tạo và hoàn thành phiếu sửa chữa."
            : wantedStatus ===
                "CANCELLED"
              ? "Đã tạo phiếu và chuyển sang trạng thái đã hủy."
              : "Đã tạo phiếu sửa chữa.",
        );

        /*
         * Tải lại danh sách để lấy:
         * - order_code do DB sinh
         * - total_amount do DB tính
         * - status mới
         * - relations
         */

        await loadOrders();

        return;
      }

      /*
       * ========================================================
       * CẬP NHẬT PHIẾU
       * ========================================================
       */

      const orderId =
        editingOrderId;

      /*
       * Lấy bản ghi hiện tại từ Database.
       */

      const current =
        await getRepairOrderById(
          orderId,
        );

      /*
       * getRepairOrderById có thể trả null.
       * Phải kiểm tra trước khi sử dụng.
       */

      if (!current) {
        throw new Error(
          "Không tìm thấy phiếu sửa chữa.",
        );
      }

      /*
       * COMPLETED không được sửa.
       *
       * Đây là bảo vệ frontend.
       * Database vẫn là lớp bảo vệ cuối cùng.
       */

      if (
        current.status ===
        "COMPLETED"
      ) {
        throw new Error(
          "Phiếu đã hoàn thành không được phép sửa.",
        );
      }

      /*
       * Nếu muốn COMPLETED:
       *
       * 1. Cập nhật header về DRAFT
       * 2. Thay detail
       * 3. Gọi completeRepairOrder()
       *
       * Điều này đảm bảo Database mới là nơi
       * xử lý việc hoàn thành và trừ kho.
       */

      const updateData:
        RepairOrderFormData = {
        vehicle_id:
          data.vehicle_id,

        warehouse_id:
          data.warehouse_id,

        odometer_km:
          data.odometer_km,

        labor_cost:
          data.labor_cost,

        discount:
          data.discount,

        status:
          data.status ===
          "COMPLETED"
            ? "DRAFT"
            : data.status,
      };

      /*
       * Cập nhật header.
       */

      await updateRepairOrder(
        orderId,
        updateData,
      );

      /*
       * Thay toàn bộ detail.
       *
       * API sẽ kiểm tra lại trạng thái
       * và không cho sửa nếu COMPLETED.
       */

      await replaceRepairOrderDetails(
        orderId,
        details,
      );

      /*
       * Hoàn thành phiếu.
       *
       * Database xử lý:
       * - kiểm tra tồn kho PART
       * - trừ stock_quantity PART
       * - SERVICE không trừ kho
       */

      if (
        data.status ===
        "COMPLETED"
      ) {
        await completeRepairOrder(
          orderId,
        );
      }

      /*
       * Hủy phiếu.
       */

      else if (
        data.status ===
        "CANCELLED"
      ) {
        await updateRepairOrderStatus(
          orderId,
          "CANCELLED",
        );
      }

      /*
       * Đóng form.
       */

      setShowForm(false);
      setEditingOrderId(null);
      setSelectedOrder(null);

      /*
       * Thông báo.
       */

      setSuccessMessage(
        data.status ===
          "COMPLETED"
          ? "Đã cập nhật và hoàn thành phiếu sửa chữa."
          : data.status ===
              "CANCELLED"
            ? "Đã cập nhật phiếu và chuyển sang trạng thái đã hủy."
            : "Đã cập nhật phiếu sửa chữa.",
      );

      /*
       * Tải lại dữ liệu chính thức từ Database.
       */

      await loadOrders();
    } catch (err) {
      setError(
        getErrorMessage(err),
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ============================================================
   * XÓA PHIẾU
   * ============================================================
   */

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      /*
       * Không cho xóa COMPLETED.
       */

      if (
        deleteTarget.status ===
        "COMPLETED"
      ) {
        throw new Error(
          "Phiếu đã hoàn thành không được phép xóa.",
        );
      }

      await deleteRepairOrder(
        deleteTarget.id,
      );

      setDeleteTarget(null);

      setSuccessMessage(
        "Đã xóa phiếu sửa chữa.",
      );

      await loadOrders();
    } catch (err) {
      setError(
        getErrorMessage(err),
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ============================================================
   * LẤY PHIẾU ĐANG SỬA
   * ============================================================
   */

  function getEditingOrder():
    | RepairOrderWithRelations
    | undefined {
    if (!editingOrderId) {
      return undefined;
    }

    if (
      !selectedOrder ||
      selectedOrder.id !==
        editingOrderId
    ) {
      return undefined;
    }

    return selectedOrder;
  }

  /*
   * ============================================================
   * LOAD PHIẾU KHI MỞ FORM EDIT
   * ============================================================
   */

  useEffect(() => {
    if (
      !editingOrderId ||
      !showForm
    ) {
      return;
    }

    const orderId =
      editingOrderId;

    if (
      selectedOrder?.id ===
      orderId
    ) {
      return;
    }

    let cancelled = false;

    async function loadEditingOrder() {
      try {
        setLoadingDetail(true);
        setError("");

        const detail =
          await getRepairOrderById(
            orderId,
          );

        if (!detail) {
          throw new Error(
            "Không tìm thấy phiếu sửa chữa.",
          );
        }

        if (!cancelled) {
          setSelectedOrder(
            detail,
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getErrorMessage(err),
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      }
    }

    void loadEditingOrder();

    return () => {
      cancelled = true;
    };
  }, [
    editingOrderId,
    showForm,
    selectedOrder,
  ]);

  /*
   * ============================================================
   * ĐÓNG FORM
   * ============================================================
   */

  function handleCloseForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingOrderId(null);
    setSelectedOrder(null);
  }

  /*
   * ============================================================
   * ĐÓNG DETAIL
   * ============================================================
   */

  function handleCloseDetail() {
    setSelectedOrder(null);
  }

  /*
   * ============================================================
   * ĐÓNG INVOICE
   * ============================================================
   */

  function handleCloseInvoice() {
    setInvoiceOrder(null);
  }

  /*
   * ============================================================
   * FORM DATA
   * ============================================================
   */

  const editingOrder =
    getEditingOrder();

  const initialFormData:
    | RepairOrderFormState
    | undefined =
    editingOrder
      ? {
          vehicle_id:
            editingOrder.vehicle_id,

          warehouse_id:
            editingOrder.warehouse_id,

          odometer_km:
            editingOrder.odometer_km,

          labor_cost:
            editingOrder.labor_cost,

          discount:
            editingOrder.discount,

          status:
            editingOrder.status,

          details:
            editingOrder.details.map(
              (detail) => ({
                item_id:
                  detail.item_id,

                quantity:
                  detail.quantity,

                price:
                  detail.price,
              }),
            ),
        }
      : undefined;

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-6">
      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Phiếu sửa chữa
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Quản lý các phiếu sửa chữa
                và chi phí của xe.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              void loadOrders();
            }}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Làm mới
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />

            Tạo phiếu
          </button>
        </div>
      </div>

      {/* ======================================================
          SUCCESS
      ======================================================= */}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

          <span>
            {successMessage}
          </span>
        </div>
      )}

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              Có lỗi xảy ra
            </p>

            <p className="mt-1 break-words">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="rounded-lg p-1 transition hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ======================================================
          SEARCH
      ======================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Tìm mã phiếu, biển số, xe, khách hàng..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
          />
        </div>
      </section>

      {/* ======================================================
          TABLE
      ======================================================= */}

      <RepairOrderTable
        orders={filteredOrders}
        loading={loading}
        onView={(order) => {
          void handleView(order);
        }}
        onPrint={(order) => {
          void handlePrintInvoice(order);
        }}
        onEdit={handleEdit}
        onDelete={(order) =>
          setDeleteTarget(order)
        }
      />

      {/* ======================================================
          DETAIL MODAL
      ======================================================= */}

      {selectedOrder &&
        !showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm sm:p-6">
            <div className="mx-auto max-w-6xl pt-4 sm:pt-10">
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={
                    handleCloseDetail
                  }
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-lg transition hover:bg-slate-50"
                  aria-label="Đóng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="rounded-2xl">
                <RepairOrderDetail
                  order={
                    selectedOrder
                  }
                  onClose={
                    handleCloseDetail
                  }
                />
              </div>
            </div>
          </div>
        )}

      {/* ======================================================
          INVOICE MODAL
      ======================================================= */}

      {invoiceOrder && (
        <RepairOrderInvoiceModal
          order={invoiceOrder}
          onClose={
            handleCloseInvoice
          }
        />
      )}

      {/* ======================================================
          LOADING DETAIL
      ======================================================= */}

      {loadingDetail &&
        !selectedOrder &&
        !invoiceOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-xl">
              <RefreshCw className="h-5 w-5 animate-spin text-red-600" />

              <span className="text-sm font-medium text-slate-700">
                Đang tải phiếu...
              </span>
            </div>
          </div>
        )}

      {/* ======================================================
          CREATE / EDIT MODAL
      ======================================================= */}

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm sm:p-6">
          <div className="mx-auto max-w-6xl py-4 sm:py-8">
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-lg">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingOrderId
                    ? "Chỉnh sửa phiếu sửa chữa"
                    : "Tạo phiếu sửa chữa"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingOrderId
                    ? "Cập nhật thông tin và chi tiết phiếu."
                    : "Nhập xe, vật tư và chi phí sửa chữa."}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseForm
                }
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editingOrderId &&
            !editingOrder ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white shadow-lg">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <RefreshCw className="h-5 w-5 animate-spin text-red-600" />

                  Đang tải dữ liệu phiếu...
                </div>
              </div>
            ) : (
              <div className="rounded-2xl">
                <RepairOrderForm
                  initialData={
                    initialFormData
                  }
                  onSubmit={
                    handleSubmit
                  }
                  onCancel={
                    handleCloseForm
                  }
                  loading={saving}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================
          DELETE CONFIRM
      ======================================================= */}

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Xóa phiếu sửa chữa?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Bạn có chắc muốn xóa phiếu{" "}
                <strong className="font-semibold text-slate-800">
                  {
                    deleteTarget.order_code
                  }
                </strong>
                ?
                <br />
                Các chi tiết của phiếu
                cũng sẽ bị xóa theo
                quan hệ CASCADE trong
                Database.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null,
                  )
                }
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleDeleteConfirm();
                }}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                )}

                Xóa phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RepairOrdersPage;