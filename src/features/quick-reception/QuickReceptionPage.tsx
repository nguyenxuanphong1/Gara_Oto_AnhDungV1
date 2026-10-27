import {
  ArrowLeft,
  CheckCircle2,
  ClipboardPlus,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  UserRound,
  CarFront,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";

type Customer = {
  id?: string;
  name: string;
  phone: string;
  address: string;
};

type Vehicle = {
  id?: string;
  license_plate: string;
  car_model: string;
  customer_id?: string;
};

type InventoryItem = {
  id: string;
  code: string;
  name: string;
  item_type: "PART" | "SERVICE";
  unit: string;
  sell_price: number;
  stock_quantity: number;
};

type Warehouse = {
  id: string;
  code: string;
  name: string;
};

type DetailRow = {
  key: number;
  item_id: string;
  quantity: number;
  price: number;
};

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const fieldClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";

const labelClass = "text-sm font-medium text-slate-700";

function QuickReceptionPage() {
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    address: "",
  });

  const [vehicle, setVehicle] = useState<Vehicle>({
    license_plate: "",
    car_model: "",
  });

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [odometer, setOdometer] = useState("0");
  const [laborCost, setLaborCost] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [details, setDetails] = useState<DetailRow[]>([
    { key: 1, item_id: "", quantity: 1, price: 0 },
  ]);

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [searchingVehicle, setSearchingVehicle] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [createdOrder, setCreatedOrder] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoadingData(true);

      const [itemsResult, warehousesResult] = await Promise.all([
        supabase
          .from("inventory_items")
          .select("id,code,name,item_type,unit,sell_price,stock_quantity")
          .order("name"),
        supabase
          .from("warehouses")
          .select("id,code,name")
          .order("name"),
      ]);

      if (!active) return;

      if (itemsResult.error || warehousesResult.error) {
        setNotice({
          type: "error",
          message:
            itemsResult.error?.message ??
            warehousesResult.error?.message ??
            "Không tải được dữ liệu.",
        });
      } else {
        setItems((itemsResult.data ?? []) as InventoryItem[]);
        setWarehouses((warehousesResult.data ?? []) as Warehouse[]);
      }

      setLoadingData(false);
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const subtotal = useMemo(
    () =>
      details.reduce(
        (sum, row) => sum + Math.max(0, row.quantity) * Math.max(0, row.price),
        0,
      ),
    [details],
  );

  const total = Math.max(
    0,
    subtotal +
      Math.max(0, Number(laborCost) || 0) -
      Math.max(0, Number(discount) || 0),
  );

  async function findCustomer() {
    const phone = customer.phone.trim();

    if (!phone) {
      setNotice({ type: "error", message: "Hãy nhập số điện thoại trước." });
      return;
    }

    setSearchingCustomer(true);
    setNotice(null);

    const { data, error } = await supabase
      .from("customers")
      .select("id,name,phone,address")
      .eq("phone", phone)
      .maybeSingle();

    setSearchingCustomer(false);

    if (error) {
      setNotice({ type: "error", message: error.message });
      return;
    }

    if (data) {
      setCustomer({
        id: data.id,
        name: data.name ?? "",
        phone: data.phone ?? phone,
        address: data.address ?? "",
      });
      setNotice({
        type: "success",
        message: "Đã tìm thấy khách hàng. Thông tin đã được điền.",
      });
    } else {
      setCustomer((current) => ({ ...current, id: undefined }));
      setNotice({
        type: "info",
        message: "Khách hàng chưa có trong hệ thống. Nhập tên để tạo mới.",
      });
    }
  }

  async function findVehicle() {
    const plate = vehicle.license_plate.trim().toUpperCase();

    if (!plate) {
      setNotice({ type: "error", message: "Hãy nhập biển số xe trước." });
      return;
    }

    setSearchingVehicle(true);
    setNotice(null);

    const { data, error } = await supabase
      .from("vehicles")
      .select("id,license_plate,car_model,customer_id")
      .eq("license_plate", plate)
      .maybeSingle();

    setSearchingVehicle(false);

    if (error) {
      setNotice({ type: "error", message: error.message });
      return;
    }

    if (data) {
      setVehicle({
        id: data.id,
        license_plate: data.license_plate,
        car_model: data.car_model ?? "",
        customer_id: data.customer_id,
      });
      setNotice({
        type: "success",
        message: "Đã tìm thấy xe theo biển số.",
      });
    } else {
      setVehicle((current) => ({
        ...current,
        id: undefined,
        license_plate: plate,
      }));
      setNotice({
        type: "info",
        message: "Xe chưa có trong hệ thống. Nhập dòng xe để tạo mới.",
      });
    }
  }

  function updateDetail(key: number, changes: Partial<DetailRow>) {
    setDetails((current) =>
      current.map((row) =>
        row.key === key ? { ...row, ...changes } : row,
      ),
    );
  }

  function selectItem(key: number, itemId: string) {
    const item = items.find((entry) => entry.id === itemId);

    updateDetail(key, {
      item_id: itemId,
      price: Number(item?.sell_price ?? 0),
    });
  }

  function addDetail() {
    setDetails((current) => [
      ...current,
      {
        key: Math.max(0, ...current.map((row) => row.key)) + 1,
        item_id: "",
        quantity: 1,
        price: 0,
      },
    ]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setCreatedOrder("");

    if (!customer.name.trim() || !customer.phone.trim()) {
      setNotice({
        type: "error",
        message: "Vui lòng nhập tên và số điện thoại khách hàng.",
      });
      return;
    }

    if (!vehicle.license_plate.trim() || !vehicle.car_model.trim()) {
      setNotice({
        type: "error",
        message: "Vui lòng nhập biển số và dòng xe.",
      });
      return;
    }

    if (!/^\d+$/.test(odometer) || Number(odometer) < 0) {
      setNotice({
        type: "error",
        message: "Số km phải là số nguyên không âm.",
      });
      return;
    }

    if (
      details.some(
        (row) =>
          !row.item_id ||
          !Number.isInteger(Number(row.quantity)) ||
          row.quantity < 1 ||
          !Number.isFinite(Number(row.price)) ||
          row.price < 0,
      )
    ) {
      setNotice({
        type: "error",
        message: "Kiểm tra lại hạng mục, số lượng và đơn giá.",
      });
      return;
    }

    if (details.length === 0) {
      setNotice({
        type: "error",
        message: "Hãy thêm ít nhất một hạng mục sửa chữa.",
      });
      return;
    }

    setSaving(true);

    const { data, error } = await supabase.rpc("create_quick_reception", {
      p_customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
      },
      p_vehicle: {
        license_plate: vehicle.license_plate.trim().toUpperCase(),
        car_model: vehicle.car_model.trim(),
      },
      p_order: {
        warehouse_id: warehouseId || null,
        odometer_km: Number(odometer),
        labor_cost: Math.max(0, Number(laborCost) || 0),
        discount: Math.max(0, Number(discount) || 0),
      },
      p_details: details.map((row) => ({
        item_id: row.item_id,
        quantity: Number(row.quantity),
        price: Number(row.price),
      })),
    });

    setSaving(false);

    if (error) {
      setNotice({
        type: "error",
        message: error.message || "Không thể tạo phiếu tiếp nhận.",
      });
      return;
    }

    const result = data as { order_code?: string } | null;
    const orderCode = result?.order_code ?? "Đã tạo phiếu";

    setCreatedOrder(orderCode);
    setNotice({
      type: "success",
      message: `Tiếp nhận xe thành công. Mã phiếu: ${orderCode}`,
    });
  }

  function resetForm() {
    setCustomer({ name: "", phone: "", address: "" });
    setVehicle({ license_plate: "", car_model: "" });
    setWarehouseId("");
    setOdometer("0");
    setLaborCost("0");
    setDiscount("0");
    setDetails([{ key: Date.now(), item_id: "", quantity: 1, price: 0 }]);
    setCreatedOrder("");
    setNotice(null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-red-600">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-700">Tiếp nhận xe nhanh</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tiếp nhận xe nhanh
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tạo khách hàng, xe và phiếu sửa chữa ngay trên một màn hình.
          </p>
        </div>

        <Link
          to="/repair-orders"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" />
          Danh sách phiếu
        </Link>
      </div>

      {notice && (
        <div
          className={`flex items-start gap-2 rounded-xl border p-4 text-sm ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
          }`}
        >
          {notice.type === "success" && (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {createdOrder && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Mã phiếu vừa tạo</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {createdOrder}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Phiếu ở trạng thái DRAFT. Kho chưa bị trừ.
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Tiếp nhận xe khác
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <UserRound className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Thông tin khách hàng</h2>
                <p className="text-xs text-slate-500">
                  Tra cứu bằng số điện thoại
                </p>
              </div>
            </div>

            <label className={labelClass}>
              Số điện thoại *
              <div className="mt-1 flex gap-2">
                <input
                  className={`${fieldClass} mt-0`}
                  value={customer.phone}
                  onChange={(event) =>
                    setCustomer({
                      ...customer,
                      phone: event.target.value,
                      id: undefined,
                    })
                  }
                  placeholder="Nhập số điện thoại"
                  required
                />
                <button
                  type="button"
                  onClick={() => void findCustomer()}
                  disabled={searchingCustomer}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {searchingCustomer ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  Tìm
                </button>
              </div>
            </label>

            <div className="mt-4 space-y-4">
              <label className={labelClass}>
                Tên khách hàng *
                <input
                  className={fieldClass}
                  value={customer.name}
                  onChange={(event) =>
                    setCustomer({ ...customer, name: event.target.value })
                  }
                  placeholder="Họ và tên khách hàng"
                  required
                />
              </label>

              <label className={labelClass}>
                Địa chỉ
                <input
                  className={fieldClass}
                  value={customer.address}
                  onChange={(event) =>
                    setCustomer({ ...customer, address: event.target.value })
                  }
                  placeholder="Địa chỉ khách hàng"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-2.5 text-red-700">
                <CarFront className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Thông tin xe</h2>
                <p className="text-xs text-slate-500">
                  Tra cứu bằng biển số xe
                </p>
              </div>
            </div>

            <label className={labelClass}>
              Biển số xe *
              <div className="mt-1 flex gap-2">
                <input
                  className={`${fieldClass} mt-0 uppercase`}
                  value={vehicle.license_plate}
                  onChange={(event) =>
                    setVehicle({
                      ...vehicle,
                      license_plate: event.target.value.toUpperCase(),
                      id: undefined,
                    })
                  }
                  placeholder="Ví dụ: 30A12345"
                  required
                />
                <button
                  type="button"
                  onClick={() => void findVehicle()}
                  disabled={searchingVehicle}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {searchingVehicle ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  Tìm
                </button>
              </div>
            </label>

            <div className="mt-4 space-y-4">
              <label className={labelClass}>
                Dòng xe *
                <input
                  className={fieldClass}
                  value={vehicle.car_model}
                  onChange={(event) =>
                    setVehicle({ ...vehicle, car_model: event.target.value })
                  }
                  placeholder="Ví dụ: Toyota Vios 2022"
                  required
                />
              </label>

              <label className={labelClass}>
                Số km hiện tại
                <input
                  className={fieldClass}
                  type="number"
                  min="0"
                  step="1"
                  value={odometer}
                  onChange={(event) => setOdometer(event.target.value)}
                />
              </label>

              <label className={labelClass}>
                Kho tiếp nhận
                <select
                  className={fieldClass}
                  value={warehouseId}
                  onChange={(event) => setWarehouseId(event.target.value)}
                >
                  <option value="">Chưa chọn kho</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.code} — {warehouse.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
                <Wrench className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Hạng mục sửa chữa</h2>
                <p className="text-xs text-slate-500">
                  Thêm phụ tùng và dịch vụ vào phiếu
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addDetail}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <Plus className="size-4" />
              Thêm hạng mục
            </button>
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
              <LoaderCircle className="size-5 animate-spin" />
              Đang tải danh mục...
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Chưa có phụ tùng hoặc dịch vụ. Hãy thêm danh mục trong mục Kho phụ tùng trước.
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {details.map((row, index) => {
                const selectedItem = items.find(
                  (item) => item.id === row.item_id,
                );

                return (
                  <div
                    key={row.key}
                    className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-12 sm:items-end"
                  >
                    <div className="sm:col-span-1">
                      <span className="text-xs font-semibold text-slate-400">
                        #{index + 1}
                      </span>
                    </div>

                    <label className={`${labelClass} sm:col-span-5`}>
                      Phụ tùng / dịch vụ
                      <select
                        className={fieldClass}
                        value={row.item_id}
                        onChange={(event) =>
                          selectItem(row.key, event.target.value)
                        }
                        required
                      >
                        <option value="">-- Chọn hạng mục --</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            [{item.item_type === "PART" ? "Phụ tùng" : "Dịch vụ"}]{" "}
                            {item.code} — {item.name}
                          </option>
                        ))}
                      </select>
                      {selectedItem && (
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Đơn vị: {selectedItem.unit}
                          {selectedItem.item_type === "PART"
                            ? ` · Tồn: ${selectedItem.stock_quantity}`
                            : ""}
                        </span>
                      )}
                    </label>

                    <label className={`${labelClass} sm:col-span-2`}>
                      Số lượng
                      <input
                        className={fieldClass}
                        type="number"
                        min="1"
                        step="1"
                        value={row.quantity}
                        onChange={(event) =>
                          updateDetail(row.key, {
                            quantity: Number(event.target.value),
                          })
                        }
                        required
                      />
                    </label>

                    <label className={`${labelClass} sm:col-span-3`}>
                      Đơn giá (VNĐ)
                      <input
                        className={fieldClass}
                        type="number"
                        min="0"
                        step="1000"
                        value={row.price}
                        onChange={(event) =>
                          updateDetail(row.key, {
                            price: Number(event.target.value),
                          })
                        }
                        required
                      />
                      <span className="mt-1 block text-xs font-normal text-slate-500">
                        Thành tiền: {money(row.quantity * row.price)}
                      </span>
                    </label>

                    <div className="flex justify-end sm:col-span-1">
                      <button
                        type="button"
                        title="Xóa hạng mục"
                        onClick={() =>
                          setDetails((current) =>
                            current.filter((entry) => entry.key !== row.key),
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-slate-900">Tổng kết phiếu</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Tiền phụ tùng / dịch vụ</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {money(subtotal)}
              </p>
            </div>

            <label className={labelClass}>
              Tiền công (VNĐ)
              <input
                className={fieldClass}
                type="number"
                min="0"
                step="1000"
                value={laborCost}
                onChange={(event) => setLaborCost(event.target.value)}
              />
            </label>

            <label className={labelClass}>
              Giảm giá (VNĐ)
              <input
                className={fieldClass}
                type="number"
                min="0"
                step="1000"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-5">
            <div>
              <p className="text-sm text-slate-500">Tổng tiền dự kiến</p>
              <p className="mt-1 text-3xl font-bold text-red-600">
                {money(total)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Phiếu tạo mới ở trạng thái DRAFT; chưa trừ kho.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving || loadingData || Boolean(createdOrder)}
              className="inline-flex min-w-52 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <ClipboardPlus className="size-5" />
              )}
              {saving ? "Đang lưu phiếu..." : "Tiếp nhận xe và tạo phiếu"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}

export default QuickReceptionPage;