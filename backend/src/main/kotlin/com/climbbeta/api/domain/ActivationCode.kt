package com.climbbeta.api.domain

import java.time.LocalDateTime

data class ActivationCode(
    val code: String,
    val isUsed: Boolean,
    val createdAt: LocalDateTime? = null,
    val usedBy: Int? = null
)
