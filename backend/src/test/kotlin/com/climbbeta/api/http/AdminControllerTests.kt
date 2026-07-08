package com.climbbeta.api.http

import com.climbbeta.api.domain.ActivationCode
import com.climbbeta.api.repository.ActivationCodeRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.verify
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import java.time.LocalDateTime

/**
 * Unit tests for [AdminController].
 *
 * Role enforcement ("only ADMIN") now lives centrally in the AuthorizationInterceptor via
 * @ProtectedRoute, so it is covered by AuthorizationInterceptorTests — not here. These tests focus
 * on the controller's own responsibility: minting and listing activation codes.
 */
@ExtendWith(MockitoExtension::class)
class AdminControllerTests {

    @Mock
    private lateinit var activationCodeRepository: ActivationCodeRepository

    @InjectMocks
    private lateinit var adminController: AdminController

    @Test
    fun `generateCode deve retornar 201 e o codigo gerado`() {
        val code = ActivationCode(code = "test-code", isUsed = false, createdAt = LocalDateTime.now(), usedBy = null)
        whenever(activationCodeRepository.createCode(any())).thenReturn(code)

        val response = adminController.generateCode()

        assertEquals(HttpStatus.CREATED, response.statusCode)
        val body = response.body as ActivationCodeOutputModel
        assertEquals("test-code", body.code)
        assertFalse(body.isUsed)
        assertNull(body.usedBy)
        verify(activationCodeRepository).createCode(any())
    }

    @Test
    @Suppress("UNCHECKED_CAST")
    fun `listCodes deve retornar 200 e a lista de codigos`() {
        val codes = listOf(
            ActivationCode(code = "code1", isUsed = false, createdAt = LocalDateTime.now(), usedBy = null),
            ActivationCode(code = "code2", isUsed = true, createdAt = LocalDateTime.now(), usedBy = 5)
        )
        whenever(activationCodeRepository.getAllCodes()).thenReturn(codes)

        val response = adminController.listCodes()

        assertEquals(HttpStatus.OK, response.statusCode)
        val body = response.body as List<ActivationCodeOutputModel>
        assertEquals(2, body.size)
        assertEquals("code1", body[0].code)
        assertFalse(body[0].isUsed)
        assertNull(body[0].usedBy)
        assertEquals("code2", body[1].code)
        assertTrue(body[1].isUsed)
        assertEquals(5, body[1].usedBy)
        verify(activationCodeRepository).getAllCodes()
    }
}
