import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ZILP — Zimbabwean Indigenous Language Platform",
  description: "Multilingual NLP platform supporting Shona, Ndebele, Tonga, Nambya, and English",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = "dark";
                try {
                  var stored = JSON.parse(localStorage.getItem("zilp-theme") || "{}");
                  if (stored.state && stored.state.theme) theme = stored.state.theme;
                } catch(e) {}
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
