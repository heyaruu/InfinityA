import React, { useState } from "react";
import { Link } from "wouter";
import { useGetWallet, useRequestWithdrawal, getGetWalletQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Wallet as WalletIcon, ArrowDownToLine, CheckCircle2, Clock } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function Wallet() {
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
    <div className="dash-bg min-h-screen pb-20 relative overflow-hidden">
      <div className="sparks" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="spark" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      <header className="dash-header sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" aria-label="Back to dashboard" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/70 hover:text-white" />
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-cyan-300" /> Wallet
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        <section className="wallet-card rounded-3xl p-6 relative overflow-hidden">
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
      </main>
    </div>
  );
}
