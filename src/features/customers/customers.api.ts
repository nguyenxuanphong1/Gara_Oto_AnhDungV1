import { supabase } from "../../lib/supabase";

import type {
  Customer,
  CustomerFormData,
} from "./customers.types";

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, address, created_at")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Customer[];
}

export async function getCustomerById(
  id: string,
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, address, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Customer | null;
}

export async function createCustomer(
  input: CustomerFormData,
): Promise<Customer> {
  const payload = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    address: input.address.trim() || null,
  };

  const { data, error } = await supabase
    .from("customers")
    .insert(payload)
    .select("id, name, phone, address, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as Customer;
}

export async function updateCustomer(
  id: string,
  input: CustomerFormData,
): Promise<Customer> {
  const payload = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    address: input.address.trim() || null,
  };

  const { data, error } = await supabase
    .from("customers")
    .update(payload)
    .eq("id", id)
    .select("id, name, phone, address, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as Customer;
}

export async function deleteCustomer(
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}