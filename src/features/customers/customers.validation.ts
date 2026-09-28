import type {
  CustomerFormData,
  CustomerValidationResult,
} from "./customers.types";

export function validateCustomer(
  input: CustomerFormData,
): CustomerValidationResult {
  const errors: CustomerValidationResult["errors"] = {};

  const name = input.name.trim();
  const phone = input.phone.trim();
  const address = input.address.trim();

  if (!name) {
    errors.name = "Vui lòng nhập tên khách hàng.";
  } else if (name.length > 200) {
    errors.name = "Tên khách hàng không được vượt quá 200 ký tự.";
  }

  if (!phone) {
    errors.phone = "Vui lòng nhập số điện thoại.";
  } else {
    const digits = phone.replace(/\D/g, "");

    if (digits.length < 9) {
      errors.phone = "Số điện thoại phải có ít nhất 9 chữ số.";
    } else if (digits.length > 15) {
      errors.phone = "Số điện thoại không được vượt quá 15 chữ số.";
    }
  }

  if (address.length > 500) {
    errors.address = "Địa chỉ không được vượt quá 500 ký tự.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}