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

@RestController
@RequestMapping("/users")
class UserController(
    private val userService: UserService
) {

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

    @PostMapping("/login")
    fun loginUser(@RequestBody input: UserLoginInputModel): ResponseEntity<Any> {
        return try {
            val token = userService.login(input.email, input.passwordRaw)
            ResponseEntity.ok(TokenOutputModel(token))

        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        }
    }

    // Helper endpoint to check if the Interceptor is functioning properly.
    @GetMapping("/me")
    fun getMyProfile(request: jakarta.servlet.http.HttpServletRequest): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as? com.climbbeta.api.domain.User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        val output = UserOutputModel(user.id, user.username, user.email, user.role, user.status)
        return ResponseEntity.ok(output)
    }

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