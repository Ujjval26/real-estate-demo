/**
 * Smoke-test the Prisma + Turso connection by counting rows in every table.
 * Run with:  bun run scripts/check-db.ts
 */
import { db } from "../src/lib/db";

async function main() {
  const [users, properties, images, favs, searches, msgs, viewings, reviews] =
    await Promise.all([
      db.user.count(),
      db.property.count(),
      db.propertyImage.count(),
      db.favourite.count(),
      db.savedSearch.count(),
      db.message.count(),
      db.viewingRequest.count(),
      db.review.count(),
    ]);

  console.log("Turso connection OK — row counts:");
  console.log({ users, properties, images, favs, searches, msgs, viewings, reviews });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
