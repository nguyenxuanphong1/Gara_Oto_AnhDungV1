
import { supabase } from "../../lib/supabase";

import type {
  InventoryItem,
  InventoryItemFormData,
} from "./inventory-items.types";

const INVENTORY_ITEM_SELECT = `
  id,
  code,
  name,
  item_type,
  unit,
  sell_price,
  stock_quantity,
  created_at
`;

export async function getInventoryItems(): Promise<
  InventoryItem[]
> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select(INVENTORY_ITEM_SELECT)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as InventoryItem[];
}

export async function getInventoryItemById(
  id: string,
): Promise<InventoryItem | null> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select(INVENTORY_ITEM_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return data as InventoryItem;
}

export async function createInventoryItem(
  input: InventoryItemFormData,
): Promise<InventoryItem> {
  const payload = {
    name: input.name.trim(),
    item_type: input.item_type,
    unit: input.unit.trim(),
    sell_price: input.sell_price,
  };

  const { data, error } = await supabase
    .from("inventory_items")
    .insert(payload)
    .select(INVENTORY_ITEM_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data as InventoryItem;
}

export async function updateInventoryItem(
  id: string,
  input: InventoryItemFormData,
): Promise<InventoryItem> {
  const payload = {
    name: input.name.trim(),
    item_type: input.item_type,
    unit: input.unit.trim(),
    sell_price: input.sell_price,
  };

  const { data, error } = await supabase
    .from("inventory_items")
    .update(payload)
    .eq("id", id)
    .select(INVENTORY_ITEM_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data as InventoryItem;
}

/**
 * Nhập nhiều mặt hàng cùng lúc.
 * Mã, ID, tồn kho và ngày tạo do database xử lý.
 */
export async function importInventoryItems(
  inputs: InventoryItemFormData[],
): Promise<InventoryItem[]> {
  if (inputs.length === 0) {
    return [];
  }

  const payload = inputs.map((input) => ({
    name: input.name.trim(),
    item_type: input.item_type,
    unit: input.unit.trim(),
    sell_price: input.sell_price,
  }));

  // Chia lô để tránh gửi một request quá lớn.
  const batchSize = 200;
  const importedItems: InventoryItem[] = [];

  for (
    let start = 0;
    start < payload.length;
    start += batchSize
  ) {
    const batch = payload.slice(
      start,
      start + batchSize,
    );

    const { data, error } = await supabase
      .from("inventory_items")
      .insert(batch)
      .select(INVENTORY_ITEM_SELECT);

    if (error) {
      throw new Error(
        `Lỗi khi nhập nhóm mặt hàng từ dòng ${
          start + 1
        } đến ${
          start + batch.length
        }: ${error.message}`,
      );
    }

    importedItems.push(
      ...((data ?? []) as InventoryItem[]),
    );
  }

  return importedItems;
}

export async function deleteInventoryItem(
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
