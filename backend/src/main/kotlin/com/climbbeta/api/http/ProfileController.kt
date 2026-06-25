package com.climbbeta.api.http

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
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

@RestController
@RequestMapping("/profiles")
class ProfileController(
    private val profileService: ProfileService,
    private val saveRepository: JdbiSaveRepository,
    private val userRepository: UserRepository
) {

    @GetMapping("/me")
    fun getMyProfile(request: HttpServletRequest): ResponseEntity<Any> {
        // 1. Who did the Interceptor allow in?
        val user = request.getAttribute("authenticatedUser") as User

        // 2. If it is a CLIMBER, return their profile
        if (user.role == UserRole.CLIMBER) {
            val profile = profileService.getClimberProfileWithUser(user.id, user)
            return ResponseEntity.ok(profile)
        }

        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(mapOf("error" to "Only climbers have this type of profile."))
    }

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

            // Call service to store in MinIO and update path in PostgreSQL
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