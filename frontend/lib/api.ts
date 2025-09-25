import { register } from "module";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

// Token management
export const tokenManager = {
    getToken: () => {
        if (typeof window !== 'undefined'){
            return localStorage.getItem('auth_token')
        }
        return null
    },
     setToken: (token: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    },
    removeToken: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
        }
    }
}

// Create headers with Authentication
const createHeaders = () => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };
    const token = tokenManager.getToken()
    if (token) {
        headers.Authorization = `Token ${token}`
    }
    return headers;
}

export const apiClient = {
    get : async (endpoint: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: createHeaders()
        })
        if (!response.ok) {
            if (response.status === 401){
                tokenManager.removeToken()
                throw new Error('Authentication required')
            }
            throw new Error(`API call failed: ${response.statusText}`)
        }
        return response.json()
    },
    post : async (endpoint: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: createHeaders(),
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            if (response.status === 401){
                tokenManager.removeToken()
                throw new Error('Authentication required')
            }
            throw new Error(`API call failed: ${response.statusText}`)
        }
        return response.json()
    } 
}
// Authentication API
export const authAPI = {
    login: async (username: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        })
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Login failed')
        }

        const data = await response.json()
        tokenManager.setToken(data.token)
        return data;
    },
    register: async (userData: {
        username: string;
        email: string;
        password: string;
        password_confirm: string;
        first_name: string;
        last_name: string;
        user_type: string
    }) => {
        const response = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Registration failed')
        }
        const data = await response.json()
        tokenManager.setToken(data.token)
        return data;
    },
    logout: () => {
        tokenManager.removeToken()
    },
    getCurrentUser: async () => {
        return apiClient.get('/auth/profile/')
    }
}