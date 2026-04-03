package com.climbbeta.api.http

import com.climbbeta.api.domain.User
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

@RestController
class BoulderController(private val boulderService: BoulderService) {

    @PostMapping("/gyms/{gymId}/boulders")
    fun createBoulder(
        @PathVariable gymId: Int,
        @RequestBody input: BoulderCreateInput,
        request: HttpServletRequest
    ): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as User
        return try {
            val boulder = boulderService.createBoulder(
                user = user,
                gymId = gymId,
                color = input.color,
                hexColor = input.hexColor,
                grade = input.grade,
                setterName = input.setterName,
                setDate = input.setDate,
                imageUrl = input.imageUrl
            )
            ResponseEntity.status(HttpStatus.CREATED).body(boulder)
        } catch (e: SecurityException) {
            ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to e.message))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to e.message))
        }
    }

    @GetMapping("/gyms/{gymId}/boulders")
    fun getGymBoulders(@PathVariable gymId: Int): ResponseEntity<Any> {
        val boulders = boulderService.getActiveBoulders(gymId)
        return ResponseEntity.ok(boulders)
    }

    @PutMapping("/boulders/{boulderId}/status")
    fun updateBoulderStatus(
        @PathVariable boulderId: Int,
        @RequestBody input: BoulderStatusInput,
        request: HttpServletRequest
    ): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as User
        return try {
            boulderService.updateBoulderStatus(user, boulderId, input.isActive)
            ResponseEntity.ok(mapOf("message" to "Estado da via atualizado com sucesso!"))
        } catch (e: SecurityException) {
            ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to e.message))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
        }
    }
}