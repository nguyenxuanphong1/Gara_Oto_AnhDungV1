import { supabase } from "../lib/supabase";

export interface DashboardStats {
  customers: number;
  vehicles: number;
  repairOrders: number;
  inventoryItems: number;
  warehouses: number;
  stockImports: number;
  draftOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRepairAmount: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    customersResult,
    vehiclesResult,
    repairOrdersResult,
    inventoryItemsResult,
    warehousesResult,
    stockImportsResult,
    draftOrdersResult,
    completedOrdersResult,
    cancelledOrdersResult,
    totalAmountResult,
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("repair_orders")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("inventory_items")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("warehouses")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("stock_imports")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("repair_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "DRAFT"),

    supabase
      .from("repair_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "COMPLETED"),

    supabase
      .from("repair_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "CANCELLED"),

    supabase
      .from("repair_orders")
      .select("total_amount"),
  ]);

  const results = [
    customersResult,
    vehiclesResult,
    repairOrdersResult,
    inventoryItemsResult,
    warehousesResult,
    stockImportsResult,
    draftOrdersResult,
    completedOrdersResult,
    cancelledOrdersResult,
    totalAmountResult,
  ];

  for (const result of results) {
    if (result.error) {
      throw result.error;
    }
  }

  const totalRepairAmount =
    (totalAmountResult.data ?? []).reduce(
      (sum, order) =>
        sum + Number(order.total_amount ?? 0),
      0,
    );

  return {
    customers: customersResult.count ?? 0,
    vehicles: vehiclesResult.count ?? 0,
    repairOrders: repairOrdersResult.count ?? 0,
    inventoryItems: inventoryItemsResult.count ?? 0,
    warehouses: warehousesResult.count ?? 0,
    stockImports: stockImportsResult.count ?? 0,
    draftOrders: draftOrdersResult.count ?? 0,
    completedOrders:
      completedOrdersResult.count ?? 0,
    cancelledOrders:
      cancelledOrdersResult.count ?? 0,
    totalRepairAmount,
  };
}