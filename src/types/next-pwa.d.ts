declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface RuntimeCaching {
    urlPattern: RegExp | string;
    handler: string;
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
      };
      cacheableResponse?: {
        statuses?: number[];
        headers?: Record<string, string>;
      };
      networkTimeoutSeconds?: number;
      backgroundSync?: {
        name: string;
        options?: {
          maxRetentionTime?: number;
        };
      };
    };
  }
  
  type PWAConfig = {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: RuntimeCaching[];
    publicExcludes?: string[];
    buildExcludes?: string[] | RegExp[];
  };
  
  export default function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}
