export const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Already absolute

    // Clean path separators
    const cleanPath = path.replace(/\\/g, '/');

    // Ensure it doesn't double slash if path starts with /
    const baseUrl = 'https://novatech-backend-bov0.onrender.com';

    // If path starts with 'uploads/', prepend /
    if (!cleanPath.startsWith('/')) {
        return `${baseUrl}/${cleanPath}`;
    }

    return `${baseUrl}${cleanPath}`;
};
