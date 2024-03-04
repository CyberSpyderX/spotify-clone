/** @type {import('next').NextConfig} */

import Analyser from '@next/bundle-analyzer';

const withBundleAnalyzer = Analyser({
    enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
    images: {
        domains: [
            "gjxpeuintxbmqwrgvhge.supabase.co",
            "i.scdn.co",
            "open.spotifycdn.com"
        ]
    },
    webpack: (config, { isServer }) => {
        config.resolve.fallback = { fs: false };
        
        return config;
    },
    typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default withBundleAnalyzer(nextConfig);
