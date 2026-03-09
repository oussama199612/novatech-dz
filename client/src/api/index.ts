import axios from 'axios';

const isProd = import.meta.env.PROD;
const defaultApiUrl = isProd
    ? 'https://novatech-backend-bov0.onrender.com/api'
    : 'http://localhost:5000/api';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
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
