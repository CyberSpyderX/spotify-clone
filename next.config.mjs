/** @type {import('next').NextConfig} */

import Analyser from '@next/bundle-analyzer';

const withBundleAnalyzer = Analyser({
    enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
    images: {
        domains: [
            "gjxpeuintxbmqwrgvhge.supabase.co"
        ]
    },
    webpack: (config, { isServer }) => {
        config.resolve.fallback = { fs: false };
        
        return config;
    },
};

export default withBundleAnalyzer(nextConfig);
