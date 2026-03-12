import { getAdminStats } from "@/lib/actions/admin";
import { Users, UserCheck, Film, Banknote, Ticket } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const cards = [
    {
      label: "Нийт хэрэглэгч",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      href: "/admin/users",
    },
    {
      label: "Бүтээгчид",
      value: stats.totalCreators,
      icon: UserCheck,
      color: "text-green-400",
      bg: "bg-green-500/10",
      href: "/admin/creators",
    },
    {
      label: "Модераци хүлээж буй",
      value: stats.pendingEpisodes,
      icon: Film,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      href: "/admin/episodes",
    },
    {
      label: "Тасалбар хүсэлт",
      value: stats.pendingPurchases,
      icon: Ticket,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      href: "/admin/purchases",
    },
    {
      label: "Татах хүсэлт",
      value: stats.pendingWithdrawals,
      icon: Banknote,
      color: "text-red-400",
      bg: "bg-red-500/10",
      href: "/admin/withdrawals",
    },
    {
      label: "Нийт орлого (тасалбар)",
      value: stats.totalRevenue.toLocaleString(),
      icon: Ticket,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      href: null,
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Админ самбар</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div
              key={card.label}
              className={`${card.bg} rounded-xl p-4 border border-white/5`}
            >
              <Icon size={20} className={`${card.color} mb-2`} />
              <p className="text-2xl font-black">{card.value}</p>
              <p className="text-xs text-white/40 mt-1">{card.label}</p>
            </div>
          );

          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-white/60 mb-3">Хурдан үйлдлүүд</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/episodes"
            className="flex items-center gap-2 bg-orange-500/10 text-orange-300 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-500/20 transition-colors"
          >
            <Film size={16} />
            Видео модераци ({stats.pendingEpisodes})
          </Link>
          <Link
            href="/admin/purchases"
            className="flex items-center gap-2 bg-yellow-500/10 text-yellow-300 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-yellow-500/20 transition-colors"
          >
            <Ticket size={16} />
            Тасалбар хүсэлт ({stats.pendingPurchases})
          </Link>
          <Link
            href="/admin/withdrawals"
            className="flex items-center gap-2 bg-red-500/10 text-red-300 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            <Banknote size={16} />
            Татах хүсэлт ({stats.pendingWithdrawals})
          </Link>
        </div>
      </div>
    </div>
  );
}
