import React from "react";
import { useGetDashboard } from "@workspace/api-client-react";
import { CountUp } from "@/components/CountUp";
import { useWithdrawalToasts } from "@/hooks/use-withdrawal-toasts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ShieldCheck, Wallet as WalletIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { data: dashboard, isLoading, error } = useGetDashboard();
  useWithdrawalToasts();

  if (isLoading) return <DashboardSkeleton />;

  if (error || !dashboard) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Failed to load dashboard</h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  const { profile, earnings } = dashboard;

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="dash-bg min-h-screen pb-20 relative overflow-hidden">
      {/* Animated spark particles */}
      <div className="sparks" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="spark" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* Header */}
      <header className="dash-header sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-icon.png" alt="InfinityAdX" className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-blue-500/40" />
            <h1 className="infinity-3d-text text-xl font-extrabold tracking-tight">
              InfinityAdX
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Profile menu" className="admin-avatar-ring rounded-full">
                  <Avatar className="w-9 h-9">
                    {profile.photoUrl ? (
                      <AvatarImage src={profile.photoUrl} alt={profile.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="text-xs font-bold bg-[#1a2f5c] text-white">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#0b1a3a] border-white/10 text-white">
                <DropdownMenuLabel className="text-white/50 text-xs">{profile.name}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                  <Link href="/admin" className="flex items-center gap-2 w-full">
                    <ShieldCheck className="w-4 h-4" /> Admin Panel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                  <Link href="/wallet" className="flex items-center gap-2 w-full">
                    <WalletIcon className="w-4 h-4" /> Wallet
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Profile Card */}
        <section className="profile-card rounded-3xl py-8 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          <div className="flex flex-col items-center gap-4">
            <p className="text-white font-extrabold text-2xl tracking-widest" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
              {profile.affiliateId}
            </p>
            <div className="relative">
              <div className="absolute -inset-[9px] rounded-full profile-avatar-conic-ring" />
              <div className="absolute -inset-[5px] rounded-full bg-gradient-to-b from-white to-white/60 shadow-lg" />
              <Avatar className="relative w-32 h-32 border-[5px] border-[#c9a227]">
                {profile.photoUrl ? <AvatarImage src={profile.photoUrl} alt={profile.name} className="object-cover" /> : null}
                <AvatarFallback className="text-4xl font-bold bg-[#a07010] text-white">{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
            </div>
            <h2 className="text-white font-extrabold text-3xl tracking-tight" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>
              {profile.name}
            </h2>
            <span
              className="px-8 py-2.5 rounded-full font-semibold text-white text-base tracking-wide"
              style={{
                background: "linear-gradient(90deg, #38b6ff 0%, #1a6fe8 100%)",
                boxShadow: "0 4px 14px -2px rgba(26,111,232,0.6), 0 1px 0 rgba(255,255,255,0.2) inset",
              }}
            >
              {profile.packageLabel}
            </span>
          </div>
        </section>

        {/* Earning Cards */}
        <section className="flex flex-col gap-4">
          <EarningCard title="Today's Earning"      amount={earnings.today}    cardClass="ec-cyan"   />
          <EarningCard title="Last 7 Days Earning"  amount={earnings.sevenDay}  cardClass="ec-green"  />
          <EarningCard title="Last 30 Days Earning" amount={earnings.thirtyDay} cardClass="ec-amber"  />
          <EarningCard title="All Time Earning"     amount={earnings.allTime}   cardClass="ec-purple" />
        </section>
      </main>
    </div>
  );
}

function EarningCard({ title, amount, cardClass }: { title: string; amount: number; cardClass: string }) {
  return (
    <div className={`earning-card ${cardClass}`}>
      {/* Left icon circle */}
      <div className="ec-icon">
        <span className="ec-rupee">₹</span>
      </div>
      {/* Right: amount + label */}
      <div className="ec-text">
        <div className="ec-amount">
          <CountUp end={amount} duration={1} prefix="₹" />
        </div>
        <div className="ec-label">{title}</div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="dash-bg min-h-screen pb-20">
      <header className="dash-header h-16 flex items-center px-4">
        <Skeleton className="h-8 w-48 bg-white/10" />
      </header>
      <main className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="w-full h-60 rounded-3xl bg-white/5" />
        <Skeleton className="w-full h-20 rounded-3xl bg-white/5" />
        <Skeleton className="w-full h-20 rounded-3xl bg-white/5" />
        <Skeleton className="w-full h-20 rounded-3xl bg-white/5" />
        <Skeleton className="w-full h-20 rounded-3xl bg-white/5" />
      </main>
    </div>
  );
}
