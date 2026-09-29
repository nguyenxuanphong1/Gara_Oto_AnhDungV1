import { supabase } from "../../lib/supabase";

import type {
  RepairOrder,
  RepairOrderDetail,
  RepairOrderDetailFormData,
  RepairOrderFormData,
  RepairOrderStatus,
  RepairOrderWithRelations,
} from "./repair-orders.types";

/* =========================================================
   TYPES
   ========================================================= */

interface VehicleRelation {
  id: string;
  license_plate: string;
  car_model: string;
  customer_id: string;
  customer:
    | {
        id: string;
        name: string;
        phone: string;
      }
    | {
        id: string;
        name: string;
        phone: string;
      }[]
    | null;
}

interface WarehouseRelation {
  id: string;
  code: string;
  name: string;
}

interface InventoryItemRelation {
  id: string;
  code: string;
  name: string;
  item_type: "PART" | "SERVICE";
  unit: string;
}

interface RepairOrderDetailRelation
  extends RepairOrderDetail {
  item:
    | InventoryItemRelation
    | InventoryItemRelation[]
    | null;
}

interface RepairOrderQueryRow {
  id: string;
  order_code: string;
  vehicle_id: string;
  warehouse_id: string | null;
  odometer_km: number;
  labor_cost: number;
  discount: number;
  total_amount: number;
  status: RepairOrderStatus;
  created_at: string;

  vehicle:
    | VehicleRelation
    | VehicleRelation[]
    | null;

  warehouse:
    | WarehouseRelation
    | WarehouseRelation[]
    | null;

  details:
    | RepairOrderDetailRelation[]
    | null;
}

interface RepairOrderMutationRow {
  id: string;
  order_code: string;
  vehicle_id: string;
  warehouse_id: string | null;
  odometer_km: number;
  labor_cost: number;
  discount: number;
  total_amount: number;
  status: RepairOrderStatus;
  created_at: string;
}

interface RepairOrderDetailMutationRow {
  id: string;
  repair_order_id: string;
  item_id: string;
  quantity: number;
  price: number;
  amount: number | null;
}

/* =========================================================
   HELPERS
   ========================================================= */

function normalizeRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function mapRepairOrder(
  data: RepairOrderMutationRow,
): RepairOrder {
  return {
    id: data.id,
    order_code: data.order_code,
    vehicle_id: data.vehicle_id,
    warehouse_id: data.warehouse_id,
    odometer_km: data.odometer_km,
    labor_cost: Number(data.labor_cost),
    discount: Number(data.discount),
    total_amount: Number(data.total_amount),
    status: data.status,
    created_at: data.created_at,
  };
}

function mapRepairOrderDetail(
  data: RepairOrderDetailMutationRow,
): RepairOrderDetail {
  return {
    id: data.id,
    repair_order_id: data.repair_order_id,
    item_id: data.item_id,
    quantity: data.quantity,
    price: Number(data.price),
    amount: Number(data.amount ?? 0),
  };
}

function mapRepairOrderWithRelations(
  row: RepairOrderQueryRow,
): RepairOrderWithRelations {
  const vehicle = normalizeRelation(
    row.vehicle,
  );

  const warehouse = normalizeRelation(
    row.warehouse,
  );

  const customer = vehicle
    ? normalizeRelation(vehicle.customer)
    : null;

  const details = Array.isArray(row.details)
    ? row.details.map((detail) => ({
        id: detail.id,
        repair_order_id:
          detail.repair_order_id,
        item_id: detail.item_id,
        quantity: detail.quantity,
        price: Number(detail.price),
        amount: Number(detail.amount ?? 0),
        item: normalizeRelation(
          detail.item,
        ),
      }))
    : [];

  return {
    id: row.id,
    order_code: row.order_code,
    vehicle_id: row.vehicle_id,
    warehouse_id: row.warehouse_id,
    odometer_km: row.odometer_km,
    labor_cost: Number(row.labor_cost),
    discount: Number(row.discount),
    total_amount: Number(row.total_amount),
    status: row.status,
    created_at: row.created_at,

    vehicle: vehicle
      ? {
          id: vehicle.id,
          license_plate:
            vehicle.license_plate,
          car_model: vehicle.car_model,
          customer_id: vehicle.customer_id,
          customer,
        }
      : null,

    warehouse,

    details,
  };
}

