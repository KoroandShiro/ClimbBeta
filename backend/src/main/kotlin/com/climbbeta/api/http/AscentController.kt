package com.climbbeta.api.http

import com.climbbeta.api.domain.Ascent
import com.climbbeta.api.domain.User
import com.climbbeta.api.services.AscentService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

data class AscentInputModel(
    val boulderId: Int?,
    val outdoorRouteId: Int?,
    val freelogGymName: String?,
    val freelogGrade: String?,
    val date: LocalDate?,
    val attempts: Int = 1,
    val style: String?,
    val notes: String?
)

/**
 * REST Controller processing climbing logbook entries (ascents).
 *
 * Exposes endpoints allowing users to submit tracking summaries for indoor commercial
 * boulders, tracked outdoor sport lines, or manual logs (freelogs).
 *
 * @property ascentService Core service processing log entry validation rules.
 */
@RestController
@RequestMapping("/ascents")
class AscentController(private val ascentService: AscentService) {

    /**
     * Commits a new ascent log into the climber's personal ledger.
     *
     * @param input Data Transfer Object capturing route markers, location strings, and attempt metrics.
     * @param user Automatically resolved active entity injected by the security pipeline.
     * @return Map tracking the assigned ascent key with status 201 (Created).
     */
    @PostMapping
    fun create(
        @RequestBody input: AscentInputModel,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Map<String, Int>> {
        val id = ascentService.logAscent(
            user.id, input.boulderId, input.outdoorRouteId,
            input.freelogGymName, input.freelogGrade,
            input.date, input.attempts, input.style, input.notes
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("id" to id))
    }

    /**
     * Extracts the complete logbook collection bound to the requesting climber.
     */
    @GetMapping("/me")
    fun getMyLog(@RequestAttribute("authenticatedUser") user: User): List<Ascent> {
        return ascentService.getClimberLogbook(user.id)
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Int): ResponseEntity<Ascent> {
        val ascent = ascentService.getAscentById(id)
        return if (ascent != null) ResponseEntity.ok(ascent) else ResponseEntity.notFound().build()
    }

    /**
     * Removes an ascent record from the database directory.
     *
     * Ensures cascade deletion boundaries align with the record owner profile.
     */
    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Int, @RequestAttribute("authenticatedUser") user: User): ResponseEntity<Unit> {
        val deleted = ascentService.removeAscent(id, user.id)
        return if (deleted) ResponseEntity.noContent().build() else ResponseEntity.notFound().build()
    }
}