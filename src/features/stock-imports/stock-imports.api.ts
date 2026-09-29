import { supabase } from "../../lib/supabase";

import type {
  StockImport,
  StockImportFormData,
  StockImportWithRelations,
} from "./stock-imports.types";

interface InventoryItemForImport {
  id: string;
  code: string;
  name: string;
  item_type: "PART" | "SERVICE";
  unit: string;
  sell_price: number;
  stock_quantity: number;
}

interface WarehouseForImport {
  id: string;
  code: string;
  name: string;
}

const STOCK_IMPORT_SELECT = `
  id,
  import_code,
  item_id,
  warehouse_id,
  quantity,
  import_price,
  created_at,
  item:inventory_items (
    id,
    code,
    name,
    item_type,
    unit
  ),
  warehouse:warehouses (
    id,
    code,
    name
  )
`;

function mapStockImport(
  data: {
    id: string;
    import_code: string;
    item_id: string;
    warehouse_id: string | null;
    quantity: number;
    import_price: number;
    created_at: string;
    item:
      | {
          id: string;
          code: string;
          name: string;
          item_type: "PART" | "SERVICE";
          unit: string;
        }
      | {
          id: string;
          code: string;
          name: string;
          item_type: "PART" | "SERVICE";
          unit: string;
        }[]
      | null;
    warehouse:
      | {
          id: string;
          code: string;
          name: string;
        }
      | {
          id: string;
          code: string;
          name: string;
        }[]
      | null;
  },
): StockImportWithRelations {
  return {
    id: data.id,
    import_code: data.import_code,
    item_id: data.item_id,
    warehouse_id: data.warehouse_id,
    quantity: data.quantity,
    import_price: data.import_price,
    created_at: data.created_at,

    item: Array.isArray(data.item)
      ? data.item[0] ?? null
      : data.item,

    warehouse: Array.isArray(data.warehouse)
      ? data.warehouse[0] ?? null
      : data.warehouse,
  };
}

export async function getStockImports(): Promise<
  StockImportWithRelations[]
> {
  const { data, error } = await supabase
    .from("stock_imports")
    .select(STOCK_IMPORT_SELECT)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) =>
    mapStockImport(item),
  );
}

export async function getStockImportById(
  id: string,
): Promise<StockImportWithRelations | null> {
  const { data, error } = await supabase
    .from("stock_imports")
    .select(STOCK_IMPORT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapStockImport(data);
}

export async function createStockImport(
  input: StockImportFormData,
): Promise<StockImport> {
  const payload = {
    item_id: input.item_id.trim(),
    warehouse_id:
      input.warehouse_id?.trim() || null,
    quantity: input.quantity,
    import_price: input.import_price,
  };

  const { data, error } = await supabase
    .from("stock_imports")
    .insert(payload)
    .select(
      `
        id,
        import_code,
        item_id,
        warehouse_id,
        quantity,
        import_price,
        created_at
      `,
    )
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    import_code: data.import_code,
    item_id: data.item_id,
    warehouse_id: data.warehouse_id,
    quantity: data.quantity,
    import_price: data.import_price,
    created_at: data.created_at,
  };
}

export async function getInventoryItemsForImport(): Promise<
  InventoryItemForImport[]
> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select(
      `
        id,
        code,
        name,
        item_type,
        unit,
        sell_price,
        stock_quantity
      `,
    )
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getWarehousesForImport(): Promise<
  WarehouseForImport[]
> {
  const { data, error } = await supabase
    .from("warehouses")
    .select(
      `
        id,
        code,
        name
      `,
    )
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}