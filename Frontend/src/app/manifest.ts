import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'West Palm Construction Solutions',
    short_name: 'WPCS',
    description: 'Pioneer in Construction Technology - BIM, VDC, and Digital Fabrication Solutions',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAF8',
    theme_color: '#146321',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
