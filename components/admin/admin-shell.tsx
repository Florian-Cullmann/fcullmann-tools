"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  BookOpen,
  Compass,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Wrench,
} from "lucide-react";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/tools", label: "Tools", icon: Wrench },
  { href: "/admin/articles", label: "Articles", icon: BookOpen },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <Compass size={22} />
          <span>fcullmann</span>
          <small>admin</small>
        </Link>
        <nav>
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              className={pathname === href ? "is-active" : ""}
              href={href}
              key={href}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <a href="/en" target="_blank" rel="noreferrer">
            <ExternalLink size={17} />
            View site
          </a>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