/* =========================================================
   SELECT
   ========================================================= */

const REPAIR_ORDER_SELECT = `
  id,
  order_code,
  vehicle_id,
  warehouse_id,
  odometer_km,
  labor_cost,
  discount,
  total_amount,
  status,
  created_at,

  vehicle:vehicles (
    id,
    license_plate,
    car_model,
    customer_id,

    customer:customers (
      id,
      name,
      phone
    )
  ),

  warehouse:warehouses (
    id,
    code,
    name
  ),

  details:repair_order_details (
    id,
    repair_order_id,
    item_id,
    quantity,
    price,
    amount,

    item:inventory_items (
      id,
      code,
      name,
      item_type,
      unit
    )
  )
`;

/* =========================================================
   GET LIST
   ========================================================= */

export async function getRepairOrders(): Promise<
  RepairOrderWithRelations[]
> {
  const { data, error } = await supabase
    .from("repair_orders")
    .select(REPAIR_ORDER_SELECT)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Không thể tải danh sách phiếu sửa chữa: ${error.message}`,
    );
  }

  if (!data) {
    return [];
  }

  return data.map((row) =>
    mapRepairOrderWithRelations(
      row as unknown as RepairOrderQueryRow,
    ),
  );
}

/* =========================================================
   GET ONE
   ========================================================= */

export async function getRepairOrderById(
  id: string,
): Promise<RepairOrderWithRelations | null> {
  const { data, error } = await supabase
    .from("repair_orders")
    .select(REPAIR_ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Không thể tải phiếu sửa chữa: ${error.message}`,
    );
  }

  if (!data) {
    return null;
  }

  return mapRepairOrderWithRelations(
    data as unknown as RepairOrderQueryRow,
  );
}

/* =========================================================
   CREATE HEADER
   ========================================================= */

export async function createRepairOrder(
  input: RepairOrderFormData,
): Promise<RepairOrder> {
  const payload = {
    vehicle_id: input.vehicle_id.trim(),
    warehouse_id:
      input.warehouse_id?.trim() || null,
    odometer_km: input.odometer_km,
    labor_cost: input.labor_cost,
    discount: input.discount,
    status: input.status,
  };

  const { data, error } = await supabase
    .from("repair_orders")
    .insert(payload)
    .select(
      `
        id,
        order_code,
        vehicle_id,
        warehouse_id,
        odometer_km,
        labor_cost,
        discount,
        total_amount,
        status,
        created_at
      `,
    )
    .single();

  if (error) {
    throw new Error(
      `Không thể tạo phiếu sửa chữa: ${error.message}`,
    );
  }

  return mapRepairOrder(
    data as unknown as RepairOrderMutationRow,
  );
}

/* =========================================================
   UPDATE HEADER
   ========================================================= */

export async function updateRepairOrder(
  id: string,
  input: RepairOrderFormData,
): Promise<RepairOrder> {
  const payload = {
    vehicle_id: input.vehicle_id.trim(),
    warehouse_id:
      input.warehouse_id?.trim() || null,
    odometer_km: input.odometer_km,
    labor_cost: input.labor_cost,
    discount: input.discount,
    status: input.status,
  };

  const { data, error } = await supabase
    .from("repair_orders")
    .update(payload)
    .eq("id", id)
    .select(
      `
        id,
        order_code,
        vehicle_id,
        warehouse_id,
        odometer_km,
        labor_cost,
        discount,
        total_amount,
        status,
        created_at
      `,
    )
    .single();

  if (error) {
    throw new Error(
      `Không thể cập nhật phiếu sửa chữa: ${error.message}`,
    );
  }

  return mapRepairOrder(
    data as unknown as RepairOrderMutationRow,
  );
}

