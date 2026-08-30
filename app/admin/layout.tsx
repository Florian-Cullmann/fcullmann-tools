import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { authOptions } from "@/lib/auth";
import "@/app/globals.css";

const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <html lang="en" className={sans.variable}><body className="admin-body"><AdminShell>{children}</AdminShell></body></html>;
}
