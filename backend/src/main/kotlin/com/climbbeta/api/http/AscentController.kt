package com.climbbeta.api.http

import com.climbbeta.api.domain.Ascent
import com.climbbeta.api.domain.FeedItem
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.pipeline.ProtectedRoute
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
 * Input for the hybrid free log (non-partner gym OR outdoor rock).
 *
 * @property mode "GYM" (uses [freelogGymName] + [grade]) or "ROCK" (uses [location] + [sector] + [grade]).
 * @property mediaUrl Optional photo URL already uploaded to MinIO via /media/upload.
 */
data class FreelogInputModel(
    val mode: String,
    val freelogGymName: String?,
    val grade: String?,
    val routeName: String?,
    val sector: String?,
    val location: String?,
    val date: LocalDate?,
    val attempts: Int = 1,
    val style: String?,
    val notes: String?,
    val mediaUrl: String?
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
    @ProtectedRoute(UserRole.CLIMBER)
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
     * Commits a hybrid free log: a session at a non-partner gym ("GYM" mode) or an outdoor climb
     * ("ROCK" mode, which reuses/creates an outdoor route). An optional photo URL is linked in `media`.
     *
     * @return Map with the new ascent id and status 201 (Created).
     */
    @ProtectedRoute(UserRole.CLIMBER)
    @PostMapping("/freelog")
    fun createFreelog(
        @RequestBody input: FreelogInputModel,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Map<String, Int>> {
        val id = ascentService.logFreelog(
            climberId = user.id, mode = input.mode,
            freelogGymName = input.freelogGymName, grade = input.grade,
            routeName = input.routeName, sector = input.sector, location = input.location,
            date = input.date, attempts = input.attempts, style = input.style,
            notes = input.notes, mediaUrl = input.mediaUrl
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("id" to id))
    }

    /**
     * Extracts the complete logbook collection bound to the requesting climber.
     */
    @ProtectedRoute(UserRole.CLIMBER)
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
     * Enriched single ascent for the detail screen: author, cover image, route descriptors and
     * like/comment counts (plus whether the requester already liked it).
     */
    @GetMapping("/{id}/details")
    fun getDetails(
        @PathVariable id: Int,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<FeedItem> {
        val detail = ascentService.getAscentDetail(id, user.id)
        return if (detail != null) ResponseEntity.ok(detail) else ResponseEntity.notFound().build()
    }

    /**
     * Removes an ascent record from the database directory.
     *
     * Ensures cascade deletion boundaries align with the record owner profile.
     */
    @ProtectedRoute(UserRole.CLIMBER)
    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Int, @RequestAttribute("authenticatedUser") user: User): ResponseEntity<Unit> {
        val deleted = ascentService.removeAscent(id, user.id)
        return if (deleted) ResponseEntity.noContent().build() else ResponseEntity.notFound().build()
    }
}