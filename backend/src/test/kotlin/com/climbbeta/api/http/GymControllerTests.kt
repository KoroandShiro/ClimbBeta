package com.climbbeta.api.http

import com.climbbeta.api.domain.Gym
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.services.GymService
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.anyOrNull
import org.mockito.kotlin.doThrow
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus

@ExtendWith(MockitoExtension::class)
class GymControllerTests {

    @Mock
    private lateinit var gymService: GymService

    @Mock
    private lateinit var request: HttpServletRequest

    @InjectMocks
    private lateinit var gymController: GymController

    private val adminUser = User(
        id = 1,
        username = "admin",
        email = "admin@test.com",
        passwordHash = "hash",
        role = UserRole.ADMIN
    )

    @Test
    fun `createGym deve retornar 401 quando user nao autenticado`() {
        whenever(request.getAttribute("authenticatedUser")).thenReturn(null)

        val response = gymController.createGym(
            GymCreateInputModel(2, "Gym", "Rua X", "Porto", null),
            request
        )

        assertEquals(HttpStatus.UNAUTHORIZED, response.statusCode)
    }

    @Test
    fun `createGym deve retornar 201 quando criado com sucesso`() {
        whenever(request.getAttribute("authenticatedUser")).thenReturn(adminUser)
        whenever(gymService.createGym(any(), any(), any(), any(), any(), anyOrNull())).thenReturn(
            Gym(10, 2, "Super Gym", "Rua X", "Lisboa", null)
        )

        val response = gymController.createGym(
            GymCreateInputModel(2, "Super Gym", "Rua X", "Lisboa", null),
            request
        )

        assertEquals(HttpStatus.CREATED, response.statusCode)
    }

    @Test
    fun `getGymById deve retornar 404 quando gym nao existe`() {
        whenever(request.getAttribute("authenticatedUser")).thenReturn(adminUser)
        whenever(gymService.getGymById(99)).thenThrow(NoSuchElementException("Ginásio não encontrado."))

        val response = gymController.getGymById(99, request)

        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
    }

    @Test
    fun `updateGym deve retornar 403 quando sem permissao`() {
        whenever(request.getAttribute("authenticatedUser")).thenReturn(adminUser)
        doThrow(SecurityException("Acesso negado."))
            .whenever(gymService)
            .updateGym(any(), any(), any(), any(), any(), anyOrNull())

        val response = gymController.updateGym(
            1,
            GymUpdateInputModel("Novo", "Rua", "Porto", null),
            request
        )

        assertEquals(HttpStatus.FORBIDDEN, response.statusCode)
    }
}
