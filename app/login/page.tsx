import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Compass } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/admin");
  return (
    <main className="login-page">
      <section>
        <Compass size={30} />
        <h1>Welcome back.</h1>
        <p>Sign in to manage tools and field notes.</p>
        <LoginForm />
      </section>
    </main>
  );
}
