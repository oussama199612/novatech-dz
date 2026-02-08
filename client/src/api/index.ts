import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://novatech-backend-bov0.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
