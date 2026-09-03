"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  Brain,
  Settings,
  FileText,
  Sparkles,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const navGroups = [
  {
    label: "nav.main",
    items: [
      { href: "/", icon: LayoutGrid, label: "nav.library" },
      { href: "/suggestions", icon: Sparkles, label: "nav.suggestions" },
      { href: "/glossary", icon: BookOpen, label: "nav.glossary" },
    ],
  },
  {
    label: "nav.tools",
    items: [
      { href: "/memory", icon: Brain, label: "nav.memory" },
      { href: "/config", icon: Settings, label: "nav.config" },
    ],
  },
  {
    label: "nav.guides",
    items: [
      { href: "/docs/prompt-guide", icon: FileText, label: "nav.guide" },
      { href: "/docs/memory-guide", icon: GraduationCap, label: "nav.memoryGuide" },
      { href: "/docs/config-guide", icon: GraduationCap, label: "nav.configGuide" },
    ],
  },
];

export default function Sidebar({ session }) {
  const { t, lang } = useI18n();
  const pathname = usePathname();

  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href="/" className="sidebar-logo">
          <span className="sidebar-logo-dot" />
          Happy Code
        </Link>
        <p style={{ fontSize: "0.72rem", color: "var(--text-faint)", margin: "4px 0 0", paddingLeft: 18 }}>
          {t("app.tagline")}
        </p>
      </div>

      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="sidebar-section-label">{t(group.label)}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${active ? "active" : ""}`}
                >
                  <Icon size={16} />
                  {t(item.label)}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {session?.userId && (
        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 4 }}>
            {session.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.avatarUrl} alt="" width={28} height={28} style={{ borderRadius: "50%" }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.name || session.githubLogin}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
                @{session.githubLogin}
              </div>
            </div>
          </div>
          <button className="sidebar-link" onClick={handleLogout} style={{ color: "var(--text-muted)" }}>
            <LogOut size={16} />
            {t("common.logout")}
          </button>
        </div>
      )}
    </aside>
  );
}
