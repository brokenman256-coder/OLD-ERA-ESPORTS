import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "arpanattri73@gmail.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_NAME || "Old Era Esports Admin";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", isBanned: false },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Admin account ready: ${admin.email} (role: ${admin.role})`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`Default password is "${password}" — log in and change it immediately.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
