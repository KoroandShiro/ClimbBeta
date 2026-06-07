package com.climbbeta.api.http

import com.climbbeta.api.domain.User
import com.climbbeta.api.services.GamificationService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping
class GamificationController(private val gamificationService: GamificationService) {

    // LIKE ENDPOINTS (Mantidos)
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

    // SAVE ENDPOINTS (Problema 1 resolvido: Agora devolvem JSON)
    @PostMapping("/boulders/{id}/save")
    fun saveBoulder(
        @PathVariable id: Int,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Any> {
        val created = gamificationService.saveBoulder(user.id, id)
        return if (created) {
            ResponseEntity.status(HttpStatus.CREATED).body(mapOf("message" to "Projeto guardado com sucesso!"))
        } else {
            ResponseEntity.status(HttpStatus.OK).body(mapOf("message" to "Projeto já estava guardado."))
        }
    }

    @DeleteMapping("/boulders/{id}/save")
    fun unsaveBoulder(
        @PathVariable id: Int,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Any> {
        val deleted = gamificationService.unsaveBoulder(user.id, id)
        return if (deleted) {
            ResponseEntity.ok(mapOf("message" to "Projeto removido com sucesso!"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Projeto não encontrado."))
        }
    }

    // NOVO ENDPOINT (Problema 3: Saber se o botão deve estar ativo)
    @GetMapping("/boulders/{id}/save-status")
    fun checkSaveStatus(
        @PathVariable id: Int,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Any> {
        val isSaved = gamificationService.isBoulderSaved(user.id, id)
        return ResponseEntity.ok(mapOf("isSaved" to isSaved))
    }

    // MANTIDOS (Leaderboard e Projetos Guardados)
    @GetMapping("/projects/me")
    fun getSavedBoulders(
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Any> {
        val boulders = gamificationService.getSavedBoulders(user.id)
        return ResponseEntity.ok(boulders)
    }

    @GetMapping("/boulders/{id}/leaderboard")
    fun getLeaderboard(
        @PathVariable id: Int
    ): ResponseEntity<Any> {
        val leaderboard = gamificationService.getLeaderboard(id)
        return ResponseEntity.ok(leaderboard)
    }
}