package com.climbbeta.api.http

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.pipeline.ProtectedRoute
import com.climbbeta.api.services.GamificationService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * REST Controller handling community engagement mechanics.
 *
 * Processes social feedback loops such as ascent feed reactions,
 * active bookmark tracking (saved projects), and scoreboard charts.
 */
@RestController
@RequestMapping
class GamificationController(private val gamificationService: GamificationService) {

    /**
     * Registers an appreciation mark (like) against a peer's public log entry.
     */
    @ProtectedRoute(UserRole.CLIMBER)
    @PostMapping("/ascents/{id}/like")
    fun likeAscent(
        @PathVariable id: Int,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Unit> {
        val created = gamificationService.likeAscent(user.id, id)
        return if (created) {
            ResponseEntity.status(HttpStatus.CREATED).build()
        } else {
            ResponseEntity.status(HttpStatus.OK).build()
        }
    }

    @ProtectedRoute(UserRole.CLIMBER)
    @DeleteMapping("/ascents/{id}/like")
    fun unlikeAscent(
        @PathVariable id: Int,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Unit> {
        val deleted = gamificationService.unlikeAscent(user.id, id)
        return if (deleted) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        }
    }

    /**
     * Saves a route to the user's personal project list.
     */
    @ProtectedRoute(UserRole.CLIMBER)
    @PostMapping("/boulders/{id}/save")
    fun saveBoulder(
        @PathVariable id: Int,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Any> {
        val created = gamificationService.saveBoulder(user.id, id)
        return if (created) {
            ResponseEntity.status(HttpStatus.CREATED).body(mapOf("message" to "Project saved successfully!"))
        } else {
            ResponseEntity.status(HttpStatus.OK).body(mapOf("message" to "Project was already saved."))
        }
    }

    @ProtectedRoute(UserRole.CLIMBER)
    @DeleteMapping("/boulders/{id}/save")
    fun unsaveBoulder(
        @PathVariable id: Int,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Any> {
        val deleted = gamificationService.unsaveBoulder(user.id, id)
        return if (deleted) {
            ResponseEntity.ok(mapOf("message" to "Project removed successfully!"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Project not found."))
        }
    }

    /**
     * Checks if a specific route is bookmarked by the user. Used to toggle UI elements.
     */
    @ProtectedRoute(UserRole.CLIMBER)
    @GetMapping("/boulders/{id}/save-status")
    fun checkSaveStatus(
        @PathVariable id: Int,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Any> {
        val isSaved = gamificationService.isBoulderSaved(user.id, id)
        return ResponseEntity.ok(mapOf("isSaved" to isSaved))
    }

    @ProtectedRoute(UserRole.CLIMBER)
    @GetMapping("/projects/me")
    fun getSavedBoulders(
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Any> {
        val boulders = gamificationService.getSavedBoulders(user.id)
        return ResponseEntity.ok(boulders)
    }

    /**
     * Compiles top performance logs for a specific boulder layout.
     */
    @GetMapping("/boulders/{id}/leaderboard")
    fun getLeaderboard(
        @PathVariable id: Int
    ): ResponseEntity<Any> {
        val leaderboard = gamificationService.getLeaderboard(id)
        return ResponseEntity.ok(leaderboard)
    }
}