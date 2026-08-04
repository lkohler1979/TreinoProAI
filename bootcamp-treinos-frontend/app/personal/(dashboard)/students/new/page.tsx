import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateStudentForm } from "./_components/create-student-form";

export default function NewStudentPage() {
  return (
    <div className="flex min-h-svh flex-col gap-6 bg-background px-5 py-8">
      <div className="flex items-center gap-3">
        <Link href="/personal/students">
          <ArrowLeft className="size-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Adicionar aluno
        </h1>
      </div>

      <CreateStudentForm />
    </div>
  );
}
