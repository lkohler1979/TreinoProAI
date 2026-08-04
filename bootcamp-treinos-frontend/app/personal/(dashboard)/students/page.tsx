import Link from "next/link";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { listStudents } from "@/app/_lib/api/fetch-generated";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function PersonalStudentsPage() {
  const studentsResponse = await listStudents();
  const students =
    studentsResponse.status === 200 ? studentsResponse.data : [];

  return (
    <div className="flex min-h-svh flex-col gap-6 bg-background px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Meus alunos
        </h1>
        <Button asChild size="sm" className="gap-1.5 rounded-full">
          <Link href="/personal/students/new">
            <Plus className="size-4" />
            Adicionar aluno
          </Link>
        </Button>
      </div>

      {students.length === 0 ? (
        <p className="py-10 text-center font-heading text-sm text-muted-foreground">
          Você ainda não tem alunos cadastrados.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/personal/students/${student.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-1">
                <span className="font-heading text-base font-semibold text-foreground">
                  {student.name}
                </span>
                <span className="font-heading text-xs text-muted-foreground">
                  {student.email}
                </span>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 font-heading text-xs font-semibold uppercase",
                  student.isAccessExpired
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary",
                )}
              >
                {student.isAccessExpired
                  ? "Acesso expirado"
                  : `Expira em ${dayjs(student.accessExpiresAt).format("DD/MM/YYYY")}`}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
