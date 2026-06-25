package com.climbbeta.api.pipeline

import com.climbbeta.api.repository.TokenRepository
import com.climbbeta.api.repository.UserRepository
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

/**
 * HTTP Security Interceptor that enforces authentication via Bearer Tokens.
 *
 * Intercepts incoming requests, validates the 'Authorization' header against the database,
 * and injects the authenticated [User] object into the request attributes if valid.
 *
 * @property tokenRepository Database layer to validate token hashes.
 * @property userRepository Database layer to fetch the user associated with a token.
 */
@Component
class AuthenticationInterceptor(
    private val tokenRepository: TokenRepository,
    private val userRepository: UserRepository
) : HandlerInterceptor {

    /**
     * Intercepts HTTP requests before they reach the Controllers.
     *
     * Extracts the token from "Authorization: Bearer <token>". If missing or invalid,
     * short-circuits the request and returns an HTTP 401 Unauthorized JSON response.
     *
     * @param request The incoming HTTP servlet request.
     * @param response The outgoing HTTP servlet response.
     * @param handler The targeted controller handler.
     * @return true if authentication succeeds and request can proceed; false otherwise.
     */
    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        if (request.method == "OPTIONS") {
            return true
        }

        val authHeader = request.getHeader("Authorization")

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.status = 401
            response.writer.write("""{"error": "Missing Authentication Token"}""")
            response.contentType = "application/json"
            return false
        }

        val tokenStr = authHeader.substring(7)
        val token = tokenRepository.getTokenByHash(tokenStr)
        if (token == null) {
            response.status = 401
            response.writer.write("""{"error": "Invalid or expired token"}""")
            response.contentType = "application/json"
            return false
        }

        val user = userRepository.getUserById(token.userId)
        if (user == null) {
            response.status = 401
            return false
        }

        request.setAttribute("authenticatedUser", user)
        return true
    }
}