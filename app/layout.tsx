import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Finance Tracker",
  description: "Upload your statements. See where your money goes."
};

const nav = ["dashboard", "transactions", "imports", "accounts", "settings"];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-7xl px-6 py-8">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Upload your statements. See where your money goes.</h1>
              <p className="text-sm text-slate-600">
                A clean personal finance tracker that turns bank and credit card statements into organized transactions, charts, and spending insights.
              </p>
            </div>
            <nav className="flex gap-4 text-sm">
              {nav.map((item) => (
                <Link key={item} href={`/${item}`} className="capitalize text-slate-700 hover:text-slate-900">
                  {item}
                </Link>
              ))}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
