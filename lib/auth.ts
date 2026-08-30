import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Admin credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        const adminEmail = process.env.ADMIN_EMAIL;
        const passwordHash = process.env.ADMIN_PASSWORD_HASH;
        if (
          !parsed.success ||
          !adminEmail ||
          !passwordHash ||
          parsed.data.email.toLowerCase() !== adminEmail.toLowerCase()
        )
          return null;
        const valid = await compare(parsed.data.password, passwordHash);
        return valid
          ? { id: "site-admin", name: "Florian Ullmann", email: adminEmail }
          : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = "admin";
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.name = token.name ?? "Site admin";
      return session;
    },
  },
};
