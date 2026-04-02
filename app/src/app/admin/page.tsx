import { getAdminStats, getOnlineUsers } from "@/lib/actions/admin";
import {
  Users, UserCheck, Film, Banknote, Ticket, Building2,
  Activity, TrendingUp, PlayCircle, Library, ShieldCheck, Video, Wifi,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const [stats, onlineUsers] = await Promise.all([
    getAdminStats(),
    getOnlineUsers(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Админ самбар</h1>
          <p className="text-sm text-white/40 mt-1">MNREELS системийн удирдлага</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/creator"
            className="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-500/20 transition-colors border border-green-500/20"
          >
            <Video size={16} />
            Бүтээгч хэсэг
          </Link>
          <span className="text-xs text-white/30">
            {new Date().toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* Online Users */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
          <span className="inline-flex items-center gap-2">
            <Wifi size={12} className="text-green-400" />
            Одоо онлайн ({onlineUsers.length})
          </span>
        </h2>
        {onlineUsers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {onlineUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">{u.display_name || u.username || "Хэрэглэгч"}</span>
                {u.is_admin && <span className="text-[9px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full">Admin</span>}
                {u.is_creator && !u.is_admin && <span className="text-[9px] bg-green-500/30 text-green-300 px-1.5 py-0.5 rounded-full">Creator</span>}
                <span className="text-[10px] text-white/20">
                  {u.last_seen_at ? `${Math.floor((Date.now() - new Date(u.last_seen_at).getTime()) / 60000)}м` : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/30">Одоогоор онлайн хэрэглэгч байхгүй</p>
        )}
      </div>

      {/* System Activity */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Системийн идэвхи</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Activity}
            label="Идэвхтэй (24ц)"
            value={stats.activeUsers24h}
            color="text-emerald-400"
            bg="bg-emerald-500/10"
            border="border-emerald-500/20"
            subtitle="сүүлийн 24 цагт"
          />
          <StatCard
            icon={TrendingUp}
            label="Идэвхтэй (7 хоног)"
            value={stats.activeUsers7d}
            color="text-teal-400"
            bg="bg-teal-500/10"
            border="border-teal-500/20"
            subtitle="сүүлийн 7 хоногт"
          />
          <StatCard
            icon={Users}
            label="Нийт хэрэглэгч"
            value={stats.totalUsers}
            color="text-blue-400"
            bg="bg-blue-500/10"
            border="border-blue-500/20"
            href="/admin/users"
          />
          <StatCard
            icon={UserCheck}
            label="Бүтээгчид"
            value={stats.totalCreators}
            color="text-green-400"
            bg="bg-green-500/10"
            border="border-green-500/20"
            href="/admin/creators"
            subtitle={`${stats.verifiedCreators} баталгаажсан`}
          />
        </div>
      </div>

      {/* Content Stats */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Контент</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Library}
            label="Нийт цуврал"
            value={stats.totalSeries}
            color="text-indigo-400"
            bg="bg-indigo-500/10"
            border="border-indigo-500/20"
          />
          <StatCard
            icon={PlayCircle}
            label="Нийт анги"
            value={stats.totalEpisodes}
            color="text-violet-400"
            bg="bg-violet-500/10"
            border="border-violet-500/20"
          />
          <StatCard
            icon={Film}
            label="Модераци хүлээж буй"
            value={stats.pendingEpisodes}
            color="text-orange-400"
            bg="bg-orange-500/10"
            border="border-orange-500/20"
            href="/admin/episodes"
            urgent={stats.pendingEpisodes > 0}
          />
          <StatCard
            icon={ShieldCheck}
            label="Баталгаажсан бүтээгч"
            value={stats.verifiedCreators}
            color="text-cyan-400"
            bg="bg-cyan-500/10"
            border="border-cyan-500/20"
            subtitle={`${stats.totalCreators} нийт`}
          />
        </div>
      </div>

      {/* Financial */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Санхүү</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Ticket}
            label="Тасалбар хүсэлт"
            value={stats.pendingPurchases}
            color="text-yellow-400"
            bg="bg-yellow-500/10"
            border="border-yellow-500/20"
            href="/admin/purchases"
            urgent={stats.pendingPurchases > 0}
          />
          <StatCard
            icon={Banknote}
            label="Татах хүсэлт"
            value={stats.pendingWithdrawals}
            color="text-red-400"
            bg="bg-red-500/10"
            border="border-red-500/20"
            href="/admin/withdrawals"
            urgent={stats.pendingWithdrawals > 0}
          />
          <StatCard
            icon={Ticket}
            label="Нийт орлого"
            value={stats.totalRevenue.toLocaleString()}
            color="text-purple-400"
            bg="bg-purple-500/10"
            border="border-purple-500/20"
            subtitle="тасалбар"
          />
          <StatCard
            icon={Building2}
            label="Платформын орлого (20%)"
            value={stats.platformRevenue.toLocaleString()}
            color="text-pink-400"
            bg="bg-pink-500/10"
            border="border-pink-500/20"
            subtitle="тасалбар"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Хурдан үйлдлүүд</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <ActionCard
            href="/admin/episodes"
            icon={Film}
            label="Видео модераци"
            count={stats.pendingEpisodes}
            color="text-orange-300"
            bg="bg-orange-500/10"
            description="Шинэ видео шалгах, зөвшөөрөх"
          />
          <ActionCard
            href="/admin/purchases"
            icon={Ticket}
            label="Тасалбар хүсэлт"
            count={stats.pendingPurchases}
            color="text-yellow-300"
            bg="bg-yellow-500/10"
            description="Банк шилжүүлэг баталгаажуулах"
          />
          <ActionCard
            href="/admin/withdrawals"
            icon={Banknote}
            label="Татах хүсэлт"
            count={stats.pendingWithdrawals}
            color="text-red-300"
            bg="bg-red-500/10"
            description="Бүтээгчийн мөнгө татах хүсэлт"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, color, bg, border, href, subtitle, urgent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number | string;
  color: string;
  bg: string;
  border?: string;
  href?: string | null;
  subtitle?: string;
  urgent?: boolean;
}) {
  const content = (
    <div className={`${bg} rounded-xl p-5 border ${border || "border-white/5"} ${href ? "hover:border-white/20 transition-all cursor-pointer" : ""} ${urgent ? "ring-1 ring-orange-500/50" : ""} relative`}>
      <div className="flex items-center justify-between mb-3">
        <Icon size={20} className={color} />
        {urgent && <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
      </div>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      <p className="text-xs text-white/40 mt-1.5">{label}</p>
      {subtitle && <p className="text-[10px] text-white/25 mt-0.5">{subtitle}</p>}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function ActionCard({
  href, icon: Icon, label, count, color, bg, description,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  count: number;
  color: string;
  bg: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 ${bg} ${color} px-5 py-4 rounded-xl hover:bg-white/10 transition-all border border-white/5 hover:border-white/15`}
    >
      <Icon size={22} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{label}</span>
          {count > 0 && (
            <span className="bg-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        <p className="text-[11px] text-white/30 mt-0.5">{description}</p>
      </div>
      <span className="text-white/20">→</span>
    </Link>
  );
}
