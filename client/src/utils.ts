export const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Already absolute

    // Clean path separators
    const cleanPath = path.replace(/\\/g, '/');

    // Get the base URL from the environment or use empty string for relative paths
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // If path starts with 'uploads/', prepend /
    if (!cleanPath.startsWith('/')) {
        return `${baseUrl}/${cleanPath}`;
    }

    return `${baseUrl}${cleanPath}`;
};
