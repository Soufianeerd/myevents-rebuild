import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';
// Next.js inlines bootstrap scripts, hence 'unsafe-inline' without nonces.
// Uploads go straight to the signed storage endpoint (https), and the Studio
// embeds YouTube (no-cookie) and Spotify players.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https:${isDev ? ' ws:' : ''}`,
  'frame-src https://www.youtube-nocookie.com https://open.spotify.com',
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');
const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(self), geolocation=(), payment=()',
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfkit'],
  outputFileTracingIncludes: {
    '/events/*/cartes/pdf': [
      './public/fonts/*.ttf',
      './public/images/editorial/*.jpg',
    ],
  },
  async headers() {
    const privateLinks = ['/i/:path*', '/souvenirs/:path*'].map((source) => ({
      source,
      headers: [
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      ],
    }));
    return [{ source: '/:path*', headers: securityHeaders }, ...privateLinks];
  },
  outputFileTracingExcludes: {
    '/*': [
      '.data/**',
      '.data-*/**',
      '.env*',
      'test-results/**',
      'playwright-report/**',
    ],
  },
};

export default nextConfig;