/* =========================================================
   UPDATE STATUS
   ========================================================= */

export async function updateRepairOrderStatus(
  id: string,
  status: RepairOrderStatus,
): Promise<RepairOrder> {
  const { data, error } = await supabase
    .from("repair_orders")
    .update({
      status,
    })
    .eq("id", id)
    .select(
      `
        id,
        order_code,
        vehicle_id,
        warehouse_id,
        odometer_km,
        labor_cost,
        discount,
        total_amount,
        status,
        created_at
      `,
    )
    .single();

  if (error) {
    throw new Error(
      `Không thể cập nhật trạng thái phiếu: ${error.message}`,
    );
  }

  return mapRepairOrder(
    data as unknown as RepairOrderMutationRow,
  );
}

/* =========================================================
   DELETE ORDER
   ========================================================= */

export async function deleteRepairOrder(
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("repair_orders")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(
      `Không thể xóa phiếu sửa chữa: ${error.message}`,
    );
  }
}

/* =========================================================
   CREATE DETAIL
   ========================================================= */

export async function createRepairOrderDetail(
  repairOrderId: string,
  input: RepairOrderDetailFormData,
): Promise<RepairOrderDetail> {
  const payload = {
    repair_order_id: repairOrderId,
    item_id: input.item_id.trim(),
    quantity: input.quantity,
    price: input.price,
  };

  const { data, error } = await supabase
    .from("repair_order_details")
    .insert(payload)
    .select(
      `
        id,
        repair_order_id,
        item_id,
        quantity,
        price,
        amount
      `,
    )
    .single();

  if (error) {
    throw new Error(
      `Không thể thêm chi tiết phiếu: ${error.message}`,
    );
  }

  return mapRepairOrderDetail(
    data as unknown as RepairOrderDetailMutationRow,
  );
}

/* =========================================================
   CREATE MULTIPLE DETAILS
   ========================================================= */

export async function createRepairOrderDetails(
  repairOrderId: string,
  details: RepairOrderDetailFormData[],
): Promise<RepairOrderDetail[]> {
  if (details.length === 0) {
    return [];
  }

  const payload = details.map(
    (detail) => ({
      repair_order_id: repairOrderId,
      item_id: detail.item_id.trim(),
      quantity: detail.quantity,
      price: detail.price,
    }),
  );

  const { data, error } = await supabase
    .from("repair_order_details")
    .insert(payload)
    .select(
      `
        id,
        repair_order_id,
        item_id,
        quantity,
        price,
        amount
      `,
    );

  if (error) {
    throw new Error(
      `Không thể thêm chi tiết phiếu: ${error.message}`,
    );
  }

  if (!data) {
    return [];
  }

  return data.map((detail) =>
    mapRepairOrderDetail(
      detail as unknown as RepairOrderDetailMutationRow,
    ),
  );
}

/* =========================================================
   UPDATE DETAIL
   ========================================================= */

export async function updateRepairOrderDetail(
  id: string,
  input: RepairOrderDetailFormData,
): Promise<RepairOrderDetail> {
  const payload = {
    item_id: input.item_id.trim(),
    quantity: input.quantity,
    price: input.price,
  };

  const { data, error } = await supabase
    .from("repair_order_details")
    .update(payload)
    .eq("id", id)
    .select(
      `
        id,
        repair_order_id,
        item_id,
        quantity,
        price,
        amount
      `,
    )
    .single();

  if (error) {
    throw new Error(
      `Không thể cập nhật chi tiết phiếu: ${error.message}`,
    );
  }

  return mapRepairOrderDetail(
    data as unknown as RepairOrderDetailMutationRow,
  );
}

/* =========================================================
   DELETE DETAIL
   ========================================================= */

