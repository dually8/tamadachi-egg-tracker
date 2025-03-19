import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="grid grid-cols-3 auto-rows-auto gap-4 p-4">
            <nav className="col-start-3">
              <ThemeToggle />
            </nav>
            <div className="col-start-2 row-start-2">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
