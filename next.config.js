/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: {
        // Disable ESLint during builds for deployment
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Allow production builds to successfully complete even if there are type errors
        ignoreBuildErrors: false,
    },
}

module.exports = nextConfig