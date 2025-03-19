import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Egg Prices',
  description: 'Check the latest egg prices in your area.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <div className="grid md:grid-cols-6 auto-rows-auto gap-4 p-4">
            <nav className="md:col-start-6 justify-self-end">
              <ThemeToggle />
            </nav>
            <section className="md:col-start-2 md:col-span-4">{children}</section>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
