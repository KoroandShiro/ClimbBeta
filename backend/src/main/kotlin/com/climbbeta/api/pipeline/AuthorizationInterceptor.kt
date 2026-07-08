package com.climbbeta.api.pipeline

import com.climbbeta.api.domain.User
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.method.HandlerMethod
import org.springframework.web.servlet.HandlerInterceptor

/**
 * HTTP Authorization Interceptor enforcing role-based access (RBAC).
 *
 * Runs AFTER [AuthenticationInterceptor] (which injects `authenticatedUser`), so the user is
 * already resolved here. Reads the [ProtectedRoute] annotation from the target handler — method
 * first, then the controller class — and returns 403 when the authenticated user's role is not in
 * the allowed set. Routes without the annotation are left open to any authenticated user.
 */
@Component
class AuthorizationInterceptor : HandlerInterceptor {

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        if (request.method == "OPTIONS") {
            return true
        }

        // Only controller methods carry annotations; static resources / error dispatch don't.
        if (handler !is HandlerMethod) {
            return true
        }

        // A method-level annotation overrides a class-level one; no annotation = open route.
        val rule = handler.getMethodAnnotation(ProtectedRoute::class.java)
            ?: handler.beanType.getAnnotation(ProtectedRoute::class.java)
            ?: return true

        val user = request.getAttribute("authenticatedUser") as? User
        if (user == null) {
            response.status = 401
            response.contentType = "application/json"
            response.writer.write("""{"error": "Missing Authentication Token"}""")
            return false
        }

        if (user.role !in rule.roles) {
            response.status = 403
            response.contentType = "application/json"
            response.writer.write("""{"error": "You do not have permission to access this resource."}""")
            return false
        }

        return true
    }
}
