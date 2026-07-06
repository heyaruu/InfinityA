import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { 
  useGetDashboard, 
  useUpdateProfile, 
  useUpdateTodayEarning, 
  getGetDashboardQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Save, IndianRupee, User, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  affiliateId: z.string().min(2, "ID must be at least 2 characters."),
  packageLabel: z.string().min(2, "Package label must be at least 2 characters."),
  photoUrl: z.string().url("Must be a valid URL").or(z.literal("")).or(z.null()),
});

const earningSchema = z.object({
  amount: z.coerce.number().min(0, "Amount cannot be negative"),
});

export default function Admin() {
  const { data: dashboard, isLoading } = useGetDashboard();
  const updateProfile = useUpdateProfile();
  const updateEarning = useUpdateTodayEarning();
  const queryClient = useQueryClient();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      affiliateId: "",
      packageLabel: "",
      photoUrl: "",
    },
  });

  const earningForm = useForm<z.infer<typeof earningSchema>>({
    resolver: zodResolver(earningSchema),
    defaultValues: {
      amount: 0,
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
      earningForm.reset({
        amount: dashboard.earnings.today,
      });
    }
  }, [dashboard, profileForm, earningForm]);

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

  const onEarningSubmit = (values: z.infer<typeof earningSchema>) => {
    updateEarning.mutate(
      { data: { amount: values.amount } },
      {
        onSuccess: (data) => {
          toast.success("Today's earning updated successfully");
          queryClient.setQueryData(getGetDashboardQueryKey(), data);
        },
        onError: () => toast.error("Failed to update earning"),
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
                        <FormLabel>Photo URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." className="bg-background/50" {...field} value={field.value ?? ""} />
                        </FormControl>
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
                <IndianRupee className="w-5 h-5 text-green-500" /> Today's Earning
              </CardTitle>
              <CardDescription>Set absolute amount for today. Other stats recalculate automatically.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...earningForm}>
                <form onSubmit={earningForm.handleSubmit(onEarningSubmit)} className="space-y-4">
                  <FormField
                    control={earningForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            className="bg-background/50 text-2xl font-mono py-6" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
                    disabled={updateEarning.isPending}
                  >
                    {updateEarning.isPending ? "Updating..." : <><Save className="w-4 h-4 mr-2" /> Update Earnings</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
