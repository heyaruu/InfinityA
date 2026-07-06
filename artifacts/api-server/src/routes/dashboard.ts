import { Router, type IRouter } from "express";
import { GetDashboardResponse } from "@workspace/api-zod";
import { getOrCreateProfile } from "../lib/profile";
import { getEarningsSummary } from "../lib/earnings";

const router: IRouter = Router();

router.get("/dashboard", async (_req, res): Promise<void> => {
  const profile = await getOrCreateProfile();
  const earnings = await getEarningsSummary();

  res.json(
    GetDashboardResponse.parse({
      profile: {
        name: profile.name,
        affiliateId: profile.affiliateId,
        packageLabel: profile.packageLabel,
        photoUrl: profile.photoUrl,
      },
      earnings,
    }),
  );
});

export default router;
