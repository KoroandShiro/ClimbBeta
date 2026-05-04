package com.climbbeta.api.services

import com.climbbeta.api.domain.OutdoorRoute
import com.climbbeta.api.repository.OutdoorRouteRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever

@ExtendWith(MockitoExtension::class)
class OutdoorRouteServiceTests {

    @Mock
    private lateinit var outdoorRouteRepository: OutdoorRouteRepository

    private lateinit var outdoorRouteService: OutdoorRouteService

    @BeforeEach
    fun setup() {
        outdoorRouteService = OutdoorRouteService(outdoorRouteRepository)
    }

    @Test
    fun `createRoute deve devolver id retornado pelo repository`() {
        whenever(outdoorRouteRepository.create(1, "Via A", "Sector X", "Lugar Y", "6a")).thenReturn(42)

        val id = outdoorRouteService.createRoute(1, "Via A", "Sector X", "Lugar Y", "6a")

        assertEquals(42, id)
    }

    @Test
    fun `getAllRoutes deve devolver lista retornada pelo repository`() {
        val routes = listOf(
            OutdoorRoute(1, 1, "Via A", "Sector X", "Lugar Y", "6a"),
            OutdoorRoute(2, 2, "Via B", "Sector Z", "Lugar Q", "6b")
        )
        whenever(outdoorRouteRepository.getAll()).thenReturn(routes)

        val result = outdoorRouteService.getAllRoutes()

        assertEquals(routes.size, result.size)
        assertEquals(routes, result)
    }

    @Test
    fun `getRouteById deve devolver null quando nao existe`() {
        whenever(outdoorRouteRepository.getById(99)).thenReturn(null)

        val result = outdoorRouteService.getRouteById(99)

        assertEquals(null, result)
    }
}
