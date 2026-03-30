package com.climbbeta.api.domain

import java.time.LocalDateTime

data class Token(
    val tokenHash: String,
    val userId: Int,
    val createdAt: LocalDateTime? = null,
    val lastUsedAt: LocalDateTime? = null
)