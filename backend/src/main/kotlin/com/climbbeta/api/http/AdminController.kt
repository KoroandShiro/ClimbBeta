package com.climbbeta.api.http

import com.climbbeta.api.domain.ActivationCode
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.repository.ActivationCodeRepository
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

data class ActivationCodeOutputModel(
    val code: String,
    val isUsed: Boolean,
    val usedBy: Int?
)

@RestController
@RequestMapping("/admin")
class AdminController(
    private val activationCodeRepository: ActivationCodeRepository
) {

    @PostMapping("/codes")
    fun generateCode(request: HttpServletRequest): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as? User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        if (user.role != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(mapOf("error" to "Apenas ADMIN pode gerar códigos de ativação."))
        }

        val code = UUID.randomUUID().toString()
        val created = activationCodeRepository.createCode(code)

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ActivationCodeOutputModel(created.code, created.isUsed, created.usedBy))
    }

    @GetMapping("/codes")
    fun listCodes(request: HttpServletRequest): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as? User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        if (user.role != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(mapOf("error" to "Apenas ADMIN pode ver os códigos de ativação."))
        }

        val codes = activationCodeRepository.getAllCodes().map {
            ActivationCodeOutputModel(it.code, it.isUsed, it.usedBy)
        }

        return ResponseEntity.ok(codes)
    }
}
