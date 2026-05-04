package com.climbbeta.api.http

import com.climbbeta.api.domain.Ascent
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.services.AscentService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import java.time.LocalDate

@ExtendWith(MockitoExtension::class)
class AscentControllerTests {

    @Mock
    private lateinit var ascentService: AscentService

    @InjectMocks
    private lateinit var controller: AscentController

    private val user = User(id = 1, username = "u", email = "u@test.com", passwordHash = "h", role = UserRole.CLIMBER)

    @Test
    fun `create deve retornar 201 e id`() {
        val input = AscentInputModel(boulderId = 10, outdoorRouteId = null, freelogGymName = null, freelogGrade = null, date = LocalDate.now(), attempts = 1, style = null, notes = null)
        whenever(ascentService.logAscent(1, 10, null, null, null, input.date, 1, null, null)).thenReturn(77)

        val response = controller.create(input, user)

        assertEquals(HttpStatus.CREATED, response.statusCode)
        assertEquals(77, response.body?.get("id"))
    }

    @Test
    fun `getMyLog deve devolver lista do service`() {
        val list = listOf(Ascent(1, 1, 10, null, null, null, LocalDate.now(), 1, null, null))
        whenever(ascentService.getClimberLogbook(1)).thenReturn(list)

        val result = controller.getMyLog(user)
        assertEquals(list, result)
    }

    @Test
    fun `getById deve retornar 200 quando existe e 404 quando nao existe`() {
        val ascent = Ascent(5, 1, 10, null, null, null, LocalDate.now(), 1, null, null)
        whenever(ascentService.getAscentById(5)).thenReturn(ascent)
        whenever(ascentService.getAscentById(999)).thenReturn(null)

        val ok = controller.getById(5)
        val notFound = controller.getById(999)

        assertEquals(HttpStatus.OK, ok.statusCode)
        assertEquals(ascent, ok.body)
        assertEquals(HttpStatus.NOT_FOUND, notFound.statusCode)
    }

    @Test
    fun `delete deve retornar 204 quando removido e 404 quando nao existe`() {
        whenever(ascentService.removeAscent(10, 1)).thenReturn(true)
        whenever(ascentService.removeAscent(99, 1)).thenReturn(false)

        val noContent = controller.delete(10, user)
        val notFound = controller.delete(99, user)

        assertEquals(HttpStatus.NO_CONTENT, noContent.statusCode)
        assertEquals(HttpStatus.NOT_FOUND, notFound.statusCode)
    }
}
