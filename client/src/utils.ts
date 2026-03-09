export const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Already absolute

    // Clean path separators
    const cleanPath = path.replace(/\\/g, '/');

    // Get the base URL from the environment or use empty string for relative paths
    const isProd = import.meta.env.PROD;
    const defaultApiUrl = isProd
        ? 'https://novatech-backend-bov0.onrender.com/api'
        : 'http://localhost:5000/api';

    const apiBase = import.meta.env.VITE_API_URL || defaultApiUrl;
    const host = apiBase.replace(/\/api\/?$/, '');

    // Ensure it starts with /
    if (!cleanPath.startsWith('/')) {
        return `${host}/${cleanPath}`;
    }

    return `${host}${cleanPath}`;
};
