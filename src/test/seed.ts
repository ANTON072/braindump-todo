import { db } from "@/db";
import { user } from "@/db/auth-schema";

export async function seedUser(email: string): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(user).values({
    id,
    name: email.split("@")[0],
    email,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}
