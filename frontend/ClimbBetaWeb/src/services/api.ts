export const BASE_URL = 'http://localhost:8080';

// O <T> é um tipo genérico. Significa que quem chama a função decide o que ela devolve!
export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const token = localStorage.getItem('climbbeta_token');

    // 2. Usar a classe nativa Headers
    const headers = new Headers(options.headers);
    
    // Garantir que temos sempre o Content-Type
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    // 3. Injeta o token se ele existir
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // 4. Faz a chamada à API
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers, // Passamos o objeto Headers diretamente!
    });

    if (!response.ok) {
        let errorMsg = 'Erro de comunicação com o servidor.';
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
        } catch (e) {
            // Ignora
        }
        throw new Error(errorMsg);
    }

    if (response.status === 204) {
        return null as T; 
    }

    return response.json() as Promise<T>;
};