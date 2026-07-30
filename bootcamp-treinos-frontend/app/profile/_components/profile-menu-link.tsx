import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

interface ProfileMenuLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

export function ProfileMenuLink({ href, icon: Icon, label }: ProfileMenuLinkProps) {
  return (
    <Link
      href={href}
      className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
    >
      <div className="flex items-center gap-2.5">
        <Icon className="size-4 text-primary" />
        <span className="font-heading text-sm font-semibold text-foreground">
          {label}
        </span>
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
