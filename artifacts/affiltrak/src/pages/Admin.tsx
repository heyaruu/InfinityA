import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { 
  useGetDashboard, 
  useUpdateProfile, 
  useUpdateEarningMetric, 
  useRequestUploadUrl,
  getGetDashboardQueryKey 
} from "@workspace/api-client-react";
import { ObjectUploader } from "@workspace/object-storage-web";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Save, IndianRupee, User, ShieldAlert, Upload, Lock, LogOut, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ADMIN_ID = "admin@arman";
const ADMIN_PASS = "arman888";
const SESSION_KEY = "iadx_admin_auth";

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === ADMIN_ID && pass === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onSuccess();
    } else {
      setError("Invalid ID or Password");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: "radial-gradient(ellipse at 20% 20%, #0a1a3a 0%, #050c1a 50%, #07100a 100%)"
    }}>
      <div className={`w-full max-w-sm ${shaking ? "animate-shake" : ""}`}>
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <img src="/logo.png" alt="InfinityAdX" className="w-16 h-16 rounded-2xl shadow-xl shadow-blue-900/50" />
          <h1 className="infinity-3d-text text-2xl font-black tracking-wide">InfinityAdX</h1>
          <p className="text-white/50 text-sm">Admin Panel Access</p>
        </div>

        {/* Login Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(56,214,245,0.2)",
          borderRadius: "1.5rem",
          boxShadow: "0 20px 60px -10px rgba(0,20,80,0.8), 0 0 0 1px rgba(56,214,245,0.05)",
          padding: "2rem",
        }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background: "linear-gradient(135deg,#0ea5e9,#1d4ed8)"}}>
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">Secure Login</p>
              <p className="text-white/40 text-xs">Enter your credentials</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-white/70 text-sm font-medium">Admin ID</label>
              <Input
                type="text"
                placeholder="admin@arman"
                value={id}
                onChange={e => { setId(e.target.value); setError(""); }}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-cyan-500/50 h-11"
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white/70 text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={pass}
                  onChange={e => { setPass(e.target.value); setError(""); }}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-cyan-500/50 h-11 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 font-bold text-base mt-2"
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)",
                boxShadow: "0 6px 20px -4px rgba(14,165,233,0.5)",
              }}
            >
              <Lock className="w-4 h-4 mr-2" /> Login
            </Button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.45s ease-in-out; }
      `}</style>
    </div>
  );
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  affiliateId: z.string().min(2, "ID must be at least 2 characters."),
  packageLabel: z.string().min(2, "Package label must be at least 2 characters."),
  photoUrl: z.string().or(z.literal("")).or(z.null()),
});

const earningsSchema = z.object({
  today: z.coerce.number().min(0, "Amount cannot be negative"),
  sevenDay: z.coerce.number().min(0, "Amount cannot be negative"),
  thirtyDay: z.coerce.number().min(0, "Amount cannot be negative"),
  allTime: z.coerce.number().min(0, "Amount cannot be negative"),
});

const EARNING_FIELDS: { field: keyof z.infer<typeof earningsSchema>; label: string }[] = [
  { field: "today", label: "Today's Earning" },
  { field: "sevenDay", label: "Last 7 Days" },
  { field: "thirtyDay", label: "Last 30 Days" },
  { field: "allTime", label: "All Time Earning" },
];

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  return <AdminPanel onLogout={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); }} />;
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const { data: dashboard, isLoading } = useGetDashboard();
  const updateProfile = useUpdateProfile();
  const updateEarningMetric = useUpdateEarningMetric();
  const requestUploadUrl = useRequestUploadUrl();
  const queryClient = useQueryClient();
  const lastUploadedObjectPath = useRef<string | null>(null);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      affiliateId: "",
      packageLabel: "",
      photoUrl: "",
    },
  });

  const earningsForm = useForm<z.infer<typeof earningsSchema>>({
    resolver: zodResolver(earningsSchema),
    defaultValues: {
      today: 0,
      sevenDay: 0,
      thirtyDay: 0,
      allTime: 0,
    },
  });

  useEffect(() => {
    if (dashboard) {
      profileForm.reset({
        name: dashboard.profile.name,
        affiliateId: dashboard.profile.affiliateId,
        packageLabel: dashboard.profile.packageLabel,
        photoUrl: dashboard.profile.photoUrl || "",
      });
      earningsForm.reset({
        today: dashboard.earnings.today,
        sevenDay: dashboard.earnings.sevenDay,
        thirtyDay: dashboard.earnings.thirtyDay,
        allTime: dashboard.earnings.allTime,
      });
    }
  }, [dashboard, profileForm, earningsForm]);

  const onProfileSubmit = (values: z.infer<typeof profileSchema>) => {
    updateProfile.mutate(
      { data: { ...values, photoUrl: values.photoUrl || null } },
      {
        onSuccess: (data) => {
          toast.success("Profile updated successfully");
          queryClient.setQueryData(getGetDashboardQueryKey(), data);
        },
        onError: () => toast.error("Failed to update profile"),
      }
    );
  };

  const updateSingleMetric = (field: keyof z.infer<typeof earningsSchema>, label: string) => {
    const raw = earningsForm.getValues(field);
    const amount = Number(raw);
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid positive number");
      return;
    }
    updateEarningMetric.mutate(
      { data: { field, amount } },
      {
        onSuccess: (data) => {
          toast.success(`${label} updated — other totals recalculated automatically`);
          queryClient.setQueryData(getGetDashboardQueryKey(), data);
          earningsForm.reset({
            today: data.earnings.today,
            sevenDay: data.earnings.sevenDay,
            thirtyDay: data.earnings.thirtyDay,
            allTime: data.earnings.allTime,
          });
        },
        onError: () => toast.error(`Failed to update ${label}`),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-3xl">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b border-white/10 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-white" />
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" /> Admin Panel
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        {/* Earnings Stats Preview */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Today</p>
              <p className="text-xl font-mono font-bold mt-1">₹{dashboard.earnings.today.toLocaleString('en-IN')}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">7 Days</p>
              <p className="text-xl font-mono font-bold mt-1">₹{dashboard.earnings.sevenDay.toLocaleString('en-IN')}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">30 Days</p>
              <p className="text-xl font-mono font-bold mt-1">₹{dashboard.earnings.thirtyDay.toLocaleString('en-IN')}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">All Time</p>
              <p className="text-xl font-mono font-bold mt-1 text-primary">₹{dashboard.earnings.allTime.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Edit Card */}
          <Card className="bg-card/50 border-white/5 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Profile Settings
              </CardTitle>
              <CardDescription>Update your public affiliate profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="bg-background/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="affiliateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Affiliate ID</FormLabel>
                        <FormControl>
                          <Input placeholder="AFF-12345" className="bg-background/50 font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="packageLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Tier</FormLabel>
                        <FormControl>
                          <Input placeholder="Gold Package" className="bg-background/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="photoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Photo</FormLabel>
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16 border-2 border-white/10 shrink-0">
                            {field.value ? (
                              <AvatarImage src={field.value} alt="Profile" className="object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-secondary">
                              <User className="w-6 h-6 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={5242880}
                            buttonClassName="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
                            onGetUploadParameters={async (file) => {
                              const { uploadURL, objectPath } = await requestUploadUrl.mutateAsync({
                                data: {
                                  name: file.name ?? "photo",
                                  size: file.size ?? 0,
                                  contentType: file.type ?? "application/octet-stream",
                                },
                              });
                              lastUploadedObjectPath.current = objectPath;
                              return { method: "PUT", url: uploadURL, headers: { "Content-Type": file.type ?? "application/octet-stream" } };
                            }}
                            onComplete={(result) => {
                              const objectPath = lastUploadedObjectPath.current;
                              if (result.successful?.length && objectPath) {
                                profileForm.setValue("photoUrl", `/api/storage${objectPath}`, { shouldDirty: true });
                                toast.success("Photo uploaded — click Save Profile to apply");
                              } else {
                                toast.error("Photo upload failed, please try again");
                              }
                            }}
                          >
                            <Upload className="w-4 h-4" /> Upload Photo
                          </ObjectUploader>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full mt-6"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Earnings Edit Card */}
          <Card className="bg-card/50 border-white/5 shadow-xl h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-green-500" /> Earnings
              </CardTitle>
              <CardDescription>
                Edit any stat directly. All others (today, 7-day, 30-day, all-time) recalculate automatically to stay consistent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...earningsForm}>
                <div className="space-y-5">
                  {EARNING_FIELDS.map(({ field: fieldKey, label }) => (
                    <FormField
                      key={fieldKey}
                      control={earningsForm.control}
                      name={fieldKey}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label} (₹)</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                type="number"
                                className="bg-background/50 text-xl font-mono py-5"
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={() => updateSingleMetric(fieldKey, label)}
                              disabled={updateEarningMetric.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white shrink-0 h-11"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
