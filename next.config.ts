import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
