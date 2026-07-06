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
        <section className="profile-card rounded-3xl p-6 relative overflow-hidden">
          <div className="relative flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-orange-400 to-pink-500"></div>
              <Avatar className="relative w-20 h-20 sm:w-24 sm:h-24 border-4 border-[#1d3a8f]">
                {profile.photoUrl ? <AvatarImage src={profile.photoUrl} alt={profile.name} className="object-cover" /> : null}
                <AvatarFallback className="text-2xl bg-[#1d3a8f] text-white">{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 text-left space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1220] tracking-tight">{profile.name}</h2>
              <div className="flex items-center gap-1.5 text-[#0b1220]/70 font-medium text-sm">
                <span className="font-bold">#</span>
                <span>GK ID: {profile.affiliateId}</span>
              </div>
              <Badge className="bg-white/15 text-white font-semibold border border-white/30 px-3 py-1.5 rounded-full gap-1.5 backdrop-blur-sm">
                <Award className="w-3.5 h-3.5" />
                {profile.packageLabel.toUpperCase()}
              </Badge>
            </div>
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
