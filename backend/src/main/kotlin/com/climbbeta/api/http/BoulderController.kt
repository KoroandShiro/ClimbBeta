package com.climbbeta.api.http

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.pipeline.ProtectedRoute
import com.climbbeta.api.services.BoulderService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

data class BoulderCreateInput(
    val color: String,
    val hexColor: String?,
    val grade: String,
    val setterName: String?,
    val setDate: LocalDate,
    val imageUrl: String?
)
data class BoulderStatusInput(val isActive: Boolean)

/**
 * REST Controller directing indoor boulder route configurations and floor management.
 *
 * Handles creation maps for commercial routes, sector directory evaluations, and status resets.
 */
@RestController
class BoulderController(private val boulderService: BoulderService) {

    /**
     * Registers a physical boulder track onto a commercial facility node mapping.
     *
     * @return Created entity response (201), 403 (Forbidden) if ownership verification tags mismatch,
     * or 400 (Bad Request) if parameters are structurally malformed.
     */
    @ProtectedRoute(UserRole.GYM_OWNER)
    @PostMapping("/gyms/{gymId}/boulders")
    fun createBoulder(
        @PathVariable gymId: Int,
        @RequestBody input: BoulderCreateInput,
        request: HttpServletRequest
    ): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as User
        val boulder = boulderService.createBoulder(
            user = user, gymId = gymId, color = input.color, hexColor = input.hexColor,
            grade = input.grade, setterName = input.setterName, setDate = input.setDate, imageUrl = input.imageUrl
        )
        // Security -> 403, IllegalArgument (ex.: "Gym not found") -> 400 via GlobalExceptionHandler.
        return ResponseEntity.status(HttpStatus.CREATED).body(boulder)
    }

    /**
     * Lists active boulder tracks available within a targeted facility node.
     */
    @GetMapping("/gyms/{gymId}/boulders")
    fun getGymBoulders(@PathVariable gymId: Int): ResponseEntity<Any> {
        val boulders = boulderService.getActiveBoulders(gymId)
        return ResponseEntity.ok(boulders)
    }

    /**
     * Alters visibility parameters for a target route (e.g., stripping down worn tracks).
     */
    @ProtectedRoute(UserRole.GYM_OWNER)
    @PutMapping("/boulders/{boulderId}/status")
    fun updateBoulderStatus(
        @PathVariable boulderId: Int,
        @RequestBody input: BoulderStatusInput,
        request: HttpServletRequest
    ): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as User
        boulderService.updateBoulderStatus(user, boulderId, input.isActive)
        // Security -> 403; route/gym inexistente lança NoSuchElementException -> 404 (GlobalExceptionHandler).
        return ResponseEntity.ok(mapOf("message" to "Route status updated successfully!"))
    }

    @GetMapping("/boulders/{boulderId}")
    fun getBoulderById(@PathVariable boulderId: Int): ResponseEntity<Any> {
        val boulder = boulderService.getBoulderById(boulderId)
        return if (boulder != null) {
            ResponseEntity.ok(boulder)
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Route not found."))
        }
    }
}