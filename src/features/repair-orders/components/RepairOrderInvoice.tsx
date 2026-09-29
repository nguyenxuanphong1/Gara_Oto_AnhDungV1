import {
  AlertTriangle,
} from "lucide-react";

import logo from "../../../assets/image.png";

import type {
  RepairOrderWithRelations,
} from "../repair-orders.types";

import "./RepairOrderInvoice.css";

/* =========================================================
   SỐ DÒNG CỐ ĐỊNH TRÊN HÓA ĐƠN
   ========================================================= */

const TOTAL_INVOICE_ROWS = 12;

/* =========================================================
   KIỂU DỮ LIỆU DÙNG RIÊNG CHO HÓA ĐƠN
   Không thay đổi database.
   Chỉ giúp xử lý an toàn relation Supabase.
   ========================================================= */

interface InvoiceCustomer {
  name?: string | null;
  phone?: string | null;
}

interface InvoiceVehicle {
  license_plate?: string | null;
  car_model?: string | null;
  customer?:
    | InvoiceCustomer
    | InvoiceCustomer[]
    | null;
}

interface InvoiceItem {
  name?: string | null;
  code?: string | null;
}

interface InvoiceDetail {
  id: string;
  quantity: number;
  price: number;
  amount?: number | null;
  item?:
    | InvoiceItem
    | InvoiceItem[]
    | null;
}

/* =========================================================
   FORMAT TIỀN
   ========================================================= */

function formatCurrency(
  value: number | null | undefined,
): string {
  const numberValue =
    Number(value) || 0;

  return new Intl.NumberFormat(
    "vi-VN",
  ).format(
    Math.round(numberValue),
  );
}

/* =========================================================
   COMPONENT
   ========================================================= */

