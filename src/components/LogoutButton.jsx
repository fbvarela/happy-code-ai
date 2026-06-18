"use client";

import { LogOut } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function LogoutButton() {
  const { t } = useI18n();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <button className="btn btn-ghost" type="button" onClick={logout} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <LogOut size={16} /> {t("common.logout")}
    </button>
  );
}
