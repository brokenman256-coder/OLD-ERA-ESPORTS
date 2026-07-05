import { prisma } from "@/lib/db";

export class InsufficientBalanceError extends Error {
  constructor() {
    super("Insufficient wallet balance");
  }
}

export type WalletTransactionType =
  | "TOPUP"
  | "WITHDRAWAL"
  | "WITHDRAWAL_REVERSAL"
  | "ENTRY_FEE_PAYMENT"
  | "HOSTING_FEE_PAYMENT"
  | "ADMIN_CREDIT"
  | "ADMIN_DEBIT";

export async function creditWallet(
  userId: string,
  amount: number,
  type: WalletTransactionType,
  note?: string | null
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: amount } },
    });
    await tx.walletTransaction.create({
      data: { userId, type, amount, balanceAfter: user.walletBalance, note: note ?? null },
    });
    return user.walletBalance;
  });
}

export async function debitWallet(
  userId: string,
  amount: number,
  type: WalletTransactionType,
  note?: string | null
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    if (current.walletBalance < amount) throw new InsufficientBalanceError();

    const user = await tx.user.update({
      where: { id: userId },
      data: { walletBalance: { decrement: amount } },
    });
    await tx.walletTransaction.create({
      data: { userId, type, amount: -amount, balanceAfter: user.walletBalance, note: note ?? null },
    });
    return user.walletBalance;
  });
}
