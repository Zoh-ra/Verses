declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  type PWAConfig = {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: any[];
    publicExcludes?: string[];
    buildExcludes?: string[] | RegExp[];
  };
  
  export default function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}
