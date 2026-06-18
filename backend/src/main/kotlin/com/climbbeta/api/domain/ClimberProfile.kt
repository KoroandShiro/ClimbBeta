package com.climbbeta.api.domain

data class ClimberProfile(
    val userId: Int,
    val bio: String? = null,
    val height: Int? = null,     // Altura em cm
    val apeIndex: Double? = null, // Relação envergadura/altura
    val avatarUrl: String? = null
)