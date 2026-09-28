import {
  Car,
  ClipboardList,
  Package,
  Users,
} from "lucide-react";

const cards = [
  {
    title: "Khách hàng",
    description: "Quản lý khách hàng của gara",
    icon: Users,
  },
  {
    title: "Xe",
    description: "Quản lý xe và biển số",
    icon: Car,
  },
  {
    title: "Kho phụ tùng",
    description: "Theo dõi vật tư và tồn kho",
    icon: Package,
  },
  {
    title: "Phiếu sửa chữa",
    description: "Quản lý các phiếu sửa chữa",
    icon: ClipboardList,
  },
];

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-red-600">
          TỔNG QUAN
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Tổng quan hệ thống quản lý Gara Ô Tô Anh Dũng.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Icon className="size-5" />
              </div>

              <h2 className="mt-4 font-semibold text-slate-900">
                {card.title}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardPage;