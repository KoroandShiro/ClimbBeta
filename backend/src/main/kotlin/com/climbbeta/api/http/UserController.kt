package com.climbbeta.api.http

import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.domain.UserStatus
import com.climbbeta.api.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class UserCreateInputModel(
    val username: String,
    val email: String,
    val passwordRaw: String,
    val role: UserRole
)

data class UserOutputModel(
    val id: Int,
    val username: String,
    val email: String,
    val role: UserRole,
    val status: UserStatus
)

data class VerifyCodeInputModel(
    val code: String
)

data class UserLoginInputModel(
    val email: String,
    val passwordRaw: String
)

data class TokenOutputModel(
    val token: String
)
/**
 * REST Entry Gateway governing profile provisioning, discovery lookups, and session management.
 *
 * Implements public-facing entryways like BCrypt registration pathways and session generation.
 */
@RestController
@RequestMapping("/users")
class UserController(
    private val userService: UserService
) {
    /**
     * Provisions a new user account profile in the database system.
     *
     * Maps internal credentials securely to clean transmission objects to avoid exposing private information.
     */
    @PostMapping("/register")
    fun registerUser(@RequestBody input: UserCreateInputModel): ResponseEntity<Any> {
        return try {
            val createdUser = userService.createUser(
                username = input.username,
                email = input.email,
                passwordRaw = input.passwordRaw,
                role = input.role
            )

            // Convert to OutputModel to NEVER return the password to the device!
            val output = UserOutputModel(
                id = createdUser.id,
                username = createdUser.username,
                email = createdUser.email,
                role = createdUser.role,
                status = createdUser.status
            )

            ResponseEntity.status(HttpStatus.CREATED).body(output)

        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to e.message))
        }
    }
    /**
     * Evaluates raw email credentials against secure records to instantiate a session token.
     *
     * @return Raw plaintext authorization token bound to status 200 (OK), or 401 if authentication fails.
     */
    @PostMapping("/login")
    fun loginUser(@RequestBody input: UserLoginInputModel): ResponseEntity<Any> {
        return try {
            val token = userService.login(input.email, input.passwordRaw)
            ResponseEntity.ok(TokenOutputModel(token))

        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        }
    }

    /**
     * Diagnostic hook verifying operational pipeline middleware integrations.
     */
    @GetMapping("/me")
    fun getMyProfile(request: jakarta.servlet.http.HttpServletRequest): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as? com.climbbeta.api.domain.User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        val output = UserOutputModel(user.id, user.username, user.email, user.role, user.status)
        return ResponseEntity.ok(output)
    }

    /**
     * Processes admin activation coupons to unlock pending commercial gym manager capabilities.
     */
    @PostMapping("/verify-code")
    fun verifyCode(
        @RequestBody input: VerifyCodeInputModel,
        request: jakarta.servlet.http.HttpServletRequest
    ): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as? com.climbbeta.api.domain.User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        return try {
            val updatedUser = userService.verifyActivationCode(user, input.code)
            val output = UserOutputModel(updatedUser.id, updatedUser.username, updatedUser.email, updatedUser.role, updatedUser.status)
            ResponseEntity.ok(output)
        } catch (e: SecurityException) {
            ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to e.message))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.CONFLICT).body(mapOf("error" to e.message))
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to e.message))
        }
    }

    /**
     * Performs a partial-match textual query scan over indexed usernames to locate peers.
     */
    @GetMapping("/search")
    fun searchUsers(
        @RequestParam q: String,
        request: jakarta.servlet.http.HttpServletRequest
    ): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as? com.climbbeta.api.domain.User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        if (q.trim().length < 2) {
            return ResponseEntity.ok(emptyList<Any>())
        }

        val results = userService.searchUsers(q, user.id)
        return ResponseEntity.ok(results)
    }
}