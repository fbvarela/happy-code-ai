import "./globals.css";

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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
