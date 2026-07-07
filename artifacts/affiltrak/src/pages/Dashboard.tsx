import React from "react";
import { useGetDashboard } from "@workspace/api-client-react";
import { CountUp } from "@/components/CountUp";
import { useWithdrawalToasts } from "@/hooks/use-withdrawal-toasts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Settings, Wallet, Activity, TrendingUp, Award, IndianRupee } from "lucide-react";

export default function Dashboard() {
  const { data: dashboard, isLoading, error } = useGetDashboard();
  useWithdrawalToasts();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#050505] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">AffilTrak</h1>
          </div>
          <Link href="/admin" className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground hover:text-white" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Profile Card */}
        <section className="profile-card rounded-3xl py-8 px-6 relative overflow-hidden">
          <div className="flex flex-col items-center gap-4">
            {/* GK ID at top */}
            <p className="text-white font-extrabold text-2xl tracking-widest drop-shadow">
              {profile.affiliateId}
            </p>

            {/* Circular avatar with white ring */}
            <div className="relative">
              <div className="absolute -inset-[3px] rounded-full bg-gradient-to-b from-white via-white/80 to-white/50"></div>
              <Avatar className="relative w-32 h-32 border-4 border-[#c9a227]">
                {profile.photoUrl ? <AvatarImage src={profile.photoUrl} alt={profile.name} className="object-cover" /> : null}
                <AvatarFallback className="text-4xl font-bold bg-[#b8941f] text-white">{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
            </div>

            {/* Name */}
            <h2 className="text-white font-extrabold text-3xl tracking-tight drop-shadow">{profile.name}</h2>

            {/* Package badge */}
            <span className="px-8 py-2 rounded-full font-semibold text-white text-base" style={{background: "linear-gradient(90deg, #38b6ff 0%, #1a6fe8 100%)"}}>
              {profile.packageLabel}
            </span>
          </div>
        </section>

        {/* Earning Cards */}
        <section className="flex flex-col gap-4">
          <EarningCard
            title="Today's Earning"
            amount={earnings.today}
            gradient="bg-gradient-1"
            icon={<IndianRupee className="w-6 h-6 text-white" />}
          />
          <EarningCard
            title="Last 7 Days Earning"
            amount={earnings.sevenDay}
            gradient="bg-gradient-2"
            icon={<TrendingUp className="w-6 h-6 text-white" />}
          />
          <EarningCard
            title="Last 30 Days Earning"
            amount={earnings.thirtyDay}
            gradient="bg-gradient-3"
            icon={<Wallet className="w-6 h-6 text-white" />}
          />
          <EarningCard
            title="All Time Earning"
            amount={earnings.allTime}
            gradient="bg-gradient-4"
            icon={<Award className="w-6 h-6 text-white" />}
          />
        </section>
      </main>
    </div>
  );
}

function EarningCard({ title, amount, gradient, icon }: { title: string, amount: number, gradient: string, icon: React.ReactNode }) {
  return (
    <div className={`earning-bar rounded-[2rem] px-6 py-6 sm:py-7 ${gradient}`}>
      <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 text-center">
        <div className="mb-1 p-3 bg-white/15 rounded-full border border-white/20">
          {icon}
        </div>
        <div className="text-3xl sm:text-4xl font-mono font-extrabold text-white tracking-tight">
          <CountUp end={amount} duration={1} prefix="₹" />
        </div>
        <h3 className="text-white/90 font-medium text-sm sm:text-base">{title}</h3>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      <header className="border-b border-white/10 h-16 flex items-center px-4">
        <Skeleton className="h-8 w-32 bg-white/10" />
      </header>
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="w-full h-40 rounded-2xl bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="w-full h-36 rounded-2xl bg-white/5" />
          <Skeleton className="w-full h-36 rounded-2xl bg-white/5" />
          <Skeleton className="w-full h-36 rounded-2xl bg-white/5" />
          <Skeleton className="w-full h-36 rounded-2xl bg-white/5" />
        </div>
      </main>
    </div>
  );
}
