package com.climbbeta.api.http

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.repository_jdbi.JdbiSaveRepository
import com.climbbeta.api.services.ProfileService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class ProfileUpdateInput(
    val bio: String?,
    val height: Int?,
    val apeIndex: Double?
)

@RestController
@RequestMapping("/profiles")
class ProfileController(
    private val profileService: ProfileService,
    private val saveRepository: JdbiSaveRepository
) {

    @GetMapping("/me")
    fun getMyProfile(request: HttpServletRequest): ResponseEntity<Any> {
        // 1. Quem é que o Interceptor deixou entrar?
        val user = request.getAttribute("authenticatedUser") as User

        // 2. Se for um CLIMBER, devolvemos o perfil dele
        if (user.role == UserRole.CLIMBER) {
            val profile = profileService.getClimberProfileWithUser(user.id, user)
            return ResponseEntity.ok(profile)
        }

        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(mapOf("error" to "Apenas escaladores têm este tipo de perfi.l"))

        // (No futuro podemos adicionar o código para devolver o perfil do GYM_OWNER aqui)
        // return ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to "Apenas escaladores têm este tipo de perfil."))
    }

    @PutMapping("/me")
    fun updateMyProfile(@RequestBody input: ProfileUpdateInput, request: HttpServletRequest): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as User

        if (user.role == UserRole.CLIMBER) {
            profileService.updateClimberProfile(user.id, input.bio, input.height, input.apeIndex)
            return ResponseEntity.ok(mapOf("message" to "Perfil atualizado com sucesso!"))
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to "Apenas escaladores podem atualizar estes dados."))
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
            .body(mapOf("error" to "Apenas escaladores têm projetos guardados."))
    }
}