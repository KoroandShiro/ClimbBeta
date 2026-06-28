package com.climbbeta.api.domain

data class ClimberProfileWithUserDTO(
    val userId: Int,
    val username: String,
    val email: String,
    val bio: String? = null,
    val height: Int? = null,
    val apeIndex: Double? = null,
    val avatarUrl: String? = null,
    val followersCount: Int = 0,
    val followingCount: Int = 0,
    val totalAscents: Int = 0,
    val maxIndoorGrade: String? = null,
    val maxOutdoorGrade: String? = null
)
