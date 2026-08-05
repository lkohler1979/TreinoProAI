import { NotFoundError } from "../errors/index.js";
import { SubscriptionStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  trainerId: string;
}

interface OutputDto {
  status: SubscriptionStatus;
}

export class CancelSubscription {
  async execute(dto: InputDto): Promise<OutputDto> {
    const subscription = await prisma.subscription.findUnique({
      where: { trainerId: dto.trainerId },
    });

    if (!subscription) {
      throw new NotFoundError("Assinatura não encontrada");
    }

    const updated = await prisma.subscription.update({
      where: { trainerId: dto.trainerId },
      data: { status: SubscriptionStatus.CANCELED },
    });

    return { status: updated.status };
  }
}
