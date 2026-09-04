import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import SideMenu from "@/components/SideMenu";
import { LanguageProvider, langScript } from "@/lib/i18n";

// Runs before paint to set the theme class, avoiding a flash of the wrong
// theme. Honors an explicit choice in localStorage, else the OS preference.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export const metadata = {
  title: "Happy Code — Agent Artifact Manager",
  description:
    "Crea, almacena y publica artefactos de agentes de IA (OpenCode y más) con el mínimo de tokens.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#3d2b1f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
      </head>
      <body>
        <LanguageProvider>
          <SideMenu />
          <LanguageToggle />
          <ThemeToggle />
          <main className="app-shell">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
