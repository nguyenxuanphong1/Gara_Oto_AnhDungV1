import {
  Printer,
  X,
} from "lucide-react";

import type {
  RepairOrderWithRelations,
} from "../repair-orders.types";

import RepairOrderInvoice from "./RepairOrderInvoice";

interface RepairOrderInvoiceModalProps {
  order: RepairOrderWithRelations;
  onClose: () => void;
}

function RepairOrderInvoiceModal({
  order,
  onClose,
}: RepairOrderInvoiceModalProps) {
  function handlePrint() {
    window.focus();

    setTimeout(() => {
      window.print();
    }, 150);
  }

  return (
    <div className="repair-invoice-modal">
      {/* =====================================================
          THANH XEM TRƯỚC
          CHỈ HIỆN TRÊN MÀN HÌNH
          ===================================================== */}
      <div className="repair-invoice-modal-header no-print">
        <div className="repair-invoice-modal-heading">
          <div className="repair-invoice-modal-title">
            Xem trước hóa đơn A5
          </div>

          <div className="repair-invoice-modal-code">
            {order.order_code}
          </div>
        </div>

        <div className="repair-invoice-modal-actions">
          <button
            type="button"
            onClick={handlePrint}
            className="repair-invoice-print-button"
          >
            <Printer className="h-4 w-4" />
            <span>In A5</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="repair-invoice-close-button"
            aria-label="Đóng"
            title="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* =====================================================
          NỘI DUNG HÓA ĐƠN
          ===================================================== */}
      <div className="repair-invoice-modal-content">
        <RepairOrderInvoice order={order} />
      </div>
    </div>
  );
}

export default RepairOrderInvoiceModal;