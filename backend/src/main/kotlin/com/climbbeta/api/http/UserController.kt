package com.climbbeta.api.http

import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

// 1. Modelos que definem o que recebemos do telemóvel e o que devolvemos
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
    val role: UserRole
)

data class UserLoginInputModel(
    val email: String,
    val passwordRaw: String
)

data class TokenOutputModel(
    val token: String
)

// 2. O Controlador
@RestController
@RequestMapping("/users")
class UserController(
    private val userService: UserService
) {

    @PostMapping("/register")
    fun registerUser(@RequestBody input: UserCreateInputModel): ResponseEntity<Any> {
        return try {
            // Mandamos para o Service fazer o trabalho pesado
            val createdUser = userService.createUser(
                username = input.username,
                email = input.email,
                passwordRaw = input.passwordRaw,
                role = input.role
            )

            // Convertemos para OutputModel para NUNCA devolver a password ao telemóvel!
            val output = UserOutputModel(
                id = createdUser.id,
                username = createdUser.username,
                email = createdUser.email,
                role = createdUser.role
            )

            // Devolvemos status 201 (Created)
            ResponseEntity.status(HttpStatus.CREATED).body(output)

        } catch (e: IllegalArgumentException) {
            // Se o email já existir, devolvemos erro 400 (Bad Request)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to e.message))
        }
    }

    @PostMapping("/login")
    fun loginUser(@RequestBody input: UserLoginInputModel): ResponseEntity<Any> {
        return try {
            val token = userService.login(input.email, input.passwordRaw)

            // Devolvemos Status 200 OK com o token lá dentro
            ResponseEntity.ok(TokenOutputModel(token))

        } catch (e: IllegalArgumentException) {
            // Se a password ou email falharem, devolvemos Status 401 Unauthorized
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        }
    }


    // Função temporária dada pelo chat para testar se o Interceptor está a funcionar. Ele vai ler o utilizador autenticado do Request e devolver os dados dele.
    @GetMapping("/me")
    fun getMyProfile(request: jakarta.servlet.http.HttpServletRequest): ResponseEntity<Any> {
        // Lemos o utilizador que o Interceptor injetou!
        val user = request.getAttribute("authenticatedUser") as? com.climbbeta.api.domain.User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        // Devolvemos os dados para provar que sabemos quem ele é
        val output = UserOutputModel(user.id, user.username, user.email, user.role)
        return ResponseEntity.ok(output)
    }
}