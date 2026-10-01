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
  | "ADMIN_DEBIT"
  | "ORGANIZER_EARNING"
  | "ORGANIZER_EARNING_REVERSAL";

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

// Vantix keeps a 10% commission on every paid team registration; the
// organizer's wallet is credited the remaining 90%.
export const ORGANIZER_PAYOUT_SHARE = 0.9;

// Entry fees for a real organizer's tournament are paid to Vantix directly
// (via the platform's own UPI, or a player's Vantix wallet), so the organizer
// never sees that money change hands — this is how it reaches them instead:
// once a paid registration is verified, we credit their Vantix wallet for
// 90% of the entry fee (Vantix keeps the other 10% as commission), and they
// cash out later via a withdrawal request. Bot-organized filler tournaments
// never earn real money, so isBotOrganizer short-circuits both the credit
// and its reversal.
export async function creditOrganizerEarning(
  organizerId: string,
  isBotOrganizer: boolean,
  amount: number,
  note: string
) {
  if (isBotOrganizer || amount <= 0) return;
  const payout = Math.round(amount * ORGANIZER_PAYOUT_SHARE * 100) / 100;
  await creditWallet(organizerId, payout, "ORGANIZER_EARNING", `${note} (90% after 10% platform commission)`);
}

export async function reverseOrganizerEarning(
  organizerId: string,
  isBotOrganizer: boolean,
  amount: number,
  note: string
) {
  if (isBotOrganizer || amount <= 0) return;
  const payout = Math.round(amount * ORGANIZER_PAYOUT_SHARE * 100) / 100;
  await creditWallet(organizerId, -payout, "ORGANIZER_EARNING_REVERSAL", note);
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
