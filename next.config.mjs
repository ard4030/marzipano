/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        // formats: ['image/webp','image/jpeg','image/jpg'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'frontme.storage.c2.liara.space',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'marzipano1.storage.c2.liara.space',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'https://marzipano-two.vercel.app',
                port: '',
                pathname: '/**',
            },

        ]
    }
};

export default nextConfig;
