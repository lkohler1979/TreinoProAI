import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import {
  getStudent,
  listBioimpedanceRecords,
} from "@/app/_lib/api/fetch-generated";
import { Button } from "@/components/ui/button";
import { BioimpedanceRecordCard } from "./_components/bioimpedance-record-card";

export default async function BioimpedanceHistoryPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  const [studentResponse, recordsResponse] = await Promise.all([
    getStudent(studentId),
    listBioimpedanceRecords(studentId),
  ]);

  if (studentResponse.status !== 200) {
    redirect("/personal/students");
  }

  const records =
    recordsResponse.status === 200 ? recordsResponse.data : [];

  return (
    <div className="flex min-h-svh flex-col gap-6 bg-background px-5 py-8 pb-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/personal/students/${studentId}`}>
            <ArrowLeft className="size-5 text-foreground" />
          </Link>
          <h1 className="font-heading text-lg font-semibold text-foreground">
            Bio-impedância
          </h1>
        </div>
        <Button asChild size="sm" className="gap-1.5 rounded-full">
          <Link href={`/personal/students/${studentId}/bioimpedance/new`}>
            <Plus className="size-4" />
            Nova medição
          </Link>
        </Button>
      </div>

      {records.length === 0 ? (
        <p className="py-10 text-center font-heading text-sm text-muted-foreground">
          Nenhuma medição registrada ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((record) => (
            <BioimpedanceRecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
