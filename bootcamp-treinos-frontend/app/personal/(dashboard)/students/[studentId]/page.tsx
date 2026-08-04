import Link from "next/link";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import {
  getStudent,
  listStudentPaymentRecords,
} from "@/app/_lib/api/fetch-generated";
import { cn } from "@/lib/utils";
import { AddPaymentRecordForm } from "./_components/add-payment-record-form";
import { RenewAccessButton } from "./_components/renew-access-button";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: "Pago",
  PENDING: "Pendente",
  OVERDUE: "Atrasado",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PAID: "bg-primary/10 text-primary",
  PENDING: "bg-muted text-muted-foreground",
  OVERDUE: "bg-destructive/10 text-destructive",
};

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  const [studentResponse, paymentsResponse] = await Promise.all([
    getStudent(studentId),
    listStudentPaymentRecords(studentId),
  ]);

  if (studentResponse.status !== 200) {
    redirect("/personal/students");
  }

  const student = studentResponse.data;
  const payments =
    paymentsResponse.status === 200 ? paymentsResponse.data : [];

  return (
    <div className="flex min-h-svh flex-col gap-6 bg-background px-5 py-8 pb-16">
      <div className="flex items-center gap-3">
        <Link href="/personal/students">
          <ArrowLeft className="size-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-semibold text-foreground">
          {student.name}
        </h1>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="font-heading text-sm text-muted-foreground">
            E-mail
          </span>
          <span className="font-heading text-sm text-foreground">
            {student.email}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-heading text-sm text-muted-foreground">
            Acesso
          </span>
          <span
            className={cn(
              "font-heading text-sm font-semibold",
              student.isAccessExpired ? "text-destructive" : "text-foreground",
            )}
          >
            {student.isAccessExpired
              ? "Expirado"
              : `Expira em ${dayjs(student.accessExpiresAt).format("DD/MM/YYYY")}`}
          </span>
        </div>
        {student.injuries && (
          <div className="flex flex-col gap-1">
            <span className="font-heading text-sm text-muted-foreground">
              Lesões
            </span>
            <span className="font-heading text-sm text-foreground">
              {student.injuries}
            </span>
          </div>
        )}
        {student.metabolicConditions && (
          <div className="flex flex-col gap-1">
            <span className="font-heading text-sm text-muted-foreground">
              Problemas metabólicos
            </span>
            <span className="font-heading text-sm text-foreground">
              {student.metabolicConditions}
            </span>
          </div>
        )}
        <RenewAccessButton studentId={student.id} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Histórico de pagamentos
        </h2>

        <AddPaymentRecordForm studentId={student.id} />

        {payments.length === 0 ? (
          <p className="py-6 text-center font-heading text-sm text-muted-foreground">
            Nenhum pagamento registrado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-heading text-sm font-semibold text-foreground">
                    R${(payment.amountInCents / 100).toFixed(2)}
                  </span>
                  <span className="font-heading text-xs text-muted-foreground">
                    {dayjs(payment.paymentDate).format("DD/MM/YYYY")}
                  </span>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 font-heading text-xs font-semibold uppercase",
                    PAYMENT_STATUS_STYLES[payment.status],
                  )}
                >
                  {PAYMENT_STATUS_LABELS[payment.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
