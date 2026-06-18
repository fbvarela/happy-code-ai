"use client";

import { useI18n } from "@/lib/i18n";

/** Render a translated UI string inside server or client components.
 *  Usage: <T k="nav.glossary" /> or <T k="editor.howToUse" vars={{ type }} /> */
export default function T({ k, vars }) {
  const { t } = useI18n();
  return <>{t(k, vars)}</>;
}
