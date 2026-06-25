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
        if (request.method == "OPTIONS") {
            return true // temporary
        }
        // 1. Look for the "Authorization" header
        val authHeader = request.getHeader("Authorization")

        // If there is no header or it doesn't start with "Bearer ", block access!
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.status = 401
            response.writer.write("""{"error": "Missing Authentication Token"}""")
            response.contentType = "application/json"
            return false // Interrupts the request!
        }

        // 2. Extract only the token string (remove the "Bearer " prefix)
        val tokenStr = authHeader.substring(7)

        // 3. Check the Database to see if the Token exists
        val token = tokenRepository.getTokenByHash(tokenStr)
        if (token == null) {
            response.status = 401
            response.writer.write("""{"error": "Invalid or expired token"}""")
            response.contentType = "application/json"
            return false
        }

        // 4. If the token exists, fetch the User it belongs to
        val user = userRepository.getUserById(token.userId)
        if (user == null) {
            response.status = 401
            return false
        }

        // 5. Stamp the request. Save the User object in the Request attributes
        // so that our Controllers (in subsequent routes) know who made the request!
        request.setAttribute("authenticatedUser", user)

        // 6. Allow entry!
        return true
    }
}