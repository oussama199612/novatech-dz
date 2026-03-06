import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://novatech-backend-bov0.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
        // Fallback to cookie if it exists
        const match = document.cookie.match(/(?:^|; )guestId=([^;]*)/);
        if (match) guestId = match[1];
    }

    if (guestId) {
        config.headers['x-guest-id'] = guestId;
    }
    return config;
});

export default api;
