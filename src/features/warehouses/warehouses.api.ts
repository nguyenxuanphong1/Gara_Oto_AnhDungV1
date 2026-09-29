import { supabase } from "../../lib/supabase";

import type {
  Warehouse,
  WarehouseFormData,
} from "./warehouses.types";

const WAREHOUSE_SELECT = `
  id,
  code,
  name,
  created_at
`;

export async function getWarehouses(): Promise<Warehouse[]> {
  const { data, error } = await supabase
    .from("warehouses")
    .select(WAREHOUSE_SELECT)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Warehouse[];
}

export async function getWarehouseById(
  id: string,
): Promise<Warehouse | null> {
  const { data, error } = await supabase
    .from("warehouses")
    .select(WAREHOUSE_SELECT)
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
    created_at: data.created_at,
  };
}

export async function createWarehouse(
  input: WarehouseFormData,
): Promise<Warehouse> {
  const payload = {
    name: input.name.trim(),
  };

  const { data, error } = await supabase
    .from("warehouses")
    .insert(payload)
    .select(WAREHOUSE_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    code: data.code,
    name: data.name,
    created_at: data.created_at,
  };
}

export async function updateWarehouse(
  id: string,
  input: WarehouseFormData,
): Promise<Warehouse> {
  const payload = {
    name: input.name.trim(),
  };

  const { data, error } = await supabase
    .from("warehouses")
    .update(payload)
    .eq("id", id)
    .select(WAREHOUSE_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    code: data.code,
    name: data.name,
    created_at: data.created_at,
  };
}

export async function deleteWarehouse(
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("warehouses")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}