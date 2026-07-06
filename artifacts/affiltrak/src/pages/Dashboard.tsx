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
        <section className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-700"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
              {profile.photoUrl ? <AvatarImage src={profile.photoUrl} alt={profile.name} className="object-cover" /> : null}
              <AvatarFallback className="text-2xl bg-secondary">{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-white tracking-tight">{profile.name}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground font-mono">
                  <span>ID: {profile.affiliateId}</span>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold border-0 px-3 py-1">
                {profile.packageLabel}
              </Badge>
            </div>
          </div>
        </section>

        {/* Earning Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <EarningCard 
            title="Today's Earning" 
            amount={earnings.today} 
            gradient="bg-gradient-1" 
            glow="glow-1"
            icon={<IndianRupee className="w-6 h-6 text-white" />}
            delay={0.1}
          />
          <EarningCard 
            title="Last 7 Days" 
            amount={earnings.sevenDay} 
            gradient="bg-gradient-2" 
            glow="glow-2"
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            delay={0.2}
          />
          <EarningCard 
            title="Last 30 Days" 
            amount={earnings.thirtyDay} 
            gradient="bg-gradient-3" 
            glow="glow-3"
            icon={<Wallet className="w-6 h-6 text-white" />}
            delay={0.3}
          />
          <EarningCard 
            title="All Time Earning" 
            amount={earnings.allTime} 
            gradient="bg-gradient-4" 
            glow="glow-4"
            icon={<Award className="w-6 h-6 text-white" />}
            delay={0.4}
          />
        </section>
      </main>
    </div>
  );
}

function EarningCard({ title, amount, gradient, glow, icon, delay }: { title: string, amount: number, gradient: string, glow: string, icon: React.ReactNode, delay: number }) {
  return (
    <div 
      className={`premium-card rounded-3xl p-6 ${gradient} ${glow} relative transform transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1.5`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/15 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="relative z-10 flex flex-col h-full justify-between gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-white/85 font-semibold text-xs tracking-widest uppercase">{title}</h3>
          <div className="p-2.5 bg-white/15 rounded-full backdrop-blur-sm border border-white/20">
            {icon}
          </div>
        </div>
        <div>
          <div className="text-3xl lg:text-4xl font-mono font-extrabold text-white tracking-tight drop-shadow-lg">
            <CountUp end={amount} duration={2.5} prefix="₹" />
          </div>
        </div>
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
