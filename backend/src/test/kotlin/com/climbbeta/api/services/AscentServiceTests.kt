package com.climbbeta.api.services

import com.climbbeta.api.domain.Ascent
import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.repository.AscentRepository
import com.climbbeta.api.repository.BoulderRepository
import com.climbbeta.api.repository.MediaRepository
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

    @Mock
    private lateinit var outdoorRouteService: OutdoorRouteService

    @Mock
    private lateinit var mediaRepository: MediaRepository

    @Mock
    private lateinit var boulderRepository: BoulderRepository

    private lateinit var ascentService: AscentService

    @BeforeEach
    fun setup() {
        ascentService = AscentService(ascentRepository, outdoorRouteService, mediaRepository, boulderRepository)
    }

    private fun activeBoulder(id: Int) = Boulder(
        id = id, gymId = 1, color = "Yellow", grade = "V4",
        setDate = LocalDate.now(), isActive = true
    )

    @Test
    fun `logAscent throws IllegalArgumentException when both indoor and outdoor are set`() {
        val exception = assertThrows<IllegalArgumentException> {
            ascentService.logAscent(
                climberId = 1, boulderId = 10, outdoorRouteId = 20,
                freelogGymName = null, freelogGrade = null,
                date = LocalDate.now(), attempts = 1, style = null, notes = null
            )
        }
        assertEquals("An ascent cannot be both Indoor and Outdoor at the same time.", exception.message)
    }

    @Test
    fun `logAscent delegates to the repository and returns the id when the boulder is active`() {
        whenever(boulderRepository.getBoulderById(10)).thenReturn(activeBoulder(10))
        whenever(ascentRepository.create(1, 10, null, null, null, LocalDate.now(), 1, null, null)).thenReturn(55)

        val id = ascentService.logAscent(
            climberId = 1, boulderId = 10, outdoorRouteId = null,
            freelogGymName = null, freelogGrade = null,
            date = LocalDate.now(), attempts = 1, style = null, notes = null
        )

        assertEquals(55, id)
    }

    @Test
    fun `logAscent throws NoSuchElementException when the boulder does not exist`() {
        whenever(boulderRepository.getBoulderById(999)).thenReturn(null)

        assertThrows<NoSuchElementException> {
            ascentService.logAscent(
                climberId = 1, boulderId = 999, outdoorRouteId = null,
                freelogGymName = null, freelogGrade = null,
                date = LocalDate.now(), attempts = 1, style = null, notes = null
            )
        }
    }

    @Test
    fun `logAscent throws IllegalStateException when the boulder is archived`() {
        whenever(boulderRepository.getBoulderById(7)).thenReturn(activeBoulder(7).copy(isActive = false))

        assertThrows<IllegalStateException> {
            ascentService.logAscent(
                climberId = 1, boulderId = 7, outdoorRouteId = null,
                freelogGymName = null, freelogGrade = null,
                date = LocalDate.now(), attempts = 1, style = null, notes = null
            )
        }
    }

    @Test
    fun `logAscent throws IllegalArgumentException when attempts is less than 1`() {
        assertThrows<IllegalArgumentException> {
            ascentService.logAscent(
                climberId = 1, boulderId = null, outdoorRouteId = null,
                freelogGymName = "Boulder Lab", freelogGrade = "V5",
                date = LocalDate.now(), attempts = 0, style = null, notes = null
            )
        }
    }

    @Test
    fun `getClimberLogbook returns data from the repository`() {
        val list = listOf(
            Ascent(1, 1, 10, null, null, null, LocalDate.now(), 1, null, null)
        )
        whenever(ascentRepository.getByClimberId(1)).thenReturn(list)

        val result = ascentService.getClimberLogbook(1)
        assertEquals(list, result)
    }

    @Test
    fun `removeAscent delegates to the repository`() {
        whenever(ascentRepository.delete(10, 1)).thenReturn(true)
        val r = ascentService.removeAscent(10, 1)
        assertTrue(r)
    }
}
