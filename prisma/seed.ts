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
    // If the row already exists (re-seed), promote it to SUPER_ADMIN
    // so that the dev seed account is always the bootstrap super-admin.
    update: { role: "SUPER_ADMIN" },
    create: {
      name: "Ava Admin",
      email: "admin@assetflow.dev",
      role: "SUPER_ADMIN",
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
      name: employeeUser.name,
      email: employeeUser.email,
      department: "Engineering",
      designation: "Software Engineer",
    },
  });

  // A directory-only record with no linked account, for exercising
  // the Task 11 "employee without a login" path locally.
  await prisma.employee.upsert({
    where: { employeeCode: "EMP-0002" },
    update: {},
    create: {
      employeeCode: "EMP-0002",
      name: "Priya Patel",
      department: "Design",
      designation: "Product Designer",
    },
  });

  console.log("Seeded users:");
  console.log(`  Admin:    ${admin.email} / Admin@12345`);
  console.log(`  Employee: ${employeeUser.email} / Employee@12345`);
  console.log("Seeded a second employee (EMP-0002) with no linked account.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
