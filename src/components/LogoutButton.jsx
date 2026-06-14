"use client";

import { LogOut } from "lucide-react";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <button className="btn btn-ghost" type="button" onClick={logout} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <LogOut size={16} /> Salir
    </button>
  );
}
