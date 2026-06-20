"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface NavLinkProps {
  href: string;
  label: string;
  Icon: LucideIcon;
}

export function NavLink({ href, label, Icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
      style={{
        background: isActive ? "var(--color-bg-hover)" : "transparent",
        color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)",
        fontWeight: isActive ? 600 : 400,
      }}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
