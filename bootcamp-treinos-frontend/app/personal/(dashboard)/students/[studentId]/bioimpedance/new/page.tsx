import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateBioimpedanceRecordForm } from "../_components/create-bioimpedance-record-form";

export default async function NewBioimpedanceRecordPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="flex min-h-svh flex-col gap-6 bg-background px-5 py-8 pb-16">
      <div className="flex items-center gap-3">
        <Link href={`/personal/students/${studentId}/bioimpedance`}>
          <ArrowLeft className="size-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Nova medição
        </h1>
      </div>

      <CreateBioimpedanceRecordForm studentId={studentId} />
    </div>
  );
}
