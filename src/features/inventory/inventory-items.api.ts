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

  return {
    id: data.id,
    code: data.code,
    name: data.name,
    item_type: data.item_type,
    unit: data.unit,
    sell_price: data.sell_price,
    stock_quantity: data.stock_quantity,
    created_at: data.created_at,
  };
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

  return {
    id: data.id,
    code: data.code,
    name: data.name,
    item_type: data.item_type,
    unit: data.unit,
    sell_price: data.sell_price,
    stock_quantity: data.stock_quantity,
    created_at: data.created_at,
  };
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

  return {
    id: data.id,
    code: data.code,
    name: data.name,
    item_type: data.item_type,
    unit: data.unit,
    sell_price: data.sell_price,
    stock_quantity: data.stock_quantity,
    created_at: data.created_at,
  };
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