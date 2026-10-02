import axios from 'axios'
import { getToken } from './storage';

// const API_URL = "http://localhost:5000";
// const API_URL = "http://10.226.132.38:5000";
const API_URL = "https://captured-teachers-dans-careful.trycloudflare.com"
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 15000
})

api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})