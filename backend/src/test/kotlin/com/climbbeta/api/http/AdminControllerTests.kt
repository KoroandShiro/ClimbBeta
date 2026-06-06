package com.climbbeta.api.http

import com.climbbeta.api.domain.ActivationCode
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.repository.ActivationCodeRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import java.time.LocalDateTime

@ExtendWith(MockitoExtension::class)
class AdminControllerTests {

    @Mock
    private lateinit var activationCodeRepository: ActivationCodeRepository

    @InjectMocks
    private lateinit var adminController: AdminController

    @Test
    fun `generateCode deve retornar 401 se utilizador nao estiver autenticado`() {
        val request = mockHttpServletRequestWithoutUser()

        val response = adminController.generateCode(request)

        assertEquals(HttpStatus.UNAUTHORIZED, response.statusCode)
        verifyNoInteractions(activationCodeRepository) // Garante que não toca na BD se falhar auth
    }

    @Test
    fun `generateCode deve retornar 403 se utilizador nao for ADMIN`() {
        val user = User(id = 1, username = "climber", email = "c@test.com", passwordHash = "hash", role = UserRole.CLIMBER)
        val request = mockHttpServletRequestWithUser(user)

        val response = adminController.generateCode(request)

        assertEquals(HttpStatus.FORBIDDEN, response.statusCode)
        // ADICIONADO: Valida se a mensagem de erro específica foi no body
        assertEquals(mapOf("error" to "Apenas ADMIN pode gerar códigos de ativação."), response.body)
        verifyNoInteractions(activationCodeRepository)
    }

    @Test
    fun `generateCode deve retornar 201 e codigo se for ADMIN`() {
        val user = User(id = 1, username = "admin", email = "a@test.com", passwordHash = "hash", role = UserRole.ADMIN)
        val request = mockHttpServletRequestWithUser(user)
        val code = ActivationCode(code = "test-code", isUsed = false, createdAt = LocalDateTime.now(), usedBy = null)

        whenever(activationCodeRepository.createCode(any())).thenReturn(code)

        val response = adminController.generateCode(request)

        assertEquals(HttpStatus.CREATED, response.statusCode)
        val body = response.body as ActivationCodeOutputModel
        assertEquals("test-code", body.code)
        assertFalse(body.isUsed)
        assertNull(body.usedBy)

        verify(activationCodeRepository).createCode(any()) // Garante chamada ao repo
    }

    @Test
    fun `listCodes deve retornar 401 se utilizador nao estiver autenticado`() {
        val request = mockHttpServletRequestWithoutUser()

        val response = adminController.listCodes(request)

        assertEquals(HttpStatus.UNAUTHORIZED, response.statusCode)
        verifyNoInteractions(activationCodeRepository)
    }

    @Test
    fun `listCodes deve retornar 403 se utilizador nao for ADMIN`() {
        val user = User(id = 1, username = "climber", email = "c@test.com", passwordHash = "hash", role = UserRole.CLIMBER)
        val request = mockHttpServletRequestWithUser(user)

        val response = adminController.listCodes(request)

        assertEquals(HttpStatus.FORBIDDEN, response.statusCode)
        // ADICIONADO: Valida se a mensagem de erro específica foi no body
        assertEquals(mapOf("error" to "Apenas ADMIN pode ver os códigos de ativação."), response.body)
        verifyNoInteractions(activationCodeRepository)
    }

    @Test
    @Suppress("UNCHECKED_CAST")
    fun `listCodes deve retornar 200 e lista de codigos se for ADMIN`() {
        val user = User(id = 1, username = "admin", email = "a@test.com", passwordHash = "hash", role = UserRole.ADMIN)
        val request = mockHttpServletRequestWithUser(user)
        val codes = listOf(
            ActivationCode(code = "code1", isUsed = false, createdAt = LocalDateTime.now(), usedBy = null),
            ActivationCode(code = "code2", isUsed = true, createdAt = LocalDateTime.now(), usedBy = 5)
        )

        whenever(activationCodeRepository.getAllCodes()).thenReturn(codes)

        val response = adminController.listCodes(request)

        assertEquals(HttpStatus.OK, response.statusCode)
        val body = response.body as List<ActivationCodeOutputModel>
        assertEquals(2, body.size)

        // ADICIONADO: Garante que o mapeamento de domínio para DTO correu na perfeição
        assertEquals("code1", body[0].code)
        assertFalse(body[0].isUsed)
        assertNull(body[0].usedBy)

        assertEquals("code2", body[1].code)
        assertTrue(body[1].isUsed)
        assertEquals(5, body[1].usedBy)

        verify(activationCodeRepository).getAllCodes()
    }

    private fun mockHttpServletRequestWithUser(user: User): jakarta.servlet.http.HttpServletRequest {
        val request = mock<jakarta.servlet.http.HttpServletRequest>()
        whenever(request.getAttribute("authenticatedUser")).thenReturn(user)
        return request
    }

    private fun mockHttpServletRequestWithoutUser(): jakarta.servlet.http.HttpServletRequest {
        val request = mock<jakarta.servlet.http.HttpServletRequest>()
        whenever(request.getAttribute("authenticatedUser")).thenReturn(null)
        return request
    }
}