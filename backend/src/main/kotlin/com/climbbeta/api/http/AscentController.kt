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

@RestController
@RequestMapping("/ascents")
class AscentController(private val ascentService: AscentService) {

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

    @GetMapping("/me")
    fun getMyLog(@RequestAttribute("authenticatedUser") user: User): List<Ascent> {
        return ascentService.getClimberLogbook(user.id)
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Int): ResponseEntity<Ascent> {
        val ascent = ascentService.getAscentById(id)
        return if (ascent != null) ResponseEntity.ok(ascent) else ResponseEntity.notFound().build()
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Int, @RequestAttribute("authenticatedUser") user: User): ResponseEntity<Unit> {
        val deleted = ascentService.removeAscent(id, user.id)
        return if (deleted) ResponseEntity.noContent().build() else ResponseEntity.notFound().build()
    }
}