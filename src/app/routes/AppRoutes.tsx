import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import LoginPage from "../../features/auth/components/LoginPage";
import DashboardPage from "../../features/dashboard/DashboardPage";
import CustomersPage from "../../features/customers/CustomersPage";
import VehiclesPage from "../../features/vehicles/VehiclesPage";
import PlaceholderPage from "../../pages/PlaceholderPage";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Trang đăng nhập */}
      <Route path="/login" element={<LoginPage />} />

      {/* Toàn bộ khu vực yêu cầu đăng nhập */}
      <Route element={<ProtectedRoute />}>
        {/* Layout chung */}
        <Route element={<AppLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<DashboardPage />} />

          {/* Khách hàng */}
          <Route path="/customers" element={<CustomersPage />}/>

          {/* Xe */}
          <Route path="/vehicles" element={<VehiclesPage />}/>

          {/* Kho phụ tùng */}
          <Route
            path="/inventory"
            element={
              <PlaceholderPage
                title="Kho phụ tùng"
                description="Quản lý dữ liệu từ bảng inventory_items."
              />
            }
          />

          {/* Kho hàng */}
          <Route
            path="/warehouses"
            element={
              <PlaceholderPage
                title="Kho hàng"
                description="Quản lý dữ liệu từ bảng warehouses."
              />
            }
          />

          {/* Nhập kho */}
          <Route
            path="/stock-imports"
            element={
              <PlaceholderPage
                title="Nhập kho"
                description="Quản lý dữ liệu từ bảng stock_imports."
              />
            }
          />

          {/* Phiếu sửa chữa */}
          <Route
            path="/repair-orders"
            element={
              <PlaceholderPage
                title="Phiếu sửa chữa"
                description="Quản lý dữ liệu từ bảng repair_orders và repair_order_details."
              />
            }
          />
        </Route>
      </Route>

      {/* Route không tồn tại */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;