export async function deleteRepairOrderDetail(
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("repair_order_details")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(
      `Không thể xóa chi tiết phiếu: ${error.message}`,
    );
  }
}

/* =========================================================
   CREATE COMPLETE ORDER
   ========================================================= */

export async function createCompleteRepairOrder(
  input: RepairOrderFormData,
  details: RepairOrderDetailFormData[],
): Promise<RepairOrderWithRelations> {
  const order =
    await createRepairOrder(input);

  try {
    await createRepairOrderDetails(
      order.id,
      details,
    );
  } catch (error) {
    /*
     * Không tự rollback bằng DELETE ở đây.
     *
     * Việc rollback nhiều thao tác INSERT phải
     * được xử lý bằng PostgreSQL transaction/RPC
     * nếu database yêu cầu tính nguyên tử.
     */
    throw error;
  }

  const result =
    await getRepairOrderById(order.id);

  if (!result) {
    throw new Error(
      "Không thể tải lại phiếu sửa chữa vừa tạo.",
    );
  }

  return result;
}

/* =========================================================
   REPLACE DETAILS
   ========================================================= */

export async function replaceRepairOrderDetails(
  repairOrderId: string,
  details: RepairOrderDetailFormData[],
): Promise<RepairOrderWithRelations> {
  const currentOrder =
    await getRepairOrderById(
      repairOrderId,
    );

  if (!currentOrder) {
    throw new Error(
      "Không tìm thấy phiếu sửa chữa.",
    );
  }

  if (
    currentOrder.status ===
    "COMPLETED"
  ) {
    throw new Error(
      "Không được sửa chi tiết của phiếu đã hoàn thành.",
    );
  }

  for (const detail of currentOrder.details) {
    await deleteRepairOrderDetail(
      detail.id,
    );
  }

  if (details.length > 0) {
    await createRepairOrderDetails(
      repairOrderId,
      details,
    );
  }

  const result =
    await getRepairOrderById(
      repairOrderId,
    );

  if (!result) {
    throw new Error(
      "Không thể tải lại phiếu sửa chữa.",
    );
  }

  return result;
}

/* =========================================================
   COMPLETE ORDER
   ========================================================= */

export async function completeRepairOrder(
  id: string,
): Promise<RepairOrderWithRelations> {
  /*
   * Không tự trừ tồn kho ở frontend.
   *
   * Khi status chuyển sang COMPLETED,
   * database trigger process_repair_completion()
   * chịu trách nhiệm:
   *
   * 1. Kiểm tra tồn kho PART.
   * 2. Báo lỗi nếu không đủ.
   * 3. Trừ tồn kho PART.
   * 4. SERVICE không bị trừ kho.
   */

  const { data, error } = await supabase
    .from("repair_orders")
    .update({
      status: "COMPLETED",
    })
    .eq("id", id)
    .select(
      `
        id,
        order_code,
        vehicle_id,
        warehouse_id,
        odometer_km,
        labor_cost,
        discount,
        total_amount,
        status,
        created_at
      `,
    )
    .single();

  if (error) {
    throw new Error(
      `Không thể hoàn thành phiếu sửa chữa: ${error.message}`,
    );
  }

  const result =
    await getRepairOrderById(data.id);

  if (!result) {
    throw new Error(
      "Không thể tải lại phiếu sửa chữa sau khi hoàn thành.",
    );
  }

  return result;
}

/* =========================================================
   CANCEL ORDER
   ========================================================= */

export async function cancelRepairOrder(
  id: string,
): Promise<RepairOrderWithRelations> {
  const { data, error } = await supabase
    .from("repair_orders")
    .update({
      status: "CANCELLED",
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    throw new Error(
      `Không thể hủy phiếu sửa chữa: ${error.message}`,
    );
  }

  const result =
    await getRepairOrderById(data.id);

  if (!result) {
    throw new Error(
      "Không thể tải lại phiếu sửa chữa sau khi hủy.",
    );
  }

  return result;
}