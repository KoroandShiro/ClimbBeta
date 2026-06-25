package com.climbbeta.api.http

import com.climbbeta.api.domain.Gym
import com.climbbeta.api.domain.User
import com.climbbeta.api.services.GymService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class GymCreateInputModel(
    val ownerId: Int,
    val name: String,
    val address: String,
    val city: String,
    val coverImageUrl: String? = null
)

data class GymUpdateInputModel(
    val name: String,
    val address: String,
    val city: String,
    val coverImageUrl: String? = null
)

data class GymOutputModel(
    val id: Int,
    val ownerId: Int,
    val name: String,
    val address: String,
    val city: String,
    val coverImageUrl: String?
) {
    companion object {
        fun fromDomain(gym: Gym) = GymOutputModel(
            id = gym.id,
            ownerId = gym.ownerId,
            name = gym.name,
            address = gym.address,
            city = gym.city,
            coverImageUrl = gym.coverImageUrl
        )
    }
}

@RestController
@RequestMapping("/gyms")
class GymController(
    private val gymService: GymService
) {

    @PostMapping
    fun createGym(
        @RequestBody input: GymCreateInputModel,
        request: HttpServletRequest
    ): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as? User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "User not authenticated."))

        return try {
            val created = gymService.createGym(
                authenticatedUser = user,
                ownerId = input.ownerId,
                name = input.name,
                address = input.address,
                city = input.city,
                coverImageUrl = input.coverImageUrl
            )

            ResponseEntity.status(HttpStatus.CREATED).body(GymOutputModel.fromDomain(created))
        } catch (e: SecurityException) {
            ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to (e.message ?: "Access denied.")))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to (e.message ?: "Invalid request.")))
        }
    }

    @GetMapping
    fun getGyms(request: HttpServletRequest): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as? User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "User not authenticated."))

        val gyms = gymService.getGyms().map { GymOutputModel.fromDomain(it) }
        return ResponseEntity.ok(gyms)
    }

    @GetMapping("/{id}")
    fun getGymById(
        @PathVariable id: Int,
        request: HttpServletRequest
    ): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as? User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "User not authenticated."))

        return try {
            val gym = gymService.getGymById(id)
            ResponseEntity.ok(GymOutputModel.fromDomain(gym))
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to (e.message ?: "Gym not found.")))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to (e.message ?: "Invalid request.")))
        }
    }

    @PutMapping("/{id}")
    fun updateGym(
        @PathVariable id: Int,
        @RequestBody input: GymUpdateInputModel,
        request: HttpServletRequest
    ): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as? User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "User not authenticated."))

        return try {
            gymService.updateGym(
                authenticatedUser = user,
                id = id,
                name = input.name,
                address = input.address,
                city = input.city,
                coverImageUrl = input.coverImageUrl
            )

            ResponseEntity.ok(mapOf("message" to "Gym updated successfully!"))
        } catch (e: SecurityException) {
            ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to (e.message ?: "Access denied.")))
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to (e.message ?: "Gym not found.")))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to (e.message ?: "Invalid request.")))
        }
    }
}