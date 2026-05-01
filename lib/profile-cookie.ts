import { cookies } from "next/headers";

export const PROFILE_COOKIE = "profileId";

export async function getProfileId(): Promise<string | null> {
  const store = await cookies();
  return store.get(PROFILE_COOKIE)?.value ?? null;
}
