package com.climbbeta.api.domain

import java.time.LocalDate

data class LeaderboardEntry(
    val rank: Int,
    val climberId: Int,
    val username: String,
    val avatarUrl: String?,
    val style: String,
    val attempts: Int,
    val date: LocalDate
)
