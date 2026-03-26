package com.climbbeta.api.domain

import java.time.LocalDateTime

data class User(
    val id: Int = 0,
    val username: String,
    val email: String,
    val passwordHash: String,
    val role: UserRole,
    val createdAt: LocalDateTime? = null
)