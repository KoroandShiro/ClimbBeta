package com.climbbeta.api.http

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.pipeline.ProtectedRoute
import com.climbbeta.api.repository.UserRepository
import com.climbbeta.api.repository_jdbi.JdbiSaveRepository
import com.climbbeta.api.services.ProfileService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class ProfileUpdateInput(
    val username: String?,
    val bio: String?,
    val height: Int?,
    val apeIndex: Double?
)

/**
 * REST Controller administering custom climber bio mappings and biometric attributes.
 *
 * Restricts profile configuration capabilities solely to users under the CLIMBER role scope.
 */
@RestController
@RequestMapping("/profiles")
@ProtectedRoute(UserRole.CLIMBER)
class ProfileController(
    private val profileService: ProfileService,
    private val saveRepository: JdbiSaveRepository,
    private val userRepository: UserRepository
) {

    /**
     * Resolves the profile summary for the requesting user session.
     */
    @GetMapping("/me")
    fun getMyProfile(request: HttpServletRequest): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as User

        if (user.role == UserRole.CLIMBER) {
            val profile = profileService.getClimberProfileWithUser(user.id, user)
            return ResponseEntity.ok(profile)
        }

        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(mapOf("error" to "Only climbers have this type of profile."))
    }

    /**
     * Modifies physical parameters, personal descriptions, or updates user handle structures.
     *
     * Automatically screens alternative handles to block duplicate usernames across the platform.
     */
    @PutMapping("/me")
    fun updateMyProfile(@RequestBody input: ProfileUpdateInput, request: HttpServletRequest): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as User

        if (user.role == UserRole.CLIMBER) {
            if (input.username != null && input.username.trim().isNotEmpty()) {
                val newUsername = input.username.trim()

                if (newUsername != user.username) {
                    if (userRepository.existsByUsername(newUsername)) {
                        return ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .body(mapOf("error" to "This username is already in use by another user."))
                    }
                    userRepository.updateUsername(user.id, newUsername)
                }
            }

            profileService.updateClimberProfile(user.id, input.bio, input.height, input.apeIndex)
            return ResponseEntity.ok(mapOf("message" to "Profile updated successfully!"))
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to "Only climbers can update this data."))
    }

    /**
     * Uploads and attaches a custom profile avatar image.
     * Streams the binary to the storage cluster and rewrites reference pathways in PostgreSQL.
     */
    @PostMapping("/me/avatar")
    fun updateMyAvatar(
        @RequestParam("file") file: org.springframework.web.multipart.MultipartFile,
        request: HttpServletRequest
    ): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as User

        if (user.role == UserRole.CLIMBER) {
            if (file.isEmpty) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(mapOf("error" to "The uploaded file is empty."))
            }

            val avatarUrl = profileService.updateClimberAvatar(user.id, file)

            return ResponseEntity.ok(mapOf(
                "message" to "Profile picture updated successfully!",
                "avatarUrl" to avatarUrl
            ))
        }

        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(mapOf("error" to "Only climbers can update the avatar."))
    }

    @GetMapping("/me/projects")
    fun getMySavedProjects(request: HttpServletRequest): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as User

        if (user.role == UserRole.CLIMBER) {
            val projects = saveRepository.getSavedBoulders(user.id)
            return ResponseEntity.ok(projects)
        }

        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(mapOf("error" to "Only climbers have saved projects."))
    }
}