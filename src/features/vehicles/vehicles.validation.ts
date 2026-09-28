import type {
  VehicleFormData,
  VehicleValidationResult,
} from "./vehicles.types";

export function validateVehicle(
  input: VehicleFormData,
): VehicleValidationResult {
  const errors: VehicleValidationResult["errors"] = {};

  const licensePlate = input.license_plate.trim();
  const carModel = input.car_model.trim();
  const customerId = input.customer_id.trim();

  if (!licensePlate) {
    errors.license_plate =
      "Vui lòng nhập biển số xe.";
  } else if (licensePlate.length > 50) {
    errors.license_plate =
      "Biển số xe không được vượt quá 50 ký tự.";
  }

  if (!carModel) {
    errors.car_model =
      "Vui lòng nhập dòng xe.";
  } else if (carModel.length > 200) {
    errors.car_model =
      "Dòng xe không được vượt quá 200 ký tự.";
  }

  if (!customerId) {
    errors.customer_id =
      "Vui lòng chọn khách hàng.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}