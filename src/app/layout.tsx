import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"

export const metadata: Metadata = {
  title: "Secondary Cockpit - Lendz Financial",
  description: "Management cockpit for Lendz Financial secondary operations",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full font-sans">
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 max-w-7xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
