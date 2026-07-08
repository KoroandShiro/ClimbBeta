package com.climbbeta.api.pipeline

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.domain.UserStatus
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.web.method.HandlerMethod

// Dummies used only by these tests: expose methods with/without @ProtectedRoute so we can build
// a real HandlerMethod (method-level and class-level) and feed it to the interceptor.
@ProtectedRoute(UserRole.GYM_OWNER)
class ClassLevelProtectedDummy {
    fun action() {}
}

class MethodLevelProtectedDummy {
    fun open() {}

    @ProtectedRoute(UserRole.CLIMBER)
    fun climberOnly() {}
}

/**
 * Unit tests for [AuthorizationInterceptor], the central RBAC gate.
 *
 * Uses Spring's MockHttpServletRequest/Response (real objects) so we can assert the resulting
 * status/body directly, and a real [HandlerMethod] so the annotation lookup mirrors production.
 */
class AuthorizationInterceptorTests {

    private val interceptor = AuthorizationInterceptor()

    private fun user(role: UserRole) =
        User(id = 1, username = "u", email = "u@test.com", passwordHash = "h", role = role, status = UserStatus.VERIFIED)

    private fun handlerFor(clazz: Class<*>, method: String): HandlerMethod =
        HandlerMethod(clazz.getDeclaredConstructor().newInstance(), clazz.getMethod(method))

    @Test
    fun `rota sem anotacao deixa passar qualquer autenticado`() {
        val req = MockHttpServletRequest().apply { setAttribute("authenticatedUser", user(UserRole.GYM_OWNER)) }
        val res = MockHttpServletResponse()

        val allowed = interceptor.preHandle(req, res, handlerFor(MethodLevelProtectedDummy::class.java, "open"))

        assertTrue(allowed)
    }

    @Test
    fun `role correta passa`() {
        val req = MockHttpServletRequest().apply { setAttribute("authenticatedUser", user(UserRole.CLIMBER)) }
        val res = MockHttpServletResponse()

        val allowed = interceptor.preHandle(req, res, handlerFor(MethodLevelProtectedDummy::class.java, "climberOnly"))

        assertTrue(allowed)
    }

    @Test
    fun `role errada leva 403`() {
        val req = MockHttpServletRequest().apply { setAttribute("authenticatedUser", user(UserRole.GYM_OWNER)) }
        val res = MockHttpServletResponse()

        val allowed = interceptor.preHandle(req, res, handlerFor(MethodLevelProtectedDummy::class.java, "climberOnly"))

        assertFalse(allowed)
        assertEquals(403, res.status)
    }

    @Test
    fun `anotacao ao nivel da classe tambem e respeitada`() {
        val req = MockHttpServletRequest().apply { setAttribute("authenticatedUser", user(UserRole.CLIMBER)) }
        val res = MockHttpServletResponse()

        // CLIMBER a bater numa rota anotada a nivel de classe com GYM_OWNER -> 403.
        val allowed = interceptor.preHandle(req, res, handlerFor(ClassLevelProtectedDummy::class.java, "action"))

        assertFalse(allowed)
        assertEquals(403, res.status)
    }

    @Test
    fun `sem utilizador autenticado numa rota protegida leva 401`() {
        val req = MockHttpServletRequest() // sem authenticatedUser
        val res = MockHttpServletResponse()

        val allowed = interceptor.preHandle(req, res, handlerFor(MethodLevelProtectedDummy::class.java, "climberOnly"))

        assertFalse(allowed)
        assertEquals(401, res.status)
    }

    @Test
    fun `handler que nao e HandlerMethod passa`() {
        val req = MockHttpServletRequest()
        val res = MockHttpServletResponse()

        val allowed = interceptor.preHandle(req, res, Any())

        assertTrue(allowed)
    }
}
