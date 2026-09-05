import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TaskFlow Workspace — Manazil Al Mukhtara Group',
    short_name: 'TaskFlow',
    description: 'Modern team task management, Kanban board, and Notion-style documentation platform.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#4338ca',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
