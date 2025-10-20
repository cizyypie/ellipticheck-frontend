"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";

const links: Array<{ href: string; label: string }> = [
  { href: "/issuer", label: "Issuer" },
  { href: "/verifier", label: "Verifier" },
];

export default function Navbar() {
  const pathname = usePathname();
  const currentPath = pathname ?? "/";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          ElliptiCheck
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
          {links.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-slate-900 ${
                  isActive ? "text-slate-900" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="sm:hidden">
          <Link
            href={currentPath === "/issuer" ? "/verifier" : "/issuer"}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            {currentPath === "/issuer" ? "Verifier" : "Issuer"}
          </Link>
        </div>
        <WalletButton />
      </nav>
    </header>
  );
}