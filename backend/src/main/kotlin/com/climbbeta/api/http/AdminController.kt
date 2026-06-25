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

/**
 * REST Controller managing system administration and verification coupon generation.
 *
 * Provides protected administrative utilities to manage activation voucher lifecycles
 * required to onboard commercial gym owner accounts.
 *
 * @property activationCodeRepository Direct repository bridge to manage activation vouchers.
 */
@RestController
@RequestMapping("/admin")
class AdminController(
    private val activationCodeRepository: ActivationCodeRepository
) {

    /**
     * Mints a single-use UUID security activation code.
     *
     * Enforces strict administrative role boundaries before allowing generation.
     *
     * @param request Injected servlet context carrying the session's authenticated user.
     * @return ResponseEntity containing the newly generated coupon with status 201 (Created),
     * 401 (Unauthorized) if unauthenticated, or 403 (Forbidden) if the user is not an Admin.
     */
    @PostMapping("/codes")
    fun generateCode(request: HttpServletRequest): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as? User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        if (user.role != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(mapOf("error" to "Only ADMIN can generate activation codes."))
        }

        val code = UUID.randomUUID().toString()
        val created = activationCodeRepository.createCode(code)

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ActivationCodeOutputModel(created.code, created.isUsed, created.usedBy))
    }

    /**
     * Lists all system verification coupons registered in the database directory.
     */
    @GetMapping("/codes")
    fun listCodes(request: HttpServletRequest): ResponseEntity<Any> {
        val user = request.getAttribute("authenticatedUser") as? User
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        if (user.role != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(mapOf("error" to "Only ADMIN can view activation codes."))
        }

        val codes = activationCodeRepository.getAllCodes().map {
            ActivationCodeOutputModel(it.code, it.isUsed, it.usedBy)
        }

        return ResponseEntity.ok(codes)
    }
}