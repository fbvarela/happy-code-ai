"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/** Single consistent back affordance: a small bark-tinted link, top-left,
 *  before/at the page title. Use <BackLink /> for "back to home" or pass
 *  href for a specific parent (e.g. /config from its guide, /glossary from
 *  a detail page). */
export default function BackLink({ href = "/", label }) {
  const { t } = useI18n();
  return (
    <Link href={href} className="back-link">
      <ArrowLeft size={14} />
      <span>{label ?? t("nav.back")}</span>
    </Link>
 );
}
