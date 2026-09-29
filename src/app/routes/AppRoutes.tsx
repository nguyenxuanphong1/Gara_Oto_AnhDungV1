import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import LoginPage from "../../features/auth/components/LoginPage";
import DashboardPage from "../../pages/DashboardPage";
import CustomersPage from "../../features/customers/CustomersPage";
import VehiclesPage from "../../features/vehicles/VehiclesPage";
import WarehousesPage from "../../features/warehouses/WarehousesPage";
import InventoryItemsPage from "../../features/inventory/InventoryItemsPage";
import StockImportsPage from "../../features/stock-imports/StockImportsPage";
import RepairOrdersPage from "../../features/repair-orders/RepairOrdersPage";
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
          <Route path="/customers" element={<CustomersPage />} />

          {/* Xe */}
          <Route path="/vehicles" element={<VehiclesPage />} />

          {/* Kho */}
          <Route path="/warehouses" element={<WarehousesPage />} />

          {/* Mặt hàng / phụ tùng */}
          <Route path="/inventory-items" element={<InventoryItemsPage />}/>

          {/* Nhập kho */}
          <Route path="/stock-imports" element={<StockImportsPage/>}/>

          {/* Phiếu sửa chữa */}
          <Route path="/repair-orders" element={<RepairOrdersPage/>}/>
        </Route>
      </Route>

      {/* Route không tồn tại */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;