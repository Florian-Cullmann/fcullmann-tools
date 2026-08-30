import { Public_Sans } from "next/font/google";
import "@/app/globals.css";

const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

export default function LoginLayout({ children }: LayoutProps<"/login">) {
  return <html lang="en" className={sans.variable}><body className="admin-body">{children}</body></html>;
}
