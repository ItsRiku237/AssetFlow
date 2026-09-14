import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("Admin@12345", 12);
  const employeePassword = await bcrypt.hash("Employee@12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@assetflow.dev" },
    update: {},
    create: {
      name: "Ava Admin",
      email: "admin@assetflow.dev",
      role: "ADMIN",
      passwordHash: adminPassword,
    },
  });

  const employeeUser = await prisma.user.upsert({
    where: { email: "employee@assetflow.dev" },
    update: {},
    create: {
      name: "Ethan Employee",
      email: "employee@assetflow.dev",
      role: "EMPLOYEE",
      passwordHash: employeePassword,
    },
  });

  await prisma.employee.upsert({
    where: { userId: employeeUser.id },
    update: {},
    create: {
      userId: employeeUser.id,
      employeeCode: "EMP-0001",
      department: "Engineering",
      designation: "Software Engineer",
    },
  });

  console.log("Seeded users:");
  console.log(`  Admin:    ${admin.email} / Admin@12345`);
  console.log(`  Employee: ${employeeUser.email} / Employee@12345`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
