import "dotenv/config";
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

  // ─── Demo Mode data (Task 21, Part C/D) ──────────────────────────────
  // Duplicated here rather than imported from src/lib/demo.ts: that
  // module starts with `import "server-only"`, which throws when
  // loaded outside a Next.js server-component build (this seed script
  // runs under plain tsx/node). Keep these values in sync by hand.
  const DEMO_ADMIN_EMAIL = "demo-admin@assetflow.dev";
  const DEMO_EMPLOYEE_EMAIL = "demo-employee@assetflow.dev";
  const DEMO_SUPER_ADMIN_EMAIL = "demo-super-admin@assetflow.dev";
  const DEMO_EMPLOYEE_CODE = "DEMO-0001";
  const demoAdminPassword = await bcrypt.hash(
    process.env.DEMO_ADMIN_PASSWORD || "DemoAdmin@2026",
    12
  );
  const demoEmployeePassword = await bcrypt.hash(
    process.env.DEMO_EMPLOYEE_PASSWORD || "DemoEmployee@2026",
    12
  );
  const demoSuperAdminPassword = await bcrypt.hash(
    process.env.DEMO_SUPER_ADMIN_PASSWORD || "DemoSuperAdmin@2026",
    12
  );

  const demoAdmin = await prisma.user.upsert({
    where: { email: DEMO_ADMIN_EMAIL },
    update: {},
    create: {
      name: "Demo Admin",
      email: DEMO_ADMIN_EMAIL,
      role: "ADMIN",
      passwordHash: demoAdminPassword,
      onboardingRequired: false,
      status: "ACTIVE",
    },
  });

  // Demo Super Admin: stored with role ADMIN on purpose. The SUPER_ADMIN
  // role is granted only in the session (see resolveSessionRole in
  // src/lib/demo.ts), so no SUPER_ADMIN row exists for the demo.
  const demoSuperAdmin = await prisma.user.upsert({
    where: { email: DEMO_SUPER_ADMIN_EMAIL },
    update: {},
    create: {
      name: "Demo Super Admin",
      email: DEMO_SUPER_ADMIN_EMAIL,
      role: "ADMIN",
      passwordHash: demoSuperAdminPassword,
      onboardingRequired: false,
      status: "ACTIVE",
    },
  });

  const demoEmployeeUser = await prisma.user.upsert({
    where: { email: DEMO_EMPLOYEE_EMAIL },
    update: {},
    create: {
      name: "Demo Employee",
      email: DEMO_EMPLOYEE_EMAIL,
      role: "EMPLOYEE",
      passwordHash: demoEmployeePassword,
      onboardingRequired: false,
      status: "ACTIVE",
    },
  });

  const demoEmployee = await prisma.employee.upsert({
    where: { employeeCode: DEMO_EMPLOYEE_CODE },
    update: { userId: demoEmployeeUser.id },
    create: {
      userId: demoEmployeeUser.id,
      employeeCode: DEMO_EMPLOYEE_CODE,
      name: demoEmployeeUser.name,
      email: demoEmployeeUser.email,
      department: "Demo",
      designation: "Demo Employee",
    },
  });

  const demoAssetSeeds = [
    {
      assetTag: "DEMO-AST-0001",
      name: "Demo MacBook Pro 14\"",
      type: "Laptop",
      brand: "Apple",
      model: "MacBook Pro 14 M3",
      processor: "Apple M3 Pro",
      ram: "18GB",
      storage: "512",
      storageType: "SSD",
      status: "ASSIGNED" as const,
    },
    {
      assetTag: "DEMO-AST-0002",
      name: "Demo Dell UltraSharp Monitor",
      type: "Monitor",
      brand: "Dell",
      model: "U2723QE",
      status: "AVAILABLE" as const,
    },
    {
      assetTag: "DEMO-AST-0003",
      name: "Demo iPhone 15",
      type: "Phone",
      brand: "Apple",
      model: "iPhone 15",
      storage: "128",
      storageType: "SSD",
      status: "IN_REPAIR" as const,
    },
    {
      assetTag: "DEMO-AST-0004",
      name: "Demo Logitech Keyboard",
      type: "Accessory",
      brand: "Logitech",
      model: "MX Keys",
      status: "RETIRED" as const,
    },
    {
      assetTag: "DEMO-AST-0005",
      name: "Demo iPad Air",
      type: "Tablet",
      brand: "Apple",
      model: "iPad Air 5",
      storage: "256",
      storageType: "SSD",
      status: "AVAILABLE" as const,
    },
  ];

  const demoAssets: Record<string, { id: string }> = {};
  for (const seed of demoAssetSeeds) {
    const { assetTag, ...rest } = seed;
    demoAssets[assetTag] = await prisma.asset.upsert({
      where: { assetTag },
      update: {},
      create: { assetTag, ...rest },
    });
  }

  // Active assignment: demo employee currently has the demo laptop.
  const existingDemoAssignment = await prisma.assetAssignment.findFirst({
    where: { assetId: demoAssets["DEMO-AST-0001"].id, employeeId: demoEmployee.id, status: "ACTIVE" },
  });
  if (!existingDemoAssignment) {
    await prisma.assetAssignment.create({
      data: {
        assetId: demoAssets["DEMO-AST-0001"].id,
        employeeId: demoEmployee.id,
        status: "ACTIVE",
      },
    });
  }

  // Active maintenance record on the demo phone (IN_REPAIR).
  const existingDemoMaintenance = await prisma.maintenanceRecord.findFirst({
    where: { assetId: demoAssets["DEMO-AST-0003"].id, completedAt: null },
  });
  if (!existingDemoMaintenance) {
    await prisma.maintenanceRecord.create({
      data: {
        assetId: demoAssets["DEMO-AST-0003"].id,
        issue: "Cracked screen",
        description: "Screen replacement needed after drop damage.",
        vendor: "Demo Repair Co.",
      },
    });
  }

  // Pending asset request: demo employee requesting the demo tablet.
  const existingDemoRequest = await prisma.assetRequest.findFirst({
    where: { assetId: demoAssets["DEMO-AST-0005"].id, employeeId: demoEmployee.id, status: "PENDING" },
  });
  if (!existingDemoRequest) {
    await prisma.assetRequest.create({
      data: {
        assetId: demoAssets["DEMO-AST-0005"].id,
        employeeId: demoEmployee.id,
        reason: "Need a tablet for on-site client demos.",
        status: "PENDING",
      },
    });
  }

  // Pending reimbursement tied to the demo employee's assigned laptop.
  const existingDemoReimbursement = await prisma.reimbursement.findFirst({
    where: { assetId: demoAssets["DEMO-AST-0001"].id, employeeId: demoEmployee.id, status: "PENDING" },
  });
  if (!existingDemoReimbursement) {
    await prisma.reimbursement.create({
      data: {
        assetId: demoAssets["DEMO-AST-0001"].id,
        employeeId: demoEmployee.id,
        amount: "42.99",
        description: "USB-C dock purchased for remote work setup.",
        receiptReference: "DEMO-RCPT-0001",
        status: "PENDING",
      },
    });
  }

  // A notification for the demo admin so the bell isn't empty on first look.
  const existingDemoNotification = await prisma.notification.findFirst({
    where: { userId: demoAdmin.id, title: "New asset request" },
  });
  if (!existingDemoNotification) {
    await prisma.notification.create({
      data: {
        userId: demoAdmin.id,
        title: "New asset request",
        message: "Demo Employee has requested Demo iPad Air (DEMO-AST-0005).",
        link: "/asset-requests",
      },
    });
  }

  console.log("Seeded demo accounts:");
  console.log(`  Demo Admin:    ${demoAdmin.email}`);
  console.log(`  Demo Super Admin: ${demoSuperAdmin.email}`);
  console.log(`  Demo Employee: ${demoEmployeeUser.email}`);
  console.log("Seeded 5 demo assets, 1 assignment, 1 maintenance record, 1 asset request, 1 reimbursement.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
