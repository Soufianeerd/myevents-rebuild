import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfkit'],
  outputFileTracingIncludes: {
    '/events/*/cartes/pdf': [
      './public/fonts/*.ttf',
      './public/images/editorial/*.jpg',
    ],
  },
  async headers() {
    return ['/i/:path*', '/souvenirs/:path*'].map((source) => ({
      source,
      headers: [
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      ],
    }));
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
