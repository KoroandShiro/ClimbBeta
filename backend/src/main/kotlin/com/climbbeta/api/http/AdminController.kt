package com.climbbeta.api.http

import com.climbbeta.api.domain.ActivationCode
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.pipeline.ProtectedRoute
import com.climbbeta.api.repository.ActivationCodeRepository
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
@ProtectedRoute(UserRole.ADMIN)
class AdminController(
    private val activationCodeRepository: ActivationCodeRepository
) {

    /**
     * Mints a single-use UUID activation code.
     *
     * Access is restricted to ADMIN centrally via @ProtectedRoute on the class.
     *
     * @return ResponseEntity containing the newly generated coupon with status 201 (Created).
     */
    @PostMapping("/codes")
    fun generateCode(): ResponseEntity<Any> {
        val code = UUID.randomUUID().toString()
        val created = activationCodeRepository.createCode(code)

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ActivationCodeOutputModel(created.code, created.isUsed, created.usedBy))
    }

    /**
     * Lists all system verification coupons registered in the database directory.
     */
    @GetMapping("/codes")
    fun listCodes(): ResponseEntity<Any> {
        val codes = activationCodeRepository.getAllCodes().map {
            ActivationCodeOutputModel(it.code, it.isUsed, it.usedBy)
        }

        return ResponseEntity.ok(codes)
    }
}