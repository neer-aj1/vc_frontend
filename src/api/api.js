import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.BACKEND_BASE_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
)

export default api;