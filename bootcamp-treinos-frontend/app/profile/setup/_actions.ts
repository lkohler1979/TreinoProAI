"use server";

import { redirect } from "next/navigation";
import {
  upsertUserTrainData,
  type UpsertUserTrainDataBody,
} from "@/app/_lib/api/fetch-generated";

export async function upsertProfileAction(payload: UpsertUserTrainDataBody) {
  const response = await upsertUserTrainData(payload);
  if (response.status !== 200) {
    throw new Error("Failed to save profile");
  }
  redirect("/");
}
