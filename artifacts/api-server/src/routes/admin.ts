import { Router, type IRouter } from "express";
import { UpdateProfileBody, UpdateEarningMetricBody, UpdateProfileResponse, UpdateEarningMetricResponse } from "@workspace/api-zod";
import { getOrCreateProfile, updateProfileRecord } from "../lib/profile";
import { getEarningsSummary, setEarningMetric } from "../lib/earnings";

const router: IRouter = Router();

router.put("/admin/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await getOrCreateProfile();
  const profile = await updateProfileRecord(parsed.data);
  const earnings = await getEarningsSummary();

  res.json(
    UpdateProfileResponse.parse({
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

router.put("/admin/earnings", async (req, res): Promise<void> => {
  const parsed = UpdateEarningMetricBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const earnings = await setEarningMetric(parsed.data.field, parsed.data.amount);
  const profile = await getOrCreateProfile();

  res.json(
    UpdateEarningMetricResponse.parse({
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
