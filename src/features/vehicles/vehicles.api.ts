import { supabase } from "../../lib/supabase";

import type {
  Vehicle,
  VehicleFormData,
  VehicleWithCustomer,
} from "./vehicles.types";

const VEHICLE_SELECT = `
  id,
  license_plate,
  car_model,
  customer_id,
  created_at,
  customer:customers (
    id,
    name,
    phone
  )
`;

export async function getVehicles(): Promise<
  VehicleWithCustomer[]
> {
  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_SELECT)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    license_plate: item.license_plate,
    car_model: item.car_model,
    customer_id: item.customer_id,
    created_at: item.created_at,
    customer: Array.isArray(item.customer)
        ? item.customer[0] ?? null
        : item.customer ?? null,
    }));
}

export async function getVehicleById(
  id: string,
): Promise<VehicleWithCustomer | null> {
  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_SELECT)
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
    license_plate: data.license_plate,
    car_model: data.car_model,
    customer_id: data.customer_id,
    created_at: data.created_at,
    customer: Array.isArray(data.customer)
      ? data.customer[0] ?? null
      : data.customer ?? null,
  };
}

export async function createVehicle(
  input: VehicleFormData,
): Promise<Vehicle> {
  const payload = {
    license_plate: input.license_plate
      .trim()
      .toUpperCase(),
    car_model: input.car_model.trim(),
    customer_id: input.customer_id,
  };

  const { data, error } = await supabase
    .from("vehicles")
    .insert(payload)
    .select(
      "id, license_plate, car_model, customer_id, created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return data as Vehicle;
}

export async function updateVehicle(
  id: string,
  input: VehicleFormData,
): Promise<Vehicle> {
  const payload = {
    license_plate: input.license_plate
      .trim()
      .toUpperCase(),
    car_model: input.car_model.trim(),
    customer_id: input.customer_id,
  };

  const { data, error } = await supabase
    .from("vehicles")
    .update(payload)
    .eq("id", id)
    .select(
      "id, license_plate, car_model, customer_id, created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return data as Vehicle;
}

export async function deleteVehicle(
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}