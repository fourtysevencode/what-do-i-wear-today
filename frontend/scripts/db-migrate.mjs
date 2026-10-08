// Applies db/schema.sql to the database in DATABASE_URL.
// Usage: npm run db:migrate   (reads .env.local)
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to frontend/.env.local.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");

// The HTTP driver runs one statement per query, so split on ";" at line ends.
const statements = schema
  .split(/;\s*$/m)
  .map((statement) => statement.replace(/^\s*--.*$/gm, "").trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
  console.log("ok:", statement.split("\n")[0]);
}

console.log(`Applied ${statements.length} statements.`);
