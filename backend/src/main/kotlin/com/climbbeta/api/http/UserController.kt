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
}