package com.climbbeta.api.http

import com.climbbeta.api.domain.OutdoorRoute
import com.climbbeta.api.domain.User
import com.climbbeta.api.services.OutdoorRouteService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class OutdoorRouteCreateInput(
    val name: String?,
    val sector: String,
    val location: String,
    val grade: String
)

/**
 * REST Controller listing and indexing geographic outdoor crags.
 *
 * Manages entries submitted by the community for real-world sport routes or boulders.
 */
@RestController
@RequestMapping("/outdoor-routes")
class OutdoorRouteController(
    private val outdoorRouteService: OutdoorRouteService
) {

    /**
     * Indexes a new outdoor climbing route.
     *
     * @param user Automatically resolved by the interceptor from the security header context.
     */
    @PostMapping
    fun createRoute(
        @RequestBody input: OutdoorRouteCreateInput,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Map<String, Int>> {
        val routeId = outdoorRouteService.createRoute(
            creatorId = user.id, name = input.name, sector = input.sector,
            location = input.location, grade = input.grade
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("id" to routeId))
    }

    @GetMapping
    fun getAllRoutes(): ResponseEntity<List<OutdoorRoute>> {
        val routes = outdoorRouteService.getAllRoutes()
        return ResponseEntity.ok(routes)
    }

    @GetMapping("/{id}")
    fun getRouteById(@PathVariable id: Int): ResponseEntity<OutdoorRoute> {
        val route = outdoorRouteService.getRouteById(id)
        return if (route != null) {
            ResponseEntity.ok(route)
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        }
    }
}