function RepairOrderInvoice({
  order,
}: {
  order: RepairOrderWithRelations;
}) {
  /*
   * Dùng cast riêng cho relation.
   * Không thay đổi type database.
   *
   * Điều này giúp tránh lỗi khi Supabase trả relation
   * customer/item dưới dạng object hoặc array.
   */
  const invoiceOrder =
    order as unknown as {
      vehicle?: InvoiceVehicle | null;
      details?: InvoiceDetail[] | null;
    };

  /* =======================================================
     VEHICLE
     ======================================================= */

  const vehicle =
    invoiceOrder.vehicle ?? null;

  /* =======================================================
     CUSTOMER
     ======================================================= */

  const rawCustomer =
    vehicle?.customer ?? null;

  const customer =
    Array.isArray(rawCustomer)
      ? rawCustomer[0] ?? null
      : rawCustomer;

  /* =======================================================
     DETAILS
     ======================================================= */

  const allDetails =
    invoiceOrder.details ?? [];

  /*
   * Mẫu hóa đơn có 12 dòng.
   *
   * Không làm mất dữ liệu trong database.
   * Chỉ giới hạn số dòng HIỂN THỊ trên mẫu A5.
   */
  const visibleDetails =
    allDetails.slice(
      0,
      TOTAL_INVOICE_ROWS,
    );

  const emptyRows =
    Math.max(
      0,
      TOTAL_INVOICE_ROWS -
        visibleDetails.length,
    );

  return (
    <div className="repair-invoice-page">
      {/* ===================================================
          KHỔ GIẤY A5
          =================================================== */}
      <div className="repair-invoice-paper">

        {/* =================================================
            MÃ ĐẦU HÓA ĐƠN
            ================================================= */}
        <div className="repair-invoice-top-code">
          MK 0336755867/8/10/9/IST.2L
        </div>

        {/* =================================================
            KHUNG CHÍNH
            ================================================= */}
        <div className="repair-invoice-main-border">

          {/* =================================================
              WATERMARK
              ================================================= */}
          <div
            className="repair-invoice-watermark"
            style={{
              backgroundImage:
                `url(${logo})`,
            }}
            aria-hidden="true"
          />

          {/* =================================================
              DÒNG ĐẦU KHUNG
              ================================================= */}
          <div className="repair-invoice-top-divider" />

          {/* =================================================
              HEADER GARA
              ================================================= */}
          <div className="repair-invoice-company-header">

            {/* LOGO */}
            <div className="repair-invoice-logo-container">
              <img
                src={logo}
                alt="ANH DŨNG AUTO"
                className="repair-invoice-logo"
              />
            </div>

            {/* THÔNG TIN */}
            <div className="repair-invoice-company-info">

              <div className="repair-invoice-company-title">
                TRUNG TÂM CHĂM SÓC, SỬA CHỮA VÀ BẢO DƯỠNG XE CHUYÊN NGHIỆP
              </div>

              <div className="repair-invoice-company-name">
                ANH DŨNG AUTO
              </div>

              <div className="repair-invoice-company-line">
                CHUYÊN SỬA CHỮA - BẢO DƯỠNG ĐỊNH KÌ
              </div>

              <div className="repair-invoice-company-line">
                MÁY - GẦM - ĐIỆN - ĐIỀU HÒA - CHẨN ĐOÁN
              </div>

              <div className="repair-invoice-company-line">
                SĐT: 0868 894 904 - 0336755867
              </div>

              <div className="repair-invoice-company-line">
                ĐC: Chi Long, Yên Phong, Bắc Ninh
              </div>

            </div>
          </div>

          {/* =================================================
              TIÊU ĐỀ PHIẾU
              ================================================= */}
          <div className="repair-invoice-document-title">
            HÓA ĐƠN SỬA CHỮA - BẢO DƯỠNG
          </div>

          {/* =================================================
              THÔNG TIN KHÁCH HÀNG
              ================================================= */}
          <div className="repair-invoice-customer-info">

            {/* DÒNG 1 */}
            <div className="repair-invoice-info-row">

              <div className="repair-invoice-info-block repair-invoice-info-customer">
                <span className="repair-invoice-info-label">
                  Tên khách hàng:
                </span>

                <span className="repair-invoice-dotted">
                  {customer?.name ?? ""}
                </span>
              </div>

              <div className="repair-invoice-info-block repair-invoice-info-phone">
                <span className="repair-invoice-info-label">
                  SĐT:
                </span>

                <span className="repair-invoice-dotted">
                  {customer?.phone ?? ""}
                </span>
              </div>

            </div>

            {/* DÒNG 2 */}
            <div className="repair-invoice-info-row">

              <div className="repair-invoice-info-block repair-invoice-info-license">
                <span className="repair-invoice-info-label">
                  Biển số xe:
                </span>

                <span className="repair-invoice-dotted">
                  {vehicle?.license_plate ?? ""}
                </span>
              </div>

              <div className="repair-invoice-info-block repair-invoice-info-model">
                <span className="repair-invoice-info-label">
                  Dòng xe:
                </span>

                <span className="repair-invoice-dotted">
                  {vehicle?.car_model ?? ""}
                </span>
              </div>

              <div className="repair-invoice-info-block repair-invoice-info-km">
                <span className="repair-invoice-info-label">
                  Số Km:
                </span>

                <span className="repair-invoice-dotted">
                  {Number(
                    order.odometer_km ?? 0,
                  ).toLocaleString(
                    "vi-VN",
                  )}
                </span>
              </div>

            </div>

          </div>

          {/* =================================================
              BẢNG CHI TIẾT
              ================================================= */}
          <div className="repair-invoice-table-container">

            <table className="repair-invoice-table">

              <colgroup>
                <col className="invoice-col-stt" />
                <col className="invoice-col-name" />
                <col className="invoice-col-qty" />
                <col className="invoice-col-price" />
                <col className="invoice-col-total" />
              </colgroup>

              <thead>
                <tr>
                  <th>
                    STT
                  </th>

                  <th>
                    PHỤ TÙNG/ CÔNG VIỆC
                  </th>

                  <th>
                    SL
                  </th>

                  <th>
                    ĐƠN GIÁ
                  </th>

                  <th>
                    THÀNH TIỀN
                  </th>
                </tr>
              </thead>

              <tbody>

                {/* =========================================
                    CHI TIẾT THỰC TẾ
                    ========================================= */}
                {visibleDetails.map(
                  (
                    detail,
                    index,
                  ) => {
                    const rawItem =
                      detail.item ?? null;

                    const item =
                      Array.isArray(rawItem)
                        ? rawItem[0] ?? null
                        : rawItem;

                    return (
                      <tr
                        key={detail.id}
                        className="repair-invoice-detail-row"
                      >
                        <td className="invoice-center">
                          {index + 1}
                        </td>

                        <td className="invoice-item-name">
                          {item?.name ?? ""}
                        </td>

                        <td className="invoice-center">
                          {detail.quantity}
                        </td>

                        <td className="invoice-number">
                          {formatCurrency(
                            detail.price,
                          )}
                        </td>

                        <td className="invoice-number">
                          {formatCurrency(
                            detail.amount,
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}

                {/* =========================================
                    DÒNG TRỐNG
                    ========================================= */}
                {Array.from({
                  length: emptyRows,
                }).map(
                  (
                    _,
                    index,
                  ) => (
                    <tr
                      key={`empty-${index}`}
                      className="repair-invoice-empty-row"
                    >
                      <td className="invoice-center">
                        {visibleDetails.length +
                          index +
                          1}
                      </td>

                      <td />

                      <td />

                      <td />

                      <td />
                    </tr>
                  ),
                )}

                {/* =========================================
                    TIỀN CÔNG
                    ========================================= */}
                <tr className="repair-invoice-labor-row">

                  <td
                    colSpan={4}
                    className="repair-invoice-summary-label"
                  >
                    TIỀN CÔNG
                  </td>

                  <td className="repair-invoice-summary-value">
                    {formatCurrency(
                      order.labor_cost,
                    )}
                  </td>

                </tr>

                {/* =========================================
                    GIẢM GIÁ
                    ========================================= */}
                <tr className="repair-invoice-discount-row">

                  <td
                    colSpan={4}
                    className="repair-invoice-summary-label"
                  >
                    GIẢM GIÁ
                  </td>

                  <td className="repair-invoice-summary-value">
                    {formatCurrency(
                      order.discount,
                    )}
                  </td>

                </tr>

                {/* =========================================
                    TỔNG CỘNG
                    ========================================= */}
                <tr className="repair-invoice-total-row">

                  <td
                    colSpan={4}
                    className="repair-invoice-total-label"
                  >
                    Tổng Cộng:
                  </td>

                  <td className="repair-invoice-total-value">
                    {formatCurrency(
                      order.total_amount,
                    )}
                  </td>

                </tr>

              </tbody>
            </table>

          </div>

          {/* =================================================
              NGÀY
              ================================================= */}
          <div className="repair-invoice-date">
            Ngày........tháng........năm........
          </div>

          {/* =================================================
              CHỮ KÝ
              ================================================= */}
          <div className="repair-invoice-signature-area">

            <div className="repair-invoice-signature">
              <strong>
                Khách Hàng
              </strong>
            </div>

            <div className="repair-invoice-signature">
              <strong>
                Chủ Cửa Hàng
              </strong>
            </div>

          </div>

          {/* =================================================
              CẢM ƠN
              ================================================= */}
          <div className="repair-invoice-thank-you">
            CẢM ƠN QUÝ KHÁCH ĐÃ TIN TƯỞNG VÀ SỬ DỤNG DỊCH VỤ CỦA GARA Ô TÔ ANH DŨNG!
          </div>

        </div>

        {/* ===================================================
            KHUNG CẢNH BÁO
            =================================================== */}
        <div className="repair-invoice-warning">

          <div className="repair-invoice-warning-line-1">
            Vì trong quá trình thiết kế/chỉnh sửa không tránh khỏi sai sót,
            Quý khách vui lòng kiểm tra kỹ
          </div>

          <div className="repair-invoice-warning-line-2">
            NỘI DUNG + SỐ ĐIỆN THOẠI + LỖI CHÍNH TẢ + KÍCH THƯỚC FILE
          </div>

          <div className="repair-invoice-warning-bottom">

            <AlertTriangle className="repair-invoice-alert-icon" />

            <div className="repair-invoice-warning-danger">
              MỌI SAI SÓT SAU KHI CHỐT ĐƠN, SHOP KHÔNG CHỊU TRÁCH NHIỆM
              <br />
              CÁM ƠN KHÁCH NHIỀU !!!
            </div>

            <AlertTriangle className="repair-invoice-alert-icon" />

          </div>

        </div>

      </div>
    </div>
  );
}

export default RepairOrderInvoice;