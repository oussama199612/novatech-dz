export const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Already absolute

    // Clean path separators
    const cleanPath = path.replace(/\\/g, '/');

    // Get the base URL from the environment or use empty string for relative paths
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const host = apiBase.replace(/\/api\/?$/, '');

    // Ensure it starts with /
    if (!cleanPath.startsWith('/')) {
        return `${host}/${cleanPath}`;
    }

    return `${host}${cleanPath}`;
};
