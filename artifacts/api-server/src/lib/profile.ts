import { eq } from "drizzle-orm";
import { db, profileTable } from "@workspace/db";
import type { Profile } from "@workspace/db";

const DEFAULT_PROFILE = {
  name: "Digital Arman",
  affiliateId: "GK-8749513",
  packageLabel: "Silver Package",
  photoUrl: null as string | null,
};

export async function getOrCreateProfile(): Promise<Profile> {
  const [existing] = await db.select().from(profileTable).limit(1);
  if (existing) {
    return existing;
  }

  const [created] = await db.insert(profileTable).values(DEFAULT_PROFILE).returning();
  return created;
}

export async function updateProfileRecord(input: {
  name: string;
  affiliateId: string;
  packageLabel: string;
  photoUrl?: string | null;
}): Promise<Profile> {
  const current = await getOrCreateProfile();

  const [updated] = await db
    .update(profileTable)
    .set({
      name: input.name,
      affiliateId: input.affiliateId,
      packageLabel: input.packageLabel,
      photoUrl: input.photoUrl ?? null,
    })
    .where(eq(profileTable.id, current.id))
    .returning();

  return updated;
}
