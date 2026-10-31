import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ADMIN_SEED } from "../src/data/employees";
import { defaultSettings } from "../src/data/settings";

const db = new PrismaClient();

async function main() {
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.passwordResetToken.deleteMany();
  await db.service.deleteMany();
  await db.employee.deleteMany();
  await db.appSettings.deleteMany();

  await db.employee.create({
    data: {
      username: ADMIN_SEED.username,
      passwordHash: await bcrypt.hash(ADMIN_SEED.password, 10),
      fullName: ADMIN_SEED.fullName,
      role: ADMIN_SEED.role,
      phone: ADMIN_SEED.phone,
      email: ADMIN_SEED.email,
      active: true,
    },
  });

  await db.appSettings.create({
    data: {
      id: "default",
      ...defaultSettings,
    },
  });

  console.log("Seeded admin account only (username: admin / password: admin).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
