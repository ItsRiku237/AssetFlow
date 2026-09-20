/**
 * Bootstrap script: promote one existing ADMIN account to SUPER_ADMIN.
 *
 * Usage:
 *   npx tsx scripts/promote-super-admin.ts --email you@example.com
 *
 * Rules:
 *   - The account must already exist in the database.
 *   - The account must currently have role = ADMIN.
 *   - If it is already SUPER_ADMIN the script exits cleanly (idempotent).
 *   - No other rows are modified.
 *   - No migrations are run.
 *   - No passwords are changed.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ─── Parse --email argument ──────────────────────────────────────────────────

const emailArg = (() => {
  const idx = process.argv.indexOf("--email");
  const val = idx !== -1 ? process.argv[idx + 1] : undefined;
  if (!val || val.startsWith("--")) {
    console.error("Error: --email <address> is required.");
    console.error("Usage: npx tsx scripts/promote-super-admin.ts --email you@example.com");
    process.exit(1);
  }
  return val.toLowerCase().trim();
})();

// ─── DB client (same pattern as seed.ts) ────────────────────────────────────

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: emailArg },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    console.error(`Error: No account found with email "${emailArg}".`);
    console.error("The account must already exist. This script does not create users.");
    process.exit(1);
  }

  if (user.role === "SUPER_ADMIN") {
    console.log(`✓ "${user.name}" (${user.email}) is already SUPER_ADMIN. Nothing to do.`);
    return;
  }

  if (user.role !== "ADMIN") {
    console.error(
      `Error: "${user.name}" (${user.email}) has role "${user.role}". ` +
      "Only ADMIN accounts can be promoted to SUPER_ADMIN via this script."
    );
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "SUPER_ADMIN" },
  });

  console.log(`✓ Promoted "${user.name}" (${user.email}) from ADMIN → SUPER_ADMIN.`);
  console.log("  Sign out and sign back in for the change to take effect in your session.");
}

main()
  .catch((err) => {
    console.error("Unexpected error:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
