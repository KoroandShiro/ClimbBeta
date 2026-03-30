package com.climbbeta.api.pipeline

import com.climbbeta.api.domain.User
import com.climbbeta.api.repository.TokenRepository
import com.climbbeta.api.repository.UserRepository
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
class AuthenticationInterceptor(
    private val tokenRepository: TokenRepository,
    private val userRepository: UserRepository
) : HandlerInterceptor {

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        // 1. Procurar o cabeçalho "Authorization"
        val authHeader = request.getHeader("Authorization")

        // Se não houver cabeçalho ou não começar por "Bearer ", barramos a entrada!
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.status = 401
            response.writer.write("""{"error": "Falta o Token de Autenticação"}""")
            response.contentType = "application/json"
            return false // Interrompe o pedido!
        }

        // 2. Extrair só a string do token (tirar a palavra "Bearer ")
        val tokenStr = authHeader.substring(7)

        // 3. Ir à Base de Dados ver se o Token existe
        val token = tokenRepository.getTokenByHash(tokenStr)
        if (token == null) {
            response.status = 401
            response.writer.write("""{"error": "Token inválido ou expirado"}""")
            response.contentType = "application/json"
            return false
        }

        // 4. Se o token existe, vamos buscar o Utilizador a que ele pertence
        val user = userRepository.getUserById(token.userId)
        if (user == null) {
            response.status = 401
            return false
        }

        // 5. "Carimbar" a mão do utilizador. Guardamos o objeto User no Request
        // para que os nossos Controllers (nas rotas seguintes) saibam quem fez o pedido!
        request.setAttribute("authenticatedUser", user)

        // 6. Deixar entrar!
        return true
    }
}