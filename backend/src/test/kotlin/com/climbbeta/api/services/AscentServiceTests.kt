package com.climbbeta.api.services

import com.climbbeta.api.domain.Ascent
import com.climbbeta.api.repository.AscentRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import java.time.LocalDate

@ExtendWith(MockitoExtension::class)
class AscentServiceTests {

    @Mock
    private lateinit var ascentRepository: AscentRepository

    private lateinit var ascentService: AscentService

    @BeforeEach
    fun setup() {
        ascentService = AscentService(ascentRepository)
    }

    @Test
    fun `logAscent lan�ar IllegalArgumentException quando indoor e outdoor definidos`() {
        val exception = assertThrows<IllegalArgumentException> {
            ascentService.logAscent(
                climberId = 1,
                boulderId = 10,
                outdoorRouteId = 20,
                freelogGymName = null,
                freelogGrade = null,
                date = LocalDate.now(),
                attempts = 1,
                style = null,
                notes = null
            )
        }
        assertEquals("Uma subida não pode ser Indoor e Outdoor ao mesmo tempo.", exception.message)
    }

    @Test
    fun `logAscent deve delegar para repository e devolver id`() {
        whenever(ascentRepository.create(1, 10, null, null, null, LocalDate.now(), 1, null, null)).thenReturn(55)

        val id = ascentService.logAscent(
            climberId = 1,
            boulderId = 10,
            outdoorRouteId = null,
            freelogGymName = null,
            freelogGrade = null,
            date = LocalDate.now(),
            attempts = 1,
            style = null,
            notes = null
        )

        assertEquals(55, id)
    }

    @Test
    fun `getClimberLogbook deve devolver dados do repository`() {
        val list = listOf(
            Ascent(1, 1, 10, null, null, null, LocalDate.now(), 1, null, null)
        )
        whenever(ascentRepository.getByClimberId(1)).thenReturn(list)

        val result = ascentService.getClimberLogbook(1)
        assertEquals(list, result)
    }

    @Test
    fun `removeAscent deve delegar para repository`() {
        whenever(ascentRepository.delete(10, 1)).thenReturn(true)
        val r = ascentService.removeAscent(10, 1)
        assertTrue(r)
    }
}
