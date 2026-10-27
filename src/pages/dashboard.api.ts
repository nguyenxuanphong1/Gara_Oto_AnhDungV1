
import { supabase } from "../lib/supabase";

export interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
}

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
  monthlyRevenue: MonthlyRevenue[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();

  // Sáu tháng gần nhất, tính cả tháng hiện tại.
  const firstMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 5,
    1,
  );

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
    completedRevenueResult,
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

    // Giữ nguyên tổng giá trị tất cả phiếu như Dashboard cũ.
    supabase
      .from("repair_orders")
      .select("total_amount"),

    // Chỉ lấy phiếu hoàn thành để tính doanh thu biểu đồ.
    supabase
      .from("repair_orders")
      .select("total_amount, created_at")
      .eq("status", "COMPLETED")
      .gte("created_at", firstMonth.toISOString())
      .order("created_at", { ascending: true }),
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
    completedRevenueResult,
  ];

  for (const result of results) {
    if (result.error) {
      throw result.error;
    }
  }

  const totalRepairAmount = (
    totalAmountResult.data ?? []
  ).reduce(
    (sum, order) => sum + Number(order.total_amount ?? 0),
    0,
  );

  const revenueRows = completedRevenueResult.data ?? [];

  const monthlyRevenue: MonthlyRevenue[] = [];

  for (let index = 0; index < 6; index++) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - 5 + index,
      1,
    );

    const year = date.getFullYear();
    const monthIndex = date.getMonth();

    const revenue = revenueRows.reduce((sum, order) => {
      const createdAt = new Date(order.created_at);

      if (
        createdAt.getFullYear() === year &&
        createdAt.getMonth() === monthIndex
      ) {
        return sum + Number(order.total_amount ?? 0);
      }

      return sum;
    }, 0);

    monthlyRevenue.push({
      month: `T${monthIndex + 1}`,
      year,
      revenue,
    });
  }

  return {
    customers: customersResult.count ?? 0,
    vehicles: vehiclesResult.count ?? 0,
    repairOrders: repairOrdersResult.count ?? 0,
    inventoryItems: inventoryItemsResult.count ?? 0,
    warehouses: warehousesResult.count ?? 0,
    stockImports: stockImportsResult.count ?? 0,
    draftOrders: draftOrdersResult.count ?? 0,
    completedOrders: completedOrdersResult.count ?? 0,
    cancelledOrders: cancelledOrdersResult.count ?? 0,
    totalRepairAmount,
    monthlyRevenue,
  };
}
