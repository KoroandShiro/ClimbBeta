package com.climbbeta.api.http

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.services.BoulderService
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.doThrow
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import java.time.LocalDate
import org.mockito.kotlin.anyOrNull

@ExtendWith(MockitoExtension::class)
class BoulderControllerTests {

    @Mock
    private lateinit var boulderService: BoulderService

    @Mock
    private lateinit var request: HttpServletRequest

    @InjectMocks
    private lateinit var boulderController: BoulderController

    private val user = User(id = 1, username = "owner", email = "test", passwordHash = "h", role = UserRole.GYM_OWNER)
    private val testDate = LocalDate.now()

    @Test
    fun `createBoulder deve retornar 403 se falhar regras de permissao de ginasio`() {
        whenever(request.getAttribute("authenticatedUser")).thenReturn(user)
        whenever(boulderService.createBoulder(any(), any(), any(), anyOrNull(), any(), anyOrNull(), any(), anyOrNull()))
            .thenThrow(SecurityException("Apenas o dono do ginásio pode adicionar vias aqui."))

        val input = BoulderCreateInput("Amarelo", null, "V4", "Koro", testDate, null)
        val response = boulderController.createBoulder(10, input, request)

        assertEquals(HttpStatus.FORBIDDEN, response.statusCode)
    }

    @Test
    fun `getGymBoulders deve retornar 200 com a lista`() {
        val mockBoulders = listOf(Boulder(1, 10, "Azul", null, "V2", null, testDate, true, null))
        whenever(boulderService.getActiveBoulders(10)).thenReturn(mockBoulders)

        val response = boulderController.getGymBoulders(10)
        
        assertEquals(HttpStatus.OK, response.statusCode)
        val body = response.body as List<*>
        assertEquals(1, body.size)
    }

    @Test
    fun `updateBoulderStatus deve retornar 404 se vier um id invalido`() {
        whenever(request.getAttribute("authenticatedUser")).thenReturn(user)
        doThrow(IllegalArgumentException("Via não encontrada."))
            .whenever(boulderService).updateBoulderStatus(any(), any(), any())

        val response = boulderController.updateBoulderStatus(1, BoulderStatusInput(false), request)
        
        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
    }
}