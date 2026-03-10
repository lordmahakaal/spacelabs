import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Spacelabs - Democratizing AI for Everyone',
  description: 'Spacelabs is a non-profit organization providing comprehensive inference services for open-source AI models. Fight for freedom with cutting-edge AI solutions.',
  keywords: 'AI, open-source, inference, non-profit, machine learning, democratizing AI',
  generator: 'v0.app',
  verification: {
    yandex: 'bd22edcc3f60eab0',
  },
  openGraph: {
    title: 'Spacelabs - Democratizing AI for Everyone',
    description: 'Comprehensive inference services for open-source AI models and cutting edge solutions for everyone',
    type: 'website',
    url: 'https://spacelabs.pro',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
