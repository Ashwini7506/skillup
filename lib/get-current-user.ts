import { userRequired } from "@/app/data/user/is-user-authenticated";
import { db } from "@/lib/db";

export async function getCurrentUserServer() {
  const { user: kindeUser } = await userRequired(); // redirects if not authed

  if (!kindeUser) {
    throw new Error("Kinde user missing after auth check.");
  }

  let dbUser =
    (kindeUser.email &&
      (await db.user.findUnique({
        where: { email: kindeUser.email },
      }))) ||
    (await db.user.findUnique({
      where: { id: kindeUser.id },
    }));

  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        id: kindeUser.id,
        name:
          [kindeUser.given_name, kindeUser.family_name].filter(Boolean).join(" ") ||
          kindeUser.email ||
          "Unnamed User",
        email: kindeUser.email ?? `${kindeUser.id}@no-email.kinde.local`,
        role: "member",
        job: "Learner",
      },
    });
  }

  return dbUser;
}
