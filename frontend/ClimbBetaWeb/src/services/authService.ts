import { apiFetch } from './api';

// Definimos exatamente o que a API devolve
interface LoginResponse {
    token: string;
}

// 1. Mudámos de Promise<boolean> para Promise<string>
export const login = async (email: string, passwordRaw: string): Promise<string> => {
    const data = await apiFetch<LoginResponse>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, passwordRaw }),
    });

    // 2. Já não mexemos no localStorage aqui. O AuthContext trata disso!
    // 3. Devolvemos a string do token diretamente para o Login.tsx
    return data.token; 
};

// Como o AuthContext agora trata do logout limpando a sessão, 
// esta função pode ficar vazia por agora (ou até ser apagada depois).
export const logout = (): void => {
    // O AuthContext agora é quem limpa o token
};