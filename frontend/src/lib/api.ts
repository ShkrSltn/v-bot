// Получаем базовый URL API из переменных окружения
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Функция для упрощения API-запросов
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        }
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    // Если ответ пустой или не JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return response.text();
    }

    return response.json();
} 