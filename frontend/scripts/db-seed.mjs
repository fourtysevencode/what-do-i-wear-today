// Creates (or resets the passwords of) the local test accounts.
// Usage: npm run db:seed   (reads .env.local)
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to frontend/.env.local.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// Test-only credentials. The login field accepts any text, not just emails.
const testUsers = [
  { email: "test", username: "test", password: "test47" },
  { email: "test2", username: "test2", password: "test47" },
];

for (const user of testUsers) {
  const passwordHash = await bcrypt.hash(user.password, 12);
  await sql`
    insert into users (email, username, password_hash)
    values (${user.email}, ${user.username}, ${passwordHash})
    on conflict (email) do update set password_hash = excluded.password_hash
  `;
  console.log(`seeded ${user.email} (@${user.username})`);
}
