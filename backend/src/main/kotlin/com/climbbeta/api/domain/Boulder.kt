package com.climbbeta.api.domain

import java.time.LocalDate
import java.time.LocalDateTime

data class Boulder(
    val id: Int = 0,
    val gymId: Int,
    val color: String,
    val hexColor: String? = null,
    val grade: String,
    val setterName: String? = null,
    val setDate: LocalDate,
    val isActive: Boolean = true,
    val imageUrl: String? = null
)