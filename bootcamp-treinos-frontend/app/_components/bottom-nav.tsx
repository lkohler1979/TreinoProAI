import Link from "next/link";
import {
  House,
  Calendar,
  ChartNoAxesColumn,
  UserRound,
  Utensils,
} from "lucide-react";
import dayjs from "dayjs";
import { getHomeData } from "@/app/_lib/api/fetch-generated";
import { cn } from "@/lib/utils";
import { ChatOpenButton } from "@/app/_components/chat-open-button";

interface BottomNavProps {
  activePage?: "home" | "calendar" | "nutrition" | "stats" | "profile";
}

export async function BottomNav({ activePage = "home" }: BottomNavProps) {
  const today = dayjs();
  const homeData = await getHomeData(today.format("YYYY-MM-DD"));

  const calendarHref =
    homeData.status === 200 && homeData.data.activeWorkoutPlanId
      ? `/workout-plans/${homeData.data.activeWorkoutPlanId}`
      : null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[480px] items-center justify-center gap-4 rounded-t-[20px] border border-border bg-background px-4 py-4">
      <Link href="/" className="p-2.5">
        <House
          className={cn(
            "size-6",
            activePage === "home" ? "text-foreground" : "text-muted-foreground"
          )}
        />
      </Link>
      {calendarHref ? (
        <Link href={calendarHref} className="p-2.5">
          <Calendar
            className={cn(
              "size-6",
              activePage === "calendar"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          />
        </Link>
      ) : (
        <button className="p-2.5">
          <Calendar
            className={cn(
              "size-6",
              activePage === "calendar"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          />
        </button>
      )}
      <Link href="/nutrition" className="p-2.5">
        <Utensils
          className={cn(
            "size-6",
            activePage === "nutrition"
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        />
      </Link>
      <ChatOpenButton />
      <Link href="/stats" className="p-2.5">
        <ChartNoAxesColumn
          className={cn(
            "size-6",
            activePage === "stats"
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        />
      </Link>
      <Link href="/profile" className="p-2.5">
        <UserRound
          className={cn(
            "size-6",
            activePage === "profile"
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        />
      </Link>
    </nav>
  );
}
