
import {
  Download,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

import { importInventoryItems } from "../inventory-items.api";

import type {
  InventoryItem,
  InventoryItemFormData,
} from "../inventory-items.types";

interface Props {
  existingItems: InventoryItem[];
  onClose: () => void;
  onImported: (items: InventoryItem[]) => void;
}

interface ParsedRow {
  rowNumber: number;
  data: InventoryItemFormData;
  error: string;
}

function normalize(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function parsePrice(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }

  let text = String(value ?? "")
    .replace(/vnđ|vnd|đ/gi, "")
    .replace(/\s/g, "")
    .trim();

  if (!text) return NaN;

  // Hỗ trợ 180000, 180.000, 180,000 và 1.500,50.
  if (/^-?\d{1,3}([.,]\d{3})+$/.test(text)) {
    text = text.replace(/[.,]/g, "");
  } else if (text.includes(",") && text.includes(".")) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (text.includes(",")) {
    text = text.replace(",", ".");
  }

  return Number(text);
}

function getItemType(value: unknown): "PART" | "SERVICE" | null {
  const type = normalize(value);

  if (
    ["part", "phu tung", "phutung", "hang hoa", "phu tung oto"].includes(type)
  ) {
    return "PART";
  }

  if (
    ["service", "dich vu", "dichvu"].includes(type)
  ) {
    return "SERVICE";
  }

  return null;
}

function downloadTemplate() {
  const rows = [
    ["Tên mặt hàng", "Loại", "Đơn vị", "Giá bán"],
    ["Lọc nhớt động cơ", "Phụ tùng", "Cái", 150000],
    ["Lọc gió động cơ", "Phụ tùng", "Cái", 250000],
    ["Công bảo dưỡng định kỳ", "Dịch vụ", "Lần", 300000],
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows);

  sheet["!cols"] = [
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "HangHoa");

  XLSX.writeFile(workbook, "Mau_nhap_danh_muc_hang_hoa.xlsx");
}

function ImportInventoryItemsModal({
  existingItems,
  onClose,
  onImported,
}: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [reading, setReading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validRows = useMemo(
    () => rows.filter((row) => !row.error),
    [rows],
  );

  const invalidRows = rows.length - validRows.length;

  async function handleFile(file?: File) {
    if (!file) return;

    setError("");
    setSuccess("");
    setRows([]);
    setFileName(file.name);
    setReading(true);

    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: false,
      });

      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = workbook.Sheets[firstSheetName];

      if (!firstSheet || !firstSheetName) {
        throw new Error("File không có trang tính dữ liệu.");
      }

      // Đọc dữ liệu theo vị trí cột A, B, C, D.
      // Không dùng dòng đầu tiên làm tên cột.
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
        header: 1,
        defval: "",
        raw: true,
        blankrows: false,
      });

      if (matrix.length === 0) {
        throw new Error("File chưa có dữ liệu.");
      }

      // Hỗ trợ cả file có tiêu đề lẫn file chỉ có dữ liệu.
      const firstRow = matrix[0] ?? [];

      const hasHeader =
        normalize(firstRow[0]) === "ten mat hang" ||
        normalize(firstRow[0]) === "ten hang" ||
        normalize(firstRow[0]) === "name";

      const dataRows = hasHeader ? matrix.slice(1) : matrix;
      const firstDataRowNumber = hasHeader ? 2 : 1;

      const seenNames = new Set(
        existingItems.map((item) => normalize(item.name)),
      );

      const parsed: ParsedRow[] = [];

      dataRows.forEach((cells, index) => {
        const row = cells ?? [];

        // Bỏ qua hàng hoàn toàn trống.
        if (
          row.every(
            (cell) => String(cell ?? "").trim() === "",
          )
        ) {
          return;
        }

        const name = String(row[0] ?? "").trim();
        const rawType = row[1];
        const itemType = getItemType(rawType);
        const unit = String(row[2] ?? "").trim();
        const sellPrice = parsePrice(row[3]);

        const issues: string[] = [];

        if (!name) {
          issues.push("Thiếu tên mặt hàng");
        }

        if (!itemType) {
          issues.push("Loại phải là Phụ tùng hoặc Dịch vụ");
        }

        if (!unit) {
          issues.push("Thiếu đơn vị");
        }

        if (!Number.isFinite(sellPrice) || sellPrice < 0) {
          issues.push("Giá bán không hợp lệ");
        }

        const normalizedName = normalize(name);

        if (normalizedName && seenNames.has(normalizedName)) {
          issues.push("Tên mặt hàng đã tồn tại hoặc bị trùng");
        }

        if (normalizedName) {
          seenNames.add(normalizedName);
        }

        parsed.push({
          rowNumber: firstDataRowNumber + index,
          data: {
            name,
            item_type: itemType ?? "PART",
            unit,
            sell_price: sellPrice,
          },
          error: issues.join("; "),
        });
      });

      if (parsed.length === 0) {
        throw new Error("Không tìm thấy dòng dữ liệu hàng hóa trong file.");
      }

      setRows(parsed);
    } catch (fileError) {
      setError(
        fileError instanceof Error
          ? fileError.message
          : "Không đọc được file. Hãy kiểm tra định dạng Excel hoặc CSV.",
      );
    } finally {
      setReading(false);
    }
  }

  async function handleImport() {
    if (validRows.length === 0) {
      setError("Không có dòng hợp lệ để nhập.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const imported = await importInventoryItems(
        validRows.map((row) => row.data),
      );

      setSuccess(`Đã nhập thành công ${imported.length} mặt hàng.`);
      setRows([]);
      setFileName("");

      onImported(imported);
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : "Nhập dữ liệu thất bại.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-inventory-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet size={21} />
            </div>

            <div>
              <h2
                id="import-inventory-title"
                className="text-lg font-semibold text-slate-900"
              >
                Nhập danh mục từ Excel
              </h2>

              <p className="text-sm text-slate-500">
                Đọc theo 4 cột A, B, C, D trong Sheet của bạn.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Cấu trúc Sheet được hỗ trợ
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Cột A: Tên mặt hàng · B: Loại · C: Đơn vị · D: Giá bán
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Chấp nhận Phụ tùng/Dịch vụ hoặc PART/SERVICE, có hoặc không có hàng tiêu đề.
              </p>
            </div>

            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Download size={16} />
              Tải file mẫu
            </button>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-8 text-center transition hover:border-slate-500 hover:bg-slate-50">
            <Upload size={28} className="text-slate-500" />

            <span className="mt-2 text-sm font-semibold text-slate-800">
              {reading ? "Đang đọc file..." : "Chọn file Excel hoặc CSV"}
            </span>

            <span className="mt-1 text-xs text-slate-500">
              Hỗ trợ .xlsx, .xls và .csv
            </span>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              disabled={reading || submitting}
              onChange={(event) => {
                void handleFile(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>

          {fileName && (
            <p className="text-sm text-slate-600">
              File: <span className="font-medium">{fileName}</span>
            </p>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {rows.length > 0 && (
            <>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-lg bg-slate-100 px-3 py-2">
                  Tổng: <strong>{rows.length}</strong> dòng
                </span>

                <span className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
                  Hợp lệ: <strong>{validRows.length}</strong>
                </span>

                <span className="rounded-lg bg-red-50 px-3 py-2 text-red-700">
                  Lỗi: <strong>{invalidRows}</strong>
                </span>
              </div>

              <div className="max-h-72 overflow-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Dòng</th>
                      <th className="px-3 py-2">Tên mặt hàng</th>
                      <th className="px-3 py-2">Loại</th>
                      <th className="px-3 py-2">Đơn vị</th>
                      <th className="px-3 py-2 text-right">Giá bán</th>
                      <th className="px-3 py-2">Kiểm tra</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className="border-t border-slate-100"
                      >
                        <td className="px-3 py-2">{row.rowNumber}</td>
                        <td className="px-3 py-2">{row.data.name}</td>
                        <td className="px-3 py-2">
                          {row.data.item_type === "PART"
                            ? "Phụ tùng (PART)"
                            : "Dịch vụ (SERVICE)"}
                        </td>
                        <td className="px-3 py-2">{row.data.unit}</td>
                        <td className="px-3 py-2 text-right">
                          {Number.isFinite(row.data.sell_price)
                            ? row.data.sell_price.toLocaleString("vi-VN")
                            : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {row.error ? (
                            <span className="text-xs text-red-600">
                              {row.error}
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-700">
                              Hợp lệ
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {invalidRows > 0 && (
                <p className="text-xs text-amber-700">
                  Các dòng không hợp lệ sẽ bị bỏ qua; chỉ các dòng hợp lệ được gửi lên database.
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={() => void handleImport()}
            disabled={
              submitting ||
              reading ||
              validRows.length === 0
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={17} />

            {submitting
              ? "Đang nhập..."
              : `Nhập ${validRows.length} mặt hàng`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportInventoryItemsModal;
