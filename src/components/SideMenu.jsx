"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Boxes,
  BrainCircuit,
  ChevronRight,
  FilePlus2,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Network,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LogoutButton from "@/components/LogoutButton";

const groups = [
  {
    label: "main",
    items: [
      { href: "/", label: "home", icon: LayoutDashboard, exact: true },
      { href: "/artifacts/new", label: "new", icon: FilePlus2 },
      { href: "/suggestions", label: "suggestions", icon: Sparkles },
    ],
  },
  {
    label: "tools",
    items: [
      { href: "/config", label: "config", icon: Settings2 },
      { href: "/memory", label: "memory", icon: BrainCircuit },
      { href: "/glossary", label: "glossary", icon: BookOpen },
      { href: "/prompt-settings", label: "promptSettings", icon: Sparkles },
    ],
  },
  {
    label: "guides",
    items: [
      { href: "/docs/prompt-guide", label: "guide", icon: HelpCircle },
      { href: "/docs/config-guide", label: "configGuide", icon: Network },
      { href: "/docs/openspec", label: "openspec", icon: Boxes },
    ],
  },
];

function isActive(pathname, item) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function Navigation({ pathname, t, onNavigate }) {
  return (
    <nav className="side-menu-nav" aria-label="Application navigation">
      {groups.map((group) => (
        <div className="side-menu-group" key={group.label}>
          <p className="side-menu-label">{t(`menu.${group.label}`)}</p>
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);
            return (
              <Link
                className={`side-menu-link${active ? " is-active" : ""}`}
                href={item.href}
                key={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={17} strokeWidth={active ? 2.4 : 1.8} />
                <span>{t(`menu.${item.label}`)}</span>
                {active && <ChevronRight className="side-menu-current" size={15} />}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default function SideMenu() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  // Session identity for the footer (avatar/@login + logout). The middleware
  // only renders the app behind auth, so /api/auth/me answers here; on 401 we
  // just keep the neutral footer.
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (pathname === "/login") return;
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setMe(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname]);

  if (pathname === "/login") return null;

  return (
    <>
      <button className="side-menu-mobile-toggle" type="button" onClick={() => setOpen(true)} aria-label={t("menu.open")}>
        <Menu size={21} />
      </button>
      {open && <button className="side-menu-backdrop" type="button" aria-label={t("menu.close")} onClick={() => setOpen(false)} />}
      <aside className={`side-menu${open ? " is-open" : ""}`}>
        <div className="side-menu-brand">
          <Link href="/" onClick={() => setOpen(false)}>
            <span className="side-menu-mark"><Network size={18} /></span>
            <span><strong>Happy</strong> Code</span>
          </Link>
          <button className="side-menu-close" type="button" onClick={() => setOpen(false)} aria-label={t("menu.close")}>
            <X size={19} />
          </button>
        </div>
        <div className="side-menu-rule" />
        <Navigation pathname={pathname} t={t} onNavigate={() => setOpen(false)} />
        <div className="side-menu-footer">
          {me ? (
            <>
              {me.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="side-menu-avatar"
                  src={me.avatarUrl.includes("?") ? `${me.avatarUrl}&s=64` : `${me.avatarUrl}?s=64`}
                  alt=""
                  width={26}
                  height={26}
                />
              )}
              <span className="side-menu-login">@{me.githubLogin}</span>
              <LogoutButton compact />
            </>
          ) : (
            <span className="side-menu-version">v1</span>
          )}
        </div>
      </aside>
    </>
  );
}
