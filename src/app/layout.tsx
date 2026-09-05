import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaManager } from '@/components/pwa/PwaManager';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0d0e' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taskflow.187.52.126.215.sslip.io';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'ODST Task Management — Modern Team Workspace & Project Management',
    template: '%s | ODST Task Management',
  },
  description:
    'ODST Task Management is a modern team workspace, real-time Kanban board, Notion-style documentation platform, and collaboration suite by ODST Group Indonesia.',
  keywords: [
    'ODST Task Management',
    'Task Management',
    'Kanban Board',
    'Notion Notes',
    'Project Management',
    'ODST Group Indonesia',
    'ODST Platform',
    'Team Collaboration',
    'Task Management Application',
    'Self-Hosted Workspace',
  ],
  authors: [{ name: 'ODST Group Indonesia' }, { name: 'ODST Platform' }],
  creator: 'ODST Group Indonesia',
  publisher: 'ODST Platform',
  applicationName: 'ODST Task Management',
  category: 'productivity',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ODST Task Management — Modern Team Workspace & Project Management',
    description:
      'All-in-one team workspace with real-time Kanban boards, Notion-style block notes, activity stream, and role permissions.',
    url: baseUrl,
    siteName: 'ODST Task Management',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'ODST Task Management Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ODST Task Management — Modern Team Workspace',
    description:
      'All-in-one team workspace with real-time Kanban boards, Notion-style block notes, and role permissions.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ODST Task Management',
    url: baseUrl,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description:
      'Modern workspace with real-time Kanban boards, Notion-style block notes, team collaboration, and VPS Docker self-hosting.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'ODST Group Indonesia',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ODST Platform',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  };

  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="ODST Task Management" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ODST Task" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('taskflow_theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}

              // Early PWA Install Prompt Listener (Capture before React hydration)
              window.__PWA_PROMPT__ = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__PWA_PROMPT__ = e;
                window.dispatchEvent(new CustomEvent('pwa-prompt-captured'));
              });

              // Register Service Worker early
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased select-none min-h-screen bg-neutral-50 dark:bg-[#0d0d0e] text-neutral-900 dark:text-neutral-100">
        {children}
        <PwaManager />
      </body>
    </html>
  );
}
