import React, { useState } from "react";
import { useGetDashboard, useGetWallet, useRequestWithdrawal, getGetWalletQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CountUp } from "@/components/CountUp";
import { useWithdrawalToasts } from "@/hooks/use-withdrawal-toasts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Wallet as WalletIcon, ArrowDownToLine, CheckCircle2, Clock } from "lucide-react";

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
            <Link href="/admin" aria-label="Admin shortcut" className="admin-avatar-ring rounded-full">
              <Avatar className="w-9 h-9">
                {profile.photoUrl ? (
                  <AvatarImage src={profile.photoUrl} alt={profile.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="text-xs font-bold bg-[#1a2f5c] text-white">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
            </Link>
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

        {/* Wallet */}
        <WalletSection />
      </main>
    </div>
  );
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function WalletSection() {
  const { data: wallet, isLoading, error, refetch } = useGetWallet();
  const requestWithdrawal = useRequestWithdrawal();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);

    if (!amount || isNaN(value) || value <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    if (wallet && value > wallet.balance) {
      toast.error("Withdrawal amount exceeds your available wallet balance");
      return;
    }

    requestWithdrawal.mutate(
      { data: { amount: value } },
      {
        onSuccess: (data) => {
          toast.success(`Withdrawal successful! ${formatInr(value)} has been processed.`);
          queryClient.setQueryData(getGetWalletQueryKey(), data);
          setAmount("");
        },
        onError: () => toast.error("Withdrawal failed, please try again"),
      },
    );
  };

  return (
    <section className="wallet-card rounded-3xl p-6 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-5">
        <WalletIcon className="w-5 h-5 text-cyan-300" />
        <h2 className="text-white font-extrabold text-xl tracking-tight">Wallet</h2>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-white/60 text-sm">Failed to load wallet. Please try again.</p>
          <Button type="button" variant="outline" onClick={() => refetch()} className="border-white/15 text-white hover:bg-white/10">
            Retry
          </Button>
        </div>
      ) : isLoading || !wallet ? (
        <Skeleton className="w-full h-40 rounded-2xl bg-white/5" />
      ) : (
        <>
          <div className="wallet-balance-box rounded-2xl p-5 mb-5">
            <p className="text-white/60 text-sm font-medium">Available Balance</p>
            <p className="text-white font-extrabold text-4xl tracking-tight mt-1">
              <CountUp end={wallet.balance} duration={1} prefix="₹" />
            </p>
          </div>

          <form onSubmit={handleWithdraw} className="flex flex-col gap-3 sm:flex-row sm:items-end mb-5">
            <div className="flex-1">
              <label htmlFor="withdraw-amount" className="text-white/70 text-sm font-medium mb-1.5 block">
                Withdraw Amount (₹)
              </label>
              <Input
                id="withdraw-amount"
                type="number"
                min="1"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 h-12 text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={requestWithdrawal.isPending}
              className="h-12 px-6 font-bold gap-2 shrink-0"
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)",
                boxShadow: "0 6px 20px -4px rgba(14,165,233,0.5)",
              }}
            >
              <ArrowDownToLine className="w-4 h-4" />
              {requestWithdrawal.isPending ? "Processing..." : "Withdraw"}
            </Button>
          </form>

          {wallet.history.length > 0 && (
            <div className="space-y-2">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Recent Withdrawals</p>
              {wallet.history.map((item) => (
                <div key={item.id} className="wallet-history-row flex items-center justify-between rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {item.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-white font-semibold">{formatInr(item.amount)}</span>
                  </div>
                  <span className="text-white/40 text-xs">
                    {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
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
