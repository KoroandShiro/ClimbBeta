package com.climbbeta.api.domain

data class ClimberProfileWithUserDTO(
    val userId: Int,
    val username: String,
    val email: String,
    val bio: String? = null,
    val height: Int? = null,
    val apeIndex: Double? = null,
    val avatarUrl: String? = null
)
