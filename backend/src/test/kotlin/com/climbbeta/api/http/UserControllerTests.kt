package com.climbbeta.api.http

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.services.UserService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus

@ExtendWith(MockitoExtension::class)
class UserControllerTests {

    @Mock
    private lateinit var userService: UserService

    @InjectMocks
    private lateinit var userController: UserController

    @Test
    fun `registerUser deve retornar 400 em caso de erro nos dados`() {
        // Simulamos que o Service vai mandar um erro (ex: email já existe)
        whenever(userService.createUser(any(), any(), any(), any()))
            .thenThrow(IllegalArgumentException("Este email já está registado!"))

        val input = UserCreateInputModel("user", "existente@teste.com", "123", UserRole.CLIMBER)
        val response = userController.registerUser(input)

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
    }

    @Test
    fun `registerUser deve retornar 201 quando criado com sucesso`() {
        val createdUser = User(id = 1, username = "user", email = "novo@teste.com", passwordHash = "...", role = UserRole.CLIMBER)
        whenever(userService.createUser(any(), any(), any(), any())).thenReturn(createdUser)

        val input = UserCreateInputModel("user", "novo@teste.com", "123", UserRole.CLIMBER)
        val response = userController.registerUser(input)

        assertEquals(HttpStatus.CREATED, response.statusCode)
        val body = response.body as UserOutputModel
        assertEquals("user", body.username)
        assertEquals(1, body.id)
    }

    @Test
    fun `loginUser deve retornar 200 com token com sucesso`() {
        whenever(userService.login("email@teste.com", "pass123")).thenReturn("token-fantastico-123")

        val input = UserLoginInputModel("email@teste.com", "pass123")
        val response = userController.loginUser(input)

        assertEquals(HttpStatus.OK, response.statusCode)
        val body = response.body as TokenOutputModel
        assertEquals("token-fantastico-123", body.token)
    }

    @Test
    fun `loginUser deve retornar 401 em caso de password errada`() {
        whenever(userService.login(any(), any())).thenThrow(IllegalArgumentException("Credenciais inválidas."))

        val input = UserLoginInputModel("email@teste.com", "errada")
        val response = userController.loginUser(input)

        assertEquals(HttpStatus.UNAUTHORIZED, response.statusCode)
    }
}