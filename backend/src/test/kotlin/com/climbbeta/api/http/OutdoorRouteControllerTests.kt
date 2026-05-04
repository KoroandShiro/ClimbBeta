package com.climbbeta.api.http

import com.climbbeta.api.domain.OutdoorRoute
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.services.OutdoorRouteService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus

@ExtendWith(MockitoExtension::class)
class OutdoorRouteControllerTests {

    @Mock
    private lateinit var outdoorRouteService: OutdoorRouteService

    @InjectMocks
    private lateinit var controller: OutdoorRouteController

    private val user = User(id = 1, username = "u", email = "u@test.com", passwordHash = "h", role = UserRole.CLIMBER)

    @Test
    fun `createRoute deve retornar 201 e id`() {
        whenever(outdoorRouteService.createRoute(1, "Via", "Sector", "Lugar", "6a")).thenReturn(123)

        val response = controller.createRoute(OutdoorRouteCreateInput("Via", "Sector", "Lugar", "6a"), user)

        assertEquals(HttpStatus.CREATED, response.statusCode)
        assertEquals(123, response.body?.get("id"))
    }

    @Test
    fun `getAllRoutes deve retornar 200 e lista`() {
        val routes = listOf(OutdoorRoute(1, 1, "Via", "Sector", "Lugar", "6a"))
        whenever(outdoorRouteService.getAllRoutes()).thenReturn(routes)

        val response = controller.getAllRoutes()

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(routes, response.body)
    }

    @Test
    fun `getRouteById deve retornar 200 quando existe e 404 quando nao existe`() {
        val route = OutdoorRoute(7, 1, "Via7", "Sec", "Loc", "6b")
        whenever(outdoorRouteService.getRouteById(7)).thenReturn(route)
        whenever(outdoorRouteService.getRouteById(99)).thenReturn(null)

        val okResponse = controller.getRouteById(7)
        val notFoundResponse = controller.getRouteById(99)

        assertEquals(HttpStatus.OK, okResponse.statusCode)
        assertEquals(route, okResponse.body)
        assertEquals(HttpStatus.NOT_FOUND, notFoundResponse.statusCode)
    }
}
