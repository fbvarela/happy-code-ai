import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import Sidebar from "@/components/Sidebar";
import { LanguageProvider, langScript } from "@/lib/i18n";
import { getSession } from "@/lib/session";

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export const metadata = {
  title: "Happy Code — Agent Artifact Manager",
  description:
    "Crea, almacena y publica artefactos de agentes de IA (OpenCode y más) con el mínimo de tokens.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  const isAuth = !!session?.userId;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
      </head>
      <body>
        <LanguageProvider>
          <div className="app-layout">
            {isAuth && <Sidebar session={session} />}
            <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
              <div className="topbar-row">
                <ThemeToggle />
                <LanguageToggle />
              </div>
              {children}
            </div>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
