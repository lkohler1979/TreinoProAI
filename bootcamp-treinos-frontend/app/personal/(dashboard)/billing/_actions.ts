"use server";

import { revalidatePath } from "next/cache";
import {
  activateSubscription,
  type ActivateSubscriptionBody,
} from "@/app/_lib/api/fetch-generated";

export async function activateSubscriptionAction(
  planTier: ActivateSubscriptionBody["planTier"],
) {
  await activateSubscription({ planTier });
  revalidatePath("/personal/billing");
}
